import { AdminPage } from "@/components/administration/AdminPage";
import { adminEntities } from "@/lib/adminEntities";
export default function Page(){return <AdminPage definition={adminEntities["users"]}/>;}
