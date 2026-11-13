import {defineConfig,devices} from "@playwright/test";
import {loadEnvConfig} from "@next/env";
loadEnvConfig(process.cwd());
export default defineConfig({
 testDir:"./tests/e2e",workers:1,globalTimeout:240000,timeout:150000,
 use:{actionTimeout:20000,baseURL:"http://localhost:3000",...devices["Desktop Chrome"],channel:"chrome",screenshot:"only-on-failure",trace:"retain-on-failure"},
 webServer:{command:"npm run dev -- --webpack",url:"http://localhost:3000",reuseExistingServer:false,timeout:120000,
 env:{DISABLE_BUILD_CACHE:"true",NODE_OPTIONS:"--experimental-require-module",SUPABASE_URL:process.env.SUPABASE_TEST_URL??"",SUPABASE_SECRET_KEY:process.env.SUPABASE_TEST_SECRET_KEY??"",AUTH_SECRET:"local-e2e-only-not-for-production-123456789",AUTH_URL:"http://localhost:3000",AUTH_TRUST_HOST:"true"}}
});
