import { AdminCrud } from "./AdminCrud";
import type { AdminDefinition } from "@/lib/adminEntities";
export function AdminPage({definition}:{definition:AdminDefinition}){return <main className="page"><div className="page-header"><div><h1>{definition.title}</h1><p>{definition.description}</p></div></div><AdminCrud definition={definition}/></main>;}
