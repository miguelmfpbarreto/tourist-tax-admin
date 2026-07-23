import { env } from "@/lib/env";
export class ApiRequestError extends Error { constructor(message: string, public status: number, public details: unknown = null){ super(message); this.name="ApiRequestError"; } }
type Envelope<T>={success:boolean;message?:string;data:T;details?:unknown};
export async function apiRequest<T>(endpoint:string, options:RequestInit & {token?:string}={}):Promise<T>{
 const {token,headers,...rest}=options;
 const response=await fetch(`${env.apiUrl}${endpoint}`,{...rest,headers:{"Content-Type":"application/json",...(token?{Authorization:`Bearer ${token}`}:{ }),...headers},cache:"no-store"});
 let payload:Envelope<T>; try{payload=await response.json();}catch{throw new ApiRequestError(`Resposta inválida. HTTP ${response.status}.`,response.status);}
 if(!response.ok||!payload.success) throw new ApiRequestError(payload.message||`Erro HTTP ${response.status}.`,response.status,payload.details||null);
 return payload.data;
}
