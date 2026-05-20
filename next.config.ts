import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Pin Turbopack root so a stray package-lock in C:\Users\equal doesn't
  // confuse module resolution.
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
