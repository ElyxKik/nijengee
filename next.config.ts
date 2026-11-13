import type { NextConfig } from "next";
const config: NextConfig = {output:process.env.VERCEL?undefined:"standalone", webpack(config) { if(process.env.DISABLE_BUILD_CACHE === "true") config.cache=false; return config; }};
export default config;
