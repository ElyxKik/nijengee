import {auth} from "@/auth";
import {getSupabase} from "./db";
import type {AdminUser} from "./database.types";
import {redirect} from "next/navigation";
export async function requireAdmin(){
 const session=await auth();
 if(!session?.user?.email)redirect("/connexion");
 const {data,error}=await getSupabase().from("AdminUser").select("id,email,passwordHash,active,createdAt,updatedAt").eq("email",session.user.email).maybeSingle();
 if(error)throw error;
 const user=data as AdminUser|null;
 if(!user?.active)redirect("/connexion");
 return user;
}
