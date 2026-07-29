"use client";

import Link from "next/link";
import {
    Activity,
    Ban,
    CircleDollarSign,
    CreditCard,
    FileBarChart,
    MonitorCheck,
    MonitorX,
    RefreshCcw,
    ShieldCheck,
    Users
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from "recharts";
import {
    dateTime,
    money
} from "@/lib/format";
import type {
    DashboardData,
    DashboardRecentPayment
} from "@/types";

function actionClass(action: string): string {
    if (action === "PAGAMENTO") {
        return "success";
    }

    if (action === "ISENÇÃO") {
        return "warning";
    }

    return "danger";
}

function actionLabel(action: string): string {
    if (action === "PAGAMENTO") {
        return "Pagamento";
    }

    if (action === "ISENÇÃO") {
        return "Isenção";
    }

    return "Recusa";
}

function StatCard({
    title,
    value,
    note,
    icon: Icon,
    tone = "primary"
}: {
    title: string;
    value: string | number;
    note: string;
    icon: React.ComponentType<{
        size?: number;
    }>;
    tone?: "primary" | "success" | "warning" | "danger";
}) {
    return (
        <article className="card dashboard-stat">
            <div className="dashboard-stat-head">
                <span>{title}</span>

                <div
                    className={`dashboard-stat-icon ${tone}`}
                >
                    <Icon size={20} />
                </div>
            </div>

            <strong>{value}</strong>
            <small>{note}</small>
        </article>
    );
}

function RecentPaymentRow({
    payment
}: {
    payment: DashboardRecentPayment;
}) {
    return (
        <tr>
            <td>
                {dateTime(
                    payment.local_created_at
                )}
            </td>

            <td>
                <Link
                    href={`/payments/${payment.uuid}`}
                    className="dashboard-link"
                >
                    {payment.receipt_no}
                </Link>
            </td>

            <td>{payment.passport}</td>

            <td>
                {payment.name}{" "}
                {payment.surname || ""}
            </td>

            <td>
                <span
                    className={`badge ${actionClass(
                        payment.payment_action
                    )}`}
                >
                    {actionLabel(
                        payment.payment_action
                    )}
                </span>
            </td>

            <td>
                {money(
                    payment.amount,
                    payment.currency
                )}
            </td>

            <td>{payment.post_code}</td>
            <td>{payment.device_name}</td>
        </tr>
    );
}

export function DashboardClient({
    data
}: {
    data: DashboardData;
}) {
    const router = useRouter();
    const report = data.report;
    const synchronization =
        data.synchronization;

    const dailyData =
        report?.analytics.daily.slice(-14) || [];

    const postData =
        report?.analytics.by_post
            .slice(0, 8)
            .map(function(row) {
                return {
                    name: row.name,
                    Pagamentos: row.payments,
                    Recusas: row.refusals,
                    Isenções: row.exemptions
                };
            }) || [];

    const online =
        synchronization?.devices_online ??
        data.summary.devices_online;

    const offline =
        synchronization?.devices_offline ??
        data.summary.devices_offline;

    return (
        <>
            <section className="dashboard-actions no-print">
                <span>
                    Atualizado em{" "}
                    {dateTime(data.generated_at)}
                </span>

                <button
                    className="btn secondary"
                    type="button"
                    onClick={function() {
                        router.refresh();
                    }}
                >
                    <RefreshCcw size={17} />
                    Atualizar
                </button>
            </section>

            <section className="grid dashboard-kpi-grid">
                <StatCard
                    title="Pagamentos hoje"
                    value={
                        data.summary
                            .payments_today
                    }
                    note="Cobranças concluídas"
                    icon={CreditCard}
                    tone="success"
                />

                <StatCard
                    title="Recusas hoje"
                    value={
                        data.summary
                            .refusals_today
                    }
                    note="Recusas registadas"
                    icon={Ban}
                    tone="danger"
                />

                <StatCard
                    title="Isenções hoje"
                    value={
                        data.summary
                            .exemptions_today
                    }
                    note="Isenções autorizadas"
                    icon={ShieldCheck}
                    tone="warning"
                />

                <StatCard
                    title="Dispositivos online"
                    value={online}
                    note={`${offline} dispositivo(s) offline`}
                    icon={
                        online > 0
                            ? MonitorCheck
                            : MonitorX
                    }
                />

                <StatCard
                    title="Turistas no período"
                    value={
                        report?.summary
                            .unique_passports || 0
                    }
                    note="Passaportes únicos"
                    icon={Users}
                />

                <StatCard
                    title="Erros de sincronização"
                    value={
                        synchronization
                            ?.errors_today || 0
                    }
                    note="Erros registados hoje"
                    icon={Activity}
                    tone={
                        (
                            synchronization
                                ?.errors_today ||
                            0
                        ) > 0
                            ? "danger"
                            : "success"
                    }
                />
            </section>

            <section className="grid dashboard-money-grid">
                <article className="card dashboard-money-card">
                    <div>
                        <span>Total hoje em Dobras</span>
                        <strong>
                            {money(
                                data.summary
                                    .dobra_total,
                                "DOBRA"
                            )}
                        </strong>
                    </div>
                    <CircleDollarSign size={29} />
                </article>

                <article className="card dashboard-money-card">
                    <div>
                        <span>Total hoje em Euros</span>
                        <strong>
                            {money(
                                data.summary
                                    .euro_total,
                                "EURO"
                            )}
                        </strong>
                    </div>
                    <CircleDollarSign size={29} />
                </article>

                <article className="card dashboard-money-card">
                    <div>
                        <span>Total hoje em Dólares</span>
                        <strong>
                            {money(
                                data.summary
                                    .dollar_total,
                                "DOLAR"
                            )}
                        </strong>
                    </div>
                    <CircleDollarSign size={29} />
                </article>
            </section>

            <section className="grid dashboard-chart-grid">
                <article className="card dashboard-chart-card">
                    <div className="dashboard-card-head">
                        <div>
                            <h2>
                                Movimento dos últimos
                                14 dias
                            </h2>
                            <p>
                                Pagamentos, recusas e
                                isenções.
                            </p>
                        </div>

                        <Link
                            href="/reports/statistics"
                            className="btn secondary"
                        >
                            <FileBarChart size={16} />
                            Estatísticas
                        </Link>
                    </div>

                    <div className="dashboard-chart">
                        {dailyData.length > 0 ? (
                            <ResponsiveContainer
                                width="100%"
                                height="100%"
                            >
                                <LineChart
                                    data={dailyData}
                                >
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        stroke="#23354d"
                                    />

                                    <XAxis
                                        dataKey="date"
                                        tick={{
                                            fill: "#91a4be",
                                            fontSize: 11
                                        }}
                                    />

                                    <YAxis
                                        tick={{
                                            fill: "#91a4be",
                                            fontSize: 11
                                        }}
                                    />

                                    <Tooltip />
                                    <Legend />

                                    <Line
                                        type="monotone"
                                        dataKey="payments"
                                        name="Pagamentos"
                                        stroke="#22c55e"
                                        strokeWidth={2}
                                    />

                                    <Line
                                        type="monotone"
                                        dataKey="refusals"
                                        name="Recusas"
                                        stroke="#ef4444"
                                        strokeWidth={2}
                                    />

                                    <Line
                                        type="monotone"
                                        dataKey="exemptions"
                                        name="Isenções"
                                        stroke="#f59e0b"
                                        strokeWidth={2}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="dashboard-empty-chart">
                                Ainda não existem dados
                                suficientes para o gráfico.
                            </div>
                        )}
                    </div>
                </article>

                <article className="card dashboard-chart-card">
                    <div className="dashboard-card-head">
                        <div>
                            <h2>Atividade por posto</h2>
                            <p>
                                Distribuição dos registos.
                            </p>
                        </div>

                        <Link
                            href="/reports/operational"
                            className="btn secondary"
                        >
                            Ver relatório
                        </Link>
                    </div>

                    <div className="dashboard-chart">
                        {postData.length > 0 ? (
                            <ResponsiveContainer
                                width="100%"
                                height="100%"
                            >
                                <BarChart
                                    data={postData}
                                >
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        stroke="#23354d"
                                    />

                                    <XAxis
                                        dataKey="name"
                                        tick={{
                                            fill: "#91a4be",
                                            fontSize: 10
                                        }}
                                    />

                                    <YAxis
                                        tick={{
                                            fill: "#91a4be",
                                            fontSize: 11
                                        }}
                                    />

                                    <Tooltip />
                                    <Legend />

                                    <Bar
                                        dataKey="Pagamentos"
                                        stackId="records"
                                        fill="#22c55e"
                                    />

                                    <Bar
                                        dataKey="Recusas"
                                        stackId="records"
                                        fill="#ef4444"
                                    />

                                    <Bar
                                        dataKey="Isenções"
                                        stackId="records"
                                        fill="#f59e0b"
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="dashboard-empty-chart">
                                Ainda não existem dados
                                por posto.
                            </div>
                        )}
                    </div>
                </article>
            </section>

            <section className="grid dashboard-bottom-grid">
                <article className="card dashboard-sync-card">
                    <div className="dashboard-card-head">
                        <div>
                            <h2>
                                Estado da sincronização
                            </h2>
                            <p>
                                API, base de dados e
                                dispositivos.
                            </p>
                        </div>

                        <Link
                            href="/synchronization/api-status"
                            className="btn secondary"
                        >
                            Ver estado
                        </Link>
                    </div>

                    <div className="dashboard-sync-list">
                        <div>
                            <span>API central</span>
                            <strong
                                className={
                                    synchronization?.api
                                        .api_status ===
                                    "OFFLINE"
                                        ? "sync-offline"
                                        : "sync-online"
                                }
                            >
                                {synchronization?.api
                                    .api_status ||
                                    "ONLINE"}
                            </strong>
                        </div>

                        <div>
                            <span>Base de dados</span>
                            <strong
                                className={
                                    synchronization?.api
                                        .database_status ===
                                    "OFFLINE"
                                        ? "sync-offline"
                                        : "sync-online"
                                }
                            >
                                {synchronization?.api
                                    .database_status ||
                                    "ONLINE"}
                            </strong>
                        </div>

                        <div>
                            <span>Uploads hoje</span>
                            <strong>
                                {synchronization
                                    ?.uploads_today || 0}
                            </strong>
                        </div>

                        <div>
                            <span>Downloads hoje</span>
                            <strong>
                                {synchronization
                                    ?.downloads_today || 0}
                            </strong>
                        </div>

                        <div>
                            <span>
                                Última sincronização
                            </span>
                            <strong>
                                {dateTime(
                                    synchronization
                                        ?.last_sync_at ||
                                        null
                                )}
                            </strong>
                        </div>
                    </div>
                </article>

                <article className="card dashboard-recent-card">
                    <div className="dashboard-card-head">
                        <div>
                            <h2>
                                Últimos registos
                            </h2>
                            <p>
                                Movimentos mais recentes
                                recebidos pela central.
                            </p>
                        </div>

                        <Link
                            href="/charges/payments"
                            className="btn secondary"
                        >
                            Ver cobranças
                        </Link>
                    </div>

                    <div className="table-wrap">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Data</th>
                                    <th>Recibo</th>
                                    <th>Passaporte</th>
                                    <th>Nome</th>
                                    <th>Ação</th>
                                    <th>Valor</th>
                                    <th>Posto</th>
                                    <th>Dispositivo</th>
                                </tr>
                            </thead>

                            <tbody>
                                {data.recent_payments.map(
                                    function(payment) {
                                        return (
                                            <RecentPaymentRow
                                                key={
                                                    payment.uuid
                                                }
                                                payment={
                                                    payment
                                                }
                                            />
                                        );
                                    }
                                )}
                            </tbody>
                        </table>

                        {data.recent_payments
                            .length === 0 ? (
                            <div className="empty">
                                Nenhum registo
                                encontrado.
                            </div>
                        ) : null}
                    </div>
                </article>
            </section>
        </>
    );
}
