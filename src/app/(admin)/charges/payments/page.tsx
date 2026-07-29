import { ChargeListPage } from "@/components/charges/ChargeListPage";
import { PermissionGate } from "@/components/PermissionGate";
import { PERMISSIONS } from "@/lib/permissions";

export default function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
    return (
        <PermissionGate permission={[PERMISSIONS.recordsView, PERMISSIONS.paymentsView]}>
            <ChargeListPage
                config={{ action: "PAGAMENTO", title: "Pagamentos", description: "Cobranças concluídas com valor registado.", emptyMessage: "Nenhum pagamento encontrado." }}
                basePath="/charges/payments"
                searchParams={searchParams}
            />
        </PermissionGate>
    );
}
