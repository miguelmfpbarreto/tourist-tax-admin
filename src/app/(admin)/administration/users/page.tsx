import { AdminPage } from "@/components/administration/AdminPage";
import { PermissionGate } from "@/components/PermissionGate";
import { adminEntities } from "@/lib/adminEntities";
import { PERMISSIONS } from "@/lib/permissions";

export default function Page() {
    return (
        <PermissionGate permission={PERMISSIONS.usersView}>
            <AdminPage definition={adminEntities["users"]} />
        </PermissionGate>
    );
}
