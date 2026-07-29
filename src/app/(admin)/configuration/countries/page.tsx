import { ConfigPage } from "@/components/config/ConfigPage";
import { PermissionGate } from "@/components/PermissionGate";
import { configEntities } from "@/lib/configEntities";
import { PERMISSIONS } from "@/lib/permissions";

export default function Page() {
    return (
        <PermissionGate permission={PERMISSIONS.countriesView}>
            <ConfigPage definition={configEntities["countries"]} />
        </PermissionGate>
    );
}
