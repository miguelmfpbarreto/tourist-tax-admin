import Link from "next/link";

import {
    KeyRound,
    ShieldCheck,
    Users
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
        href: "/administration/users",
        title: "Utilizadores",
        description:
            "Criar, editar, ativar e desativar utilizadores.",
        icon: Users,
        permission:
            PERMISSIONS.usersView
    },
    {
        href: "/administration/profiles",
        title: "Perfis",
        description:
            "Gerir perfis e respetivas permissões.",
        icon: ShieldCheck,
        permission:
            PERMISSIONS.profilesStatus
    },
    {
        href: "/administration/permissions",
        title: "Permissões",
        description:
            "Gerir permissões disponíveis no sistema.",
        icon: KeyRound,
        permission:
            PERMISSIONS.permissionsView
    }
] as const;

export default async function Page() {
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

    /*
     * A permissão antiga "Administração"
     * já não é necessária.
     *
     * O utilizador pode entrar no módulo quando
     * possui pelo menos uma permissão específica:
     * Utilizadores_view, Perfis_view ou Permissões_view.
     */
    if (
        visibleModules.length === 0
    ) {
        return (
            <AccessDenied
                message="Não tem permissão para consultar os módulos de administração."
            />
        );
    }

    return (
        <main className="page">
            <div className="page-header">
                <div>
                    <h1>
                        Administração
                    </h1>

                    <p>
                        Gestão de utilizadores, perfis e permissões.
                    </p>
                </div>
            </div>

            <section className="grid admin-module-grid">
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
                                className="card admin-module-card"
                            >
                                <div className="admin-module-icon">
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