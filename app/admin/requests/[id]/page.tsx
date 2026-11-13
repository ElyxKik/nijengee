import {getSupabase} from "@/lib/db";
import {requireAdmin} from "@/lib/admin";
import {notFound} from "next/navigation";
import {statuses} from "@/lib/validation";
import {RequestEditor} from "@/components/request-editor";
import type {AdminUser,Professional,ProjectRequest,RequestActivity} from "@/lib/database.types";
export default async function Detail({params}:{params:Promise<{id:string}>}){
 await requireAdmin();const {id}=await params;
 const client=getSupabase();
 const [requestResult,activityResult,professionalResult]=await Promise.all([
  client.from("ProjectRequest").select("*").eq("id",id).maybeSingle(),
  client.from("RequestActivity").select("*").eq("requestId",id).order("createdAt",{ascending:false}),
  client.from("Professional").select("*").order("name",{ascending:true}),
 ]);
 for(const result of [requestResult,activityResult,professionalResult])if(result.error)throw result.error;
 const r=requestResult.data as ProjectRequest|null;if(!r)notFound();
 const activities=(activityResult.data??[]) as RequestActivity[];
 const adminIds=[...new Set(activities.map(a=>a.adminId).filter((value):value is string=>Boolean(value)))];
 const {data:adminData,error:adminError}=adminIds.length?await client.from("AdminUser").select("id,email").in("id",adminIds):{data:[],error:null};
 if(adminError)throw adminError;
 const adminById=new Map(((adminData??[]) as Pick<AdminUser,"id"|"email">[]).map(admin=>[admin.id,admin.email]));
 const professionals=(professionalResult.data??[]) as Professional[];
 return <><h1>{r.reference}</h1><div className="panel"><h2>{r.name}</h2><p>{r.professionalType} · {r.workType} · {r.buildingType}</p><p>{r.city}, {r.district}<br/>Budget : {r.budget}</p><p style={{whiteSpace:"pre-wrap"}}>{r.description||"Aucune précision complémentaire."}</p><div className="actions"><a className="button" href={"tel:"+r.phone.replace(/[^+0-9]/g,"")}>Appeler {r.phone}</a><a className="button outline" href={"https://wa.me/"+r.phone.replace(/\D/g,"")} target="_blank" rel="noreferrer">WhatsApp ↗</a></div><p>Reçue le {new Date(r.createdAt).toLocaleString("fr-FR",{timeZone:"Africa/Kinshasa"})}</p><RequestEditor id={id} status={r.status} professionalId={r.professionalId} professionals={professionals.map(({id,name,specialty,verified,available})=>({id,name,specialty,verified,available}))}/></div><h2>Historique</h2>{activities.map(a=><div key={a.id}><small>{new Date(a.createdAt).toLocaleString("fr-FR",{timeZone:"Africa/Kinshasa"})} · {(a.adminId&&adminById.get(a.adminId))||"Système"}</small><p style={{whiteSpace:"pre-wrap"}}>{a.message}</p></div>)}</>;
}
