import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@flare/ui", "@flare/schemas", "@flare/graph", "@flare/rules"],
  images: {
    // FLARE renders every illustration as inline SVG/CSS — no remote raster
    // images are used, so no remote patterns need to be allow-listed.
    formats: ["image/webp"],
  },
};

export default nextConfig;
