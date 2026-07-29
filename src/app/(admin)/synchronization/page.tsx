import Link from "next/link";
import {
    Activity,
    ListTree,
    MonitorCog
} from "lucide-react";

const modules = [
    {
        href: "/synchronization/devices",
        title: "Dispositivos",
        description:
            "Estado dos terminais Electron e últimas sincronizações.",
        icon: MonitorCog,
        className: "primary"
    },
    {
        href: "/synchronization/logs",
        title: "Logs",
        description:
            "Histórico detalhado de uploads, downloads e erros.",
        icon: ListTree,
        className: "warning"
    },
    {
        href: "/synchronization/api-status",
        title: "Estado da API",
        description:
            "Disponibilidade da API central e da base de dados.",
        icon: Activity,
        className: "success"
    }
];

export default function SynchronizationPage() {
    return (
        <main className="page">
            <div className="page-header">
                <div>
                    <h1>Sincronização</h1>
                    <p>
                        Monitorização dos dispositivos,
                        logs e disponibilidade da API central.
                    </p>
                </div>
            </div>

            <section className="grid sync-module-grid">
                {modules.map(function(module) {
                    const Icon = module.icon;

                    return (
                        <Link
                            key={module.href}
                            href={module.href}
                            className="card sync-module-card"
                        >
                            <div
                                className={`sync-module-icon ${module.className}`}
                            >
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
