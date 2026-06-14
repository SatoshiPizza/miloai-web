/**
 * HeroBandSkeleton — loading placeholder matching HeroBand's dimensions.
 *
 * Rendered while the page is still fetching KPI data so the dark band
 * doesn't jump in only after the fetch resolves. Same gradient, same
 * peach glow — only the title/body/stat are replaced with pulsing cream
 * bars.
 */
export function HeroBandSkeleton({ compact }: { compact?: boolean }) {
  return (
    <div
      className="relative overflow-hidden"
      style={{
        background: "var(--hero-bg)",
        padding: compact ? "26px 30px" : "30px 34px 34px",
      }}
    >
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
          {/* Eyebrow pill */}
          <div
            className="mb-3.5 h-[26px] w-[170px] animate-pulse rounded-full"
            style={{ background: "var(--hero-peach-wash)" }}
          />
          {/* Title rows */}
          <div className="space-y-3">
            <div
              className="h-[34px] w-[80%] animate-pulse rounded-md"
              style={{ background: "var(--hero-surface)" }}
            />
            <div
              className="h-[34px] w-[55%] animate-pulse rounded-md"
              style={{ background: "var(--hero-surface)" }}
            />
          </div>
          {/* Body row */}
          <div
            className="mt-4 h-3.5 w-[60%] animate-pulse rounded-md"
            style={{ background: "var(--hero-border)" }}
          />
          {/* Button row */}
          <div className="mt-5 flex gap-2.5">
            <div
              className="h-[40px] w-[180px] animate-pulse rounded-[10px]"
              style={{ background: "var(--hero-peach-wash)" }}
            />
          </div>
        </div>

        {/* Stat block */}
        <div
          className="w-full shrink-0 rounded-[16px] p-[22px] lg:w-[250px]"
          style={{
            background: "var(--hero-surface)",
            border: "1px solid var(--hero-border)",
          }}
        >
          <div
            className="h-3 w-[60%] animate-pulse rounded-md"
            style={{ background: "var(--hero-border)" }}
          />
          <div
            className="mt-3 h-[52px] w-[80%] animate-pulse rounded-md"
            style={{ background: "var(--hero-surface)" }}
          />
          <div
            className="mt-3 h-3 w-[40%] animate-pulse rounded-md"
            style={{ background: "var(--hero-border)" }}
          />
        </div>
      </div>
    </div>
  );
}
