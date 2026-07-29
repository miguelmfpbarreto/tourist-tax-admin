"use client";

import {
    LoaderCircle,
    RefreshCcw,
    Search
} from "lucide-react";
import {
    useCallback,
    useEffect,
    useState
} from "react";
import type { SyncDevice } from "@/types";

function formatDateTime(
    value: string | null
): string {
    if (!value) return "—";

    const date = new Date(value);

    return Number.isNaN(date.getTime())
        ? value
        : date.toLocaleString("pt-PT");
}

function statusClass(status: string): string {
    if (status === "ONLINE") return "success";
    if (status === "INATIVO") return "danger";

    return "warning";
}

export function SyncDevicesClient() {
    const [rows, setRows] =
        useState<SyncDevice[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadRows = useCallback(async function() {
        setLoading(true);
        setError("");

        try {
            const query = new URLSearchParams();

            if (search.trim()) {
                query.set("search", search.trim());
            }

            const response = await fetch(
                `/api/synchronization/devices?${query.toString()}`,
                {
                    cache: "no-store"
                }
            );

            const result = await response.json();

            if (!response.ok || !result.success) {
                setError(
                    result.message ||
                        "Não foi possível carregar os dispositivos."
                );
                return;
            }

            setRows(result.data || []);
        } catch {
            setError("Falha de comunicação.");
        } finally {
            setLoading(false);
        }
    }, [search]);

    useEffect(function() {
        loadRows();
    }, [loadRows]);

    const online = rows.filter(function(row) {
        return row.connection_status === "ONLINE";
    }).length;

    const offline = rows.filter(function(row) {
        return row.connection_status === "OFFLINE";
    }).length;

    const inactive = rows.filter(function(row) {
        return row.connection_status === "INATIVO";
    }).length;

    return (
        <>
            <section className="grid sync-summary-grid">
                <article className="card sync-stat">
                    <span>Total</span>
                    <strong>{rows.length}</strong>
                </article>

                <article className="card sync-stat">
                    <span>Online</span>
                    <strong>{online}</strong>
                </article>

                <article className="card sync-stat">
                    <span>Offline</span>
                    <strong>{offline}</strong>
                </article>

                <article className="card sync-stat">
                    <span>Inativos</span>
                    <strong>{inactive}</strong>
                </article>
            </section>

            <section className="card sync-toolbar">
                <form
                    onSubmit={function(event) {
                        event.preventDefault();
                        loadRows();
                    }}
                >
                    <div className="sync-search">
                        <Search size={17} />
                        <input
                            className="input"
                            value={search}
                            onChange={function(event) {
                                setSearch(event.target.value);
                            }}
                            placeholder="Dispositivo, posto ou sistema operativo"
                        />
                    </div>

                    <button
                        className="btn"
                        type="submit"
                    >
                        Pesquisar
                    </button>
                </form>

                <button
                    className="btn secondary"
                    type="button"
                    onClick={loadRows}
                >
                    <RefreshCcw size={17} />
                    Atualizar
                </button>
            </section>

            {error ? (
                <div className="report-alert error">
                    {error}
                </div>
            ) : null}

            <section className="card">
                {loading ? (
                    <div className="sync-loading">
                        <LoaderCircle
                            className="spin"
                            size={26}
                        />
                        A carregar...
                    </div>
                ) : (
                    <div className="table-wrap">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Dispositivo</th>
                                    <th>Posto</th>
                                    <th>Estado</th>
                                    <th>Versão</th>
                                    <th>Sistema</th>
                                    <th>Última ligação</th>
                                    <th>Último upload</th>
                                    <th>Último download</th>
                                    <th>Versão local</th>
                                </tr>
                            </thead>

                            <tbody>
                                {rows.map(function(row) {
                                    return (
                                        <tr key={row.uuid}>
                                            <td>
                                                <strong>
                                                    {row.device_name}
                                                </strong>
                                            </td>
                                            <td>
                                                {row.post_code}
                                                <div className="muted">
                                                    {row.post_name}
                                                </div>
                                            </td>
                                            <td>
                                                <span
                                                    className={`badge ${statusClass(
                                                        row.connection_status
                                                    )}`}
                                                >
                                                    {
                                                        row.connection_status
                                                    }
                                                </span>
                                            </td>
                                            <td>
                                                {row.app_version ||
                                                    "—"}
                                            </td>
                                            <td>
                                                {row.operating_system ||
                                                    "—"}
                                            </td>
                                            <td>
                                                {formatDateTime(
                                                    row.last_seen_at
                                                )}
                                            </td>
                                            <td>
                                                {formatDateTime(
                                                    row.last_upload_at
                                                )}
                                            </td>
                                            <td>
                                                {formatDateTime(
                                                    row.last_download_at
                                                )}
                                            </td>
                                            <td>
                                                {
                                                    row.last_download_version
                                                }
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        {rows.length === 0 ? (
                            <div className="empty">
                                Nenhum dispositivo encontrado.
                            </div>
                        ) : null}
                    </div>
                )}
            </section>
        </>
    );
}
