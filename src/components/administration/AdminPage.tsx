import { AdminCrud } from "./AdminCrud";
import { ADMIN_ENTITY_PERMISSIONS, hasPermission, PERMISSIONS } from "@/lib/permissions";
import { requireUser } from "@/lib/session";
import type { AdminDefinition } from "@/lib/adminEntities";

export async function AdminPage({definition}:{definition:AdminDefinition}){
 const user=await requireUser(); const p=ADMIN_ENTITY_PERMISSIONS[definition.entity];
 return <main className="page"><div className="page-header"><div><h1>{definition.title}</h1><p>{definition.description}</p></div></div><AdminCrud definition={definition} access={{canCreate:hasPermission(user,p.create),canUpdate:hasPermission(user,p.update),canStatus:hasPermission(user,p.status),canViewPermissions:hasPermission(user,PERMISSIONS.permissionsView),canViewProfiles:hasPermission(user,PERMISSIONS.profilesView)}}/></main>;
}
