import path from "node:path";
import type { NextConfig } from "next";

const isGitHubPagesBuild = process.env.GITHUB_ACTIONS === "true";
const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "";
const basePath =
  isGitHubPagesBuild && repositoryName ? `/${repositoryName}` : "";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  turbopack: {
    root: path.join(__dirname),
  },
  ...(isGitHubPagesBuild
    ? {
        output: "export",
        trailingSlash: true,
        images: {
          unoptimized: true,
        },
        basePath,
        assetPrefix: basePath,
      }
    : {}),
};

export default nextConfig;
