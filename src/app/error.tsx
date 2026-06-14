"use client";

/**
 * Global error boundary — catches uncaught exceptions in the React tree.
 *
 * Next.js wires this automatically. We keep it minimal: peach disc, plain
 * message, retry button. The error.digest comes through in production
 * builds for cross-referencing the server-side log without exposing the
 * raw stack to the user.
 *
 * Sentry capture is added side-channel (initialised in sentry.*.config.ts)
 * — no need to call captureException here.
 */

import { useEffect } from "react";
import { AlertTriangle, RefreshCcw, Home } from "lucide-react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Console fallback so the user can still inspect during dev. In prod
    // this is swallowed but Sentry already grabbed it via its hook.
    // eslint-disable-next-line no-console
    console.error("app_error_boundary", error);
  }, [error]);

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
          Что-то{" "}
          <em
            className="not-italic italic"
            style={{ color: "var(--peach)" }}
          >
            сломалось
          </em>
        </h1>

        <p
          className="mx-auto mt-4 max-w-[420px] text-[14.5px] leading-relaxed"
          style={{ color: "var(--hero-cream-65)" }}
        >
          Мы уже знаем — ошибка ушла в логи с трассой. Попробуй обновить
          страницу. Если повторится — напиши{" "}
          <a
            href="mailto:hello@miloai.ee"
            className="underline transition-opacity hover:opacity-80"
            style={{ color: "var(--peach)" }}
          >
            hello@miloai.ee
          </a>
          .
        </p>

        {error.digest && (
          <div
            className="mt-4 inline-block rounded-md px-2.5 py-1 font-mono text-[10.5px]"
            style={{
              background: "var(--hero-surface)",
              border: "1px solid var(--hero-border)",
              color: "var(--hero-cream-45)",
            }}
          >
            digest: {error.digest}
          </div>
        )}

        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-[10px] px-5 py-2.5 text-[13.5px] font-medium transition-colors"
            style={{
              background: "var(--hero-surface)",
              color: "var(--hero-cream)",
              border: "1px solid var(--hero-border-strong)",
            }}
          >
            <Home className="size-[14px]" strokeWidth={2} />
            На дашборд
          </Link>
          <button
            onClick={() => reset()}
            className="inline-flex items-center gap-2 rounded-[10px] px-5 py-2.5 text-[13.5px] font-medium text-white transition-opacity hover:opacity-90"
            style={{
              background: "var(--peach)",
              boxShadow: "0 6px 18px -6px rgba(232,149,108,0.55)",
            }}
          >
            <RefreshCcw className="size-[14px]" strokeWidth={2} />
            Попробовать ещё раз
          </button>
        </div>
      </div>
    </div>
  );
}
