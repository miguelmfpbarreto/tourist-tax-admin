import { ChargeListPage } from "@/components/charges/ChargeListPage";
import { PermissionGate } from "@/components/PermissionGate";
import { PERMISSIONS } from "@/lib/permissions";

export default function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
    return (
        <PermissionGate permission={[PERMISSIONS.recordsView, PERMISSIONS.exemptionsView]}>
            <ChargeListPage
                config={{ action: "ISENÇÃO", title: "Isenções", description: "Registos autorizados sem cobrança da taxa turística.", emptyMessage: "Nenhuma isenção encontrada." }}
                basePath="/charges/exemptions"
                searchParams={searchParams}
            />
        </PermissionGate>
    );
}
