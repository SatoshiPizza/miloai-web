"use client";

import { useCallback, useEffect, useState } from "react";
import { use as usePromise } from "react";
import Link from "next/link";
import {
  Card, CardContent, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft, Pause, Play, TrendingUp, TrendingDown, Flame, TriangleAlert,
  Lightbulb, FileSearch, RefreshCcw, Sparkles, Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { tgBridge, type CampaignDetail, type LandingAuditReport } from "@/lib/tg-bridge";

export default function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = usePromise(params);
  const [data, setData] = useState<CampaignDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Action states.
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
      <div className="p-8 space-y-6 max-w-7xl">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-12 w-3/4" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-48" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 max-w-2xl space-y-4">
        <BackLink />
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
    <div className="p-8 space-y-6 max-w-6xl">
      <BackLink />

      {/* Header */}
      <header className="space-y-2">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <StatusDot status={data.status} />
              <h1 className="text-2xl font-semibold tracking-tight truncate">
                {data.name}
              </h1>
              <HealthBadge health={data.advice?.health} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {platformLabel(data.platform)} · {data.ad_account_name} · {data.objective || "—"}
            </p>
          </div>
        </div>
      </header>

      {/* Metrics row */}
      <section className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <Metric label="Spend (7d)" value={`€${data.spend.toFixed(0)}`} />
        <Metric label="Daily" value={data.daily_budget ? `€${data.daily_budget.toFixed(0)}` : "—"} />
        <Metric label="Clicks" value={data.clicks.toLocaleString()} />
        <Metric label="Conv" value={data.conversions.toString()} />
        <Metric label="CPA" value={data.cpa != null ? `€${data.cpa.toFixed(0)}` : "—"} />
        <Metric label="CTR" value={data.ctr != null ? `${(data.ctr * 100).toFixed(2)}%` : "—"} />
      </section>

      {/* Anomalies */}
      {data.anomalies.length > 0 && (
        <section>
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Аномалии за 24ч
          </h2>
          <Card>
            <CardContent className="p-0">
              <ul className="divide-y">
                {data.anomalies.map((a, i) => (
                  <li key={i} className="px-4 py-3 flex items-start gap-2 text-sm">
                    <AnomalyIcon severity={a.severity} />
                    <span>{a.message}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>
      )}

      {/* AI Advice */}
      {data.advice ? (
        <section>
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
            <Sparkles className="size-3.5" /> AI-анализ
          </h2>
          <Card>
            <CardHeader>
              <p className="text-sm text-foreground italic leading-relaxed">
                {data.advice.summary}
              </p>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              {data.advice.recommendations.map((r, i) => (
                <div key={i} className="space-y-1.5 pb-3 border-b last:border-b-0 last:pb-0">
                  <p className="font-medium text-sm leading-snug">
                    {i + 1}. {r.issue}
                  </p>
                  <p className="text-sm text-muted-foreground">→ {r.suggestion}</p>
                  <p className="text-xs text-muted-foreground italic">📈 {r.impact}</p>
                </div>
              ))}
              {data.advice.recommendations.length === 0 && (
                <p className="text-sm text-muted-foreground">Рекомендаций нет — всё в норме.</p>
              )}
            </CardContent>
          </Card>
        </section>
      ) : (
        <p className="text-xs text-muted-foreground italic">AI-анализ временно недоступен.</p>
      )}

      {/* Actions */}
      <section>
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
          Действия
        </h2>
        <div className="flex flex-wrap gap-2">
          {isActive ? (
            <Button variant="outline" onClick={pause} disabled={busy === "pause"}>
              {busy === "pause" ? <Loader2 className="size-4 animate-spin mr-2" /> : <Pause className="size-4 mr-2" />}
              Поставить на паузу
            </Button>
          ) : (
            <Button variant="outline" onClick={resume} disabled={busy === "resume"}>
              {busy === "resume" ? <Loader2 className="size-4 animate-spin mr-2" /> : <Play className="size-4 mr-2" />}
              Возобновить
            </Button>
          )}
          <Button variant="outline" onClick={() => setBudgetOpen(true)} disabled={busy === "budget"}>
            💰 Бюджет
          </Button>
          <Button variant="outline" onClick={runLandingAudit} disabled={busy === "landing"}>
            {busy === "landing" ? <Loader2 className="size-4 animate-spin mr-2" /> : <FileSearch className="size-4 mr-2" />}
            Аудит лендинга
          </Button>
          <Button variant="outline" disabled title="Скоро: регенерация креативов из BusinessService">
            <RefreshCcw className="size-4 mr-2" />
            Перегенерить креативы
          </Button>
        </div>
      </section>

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
                <TrendingUp className="size-4 mr-1" /> +20%
              </Button>
              <Button variant="outline" onClick={() => changeBudget(0.8)} disabled={busy === "budget"}>
                <TrendingDown className="size-4 mr-1" /> −20%
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


// ── small helpers ──

function BackLink() {
  return (
    <Link href="/campaigns" className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
      <ArrowLeft className="size-3" /> Все кампании
    </Link>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-3">
        <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</div>
        <div className="font-semibold tabular-nums text-lg leading-tight mt-0.5">{value}</div>
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
  return <span className={`size-2.5 rounded-full shrink-0 ${map[status] ?? "bg-zinc-300"}`} />;
}

function HealthBadge({ health }: { health: string | undefined }) {
  if (!health) return null;
  if (health === "healthy") {
    return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px]">✅ healthy</Badge>;
  }
  if (health === "needs_attention") {
    return <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-[10px]">⚠️ needs attention</Badge>;
  }
  if (health === "critical") {
    return <Badge className="bg-red-100 text-red-700 border-red-200 text-[10px]">🔥 critical</Badge>;
  }
  return <Badge variant="outline" className="text-[10px]">{health}</Badge>;
}

function AnomalyIcon({ severity }: { severity: string }) {
  if (severity === "critical") return <Flame className="size-4 text-red-500 shrink-0 mt-0.5" />;
  if (severity === "warn") return <TriangleAlert className="size-4 text-amber-500 shrink-0 mt-0.5" />;
  return <Lightbulb className="size-4 text-muted-foreground shrink-0 mt-0.5" />;
}

function AuditIcon({ status }: { status: string }) {
  if (status === "ok") return <span className="text-emerald-500 shrink-0">✅</span>;
  if (status === "warn") return <span className="text-amber-500 shrink-0">⚠️</span>;
  return <span className="text-red-500 shrink-0">❌</span>;
}

function platformLabel(p: string): string {
  if (p === "meta") return "📘 Meta";
  if (p === "google") return "🔍 Google";
  return p;
}
