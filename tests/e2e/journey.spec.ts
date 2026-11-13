import { loadEnvConfig } from "@next/env";
import { createClient } from "@supabase/supabase-js";
import { hash } from "bcryptjs";
import { test, expect } from "@playwright/test";
import { randomUUID } from "node:crypto";

loadEnvConfig(process.cwd());
const testUrl = process.env.SUPABASE_TEST_URL;
const testKey = process.env.SUPABASE_TEST_SECRET_KEY;
if (process.env.SUPABASE_TEST_MODE !== "true" || !testUrl || !testKey) {
  throw new Error("Les tests E2E exigent SUPABASE_TEST_MODE=true et un projet Supabase de test séparé.");
}
const db = createClient(testUrl, testKey, { auth: { persistSession: false } });
const email = `e2e-${randomUUID()}@example.test`, password = "Temporary-e2e-password-123";
let projectId = "", professionalId = "";

test.beforeAll(async () => {
  const admin = await db.from("AdminUser").insert({ email, passwordHash: await hash(password, 12), active: true }).select("id").single();
  if (admin.error) throw admin.error;
});
test.afterAll(async () => {
  if (projectId) await db.from("ProjectRequest").delete().eq("id", projectId);
  if (professionalId) await db.from("Professional").delete().eq("id", professionalId);
  await db.from("AdminUser").delete().eq("email", email);
});

test("mise en relation complète et traitement administrateur", async ({ page }) => {
  await page.goto("/admin", { waitUntil: "domcontentloaded" }); await expect(page).toHaveURL(/connexion/);
  await page.goto("/demande");
  await page.getByRole("radio", { name: /^Architecte/ }).check(); await page.getByRole("button", { name: "Continuer" }).click();
  await page.getByRole("radio", { name: /^Construction neuve/ }).check(); await page.getByRole("button", { name: "Continuer" }).click();
  await page.getByRole("radio", { name: /^Maison individuelle/ }).check(); await page.getByRole("button", { name: "Continuer" }).click();
  await expect(page.getByLabel("Ville", { exact: true })).toHaveValue("Kinshasa");
  await page.getByLabel("Commune", { exact: true }).selectOption("Gombe");
  await page.getByRole("radio", { name: /^Budget non défini/ }).check(); await page.getByRole("button", { name: "Continuer" }).click();
  await page.getByLabel("Nom complet").fill("Client E2E"); await page.getByLabel("Téléphone / WhatsApp").fill("+243812345678");
  await page.getByRole("checkbox").check(); await page.getByRole("button", { name: "Envoyer ma demande" }).click();
  await expect(page).toHaveURL(/merci/, { timeout: 30000 }); await expect(page.locator(".reference")).toContainText("NJ-");
  const savedRequest = await db.from("ProjectRequest").select("id").eq("name", "Client E2E").order("createdAt", { ascending: false }).limit(1).single();
  if (savedRequest.error) throw savedRequest.error; projectId = savedRequest.data.id;

  await page.goto("/connexion"); await page.getByLabel("Email", { exact: true }).fill(email); await page.getByLabel("Mot de passe").fill(password);
  await page.getByRole("button", { name: "Se connecter" }).click(); await expect(page).toHaveURL(/admin$/, { timeout: 30000 });
  await page.getByRole("link", { name: "Professionnels", exact: true }).click(); await page.getByText("+ Ajouter un professionnel").click();
  await page.getByLabel("Nom / raison sociale").fill("Atelier E2E"); await page.getByLabel("Téléphone", { exact: true }).fill("+243812345679");
  await page.getByRole("button", { name: "Enregistrer le professionnel" }).click(); await expect(page.getByText("Atelier E2E · Architecte")).toBeVisible();
  const partner = await db.from("Professional").select("id").eq("name", "Atelier E2E").single();
  if (partner.error) throw partner.error; professionalId = partner.data.id;
  await page.getByRole("link", { name: "Demandes", exact: true }).click();
  await page.getByRole("row").filter({ hasText: "Client E2E" }).getByRole("link").click();
  await page.getByRole("combobox", { name: /^Statut/ }).selectOption("CONTACTED");
  await page.getByLabel("Professionnel assigné").selectOption(professionalId);
  await page.getByLabel("Ajouter une note interne").fill("Contact confirmé E2E");
  await page.getByRole("button", { name: "Enregistrer", exact: true }).click();
  await expect(page.getByText("Note : Contact confirmé E2E")).toBeVisible();
  const request = await db.from("ProjectRequest").select("status,professionalId").eq("id", projectId).single();
  if (request.error) throw request.error; expect(request.data.status).toBe("CONTACTED"); expect(request.data.professionalId).toBe(professionalId);
  await page.getByRole("button", { name: "Déconnexion" }).click(); await page.goto("/admin", { waitUntil: "domcontentloaded" }); await expect(page).toHaveURL(/connexion/);
});

test("accueil mobile sans débordement", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 }); await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: "test-results/accueil-mobile.png", fullPage: true });
});
