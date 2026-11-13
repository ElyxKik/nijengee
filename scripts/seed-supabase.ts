import { hash } from "bcryptjs";
import { createClient } from "@supabase/supabase-js";
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

async function main() {
  const email = process.env.ADMIN_EMAIL?.toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password || password.length < 14) throw new Error("ADMIN_EMAIL et ADMIN_PASSWORD (14 caractères minimum) requis.");

  const url = process.env.SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secretKey) throw new Error("SUPABASE_URL et SUPABASE_SECRET_KEY sont requis.");
  const supabase = createClient(url, secretKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const admin = await supabase.from("AdminUser").upsert(
    { email, passwordHash: await hash(password, 12), active: true },
    { onConflict: "email", ignoreDuplicates: true },
  );
  if (admin.error) throw admin.error;

  if (process.env.SEED_DEMO === "true") {
    const professional = await supabase.from("Professional").upsert({
      id: "demo-professional", name: "Atelier Démo — fictif", specialty: "Architecte", phone: "+243000000000",
      city: "Kinshasa", zones: "Gombe", qualifications: "Données fictives", notes: "Exemple de développement",
    }, { onConflict: "id" });
    if (professional.error) throw professional.error;

    const request = await supabase.from("ProjectRequest").upsert({
      reference: "NJ-DEMO0001", submissionKey: "00000000-0000-4000-8000-000000000001",
      professionalType: "Architecte", workType: "Construction neuve", buildingType: "Maison individuelle",
      city: "Kinshasa", district: "Gombe", budget: "Budget non défini", name: "Client fictif",
      phone: "+243000000000", description: "Projet fictif de développement",
    }, { onConflict: "submissionKey", ignoreDuplicates: true });
    if (request.error) throw request.error;
  }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
