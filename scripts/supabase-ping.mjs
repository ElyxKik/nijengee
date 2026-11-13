import { createClient } from "@supabase/supabase-js";
import nextEnv from "@next/env";

nextEnv.loadEnvConfig(process.cwd());

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_PUBLISHABLE_KEY;
if (!url || !key) throw new Error("SUPABASE_URL et SUPABASE_PUBLISHABLE_KEY sont requis.");

const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
});
const { error } = await supabase.from("heartbeat").select("id").eq("id", 1).single();
if (error?.code === "PGRST205") throw new Error("La table heartbeat n’existe pas encore. Applique d’abord supabase/migrations/202611120001_initial.sql dans Supabase > SQL Editor.");
if (error) throw error;
console.log("Supabase heartbeat OK");
