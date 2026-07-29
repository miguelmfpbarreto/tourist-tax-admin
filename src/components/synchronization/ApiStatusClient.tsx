"use client";

import {
    Activity,
    Database,
    LoaderCircle,
    RefreshCcw,
    Server,
    Timer
} from "lucide-react";
import {
    useCallback,
    useEffect,
    useState
} from "react";
import type { SyncOverview } from "@/types";

function formatDateTime(
    value: string | null
): string {
    if (!value) return "—";

    const date = new Date(value);

    return Number.isNaN(date.getTime())
        ? value
        : date.toLocaleString("pt-PT");
}

export function ApiStatusClient() {
    const [data, setData] =
        useState<SyncOverview | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadStatus = useCallback(async function() {
        setLoading(true);
        setError("");

        try {
            const response = await fetch(
                "/api/synchronization/status",
                {
                    cache: "no-store"
                }
            );

            const result = await response.json();

            if (!response.ok || !result.success) {
                setError(
                    result.message ||
                        "Não foi possível verificar a API."
                );
                return;
            }

            setData(result.data);
        } catch {
            setError("Falha de comunicação.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(function() {
        loadStatus();

        const timer = window.setInterval(
            loadStatus,
            30000
        );

        return function() {
            window.clearInterval(timer);
        };
    }, [loadStatus]);

    if (loading && !data) {
        return (
            <section className="card sync-loading">
                <LoaderCircle
                    className="spin"
                    size={28}
                />
                A verificar a API...
            </section>
        );
    }

    return (
        <>
            <section className="sync-status-actions">
                <button
                    className="btn secondary"
                    type="button"
                    onClick={loadStatus}
                    disabled={loading}
                >
                    <RefreshCcw size={17} />
                    Atualizar agora
                </button>
            </section>

            {error ? (
                <div className="report-alert error">
                    {error}
                </div>
            ) : null}

            {data ? (
                <>
                    <section className="grid sync-api-grid">
                        <article className="card sync-api-card">
                            <div className="sync-api-card-head">
                                <Server size={21} />
                                <span>API central</span>
                            </div>

                            <strong
                                className={
                                    data.api.api_status ===
                                    "ONLINE"
                                        ? "sync-online"
                                        : "sync-offline"
                                }
                            >
                                {data.api.api_status}
                            </strong>

                            <small>
                                Serviço: {data.api.service}
                            </small>
                        </article>

                        <article className="card sync-api-card">
                            <div className="sync-api-card-head">
                                <Database size={21} />
                                <span>Base de dados</span>
                            </div>

                            <strong
                                className={
                                    data.api.database_status ===
                                    "ONLINE"
                                        ? "sync-online"
                                        : "sync-offline"
                                }
                            >
                                {data.api.database_status}
                            </strong>

                            <small>
                                Verificado em{" "}
                                {formatDateTime(
                                    data.api.checked_at
                                )}
                            </small>
                        </article>

                        <article className="card sync-api-card">
                            <div className="sync-api-card-head">
                                <Timer size={21} />
                                <span>Uptime</span>
                            </div>

                            <strong>
                                {Math.floor(
                                    Number(
                                        data.api.uptime_seconds ||
                                            0
                                    ) / 60
                                )}{" "}
                                min
                            </strong>

                            <small>
                                Versão{" "}
                                {data.api.version || "—"}
                            </small>
                        </article>

                        <article className="card sync-api-card">
                            <div className="sync-api-card-head">
                                <Activity size={21} />
                                <span>
                                    Última sincronização
                                </span>
                            </div>

                            <strong className="sync-api-small-value">
                                {formatDateTime(
                                    data.last_sync_at
                                )}
                            </strong>
                        </article>
                    </section>

                    <section className="grid sync-overview-grid">
                        <article className="card sync-stat">
                            <span>Dispositivos</span>
                            <strong>
                                {data.devices_total}
                            </strong>
                        </article>

                        <article className="card sync-stat">
                            <span>Online</span>
                            <strong>
                                {data.devices_online}
                            </strong>
                        </article>

                        <article className="card sync-stat">
                            <span>Offline</span>
                            <strong>
                                {data.devices_offline}
                            </strong>
                        </article>

                        <article className="card sync-stat">
                            <span>Inativos</span>
                            <strong>
                                {data.devices_inactive}
                            </strong>
                        </article>

                        <article className="card sync-stat">
                            <span>Uploads hoje</span>
                            <strong>
                                {data.uploads_today}
                            </strong>
                        </article>

                        <article className="card sync-stat">
                            <span>Downloads hoje</span>
                            <strong>
                                {data.downloads_today}
                            </strong>
                        </article>

                        <article className="card sync-stat">
                            <span>Erros hoje</span>
                            <strong>
                                {data.errors_today}
                            </strong>
                        </article>
                    </section>
                </>
            ) : null}
        </>
    );
}
