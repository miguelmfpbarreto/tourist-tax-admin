import Link from "next/link";
import {
    BarChart3,
    ChartNoAxesCombined,
    CircleDollarSign,
    ClipboardList
} from "lucide-react";

const modules = [
    {
        href: "/reports/general",
        title: "Geral",
        description: "Visão consolidada, filtros, tabela e exportações.",
        icon: ClipboardList,
        className: "primary"
    },
    {
        href: "/reports/financial",
        title: "Financeiro",
        description: "Receitas por moeda, posto, operador e período.",
        icon: CircleDollarSign,
        className: "success"
    },
    {
        href: "/reports/operational",
        title: "Operacional",
        description: "Atividade por ligação, motivo, posto e operador.",
        icon: ChartNoAxesCombined,
        className: "warning"
    },
    {
        href: "/reports/statistics",
        title: "Estatísticas",
        description: "Indicadores e gráficos de evolução e distribuição.",
        icon: BarChart3,
        className: "violet"
    }
];

export default function ReportsPage() {
    return (
        <main className="page">
            <div className="page-head report-page-head">
                <div>
                    <h1>Relatórios</h1>
                    <p className="muted">
                        Relatórios gerais, financeiros,
                        operacionais e estatísticos.
                    </p>
                </div>
            </div>

            <section className="grid reports-sections-grid">
                {modules.map(function(module) {
                    const Icon = module.icon;

                    return (
                        <Link
                            key={module.href}
                            href={module.href}
                            className="card reports-section-card"
                        >
                            <div className={`reports-section-icon ${module.className}`}>
                                <Icon size={25} />
                            </div>
                            <h2>{module.title}</h2>
                            <p>{module.description}</p>
                        </Link>
                    );
                })}
            </section>
        </main>
    );
}
