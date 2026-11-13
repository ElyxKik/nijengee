import {getSupabase} from "./db";
export async function notify(id:string,reference:string){
 if(!process.env.RESEND_API_KEY)return;
 try{
 const response=await fetch("https://api.resend.com/emails",{method:"POST",headers:{Authorization:`Bearer ${process.env.RESEND_API_KEY}`,"Content-Type":"application/json","Idempotency-Key":id},body:JSON.stringify({from:process.env.MAIL_FROM,to:[process.env.ADMIN_EMAIL],subject:`Nouvelle demande Nijengee · ${reference}`,text:`Une nouvelle demande est disponible dans votre espace administrateur : ${process.env.AUTH_URL}/admin`}),signal:AbortSignal.timeout(8000)});
 if(response.ok){const {error}=await getSupabase().from("ProjectRequest").update({notificationSentAt:new Date().toISOString(),updatedAt:new Date().toISOString()}).eq("id",id);if(error)throw error;}
 }catch{ /* Pending notifications can be retried from the admin dashboard. */ }
}
