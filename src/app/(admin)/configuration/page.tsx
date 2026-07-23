import Link from "next/link";
import {
    Building2,
    CircleDollarSign,
    Flag,
    MonitorCog,
    Plane,
    Settings2,
    Tags
} from "lucide-react";

const modules = [
    {
        href: "/configuration/posts",
        title: "Postos",
        description: "Postos de entrada e cobrança.",
        icon: Building2
    },
    {
        href: "/configuration/devices",
        title: "Dispositivos",
        description: "Terminais Electron e respetivos estados.",
        icon: MonitorCog
    },
    {
        href: "/configuration/flights",
        title: "Ligações",
        description: "Voos e embarcações por posto.",
        icon: Plane
    },
    {
        href: "/configuration/countries",
        title: "Países",
        description: "Países e códigos ICAO.",
        icon: Flag
    },
    {
        href: "/configuration/visit-reasons",
        title: "Motivos",
        description: "Motivos de viagem disponíveis.",
        icon: Tags
    },
    {
        href: "/configuration/taxes",
        title: "Taxas",
        description: "Valores por pagamento e moeda.",
        icon: CircleDollarSign
    },
    {
        href: "/configuration/settings",
        title: "Definições",
        description: "Parâmetros globais do sistema.",
        icon: Settings2
    }
];

export default function ConfigurationPage() {
    return (
        <main className="page">
            <div className="page-header">
                <div>
                    <h1>Configuração</h1>
                    <p>
                        Administração dos dados de referência
                        sincronizados com os dispositivos.
                    </p>
                </div>
            </div>

            <section className="grid config-module-grid">
                {modules.map(function(module) {
                    const Icon = module.icon;

                    return (
                        <Link
                            key={module.href}
                            href={module.href}
                            className="card config-module-card"
                        >
                            <div className="config-module-icon">
                                <Icon size={24} />
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
