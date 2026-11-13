import { spawnSync } from "node:child_process";

if (process.env.VERCEL_ENV === "production") {
  console.log("Initializing the Nijengee administrator from production environment variables…");
  const seed = spawnSync("npm", ["run", "db:seed"], { stdio: "inherit" });
  if (seed.error) throw seed.error;
  if (seed.status !== 0) process.exit(seed.status ?? 1);
}

const result = spawnSync("npx", ["next", "build", "--webpack"], { stdio: "inherit" });
if (result.error) throw result.error;
process.exit(result.status ?? 1);
