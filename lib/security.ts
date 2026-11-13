import {createHmac} from "node:crypto";
import {getSupabase} from "./db";
export async function rateLimit(value:string,limit:number){
 const key=createHmac("sha256",process.env.AUTH_SECRET!).update(value).digest("hex");
 const {data,error}=await getSupabase().rpc("check_rate_limit",{p_key:key,p_limit:limit});
 if(error)throw error;
 return data===true;
}
