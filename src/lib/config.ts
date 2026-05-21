/**
 * Env-derived runtime config.
 *
 * Keep server-only secrets out of NEXT_PUBLIC_*. Anything imported into a
 * client component leaks to the browser bundle.
 */

export const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000",
  telegramBotUsername:
    process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME ?? "miloailevbot",
  // DEV-ONLY: until NextAuth is wired, every API call goes out with
  // x-user-id pointing at a real `users.id`. Set in .env.local.
  devUserId: process.env.NEXT_PUBLIC_DEV_USER_ID ?? "",
  // Public — safe to read in client components.
  pusherKey: process.env.NEXT_PUBLIC_PUSHER_KEY ?? "",
  pusherCluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER ?? "eu",
} as const;
