import { ChargeListPage } from "@/components/charges/ChargeListPage";

export default function ExemptionsPage({
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
                action: "ISENÇÃO",
                title: "Isenções",
                description:
                    "Registos autorizados sem cobrança da taxa turística.",
                emptyMessage:
                    "Nenhuma isenção encontrada."
            }}
            basePath="/charges/exemptions"
            searchParams={searchParams}
        />
    );
}
