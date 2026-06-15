/**
 * Next.js instrumentation hook — server + edge runtime Sentry init.
 *
 * Routes to sentry.server.config.ts and sentry.edge.config.ts depending on
 * NEXT_RUNTIME ("nodejs" | "edge"). Required for @sentry/nextjs >= 8 so
 * that server-side captures actually flow into the SDK.
 *
 * Also re-exports onRequestError so route handlers report failures
 * automatically.
 */

import * as Sentry from "@sentry/nextjs";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

export const onRequestError = Sentry.captureRequestError;
