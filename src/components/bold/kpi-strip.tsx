/**
 * KpiStrip — editorial metric row that overlaps the HeroBand by 18px.
 *
 * Reference: `bold-system.jsx::BoldKpiStrip`.
 *
 * System rules (iter-4):
 *   • Single card container, N equal columns separated by 1px dividers
 *     (no per-cell boxes — that's the "editorial" look).
 *   • Geist Mono numerals at 32px tabular-nums.
 *   • Delta uses sage for up, danger for down (NOT emerald).
 *   • Optional Meta/Google split bar at the bottom of a cell, flex-weighted
 *     by spend proportion.
 *
 * Default `overlap=true` lifts the strip onto the HeroBand by -18px and
 * relies on the parent giving it z-index room. Pass `overlap={false}` to
 * use it as a standalone summary row (e.g. inside Analytics tabs).
 */

import { ArrowDown, ArrowUp } from "lucide-react";

export type Kpi = {
  label: string;
  value: string;
  delta?: string;
  dir?: "up" | "down";
  /** Optional spend split between Meta and Google. Bars are flex:value. */
  breakdown?: { meta: number; google: number };
};

export function KpiStrip({
  kpis,
  overlap = true,
}: {
  kpis: Kpi[];
  overlap?: boolean;
}) {
  return (
    <div
      className="relative z-[2] flex items-stretch overflow-hidden rounded-[16px] bg-[var(--card)]"
      style={{
        border: "1px solid var(--border)",
        marginTop: overlap ? -18 : 0,
        boxShadow: "0 12px 30px -16px rgba(31,29,26,0.18)",
      }}
    >
      {kpis.map((k, i) => (
        <div key={i} className="flex flex-1 items-stretch">
          {i > 0 && (
            <div
              className="my-5 w-px"
              style={{ background: "var(--border-soft)" }}
            />
          )}
          <KpiCell kpi={k} />
        </div>
      ))}
    </div>
  );
}

function KpiCell({ kpi }: { kpi: Kpi }) {
  const isDown = kpi.dir === "down";
  return (
    <div className="flex-1 px-6 py-5">
      <div
        className="text-[12.5px] tracking-[-0.005em]"
        style={{ color: "var(--ink-mute)" }}
      >
        {kpi.label}
      </div>
      <div className="mt-2.5 flex items-baseline gap-2.5">
        <span
          className="font-mono text-[32px] font-medium leading-none tabular-nums tracking-[-0.025em]"
          style={{ color: "var(--ink)" }}
        >
          {kpi.value}
        </span>
        {kpi.delta && (
          <div className="flex items-center gap-[3px]">
            {isDown ? (
              <ArrowDown
                className="size-[11px]"
                style={{ color: "var(--destructive)" }}
              />
            ) : (
              <ArrowUp
                className="size-[11px]"
                style={{ color: "var(--sage)" }}
              />
            )}
            <span
              className="font-mono text-[11.5px] tabular-nums"
              style={{
                color: isDown ? "var(--destructive)" : "var(--sage)",
              }}
            >
              {kpi.delta}
            </span>
          </div>
        )}
      </div>
      {kpi.breakdown ? (
        <div className="mt-3.5 flex items-center gap-1">
          <div
            className="h-1 rounded-[2px]"
            style={{
              flex: kpi.breakdown.meta,
              background: "var(--meta)",
            }}
          />
          <div
            className="h-1 rounded-[2px]"
            style={{
              flex: kpi.breakdown.google,
              background: "var(--google)",
            }}
          />
        </div>
      ) : (
        <div className="mt-3.5 h-1" />
      )}
    </div>
  );
}
