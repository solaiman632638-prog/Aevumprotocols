import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    // The dose-matching planner was retired; daily guidance lives on Today.
    return [
      { source: "/plan/:path*", destination: "/today", permanent: true },
      // The protocol register merged into the compound library.
      { source: "/protocols", destination: "/peptides", permanent: true },
      { source: "/protocols/:slug", destination: "/peptides/:slug", permanent: true },
    ];
  },
};

export default nextConfig;
