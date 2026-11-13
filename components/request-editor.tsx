"use client";
import {useEffect,useState,useTransition} from "react";
import {updateRequest} from "@/app/admin/actions";
import {statuses} from "@/lib/validation";
export function RequestEditor({id,status,professionalId,professionals}:{id:string;status:keyof typeof statuses;professionalId:string|null;professionals:{id:string;name:string;specialty:string;verified:boolean;available:boolean}[]}){
 const [ready,setReady]=useState(false),[current,setCurrent]=useState(status),[partner,setPartner]=useState(professionalId||""),[note,setNote]=useState(""),[message,setMessage]=useState(""),[pending,start]=useTransition();
 useEffect(()=>setReady(true),[]);
 return <form onSubmit={event=>{event.preventDefault();const data=new FormData(event.currentTarget);setMessage("");start(async()=>{try{await updateRequest(data);setNote("");setMessage("Modifications enregistrées.");}catch{setMessage("Enregistrement impossible. Réessayez.");}});}}>
 <input type="hidden" name="id" value={id}/>
 <fieldset disabled={!ready||pending} style={{border:0,padding:0,margin:0}}>
 <label htmlFor="request-status">Statut</label><select id="request-status" name="status" value={current} onChange={e=>setCurrent(e.target.value as keyof typeof statuses)}>{Object.entries(statuses).map(([key,label])=><option key={key} value={key}>{label}</option>)}</select>
 <label htmlFor="request-partner">Professionnel assigné</label><select id="request-partner" name="professionalId" value={partner} onChange={e=>setPartner(e.target.value)}><option value="">Non assigné</option>{professionals.map(p=><option key={p.id} value={p.id}>{p.name} · {p.specialty} {p.verified?"✓":""} {p.available?"":"(indisponible)"}</option>)}</select>
 <label htmlFor="request-note">Ajouter une note interne</label><textarea id="request-note" name="note" maxLength={3000} value={note} onChange={e=>setNote(e.target.value)}/>
 <button className="button" style={{marginTop:20}}>{pending?"Enregistrement…":"Enregistrer"}</button>
 </fieldset>{message&&<p role="status">{message}</p>}
 </form>;
}
