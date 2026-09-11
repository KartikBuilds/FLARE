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
  async headers() {
    // Baseline headers, cheap regardless of deployment shape — see
    // SECURITY.md. HSTS is deliberately omitted: it only makes sense once
    // this is actually served over HTTPS.
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "no-referrer" },
        ],
      },
    ];
  },
};

export default nextConfig;
