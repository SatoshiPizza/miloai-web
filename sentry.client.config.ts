/**
 * Sentry client-side config.
 *
 * Auto-initialises when NEXT_PUBLIC_SENTRY_DSN is present. Without the DSN
 * Sentry's SDK quietly no-ops, so dev / preview deploys without it are
 * fine. Set NEXT_PUBLIC_SENTRY_DSN in Vercel project env once a project
 * is created at https://sentry.io.
 *
 * Sample rates kept low (10% perf trace) to stay inside the 5k events/mo
 * free tier — enough for our SMB user volume; bump when we cross 100
 * paying customers.
 */
import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: 0.1,
    // Don't replay sessions by default — Sessions ($) eat the free tier
    // and aren't needed for the kind of bugs we hit at this stage.
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
    environment: process.env.NEXT_PUBLIC_VERCEL_ENV || "local",
    // Strip URLs from breadcrumbs / events. We don't want the OAuth state
    // token or business names leaving the wire.
    sendDefaultPii: false,
  });
}
