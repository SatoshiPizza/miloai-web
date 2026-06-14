"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Rocket, TrendingUp, Target, MousePointerClick, Euro, ArrowUpRight, Flame,
  TriangleAlert, Lightbulb,
} from "lucide-react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { tgBridge, type DashboardKpi, type CampaignSummary, type Me } from "@/lib/tg-bridge";
import { AiChatMini } from "@/components/ai-chat-mini";
import { Sparkline, fakeWeekCurve } from "@/components/sparkline";
import { PlatformBadge } from "@/components/platform-badge";
import {
  HeroBand, HeroBandSkeleton, KpiStrip, KpiStripSkeleton, type Kpi,
} from "@/components/bold";


/** Time-of-day greeting in the user's language. */
function greetingFor(lang: string | null | undefined, hour: number): string {
  const l = lang ?? "ru";
  if (l.startsWith("en")) {
    if (hour < 5) return "Good night";
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }
  if (l.startsWith("et")) {
    if (hour < 5) return "Head ööd";
    if (hour < 12) return "Tere hommikust";
    if (hour < 18) return "Tere päevast";
    return "Tere õhtust";
  }
  if (hour < 5) return "Доброй ночи";
  if (hour < 12) return "Доброе утро";
  if (hour < 18) return "Добрый день";
  return "Добрый вечер";
}

