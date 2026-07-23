import { ChargeListPage } from "@/components/charges/ChargeListPage";

export default function RefusalsPage({
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
                action: "RECUSA",
                title: "Recusas",
                description:
                    "Visitantes que recusaram pagar a taxa turística.",
                emptyMessage:
                    "Nenhuma recusa encontrada."
            }}
            basePath="/charges/refusals"
            searchParams={searchParams}
        />
    );
}
