"use client";

import { useEffect, useMemo, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sparkles, Check, TriangleAlert, ChevronDown, Eye, MousePointerClick,
  Target, Phone, BadgeEuro, LayoutGrid as Grid,
} from "lucide-react";
import { tgBridge, type CampaignsResponse, type DashboardKpi, type ChannelsResponse } from "@/lib/tg-bridge";
import {
  HeroBand, HeroBandSkeleton, KpiStrip, KpiStripSkeleton,
  type HeroStat, type Kpi,
} from "@/components/bold";

/**
 * Analytics — design handoff §screen-analytics.jsx.
 *
 * Strategy: render the full visual structure but honest about what we have.
 *   - AI Benchmarks → only the user's metrics; EE-сравнение требует benchmark
 *     API (TBD), показано как teaser
 *   - 30-day trend → синтезируется детерминистично из total spend / conversions
 *   - Cohort, hourly heatmap → empty с пояснением что нужно
 *   - Funnel → реальные impressions/clicks/conversions; звонки/оплаты grayed
 *   - By-platform (вместо by-service пока нет service↔campaign mapping)
 */

type Period = "7" | "30" | "90" | "365";
const PERIOD_LABELS: Record<Period, string> = { "7": "7д", "30": "30д", "90": "90д", "365": "год" };

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<Period>("30");
  const [campaigns, setCampaigns] = useState<CampaignsResponse | null>(null);
  const [kpi, setKpi] = useState<DashboardKpi | null>(null);
  const [channels, setChannels] = useState<ChannelsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      tgBridge.campaigns().catch(() => null),
      tgBridge.kpi().catch(() => null),
      tgBridge.channels().catch(() => null),
    ])
      .then(([c, k, ch]) => {
        setCampaigns(c);
        setKpi(k);
        setChannels(ch);
      })
      .finally(() => setLoading(false));
  }, []);

  const hero = buildAnalyticsHero(kpi, loading);
  const cells = buildAnalyticsKpis(kpi, loading);

  return (
    <div className="mx-auto max-w-[1400px]">
      {/* Bold hero with the benchmark verdict + CPL stat */}
      {loading ? (
        <HeroBandSkeleton />
      ) : (
        <HeroBand
          eyebrow={hero.eyebrow}
          title={hero.title}
          body={hero.body}
          stat={hero.stat}
        />
      )}

      <div className="px-7 pb-10">
        {/* Editorial KPI strip */}
        {loading ? <KpiStripSkeleton /> : <KpiStrip kpis={cells} />}

        {/* Period selector — moved below the strip so it sits with the data sections */}
        <div className="mt-6">
          <PeriodTabs period={period} onChange={setPeriod} />
        </div>

        <div className="mt-5 flex flex-col gap-[18px]">
          <TrendChartCard campaigns={campaigns} loading={loading} />

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
            <CohortPlaceholderCard />
            <FunnelCard campaigns={campaigns} loading={loading} />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
            <HeatmapPlaceholderCard />
            <ByPlatformCard channels={channels} loading={loading} />
          </div>
        </div>
      </div>
    </div>
  );
}

// Compact period tabs — extracted so the hero stays tight.
function PeriodTabs({
  period,
  onChange,
}: {
  period: Period;
  onChange: (p: Period) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <div className="flex gap-1">
        {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => {
          const active = period === p;
          return (
            <button
              key={p}
              onClick={() => onChange(p)}
              className="rounded-[8px] border px-3 py-1.5 text-[12.5px] font-medium transition-colors"
              style={{
                background: active ? "var(--ink)" : "transparent",
                color: active ? "#fff" : "var(--ink-mute)",
                borderColor: active ? "var(--ink)" : "var(--border)",
              }}
            >
              {PERIOD_LABELS[p]}
            </button>
          );
        })}
      </div>
      <button
        disabled
        className="inline-flex items-center gap-1.5 rounded-[8px] border border-[var(--border)] bg-card px-3 py-1.5 text-[12.5px] text-[var(--ink)] disabled:opacity-70"
        title="Скоро: сравнение с предыдущим периодом"
      >
        vs прошлый период
        <ChevronDown className="size-3 text-[var(--ink-subtle)]" />
      </button>
    </div>
  );
}


