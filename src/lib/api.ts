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
  const res = await fetch(url, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
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
