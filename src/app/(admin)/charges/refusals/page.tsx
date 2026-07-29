import { ChargeListPage } from "@/components/charges/ChargeListPage";
import { PermissionGate } from "@/components/PermissionGate";
import { PERMISSIONS } from "@/lib/permissions";

export default function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
    return (
        <PermissionGate permission={[PERMISSIONS.recordsView, PERMISSIONS.refusalsView]}>
            <ChargeListPage
                config={{ action: "RECUSA", title: "Recusas", description: "Visitantes que recusaram pagar a taxa turística.", emptyMessage: "Nenhuma recusa encontrada." }}
                basePath="/charges/refusals"
                searchParams={searchParams}
            />
        </PermissionGate>
    );
}
