import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // This is one package inside a larger monorepo with its own root-level
  // agent guidance; don't let Next.js scaffold a second, conflicting set.
  agentRules: false,
  transpilePackages: ["@flare/ui", "@flare/schemas", "@flare/graph", "@flare/rules"],
  images: {
    // FLARE renders every illustration as inline SVG/CSS — no remote raster
    // images are used, so no remote patterns need to be allow-listed.
    formats: ["image/webp"],
  },
};

export default nextConfig;
