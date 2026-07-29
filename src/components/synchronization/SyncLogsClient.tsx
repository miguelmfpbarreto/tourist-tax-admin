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
import type {
    SyncLog,
    SyncLogList
} from "@/types";

function formatDateTime(value: string): string {
    const date = new Date(value);

    return Number.isNaN(date.getTime())
        ? value
        : date.toLocaleString("pt-PT");
}

function levelClass(level: string): string {
    const value = String(level || "").toUpperCase();

    if (
        value === "ERROR" ||
        value === "FATAL"
    ) {
        return "danger";
    }

    if (
        value === "WARN" ||
        value === "WARNING"
    ) {
        return "warning";
    }

    return "success";
}

export function SyncLogsClient() {
    const [rows, setRows] = useState<SyncLog[]>([]);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState("");
    const [level, setLevel] = useState("");
    const [direction, setDirection] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const limit = 30;

    const loadRows = useCallback(async function() {
        setLoading(true);
        setError("");

        try {
            const query = new URLSearchParams();

            query.set("page", String(page));
            query.set("limit", String(limit));

            if (search.trim()) {
                query.set("search", search.trim());
            }

            if (level) {
                query.set("log_level", level);
            }

            if (direction) {
                query.set("direction", direction);
            }

            const response = await fetch(
                `/api/synchronization/logs?${query.toString()}`,
                {
                    cache: "no-store"
                }
            );

            const result = await response.json();

            if (!response.ok || !result.success) {
                setError(
                    result.message ||
                        "Não foi possível carregar os logs."
                );
                return;
            }

            const payload =
                result.data as SyncLogList;

            setRows(payload.data || []);
            setTotal(payload.total || 0);
        } catch {
            setError("Falha de comunicação.");
        } finally {
            setLoading(false);
        }
    }, [page, search, level, direction]);

    useEffect(function() {
        loadRows();
    }, [loadRows]);

    const totalPages = Math.max(
        Math.ceil(total / limit),
        1
    );

    return (
        <>
            <section className="card sync-log-toolbar">
                <form
                    onSubmit={function(event) {
                        event.preventDefault();
                        setPage(1);
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
                            placeholder="Mensagem, evento ou dispositivo"
                        />
                    </div>

                    <select
                        className="select"
                        value={level}
                        onChange={function(event) {
                            setLevel(event.target.value);
                            setPage(1);
                        }}
                    >
                        <option value="">
                            Todos os níveis
                        </option>
                        <option value="INFO">INFO</option>
                        <option value="WARN">WARN</option>
                        <option value="ERROR">ERROR</option>
                    </select>

                    <select
                        className="select"
                        value={direction}
                        onChange={function(event) {
                            setDirection(
                                event.target.value
                            );
                            setPage(1);
                        }}
                    >
                        <option value="">
                            Todas as direções
                        </option>
                        <option value="UPLOAD">
                            UPLOAD
                        </option>
                        <option value="DOWNLOAD">
                            DOWNLOAD
                        </option>
                    </select>

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
                                    <th>Data</th>
                                    <th>Nível</th>
                                    <th>Direção</th>
                                    <th>Evento</th>
                                    <th>Dispositivo</th>
                                    <th>Posto</th>
                                    <th>Enviados</th>
                                    <th>Recebidos</th>
                                    <th>Erros</th>
                                    <th>Mensagem</th>
                                </tr>
                            </thead>

                            <tbody>
                                {rows.map(function(row) {
                                    return (
                                        <tr key={row.uuid}>
                                            <td>
                                                {formatDateTime(
                                                    row.sync_date
                                                )}
                                            </td>
                                            <td>
                                                <span
                                                    className={`badge ${levelClass(
                                                        row.log_level
                                                    )}`}
                                                >
                                                    {row.log_level}
                                                </span>
                                            </td>
                                            <td>
                                                {row.direction ||
                                                    "—"}
                                            </td>
                                            <td>
                                                {row.event_type ||
                                                    "—"}
                                            </td>
                                            <td>
                                                {row.device_name ||
                                                    "—"}
                                            </td>
                                            <td>
                                                {row.post_code ||
                                                    "—"}
                                            </td>
                                            <td>
                                                {row.total_sent}
                                            </td>
                                            <td>
                                                {row.total_received}
                                            </td>
                                            <td>
                                                {row.total_errors}
                                            </td>
                                            <td>
                                                {row.message ||
                                                    "—"}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        {rows.length === 0 ? (
                            <div className="empty">
                                Nenhum log encontrado.
                            </div>
                        ) : null}
                    </div>
                )}

                <div className="pagination">
                    <span className="muted">
                        Página {page} de {totalPages} ·{" "}
                        {total} registo(s)
                    </span>

                    <div
                        style={{
                            display: "flex",
                            gap: 8
                        }}
                    >
                        <button
                            className="btn secondary"
                            type="button"
                            disabled={page <= 1}
                            onClick={function() {
                                setPage(function(current) {
                                    return Math.max(
                                        current - 1,
                                        1
                                    );
                                });
                            }}
                        >
                            Anterior
                        </button>

                        <button
                            className="btn secondary"
                            type="button"
                            disabled={page >= totalPages}
                            onClick={function() {
                                setPage(function(current) {
                                    return Math.min(
                                        current + 1,
                                        totalPages
                                    );
                                });
                            }}
                        >
                            Seguinte
                        </button>
                    </div>
                </div>
            </section>
        </>
    );
}
