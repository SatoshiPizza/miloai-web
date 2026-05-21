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
import { tgBridge, type DashboardKpi, type CampaignSummary } from "@/lib/tg-bridge";

export default function DashboardPage() {
  const [kpi, setKpi] = useState<DashboardKpi | null>(null);
  const [campaigns, setCampaigns] = useState<CampaignSummary[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [k, c] = await Promise.all([
          tgBridge.kpi(),
          tgBridge.campaigns(),
        ]);
        setKpi(k);
        setCampaigns(c.campaigns);
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

  return (
    <div className="p-8 space-y-8 max-w-7xl">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-[28px] font-bold tracking-tight leading-tight">
            Dashboard
          </h1>
          <p className="text-[13.5px] text-[var(--ink-mute)] mt-1">
            Сводка по активным кампаниям за последние 7 дней.
          </p>
        </div>
        <Link href="/campaigns/new">
          <Button size="lg" className="gap-2">
            <Rocket className="size-4" /> Новая кампания
          </Button>
        </Link>
      </header>

      {/* AI Insights peach card — design highlight (handoff §Dashboard) */}
      <AiInsightsCard kpi={kpi} loading={loading} />


      {error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* KPI cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={Euro}
          label="Spend (7d)"
          value={kpi ? formatEur(kpi.spend_7d) : null}
          sub={kpi ? `${kpi.active_campaigns} активных · ${kpi.total_campaigns} всего` : "—"}
          loading={loading}
        />
        <KpiCard
          icon={Target}
          label="Leads (7d)"
          value={kpi ? String(kpi.leads_7d) : null}
          sub={kpi && kpi.leads_7d === 0 ? "ноль конверсий — проверь CTR" : "—"}
          loading={loading}
        />
        <KpiCard
          icon={MousePointerClick}
          label="CPL"
          value={kpi?.cpl != null ? formatEur(kpi.cpl) : "—"}
          sub={kpi?.target_cpl != null ? `vs €${kpi.target_cpl} target` : "цель не задана"}
          loading={loading}
        />
        <KpiCard
          icon={TrendingUp}
          label="Кампании"
          value={kpi ? `${kpi.active_campaigns} / ${kpi.total_campaigns}` : null}
          sub="активных / всего"
          loading={loading}
        />
      </section>

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
                        <AnomalyBadge anomalies={c.anomalies} />
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5 truncate">
                        {c.ad_account_name} · {c.platform}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground shrink-0">
                      <span>💸 {formatEur(c.spend)}</span>
                      <span>👆 {c.clicks}</span>
                      <span>🎯 {c.conversions}</span>
                      <span>CPA {c.cpa != null ? formatEur(c.cpa) : "—"}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Аномалии */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Что изменилось за 24ч
          </h2>
        </div>
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6"><Skeleton className="h-10 w-full" /></div>
            ) : allAnomalies.length === 0 ? (
              <div className="p-6 text-sm text-muted-foreground text-center">
                Всё стабильно. Аномалий не обнаружено.
              </div>
            ) : (
              <ul className="divide-y">
                {allAnomalies.map((a, i) => (
                  <li key={i} className="px-4 py-3 flex items-start gap-2 text-sm">
                    <AnomalyIcon severity={a.severity} />
                    <div className="flex-1 min-w-0">
                      <span className="font-medium">{a.campaign}</span>{" "}
                      <span className="text-muted-foreground">— {a.message}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function KpiCard({
  icon: Icon, label, value, sub, loading,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  value: string | null;
  sub: string;
  loading: boolean;
}) {
  // Per design handoff §KPI Card:
  //   - label: 12.5 Geist ink-mute
  //   - value: 26-30 Geist Mono 500, tabular-nums, -0.02em tracking
  //   - delta/sub: 11 Geist Mono ink-subtle
  //   - radius 14, padding 18/20
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
