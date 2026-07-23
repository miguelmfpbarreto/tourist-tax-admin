import { ReportsClient } from "@/components/reports/ReportsClient";

export default function ReportsPage() {
    return (
        <main className="page">
            <div className="page-head report-page-head">
                <div>
                    <h1>Relatórios</h1>
                    <p className="muted">
                        Consulte, filtre e exporte os registos de cobrança,
                        recusa e isenção.
                    </p>
                </div>
            </div>

            <ReportsClient />
        </main>
    );
}
