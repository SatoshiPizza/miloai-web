/**
 * Round score gauge — peach arc on stone background.
 * Design handoff iter-2 §Wizard Step 4 (audit screen).
 */

export function ScoreCircle({
  score,
  max = 10,
  size = 72,
}: {
  score: number;
  max?: number;
  size?: number;
}) {
  const pct = Math.max(0, Math.min(1, score / max));
  const r = size * 0.39;
  const cx = size / 2;
  const cy = size / 2;
  const circ = 2 * Math.PI * r;

  // Color shifts by score so a 3/10 reads as warning, 8/10 as good.
  const arcColor =
    score >= 7 ? "var(--sage)" : score >= 4 ? "var(--peach)" : "var(--destructive)";

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }} aria-hidden>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--border)" strokeWidth={5} />
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={arcColor}
          strokeWidth={5}
          strokeDasharray={`${circ * pct} ${circ}`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="font-mono text-[22px] font-semibold leading-none tabular-nums tracking-tight">
          {score}
        </div>
        <div className="font-mono text-[9px] text-[var(--ink-subtle)] mt-0.5 tracking-wider">
          / {max}
        </div>
      </div>
    </div>
  );
}
