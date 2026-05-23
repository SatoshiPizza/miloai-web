import { NextRequest, NextResponse } from "next/server";

/**
 * Route guard.
 *
 * Anything inside the (dashboard) group requires a session JWT. We can't
 * read localStorage from middleware (it's server-side), so we sniff for a
 * `miloai_session` cookie OR just let the page-level guard handle it.
 *
 * Strategy: middleware does NOTHING for now — the actual gate is the
 * `getSessionToken()` check inside the dashboard layout. The middleware is
 * here as a stub so we can add cookie-based gating later without touching
 * page code.
 *
 * Public routes (no auth required): /login, /_next/*, /api/*, static assets.
 */

const PUBLIC = ["/login", "/_next", "/favicon", "/api"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (PUBLIC.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }
  // Until we move the JWT into a cookie, gating happens in the layout.
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
