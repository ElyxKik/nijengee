import { loadEnvConfig } from "@next/env";
import { createClient } from "@supabase/supabase-js";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";

loadEnvConfig(process.cwd());
if (process.env.SUPABASE_TEST_MODE !== "true") throw new Error("Refus : activez SUPABASE_TEST_MODE et renseignez une base Supabase réservée aux tests.");
if (!process.env.SUPABASE_TEST_URL || !process.env.SUPABASE_TEST_SECRET_KEY) throw new Error("SUPABASE_TEST_URL et SUPABASE_TEST_SECRET_KEY sont requis.");
const supabase = createClient(process.env.SUPABASE_TEST_URL!, process.env.SUPABASE_TEST_SECRET_KEY!, { auth: { persistSession: false } });

async function main() {
  const key = randomUUID();
  const values = { professionalType: "Architecte", workType: "Construction neuve", buildingType: "Maison individuelle", city: "Kinshasa", district: "Gombe", budget: "Budget non défini", name: "Test temporaire", phone: "+243000000000", description: "" };
  const { data: first, error: firstError } = await supabase.rpc("submit_project_request", { p_request: values, p_submission_key: key, p_reference: `TEST-${key}` });
  if (firstError) throw firstError;
  const row = first?.[0];
  assert.ok(row?.id);
  try {
    assert.equal(row.status, "NEW");
    const { data: duplicate, error: duplicateError } = await supabase.rpc("submit_project_request", { p_request: values, p_submission_key: key, p_reference: `OTHER-${key}` });
    if (duplicateError) throw duplicateError;
    assert.equal(duplicate?.[0]?.id, row.id);
    const { error: updateError } = await supabase.rpc("update_project_request", { p_id: row.id, p_status: "CONTACTED", p_professional_id: "", p_admin_id: null, p_note: "Test de contact" });
    if (updateError) throw updateError;
    const { data: saved, error: savedError } = await supabase.from("ProjectRequest").select("status").eq("id", row.id).single();
    if (savedError) throw savedError;
    const { data: activities, error: activityError } = await supabase.from("RequestActivity").select("id").eq("requestId", row.id);
    if (activityError) throw activityError;
    assert.equal(saved.status, "CONTACTED");
    assert.equal(activities?.length, 2);
    console.log("Supabase : création, idempotence, statut et historique validés.");
  } finally {
    const { error } = await supabase.from("ProjectRequest").delete().eq("id", row.id);
    if (error) throw error;
  }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