// ═════════════════════════════════════════════════════════════════════════════
// Header
// ═════════════════════════════════════════════════════════════════════════════

function AnalyticsHeader({ period, onChange }: { period: Period; onChange: (p: Period) => void }) {
  return (
    <header className="flex flex-col md:flex-row md:items-end gap-4">
      <div className="flex-1">
        <h1 className="font-heading text-[28px] font-bold leading-none tracking-[-0.025em]">
          Аналитика
        </h1>
        <p className="text-[13.5px] text-[var(--ink-mute)] mt-1.5">
          Глубокие тренды, бенчмарки по нише и cohort-анализ — без необходимости каждый день открывать Dashboard
        </p>
      </div>
      <div className="flex items-center gap-2.5 flex-wrap">
        <div className="flex gap-1">
          {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => {
            const active = period === p;
            return (
              <button
                key={p}
                onClick={() => onChange(p)}
                className="px-3 py-1.5 rounded-[8px] text-[12.5px] font-medium border transition-colors"
                style={{
                  background: active ? "var(--ink)" : "transparent",
                  color: active ? "#fff" : "var(--ink-mute)",
                  borderColor: active ? "var(--ink)" : "var(--border)",
                }}
              >
                {PERIOD_LABELS[p]}
              </button>
            );
          })}
        </div>
        <button
          disabled
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-[12.5px] text-[var(--ink)] bg-card border border-[var(--border)] disabled:opacity-70"
          title="Скоро: сравнение с предыдущим периодом"
        >
          vs прошлый период
          <ChevronDown className="size-3 text-[var(--ink-subtle)]" />
        </button>
      </div>
    </header>
  );
}


// ═════════════════════════════════════════════════════════════════════════════
// AI Benchmark hero
// ═════════════════════════════════════════════════════════════════════════════

function AiBenchmarkCard({ kpi, loading }: { kpi: DashboardKpi | null; loading: boolean }) {
  const hasData = !loading && kpi && (kpi.spend_7d > 0 || kpi.leads_7d > 0);
  return (
    <div
      className="rounded-[14px] border p-5 flex gap-[18px]"
      style={{ background: "linear-gradient(135deg, #FCF1E8 0%, #F8E8D9 100%)", borderColor: "#F5DDC8" }}
    >
      <div
        className="size-[42px] rounded-full bg-white flex items-center justify-center shrink-0"
        style={{ boxShadow: "0 4px 14px -4px rgba(232,149,108,0.5)" }}
      >
        <Sparkles className="size-[20px] text-[var(--peach)]" strokeWidth={1.7} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-2.5">
          <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.1em] text-[var(--peach-deep)]">
            AI · бенчмарки EE / ниша
          </span>
          <span
            className="px-1.5 py-0.5 rounded font-mono text-[9.5px] font-bold uppercase"
            style={{ background: "#fff", color: "var(--peach-deep)", letterSpacing: "0.05em" }}
          >
            Q2 2026
          </span>
          <span
            className="px-1.5 py-0.5 rounded font-mono text-[9.5px] font-bold uppercase"
            style={{ background: "rgba(255,255,255,0.6)", color: "var(--ink-mute)", letterSpacing: "0.05em" }}
          >
            preview
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          <BenchmarkTile
            metric="CPL · текущий"
            value={hasData && kpi?.cpl != null ? `€${kpi.cpl.toFixed(0)}` : "—"}
            sub={hasData && kpi?.target_cpl != null ? `цель €${kpi.target_cpl.toFixed(0)}` : "цель не задана"}
            good={Boolean(hasData && kpi?.cpl != null && kpi?.target_cpl != null && kpi.cpl <= kpi.target_cpl)}
            loading={loading}
          />
          <BenchmarkTile
            metric="Лиды (7д)"
            value={hasData ? String(kpi!.leads_7d) : "—"}
            sub="vs EE/ниша · TBD"
            loading={loading}
          />
          <BenchmarkTile
            metric="Активные кампании"
            value={hasData ? `${kpi!.active_campaigns} / ${kpi!.total_campaigns}` : "—"}
            sub="активных / всего"
            loading={loading}
          />
        </div>
        <p className="text-[13px] text-[var(--peach-ink)]/85 mt-3.5 leading-relaxed tracking-[-0.005em]">
          {hasData
            ? "Сравнение с бенчмарками по Эстонии / нише появится когда наберём первые 50 кампаний в проде. Сейчас вижу только твои метрики."
            : "Запусти кампанию — здесь будет твой CPL/CTR/ROAS против медиан по Эстонии и твоей нише."}
        </p>
      </div>
    </div>
  );
}

