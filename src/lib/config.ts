/**
 * Env-derived runtime config.
 *
 * Keep server-only secrets out of NEXT_PUBLIC_*. Anything imported into a
 * client component leaks to the browser bundle.
 */

export const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000",
  telegramBotUsername:
    process.env.TELEGRAM_BOT_USERNAME ?? "miloailevbot",
  // Public — safe to read in client components.
  pusherKey: process.env.NEXT_PUBLIC_PUSHER_KEY ?? "",
  pusherCluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER ?? "eu",
} as const;
