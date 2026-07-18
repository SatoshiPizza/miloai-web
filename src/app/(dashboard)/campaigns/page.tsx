"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Card, CardContent, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Tabs, TabsList, TabsTrigger, TabsContent,
} from "@/components/ui/tabs";
import {
  Rocket, Search, Flame, TriangleAlert, Lightbulb, ChevronRight,
} from "lucide-react";
import { tgBridge, type CampaignSummary, type CampaignTotals } from "@/lib/tg-bridge";
import { Sparkline, fakeWeekCurve } from "@/components/sparkline";
import { EmptyState as SharedEmptyState } from "@/components/empty-state";

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<CampaignSummary[] | null>(null);
  const [totals, setTotals] = useState<CampaignTotals | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("");
  const [tab, setTab] = useState<"all" | "active" | "paused">("all");

  useEffect(() => {
    tgBridge.campaigns()
      .then((r) => {
        setCampaigns(r.campaigns);
        setTotals(r.totals);
      })
      .catch((e) => {
        console.error(e);
        setError("Не удалось загрузить кампании. Backend на :8000?");
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (!campaigns) return [];
    let list = campaigns;
    if (tab === "active") list = list.filter((c) => c.status === "active");
    if (tab === "paused") list = list.filter((c) => c.status === "paused");
    if (filter.trim()) {
      const q = filter.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.ad_account_name.toLowerCase().includes(q)
      );
    }
    // Sort: critical anomalies first, then by spend desc.
    return [...list].sort((a, b) => {
      const aCrit = a.anomalies.some((x) => x.severity === "critical") ? 1 : 0;
      const bCrit = b.anomalies.some((x) => x.severity === "critical") ? 1 : 0;
      if (aCrit !== bCrit) return bCrit - aCrit;
      return b.spend - a.spend;
    });
  }, [campaigns, tab, filter]);

  const counts = useMemo(() => {
    const all = campaigns?.length ?? 0;
    const active = campaigns?.filter((c) => c.status === "active").length ?? 0;
    const paused = campaigns?.filter((c) => c.status === "paused").length ?? 0;
    return { all, active, paused };
  }, [campaigns]);

  return (
    <div className="p-8 space-y-6 max-w-7xl">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Кампании</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {totals
              ? `${totals.campaigns_count} кампаний · spend €${totals.spend.toFixed(0)} · ${totals.conversions} конверсий за 7 дней`
              : "Все живые кампании из подключённых Meta & Google аккаунтов."}
          </p>
        </div>
        <Link href="/services">
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

      {/* Filter + tabs */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Поиск по имени или аккаунту..."
            className="pl-9"
          />
        </div>
        <Tabs value={tab} onValueChange={(v) => setTab(v as "all" | "active" | "paused")}>
          <TabsList>
            <TabsTrigger value="all">Все ({counts.all})</TabsTrigger>
            <TabsTrigger value="active">Активные ({counts.active})</TabsTrigger>
            <TabsTrigger value="paused">Пауза ({counts.paused})</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* List */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-2">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          ) : filtered.length === 0 ? (
            (campaigns?.length ?? 0) === 0 ? (
              <div className="p-6">
                <SharedEmptyState
                  icon={Rocket}
                  eyebrow="Кампании"
                  title="Здесь будут твои кампании"
                  body="Кампания запускается под конкретный продукт. Выбери услугу — AI соберёт креативы из её профиля, дальше бюджет и запуск."
                  actions={[
                    {
                      label: "Выбрать продукт",
                      href: "/services",
                      primary: true,
                      icon: Rocket,
                    },
                    {
                      label: "Подключить кабинеты",
                      href: "/accounts",
                    },
                  ]}
                />
              </div>
            ) : (
              <div className="p-12 text-sm text-muted-foreground text-center">
                <p>Ничего не найдено по фильтру.</p>
              </div>
            )
          ) : (
            <div className="divide-y">
              {filtered.map((c) => (
                <Link
                  key={`${c.platform}-${c.id}`}
                  href={`/campaigns/${c.id}`}
                  className="grid grid-cols-12 gap-3 px-4 py-3 hover:bg-muted/40 transition-colors items-center"
                >
                  {/* Name + status + anomalies */}
                  <div className="col-span-12 md:col-span-5 min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <StatusDot status={c.status} />
                      <span className="font-medium truncate">{c.name}</span>
                      <AnomalyBadge anomalies={c.anomalies} />
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5 truncate">
                      {platformLabel(c.platform)} · {c.ad_account_name}
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="col-span-12 md:col-span-4 grid grid-cols-5 gap-2 text-xs">
                    <Metric label="Spend" value={`€${c.spend.toFixed(0)}`} />
                    <Metric label="Clicks" value={c.clicks.toLocaleString()} />
                    <Metric label="Conv" value={c.conversions.toString()} />
                    <Metric label="CPA" value={c.cpa != null ? `€${c.cpa.toFixed(0)}` : "—"} />
                    <Metric label="CTR" value={c.ctr != null ? `${(c.ctr * 100).toFixed(1)}%` : "—"} />
                  </div>

                  {/* 7-day sparkline — colored by platform, or warn when anomalies */}
                  <div className="hidden md:flex col-span-2 items-center justify-end">
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
                      width={88}
                      height={28}
                    />
                  </div>

                  <ChevronRight className="hidden md:block col-span-1 size-4 text-muted-foreground ml-auto" />
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-right md:text-left">
      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</div>
      <div className="font-medium tabular-nums">{value}</div>
    </div>
  );
}

function StatusDot({ status }: { status: string }) {
  const map: Record<string, string> = {
    active: "bg-emerald-500",
    paused: "bg-amber-400",
    deleted: "bg-zinc-400",
  };
  return <span className={`size-2 rounded-full shrink-0 ${map[status] ?? "bg-zinc-300"}`} />;
}

function AnomalyBadge({ anomalies }: { anomalies: CampaignSummary["anomalies"] }) {
  if (!anomalies?.length) return null;
  const critical = anomalies.some((a) => a.severity === "critical");
  const warn = anomalies.some((a) => a.severity === "warn");
  if (critical) {
    return (
      <Badge variant="outline" className="border-red-300 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300 text-[10px] gap-1">
        <Flame className="size-3" />
        {anomalies.length}
      </Badge>
    );
  }
  if (warn) {
    return (
      <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200 text-[10px] gap-1">
        <TriangleAlert className="size-3" />
        {anomalies.length}
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="text-[10px] gap-1">
      <Lightbulb className="size-3" />
      {anomalies.length}
    </Badge>
  );
}

function platformLabel(p: string): string {
  if (p === "meta") return "📘 Meta";
  if (p === "google") return "🔍 Google";
  return p;
}
