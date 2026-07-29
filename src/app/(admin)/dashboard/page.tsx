import { DashboardClient } from "@/components/dashboard/DashboardClient";
import { apiRequest } from "@/lib/api";
import { getToken } from "@/lib/session";
import type {
    DashboardData,
    PaymentList,
    PaymentReport,
    Summary,
    SyncOverview
} from "@/types";

function emptySummary(): Summary {
    return {
        payments_today: 0,
        refusals_today: 0,
        exemptions_today: 0,
        dobra_total: "0",
        euro_total: "0",
        dollar_total: "0",
        devices_online: 0,
        devices_offline: 0
    };
}

function reportStartDate(): string {
    const date = new Date();
    date.setDate(date.getDate() - 30);

    return date.toISOString().substring(0, 10);
}

export default async function DashboardPage() {
    const token = await getToken();
    const auth = {
        token: token || undefined
    };

    const [
        summaryResult,
        paymentsResult,
        reportResult,
        synchronizationResult
    ] = await Promise.allSettled([
        apiRequest<Summary>(
            "/admin/dashboard/summary",
            auth
        ),
        apiRequest<PaymentList>(
            "/admin/payments?page=1&limit=8",
            auth
        ),
        apiRequest<PaymentReport>(
            `/admin/reports/payments?date_from=${reportStartDate()}`,
            auth
        ),
        apiRequest<SyncOverview>(
            "/admin/synchronization/status",
            auth
        )
    ]);

    const data: DashboardData = {
        generated_at:
            new Date().toISOString(),
        summary:
            summaryResult.status ===
            "fulfilled"
                ? summaryResult.value
                : emptySummary(),
        recent_payments:
            paymentsResult.status ===
            "fulfilled"
                ? paymentsResult.value.data
                : [],
        report:
            reportResult.status ===
            "fulfilled"
                ? reportResult.value
                : null,
        synchronization:
            synchronizationResult.status ===
            "fulfilled"
                ? synchronizationResult.value
                : null
    };

    return (
        <main className="page">
            <div className="page-header">
                <div>
                    <h1>Dashboard</h1>
                    <p>
                        Visão geral operacional,
                        financeira e de sincronização.
                    </p>
                </div>
            </div>

            <DashboardClient data={data} />
        </main>
    );
}
