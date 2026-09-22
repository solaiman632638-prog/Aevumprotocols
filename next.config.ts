import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    // The dose-matching planner was retired; daily guidance lives on Today.
    return [{ source: "/plan/:path*", destination: "/today", permanent: true }];
  },
};

export default nextConfig;
