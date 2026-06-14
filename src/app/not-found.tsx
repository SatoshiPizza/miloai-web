import Link from "next/link";
import { Sparkles, ArrowLeft } from "lucide-react";

/**
 * Global 404 — caught by any unmatched route, both at the root and inside
 * (dashboard) since Next.js falls back to the nearest not-found.tsx.
 *
 * Mirrors the dark hero / floating card pattern of the marketing landing
 * so the brand stays coherent on a "you took a wrong turn" moment.
 */
export default function NotFound() {
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
          className="mx-auto mb-6 inline-flex items-center gap-1.5 rounded-full px-3 py-[5px]"
          style={{
            background: "var(--hero-peach-wash)",
            border: "1px solid var(--hero-peach-border)",
          }}
        >
          <Sparkles className="size-3" style={{ color: "var(--peach)" }} />
          <span
            className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.1em]"
            style={{ color: "var(--peach)" }}
          >
            404 · Не найдено
          </span>
        </div>

        <h1
          className="font-heading text-[44px] sm:text-[56px] font-bold leading-[1.04] tracking-[-0.035em]"
          style={{ color: "var(--hero-cream)" }}
        >
          Тут{" "}
          <em
            className="not-italic italic"
            style={{ color: "var(--peach)" }}
          >
            пусто
          </em>
        </h1>

        <p
          className="mx-auto mt-5 max-w-[420px] text-[15px] leading-relaxed"
          style={{ color: "var(--hero-cream-65)" }}
        >
          Страница не существует или перенесена. AI может всё, но даже он не
          умеет читать мысли — вернись в дашборд и попробуй ещё раз.
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-[10px] px-5 py-2.5 text-[13.5px] font-medium transition-colors"
            style={{
              background: "var(--hero-surface)",
              color: "var(--hero-cream)",
              border: "1px solid var(--hero-border-strong)",
            }}
          >
            <ArrowLeft className="size-[14px]" strokeWidth={2} />
            На главную
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-[10px] px-5 py-2.5 text-[13.5px] font-medium text-white transition-opacity hover:opacity-90"
            style={{
              background: "var(--peach)",
              boxShadow: "0 6px 18px -6px rgba(232,149,108,0.55)",
            }}
          >
            Открыть дашборд
          </Link>
        </div>
      </div>
    </div>
  );
}
