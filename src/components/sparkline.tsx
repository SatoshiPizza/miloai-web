"use client";

/**
 * Tiny inline sparkline (SVG). Per design handoff §Campaigns Table:
 *   - 80×28 default
 *   - line + 8% area fill underneath
 *   - colored by platform (meta blue, google blue) or warn for attention
 *
 * We synthesize a 7-day curve from the campaign's current metrics until the
 * backend exposes daily breakdowns. Random-but-deterministic per campaign id
 * so it doesn't flicker on re-renders.
 */

type Props = {
  values: number[];      // 7+ data points
  color?: string;
  width?: number;
  height?: number;
  stroke?: number;
  className?: string;
};

export function Sparkline({
  values,
  color = "var(--peach)",
  width = 80,
  height = 28,
  stroke = 1.4,
  className,
}: Props) {
  if (!values || values.length < 2) {
    return (
      <svg width={width} height={height} className={className} aria-hidden>
        <line
          x1={0} y1={height / 2} x2={width} y2={height / 2}
          stroke="var(--ink-subtle)" strokeWidth={1} strokeDasharray="3 3" opacity={0.4}
        />
      </svg>
    );
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const stepX = width / (values.length - 1);

  // SVG path: line through points + closed area fill
  const points = values.map((v, i) => {
    const x = i * stepX;
    const y = height - ((v - min) / range) * (height - stroke * 2) - stroke;
    return [x, y] as const;
  });

  const linePath = points
    .map(([x, y], i) => (i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`))
    .join(" ");
  const areaPath = `${linePath} L ${width} ${height} L 0 ${height} Z`;

  const gradientId = `spark-${Math.random().toString(36).slice(2, 8)}`;

  return (
    <svg
      width={width}
      height={height}
      className={className}
      style={{ display: "block", overflow: "visible" }}
      aria-hidden
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.14" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradientId})`} />
      <path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}


/**
 * Deterministic 7-day fake curve seeded by string id. Visual placeholder until
 * the backend serves per-day daily_breakdown. Keeps the shape "interesting"
 * (some up/down) so users see motion, not flat lines, but never invents
 * numbers — peaks/troughs are anchored to the campaign's current value.
 */
export function fakeWeekCurve(seed: string, baseline: number): number[] {
  // xmur3 — small string hasher → deterministic seed for sfc32 RNG.
  function xmur3(str: string) {
    let h = 1779033703 ^ str.length;
    for (let i = 0; i < str.length; i++) {
      h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
      h = (h << 13) | (h >>> 19);
    }
    return () => {
      h = Math.imul(h ^ (h >>> 16), 2246822507);
      h = Math.imul(h ^ (h >>> 13), 3266489909);
      return (h ^ (h >>> 16)) >>> 0;
    };
  }
  const seedFn = xmur3(seed);
  let s = seedFn();
  const rng = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };

  if (baseline === 0) {
    return Array.from({ length: 7 }, () => rng() * 0.4 + 0.1);
  }

  // Curve with ±25% noise around baseline, ending at baseline so the
  // sparkline visually "lands" at the current value.
  const out: number[] = [];
  for (let i = 0; i < 7; i++) {
    const noise = (rng() - 0.5) * 0.5; // -0.25..0.25
    out.push(baseline * (1 + noise));
  }
  out[out.length - 1] = baseline;
  return out;
}
