import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import {compare} from "bcryptjs";
import {getSupabase} from "@/lib/db";
import type {AdminUser} from "@/lib/database.types";
import {rateLimit} from "@/lib/security";
export const {handlers,auth,signIn,signOut}=NextAuth({
 session:{strategy:"jwt",maxAge:28800},pages:{signIn:"/connexion"},
 providers:[Credentials({credentials:{email:{},password:{}},authorize:async(c)=>{
 if(typeof c.email!=="string"||typeof c.password!=="string"||c.password.length>256)return null;
 const email=c.email.toLowerCase().trim();
 if(!await rateLimit("login:"+email,8))return null;
 const {data,error}=await getSupabase().from("AdminUser").select("id,email,passwordHash,active,createdAt,updatedAt").eq("email",email).maybeSingle();
 if(error)throw error;
 const user=data as AdminUser|null;
 if(!user?.active||!await compare(c.password,user.passwordHash))return null;
 return {id:user.id,email:user.email};
 }})]
});
