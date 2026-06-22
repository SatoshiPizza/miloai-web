"use client";

/**
 * OnbFrame — shared chrome for every onboarding step.
 *
 * Reference: `design-handoff/.../screen-onboarding.jsx::OnbFrame`.
 *
 * Layout:
 *   • Cream radial background with one warm peach glow top-right.
 *   • Top bar: MiloAI brand · centered step progress · «Выйти» exit link.
 *   • Centered content area (children).
 *
 * Progress rules:
 *   • `stepIdx` is 0-based against the 6-step canonical sequence
 *     (О бизнесе / Кабинеты / AI-анализ / Профиль / Telegram / Готово).
 *   • Done dots get sage fill + check; the active dot is peach with a glow;
 *     future dots are empty with a hairline border.
 *   • Only the ACTIVE dot shows its label — keeps the bar compact.
 *
 * Step 1a (Category) and Step 1b (Source) both map to stepIdx=0 because
 * they're sub-steps of the same "tell me about your business" gate.
 */

import Link from "next/link";
import { Sparkles, Check } from "lucide-react";

const STEP_LABELS = [
  "О бизнесе",
  "Кабинеты",
  "AI-анализ",
  "Профиль",
  "Telegram",
  "Готово",
];

export function OnbFrame({
  stepIdx,
  children,
}: {
  stepIdx: number;
  children: React.ReactNode;
}) {
  return (
    <div
      className="relative flex h-full w-full flex-col overflow-hidden text-[var(--ink)]"
      style={{
        background:
          "radial-gradient(120% 80% at 30% 20%, #F0EBE0 0%, #E2DCCC 100%)",
      }}
    >
      {/* Warm glow top-right */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 -top-52 size-[700px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(232,149,108,0.13) 0%, transparent 60%)",
        }}
      />

      {/* Top bar */}
      <div className="relative z-[2] flex items-center gap-6 px-6 py-5 lg:px-12">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <Sparkles
            className="size-[22px]"
            style={{ color: "var(--ink)" }}
            strokeWidth={1.6}
          />
          <span className="font-heading text-[18px] font-bold tracking-[-0.02em]">
            UniAds
          </span>
        </Link>

        <div className="flex flex-1 items-center justify-center">
          <Progress stepIdx={stepIdx} />
        </div>

        <Link
          href="/dashboard"
          className="text-[12.5px] text-[var(--ink-subtle)] hover:text-[var(--ink-mute)] transition-colors shrink-0"
        >
          Выйти
        </Link>
      </div>

      {/* Content */}
      <div className="relative z-[1] flex flex-1 items-center justify-center px-6 pb-12 lg:px-12">
        {children}
      </div>
    </div>
  );
}

function Progress({ stepIdx }: { stepIdx: number }) {
  return (
    <div className="hidden md:flex items-center gap-2">
      {STEP_LABELS.map((label, i) => {
        const done = i < stepIdx;
        const active = i === stepIdx;
        return (
          <div key={i} className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <div
                className="flex size-[22px] items-center justify-center rounded-full font-mono text-[10.5px] font-semibold"
                style={{
                  background: done
                    ? "var(--sage)"
                    : active
                      ? "var(--peach)"
                      : "rgba(255,255,255,0.7)",
                  border: !done && !active
                    ? "1px solid rgba(31,29,26,0.1)"
                    : "none",
                  color: done || active ? "#fff" : "var(--ink-subtle)",
                  boxShadow: active
                    ? "0 0 0 4px rgba(232,149,108,0.18)"
                    : "none",
                }}
              >
                {done ? (
                  <Check className="size-[11px]" strokeWidth={2.5} />
                ) : (
                  i + 1
                )}
              </div>
              {active && (
                <span className="text-[12px] font-medium">{label}</span>
              )}
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div
                className="h-px w-[18px]"
                style={{
                  background: done
                    ? "color-mix(in oklab, var(--sage), transparent 50%)"
                    : "rgba(31,29,26,0.1)",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
