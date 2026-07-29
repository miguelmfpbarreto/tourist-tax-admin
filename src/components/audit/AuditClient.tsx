"use client";

import {
    Eye,
    FileClock,
    LoaderCircle,
    LogIn,
    RefreshCcw,
    Search,
    Settings2,
    ShieldCheck,
    UserRound
} from "lucide-react";
import {
    useCallback,
    useEffect,
    useState
} from "react";
import type {
    AuditLog,
    AuditLogList,
    AuditSummary
} from "@/types";

function formatDateTime(value: string): string {
    const date = new Date(value);

    return Number.isNaN(date.getTime())
        ? value
        : date.toLocaleString("pt-PT");
}

function prettyJson(value: unknown): string {
    if (
        value === null ||
        value === undefined
    ) {
        return "—";
    }

    if (typeof value === "string") {
        try {
            return JSON.stringify(
                JSON.parse(value),
                null,
                2
            );
        } catch {
            return value;
        }
    }

    return JSON.stringify(
        value,
        null,
        2
    );
}

function actionClass(action: string): string {
    const value = action.toUpperCase();

    if (
        value.includes("DELETE") ||
        value.includes("DEACTIVATE") ||
        value.includes("BLOCK")
    ) {
        return "danger";
    }

    if (
        value.includes("UPDATE") ||
        value.includes("CHANGE")
    ) {
        return "warning";
    }

    return "success";
}

function actionLabel(action: string): string {
    return action
        .replace(/_/g, " ")
        .trim();
}

