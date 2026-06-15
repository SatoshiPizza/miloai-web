/**
 * Client-runtime Sentry init.
 *
 * Next.js auto-loads this file at the top of the client bundle, before any
 * React render happens, so unhandled exceptions during page load are
 * captured. Without it our sentry.client.config.ts would never run.
 */

import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
    environment: process.env.NEXT_PUBLIC_VERCEL_ENV || "local",
    sendDefaultPii: false,
  });
}

// Required by @sentry/nextjs for proper navigation-tracking integration.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
