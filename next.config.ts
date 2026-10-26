import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    // The dose-matching planner was retired; daily guidance lives on Today.
    return [
      { source: "/plan/:path*", destination: "/today", permanent: true },
      // The protocol register merged into the compound library.
      { source: "/protocols", destination: "/peptides", permanent: true },
      { source: "/protocols/:slug", destination: "/peptides/:slug", permanent: true },
      // Device sync was removed; Today is the only daily surface.
      { source: "/monitor", destination: "/today", permanent: false },
      // Guides folded into the calculator (mixing, storage) and compound pages.
      { source: "/guides", destination: "/calculator#mixing", permanent: true },
      { source: "/guides/reconstitution", destination: "/calculator#mixing", permanent: true },
      { source: "/guides/storage", destination: "/calculator#storage", permanent: true },
    ];
  },
};

export default nextConfig;
