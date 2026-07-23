import { ConfigCrud } from "@/components/config/ConfigCrud";
import type {
    ConfigEntityDefinition
} from "@/lib/configEntities";

export function ConfigPage({
    definition
}: {
    definition: ConfigEntityDefinition;
}) {
    return (
        <main className="page">
            <div className="page-header">
                <div>
                    <h1>{definition.title}</h1>
                    <p>{definition.description}</p>
                </div>
            </div>

            <ConfigCrud definition={definition} />
        </main>
    );
}
