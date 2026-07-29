import { SyncLogsClient } from "@/components/synchronization/SyncLogsClient";
import { PermissionGate } from "@/components/PermissionGate";
import { PERMISSIONS } from "@/lib/permissions";

export default function Page() {
    return (
        <PermissionGate permission={PERMISSIONS.syncLogsView}>
            <main className="page">
                <div className="page-header"><div><h1>Logs de sincronização</h1><p>Histórico de uploads, downloads, avisos e erros.</p></div></div>
                <SyncLogsClient />
            </main>
        </PermissionGate>
    );
}
