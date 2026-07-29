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

import {
    AccessDenied
} from "@/components/AccessDenied";

import {
    hasPermission,
    PERMISSIONS
} from "@/lib/permissions";

import {
    requireUser
} from "@/lib/session";

const modules = [
    {
        href: "/configuration/posts",
        title: "Postos",
        description:
            "Postos de entrada e cobrança.",
        icon: Building2,
        permission:
            PERMISSIONS.postsView
    },
    {
        href: "/configuration/devices",
        title: "Dispositivos",
        description:
            "Registo, configuração e controlo dos terminais Electron.",
        icon: MonitorCog,
        permission:
            PERMISSIONS.syncDevicesView
    },
    {
        href: "/configuration/flights",
        title: "Ligações",
        description:
            "Voos e embarcações por posto.",
        icon: Plane,
        permission:
            PERMISSIONS.flightsView
    },
    {
        href: "/configuration/countries",
        title: "Países",
        description:
            "Países e códigos ICAO.",
        icon: Flag,
        permission:
            PERMISSIONS.countriesView
    },
    {
        href: "/configuration/visit-reasons",
        title: "Motivos",
        description:
            "Motivos de viagem disponíveis.",
        icon: Tags,
        permission:
            PERMISSIONS.visitReasonsView
    },
    {
        href: "/configuration/taxes",
        title: "Taxas",
        description:
            "Valores por pagamento e moeda.",
        icon: CircleDollarSign,
        permission:
            PERMISSIONS.taxesView
    },
    {
        href: "/configuration/settings",
        title: "Definições",
        description:
            "Parâmetros globais do sistema.",
        icon: Settings2,
        permission:
            PERMISSIONS.settingsView
    }
] as const;

export default async function ConfigurationPage() {
    const user =
        await requireUser();

    const visibleModules =
        modules.filter(
            function(module) {
                return hasPermission(
                    user,
                    module.permission
                );
            }
        );

    if (
        visibleModules.length === 0
    ) {
        return (
            <AccessDenied
                message="Não tem permissão para consultar os módulos de configuração."
            />
        );
    }

    return (
        <main className="page">
            <div className="page-header">
                <div>
                    <h1>
                        Configuração
                    </h1>

                    <p>
                        Administração dos dados de referência sincronizados com os dispositivos.
                    </p>
                </div>
            </div>

            <section className="grid config-module-grid">
                {visibleModules.map(
                    function(module) {
                        const Icon =
                            module.icon;

                        return (
                            <Link
                                key={
                                    module.href
                                }
                                href={
                                    module.href
                                }
                                className="card config-module-card"
                            >
                                <div className="config-module-icon">
                                    <Icon
                                        size={24}
                                    />
                                </div>

                                <h2>
                                    {
                                        module.title
                                    }
                                </h2>

                                <p>
                                    {
                                        module.description
                                    }
                                </p>
                            </Link>
                        );
                    }
                )}
            </section>
        </main>
    );
}