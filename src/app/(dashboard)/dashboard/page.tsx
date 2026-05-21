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
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Сводка по активным кампаниям за последние 7 дней.
          </p>
        </div>
        <Link href="/campaigns/new">
          <Button size="lg" className="gap-2">
            <Rocket className="size-4" /> Новая кампания
          </Button>
        </Link>
      </header>

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
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | null;
  sub: string;
  loading: boolean;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
          <Icon className="size-3.5" />
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-7 w-20" />
        ) : (
          <div className="text-2xl font-semibold tracking-tight">{value ?? "—"}</div>
        )}
        <p className="text-xs text-muted-foreground mt-1">{sub}</p>
      </CardContent>
    </Card>
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
