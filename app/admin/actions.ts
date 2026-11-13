"use server";
import {requireAdmin} from "@/lib/admin";
import {getSupabase} from "@/lib/db";
import type {ProjectRequest} from "@/lib/database.types";
import {professionalSchema} from "@/lib/validation";
import {z} from "zod";
import {revalidatePath} from "next/cache";
import {notify} from "@/lib/notifications";
export async function updateRequest(f:FormData){
 const admin=await requireAdmin();
 const {id,status,note,professionalId}=z.object({id:z.string(),status:z.enum(["NEW","CONTACTED","IN_PROGRESS","CLOSED","CANCELLED"]),note:z.string().max(3000),professionalId:z.string()}).parse(Object.fromEntries(f));
 const {error}=await getSupabase().rpc("update_project_request",{p_id:id,p_status:status,p_professional_id:professionalId,p_admin_id:admin.id,p_note:note});
 if(error)throw error;
 revalidatePath("/admin");
 revalidatePath("/admin/requests/"+id);
}
export async function saveProfessional(f:FormData){
 await requireAdmin();
 const input=Object.fromEntries(f);const data=professionalSchema.parse({...input,verified:f.get("verified")==="on",available:f.get("available")==="on"});
 const id=f.get("id");
 const client=getSupabase();
 const result=typeof id==="string"&&id
  ? await client.from("Professional").update({...data,updatedAt:new Date().toISOString()}).eq("id",id).select("id").single()
  : await client.from("Professional").insert(data).select("id").single();
 if(result.error)throw result.error;
 revalidatePath("/admin/professionnels");
}
export async function retryNotifications(){await requireAdmin();const {data,error}=await getSupabase().from("ProjectRequest").select("id,reference").is("notificationSentAt",null).limit(20);if(error)throw error;for(const r of (data as Pick<ProjectRequest,"id"|"reference">[]|null)??[])await notify(r.id,r.reference);revalidatePath("/admin");}
