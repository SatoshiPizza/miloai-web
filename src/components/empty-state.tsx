"use client";

/**
 * EmptyState — shared "you have no X yet" card.
 *
 * Reference: design handoff §empty-states + Claude Design's 2026-06-12 audit
 * ("каждый экран должен сказать новому юзеру что делать").
 *
 * Three CTAs in priority order:
 *   primary   — the canonical next action (peach button)
 *   secondary — alternate path (ink-outline button, optional)
 *   tertiary  — quietly available, usually "вернуться в онбординг"
 *
 * Uses the same peach-AI badge pattern as HeroBand so it visually clicks
 * into the bold direction without a heavy hero overhead.
 */

import Link from "next/link";
import { ArrowRight, Sparkles, type LucideIcon } from "lucide-react";

export type EmptyAction = {
  label: string;
  href?: string;
  onClick?: () => void;
  primary?: boolean;
  icon?: LucideIcon;
};

export function EmptyState({
  icon: Icon,
  eyebrow = "Пусто",
  title,
  body,
  actions = [],
}: {
  icon: LucideIcon;
  eyebrow?: string;
  title: React.ReactNode;
  body?: React.ReactNode;
  actions?: EmptyAction[];
}) {
  return (
    <div
      className="mx-auto flex max-w-[640px] flex-col items-center rounded-[18px] bg-white px-6 py-12 text-center lg:px-10 lg:py-16"
      style={{ border: "1px solid var(--border)" }}
    >
      <div
        className="mb-4 inline-flex items-center gap-1.5 rounded-full px-3 py-[5px]"
        style={{
          background: "var(--peach-wash)",
          border: "1px solid var(--peach-soft)",
        }}
      >
        <Sparkles
          className="size-3"
          style={{ color: "var(--peach)" }}
          strokeWidth={1.6}
        />
        <span
          className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.1em]"
          style={{ color: "var(--peach-deep)" }}
        >
          {eyebrow}
        </span>
      </div>

      <div
        className="mb-5 flex size-12 items-center justify-center rounded-[14px]"
        style={{ background: "var(--card-soft)" }}
      >
        <Icon
          className="size-6"
          strokeWidth={1.5}
          style={{ color: "var(--peach-deep)" }}
        />
      </div>

      <h3 className="font-heading text-[22px] font-bold leading-tight tracking-[-0.022em] text-[var(--ink)] lg:text-[26px]">
        {title}
      </h3>

      {body && (
        <p className="mt-3 max-w-[460px] text-[14px] leading-relaxed text-[var(--ink-mute)]">
          {body}
        </p>
      )}

      {actions.length > 0 && (
        <div className="mt-7 flex flex-wrap items-center justify-center gap-2.5">
          {actions.map((a, i) => (
            <ActionButton key={i} action={a} />
          ))}
        </div>
      )}
    </div>
  );
}

function ActionButton({ action }: { action: EmptyAction }) {
  const className = action.primary
    ? "inline-flex items-center gap-2 rounded-[11px] px-6 py-2.5 text-[14px] font-medium text-white transition-opacity hover:opacity-90"
    : "inline-flex items-center gap-2 rounded-[11px] px-5 py-2.5 text-[13.5px] font-medium text-[var(--ink-mute)] hover:text-[var(--ink)] transition-colors";

  const style = action.primary
    ? {
        background: "var(--peach)",
        boxShadow: "0 6px 18px -6px rgba(232,149,108,0.55)",
      }
    : {
        background: "transparent",
      };

  const Icon = action.icon;
  const inner = (
    <>
      {Icon && <Icon className="size-[14px]" strokeWidth={2} />}
      {action.label}
      {action.primary && (
        <ArrowRight className="size-[14px]" strokeWidth={2} />
      )}
    </>
  );

  if (action.href) {
    return (
      <Link href={action.href} className={className} style={style}>
        {inner}
      </Link>
    );
  }
  return (
    <button onClick={action.onClick} className={className} style={style}>
      {inner}
    </button>
  );
}
