import { cookies } from "next/headers"; import { redirect } from "next/navigation"; import { env } from "@/lib/env"; import { apiRequest } from "@/lib/api"; import type { CurrentUser } from "@/types";
export async function getToken(){const c=await cookies();return c.get(env.authCookieName)?.value||null;}
export async function getCurrentUser(){const token=await getToken();if(!token)return null;try{return await apiRequest<CurrentUser>("/auth/me",{token});}catch{return null;}}
export async function requireUser(){const u=await getCurrentUser();if(!u)redirect("/login");return u;}