export default function DashboardPage() {
  const [kpi, setKpi] = useState<DashboardKpi | null>(null);
  const [campaigns, setCampaigns] = useState<CampaignSummary[] | null>(null);
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [k, c, m] = await Promise.all([
          tgBridge.kpi(),
          tgBridge.campaigns(),
          tgBridge.me().catch(() => null),
        ]);
        setKpi(k);
        setCampaigns(c.campaigns);
        setMe(m);
      } catch (e) {
        console.error(e);
        setError("Не удалось загрузить данные. Backend на :8000?");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Anomalies from all campaigns flattened — for the "24h changes" panel.
  const allAnomalies = (campaigns ?? [])
    .flatMap((c) =>
      c.anomalies.map((a) => ({ campaign: c.name, severity: a.severity, message: a.message }))
    )
    .slice(0, 5);

  const hero = buildHeroProps({ kpi, me, loading });
  const kpiCells = buildKpiCells({ kpi, campaigns, loading });

  return (
    <div className="mx-auto max-w-[1400px]">
      {/* Bold command hero — single dominant AI insight + topline stat */}
      {loading ? (
        <HeroBandSkeleton />
      ) : (
        <HeroBand
          eyebrow={hero.eyebrow}
          title={hero.title}
          body={hero.body}
          actions={[
            {
              label: "Новая кампания",
              primary: true,
              href: "/campaigns/new",
              icon: <Rocket className="size-[14px]" />,
            },
          ]}
          stat={hero.stat}
        />
      )}

      <div className="px-6 pb-10 lg:px-8">
        {/* Editorial KPI strip — overlaps the hero by -18 */}
        {loading ? <KpiStripSkeleton /> : <KpiStrip kpis={kpiCells} />}

        {error && (
          <div className="mt-6 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Two-column layout per design handoff: main (flex-1) + right (320px). */}
        <div className="mt-8 flex flex-col gap-6 lg:flex-row">
          <div className="min-w-0 flex-1 space-y-8">

      {/* Активные кампании */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Кампании за 7 дней
          </h2>
          <Link href="/campaigns" className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
            Все <ArrowUpRight className="size-3" />
          </Link>
        </div>
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6 space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : !campaigns || campaigns.length === 0 ? (
              <div className="p-8 text-sm text-muted-foreground text-center">
                <p>Нет кампаний или нет подключённых рекламных аккаунтов.</p>
                <p className="mt-1 text-xs">
                  Подключи Meta / Google в{" "}
                  <Link href="/accounts" className="underline">/accounts</Link>.
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {campaigns.slice(0, 6).map((c) => (
                  <Link
                    key={`${c.platform}-${c.id}`}
                    href={`/campaigns/${c.id}`}
                    className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-muted/40 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <StatusDot status={c.status} />
                        <span className="font-medium truncate">{c.name}</span>
                        {(c.platform === "meta" || c.platform === "google") && (
                          <PlatformBadge platform={c.platform} />
                        )}
                        <AnomalyBadge anomalies={c.anomalies} />
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5 truncate">
                        {c.ad_account_name}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground shrink-0">
                      <span>💸 {formatEur(c.spend)}</span>
                      <span>👆 {c.clicks}</span>
                      <span>🎯 {c.conversions}</span>
                      <span>CPA {c.cpa != null ? formatEur(c.cpa) : "—"}</span>
                      <Sparkline
                        values={fakeWeekCurve(`${c.platform}-${c.id}`, Math.max(c.spend, 1))}
                        color={
                          c.anomalies.some((a) => a.severity === "critical")
                            ? "var(--destructive)"
                            : c.platform === "meta"
                              ? "var(--meta)"
                              : c.platform === "google"
                                ? "var(--google)"
                                : "var(--peach)"
                        }
                        width={72}
                        height={24}
                      />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

        </div>

        {/* Right column — AI Chat Mini + Anomalies feed */}
        <aside className="w-full lg:w-[320px] shrink-0 space-y-6">
          <AiChatMini paired={me?.has_telegram_paired ?? false} />

          <div>
            <h2 className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-subtle)] mb-2.5 px-1">
              Изменения · 24ч
            </h2>
            <Card>
              <CardContent className="p-0">
                {loading ? (
                  <div className="p-4"><Skeleton className="h-10 w-full" /></div>
                ) : allAnomalies.length === 0 ? (
                  <div className="p-5 text-xs text-[var(--ink-subtle)] text-center">
                    Всё стабильно.
                  </div>
                ) : (
                  <ul className="divide-y">
                    {allAnomalies.slice(0, 4).map((a, i) => (
                      <li key={i} className="px-3.5 py-2.5 flex items-start gap-2 text-[12.5px]">
                        <AnomalyIcon severity={a.severity} />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{a.campaign}</div>
                          <div className="text-[var(--ink-mute)] mt-0.5">{a.message}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </aside>
        </div>
      </div>
    </div>
  );
}

/**
 * Per-platform contribution to a metric (spend or conversions).
 * Used by KpiCard to render the 4px breakdown bar at the bottom.
 * Returns null when both platforms have zero — bar hides gracefully.
 */
function breakdownByPlatform(
  campaigns: CampaignSummary[] | null,
  key: "spend" | "conversions",
): { meta: number; google: number; total: number } | null {
  if (!campaigns) return null;
  let meta = 0, google = 0;
  for (const c of campaigns) {
    const v = c[key] ?? 0;
    if (c.platform === "meta") meta += v;
    else if (c.platform === "google") google += v;
  }
  const total = meta + google;
  if (total <= 0) return null;
  return { meta, google, total };
}


function KpiCard({
  icon: Icon, label, value, sub, loading, breakdown,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  value: string | null;
  sub: string;
  loading: boolean;
  breakdown?: { meta: number; google: number; total: number } | null;
}) {
  // Per design handoff iter-2 §Dashboard KPI:
  //   - label: 12.5 Geist ink-mute
  //   - value: 26-30 Geist Mono 500, tabular-nums, -0.02em tracking
  //   - sub: 11 Geist Mono ink-subtle
  //   - 4px breakdown bar at bottom with Meta blue / Google blue + percent labels
  return (
    <Card className="rounded-[14px] border-[color:var(--border)] shadow-[0_1px_3px_rgba(31,29,26,0.04)]">
      <CardHeader className="pb-2 pt-4 px-5">
        <CardTitle className="text-[12.5px] font-normal text-[var(--ink-mute)] flex items-center gap-2 tracking-[-0.005em]">
          <Icon className="size-[14px] text-[var(--ink-subtle)]" strokeWidth={1.6} />
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-5">
        {loading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <div className="font-mono text-[28px] font-medium leading-none tracking-[-0.02em] tabular-nums text-foreground">
            {value ?? "—"}
          </div>
        )}
        <p className="text-[11px] font-mono text-[var(--ink-subtle)] mt-2.5 tabular-nums">{sub}</p>

        {breakdown && (
          <div className="mt-3.5">
            <div className="flex h-1 rounded-full overflow-hidden bg-[var(--border-soft)]">
              <div
                className="h-full"
                style={{ width: `${(breakdown.meta / breakdown.total) * 100}%`, background: "var(--meta)" }}
              />
              <div
                className="h-full"
                style={{ width: `${(breakdown.google / breakdown.total) * 100}%`, background: "var(--google)" }}
              />
            </div>
            <div className="flex justify-between mt-1.5 text-[10px] font-mono tabular-nums">
              <span style={{ color: "var(--meta-ink)" }}>
                {Math.round((breakdown.meta / breakdown.total) * 100)}% Meta
              </span>
              <span style={{ color: "var(--google-ink)" }}>
                {Math.round((breakdown.google / breakdown.total) * 100)}% Google
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}


function AiInsightsCard({ kpi, loading }: { kpi: DashboardKpi | null; loading: boolean }) {
  // Peach gradient panel from design handoff. Auto-generated insights based on
  // KPI numbers — keeps the page feeling alive even before campaigns spend.
  const insights = (() => {
    if (loading || !kpi) return null;
    const out: { kind: "ok" | "warn" | "info"; text: React.ReactNode }[] = [];
    if (kpi.total_campaigns === 0) {
      out.push({ kind: "info", text: <>Кампаний пока нет — <b>начни с «Новая кампания»</b> чтобы увидеть AI-инсайты по делу.</> });
    } else if (kpi.active_campaigns === 0) {
      out.push({ kind: "warn", text: <>Все {kpi.total_campaigns} кампаний на паузе. <b>Возобнови</b> хотя бы одну, иначе данные не накопятся.</> });
    } else {
      out.push({ kind: "ok", text: <><b>{kpi.active_campaigns}</b> кампаний активны, наблюдаю за метриками.</> });
    }
    if (kpi.spend_7d > 0 && kpi.leads_7d === 0) {
      out.push({ kind: "warn", text: <>€{kpi.spend_7d.toFixed(0)} потрачено за 7 дней, <b>0 конверсий</b> — проблема в лендинге или таргете.</> });
    }
    if (kpi.cpl != null && kpi.target_cpl != null) {
      if (kpi.cpl <= kpi.target_cpl) {
        out.push({ kind: "ok", text: <>CPL <b>€{kpi.cpl.toFixed(0)}</b> ниже целевого €{kpi.target_cpl.toFixed(0)} — масштабируй.</> });
      } else {
        out.push({ kind: "warn", text: <>CPL <b>€{kpi.cpl.toFixed(0)}</b> выше цели €{kpi.target_cpl.toFixed(0)}. <b>Пересмотри</b> офферы.</> });
      }
    }
    return out.slice(0, 3);
  })();

  return (
    <div
      className="relative rounded-[14px] border p-5"
      style={{
        background: "linear-gradient(135deg, var(--peach-wash) 0%, #F8E8D9 100%)",
        borderColor: "#F5DDC8",
      }}
    >
      <div className="flex items-start gap-4">
        <div
          className="size-[38px] rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm"
          style={{ boxShadow: "0 4px 14px -4px rgba(232,149,108,0.4)" }}
        >
          <Sparkles className="size-[18px] text-[var(--peach)]" strokeWidth={1.6} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.1em] text-[var(--peach-deep)]">
              AI · СЕГОДНЯ
            </span>
            <span className="size-1 rounded-full bg-[var(--peach-deep)]/40" />
            <span className="text-[11px] text-[var(--peach-ink)]/60">обновлено только что</span>
          </div>

          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-3/5" />
            </div>
          ) : insights && insights.length > 0 ? (
            <ul className="space-y-1.5">
              {insights.map((it, i) => (
                <li key={i} className="flex items-start gap-2 text-[13.5px] leading-snug text-[var(--ink)]">
                  <span className="mt-1 shrink-0">
                    {it.kind === "ok" ? "✓" : it.kind === "warn" ? "⚠" : "💡"}
                  </span>
                  <span className="flex-1">{it.text}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[13.5px] text-[var(--peach-ink)]/80">
              Подключи рекламные аккаунты — буду писать что менять.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusDot({ status }: { status: string }) {
  const map: Record<string, string> = {
    active: "bg-emerald-500",
    paused: "bg-amber-400",
    deleted: "bg-zinc-400",
  };
  return <span className={`size-2 rounded-full ${map[status] ?? "bg-zinc-300"}`} />;
}

function AnomalyBadge({ anomalies }: { anomalies: CampaignSummary["anomalies"] }) {
  if (!anomalies?.length) return null;
  const critical = anomalies.some((a) => a.severity === "critical");
  const warn = anomalies.some((a) => a.severity === "warn");
  if (critical) {
    return <Badge variant="outline" className="border-red-300 bg-red-50 text-red-700 text-[10px] gap-1"><Flame className="size-3" />{anomalies.length}</Badge>;
  }
  if (warn) {
    return <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-700 text-[10px] gap-1"><TriangleAlert className="size-3" />{anomalies.length}</Badge>;
  }
  return <Badge variant="outline" className="text-[10px] gap-1"><Lightbulb className="size-3" />{anomalies.length}</Badge>;
}

function AnomalyIcon({ severity }: { severity: string }) {
  if (severity === "critical") return <Flame className="size-4 text-red-500 shrink-0 mt-0.5" />;
  if (severity === "warn") return <TriangleAlert className="size-4 text-amber-500 shrink-0 mt-0.5" />;
  return <Lightbulb className="size-4 text-muted-foreground shrink-0 mt-0.5" />;
}

function formatEur(n: number): string {
  if (n === 0) return "€0";
  if (n < 100) return `€${n.toFixed(2)}`;
  return `€${Math.round(n)}`;
}


// ── Bold hero / KPI builders ─────────────────────────────────────────────
//
// We translate the existing KPI numbers into the iter-4 hero pattern: one
// dominant AI-flavoured headline + a topline numeric stat. The remaining
// metrics fan out into the editorial KpiStrip directly below.


function buildHeroProps({
  kpi,
  me,
  loading,
}: {
  kpi: DashboardKpi | null;
  me: Me | null;
  loading: boolean;
}) {
  const hi = greetingFor(me?.language_code, new Date().getHours());
  const who = me?.first_name || me?.business_name;
  const greeting = who ? `${hi}, ${who}` : hi;

  if (loading || !kpi) {
    return {
      eyebrow: "Главное за сегодня",
      title: <>{greeting}</>,
      body: "Подгружаю свежую сводку по кампаниям…",
      stat: undefined as Kpi | undefined,
    } as const;
  }

  // Pick the topline insight from the same priority chain that AiInsightsCard
  // used to use — we keep that file mounted below for the long tail.
  const title: React.ReactNode = (() => {
    if (kpi.total_campaigns === 0) {
      return (
        <>
          {greeting} — пока нет кампаний.{" "}
          <em className="not-italic italic" style={{ color: "var(--peach)" }}>
            Запусти первую
          </em>{" "}
          и я начну смотреть.
        </>
      );
    }
    if (kpi.active_campaigns === 0) {
      return (
        <>
          Все {kpi.total_campaigns} кампаний{" "}
          <em className="not-italic italic" style={{ color: "var(--peach)" }}>
            на паузе
          </em>{" "}
          — данные не накопятся.
        </>
      );
    }
    if (kpi.spend_7d > 0 && kpi.leads_7d === 0) {
      return (
        <>
          €{kpi.spend_7d.toFixed(0)} ушло за 7 дней,{" "}
          <em className="not-italic italic" style={{ color: "var(--peach)" }}>
            0 конверсий
          </em>{" "}
          — проверь лендинг.
        </>
      );
    }
    if (kpi.cpl != null && kpi.target_cpl != null && kpi.cpl <= kpi.target_cpl) {
      return (
        <>
          CPL{" "}
          <em className="not-italic italic" style={{ color: "var(--peach)" }}>
            €{kpi.cpl.toFixed(0)}
          </em>{" "}
          ниже целевого €{kpi.target_cpl.toFixed(0)} — пора масштабировать.
        </>
      );
    }
    if (kpi.cpl != null && kpi.target_cpl != null && kpi.cpl > kpi.target_cpl) {
      return (
        <>
          CPL{" "}
          <em className="not-italic italic" style={{ color: "var(--peach)" }}>
            €{kpi.cpl.toFixed(0)}
          </em>{" "}
          выше цели €{kpi.target_cpl.toFixed(0)} — пересмотри офферы.
        </>
      );
    }
    return (
      <>
        {greeting}.{" "}
        <em className="not-italic italic" style={{ color: "var(--peach)" }}>
          {kpi.active_campaigns}
        </em>{" "}
        кампаний работают.
      </>
    );
  })();

  // Hero stat: CPL when we have a target to compare, otherwise active campaigns count.
  let stat: Kpi | undefined;
  if (kpi.cpl != null && kpi.target_cpl != null) {
    const delta = kpi.cpl - kpi.target_cpl;
    stat = {
      label: "CPL · 7д",
      value: `€${kpi.cpl.toFixed(0)}`,
      delta: `${delta >= 0 ? "+" : ""}€${Math.abs(delta).toFixed(0)}`,
      dir: delta <= 0 ? "up" : "down",
    };
  } else if (kpi.spend_7d > 0) {
    stat = {
      label: "Spend · 7д",
      value: `€${Math.round(kpi.spend_7d)}`,
    };
  } else {
    stat = {
      label: "Кампании",
      value: `${kpi.active_campaigns}`,
      delta: `/ ${kpi.total_campaigns}`,
    };
  }

  return {
    eyebrow: "Главное за сегодня",
    title,
    body: `${kpi.active_campaigns} активных · ${kpi.total_campaigns} всего · ${kpi.leads_7d} лидов за 7 дней`,
    stat,
  } as const;
}


function buildKpiCells({
  kpi,
  campaigns,
  loading,
}: {
  kpi: DashboardKpi | null;
  campaigns: CampaignSummary[] | null;
  loading: boolean;
}): Kpi[] {
  const empty: Kpi[] = [
    { label: "Spend · 7д", value: "—" },
    { label: "Leads · 7д", value: "—" },
    { label: "CPL", value: "—" },
    { label: "Кампании", value: "—" },
  ];
  if (loading || !kpi) return empty;

  const spend = breakdownByPlatform(campaigns, "spend");
  const leads = breakdownByPlatform(campaigns, "conversions");

  return [
    {
      label: "Spend · 7д",
      value: formatEur(kpi.spend_7d),
      breakdown: spend
        ? { meta: spend.meta, google: spend.google }
        : undefined,
    },
    {
      label: "Leads · 7д",
      value: String(kpi.leads_7d),
      breakdown: leads
        ? { meta: leads.meta, google: leads.google }
        : undefined,
    },
    {
      label: "CPL",
      value: kpi.cpl != null ? formatEur(kpi.cpl) : "—",
      delta:
        kpi.cpl != null && kpi.target_cpl != null
          ? `${kpi.cpl <= kpi.target_cpl ? "−" : "+"}€${Math.abs(
              kpi.cpl - kpi.target_cpl,
            ).toFixed(0)} vs цель`
          : undefined,
      dir:
        kpi.cpl != null && kpi.target_cpl != null
          ? kpi.cpl <= kpi.target_cpl
            ? "up"
            : "down"
          : undefined,
    },
    {
      label: "Кампании",
      value: `${kpi.active_campaigns} / ${kpi.total_campaigns}`,
    },
  ];
}
