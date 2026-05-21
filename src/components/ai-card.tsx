import { Sparkles } from "lucide-react";

/**
 * Peach-gradient AI card — used wherever AI speaks (insights, recommendations,
 * priority fixes, allocation advice). Design handoff iter-2 §Snippets.
 */

export function AiCard({
  label,
  body,
  actions,
  className,
}: {
  label: string;
  body: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[14px] border p-4 flex items-start gap-3 ${className ?? ""}`}
      style={{
        background: "linear-gradient(135deg, var(--peach-wash) 0%, #F8E8D9 100%)",
        borderColor: "#F5DDC8",
      }}
    >
      <div
        className="size-9 rounded-full bg-white flex items-center justify-center shrink-0"
        style={{ boxShadow: "0 4px 14px -4px rgba(232,149,108,0.4)" }}
      >
        <Sparkles className="size-[18px] text-[var(--peach)]" strokeWidth={1.6} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-mono text-[10.5px] uppercase font-semibold tracking-[0.1em] text-[var(--peach-deep)] mb-2">
          {label}
        </div>
        <div className="text-[14px] leading-relaxed text-[var(--ink)]">{body}</div>
        {actions && <div className="flex gap-2 mt-3 flex-wrap">{actions}</div>}
      </div>
    </div>
  );
}
