import type { CurrentUser } from "@/types";

export const PERMISSIONS = {
    dashboardView: "Dashboard_view",

    recordsView: "Registos_view",
    paymentsView: "Pagamentos_view",
    refusalsView: "Recusas_view",
    exemptionsView: "Isenções_view",

    reportsView: "Relatórios_view",
    reportsGeneralView: "Relatório_Geral_view",
    reportsFinancialView: "Relatório_Financeiro_view",
    reportsOperationalView: "Relatório_Operacional_view",
    reportsStatisticsView: "Estatísticas_view",

    synchronizationView: "Sincronização_view",
    syncDevicesView: "Dispositivos_view",
    syncLogsView: "Logs_view",
    apiStatusView: "Estado_API_view",

    auditView: "Auditoria_view",

    postsView: "Postos_view",
    postsCreate: "Postos_create",
    postsUpdate: "Postos_update",
    postsStatus: "Postos_status",

    flightsView: "Ligações_view",
    flightsCreate: "Ligações_create",
    flightsUpdate: "Ligações_update",
    flightsStatus: "Ligações_status",

    countriesView: "Países_view",
    countriesCreate: "Países_create",
    countriesUpdate: "Países_update",
    countriesStatus: "Países_status",

    visitReasonsView: "Motivos_view",
    visitReasonsCreate: "Motivos_create",
    visitReasonsUpdate: "Motivos_update",
    visitReasonsStatus: "Motivos_status",

    taxesView: "Taxas_view",
    taxesCreate: "Taxas_create",
    taxesUpdate: "Taxas_update",
    taxesStatus: "Taxas_status",

    settingsView: "Definições_view",
    settingsCreate: "Definições_create",
    settingsUpdate: "Definições_update",
    settingsStatus: "Definições_status",

    usersView: "Utilizadores_view",
    usersCreate: "Utilizadores_create",
    usersUpdate: "Utilizadores_update",
    usersStatus: "Utilizadores_status",

    profilesView: "Perfis_view",
    profilesCreate: "Perfis_create",
    profilesUpdate: "Perfis_update",
    profilesStatus: "Perfis_status",

    permissionsView: "Permissões_view",
    permissionsCreate: "Permissões_create",
    permissionsUpdate: "Permissões_update",
    permissionsStatus: "Permissões_status",

    devicesView:"Dispositivos_view",
    devicesCreate: "Dispositivos_create",
    devicesUpdate:"Dispositivos_update",
    devicesStatus:"Dispositivos_status",
} as const;

export const CONFIG_ENTITY_PERMISSIONS = {
    posts: { view: PERMISSIONS.postsView, create: PERMISSIONS.postsCreate, update: PERMISSIONS.postsUpdate, status: PERMISSIONS.postsStatus },
    flights: { view: PERMISSIONS.flightsView, create: PERMISSIONS.flightsCreate, update: PERMISSIONS.flightsUpdate, status: PERMISSIONS.flightsStatus },
    countries: { view: PERMISSIONS.countriesView, create: PERMISSIONS.countriesCreate, update: PERMISSIONS.countriesUpdate, status: PERMISSIONS.countriesStatus },
    "visit-reasons": { view: PERMISSIONS.visitReasonsView, create: PERMISSIONS.visitReasonsCreate, update: PERMISSIONS.visitReasonsUpdate, status: PERMISSIONS.visitReasonsStatus },
    taxes: { view: PERMISSIONS.taxesView, create: PERMISSIONS.taxesCreate, update: PERMISSIONS.taxesUpdate, status: PERMISSIONS.taxesStatus },
    settings: { view: PERMISSIONS.settingsView, create: PERMISSIONS.settingsCreate, update: PERMISSIONS.settingsUpdate, status: PERMISSIONS.settingsStatus }
} as const;

export const ADMIN_ENTITY_PERMISSIONS = {
    users: { view: PERMISSIONS.usersView, create: PERMISSIONS.usersCreate, update: PERMISSIONS.usersUpdate, status: PERMISSIONS.usersStatus },
    profiles: { view: PERMISSIONS.profilesView, create: PERMISSIONS.profilesCreate, update: PERMISSIONS.profilesUpdate, status: PERMISSIONS.profilesStatus },
    permissions: { view: PERMISSIONS.permissionsView, create: PERMISSIONS.permissionsCreate, update: PERMISSIONS.permissionsUpdate, status: PERMISSIONS.permissionsStatus }
} as const;

function normalizePermission(
    value: unknown
): string {
    if (
        typeof value !== "string"
    ) {
        return "";
    }

    return value
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .trim()
        .toLocaleUpperCase(
            "pt-PT"
        );
}

export function hasPermission(
    user:
        | Pick<
            CurrentUser,
            "permissions"
        >
        | null
        | undefined,
    required:
        | string
        | readonly string[]
): boolean {
    if (
        !user ||
        !Array.isArray(
            user.permissions
        )
    ) {
        return false;
    }

    const userPermissions =
        user.permissions
            .map(
                normalizePermission
            )
            .filter(Boolean);

    const requiredPermissions =
        Array.isArray(required)
            ? required
            : [required];

    return requiredPermissions.some(
        function(permission) {
            const normalized =
                normalizePermission(
                    permission
                );

            return (
                normalized !== "" &&
                userPermissions.includes(
                    normalized
                )
            );
        }
    );
}

export function hasAnyPermission(user: Pick<CurrentUser, "permissions"> | null | undefined, permissions: readonly string[]): boolean {
    return permissions.some(permission => hasPermission(user, permission));
}