export function AuditClient() {
    const [rows, setRows] = useState<AuditLog[]>([]);
    const [summary, setSummary] =
        useState<AuditSummary | null>(null);
    const [selected, setSelected] =
        useState<AuditLog | null>(null);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState("");
    const [action, setAction] = useState("");
    const [entity, setEntity] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const limit = 30;

    const loadData = useCallback(async function() {
        setLoading(true);
        setError("");

        try {
            const query = new URLSearchParams();

            query.set("page", String(page));
            query.set("limit", String(limit));

            if (search.trim()) {
                query.set("search", search.trim());
            }

            if (action) {
                query.set("action", action);
            }

            if (entity) {
                query.set("entity_name", entity);
            }

            if (dateFrom) {
                query.set("date_from", dateFrom);
            }

            if (dateTo) {
                query.set("date_to", dateTo);
            }

            const [
                logsResponse,
                summaryResponse
            ] = await Promise.all([
                fetch(
                    `/api/audit?${query.toString()}`,
                    {
                        cache: "no-store"
                    }
                ),
                fetch(
                    "/api/audit/summary",
                    {
                        cache: "no-store"
                    }
                )
            ]);

            const logsResult =
                await logsResponse.json();
            const summaryResult =
                await summaryResponse.json();

            if (
                !logsResponse.ok ||
                !logsResult.success
            ) {
                setError(
                    logsResult.message ||
                        "Não foi possível carregar a auditoria."
                );
                return;
            }

            const payload =
                logsResult.data as AuditLogList;

            setRows(payload.data || []);
            setTotal(payload.total || 0);

            if (
                summaryResponse.ok &&
                summaryResult.success
            ) {
                setSummary(
                    summaryResult.data
                );
            }
        } catch {
            setError("Falha de comunicação.");
        } finally {
            setLoading(false);
        }
    }, [
        page,
        search,
        action,
        entity,
        dateFrom,
        dateTo
    ]);

    useEffect(function() {
        loadData();
    }, [loadData]);

    const totalPages = Math.max(
        Math.ceil(total / limit),
        1
    );

    return (
        <>
            <section className="grid audit-summary-grid">
                <article className="card audit-stat">
                    <div>
                        <span>Eventos hoje</span>
                        <strong>
                            {summary?.total_today || 0}
                        </strong>
                    </div>
                    <FileClock size={22} />
                </article>

                <article className="card audit-stat">
                    <div>
                        <span>Criações</span>
                        <strong>
                            {summary?.creates_today || 0}
                        </strong>
                    </div>
                    <Settings2 size={22} />
                </article>

                <article className="card audit-stat">
                    <div>
                        <span>Atualizações</span>
                        <strong>
                            {summary?.updates_today || 0}
                        </strong>
                    </div>
                    <ShieldCheck size={22} />
                </article>

                <article className="card audit-stat">
                    <div>
                        <span>Alterações de estado</span>
                        <strong>
                            {summary?.status_changes_today || 0}
                        </strong>
                    </div>
                    <RefreshCcw size={22} />
                </article>

                <article className="card audit-stat">
                    <div>
                        <span>Inícios de sessão</span>
                        <strong>
                            {summary?.logins_today || 0}
                        </strong>
                    </div>
                    <LogIn size={22} />
                </article>

                <article className="card audit-stat">
                    <div>
                        <span>Utilizadores ativos</span>
                        <strong>
                            {summary?.unique_users_today || 0}
                        </strong>
                    </div>
                    <UserRound size={22} />
                </article>
            </section>

            <section className="card audit-toolbar">
                <form
                    onSubmit={function(event) {
                        event.preventDefault();
                        setPage(1);
                        loadData();
                    }}
                >
                    <div className="audit-search">
                        <Search size={17} />
                        <input
                            className="input"
                            value={search}
                            onChange={function(event) {
                                setSearch(
                                    event.target.value
                                );
                            }}
                            placeholder="Utilizador, ação, entidade ou UUID"
                        />
                    </div>

                    <input
                        className="input"
                        value={action}
                        onChange={function(event) {
                            setAction(
                                event.target.value
                            );
                            setPage(1);
                        }}
                        placeholder="Ação"
                    />

                    <input
                        className="input"
                        value={entity}
                        onChange={function(event) {
                            setEntity(
                                event.target.value
                            );
                            setPage(1);
                        }}
                        placeholder="Entidade"
                    />

                    <input
                        className="input"
                        type="date"
                        value={dateFrom}
                        onChange={function(event) {
                            setDateFrom(
                                event.target.value
                            );
                            setPage(1);
                        }}
                    />

                    <input
                        className="input"
                        type="date"
                        value={dateTo}
                        onChange={function(event) {
                            setDateTo(
                                event.target.value
                            );
                            setPage(1);
                        }}
                    />

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
                    onClick={loadData}
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
                    <div className="audit-loading">
                        <LoaderCircle
                            className="spin"
                            size={26}
                        />
                        A carregar auditoria...
                    </div>
                ) : (
                    <div className="table-wrap">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Data</th>
                                    <th>Utilizador</th>
                                    <th>Ação</th>
                                    <th>Entidade</th>
                                    <th>Posto</th>
                                    <th>Dispositivo</th>
                                    <th>IP</th>
                                    <th>Detalhes</th>
                                </tr>
                            </thead>

                            <tbody>
                                {rows.map(function(row) {
                                    return (
                                        <tr key={row.uuid}>
                                            <td>
                                                {formatDateTime(
                                                    row.created_at
                                                )}
                                            </td>

                                            <td>
                                                {row.user_full_name ||
                                                    row.user_name ||
                                                    "Sistema"}
                                            </td>

                                            <td>
                                                <span
                                                    className={`badge ${actionClass(
                                                        row.action
                                                    )}`}
                                                >
                                                    {actionLabel(
                                                        row.action
                                                    )}
                                                </span>
                                            </td>

                                            <td>
                                                {row.entity_name ||
                                                    "—"}
                                            </td>

                                            <td>
                                                {row.post_code ||
                                                    "—"}
                                            </td>

                                            <td>
                                                {row.device_name ||
                                                    "—"}
                                            </td>

                                            <td>
                                                {row.ip_address ||
                                                    "—"}
                                            </td>

                                            <td>
                                                <button
                                                    className="icon-btn"
                                                    type="button"
                                                    title="Ver detalhes"
                                                    onClick={function() {
                                                        setSelected(
                                                            row
                                                        );
                                                    }}
                                                >
                                                    <Eye size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        {rows.length === 0 ? (
                            <div className="empty">
                                Nenhum evento de auditoria encontrado.
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

            {selected ? (
                <div className="audit-modal-overlay">
                    <section className="card audit-modal">
                        <header className="audit-modal-header">
                            <div>
                                <h2>
                                    Detalhe da auditoria
                                </h2>
                                <p>
                                    {selected.action}
                                </p>
                            </div>

                            <button
                                className="btn secondary"
                                type="button"
                                onClick={function() {
                                    setSelected(null);
                                }}
                            >
                                Fechar
                            </button>
                        </header>

                        <div className="audit-detail-grid">
                            <div>
                                <span>Data</span>
                                <strong>
                                    {formatDateTime(
                                        selected.created_at
                                    )}
                                </strong>
                            </div>

                            <div>
                                <span>Utilizador</span>
                                <strong>
                                    {selected.user_full_name ||
                                        selected.user_name ||
                                        "Sistema"}
                                </strong>
                            </div>

                            <div>
                                <span>Entidade</span>
                                <strong>
                                    {selected.entity_name ||
                                        "—"}
                                </strong>
                            </div>

                            <div>
                                <span>UUID da entidade</span>
                                <strong>
                                    {selected.entity_uuid ||
                                        "—"}
                                </strong>
                            </div>

                            <div>
                                <span>Posto</span>
                                <strong>
                                    {selected.post_code ||
                                        "—"}
                                </strong>
                            </div>

                            <div>
                                <span>Dispositivo</span>
                                <strong>
                                    {selected.device_name ||
                                        "—"}
                                </strong>
                            </div>

                            <div>
                                <span>IP</span>
                                <strong>
                                    {selected.ip_address ||
                                        "—"}
                                </strong>
                            </div>

                            <div>
                                <span>User Agent</span>
                                <strong>
                                    {selected.user_agent ||
                                        "—"}
                                </strong>
                            </div>
                        </div>

                        <div className="audit-json-grid">
                            <article>
                                <h3>Valores anteriores</h3>
                                <pre>
                                    {prettyJson(
                                        selected.old_values
                                    )}
                                </pre>
                            </article>

                            <article>
                                <h3>Novos valores</h3>
                                <pre>
                                    {prettyJson(
                                        selected.new_values
                                    )}
                                </pre>
                            </article>
                        </div>
                    </section>
                </div>
            ) : null}
        </>
    );
}