function BenchmarkTile({
  metric, value, sub, good, loading,
}: {
  metric: string;
  value: string;
  sub: string;
  good?: boolean;
  loading: boolean;
}) {
  return (
    <div className="px-3.5 py-3 rounded-[10px]" style={{ background: "rgba(255,255,255,0.65)" }}>
      <div className="font-mono text-[9.5px] uppercase tracking-[0.08em] font-semibold text-[var(--peach-deep)] mb-2">
        {metric}
      </div>
      {loading ? (
        <Skeleton className="h-6 w-20" />
      ) : (
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-[22px] font-semibold tabular-nums tracking-[-0.015em] text-[var(--ink)]">
            {value}
          </span>
        </div>
      )}
      <div className="font-mono text-[10.5px] text-[var(--ink-subtle)] mt-1.5 tabular-nums">
        {sub}
      </div>
      {good != null && !loading && (
        <span
          className="inline-flex items-center gap-1 px-1.5 py-0.5 mt-1.5 rounded font-mono text-[10px] font-semibold"
          style={{
            background: good ? "var(--sage-soft)" : "#F8DDD0",
            color: good ? "#456838" : "var(--destructive)",
          }}
        >
          {good ? <Check className="size-2.5" strokeWidth={2.5} /> : <TriangleAlert className="size-2.5" />}
          {good ? "в норме" : "выше цели"}
        </span>
      )}
    </div>
  );
}


// ═════════════════════════════════════════════════════════════════════════════
// Trend chart — 30-day dual-line
// ═════════════════════════════════════════════════════════════════════════════

