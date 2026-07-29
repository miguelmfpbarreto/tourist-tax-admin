import {
    AccessDenied
} from "@/components/AccessDenied";

import {
    ConfigCrud
} from "@/components/config/ConfigCrud";

import {
    CONFIG_ENTITY_PERMISSIONS,
    hasPermission
} from "@/lib/permissions";

import {
    requireUser
} from "@/lib/session";

import type {
    ConfigEntityDefinition
} from "@/lib/configEntities";

export async function ConfigPage({
    definition
}: {
    definition: ConfigEntityDefinition;
}) {
    const user =
        await requireUser();

    const permissions =
        CONFIG_ENTITY_PERMISSIONS[
            definition.entity
        ];

    if (
        !hasPermission(
            user,
            permissions.view
        )
    ) {
        return (
            <AccessDenied
                message={`Sem permissão para consultar ${definition.title}.`}
            />
        );
    }

    return (
        <main className="page">
            <div className="page-header">
                <div>
                    <h1>
                        {definition.title}
                    </h1>

                    <p>
                        {
                            definition.description
                        }
                    </p>
                </div>
            </div>

            <ConfigCrud
                definition={
                    definition
                }
                access={{
                    canCreate:
                        hasPermission(
                            user,
                            permissions.create
                        ),

                    canUpdate:
                        hasPermission(
                            user,
                            permissions.update
                        ),

                    canStatus:
                        hasPermission(
                            user,
                            permissions.status
                        )
                }}
            />
        </main>
    );
}