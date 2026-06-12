/**
 * HeroBand — dark command band at the top of every primary screen.
 *
 * Reference: `bold-system.jsx::BoldHeroBand` + `BoldHeroStat`.
 *
 * System rules (iter-4):
 *   • ONE dominant AI headline + one hero stat. Don't pack more.
 *   • Used on Dashboard, Campaign detail, Analytics, killer-chat rail and
 *     Login. NOT on lists/settings/services — those keep the light header.
 *   • Eyebrow is the peach AI badge with a sparkle.
 *   • Title accent (`<em>` or {accent:true} segments) is peach — everything
 *     else is cream.
 *   • Body is muted cream (--hero-cream-65).
 *   • Right rail: stat block with 52px Geist Mono numeral, delta with
 *     sage/danger arrow, optional peach sparkline.
 */

import { Sparkles, ArrowUp, ArrowDown } from "lucide-react";
import type { ReactNode } from "react";

import { MiniSpark } from "./mini-spark";

export type HeroAction = {
  label: string;
  icon?: ReactNode;
  primary?: boolean;
  onClick?: () => void;
  href?: string;
};

export type HeroStat = {
  label: string;
  value: string;
  unit?: string;
  delta?: string;
  dir?: "up" | "down";
  spark?: number[];
};

export function HeroBand({
  eyebrow = "Главное за сегодня",
  title,
  body,
  actions = [],
  stat,
  compact,
}: {
  eyebrow?: string;
  title: ReactNode;
  body?: ReactNode;
  actions?: HeroAction[];
  stat?: HeroStat;
  compact?: boolean;
}) {
  return (
    <div
      className="relative overflow-hidden"
      style={{
        background: "var(--hero-bg)",
        padding: compact ? "26px 30px" : "30px 34px 34px",
      }}
    >
      {/* Warm peach glow, top-right of the band. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 right-10 size-[420px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, var(--hero-peach-glow) 0%, transparent 65%)",
        }}
      />

      <div className="relative flex flex-col gap-10 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1">
          {eyebrow && (
            <div
              className="mb-3.5 inline-flex items-center gap-1.5 rounded-full px-3 py-[5px]"
              style={{
                background: "var(--hero-peach-wash)",
                border: "1px solid var(--hero-peach-border)",
              }}
            >
              <Sparkles className="size-[13px]" style={{ color: "var(--peach)" }} />
              <span
                className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.1em]"
                style={{ color: "var(--peach)" }}
              >
                {eyebrow}
              </span>
            </div>
          )}

          <h1
            className="font-heading font-bold leading-[1.12] tracking-[-0.03em]"
            style={{
              color: "var(--hero-cream)",
              fontSize: compact ? 28 : 34,
              maxWidth: 640,
            }}
          >
            {title}
          </h1>

          {body && (
            <p
              className="mt-3.5 text-[15px] leading-[1.5] tracking-[-0.005em]"
              style={{
                color: "var(--hero-cream-65)",
                maxWidth: 580,
              }}
            >
              {body}
            </p>
          )}

          {actions.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2.5">
              {actions.map((a, i) => (
                <HeroActionButton key={i} action={a} />
              ))}
            </div>
          )}
        </div>

        {stat && <HeroStatBlock stat={stat} />}
      </div>
    </div>
  );
}

function HeroActionButton({ action }: { action: HeroAction }) {
  const className =
    "inline-flex items-center gap-2 rounded-[10px] px-5 py-2.5 text-[13.5px] font-medium transition-colors";
  const style = action.primary
    ? {
        background: "var(--peach)",
        color: "#fff",
        boxShadow: "0 6px 18px -6px rgba(232,149,108,0.6)",
      }
    : {
        background: "var(--hero-surface)",
        color: "var(--hero-cream)",
        border: "1px solid var(--hero-border-strong)",
      };
  const inner = (
    <>
      {action.icon}
      {action.label}
    </>
  );
  if (action.href) {
    return (
      <a href={action.href} className={className} style={style}>
        {inner}
      </a>
    );
  }
  return (
    <button onClick={action.onClick} className={className} style={style}>
      {inner}
    </button>
  );
}

function HeroStatBlock({ stat }: { stat: HeroStat }) {
  const isDown = stat.dir === "down";
  return (
    <div
      className="w-full shrink-0 rounded-[16px] p-[22px] lg:w-[250px]"
      style={{
        background: "var(--hero-surface)",
        border: "1px solid var(--hero-border)",
      }}
    >
      <div
        className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.1em]"
        style={{ color: "var(--hero-cream-50)" }}
      >
        {stat.label}
      </div>
      <div className="mt-2.5 flex items-baseline gap-2">
        <span
          className="font-mono font-semibold leading-none tabular-nums tracking-[-0.03em]"
          style={{
            color: "var(--hero-cream)",
            fontSize: 52,
          }}
        >
          {stat.value}
        </span>
        {stat.unit && (
          <span
            className="font-mono text-[24px] font-medium"
            style={{ color: "var(--hero-cream-55)" }}
          >
            {stat.unit}
          </span>
        )}
      </div>
      {stat.delta && (
        <div className="mt-2 flex items-center gap-1.5">
          {isDown ? (
            <ArrowDown
              className="size-3"
              style={{ color: "#E89B7C" }}
            />
          ) : (
            <ArrowUp
              className="size-3"
              style={{ color: "var(--sage)" }}
            />
          )}
          <span
            className="font-mono text-[12px] tabular-nums"
            style={{ color: isDown ? "#E89B7C" : "var(--sage)" }}
          >
            {stat.delta}
          </span>
        </div>
      )}
      {stat.spark && stat.spark.length > 1 && (
        <div className="mt-4">
          <MiniSpark
            data={stat.spark}
            color="var(--peach)"
            width={206}
            height={40}
            dot={false}
          />
        </div>
      )}
    </div>
  );
}
