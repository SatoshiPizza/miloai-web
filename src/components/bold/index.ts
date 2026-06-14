/**
 * Bold visual system — primitives shared across primary screens.
 *
 * Imports:
 *   import { HeroBand, KpiStrip, AiPanel, AiRec, MiniSpark } from "@/components/bold"
 *
 * See `design-handoff/design_handoff_miloai/README_iteration_4_bold.md`
 * for usage rules.
 */

export { HeroBand } from "./hero-band";
export type { HeroAction, HeroStat } from "./hero-band";
export { HeroBandSkeleton } from "./hero-band-skeleton";
export { KpiStrip } from "./kpi-strip";
export type { Kpi } from "./kpi-strip";
export { KpiStripSkeleton } from "./kpi-strip-skeleton";
export { AiPanel, AiRec } from "./ai-panel";
export { MiniSpark } from "./mini-spark";
export { sparkPath } from "./spark-path";
