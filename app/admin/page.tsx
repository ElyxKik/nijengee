import {getSupabase} from "@/lib/db";
import {requireAdmin} from "@/lib/admin";
import {statuses} from "@/lib/validation";
import type {ProjectRequest,RequestStatus} from "@/lib/database.types";
import Link from "next/link";
import {retryNotifications} from "./actions";
export default async function Admin({searchParams}:{searchParams:Promise<Record<string,string|undefined>>}){
 await requireAdmin();const p=await searchParams;
 const client=getSupabase();
 const status=p.status&&p.status in statuses?p.status as RequestStatus:undefined;
 const page=Math.max(1,Number(p.page)||1);
 let listQuery=client.from("ProjectRequest").select("*").order("createdAt",{ascending:false}).range((page-1)*30,page*30-1);
 let filteredQuery=client.from("ProjectRequest").select("id",{count:"exact",head:true});
 for(const query of [listQuery,filteredQuery]){
  if(p.city)query.ilike("city",`%${p.city}%`);
  if(p.district)query.ilike("district",`%${p.district}%`);
  if(p.workType)query.ilike("workType",`%${p.workType}%`);
  if(status)query.eq("status",status);
 }
 const [requestsResult,totalResult,newResult,activeResult,filteredResult,pendingResult]=await Promise.all([
  listQuery,client.from("ProjectRequest").select("id",{count:"exact",head:true}),
  client.from("ProjectRequest").select("id",{count:"exact",head:true}).eq("status","NEW"),
  client.from("ProjectRequest").select("id",{count:"exact",head:true}).eq("status","IN_PROGRESS"),
  filteredQuery,client.from("ProjectRequest").select("id",{count:"exact",head:true}).is("notificationSentAt",null),
 ]);
 for(const result of [requestsResult,totalResult,newResult,activeResult,filteredResult,pendingResult])if(result.error)throw result.error;
 const requests=(requestsResult.data??[]) as ProjectRequest[];
 const total=totalResult.count??0,newCount=newResult.count??0,active=activeResult.count??0,filtered=filteredResult.count??0,pending=pendingResult.count??0;
 const next=new URLSearchParams(Object.entries(p).filter((entry):entry is [string,string]=>typeof entry[1]==="string"));next.set("page",String(page+1));
 return <><h1>Vos projets, en un regard.</h1><div className="stats"><div><strong>{total}</strong>Demandes reçues</div><div><strong>{newCount}</strong>Nouvelles demandes</div><div><strong>{active}</strong>En cours</div></div>{pending>0&&<form action={retryNotifications}><p>{pending} notification(s) en attente</p><button className="button outline">Réessayer les notifications</button></form>}<form className="filters">{[["city","Ville"],["district","Commune"],["workType","Type de projet"]].map(([key,label])=><label key={key}>{label}<input name={key} defaultValue={p[key]}/></label>)}<label>Statut<select name="status" defaultValue={p.status}><option value="">Tous</option>{Object.entries(statuses).map(([k,v])=><option value={k} key={k}>{v}</option>)}</select></label><button className="button">Filtrer</button><Link href="/admin">Réinitialiser</Link></form><div className="table-wrap"><table><thead><tr><th>Référence</th><th>Client</th><th>Projet</th><th>Localisation</th><th>Statut</th></tr></thead><tbody>{requests.map(r=><tr key={r.id}><td><Link className="text-link" href={"/admin/requests/"+r.id}>{r.reference} ↗</Link></td><td>{r.name}</td><td>{r.workType}</td><td>{r.city} · {r.district}</td><td><span className="badge">{statuses[r.status]}</span></td></tr>)}</tbody></table></div>{!requests.length&&<p>Aucune demande pour le moment.</p>}<p>{filtered} résultat(s) · Page {page}</p>{page*30<filtered&&<Link className="button" href={"/admin?"+next.toString()}>Page suivante</Link>}</>;
}