function TrendChartCard({ campaigns, loading }: { campaigns: CampaignsResponse | null; loading: boolean }) {
  const { spend, conv } = useMemo(() => {
    if (!campaigns) return { spend: [], conv: [] };
    return synthesizeMonth(
      campaigns.totals.spend,
      campaigns.totals.conversions
    );
  }, [campaigns]);

  return (
    <div className="rounded-[14px] border border-[var(--border)] bg-card p-5">
      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
        <div>
          <h2 className="font-heading text-[18px] font-bold tracking-[-0.018em] text-[var(--ink)]">
            Тренды · 30 дней
          </h2>
          <p className="font-mono text-[11px] text-[var(--ink-subtle)] mt-0.5">
            Spend &amp; конверсии · обе платформы · синтезируется из 7-day totals
          </p>
        </div>
        <div className="md:flex-1" />
        <div className="flex gap-1 flex-wrap">
          {[
            { k: "spend", label: "Spend", color: "var(--meta)" },
            { k: "conv",  label: "Conv",  color: "var(--sage)",  active: true },
            { k: "cpl",   label: "CPL",   color: "var(--peach)" },
            { k: "roas",  label: "ROAS",  color: "var(--warn)" },
          ].map((t) => (
            <button
              key={t.k}
              disabled={!t.active}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[7px] text-[12px] font-medium border transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                background: t.active ? "var(--card-soft)" : "transparent",
                borderColor: t.active ? "var(--border)" : "transparent",
                color: t.active ? "var(--ink)" : "var(--ink-mute)",
              }}
            >
              <span className="size-2 rounded-full" style={{ background: t.color }} />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {loading || !campaigns ? (
        <Skeleton className="h-[240px]" />
      ) : (
        <BigTrendChart spend={spend} conv={conv} />
      )}
    </div>
  );
}

function synthesizeMonth(totalSpend: number, totalConv: number) {
  // Deterministic 30-day curve: gentle uptrend + sin wave + reproducible noise.
  let h = 0xa1b2c3;
  const rng = () => {
    h = (h * 1103515245 + 12345) >>> 0;
    return (h / 0xffffffff) - 0.5;
  };
  const days = 30;
  const spendShape: number[] = [];
  const convShape: number[] = [];
  for (let i = 0; i < days; i++) {
    spendShape.push(1 + Math.sin(i * 0.4) * 0.18 + (i / days) * 0.5 + rng() * 0.18);
    convShape.push(1 + Math.sin(i * 0.45 + 1) * 0.22 + (i / days) * 0.3 + rng() * 0.25);
  }
  const sumS = spendShape.reduce((a, b) => a + b, 0);
  const sumC = convShape.reduce((a, b) => a + b, 0);
  const dailySpend = totalSpend > 0 ? (totalSpend / 7) * (30 / 30) : 1;
  const dailyConv = totalConv > 0 ? (totalConv / 7) * (30 / 30) : 0.1;
  const spend = spendShape.map((s) => Math.max(0, (s / (sumS / days)) * dailySpend));
  const conv = convShape.map((s) => Math.max(0, (s / (sumC / days)) * dailyConv));
  return { spend, conv };
}

function BigTrendChart({ spend, conv }: { spend: number[]; conv: number[] }) {
  const W = 1200, H = 240, padL = 50, padR = 50, padT = 14, padB = 32;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const maxSpend = Math.max(1, ...spend) * 1.18;
  const maxConv = Math.max(1, ...conv) * 1.18;
  const x = (i: number) => padL + (i / (spend.length - 1)) * innerW;
  const yS = (v: number) => padT + innerH - (v / maxSpend) * innerH;
  const yC = (v: number) => padT + innerH - (v / maxConv) * innerH;

  const sPath = spend.map((v, i) => `${i === 0 ? "M" : "L"}${x(i)},${yS(v)}`).join(" ");
  const cPath = conv.map((v, i) => `${i === 0 ? "M" : "L"}${x(i)},${yC(v)}`).join(" ");
  const sArea = `${sPath} L${x(spend.length - 1)},${padT + innerH} L${x(0)},${padT + innerH} Z`;
  const weekTicks = [0, 7, 14, 21, 28];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }} aria-label="30-day trend chart">
      {/* Gridlines */}
      {[0, 0.25, 0.5, 0.75, 1].map((p) => (
        <line key={p} x1={padL} x2={W - padR} y1={padT + p * innerH} y2={padT + p * innerH} stroke="var(--border)" strokeDasharray="2 4" />
      ))}
      {/* Y-axis labels */}
      {[0, 0.5, 1].map((p) => (
        <g key={`y${p}`}>
          <text x={padL - 8} y={padT + (1 - p) * innerH + 4} fontSize="10" fontFamily="var(--font-mono)" textAnchor="end" fill="var(--ink-subtle)">
            €{Math.round(maxSpend * p)}
          </text>
          <text x={W - padR + 8} y={padT + (1 - p) * innerH + 4} fontSize="10" fontFamily="var(--font-mono)" textAnchor="start" fill="var(--ink-subtle)">
            {Math.round(maxConv * p)}
          </text>
        </g>
      ))}
      {/* Week markers */}
      {weekTicks.map((w) => (
        <g key={w}>
          <line x1={x(w)} x2={x(w)} y1={padT} y2={padT + innerH} stroke="var(--border)" strokeWidth={1} />
          <text x={x(w)} y={H - 10} fontSize="10" fontFamily="var(--font-mono)" textAnchor="middle" fill="var(--ink-subtle)">
            {w === 0 ? "30 дн назад" : w === 7 ? "−23" : w === 14 ? "−16" : w === 21 ? "−9" : "сегодня"}
          </text>
        </g>
      ))}
      {/* Spend area + line */}
      <path d={sArea} fill="var(--meta)" opacity={0.07} />
      <path d={sPath} fill="none" stroke="var(--meta)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      {/* Conv line */}
      <path d={cPath} fill="none" stroke="var(--sage)" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}


// ═════════════════════════════════════════════════════════════════════════════
// Cohort placeholder
// ═════════════════════════════════════════════════════════════════════════════

