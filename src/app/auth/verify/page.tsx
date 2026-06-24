"use client";

/**
 * Magic-link landing page.
 *
 * The link in the email points here with a `?token=…` query param. We
 * forward that token to the backend's `/api/auth/email/verify`, get a
 * session JWT, persist it, and bounce to /dashboard.
 *
 * Rendered as a full-bleed dark hero (matches the global error page so
 * the user never feels like they've fallen off the brand). Shows three
 * possible states: verifying / error / (never seen — instant redirect on
 * success).
 */

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Sparkles, AlertTriangle, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { saveSession } from "@/lib/session";

type VerifyResponse = {
  token: string;
  user_id: number;
  email: string;
  first_name: string | null;
};

function VerifyInner() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token");
  const [state, setState] = useState<"working" | "error">("working");
  const [errorMsg, setErrorMsg] = useState<string>("");

  useEffect(() => {
    if (!token) {
      setErrorMsg("В ссылке нет токена. Открой её из письма заново.");
      setState("error");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await api.post<VerifyResponse>(
          "/api/auth/email/verify",
          { token }
        );
        if (cancelled) return;
        saveSession({
          token: res.token,
          user_id: res.user_id,
          telegram_id: 0,
          first_name: res.first_name,
          username: null,
          email: res.email,
        });
        router.replace("/dashboard");
      } catch (err: unknown) {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : "Ссылка недействительна или истекла.";
        setErrorMsg(msg);
        setState("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, router]);

  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-16 text-[var(--hero-cream)]"
      style={{ background: "var(--hero-bg)" }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 -top-40 size-[600px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(232,149,108,0.18) 0%, transparent 62%)",
        }}
      />
      <div className="relative w-full max-w-[520px] text-center">
        {state === "working" ? (
          <>
            <div
              className="mx-auto mb-5 flex size-14 items-center justify-center rounded-[14px]"
              style={{
                background: "var(--hero-peach-wash)",
                border: "1px solid var(--hero-peach-border)",
              }}
            >
              <Loader2
                className="size-7 animate-spin"
                style={{ color: "var(--peach)" }}
                strokeWidth={1.8}
              />
            </div>
            <h1
              className="font-heading text-[34px] sm:text-[42px] font-bold leading-[1.1] tracking-[-0.03em]"
              style={{ color: "var(--hero-cream)" }}
            >
              Заходим{" "}
              <em
                className="not-italic italic"
                style={{ color: "var(--peach)" }}
              >
                в UniAds
              </em>
              …
            </h1>
            <p
              className="mx-auto mt-4 max-w-[420px] text-[14.5px] leading-relaxed"
              style={{ color: "var(--hero-cream-65)" }}
            >
              Проверяем твою magic-ссылку. Это занимает пару секунд — потом сразу попадёшь на дашборд.
            </p>
          </>
        ) : (
          <>
            <div
              className="mx-auto mb-5 flex size-14 items-center justify-center rounded-[14px]"
              style={{
                background: "var(--hero-peach-wash)",
                border: "1px solid var(--hero-peach-border)",
              }}
            >
              <AlertTriangle
                className="size-7"
                style={{ color: "var(--peach)" }}
                strokeWidth={1.6}
              />
            </div>
            <h1
              className="font-heading text-[34px] sm:text-[42px] font-bold leading-[1.1] tracking-[-0.03em]"
              style={{ color: "var(--hero-cream)" }}
            >
              Ссылка не{" "}
              <em
                className="not-italic italic"
                style={{ color: "var(--peach)" }}
              >
                сработала
              </em>
            </h1>
            <p
              className="mx-auto mt-4 max-w-[420px] text-[14.5px] leading-relaxed"
              style={{ color: "var(--hero-cream-65)" }}
            >
              {errorMsg || "Magic-ссылки живут 15 минут и работают один раз. Попроси новую — снова придёт за пару секунд."}
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/#auth"
                className="inline-flex items-center gap-2 rounded-[10px] px-5 py-2.5 text-[13.5px] font-medium text-white transition-opacity hover:opacity-90"
                style={{
                  background: "var(--peach)",
                  boxShadow: "0 6px 18px -6px rgba(232,149,108,0.55)",
                }}
              >
                <Sparkles className="size-[14px]" strokeWidth={2} />
                Попросить новую ссылку
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyPage() {
  // useSearchParams() requires Suspense in app-router pages. The fallback
  // is the same "working" frame so there's no visual jump.
  return (
    <Suspense
      fallback={
        <div
          className="flex min-h-screen items-center justify-center"
          style={{ background: "var(--hero-bg)" }}
        >
          <Loader2 className="size-8 animate-spin text-[var(--peach)]" />
        </div>
      }
    >
      <VerifyInner />
    </Suspense>
  );
}
