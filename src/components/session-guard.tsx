"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getSessionToken } from "@/lib/session";
import { config } from "@/lib/config";

/**
 * Client-side route guard for the dashboard.
 *
 * - If a session JWT is in localStorage → render children.
 * - Else if NEXT_PUBLIC_DEV_USER_ID is set (local dev) → render children,
 *   the api wrapper falls back to x-user-id.
 * - Else → redirect to /login?next=<current-path>.
 *
 * Until we move the token into an httpOnly cookie this can't run on the
 * server, which means a brief flash before redirect. Acceptable for MVP.
 */

export function SessionGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const hasToken = !!getSessionToken();
    const hasDevShim = !!config.devUserId;
    if (!hasToken && !hasDevShim) {
      const next = encodeURIComponent(pathname || "/dashboard");
      router.replace(`/login?next=${next}`);
      return;
    }
    setChecked(true);
  }, [router, pathname]);

  if (!checked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="text-[12px] text-[var(--ink-subtle)] font-mono">…</div>
      </div>
    );
  }
  return <>{children}</>;
}
