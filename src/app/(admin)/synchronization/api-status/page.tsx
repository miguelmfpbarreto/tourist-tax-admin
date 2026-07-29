import { ApiStatusClient } from "@/components/synchronization/ApiStatusClient";
import { PermissionGate } from "@/components/PermissionGate";
import { PERMISSIONS } from "@/lib/permissions";

export default function Page() {
    return (
        <PermissionGate permission={PERMISSIONS.apiStatusView}>
            <main className="page">
                <div className="page-header"><div><h1>Estado da API</h1><p>Disponibilidade da API central, base de dados e atividade dos dispositivos.</p></div></div>
                <ApiStatusClient />
            </main>
        </PermissionGate>
    );
}
