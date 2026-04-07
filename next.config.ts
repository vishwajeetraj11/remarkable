import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  experimental: {
    inlineCss: true,
    optimizePackageImports: ["@base-ui/react", "class-variance-authority"],
  },
};

export default nextConfig;
