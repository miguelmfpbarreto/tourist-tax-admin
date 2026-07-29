import {
    ReportsClient
} from "@/components/reports/ReportsClient";

import {
    PermissionGate
} from "@/components/PermissionGate";

import {
    apiRequest
} from "@/lib/api";

import {
    PERMISSIONS
} from "@/lib/permissions";

import {
    requireUser
} from "@/lib/session";

import type {
    SystemSettings
} from "@/types";

export default async function Page() {
    const user =
        await requireUser();

    const system =
        await apiRequest<SystemSettings>(
            "/admin/settings/system"
        );

    return (
        <PermissionGate
            permission={[
                PERMISSIONS.reportsView,
                PERMISSIONS.reportsFinancialView
            ]}
        >
            <main className="page">
                <div className="page-head report-page-head">
                    <div>
                        <h1>
                            Relatório Financeiro
                        </h1>

                        <p className="muted">
                            Receitas por moeda, método de pagamento, posto e distribuição de pagamentos, recusas e isenções.
                        </p>
                    </div>
                </div>

                <ReportsClient
                    initialView="summary"
                    fixedView={true}
                    reportKind="financial"
                    system={system}
                    user={user}
                />
            </main>
        </PermissionGate>
    );
}