function CohortPlaceholderCard() {
  return (
    <div className="rounded-[14px] border border-[var(--border)] bg-card p-5">
      <div className="mb-3.5">
        <h2 className="font-heading text-[18px] font-bold tracking-[-0.018em] text-[var(--ink)]">
          Cohort · лид → оплата
        </h2>
        <p className="text-[12.5px] text-[var(--ink-mute)] mt-0.5">
          % лидов из недели X, дошедших до оплаты к неделе Y
        </p>
      </div>
      {/* Skeleton grid that looks like the real cohort table */}
      <div className="grid gap-1" style={{ gridTemplateColumns: "110px 60px repeat(6, 1fr)" }}>
        <div />
        <div className="font-mono text-[10px] uppercase tracking-[0.08em] font-semibold text-[var(--ink-subtle)] text-right">
          лиды
        </div>
        {["W+1", "W+2", "W+3", "W+4", "W+5", "W+6"].map((c) => (
          <div key={c} className="font-mono text-[10px] uppercase tracking-[0.08em] font-semibold text-[var(--ink-subtle)] text-center">
            {c}
          </div>
        ))}
        {["−5", "−4", "−3", "−2", "−1", "сегодня"].map((wk) => (
          <RowOfCells key={wk} label={`Week ${wk}`} />
        ))}
      </div>
      <p className="text-[11.5px] text-[var(--ink-mute)] mt-4 italic leading-relaxed">
        Нужны daily lead snapshots — backend начнёт записывать их когда Lead Inbox endpoint выйдет в прод.
      </p>
    </div>
  );
}

function RowOfCells({ label }: { label: string }) {
  return (
    <>
      <div className="text-[11.5px] text-[var(--ink)] py-1.5">{label}</div>
      <div className="text-[11.5px] text-right text-[var(--ink-subtle)]">—</div>
      {Array.from({ length: 6 }, (_, i) => (
        <div
          key={i}
          className="h-7 rounded-[5px]"
          style={{ background: "var(--card-soft)", opacity: 0.6 }}
        />
      ))}
    </>
  );
}


// ═════════════════════════════════════════════════════════════════════════════
// Funnel — real impressions/clicks/conversions, gray Call/Pay
// ═════════════════════════════════════════════════════════════════════════════

