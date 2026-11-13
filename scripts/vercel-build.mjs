import { spawnSync } from "node:child_process";

const result = spawnSync("npx", ["next", "build", "--webpack"], { stdio: "inherit" });
if (result.error) throw result.error;
process.exit(result.status ?? 1);
