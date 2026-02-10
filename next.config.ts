import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prisma with custom output needs serverExternalPackages
  serverExternalPackages: ["@prisma/client-runtime-utils"],
};

export default nextConfig;
