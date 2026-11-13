"use client";
export default function ErrorPage({reset}:{reset:()=>void}){return <div className="panel"><h1>Un imprévu est survenu.</h1><p>Le service est momentanément indisponible. Vos informations ne sont pas affichées ici.</p><button className="button" onClick={reset}>Réessayer</button></div>}
