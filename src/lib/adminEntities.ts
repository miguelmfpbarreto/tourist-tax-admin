import type { AdminEntity } from "@/types";
export type AdminDefinition = {
  entity: AdminEntity; title:string; singular:string; description:string;
  columns:{key:string;label:string}[];
  fields:{name:string;label:string;type:"text"|"password"|"textarea"|"number";required?:boolean}[];
};
export const adminEntities: Record<AdminEntity,AdminDefinition> = {
 users:{entity:"users",title:"Utilizadores",singular:"Utilizador",description:"Gestão dos utilizadores do sistema.",columns:[{key:"full_name",label:"Nome"},{key:"user_name",label:"Utilizador"},{key:"profile_name",label:"Perfil"},{key:"is_active",label:"Estado"}],fields:[{name:"name",label:"Nome",type:"text",required:true},{name:"sur_name",label:"Apelido",type:"text",required:true},{name:"user_name",label:"Utilizador",type:"text",required:true},{name:"password",label:"Password",type:"password"},{name:"profile_id",label:"ID do perfil",type:"number",required:true}]},
 profiles:{entity:"profiles",title:"Perfis",singular:"Perfil",description:"Gestão de perfis e respetivas permissões.",columns:[{key:"name",label:"Perfil"},{key:"description",label:"Descrição"},{key:"permissions_count",label:"Permissões"},{key:"is_active",label:"Estado"}],fields:[{name:"name",label:"Nome",type:"text",required:true},{name:"description",label:"Descrição",type:"textarea"},{name:"permission_ids",label:"IDs das permissões (separados por vírgula)",type:"text"}]},
 permissions:{entity:"permissions",title:"Permissões",singular:"Permissão",description:"Gestão das permissões disponíveis.",columns:[{key:"name",label:"Permissão"},{key:"description",label:"Descrição"},{key:"is_active",label:"Estado"}],fields:[{name:"name",label:"Nome",type:"text",required:true},{name:"description",label:"Descrição",type:"textarea"}]}
};
