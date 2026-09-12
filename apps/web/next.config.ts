import type { NextConfig } from "next";
import { loadEnvConfig } from "@next/env";
import { resolve } from "node:path";

// Single project env: load from monorepo root
loadEnvConfig(resolve(__dirname, "../.."));

const nextConfig: NextConfig = {
  reactStrictMode: true,
};

export default nextConfig;
