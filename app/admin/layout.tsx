import {requireAdmin} from "@/lib/admin";
import {signOut} from "@/auth";
import Link from "next/link";
export const dynamic="force-dynamic";
export default async function Layout({children}:{children:React.ReactNode}){await requireAdmin();return <div className="admin"><nav className="admin-nav"><Link href="/admin">Demandes</Link><Link href="/admin/professionnels">Professionnels</Link><form action={async()=>{"use server";await signOut({redirectTo:"/connexion"});}}><button className="button outline">Déconnexion</button></form></nav>{children}</div>}
