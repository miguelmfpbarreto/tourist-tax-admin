import { ConfigPage } from "@/components/config/ConfigPage";
import { configEntities } from "@/lib/configEntities";

export default function Page() {
    return (
        <ConfigPage
            definition={configEntities["settings"]}
        />
    );
}
