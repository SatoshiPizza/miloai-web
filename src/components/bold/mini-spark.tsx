/**
 * MiniSpark — tiny sparkline for KPI rows, list cards, channel rows.
 *
 * Reference: `bold-system.jsx::BoldMiniSpark`.
 *
 * Renders an SVG sparkline with a light fill underneath and an optional
 * end-of-series dot. Default size matches the editorial KpiStrip cells
 * (88×30) but can be overridden.
 */

import { sparkPath } from "./spark-path";

export function MiniSpark({
  data,
  color = "var(--peach)",
  width = 88,
  height = 30,
  dot = true,
}: {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
  dot?: boolean;
}) {
  if (!data || data.length < 2) {
    return <div style={{ width, height }} />;
  }
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const lastX = ((data.length - 1) / (data.length - 1)) * width;
  const lastY =
    height - ((data[data.length - 1] - min) / range) * (height - 6) - 3;
  const path = sparkPath(data, width, height);

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <path
        d={`${path} L${width},${height} L0,${height} Z`}
        fill={color}
        opacity={0.1}
      />
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {dot && <circle cx={lastX} cy={lastY} r={2.5} fill={color} />}
    </svg>
  );
}
