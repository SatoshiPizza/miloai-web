/**
 * Env-derived runtime config.
 *
 * Keep server-only secrets out of NEXT_PUBLIC_*. Anything imported into a
 * client component leaks to the browser bundle.
 */

// Resolve the API URL. Empty string falls through to the fallback (the `??`
// operator only catches null/undefined, so empty env vars would otherwise
// produce a relative URL like "/api/web/me" against the hosting domain).
function resolveApiUrl(): string {
  const v = process.env.NEXT_PUBLIC_API_URL;
  if (v && v.trim()) return v.trim();
  return "http://localhost:8000";
}

export const config = {
  apiUrl: resolveApiUrl(),
  telegramBotUsername:
    process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || "miloailevbot",
  devUserId: process.env.NEXT_PUBLIC_DEV_USER_ID || "",
  pusherKey: process.env.NEXT_PUBLIC_PUSHER_KEY || "",
  pusherCluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "eu",
} as const;
