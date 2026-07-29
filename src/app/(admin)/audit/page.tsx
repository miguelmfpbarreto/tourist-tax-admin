import { AuditClient } from "@/components/audit/AuditClient";
import { PermissionGate } from "@/components/PermissionGate";
import { PERMISSIONS } from "@/lib/permissions";

export default function AuditPage() {
    return (
        <PermissionGate permission={PERMISSIONS.auditView}>
            <main className="page">
                <div className="page-header"><div><h1>Auditoria</h1><p>Histórico de operações, alterações e acessos realizados no sistema.</p></div></div>
                <AuditClient />
            </main>
        </PermissionGate>
    );
}
