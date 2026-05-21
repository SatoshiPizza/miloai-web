"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft, Rocket, Megaphone, Globe, Sparkles, Loader2, Check, X,
  ChevronRight, Plug,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  tgBridge,
  type ServiceSummary,
  type AccountsResponse,
  type WizardAuditResponse,
  type WizardLaunchResponse,
} from "@/lib/tg-bridge";

type Step = 1 | 2 | 3 | 4 | 5;

export default function NewCampaignWizard() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);

  // Step 1 — platforms
  const [accounts, setAccounts] = useState<AccountsResponse | null>(null);
  const [platforms, setPlatforms] = useState<{ meta: boolean; google: boolean }>({
    meta: false,
    google: false,
  });

  // Step 2 — service
  const [services, setServices] = useState<ServiceSummary[] | null>(null);
  const [serviceId, setServiceId] = useState<number | null>(null);

  // Step 3 — budget
  const [budget, setBudget] = useState<string>("15");

  // Step 4 — audit
  const [auditing, setAuditing] = useState(false);
  const [audit, setAudit] = useState<WizardAuditResponse | null>(null);

  // Step 5 — launch result
  const [launching, setLaunching] = useState(false);
  const [launchResult, setLaunchResult] = useState<WizardLaunchResponse | null>(null);

  // Initial: load services + accounts in parallel.
  useEffect(() => {
    Promise.all([tgBridge.services(), tgBridge.adAccounts()])
      .then(([s, a]) => {
        setServices(s);
        setAccounts(a);
        setPlatforms({ meta: a.has_meta, google: a.has_google });
      })
      .catch((e) => {
        console.error(e);
        toast.error("Не удалось загрузить данные. Backend на :8000?");
      });
  }, []);

  const dailyEur = Math.max(1, parseFloat(budget) || 0);

  const runAudit = useCallback(async () => {
    if (!serviceId) return;
    setAuditing(true);
    setAudit(null);
    try {
      const res = await tgBridge.wizardAudit({
        service_id: serviceId,
        daily_budget_eur: dailyEur,
        platforms,
      });
      setAudit(res);
    } catch (e: unknown) {
      console.error(e);
      const msg = e instanceof Error ? e.message : "Аудит не удался";
      toast.error(msg);
    } finally {
      setAuditing(false);
    }
  }, [serviceId, dailyEur, platforms]);

  // Trigger audit when entering step 4.
  useEffect(() => {
    if (step === 4 && !audit && !auditing) {
      runAudit();
    }
  }, [step, audit, auditing, runAudit]);

  async function launch() {
    if (!serviceId) return;
    setLaunching(true);
    try {
      const r = await tgBridge.wizardLaunch({
        service_id: serviceId,
        daily_budget_eur: dailyEur,
        platforms,
      });
      setLaunchResult(r);
      setStep(5);
    } catch (e: unknown) {
      console.error(e);
      const msg = e instanceof Error ? e.message : "Запуск не удался";
      toast.error(msg);
    } finally {
      setLaunching(false);
    }
  }

  return (
    <div className="p-8 max-w-3xl space-y-6">
      <header>
        <Link href="/campaigns" className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
          <ArrowLeft className="size-3" /> Кампании
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight mt-2 flex items-center gap-2">
          <Rocket className="size-5" /> Новая кампания
        </h1>
      </header>

      <Stepper current={step} />

      {/* Step 1 — Platforms */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Где запускаем?</CardTitle>
            <CardDescription>
              Выбери платформы. Если что-то не подключено — кликни «Подключить» и пройди OAuth.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <PlatformRow
              icon={Megaphone}
              label="Meta (Facebook + Instagram)"
              connected={accounts?.has_meta ?? false}
              enabled={platforms.meta}
              onToggle={() => setPlatforms((p) => ({ ...p, meta: !p.meta }))}
            />
            <PlatformRow
              icon={Globe}
              label="Google Ads (Search)"
              connected={accounts?.has_google ?? false}
              enabled={platforms.google}
              onToggle={() => setPlatforms((p) => ({ ...p, google: !p.google }))}
            />

            <div className="pt-2 flex justify-end">
              <Button
                onClick={() => setStep(2)}
                disabled={!platforms.meta && !platforms.google}
                size="lg"
              >
                Дальше <ChevronRight className="size-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2 — Service picker */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Какую услугу рекламируем?</CardTitle>
            <CardDescription>
              ✨ — креативы готовы (мгновенный запуск). ⚪ — сгенерируется при запуске (~30 сек).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {!services ? (
              <>
                <Skeleton className="h-16" />
                <Skeleton className="h-16" />
                <Skeleton className="h-16" />
              </>
            ) : services.length === 0 ? (
              <div className="p-6 text-sm text-muted-foreground text-center">
                Услуг пока нет. Пройди онбординг через бота, чтобы я узнал твой бизнес.
              </div>
            ) : (
              services.map((s) => {
                const selected = s.id === serviceId;
                return (
                  <button
                    key={s.id}
                    onClick={() => setServiceId(s.id)}
                    className={cn(
                      "w-full text-left rounded-md border px-4 py-3 transition-colors",
                      selected
                        ? "border-primary bg-primary/5"
                        : "hover:bg-muted/40"
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-medium truncate">{s.name}</div>
                        {s.description && (
                          <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                            {s.description}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-1 text-xs shrink-0">
                        <Badge variant="outline" className="gap-1 text-[10px]">
                          <span>{s.has_meta_creatives ? "✨" : "⚪"}</span>M
                        </Badge>
                        <Badge variant="outline" className="gap-1 text-[10px]">
                          <span>{s.has_google_rsa ? "✨" : "⚪"}</span>G
                        </Badge>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
            <div className="pt-2 flex justify-between">
              <Button variant="ghost" onClick={() => setStep(1)}>← Назад</Button>
              <Button onClick={() => setStep(3)} disabled={!serviceId} size="lg">
                Дальше <ChevronRight className="size-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3 — Budget */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Дневной бюджет</CardTitle>
            <CardDescription>
              EUR в день <b>на каждую</b> выбранную платформу. Алгоритмы Meta/Google лучше учатся от €10/день.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="budget">€ в день</Label>
              <Input
                id="budget"
                type="number"
                min={1}
                step={1}
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && dailyEur >= 1) setStep(4);
                }}
                autoFocus
                className="text-lg w-32 tabular-nums"
              />
              <div className="flex gap-2 mt-2">
                {[5, 10, 15, 25, 50].map((v) => (
                  <Button key={v} variant="outline" size="sm" onClick={() => setBudget(String(v))}>
                    €{v}
                  </Button>
                ))}
              </div>
            </div>
            <div className="pt-2 flex justify-between">
              <Button variant="ghost" onClick={() => setStep(2)}>← Назад</Button>
              <Button onClick={() => setStep(4)} disabled={dailyEur < 1} size="lg">
                Аудит <ChevronRight className="size-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4 — Audit */}
      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="size-4" /> Анализ перед запуском
            </CardTitle>
            <CardDescription>
              Проверяю настройки, бенчмарки и AI оценивает шансы. Это занимает 5-15 секунд.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {auditing || !audit ? (
              <div className="space-y-2 py-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" />
                  AI читает метрики и сравнивает с benchmarks...
                </div>
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-4/5" />
              </div>
            ) : (
              <>
                <ul className="space-y-1.5">
                  {audit.items.map((it, i) => (
                    <li key={i} className="text-sm">
                      <div className="flex items-start gap-2">
                        <StatusIcon status={it.status} />
                        <span>{it.message}</span>
                      </div>
                      {it.fix && it.status !== "ok" && (
                        <div className="ml-6 text-xs text-muted-foreground italic">↳ {it.fix}</div>
                      )}
                    </li>
                  ))}
                </ul>

                <div className="flex items-center justify-between border-t pt-3">
                  <span className="font-semibold">Оценка: {audit.score}/10</span>
                  <VerdictBadge recommendation={audit.recommendation} />
                </div>

                {audit.ai_summary && (
                  <div className="rounded-md bg-muted/50 p-3 space-y-2">
                    <div className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                      <Sparkles className="size-3" /> Что говорит AI
                    </div>
                    <p className="text-sm italic">{audit.ai_summary}</p>
                    {audit.ai_priority_fix && (
                      <div className="pt-1 border-t">
                        <div className="text-xs font-medium">🎯 В первую очередь:</div>
                        <div className="text-sm">{audit.ai_priority_fix}</div>
                        {audit.ai_why_priority && (
                          <div className="text-xs text-muted-foreground mt-1 italic">
                            {audit.ai_why_priority}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div className="pt-2 flex justify-between">
                  <Button variant="ghost" onClick={() => setStep(3)} disabled={launching}>
                    ← Изменить бюджет
                  </Button>
                  <Button
                    onClick={launch}
                    disabled={launching || audit.recommendation === "do_not_launch"}
                    size="lg"
                  >
                    {launching ? (
                      <><Loader2 className="size-4 animate-spin mr-2" />Запускаю...</>
                    ) : (
                      <><Rocket className="size-4 mr-2" />Запустить</>
                    )}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 5 — Result */}
      {step === 5 && launchResult && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Отчёт о запуске</CardTitle>
            <CardDescription>
              Все кампании создаются в статусе PAUSED — открой Ads Manager,
              проверь и активируй когда готов.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {launchResult.results.map((r) => (
              <div
                key={r.platform}
                className={cn(
                  "rounded-md border px-4 py-3",
                  r.ok ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/20" : "border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/20"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="font-medium flex items-center gap-2">
                    {r.platform === "meta" ? "📘 Meta" : "🔍 Google"}
                    {r.ok ? (
                      <Check className="size-4 text-emerald-600" />
                    ) : (
                      <X className="size-4 text-red-600" />
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {r.ok ? r.detail : r.error}
                  </div>
                </div>
                {r.ok && r.campaign_id && (
                  <div className="text-xs text-muted-foreground mt-1">
                    campaign_id: <code>{r.campaign_id}</code>
                  </div>
                )}
              </div>
            ))}
            <div className="pt-2 flex justify-end gap-2">
              <Button variant="outline" onClick={() => router.push("/campaigns")}>
                Все кампании
              </Button>
              <Button onClick={() => router.push("/dashboard")}>На dashboard</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}


// ── small components ──

function Stepper({ current }: { current: Step }) {
  const labels = ["Платформы", "Услуга", "Бюджет", "Аудит", "Готово"];
  return (
    <div className="flex items-center gap-2 text-xs">
      {labels.map((lbl, i) => {
        const n = (i + 1) as Step;
        const active = n === current;
        const done = n < current;
        return (
          <div key={i} className="flex items-center gap-2">
            <div
              className={cn(
                "size-5 rounded-full flex items-center justify-center text-[10px] font-medium",
                done && "bg-emerald-500 text-white",
                active && "bg-primary text-primary-foreground",
                !done && !active && "bg-muted text-muted-foreground"
              )}
            >
              {done ? <Check className="size-3" /> : n}
            </div>
            <span className={cn(
              "tracking-tight",
              active ? "text-foreground font-medium" : "text-muted-foreground"
            )}>
              {lbl}
            </span>
            {i < labels.length - 1 && (
              <ChevronRight className="size-3 text-muted-foreground/40 mx-1" />
            )}
          </div>
        );
      })}
    </div>
  );
}

function PlatformRow({
  icon: Icon,
  label,
  connected,
  enabled,
  onToggle,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  connected: boolean;
  enabled: boolean;
  onToggle: () => void;
}) {
  if (!connected) {
    return (
      <Link href="/accounts" className="block">
        <div className="rounded-md border border-dashed px-4 py-3 flex items-center justify-between hover:bg-muted/40 transition-colors">
          <div className="flex items-center gap-3">
            <Icon className="size-4 text-muted-foreground" />
            <div>
              <div className="font-medium text-sm">{label}</div>
              <div className="text-xs text-muted-foreground">не подключено</div>
            </div>
          </div>
          <Badge variant="outline" className="gap-1">
            <Plug className="size-3" />
            Подключить
          </Badge>
        </div>
      </Link>
    );
  }
  return (
    <button
      onClick={onToggle}
      className={cn(
        "w-full rounded-md border px-4 py-3 flex items-center justify-between transition-colors text-left",
        enabled ? "border-primary bg-primary/5" : "hover:bg-muted/40"
      )}
    >
      <div className="flex items-center gap-3">
        <Icon className="size-4" />
        <div className="font-medium text-sm">{label}</div>
      </div>
      <div className={cn(
        "size-4 rounded border flex items-center justify-center",
        enabled ? "bg-primary border-primary" : "border-muted-foreground/40"
      )}>
        {enabled && <Check className="size-3 text-primary-foreground" />}
      </div>
    </button>
  );
}

function StatusIcon({ status }: { status: string }) {
  if (status === "ok") return <span className="text-emerald-500 shrink-0">✅</span>;
  if (status === "warn") return <span className="text-amber-500 shrink-0">⚠️</span>;
  return <span className="text-red-500 shrink-0">❌</span>;
}

function VerdictBadge({ recommendation }: { recommendation: string }) {
  if (recommendation === "launch") {
    return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">✅ Готова</Badge>;
  }
  if (recommendation === "fix_first") {
    return <Badge className="bg-amber-100 text-amber-700 border-amber-200">⚠️ Можно с риском</Badge>;
  }
  return <Badge className="bg-red-100 text-red-700 border-red-200">❌ Не запускать</Badge>;
}
