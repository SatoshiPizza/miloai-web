/**
 * Build an SVG path `d` attribute for a tiny line chart from a flat number
 * series. Shared by HeroBand stat's sparkline and MiniSpark cards.
 *
 * The path leaves a 4px top breath so the topmost point isn't clipped, and
 * scales the y-range to fit within the given height. Returns the `d`
 * string only — callers add their own stroke/fill styling.
 */
export function sparkPath(data: number[], w: number, h: number): string {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  return data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * (h - 8) - 4;
      return `${i === 0 ? "M" : "L"}${x.toFixed(0)},${y.toFixed(0)}`;
    })
    .join(" ");
}
