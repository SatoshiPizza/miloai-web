/**
 * Thin fetch wrapper around the Python FastAPI backend.
 *
 * All endpoints live on `${config.apiUrl}/api/...`. We share the same Postgres
 * + same business logic as the Telegram bot — this module is just the HTTP
 * client the Next.js side uses.
 *
 * Auth: once we wire NextAuth, we'll attach a JWT in the Authorization header.
 * For now requests are unauthenticated against the local dev backend.
 */

import { config } from "@/lib/config";
import { getSessionToken } from "@/lib/session";

type FetchOpts = RequestInit & {
  /** Optional bearer token (NextAuth session) attached as `Authorization`. */
  token?: string;
};

export class ApiError extends Error {
  status: number;
  body: unknown;
  constructor(status: number, body: unknown, msg: string) {
    super(msg);
    this.status = status;
    this.body = body;
  }
}

async function request<T>(path: string, opts: FetchOpts = {}): Promise<T> {
  const { token, headers, ...rest } = opts;
  const url = `${config.apiUrl}${path.startsWith("/") ? path : `/${path}`}`;
  // Build headers explicitly so the conditional spreads don't fight TS's
  // type narrowing of HeadersInit.
  const finalHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    // When the backend is exposed via an ngrok free tunnel, ngrok normally
    // shows an interstitial HTML warning to browser User-Agents — which
    // poisons every fetch (HTML, not JSON). Sending this header (any value)
    // bypasses the interstitial. Harmless against a non-ngrok backend.
    "ngrok-skip-browser-warning": "true",
  };
  // Auth precedence:
  //   1. Explicit token passed in opts (rare; back-channel calls).
  //   2. Session JWT from Telegram Login Widget (localStorage).
  //   3. NEXT_PUBLIC_DEV_USER_ID shim — only used when neither of the above
  //      exists. Lets local dev keep working without forcing login.
  const sessionToken = token ?? getSessionToken();
  if (sessionToken) {
    finalHeaders["Authorization"] = `Bearer ${sessionToken}`;
  } else if (config.devUserId) {
    finalHeaders["x-user-id"] = config.devUserId;
  }
  if (headers) {
    Object.assign(finalHeaders, headers as Record<string, string>);
  }
  const res = await fetch(url, {
    ...rest,
    headers: finalHeaders,
    cache: "no-store",
  });

  if (!res.ok) {
    let body: unknown = null;
    try {
      body = await res.json();
    } catch {
      body = await res.text();
    }
    throw new ApiError(res.status, body, `API ${res.status} on ${path}`);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const api = {
  get: <T>(path: string, opts?: FetchOpts) =>
    request<T>(path, { ...opts, method: "GET" }),
  post: <T>(path: string, body?: unknown, opts?: FetchOpts) =>
    request<T>(path, {
      ...opts,
      method: "POST",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
  patch: <T>(path: string, body?: unknown, opts?: FetchOpts) =>
    request<T>(path, {
      ...opts,
      method: "PATCH",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
  del: <T>(path: string, opts?: FetchOpts) =>
    request<T>(path, { ...opts, method: "DELETE" }),
};
