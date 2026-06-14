/**
 * KpiStripSkeleton — placeholder for KpiStrip while metrics load.
 *
 * Same -18 overlap on the HeroBandSkeleton above so the layout doesn't
 * shift once real data arrives. Default 4 cells; pass `cells` if a page
 * uses a different strip width.
 */
export function KpiStripSkeleton({
  cells = 4,
  overlap = true,
}: {
  cells?: number;
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
      {Array.from({ length: cells }).map((_, i) => (
        <div key={i} className="flex flex-1 items-stretch">
          {i > 0 && (
            <div
              className="my-5 w-px"
              style={{ background: "var(--border-soft)" }}
            />
          )}
          <div className="flex-1 px-6 py-5">
            <div
              className="h-3 w-[55%] animate-pulse rounded-md"
              style={{ background: "var(--card-soft)" }}
            />
            <div
              className="mt-3 h-[32px] w-[70%] animate-pulse rounded-md"
              style={{ background: "var(--card-soft)" }}
            />
            <div
              className="mt-3.5 h-1 w-full animate-pulse rounded-md"
              style={{ background: "var(--card-soft)" }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
