import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ARMOR V16: VERCEL SOVEREIGNTY
  // Removed redundant GitHub Pages static export logic.
  // This allows the Next.js API Routes (The Brain) to run in Serverless mode on Vercel.
  outputFileTracingRoot: path.join(__dirname),
  turbopack: {
    root: path.join(__dirname),
  },
  // Ensure we are in standard Next.js mode (not static export) to support AI API routes
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
