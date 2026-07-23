import { ChargeListPage } from "@/components/charges/ChargeListPage";

export default function PaymentsPage({
    searchParams
}: {
    searchParams: Promise<
        Record<
            string,
            string | string[] | undefined
        >
    >;
}) {
    return (
        <ChargeListPage
            config={{
                action: "PAGAMENTO",
                title: "Pagamentos",
                description:
                    "Cobranças concluídas com valor registado.",
                emptyMessage:
                    "Nenhum pagamento encontrado."
            }}
            basePath="/charges/payments"
            searchParams={searchParams}
        />
    );
}
