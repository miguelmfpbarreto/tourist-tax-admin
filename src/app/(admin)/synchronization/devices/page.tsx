import { SyncDevicesClient } from "@/components/synchronization/SyncDevicesClient";
import { PermissionGate } from "@/components/PermissionGate";
import { PERMISSIONS } from "@/lib/permissions";

export default function Page() {
    return (
        <PermissionGate permission={PERMISSIONS.syncDevicesView}>
            <main className="page">
                <div className="page-header"><div><h1>Dispositivos</h1><p>Estado dos terminais e últimas sincronizações realizadas.</p></div></div>
                <SyncDevicesClient />
            </main>
        </PermissionGate>
    );
}