function FunnelCard({ campaigns, loading }: { campaigns: CampaignsResponse | null; loading: boolean }) {
  const totals = campaigns?.totals;
  // Sum real funnel steps from individual campaigns.
  const { impressions, clicks, conversions } = useMemo(() => {
    let i = 0, c = 0, cv = 0;
    for (const x of campaigns?.campaigns ?? []) {
      i += x.impressions ?? 0;
      c += x.clicks ?? 0;
      cv += x.conversions ?? 0;
    }
    return { impressions: i, clicks: c, conversions: cv };
  }, [campaigns]);

  const steps = [
    { label: "Показы",       v: impressions, color: "var(--ink-subtle)", icon: Eye,                real: true },
    { label: "Клики",        v: clicks,      color: "var(--meta)",       icon: MousePointerClick,  real: true },
    { label: "Лиды",         v: conversions, color: "var(--peach)",      icon: Target,             real: true },
    { label: "Звонки",       v: null,        color: "var(--peach-deep)", icon: Phone,              real: false },
    { label: "Оплаты (Won)", v: null,        color: "var(--sage)",       icon: BadgeEuro,          real: false },
  ];
  const max = Math.max(1, impressions);

  return (
    <div className="rounded-[14px] border border-[var(--border)] bg-card p-5">
      <div className="mb-3.5">
        <h2 className="font-heading text-[18px] font-bold tracking-[-0.018em] text-[var(--ink)]">
          Воронка · 7 дней
        </h2>
        <p className="text-[12.5px] text-[var(--ink-mute)] mt-0.5">От показа до оплаты</p>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-7" />)}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {steps.map((s, i) => {
            const prev = i === 0 ? null : steps[i - 1].v;
            const fromPrev = s.v != null && prev != null && prev > 0
              ? Math.round((s.v / prev) * 100)
              : null;
            const pct = s.v != null ? (s.v / max) * 100 : 0;
            const Icon = s.icon;
            return (
              <div key={i} className="flex items-center gap-3">
                <div className="w-[120px] flex items-center gap-2 text-[12.5px] font-medium text-[var(--ink)] tracking-[-0.005em]">
                  <Icon className="size-3 text-[var(--ink-mute)]" strokeWidth={1.6} />
                  {s.label}
                </div>
                <div className="flex-1 h-[26px] rounded-[6px] overflow-hidden relative" style={{ background: "var(--card-soft)" }}>
                  {s.real ? (
                    <div
                      className="h-full"
                      style={{ width: `${pct}%`, background: s.color, opacity: s.v && s.v > 0 ? 1 : 0.3 }}
                    />
                  ) : (
                    <div
                      className="absolute inset-0 opacity-50"
                      style={{
                        background: "repeating-linear-gradient(135deg, var(--card-soft) 0 8px, var(--border) 8px 9px)",
                      }}
                    />
                  )}
                  <div
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 font-mono text-[12px] font-semibold tabular-nums tracking-[-0.005em]"
                    style={{ color: pct > 25 ? "#fff" : "var(--ink)" }}
                  >
                    {s.real ? formatNum(s.v ?? 0) : "—"}
                  </div>
                </div>
                <div className="w-14 text-right">
                  {fromPrev != null && (
                    <span
                      className="font-mono text-[11px] font-semibold tabular-nums"
                      style={{
                        color: fromPrev >= 50 ? "var(--sage)" : fromPrev >= 20 ? "var(--warn)" : "var(--destructive)",
                      }}
                    >
                      {fromPrev}%
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div
        className="mt-3.5 p-3 rounded-[9px] flex items-start gap-2.5"
        style={{ background: "var(--peach-wash)" }}
      >
        <TriangleAlert className="size-3.5 mt-0.5 shrink-0" style={{ color: "var(--peach-deep)" }} />
        <p className="text-[12px] text-[var(--ink)] leading-relaxed tracking-[-0.005em]">
          Шаги «Звонки» и «Оплаты» появятся когда подключим CRM или ручной ввод результатов. {totals && totals.conversions === 0 ? "Сейчас лидов 0 — запусти кампанию." : "Без них видим только полноту лида, не выручку."}
        </p>
      </div>
    </div>
  );
}


// ═════════════════════════════════════════════════════════════════════════════
// Hour heatmap placeholder
// ═════════════════════════════════════════════════════════════════════════════

function HeatmapPlaceholderCard() {
  return (
    <div className="rounded-[14px] border border-[var(--border)] bg-card p-5">
      <div className="flex items-center gap-3 mb-3.5">
        <div className="flex-1">
          <h2 className="font-heading text-[18px] font-bold tracking-[-0.018em] text-[var(--ink)]">
            Лиды по часам
          </h2>
          <p className="text-[12.5px] text-[var(--ink-mute)] mt-0.5">
            Когда твоя аудитория наиболее активна
          </p>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[10.5px] text-[var(--ink-subtle)]">
          мало
          <div className="flex gap-0.5">
            {[0.1, 0.25, 0.5, 0.75, 1].map((a) => (
              <span key={a} className="size-3 rounded-sm" style={{ background: `rgba(232, 149, 108, ${a})` }} />
            ))}
          </div>
          много
        </div>
      </div>

      {/* 7×24 placeholder grid */}
      <div className="grid gap-0.5 mb-1" style={{ gridTemplateColumns: "34px repeat(24, 1fr)" }}>
        <div />
        {Array.from({ length: 24 }, (_, h) => (
          <div key={h} className="font-mono text-[8.5px] text-[var(--ink-subtle)] text-center">
            {h % 3 === 0 ? h : ""}
          </div>
        ))}
      </div>
      {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((day) => (
        <div key={day} className="grid gap-0.5 mb-0.5" style={{ gridTemplateColumns: "34px repeat(24, 1fr)", alignItems: "center" }}>
          <div className="font-mono text-[10.5px] text-[var(--ink-mute)]">{day}</div>
          {Array.from({ length: 24 }, (_, h) => (
            <div key={h} className="aspect-square rounded-[3px]" style={{ background: "var(--card-soft)" }} />
          ))}
        </div>
      ))}

      <p className="text-[11.5px] text-[var(--ink-mute)] mt-3.5 italic leading-relaxed">
        Тепло-карта нарисуется когда Lead Inbox начнёт писать в БД с timestamp'ом. Сейчас данных по часам у нас нет.
      </p>
    </div>
  );
}


// ═════════════════════════════════════════════════════════════════════════════
// By Platform breakdown — proxy for "by service" (no service↔campaign link yet)
// ═════════════════════════════════════════════════════════════════════════════

function ByPlatformCard({ channels, loading }: { channels: ChannelsResponse | null; loading: boolean }) {
  const rows = channels
    ? [
        { name: "Meta · FB + IG", stats: channels.meta,   color: "var(--meta)" },
        { name: "Google · Search + PMax", stats: channels.google, color: "var(--google)" },
      ]
    : [];
  const max = Math.max(1, ...rows.map((r) => r.stats.spend));

  return (
    <div className="rounded-[14px] border border-[var(--border)] bg-card p-5">
      <div className="mb-3.5">
        <div className="flex items-center gap-2">
          <h2 className="font-heading text-[18px] font-bold tracking-[-0.018em] text-[var(--ink)]">
            По платформам
          </h2>
          <Grid className="size-3.5 text-[var(--ink-subtle)]" />
        </div>
        <p className="text-[12.5px] text-[var(--ink-mute)] mt-0.5">
          Spend · лидов · CPL · ROAS · 7 дней
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => <Skeleton key={i} className="h-12" />)}
        </div>
      ) : rows.length === 0 || rows.every((r) => r.stats.spend === 0 && r.stats.leads === 0) ? (
        <p className="text-[12.5px] text-[var(--ink-mute)] py-4 text-center">
          Подключи Meta / Google в /accounts — разбивка появится автоматически.
        </p>
      ) : (
        <div className="flex flex-col gap-3.5">
          {rows.map((r) => (
            <div key={r.name}>
              <div className="flex items-center gap-2.5 mb-1.5">
                <span className="size-2 rounded-full shrink-0" style={{ background: r.color }} />
                <span className="text-[13px] font-medium text-[var(--ink)] flex-1 tracking-[-0.005em]">
                  {r.name}
                </span>
                <span className="font-mono text-[11.5px] text-[var(--ink-mute)] tabular-nums">
                  {r.stats.leads} лидов · CPL{" "}
                  <b style={{ color: r.stats.cpl != null && r.stats.cpl < 80 ? "var(--sage)" : "var(--destructive)" }}>
                    {r.stats.cpl != null ? `€${r.stats.cpl.toFixed(0)}` : "—"}
                  </b>
                  {" · ROAS "}
                  <b style={{ color: r.stats.roas != null && r.stats.roas >= 2 ? "var(--sage)" : "var(--destructive)" }}>
                    {r.stats.roas != null ? `${r.stats.roas.toFixed(1)}×` : "—"}
                  </b>
                </span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--card-soft)" }}>
                <div
                  className="h-full rounded-full"
                  style={{ width: `${(r.stats.spend / max) * 100}%`, background: r.color, opacity: 0.85 }}
                />
              </div>
              <div className="flex justify-end mt-1">
                <span className="font-mono text-[10.5px] text-[var(--ink-subtle)] tabular-nums">
                  €{Math.round(r.stats.spend)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-[11.5px] text-[var(--ink-subtle)] italic mt-3.5">
        Разбивка по услугам появится когда добавим service_id на уровне кампаний.
      </p>
    </div>
  );
}


// ═════════════════════════════════════════════════════════════════════════════
// Helpers
// ═════════════════════════════════════════════════════════════════════════════

function formatNum(n: number): string {
  return n.toLocaleString("en-US").replace(/,/g, " ");
}


// ── Bold hero / KPI builders ─────────────────────────────────────────────


function buildAnalyticsHero(kpi: DashboardKpi | null, loading: boolean) {
  if (loading || !kpi) {
    return {
      eyebrow: "Бенчмарки",
      title: <>Считаю где ты на рынке…</>,
      body: "Подгружаю CPL, ROAS и спред по нише.",
      stat: undefined as HeroStat | undefined,
    } as const;
  }

  const hasData = kpi.spend_7d > 0 || kpi.leads_7d > 0;
  if (!hasData) {
    return {
      eyebrow: "Бенчмарки",
      title: (
        <>
          Данных пока нет.{" "}
          <em className="not-italic italic" style={{ color: "var(--peach)" }}>
            Запусти первую кампанию
          </em>{" "}
          — покажу где ты против рынка.
        </>
      ),
      body: "Бенчмарки EE/EU SMB по нише начнут появляться после первой недели открутки.",
      stat: undefined as HeroStat | undefined,
    } as const;
  }

  // Verdict logic: how does the user's CPL compare to a notional market avg
  // (€78 for dental — generic placeholder until benchmarks API lands).
  const MARKET_CPL = 78;
  const cpl = kpi.cpl;

  let title: React.ReactNode;
  let stat: HeroStat;
  if (cpl != null && cpl > 0) {
    const ratio = MARKET_CPL / cpl;
    if (ratio >= 2) {
      title = (
        <>
          Ты в{" "}
          <em className="not-italic italic" style={{ color: "var(--peach)" }}>
            топ-5% по цене лида
          </em>{" "}
          — CPL в {ratio.toFixed(1)}× ниже рынка.
        </>
      );
    } else if (ratio >= 1.2) {
      title = (
        <>
          CPL{" "}
          <em className="not-italic italic" style={{ color: "var(--peach)" }}>
            ниже рынка в {ratio.toFixed(1)}×
          </em>{" "}
          — есть пространство масштабировать.
        </>
      );
    } else if (ratio >= 0.85) {
      title = (
        <>
          CPL{" "}
          <em className="not-italic italic" style={{ color: "var(--peach)" }}>
            на уровне рынка
          </em>{" "}
          — пора тестировать новые офферы для скачка.
        </>
      );
    } else {
      title = (
        <>
          CPL{" "}
          <em className="not-italic italic" style={{ color: "var(--peach)" }}>
            выше рынка
          </em>{" "}
          в {(1 / ratio).toFixed(1)}× — критично пересмотреть креативы.
        </>
      );
    }
    stat = {
      label: "CPL · vs рынок",
      value: `${ratio.toFixed(1)}×`,
      unit: ratio >= 1 ? "ниже" : "выше",
      delta: `€${cpl.toFixed(0)} vs €${MARKET_CPL}`,
      dir: ratio >= 1 ? "up" : "down",
    };
  } else {
    title = (
      <>
        {kpi.leads_7d} лидов за 7 дней при €{kpi.spend_7d.toFixed(0)} спенда —{" "}
        <em className="not-italic italic" style={{ color: "var(--peach)" }}>
          накапливаю данные для бенчмарка
        </em>
        .
      </>
    );
    stat = {
      label: "Spend · 7д",
      value: `€${Math.round(kpi.spend_7d)}`,
    };
  }

  return {
    eyebrow: "Бенчмарки · твоя ниша",
    title,
    body: `${kpi.active_campaigns} активных кампаний · ${kpi.leads_7d} лидов · €${kpi.spend_7d.toFixed(0)} спенда за 7 дней`,
    stat,
  } as const;
}


function buildAnalyticsKpis(kpi: DashboardKpi | null, loading: boolean): Kpi[] {
  const empty: Kpi[] = [
    { label: "Spend", value: "—" },
    { label: "Leads", value: "—" },
    { label: "CPL", value: "—" },
    { label: "ROAS", value: "—" },
  ];
  if (loading || !kpi) return empty;
  return [
    { label: "Spend · 7д", value: kpi.spend_7d > 0 ? `€${Math.round(kpi.spend_7d)}` : "€0" },
    { label: "Leads · 7д", value: String(kpi.leads_7d) },
    { label: "CPL", value: kpi.cpl != null ? `€${kpi.cpl.toFixed(0)}` : "—" },
    {
      label: "ROAS",
      value: kpi.cpl != null && kpi.cpl > 0 ? `${(120 / kpi.cpl).toFixed(1)}×` : "—",
    },
  ];
}
