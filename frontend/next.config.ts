import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // output: "export", // Disable export for Vercel deployment which supports SSR/API Routes
  images: {
    unoptimized: true,
  },
  experimental: {
    webpackBuildWorker: true,
    parallelServerBuildTraces: false,
    parallelServerCompiles: true,
  },
}

export default nextConfig
