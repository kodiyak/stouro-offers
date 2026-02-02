import { withSerwist } from "@serwist/turbopack";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  images: {
    remotePatterns: [new URL("https://avatar.vercel.sh/**")],
  },
  serverExternalPackages: ["@serwist/turbopack", "esbuild-wasm"],
};

export default withSerwist(nextConfig);
