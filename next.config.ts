import type { NextConfig } from "next";
import path from "node:path";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  // Pin Turbopack root so a stray package-lock in C:\Users\equal doesn't
  // confuse module resolution.
  turbopack: {
    root: path.resolve(__dirname),
  },
};

// Wrap so @sentry/nextjs injects instrumentation + the request-error hook.
// Without the wrapper our sentry.*.config.ts files are dead code (they never
// get bundled or executed).
export default withSentryConfig(nextConfig, {
  silent: !process.env.CI,
  disableLogger: true,
});
