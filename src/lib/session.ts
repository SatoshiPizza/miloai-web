/**
 * Browser-side session storage for the JWT issued by Telegram Login.
 *
 * Token lives in localStorage so it survives page reloads. Once NextAuth
 * lands we'll swap this for httpOnly cookies (better security, no XSS
 * exposure). Until then, the trade-off is: simple integration with the
 * existing fetch wrapper, at the cost of being readable from JS.
 *
 * Helpers:
 *   getSessionToken()         — read raw JWT, or null
 *   getSessionClaims()        — decode payload (no signature check — UI hint only)
 *   saveSession({ token, ... }) — persist after /api/auth/telegram-login
 *   clearSession()            — log out
 */

const TOKEN_KEY = "miloai.session.token";
const USER_KEY = "miloai.session.user";

export type SessionUser = {
  user_id: number;
  telegram_id: number;
  first_name: string | null;
  username: string | null;
};

export function getSessionToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function getSessionUser(): SessionUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
}

/** Convenience — pulls `sub` out of the JWT payload. Doesn't verify signature. */
export function getSessionUserId(): number | null {
  const tok = getSessionToken();
  if (!tok) return null;
  try {
    const payload = JSON.parse(
      typeof atob === "function"
        ? atob(tok.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
        : Buffer.from(tok.split(".")[1], "base64").toString()
    ) as { sub?: string; exp?: number };
    if (payload.exp && Date.now() / 1000 > payload.exp) return null;
    return payload.sub ? Number(payload.sub) : null;
  } catch {
    return null;
  }
}

export function saveSession(payload: {
  token: string;
  user_id: number;
  telegram_id: number;
  first_name: string | null;
  username: string | null;
}): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOKEN_KEY, payload.token);
  window.localStorage.setItem(
    USER_KEY,
    JSON.stringify({
      user_id: payload.user_id,
      telegram_id: payload.telegram_id,
      first_name: payload.first_name,
      username: payload.username,
    } satisfies SessionUser)
  );
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
}
