import type { NextConfig } from "next";

// @ts-ignore
const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
    parallelServerCompiles: true,
  },
  async rewrites() {
    return [
      {
        source: "/oauth2/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL || "http://backend:8080"}/oauth2/:path*`,
      },
      {
        source: "/login/oauth2/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL || "http://backend:8080"}/login/oauth2/:path*`,
      },
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL || "http://backend:8080"}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
