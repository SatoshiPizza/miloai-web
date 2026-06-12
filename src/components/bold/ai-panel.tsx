/**
 * AiPanel — light peach panel for in-page AI moments.
 *
 * Reference: `bold-system.jsx::BoldAiPanel`.
 *
 * System rules (iter-4): peach gradient bg, white sparkle disc on the left,
 * uppercase Geist Mono eyebrow ("AI" by default), free children layout on
 * the right. Drop into Dashboard sections that explain why AI made a call
 * or what it's about to do — NOT a generic note card.
 *
 * AiRec — a single AI recommendation row meant to live inside an AiPanel.
 * Number + title + impact pill + "Применить" peach button.
 */

import { Sparkles } from "lucide-react";
import type { ReactNode } from "react";

export function AiPanel({
  eyebrow = "AI",
  dense,
  children,
}: {
  eyebrow?: string;
  dense?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className="flex items-start gap-3 rounded-[14px]"
      style={{
        background: "linear-gradient(135deg, #FCF1E8 0%, #F8E8D9 100%)",
        border: "1px solid #F5DDC8",
        padding: dense ? 14 : 18,
      }}
    >
      <div
        className="flex size-[34px] shrink-0 items-center justify-center rounded-full bg-white"
        style={{
          boxShadow: "0 4px 14px -4px rgba(232,149,108,0.45)",
        }}
      >
        <Sparkles
          className="size-[17px]"
          style={{ color: "var(--peach)" }}
          strokeWidth={1.6}
        />
      </div>
      <div className="min-w-0 flex-1">
        <div
          className="mb-2 font-mono text-[10.5px] font-semibold uppercase tracking-[0.1em]"
          style={{ color: "var(--peach-deep)" }}
        >
          {eyebrow}
        </div>
        {children}
      </div>
    </div>
  );
}

export function AiRec({
  number,
  title,
  body,
  impact,
  onApply,
  applyLabel = "Применить",
}: {
  number?: number | string;
  title: ReactNode;
  body?: ReactNode;
  impact?: string;
  onApply?: () => void;
  applyLabel?: string;
}) {
  return (
    <div
      className="flex items-start gap-3.5 rounded-[12px] bg-white/70 px-3.5 py-3"
      style={{ border: "1px solid rgba(245,221,200,0.7)" }}
    >
      {number != null && (
        <div
          className="flex size-6 shrink-0 items-center justify-center rounded-full font-mono text-[11.5px] font-semibold"
          style={{
            background: "var(--peach-wash)",
            color: "var(--peach-deep)",
          }}
        >
          {number}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div
          className="text-[14px] font-medium leading-snug tracking-[-0.01em]"
          style={{ color: "var(--ink)" }}
        >
          {title}
        </div>
        {body && (
          <div
            className="mt-1 text-[12.5px] leading-snug"
            style={{ color: "var(--ink-mute)" }}
          >
            {body}
          </div>
        )}
        {impact && (
          <div
            className="mt-1.5 inline-flex items-center gap-1.5 rounded-full px-2 py-[2px] font-mono text-[10.5px] font-semibold uppercase tracking-[0.06em]"
            style={{
              background: "var(--sage-soft)",
              color: "color-mix(in oklab, var(--sage), black 25%)",
            }}
          >
            {impact}
          </div>
        )}
      </div>
      {onApply && (
        <button
          onClick={onApply}
          className="shrink-0 rounded-[8px] px-3 py-1.5 text-[12.5px] font-medium text-white transition-opacity hover:opacity-90"
          style={{
            background: "var(--peach)",
            boxShadow: "0 4px 12px -4px rgba(232,149,108,0.5)",
          }}
        >
          {applyLabel}
        </button>
      )}
    </div>
  );
}
