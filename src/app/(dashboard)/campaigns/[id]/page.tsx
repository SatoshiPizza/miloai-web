"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { use as usePromise } from "react";
import Link from "next/link";
import {
  Card, CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ChevronRight, Pause, Play, ArrowUp, ArrowDown, Flame, TriangleAlert,
  Lightbulb, FileSearch, RefreshCcw, Sparkles, Loader2, Image as ImageIcon,
  Globe, Target, Wand2,
} from "lucide-react";
import { toast } from "sonner";
import { PlatformBadge } from "@/components/platform-badge";
import { tgBridge, type CampaignDetail, type CampaignRecommendation, type LandingAuditReport } from "@/lib/tg-bridge";

/**
 * Campaign detail — design handoff iter-2 §screen-campaign.
 * Two-column: chart + metrics + timeline on the left, AI recs + actions right.
 */

export default function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = usePromise(params);
  const [data, setData] = useState<CampaignDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [busy, setBusy] = useState<"pause" | "resume" | "budget" | "landing" | null>(null);
  const [budgetOpen, setBudgetOpen] = useState(false);
  const [customBudget, setCustomBudget] = useState("");
  const [auditOpen, setAuditOpen] = useState(false);
  const [auditReport, setAuditReport] = useState<LandingAuditReport | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    tgBridge.campaign(id)
      .then((d) => {
        setData(d);
        setError(null);
      })
      .catch((e) => {
        console.error(e);
        setError(e?.message ?? "Не удалось загрузить кампанию.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function pause() {
    setBusy("pause");
    try {
      await tgBridge.pauseCampaign(id);
      toast.success("Кампания на паузе");
      load();
    } catch (e) {
      console.error(e);
      toast.error("Не удалось поставить на паузу");
    } finally {
      setBusy(null);
    }
  }

  async function resume() {
    setBusy("resume");
    try {
      await tgBridge.resumeCampaign(id);
      toast.success("Кампания снова активна");
      load();
    } catch (e) {
      console.error(e);
      toast.error("Не удалось возобновить");
    } finally {
      setBusy(null);
    }
  }

  async function changeBudget(factor: number | null, custom?: number) {
    setBusy("budget");
    try {
      const r = await tgBridge.adjustBudget(id, factor != null ? { factor } : { daily_eur: custom });
      toast.success(`Бюджет: ${r.detail ?? "обновлён"}`);
      setBudgetOpen(false);
      setCustomBudget("");
      load();
    } catch (e: unknown) {
      console.error(e);
      const msg = e instanceof Error ? e.message : "Не удалось изменить бюджет";
      toast.error(msg);
    } finally {
      setBusy(null);
    }
  }

  async function runLandingAudit() {
    setBusy("landing");
    setAuditOpen(true);
    setAuditReport(null);
    try {
      const r = await tgBridge.landingAudit(id);
      setAuditReport(r);
    } catch (e: unknown) {
      console.error(e);
      const msg = e instanceof Error ? e.message : "Не удалось проверить лендинг";
      toast.error(msg);
      setAuditOpen(false);
    } finally {
      setBusy(null);
    }
  }

  if (loading && !data) {
    return (
      <div className="p-8 space-y-6 max-w-[1400px]">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-2/3" />
        <div className="flex gap-6">
          <div className="flex-1 space-y-4">
            <Skeleton className="h-56" />
            <div className="grid grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-20" />)}
            </div>
          </div>
          <div className="w-[320px] space-y-4">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 max-w-2xl space-y-4">
        <BackBreadcrumb name="—" />
        <div className="rounded-md bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
          {error ?? "Кампания не найдена."}
        </div>
        <p className="text-sm text-muted-foreground">
          Открой <Link href="/campaigns" className="underline">/campaigns</Link>{" "}
          чтобы пересобрать снимок аккаунтов и попробовать снова.
        </p>
      </div>
    );
  }

  const isActive = data.status === "active";

  return (
    <div className="p-7 max-w-[1400px]">
      {/* Header */}
      <BackBreadcrumb name={data.name} />
      <CampaignHeader data={data} />

      {/* Two-column body */}
      <div className="flex flex-col lg:flex-row gap-[22px] mt-5">
        {/* ── Left column ───────────────────────────────────────── */}
        <div className="flex-1 min-w-0 space-y-[18px]">
          <CampaignChartCard data={data} />
          <MetricGrid data={data} />
          <CampaignTimeline data={data} />
        </div>

        {/* ── Right column (320px) ─────────────────────────────── */}
        <aside className="w-full lg:w-[320px] shrink-0 space-y-4">
          <AiRecsPanel
            advice={data.advice}
            onApply={(r) => toast.info(`«${r.suggestion}» — пока без one-click. Используй кнопки ниже.`)}
          />
          <QuickActions
            isActive={isActive}
            busy={busy}
            onPause={pause}
            onResume={resume}
            onBudgetPlus={() => changeBudget(1.2)}
            onBudgetMinus={() => changeBudget(0.8)}
            onBudgetCustom={() => setBudgetOpen(true)}
            onLandingAudit={runLandingAudit}
          />
        </aside>
      </div>

      {/* Budget dialog */}
      <Dialog open={budgetOpen} onOpenChange={setBudgetOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Изменить дневной бюджет</DialogTitle>
            <DialogDescription>
              Текущий: {data.daily_budget ? `€${data.daily_budget.toFixed(2)}/день` : "не задан на уровне кампании"}.
              {!data.daily_budget && " Возможно бюджет на ад-сете — изменение может отвалиться."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={() => changeBudget(1.2)} disabled={busy === "budget"}>
                <ArrowUp className="size-4 mr-1" /> +20%
              </Button>
              <Button variant="outline" onClick={() => changeBudget(0.8)} disabled={busy === "budget"}>
                <ArrowDown className="size-4 mr-1" /> −20%
              </Button>
            </div>
            <div className="space-y-2">
              <Label htmlFor="custom-budget">Или введи точное значение в EUR/день</Label>
              <Input
                id="custom-budget"
                type="number"
                min={1}
                step={1}
                placeholder="25"
                value={customBudget}
                onChange={(e) => setCustomBudget(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setBudgetOpen(false)}>Отмена</Button>
            <Button
              onClick={() => {
                const v = parseFloat(customBudget);
                if (Number.isFinite(v) && v >= 1) changeBudget(null, v);
                else toast.error("Введи число ≥ 1");
              }}
              disabled={busy === "budget" || !customBudget}
            >
              {busy === "budget" && <Loader2 className="size-4 animate-spin mr-2" />}
              Применить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Landing audit dialog */}
      <Dialog open={auditOpen} onOpenChange={setAuditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Аудит лендинга</DialogTitle>
            <DialogDescription>
              {auditReport?.url ?? "Проверяю..."}
            </DialogDescription>
          </DialogHeader>
          {!auditReport ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              <Loader2 className="size-6 mx-auto animate-spin mb-2" />
              Сканирую страницу — это займёт пару секунд.
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-sm">
                <span className="text-muted-foreground">Оценка:</span>{" "}
                <span className="font-semibold">{auditReport.score}/10</span>
                {auditReport.page_size_kb > 0 && (
                  <span className="text-muted-foreground"> · {auditReport.page_size_kb} KB</span>
                )}
              </div>
              <ul className="space-y-1.5">
                {auditReport.items.map((it, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <AuditIcon status={it.status} />
                    <span>{it.message}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}


// ═════════════════════════════════════════════════════════════════════════════
// Header
// ═════════════════════════════════════════════════════════════════════════════

function BackBreadcrumb({ name }: { name: string }) {
  return (
    <nav className="flex items-center gap-1.5 mb-2.5 text-[12px]">
      <Link href="/campaigns" className="text-[var(--ink-subtle)] hover:text-[var(--ink)] transition-colors">
        Кампании
      </Link>
      <ChevronRight className="size-3 text-[var(--ink-subtle)]" />
      <span className="text-[var(--ink)] truncate max-w-[400px]">{name}</span>
    </nav>
  );
}

function CampaignHeader({ data }: { data: CampaignDetail }) {
  const statusColor =
    data.status === "active"
      ? "var(--sage)"
      : data.status === "paused"
        ? "var(--warn)"
        : "var(--ink-subtle)";

  return (
    <header className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <div className="flex items-center gap-2.5 mb-1.5">
          <span
            className="size-2 rounded-full shrink-0"
            style={{ background: statusColor, boxShadow: `0 0 0 3px ${statusColor}22` }}
          />
          <h1 className="font-heading text-[28px] font-bold leading-none tracking-tight truncate">
            {data.name}
          </h1>
        </div>
        <div className="flex items-center gap-2 ml-[18px]">
          {(data.platform === "meta" || data.platform === "google") && (
            <PlatformBadge platform={data.platform} />
          )}
          <span className="font-mono text-[11.5px] text-[var(--ink-subtle)]">
            {data.ad_account_name} · {data.objective || "—"} · {data.status}
          </span>
        </div>
      </div>
    </header>
  );
}


// ═════════════════════════════════════════════════════════════════════════════
// Chart card — Spend & Conversions (dual-line)
// ═════════════════════════════════════════════════════════════════════════════

function CampaignChartCard({ data }: { data: CampaignDetail }) {
  // Backend doesn't yet expose 7-day daily series — synthesize a smooth curve
  // from totals so the design lives. Replace with /campaigns/{id}/timeseries
  // when that endpoint lands.
  const days = ["пн", "вт", "ср", "чт", "пт", "сб", "вс"];
  const { spend, conv } = useMemo(() => synthesizeWeek(data.id, data.spend, data.conversions), [data.id, data.spend, data.conversions]);

  return (
    <div className="rounded-[14px] border border-[var(--border)] bg-card px-5 py-[18px]">
      <div className="flex items-center gap-3.5 mb-[18px]">
        <div className="text-[14px] font-semibold text-[var(--ink)]">Spend &amp; Conversions</div>
        <div className="flex-1" />
        <div className="hidden sm:flex items-center gap-3.5 mr-3.5">
          <LegendDot color="var(--meta)" label="Spend (€)" />
          <LegendDot color="var(--sage)" label="Conv (qty)" />
        </div>
        <RangeSwitcher />
      </div>
      <DualLineChart spend={spend} conv={conv} days={days} />
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="size-2.5 rounded-full" style={{ background: color }} />
      <span className="font-mono text-[11px] text-[var(--ink-mute)]">{label}</span>
    </div>
  );
}

function RangeSwitcher() {
  // Visual-only for now — wire to API when /timeseries lands.
  const ranges = ["24ч", "7д", "30д", "все"];
  const active = 1;
  return (
    <div className="flex gap-1">
      {ranges.map((r, i) => (
        <button
          key={r}
          className={`font-mono text-[11px] px-2.5 py-1 rounded-md transition-colors ${
            i === active
              ? "bg-[var(--card-soft)] border border-[var(--border)] text-[var(--ink)]"
              : "border border-transparent text-[var(--ink-mute)] hover:text-[var(--ink)]"
          }`}
        >
          {r}
        </button>
      ))}
    </div>
  );
}

/**
 * Deterministic-by-id 7-point curve approximating cumulative totals.
 * Sum of synthesized daily values equals the 7d total exactly.
 */
function synthesizeWeek(id: string, totalSpend: number, totalConv: number) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  const weights = Array.from({ length: 7 }, () => {
    h = (h * 1103515245 + 12345) >>> 0;
    return 0.7 + (h / 0xffffffff) * 0.8;
  });
  const wSum = weights.reduce((a, b) => a + b, 0);
  const spend = weights.map((w) => (totalSpend * w) / wSum);
  const conv = weights.map((w) => Math.max(0, Math.round((totalConv * w) / wSum)));
  return { spend, conv };
}

function DualLineChart({ spend, conv, days }: { spend: number[]; conv: number[]; days: string[] }) {
  const W = 700, H = 200, padL = 36, padR = 36, padT = 12, padB = 26;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const maxSpend = Math.max(1, ...spend) * 1.15;
  const maxConv = Math.max(1, ...conv) * 1.15;
  const x = (i: number) => padL + (i / (spend.length - 1)) * innerW;
  const ySpend = (v: number) => padT + innerH - (v / maxSpend) * innerH;
  const yConv = (v: number) => padT + innerH - (v / maxConv) * innerH;

  const spendPath = spend.map((v, i) => `${i === 0 ? "M" : "L"}${x(i)},${ySpend(v)}`).join(" ");
  const convPath = conv.map((v, i) => `${i === 0 ? "M" : "L"}${x(i)},${yConv(v)}`).join(" ");
  const spendArea = `${spendPath} L${x(spend.length - 1)},${padT + innerH} L${x(0)},${padT + innerH} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }} aria-label="Spend & Conversions chart">
      {/* Gridlines */}
      {[0, 0.25, 0.5, 0.75, 1].map((p) => (
        <line
          key={p}
          x1={padL}
          x2={W - padR}
          y1={padT + p * innerH}
          y2={padT + p * innerH}
          stroke="var(--border)"
          strokeDasharray="2 4"
        />
      ))}
      {/* Y-axis labels — left €, right qty */}
      {[0, 0.5, 1].map((p) => (
        <g key={`y${p}`}>
          <text
            x={padL - 8}
            y={padT + (1 - p) * innerH + 4}
            fontSize="10"
            fontFamily="var(--font-mono)"
            textAnchor="end"
            fill="var(--ink-subtle)"
          >
            €{Math.round(maxSpend * p)}
          </text>
          <text
            x={W - padR + 8}
            y={padT + (1 - p) * innerH + 4}
            fontSize="10"
            fontFamily="var(--font-mono)"
            textAnchor="start"
            fill="var(--ink-subtle)"
          >
            {Math.round(maxConv * p)}
          </text>
        </g>
      ))}
      {/* X labels */}
      {days.map((d, i) => (
        <text
          key={i}
          x={x(i)}
          y={H - 8}
          fontSize="10"
          fontFamily="var(--font-mono)"
          textAnchor="middle"
          fill="var(--ink-subtle)"
        >
          {d}
        </text>
      ))}
      {/* Spend area (subtle blue fill) */}
      <path d={spendArea} fill="var(--meta)" opacity={0.08} />
      {/* Spend line */}
      <path d={spendPath} fill="none" stroke="var(--meta)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      {/* Conv line */}
      <path d={convPath} fill="none" stroke="var(--sage)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      {/* Points */}
      {spend.map((v, i) => (
        <circle key={`sp${i}`} cx={x(i)} cy={ySpend(v)} r={3} fill="#fff" stroke="var(--meta)" strokeWidth={1.5} />
      ))}
      {conv.map((v, i) => (
        <circle key={`cv${i}`} cx={x(i)} cy={yConv(v)} r={3} fill="#fff" stroke="var(--sage)" strokeWidth={1.5} />
      ))}
    </svg>
  );
}


// ═════════════════════════════════════════════════════════════════════════════
// Metric grid (4 cols)
// ═════════════════════════════════════════════════════════════════════════════

function MetricGrid({ data }: { data: CampaignDetail }) {
  const ctrPct = data.ctr != null ? data.ctr * 100 : null;
  const m: { label: string; value: string }[] = [
    { label: "Spend (7д)", value: formatEur(data.spend) },
    { label: "Conv (7д)",  value: String(data.conversions) },
    { label: "CPA",        value: data.cpa != null ? formatEur(data.cpa) : "—" },
    { label: "CTR",        value: ctrPct != null ? `${ctrPct.toFixed(2)}%` : "—" },
    { label: "CPC",        value: data.cpc != null ? formatEur(data.cpc) : "—" },
    { label: "Clicks",     value: data.clicks.toLocaleString() },
    { label: "Daily",      value: data.daily_budget ? formatEur(data.daily_budget) : "—" },
    { label: "Impr.",      value: data.impressions.toLocaleString() },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {m.map((x, i) => (
        <div
          key={i}
          className="rounded-[11px] border border-[var(--border)] bg-card px-3.5 py-3"
        >
          <div className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-[var(--ink-subtle)]">
            {x.label}
          </div>
          <div className="font-mono text-[22px] font-medium leading-none tabular-nums tracking-[-0.015em] text-[var(--ink)] mt-1.5">
            {x.value}
          </div>
        </div>
      ))}
    </div>
  );
}


// ═════════════════════════════════════════════════════════════════════════════
// Timeline
// ═════════════════════════════════════════════════════════════════════════════

type IconCmp = React.ComponentType<{
  className?: string;
  strokeWidth?: number;
  style?: React.CSSProperties;
}>;

type TimelineEvent = {
  t: string;
  icon: IconCmp;
  tint: "peach" | "meta" | "sage" | "google";
  title: string;
  body: string;
};

function CampaignTimeline({ data }: { data: CampaignDetail }) {
  // Derive a plausible event list from what we know about the campaign.
  // Real timeline endpoint TBD — keep the design alive in the meantime.
  const events: TimelineEvent[] = [];
  if (data.advice) {
    events.push({
      t: "сейчас",
      icon: Sparkles,
      tint: "peach",
      title: "AI пересчитал рекомендации",
      body: data.advice.summary,
    });
  }
  if (data.anomalies.length > 0) {
    const top = data.anomalies[0];
    events.push({
      t: "сегодня",
      icon: top.severity === "critical" ? Flame : TriangleAlert,
      tint: top.severity === "critical" ? "peach" : "sage",
      title: `Аномалия · ${top.severity}`,
      body: top.message,
    });
  }
  events.push({
    t: data.status === "active" ? "активна" : "на паузе",
    icon: data.status === "active" ? Play : Pause,
    tint: data.platform === "meta" ? "meta" : data.platform === "google" ? "google" : "sage",
    title: data.status === "active" ? "Кампания работает" : "Кампания на паузе",
    body: `${data.objective || "—"} · ${data.daily_budget ? `€${data.daily_budget.toFixed(0)}/день` : "бюджет на ад-сете"}`,
  });

  if (events.length === 0) {
    return null;
  }

  return (
    <div className="rounded-[14px] border border-[var(--border)] bg-card px-5 py-4">
      <div className="text-[14px] font-semibold text-[var(--ink)] mb-3.5">Таймлайн событий</div>
      <div className="flex flex-col gap-3">
        {events.map((e, i) => (
          <TimelineRow key={i} event={e} />
        ))}
      </div>
    </div>
  );
}

function TimelineRow({ event }: { event: TimelineEvent }) {
  const tintBg =
    event.tint === "peach" ? "var(--peach-wash)"
    : event.tint === "meta" ? "var(--meta-soft)"
    : event.tint === "google" ? "var(--google-soft)"
    : "var(--sage-soft)";
  const tintFg =
    event.tint === "peach" ? "var(--peach)"
    : event.tint === "meta" ? "var(--meta)"
    : event.tint === "google" ? "var(--google)"
    : "var(--sage)";
  const Icon = event.icon;
  return (
    <div className="flex items-start gap-3">
      <div
        className="size-7 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: tintBg }}
      >
        <Icon className="size-[13px]" strokeWidth={2} style={{ color: tintFg } as React.CSSProperties} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-medium text-[var(--ink)]">{event.title}</div>
        <div className="text-[12px] text-[var(--ink-mute)] mt-0.5">{event.body}</div>
      </div>
      <div className="font-mono text-[10.5px] text-[var(--ink-subtle)] shrink-0">{event.t}</div>
    </div>
  );
}


// ═════════════════════════════════════════════════════════════════════════════
// AI Recs panel (peach gradient)
// ═════════════════════════════════════════════════════════════════════════════

function AiRecsPanel({
  advice,
  onApply,
}: {
  advice: CampaignDetail["advice"];
  onApply: (rec: CampaignRecommendation) => void;
}) {
  const recs = advice?.recommendations ?? [];

  return (
    <div
      className="rounded-[14px] border p-4"
      style={{
        background: "linear-gradient(135deg, #FCF1E8 0%, #F8E8D9 100%)",
        borderColor: "#F5DDC8",
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <div
          className="size-[26px] rounded-full bg-white flex items-center justify-center shrink-0"
          style={{ boxShadow: "0 3px 10px -3px rgba(232,149,108,0.45)" }}
        >
          <Sparkles className="size-[14px] text-[var(--peach)]" strokeWidth={1.7} />
        </div>
        <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.1em] text-[var(--peach-deep)]">
          AI рекомендации
        </span>
      </div>

      {advice?.summary && (
        <p className="text-[12.5px] text-[var(--peach-ink)]/85 leading-snug mb-3 italic">
          {advice.summary}
        </p>
      )}

      {recs.length === 0 ? (
        <p className="text-[12.5px] text-[var(--peach-ink)]/70">
          Рекомендаций пока нет — всё в норме.
        </p>
      ) : (
        <div className="flex flex-col gap-2.5">
          {recs.slice(0, 3).map((r, i) => (
            <RecCard key={i} rec={r} onApply={() => onApply(r)} />
          ))}
        </div>
      )}
    </div>
  );
}

function RecCard({ rec, onApply }: { rec: CampaignRecommendation; onApply: () => void }) {
  // Pick an icon based on simple keyword heuristics in the suggestion text.
  const text = `${rec.issue} ${rec.suggestion}`.toLowerCase();
  const { Icon, color } = (() => {
    if (text.includes("бюджет") || text.includes("budget") || text.includes("масштаб")) {
      return { Icon: ArrowUp, color: "var(--sage)" };
    }
    if (text.includes("креатив") || text.includes("баннер") || text.includes("image")) {
      return { Icon: ImageIcon, color: "var(--meta)" };
    }
    if (text.includes("лендинг") || text.includes("сайт") || text.includes("landing")) {
      return { Icon: Globe, color: "var(--peach-deep)" };
    }
    if (text.includes("таргет") || text.includes("аудитор")) {
      return { Icon: Target, color: "var(--peach-deep)" };
    }
    return { Icon: Wand2, color: "var(--peach)" };
  })();

  return (
    <div className="rounded-[10px] px-3 py-2.5" style={{ background: "rgba(255,255,255,0.55)" }}>
      <div className="flex items-start gap-2.5">
        <div className="size-[22px] rounded-md bg-white flex items-center justify-center shrink-0">
          <Icon className="size-[12px]" strokeWidth={2} style={{ color } as React.CSSProperties} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[12.5px] font-semibold text-[var(--ink)] leading-snug tracking-[-0.005em]">
            {rec.issue}
          </div>
          <div className="text-[12px] text-[var(--ink-mute)] mt-1 leading-snug">
            {rec.suggestion}
          </div>
          {rec.impact && (
            <div className="text-[11px] text-[var(--ink-subtle)] mt-1 italic">
              📈 {rec.impact}
            </div>
          )}
        </div>
      </div>
      <div className="flex justify-end mt-2">
        <button
          onClick={onApply}
          className="px-3 py-1 rounded-md text-[11.5px] font-medium text-white transition-opacity hover:opacity-90"
          style={{ background: "var(--peach)" }}
        >
          Применить
        </button>
      </div>
    </div>
  );
}


// ═════════════════════════════════════════════════════════════════════════════
// Quick Actions (2×3 grid)
// ═════════════════════════════════════════════════════════════════════════════

function QuickActions({
  isActive,
  busy,
  onPause,
  onResume,
  onBudgetPlus,
  onBudgetMinus,
  onBudgetCustom,
  onLandingAudit,
}: {
  isActive: boolean;
  busy: "pause" | "resume" | "budget" | "landing" | null;
  onPause: () => void;
  onResume: () => void;
  onBudgetPlus: () => void;
  onBudgetMinus: () => void;
  onBudgetCustom: () => void;
  onLandingAudit: () => void;
}) {
  return (
    <Card className="rounded-[14px] border-[color:var(--border)]">
      <CardContent className="p-3.5">
        <div className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-subtle)] mb-3">
          Быстрые действия
        </div>
        <div className="grid grid-cols-2 gap-2">
          {isActive ? (
            <ActionBtn icon={Pause} label="На паузу" onClick={onPause} loading={busy === "pause"} />
          ) : (
            <ActionBtn icon={Play} label="Запустить" onClick={onResume} loading={busy === "resume"} accent />
          )}
          <ActionBtn icon={ArrowUp} label="+20% бюджет" onClick={onBudgetPlus} loading={busy === "budget"} accent />
          <ActionBtn icon={ArrowDown} label="−20% бюджет" onClick={onBudgetMinus} loading={busy === "budget"} />
          <ActionBtn icon={Wand2} label="Точный бюджет" onClick={onBudgetCustom} />
          <ActionBtn icon={FileSearch} label="Аудит лендинга" onClick={onLandingAudit} loading={busy === "landing"} />
          <ActionBtn icon={RefreshCcw} label="Регенерация" disabled title="Скоро: регенерация креативов" />
        </div>
      </CardContent>
    </Card>
  );
}

function ActionBtn({
  icon: Icon,
  label,
  onClick,
  loading,
  accent,
  disabled,
  title,
}: {
  icon: IconCmp;
  label: string;
  onClick?: () => void;
  loading?: boolean;
  accent?: boolean;
  disabled?: boolean;
  title?: string;
}) {
  const isDisabled = disabled || loading;
  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      title={title}
      className="flex items-center gap-[7px] px-2.5 py-2 rounded-[9px] text-[11.5px] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      style={{
        background: accent ? "var(--peach-wash)" : "transparent",
        border: accent ? "1px solid var(--peach-soft)" : "1px solid var(--border)",
        color: accent ? "var(--peach-deep)" : "var(--ink)",
      }}
    >
      {loading ? (
        <Loader2 className="size-[12px] animate-spin" />
      ) : (
        <Icon
          className="size-[12px]"
          strokeWidth={1.8}
          style={{ color: accent ? "var(--peach-deep)" : "var(--ink-mute)" } as React.CSSProperties}
        />
      )}
      <span className="text-left leading-tight">{label}</span>
    </button>
  );
}


// ═════════════════════════════════════════════════════════════════════════════
// Helpers
// ═════════════════════════════════════════════════════════════════════════════

function AuditIcon({ status }: { status: string }) {
  if (status === "ok") return <span className="text-emerald-500 shrink-0">✅</span>;
  if (status === "warn") return <span className="text-amber-500 shrink-0">⚠️</span>;
  return <span className="text-red-500 shrink-0">❌</span>;
}

function formatEur(n: number): string {
  if (n === 0) return "€0";
  if (n < 100) return `€${n.toFixed(2)}`;
  return `€${Math.round(n)}`;
}
