"use server";
import {requestSchema} from "@/lib/validation";
import {getSupabase} from "@/lib/db";
import type {ProjectRequest} from "@/lib/database.types";
import {rateLimit} from "@/lib/security";
import {notify} from "@/lib/notifications";
import {cookies,headers} from "next/headers";
import {redirect} from "next/navigation";
import {randomUUID} from "node:crypto";
export async function submitRequest(input:unknown){
 const parsed=requestSchema.safeParse(input);
 if(!parsed.success)return {error:"Vérifiez les champs du formulaire et votre consentement."};
 const {consent,website,submissionKey,...data}=parsed.data;
 let reference:string;
 try{
 const h=await headers();
 const ip=process.env.TRUST_PROXY==="true"?(h.get("x-real-ip")??"unknown"):"shared";
 if(!await rateLimit("submission:"+ip,process.env.TRUST_PROXY==="true"?10:100))return {error:"Trop de demandes. Réessayez dans 15 minutes."};
 const {data:created,error}=await getSupabase().rpc("submit_project_request",{p_request:data,p_submission_key:submissionKey,p_reference:"NJ-"+randomUUID().slice(0,8).toUpperCase()});
 if(error)throw error;
 const request=(created as ProjectRequest[]|null)?.[0];
 if(!request)throw new Error("La demande n’a pas été enregistrée.");
 reference=request.reference;
 if(!request.notificationSentAt)await notify(request.id,reference);
 }catch{return {error:"Le service est momentanément indisponible. Réessayez sans fermer cette page."};}
 (await cookies()).set("nijengee-reference",reference,{httpOnly:true,sameSite:"lax",secure:process.env.NODE_ENV==="production",maxAge:3600,path:"/merci"});
 redirect("/merci");
}
