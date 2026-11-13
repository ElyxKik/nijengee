# Nijengee

MVP de mise en relation pour les projets de construction à Kinshasa. Next.js App Router, TypeScript, Tailwind CSS, Motion, Lucide, Supabase (PostgreSQL + Data API), Auth.js et Zod.

## Installation locale

Node.js 22.12+ est requis. Copier `.env.example` en `.env`, puis renseigner `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `AUTH_SECRET`, `ADMIN_EMAIL` et `ADMIN_PASSWORD`. La clé secrète Supabase est réservée au serveur et ne doit jamais commencer par `NEXT_PUBLIC_`.

```sh
npm ci
cp .env.example .env
npx supabase login
npx supabase link --project-ref <reference-du-projet>
npm run db:migrate
npm run db:seed
npm run dev
```

Les migrations créent les tables, les règles RLS et les fonctions atomiques nécessaires. Le seed crée le compte administrateur sans remplacer son mot de passe si le compte existe. Les données fictives sont créées uniquement avec `SEED_DEMO=true`; ne pas activer en production.

Générer `AUTH_SECRET` avec `openssl rand -base64 32`. Le mot de passe administrateur doit compter au moins 14 caractères. L’admin utilise Auth.js et les comptes/hachages restent dans Supabase Postgres. Aucun compte client n’est requis.

## Déploiement Vercel

1. Configurer dans Vercel les variables `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `AUTH_SECRET`, `AUTH_TRUST_HOST=true`, `AUTH_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` et `SEED_DEMO=false`.
2. Lancer `npm run db:migrate` depuis un poste où le Supabase CLI est connecté au projet, avant le premier déploiement et après chaque nouvelle migration.
3. Déployer l’application sur Vercel. Vercel compile Next.js ; les migrations sont gérées séparément par le CLI Supabase.
4. Initialiser l’administrateur une fois depuis l’environnement configuré : `npm run db:seed`. Supprimer ensuite `ADMIN_PASSWORD` des environnements Vercel si elle n’est plus nécessaire.
5. Configurer `RESEND_API_KEY` et `MAIL_FROM` pour les emails. Sans Resend, les demandes sont conservées et les notifications restent relançables dans l’administration.

Pour les Preview, créer un projet Supabase de test séparé. Ne jamais pointer les builds Preview vers la base Production.

## Ping quotidien du projet gratuit

Le workflow `.github/workflows/supabase-daily-heartbeat.yml` effectue une lecture quotidienne d’une ligne technique sans données personnelles. La table `heartbeat` n’autorise que cette lecture publique. Après avoir poussé le dépôt vers GitHub, définir les variables de dépôt `SUPABASE_URL` et `SUPABASE_PUBLISHABLE_KEY`, puis activer GitHub Actions. Le workflow peut aussi être lancé manuellement.

Ce ping est une vérification de santé et génère une petite activité. Supabase indique que les projets gratuits avec activité trop faible sur sept jours peuvent être mis en pause et que quelques requêtes quotidiennes peuvent aider, sans garantie. Un ping unique par jour ne garantit donc pas l’absence de pause; le plan payant est le seul moyen indiqué par Supabase pour éviter la pause automatique.

Lancer localement `npm run supabase:ping` après avoir défini `SUPABASE_URL` et `SUPABASE_PUBLISHABLE_KEY`. La clé publishable ne donne accès qu’à la ligne `heartbeat` grâce à sa policy RLS; elle ne donne pas accès aux demandes.

## Sécurité et fonctionnement

- Les accès aux demandes, professionnels, administrateurs et quotas passent par le client Supabase côté serveur.
- `SUPABASE_SECRET_KEY` n’est importée que depuis des modules serveur. Elle contourne RLS et ne doit jamais fuiter dans le navigateur.
- RLS est activé sur toutes les tables métier. Les rôles `anon` et `authenticated` n’ont aucun accès à ces tables; seul le rôle serveur accède aux données métier.
- La limitation des tentatives est atomique via une fonction PostgreSQL.
- L’enregistrement d’une demande avec son activité initiale est transactionnel et idempotent via une fonction PostgreSQL.
- Les transitions de statut, affectations et notes sont journalisées dans une transaction PostgreSQL.
- La référence de confirmation passe par un cookie HttpOnly. Aucune API publique ne retourne les données personnelles.
- Les justificatifs sont stockés sous forme textuelle; aucun téléversement de fichier.

## Tests

```sh
npm test
npm run build
```

Les tests d’intégration/E2E destructifs nécessitent un projet Supabase de test distinct, des variables `SUPABASE_TEST_URL` et `SUPABASE_TEST_SECRET_KEY`, ainsi que `SUPABASE_TEST_MODE=true`. Ne jamais utiliser une base contenant des données réelles.

## Organisation

- `app/` : site public, formulaire, administration et Auth.js.
- `lib/` : client Supabase serveur, validation, autorisation, quotas et notifications.
- `supabase/migrations/` : schéma SQL, policies RLS et fonctions.
- `scripts/` : seed administrateur et ping quotidien.
- `tests/` : validation et recettes automatisées.

Compléter les pages confidentialité et conditions avec les coordonnées légales et la durée de conservation avant ouverture publique.
