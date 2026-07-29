import {
    DeviceManager
} from "@/components/DeviceManager";

import {
    PermissionGate
} from "@/components/PermissionGate";

import {
    hasPermission,
    PERMISSIONS
} from "@/lib/permissions";

import {
    requireUser
} from "@/lib/session";

export default async function Page() {
    const user =
        await requireUser();

    return (
        <PermissionGate
            permission={
                PERMISSIONS.devicesView
            }
        >
            <main className="page">
                <div className="page-head">
                    <h1>
                        Dispositivos
                    </h1>

                    <p className="muted">
                        Pesquisa, filtros, registo, edição e controlo dos terminais Electron.
                    </p>
                </div>

                <DeviceManager
                    access={{
                        canCreate:
                            hasPermission(
                                user,
                                PERMISSIONS.devicesCreate
                            ),

                        canUpdate:
                            hasPermission(
                                user,
                                PERMISSIONS.devicesUpdate
                            ),

                        canStatus:
                            hasPermission(
                                user,
                                PERMISSIONS.devicesStatus
                            )
                    }}
                />
            </main>
        </PermissionGate>
    );
}