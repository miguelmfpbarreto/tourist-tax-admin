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
                PERMISSIONS.reportsOperationalView
            ]}
        >
            <main className="page">
                <div className="page-head report-page-head">
                    <div>
                        <h1>
                            Relatório Operacional
                        </h1>

                        <p className="muted">
                            Análise por ligação, motivo da viagem, nacionalidade, posto, operador e companhia.
                        </p>
                    </div>
                </div>

                <ReportsClient
                    initialView="analytics"
                    fixedView={true}
                    system={system}
                    user={user}
                />
            </main>
        </PermissionGate>
    );
}