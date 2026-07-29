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
                PERMISSIONS.reportsGeneralView
            ]}
        >
            <main className="page">
                <div className="page-head report-page-head">
                    <div>
                        <h1>
                            Relatório Geral
                        </h1>

                        <p className="muted">
                            Consulta consolidada dos registos com exportação para PDF, Excel, CSV e área de transferência.
                        </p>
                    </div>
                </div>

                <ReportsClient
                    initialView="table"
                    fixedView={true}
                    system={system}
                    user={user}
                />
            </main>
        </PermissionGate>
    );
}