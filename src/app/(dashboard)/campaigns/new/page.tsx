"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft, ArrowRight, Rocket, Sparkles, Check, AlertTriangle, X,
  Loader2, Plug, Bell, Pencil, ExternalLink, Upload, Image as ImageIconLucide, Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  tgBridge,
  type ServiceSummary,
  type AccountsResponse,
  type WizardAuditResponse,
  type WizardLaunchResponse,
  type WizardLaunchResult,
  type BusinessDetail,
} from "@/lib/tg-bridge";
import { MetaGlyph, GoogleGlyph } from "@/components/platform-badge";
import { ScoreCircle } from "@/components/score-circle";
import { AuditFixDrawer } from "@/components/audit-fix-drawer";
import { ServiceBanner } from "@/components/creatives/service-banner";

type Step = 1 | 2 | 3 | 4 | 5;
type PlatformKey = "meta" | "google";

/**
 * New-campaign wizard — design handoff iter-2 §Wizard (W1–W5).
 *
 * 5-step flow with consistent shell:
 *   <Header>   — back link + peach rocket + Bricolage 28/700 title
 *   <Stepper>  — sage done / peach active / cream pending circles
 *   <WizardCard> title + subtitle + body + footer actions on cream strip
 *
 * State machine: platforms → service → budget → audit → launch result.
 * Backend calls go through tgBridge (wizardAudit + wizardLaunch).
 */
export default function NewCampaignWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Prefilled service from /services → "Запустить кампанию" CTA. Read once
  // on mount so subsequent state changes (e.g. user picks a different service)
  // aren't fought by URL re-reads. The same query also drives step skipping
  // when present: we jump straight to the budget step (3) because the
  // platforms step is still useful, but service is no longer ambiguous.
  const prefilledServiceId = (() => {
    const raw = searchParams?.get("service");
    if (!raw) return null;
    const n = parseInt(raw, 10);
    return Number.isFinite(n) ? n : null;
  })();

  const [step, setStep] = useState<Step>(1);

  // Step 1 — Goal (куда ведём + что хотим)
  const [services, setServices] = useState<ServiceSummary[] | null>(null);
  const [serviceId, setServiceId] = useState<number | null>(null);
  const [goal, setGoal] = useState<"leads" | "sales" | "traffic" | "bookings">("leads");

  // Step 2 — Audience & Geo + Destination
  const [geoCountry, setGeoCountry] = useState<string>("");
  const [geoCity, setGeoCity] = useState<string>("");
  const [ageMin, setAgeMin] = useState<number>(18);
  const [ageMax, setAgeMax] = useState<number>(65);
  const [interests, setInterests] = useState<string>("");
  const [destination, setDestination] = useState<import("@/lib/tg-bridge").Destination | null>(null);
  const [destinationUrl, setDestinationUrl] = useState<string>("");

  // Step 3 — Creatives (preview + regen). Regen state lives on the
  // service level — the button re-fetches services list post-regen so
  // banner_previews refresh.
  const [regenBusy, setRegenBusy] = useState(false);

  // Step 4 — Budget
  const [budget, setBudget] = useState<string>("15");

  // Step 5 — Platforms + Audit + Launch (all in one screen now)
  const [accounts, setAccounts] = useState<AccountsResponse | null>(null);
  const [platforms, setPlatforms] = useState<Record<PlatformKey, boolean>>({
    meta: false,
    google: false,
  });
  const [auditing, setAuditing] = useState(false);
  const [audit, setAudit] = useState<WizardAuditResponse | null>(null);

  // "Внести правки" drawer — opens when user clicks the inline fix CTA
  // on an audit warning. business is fetched lazily because the warning
  // codes that the drawer cares about (contacts/audience/offer) live on
  // Business, not on User or Service.
  const [business, setBusiness] = useState<BusinessDetail | null>(null);
  const [drawerCode, setDrawerCode] = useState<"contacts" | "audience" | "offer" | null>(null);

  // Step 5 — launch
  const [launching, setLaunching] = useState(false);
  const [launchResult, setLaunchResult] = useState<WizardLaunchResponse | null>(null);

  useEffect(() => {
    Promise.all([
      tgBridge.services(),
      tgBridge.adAccounts(),
      tgBridge.activeBusiness().catch(() => null),
    ])
      .then(([s, a, biz]) => {
        setServices(s);
        setAccounts(a);
        setPlatforms({ meta: a.has_meta, google: a.has_google });
        if (biz) {
          setBusiness(biz);
          // Seed the Audience step from business profile so the user
          // isn't typing country/city again — they already told us at
          // onboarding.
          if (biz.country) setGeoCountry(biz.country);
          if (biz.city) setGeoCity(biz.city);
        }
        // Hydrate service prefill from ?service=<id>. Skip Step 1 if
        // set — the user just clicked "Запустить" on a service card so
        // the goal picker still shows but pre-selects.
        if (prefilledServiceId && s.some((svc) => svc.id === prefilledServiceId)) {
          setServiceId(prefilledServiceId);
        }
      })
      .catch((e) => {
        console.error(e);
        toast.error("Не удалось загрузить данные. Backend на :8000?");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        destination: destination ?? undefined,
        destination_url: destinationUrl || undefined,
      });
      setAudit(res);
    } catch (e: unknown) {
      console.error(e);
      const msg = e instanceof Error ? e.message : "Аудит не удался";
      toast.error(msg);
    } finally {
      setAuditing(false);
    }
  }, [serviceId, dailyEur, platforms, destination, destinationUrl]);

  // Audit runs the moment the user lands on Step 5, and after any
  // platform toggle (adding Meta might change contact/creative checks).
  useEffect(() => {
    if (step === 5 && !audit && !auditing && !launchResult) runAudit();
  }, [step, audit, auditing, launchResult, runAudit]);

  async function launch() {
    if (!serviceId) return;
    if (!platforms.meta && !platforms.google) {
      toast.error("Выбери хотя бы одну платформу (Meta или Google)");
      return;
    }
    setLaunching(true);
    try {
      const interestsList = interests
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const r = await tgBridge.wizardLaunch({
        service_id: serviceId,
        daily_budget_eur: dailyEur,
        platforms,
        goal,
        geo_country: geoCountry || undefined,
        geo_city: geoCity || undefined,
        age_min: ageMin !== 18 ? ageMin : undefined,
        age_max: ageMax !== 65 ? ageMax : undefined,
        interests: interestsList.length ? interestsList : undefined,
        destination: destination ?? undefined,
        destination_url: destinationUrl || undefined,
      });
      setLaunchResult(r);
    } catch (e: unknown) {
      console.error(e);
      const msg = e instanceof Error ? e.message : "Запуск не удался";
      toast.error(msg);
    } finally {
      setLaunching(false);
    }
  }

  async function regenerateCurrentService() {
    if (!serviceId) return;
    setRegenBusy(true);
    try {
      const updated = await tgBridge.regenerateServiceCreatives(serviceId);
      setServices((prev) =>
        (prev ?? []).map((s) => (s.id === updated.id ? updated : s)),
      );
      toast.success("Креативы перегенерированы");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "не удалось перегенерить");
    } finally {
      setRegenBusy(false);
    }
  }

  const currentService = services?.find((s) => s.id === serviceId) ?? null;

  return (
    <div className="flex justify-center min-h-screen">
      <div className="w-full max-w-[760px] p-6 lg:p-8 space-y-5">
        <Header />
        <Stepper current={step} />

        {step === 1 && (
          <WizardCard
            title="Что рекламируем и зачем"
            subtitle="Выбери услугу, куда поведём трафик, и цель кампании — от неё зависит логика оптимизации."
            footer={
              <>
                <FooterGhost onClick={() => router.push("/campaigns")}>← Отменить</FooterGhost>
                <FooterPrimary onClick={() => setStep(2)} disabled={!serviceId}>
                  Дальше <ArrowRight className="size-3.5" strokeWidth={2} />
                </FooterPrimary>
              </>
            }
          >
            <div className="mb-3 font-mono text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[var(--ink-subtle)]">
              Куда ведём
            </div>
            <div className="flex flex-col gap-2">
              {!services ? (
                <>
                  <Skeleton className="h-16" />
                  <Skeleton className="h-16" />
                </>
              ) : services.length === 0 ? (
                <div className="py-6 text-center text-sm text-[var(--ink-mute)]">
                  Услуг пока нет. Пройди онбординг или добавь в /services.
                </div>
              ) : (
                services.map((s) => (
                  <ServiceOption
                    key={s.id}
                    service={s}
                    platforms={platforms}
                    selected={s.id === serviceId}
                    onClick={() => setServiceId(s.id)}
                  />
                ))
              )}
            </div>

            <div className="mt-6 mb-3 font-mono text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[var(--ink-subtle)]">
              Что хотим получить
            </div>
            <GoalPicker value={goal} onChange={setGoal} />
          </WizardCard>
        )}

        {step === 2 && (
          <WizardCard
            title="Кому и где показываем"
            subtitle="Гео + возраст + интересы. Всё опционально — если пропустить, AI использует профиль бизнеса."
            footer={
              <>
                <FooterGhost onClick={() => setStep(1)}>← Назад</FooterGhost>
                <FooterPrimary onClick={() => setStep(3)}>
                  Дальше <ArrowRight className="size-3.5" strokeWidth={2} />
                </FooterPrimary>
              </>
            }
          >
            <AudienceForm
              country={geoCountry} onCountry={setGeoCountry}
              city={geoCity} onCity={setGeoCity}
              ageMin={ageMin} onAgeMin={setAgeMin}
              ageMax={ageMax} onAgeMax={setAgeMax}
              interests={interests} onInterests={setInterests}
              businessAudienceHint={currentService?.target_audience ?? null}
            />

            <div className="mt-6 mb-3 font-mono text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[var(--ink-subtle)]">
              Куда ведём клиента
            </div>
            <DestinationPicker
              serviceId={serviceId}
              value={destination}
              onChange={setDestination}
              url={destinationUrl}
              onUrl={setDestinationUrl}
            />
          </WizardCard>
        )}

        {step === 3 && (
          <WizardCard
            title="Креативы и тексты"
            subtitle="AI сгенерил 3 варианта под твою услугу. Если не нравится — перегенерь. Настроить детально можно в /creatives."
            footer={
              <>
                <FooterGhost onClick={() => setStep(2)}>← Назад</FooterGhost>
                <FooterPrimary onClick={() => setStep(4)}>
                  Дальше <ArrowRight className="size-3.5" strokeWidth={2} />
                </FooterPrimary>
              </>
            }
          >
            <CreativePreview
              service={currentService}
              regenBusy={regenBusy}
              onRegen={regenerateCurrentService}
            />
          </WizardCard>
        )}

        {step === 4 && (
          <WizardCard
            title="Дневной бюджет"
            subtitle="EUR в день на каждую выбранную платформу. Алгоритмы Meta и Google лучше учатся от €10/день."
            footer={
              <>
                <FooterGhost onClick={() => setStep(3)}>← Назад</FooterGhost>
                <FooterPrimary onClick={() => setStep(5)} disabled={dailyEur < 1}>
                  <ArrowRight className="size-3.5" strokeWidth={2} /> К запуску
                </FooterPrimary>
              </>
            }
          >
            {/* Big peach number block */}
            <div
              className="rounded-xl flex items-center justify-center gap-4 py-6 px-5"
              style={{ background: "var(--peach-wash)", border: "1px solid var(--peach-soft)" }}
            >
              <div className="flex items-baseline">
                <span
                  className="font-mono font-medium text-[56px] leading-none tracking-[-0.03em] tabular-nums"
                  style={{ color: "var(--peach-deep)" }}
                >
                  €
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value.replace(/[^\d]/g, ""))}
                  className="font-mono font-medium text-[56px] leading-none tracking-[-0.03em] tabular-nums text-foreground bg-transparent border-0 outline-none focus:ring-0 px-0"
                  // +1ch of slack so the last digit never clips; text+inputMode
                  // avoids the number-spinner arrows that ate the space before.
                  style={{ width: `${Math.max(2, budget.length) + 1}ch` }}
                />
              </div>
              <div className="text-[15px] text-[var(--ink-mute)] self-end mb-1.5">
                / день на каждую платформу
              </div>
            </div>

            {/* Presets */}
            <div className="grid grid-cols-6 gap-2 mt-3.5">
              {[5, 10, 15, 25, 50, 100].map((v) => {
                const active = Number(budget) === v;
                return (
                  <button
                    key={v}
                    onClick={() => setBudget(String(v))}
                    className={cn(
                      "py-2.5 px-3 rounded-lg font-mono text-[13px] font-medium tabular-nums transition-colors",
                      active
                        ? "bg-foreground text-background border border-foreground"
                        : "bg-[var(--card-soft)] text-[var(--ink-mute)] hover:text-foreground border"
                    )}
                    style={!active ? { borderColor: "var(--border)" } : undefined}
                  >
                    €{v}
                  </button>
                );
              })}
            </div>

            {/* AI Forecast */}
            <BudgetForecast dailyEur={dailyEur} />
          </WizardCard>
        )}

        {step === 5 && !launchResult && (
          <WizardCard
            title="Запуск"
            subtitle="Выбери платформы, посмотри аудит и нажми «Запустить». Кампании создаются в PAUSED — активируешь после проверки."
            footer={
              <>
                <FooterGhost onClick={() => { setAudit(null); setStep(4); }} disabled={launching}>
                  ← Изменить бюджет
                </FooterGhost>
                <FooterPrimary
                  onClick={launch}
                  disabled={launching || (!platforms.meta && !platforms.google) || !audit || audit?.recommendation === "do_not_launch"}
                >
                  {launching ? (
                    <><Loader2 className="size-3.5 animate-spin" /> Запускаю...</>
                  ) : (
                    <><Rocket className="size-3.5" strokeWidth={1.8} /> Запустить</>
                  )}
                </FooterPrimary>
              </>
            }
          >
            <div className="mb-3 font-mono text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[var(--ink-subtle)]">
              На каких платформах
            </div>
            <div className="flex flex-col gap-3 mb-5">
              {(["meta", "google"] as const).map((p) => (
                <PlatformOption
                  key={p}
                  platform={p}
                  connected={p === "meta" ? !!accounts?.has_meta : !!accounts?.has_google}
                  enabled={platforms[p]}
                  onConnect={async () => {
                    try {
                      const { url } = p === "meta"
                        ? await tgBridge.metaOauthUrl()
                        : await tgBridge.googleOauthUrl();
                      window.open(url, "_blank", "noopener,noreferrer");
                      toast.info("OAuth открылся в новой вкладке");
                    } catch {
                      toast.error("Не получилось получить OAuth-ссылку");
                    }
                  }}
                  onToggle={() => {
                    setPlatforms((s) => ({ ...s, [p]: !s[p] }));
                    // Platform toggle invalidates the audit — different
                    // checks apply per platform (Google needs RSA, Meta
                    // needs Page). Refetch on next tick via useEffect.
                    setAudit(null);
                  }}
                />
              ))}
            </div>

            <div className="mb-3 font-mono text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[var(--ink-subtle)]">
              Аудит перед запуском
            </div>
            <AuditBody
              audit={audit}
              loading={auditing}
              onFix={setDrawerCode}
            />
          </WizardCard>
        )}

        {step === 5 && launchResult && (
          <WizardCard
            title="Кампания запущена 🎉"
            subtitle="Все объекты созданы в статусе Paused. Проверь в Ads Manager и активируй — или дай команду «активируй» из Telegram."
            footer={
              <>
                <FooterGhost onClick={() => router.push("/campaigns")}>К списку</FooterGhost>
                <FooterPrimary onClick={() => router.push("/campaigns")}>
                  Открыть кампанию <ArrowRight className="size-3.5" strokeWidth={2} />
                </FooterPrimary>
              </>
            }
          >
            <div className="flex flex-col gap-2.5">
              {launchResult.results.map((r) => (
                <LaunchResultRow key={r.platform} result={r} />
              ))}
            </div>

            <div
              className="mt-3.5 px-4 py-3.5 rounded-xl flex items-start gap-2.5"
              style={{ background: "var(--peach-wash)", border: "1px solid var(--peach-soft)" }}
            >
              <Bell className="size-4 mt-0.5 text-[var(--peach-deep)] shrink-0" strokeWidth={1.6} />
              <div className="flex-1 min-w-0">
                <div className="text-[13.5px] font-medium text-foreground mb-1 tracking-[-0.005em]">
                  Я буду присматривать за метриками
                </div>
                <div className="text-[12.5px] text-[var(--ink-mute)] leading-[1.5]">
                  Через 24 ч пришлю в Telegram first-look отчёт. Если CPA скакнёт или CTR упадёт — оповещу сразу.
                </div>
              </div>
            </div>
          </WizardCard>
        )}
      </div>

      <AuditFixDrawer
        open={drawerCode !== null}
        code={drawerCode}
        business={business}
        serviceId={serviceId ?? undefined}
        onClose={() => setDrawerCode(null)}
        onSaved={async () => {
          // Re-pull the business so the next "Внести правки" opens with
          // fresh values, and re-run the audit so the warning flips OK.
          try {
            const fresh = await tgBridge.activeBusiness();
            setBusiness(fresh);
          } catch (e) {
            console.warn("activeBusiness refresh failed", e);
          }
          setAudit(null);
          runAudit();
        }}
      />
    </div>
  );
}


// ─────────────────────────────────────────────────────────
// Shell components
// ─────────────────────────────────────────────────────────


function Header() {
  return (
    <div>
      <Link
        href="/campaigns"
        className="flex items-center gap-1.5 text-[12.5px] text-[var(--ink-mute)] hover:text-foreground mb-2"
      >
        <ArrowLeft className="size-3" /> Кампании
      </Link>
      <div className="flex items-center gap-3">
        <div
          className="size-11 rounded-xl flex items-center justify-center shrink-0"
          style={{
            background: "linear-gradient(135deg, var(--peach), var(--peach-deep))",
            boxShadow: "0 6px 18px -6px rgba(232,149,108,0.5)",
          }}
        >
          <Rocket className="size-5 text-white" strokeWidth={1.8} />
        </div>
        <div>
          <h1 className="font-heading text-[28px] font-bold tracking-[-0.025em] leading-tight text-foreground">
            Новая кампания
          </h1>
          <p className="text-[13.5px] text-[var(--ink-mute)] mt-0.5">
            AI проведёт тебя по 5 шагам и поможет с аудитом перед запуском
          </p>
        </div>
      </div>
    </div>
  );
}


function Stepper({ current }: { current: Step }) {
  const labels = ["Цель", "Аудитория", "Креативы", "Бюджет", "Запуск"] as const;
  return (
    <div
      className="flex items-center gap-2 rounded-xl px-4 py-3.5 bg-card border"
      style={{ borderColor: "var(--border)" }}
    >
      {labels.map((label, i) => {
        const n = (i + 1) as Step;
        const done = n < current;
        const active = n === current;
        return (
          <div key={label} className="flex items-center gap-2 flex-1 last:flex-none">
            <div className="flex items-center gap-2.5 shrink-0">
              <div
                className={cn(
                  "size-6 rounded-full flex items-center justify-center font-mono text-[11.5px] font-semibold tabular-nums",
                  done && "bg-[var(--sage)] text-white",
                  active && "bg-[var(--peach)] text-white",
                  !done && !active && "bg-[var(--card-soft)] text-[var(--ink-subtle)] border"
                )}
                style={{
                  boxShadow: active ? "0 0 0 4px rgba(232,149,108,0.18)" : undefined,
                  borderColor: !done && !active ? "var(--border)" : undefined,
                }}
              >
                {done ? <Check className="size-3" strokeWidth={2.5} /> : n}
              </div>
              <div
                className={cn(
                  "text-[12.5px] tracking-[-0.005em] hidden sm:block",
                  active ? "text-foreground font-medium" : done ? "text-[var(--ink-mute)]" : "text-[var(--ink-subtle)]"
                )}
              >
                {label}
              </div>
            </div>
            {i < labels.length - 1 && (
              <div
                className="h-px flex-1 mx-1"
                style={{ background: done ? "rgba(133, 162, 117, 0.4)" : "rgba(31, 29, 26, 0.06)" }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}


function WizardCard({
  title, subtitle, footer, children,
}: {
  title: string;
  subtitle?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-card border overflow-hidden" style={{ borderColor: "var(--border)" }}>
      <div className="px-6 pt-5 pb-1">
        <h2 className="font-heading text-[20px] font-bold tracking-[-0.02em] text-foreground">
          {title}
        </h2>
        {subtitle && (
          <div className="text-[13.5px] text-[var(--ink-mute)] mt-1.5 leading-[1.5]">
            {subtitle}
          </div>
        )}
      </div>
      <div className="px-6 py-4">{children}</div>
      {footer && (
        <div
          className="px-6 py-3.5 flex items-center gap-2.5 border-t"
          style={{ background: "var(--card-soft)", borderColor: "rgba(31,29,26,0.06)" }}
        >
          {footer}
        </div>
      )}
    </div>
  );
}


function FooterPrimary({
  children, onClick, disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "ml-auto inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-[13.5px] font-medium tracking-[-0.005em] transition-all bg-[var(--peach)] text-white",
        disabled ? "opacity-45 cursor-not-allowed" : "hover:brightness-105 active:brightness-95 cursor-pointer"
      )}
      style={{ boxShadow: disabled ? "none" : "0 4px 14px -4px rgba(232,149,108,0.5)" }}
    >
      {children}
    </button>
  );
}


function FooterGhost({
  children, onClick, disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-[13.5px] font-medium text-[var(--ink-mute)] hover:text-foreground transition-colors",
        disabled && "opacity-45 cursor-not-allowed"
      )}
    >
      {children}
    </button>
  );
}


// ─────────────────────────────────────────────────────────
// Step 1 — Platform option row
// ─────────────────────────────────────────────────────────


function PlatformOption({
  platform, connected, enabled, onToggle, onConnect,
}: {
  platform: PlatformKey;
  connected: boolean;
  enabled: boolean;
  onToggle: () => void;
  onConnect: () => void;
}) {
  const isMeta = platform === "meta";
  const colorBg = isMeta ? "var(--meta-soft)" : "#F4FAEF";
  const colorBorder = isMeta ? "#CDDDFA" : "#D9E7CC";
  const colorInk = isMeta ? "var(--meta-ink)" : "var(--google-ink)";
  const name = isMeta ? "Meta Ads" : "Google Ads";
  const sub = isMeta
    ? "Facebook + Instagram · Business Manager · OAuth обязателен"
    : "Search + Performance Max · MCC + developer-token обязательны";
  const highlight = isMeta
    ? "Здесь обычно лучше для emotional / visual креативов"
    : "Берёт горячий трафик — те кто ищет «имплант tallinn»";

  const handleClick = () => {
    if (!connected) onConnect();
    else onToggle();
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-start gap-3.5 p-4 rounded-xl border text-left transition-all w-full"
      style={{
        background: connected && enabled ? `${colorBg}55` : "var(--card-soft)",
        borderColor: connected && enabled ? colorBorder : "var(--border)",
      }}
    >
      <div
        className="size-10 rounded-[10px] bg-white border flex items-center justify-center shrink-0"
        style={{ borderColor: connected && enabled ? colorBorder : "var(--border)" }}
      >
        {isMeta ? <MetaGlyph size={20} /> : <GoogleGlyph size={20} />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="text-[15px] font-semibold text-foreground tracking-[-0.01em]">{name}</span>
          {connected ? (
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-mono text-[10px] font-semibold uppercase tracking-[0.04em]"
              style={{ background: "var(--sage-soft)", color: "#456838" }}
            >
              <span className="size-1.5 rounded-full bg-[var(--sage)]" />
              Подключено
            </span>
          ) : (
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-mono text-[10px] font-semibold uppercase tracking-[0.04em]"
              style={{ background: "var(--card-soft)", color: "var(--ink-subtle)", border: "1px solid var(--border)" }}
            >
              <Plug className="size-2.5" /> Подключить
            </span>
          )}
        </div>
        <div className="font-mono text-[11.5px] text-[var(--ink-mute)] leading-[1.5] mb-1.5">{sub}</div>
        <div className="text-[12.5px] italic leading-snug" style={{ color: colorInk }}>{highlight}</div>
      </div>
      <div
        className="size-[22px] rounded-md flex items-center justify-center shrink-0 mt-1"
        style={{
          background: enabled && connected ? "var(--peach)" : "transparent",
          border: `1.5px solid ${enabled && connected ? "var(--peach)" : "var(--border)"}`,
        }}
      >
        {enabled && connected && <Check className="size-3 text-white" strokeWidth={2.5} />}
      </div>
    </button>
  );
}


// ─────────────────────────────────────────────────────────
// Step 2 — Service option row
// ─────────────────────────────────────────────────────────


function ServiceOption({
  service, platforms, selected, onClick,
}: {
  service: ServiceSummary;
  platforms: Record<PlatformKey, boolean>;
  selected: boolean;
  onClick: () => void;
}) {
  const showMeta = platforms.meta;
  const showGoogle = platforms.google;
  const metaReady = service.has_meta_creatives;
  const googleReady = service.has_google_rsa;

  let statusIcon: string | null = null;
  let statusText: string | null = null;
  let statusColor = "var(--ink-mute)";
  if (showMeta && showGoogle) {
    if (metaReady && googleReady) {
      statusIcon = "✨"; statusText = "Всё готово — мгновенный запуск"; statusColor = "var(--sage)";
    } else if (!metaReady && !googleReady) {
      statusIcon = "⊙"; statusText = "AI сгенерирует креативы при запуске (~30 сек)";
    } else {
      statusIcon = "⊙";
      statusText = metaReady
        ? "Meta готова · Google сгенерируется (~30 сек)"
        : "Google готов · Meta сгенерируется (~30 сек)";
      statusColor = "var(--warn)";
    }
  } else if (showMeta) {
    statusIcon = metaReady ? "✨" : "⊙";
    statusText = metaReady ? "Готово — 3 креатива" : "AI сгенерирует креативы при запуске (~30 сек)";
    statusColor = metaReady ? "var(--sage)" : "var(--ink-mute)";
  } else if (showGoogle) {
    statusIcon = googleReady ? "✨" : "⊙";
    statusText = googleReady ? "Готово — 15 headlines" : "AI сгенерирует RSA при запуске (~30 сек)";
    statusColor = googleReady ? "var(--sage)" : "var(--ink-mute)";
  }

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3.5 px-4 py-3.5 rounded-xl border text-left transition-all w-full"
      style={{
        background: selected ? "var(--peach-wash)" : "transparent",
        borderColor: selected ? "var(--peach)" : "var(--border)",
      }}
    >
      <div
        className="size-[18px] rounded-full flex items-center justify-center shrink-0"
        style={{ border: `1.5px solid ${selected ? "var(--peach)" : "var(--border)"}` }}
      >
        {selected && <div className="size-2 rounded-full bg-[var(--peach)]" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[14px] font-medium text-foreground tracking-[-0.005em]">
            {service.name}
          </span>
          {service.price && (
            <span className="font-mono text-[11px] text-[var(--ink-subtle)] tabular-nums">
              {service.price_currency === "EUR" ? "€" : ""}{Math.round(service.price)}
            </span>
          )}
        </div>
        {service.description && (
          <div className="text-[12px] text-[var(--ink-mute)] mt-0.5 leading-[1.45] truncate">
            {service.description}
          </div>
        )}
        {statusText && (
          <div
            className="inline-flex items-center gap-1.5 mt-1.5 text-[11.5px] font-medium tracking-[-0.005em]"
            style={{ color: statusColor }}
          >
            <span className="text-[12px] leading-none">{statusIcon}</span>
            {statusText}
          </div>
        )}
      </div>
    </button>
  );
}


// ─────────────────────────────────────────────────────────
// Step 3 — Budget AI forecast
// ─────────────────────────────────────────────────────────


function BudgetForecast({
  dailyEur,
}: {
  dailyEur: number;
}) {
  // Per-platform, because the platform choice happens on the launch step —
  // here we only know the daily budget. Monthly = daily × 30 for one
  // platform; the copy says "на платформу" so multi-platform users just
  // multiply. (Was computing × selected-platforms, which is 0 at this step
  // and rendered "€0 · × 0 платформ".)
  const monthly = dailyEur * 30;
  const convRate = 0.038;
  const leadsLow = Math.max(1, Math.round((monthly * convRate) / 1.2));
  const leadsHigh = Math.max(2, Math.round((monthly * convRate) * 1.2));
  const cplLow = Math.max(5, Math.round(monthly / leadsHigh));
  const cplHigh = Math.max(10, Math.round(monthly / leadsLow));
  const benchmark = Math.round(cplHigh * 1.6);

  return (
    <div
      className="rounded-xl flex items-start gap-3 p-4 mt-4"
      style={{
        background: "linear-gradient(135deg, #FCF1E8 0%, #F8E8D9 100%)",
        border: "1px solid #F5DDC8",
      }}
    >
      <Sparkles className="size-[18px] text-[var(--peach)] mt-0.5 shrink-0" strokeWidth={1.6} />
      <div className="flex-1 min-w-0">
        <div className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.1em] text-[var(--peach-deep)] mb-1.5">
          AI · ПРОГНОЗ
        </div>
        <div className="text-[13px] leading-[1.55] tracking-[-0.005em]">
          При <b>€{dailyEur.toFixed(0)}/день на одну платформу</b> и стандартных
          бенчмарках по нише:
        </div>
        <div className="grid grid-cols-3 gap-2.5 mt-2.5">
          <ForecastTile label="Бюджет / мес" value={`€${monthly.toFixed(0)}`} sub="на платформу" />
          <ForecastTile label="Прогноз лидов" value={`${leadsLow}–${leadsHigh}`} sub={`${(convRate * 100).toFixed(1)}% conv`} />
          <ForecastTile label="Ожидаемый CPL" value={`€${cplLow}–${cplHigh}`} sub={`бенчмарк €${benchmark}`} />
        </div>
      </div>
    </div>
  );
}


function ForecastTile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg py-2 px-2.5 bg-white/65">
      <div className="font-mono text-[9.5px] font-semibold uppercase tracking-[0.08em] text-[var(--peach-deep)]">
        {label}
      </div>
      <div className="font-mono text-[16px] font-medium tabular-nums tracking-[-0.01em] text-foreground mt-0.5">
        {value}
      </div>
      {sub && <div className="font-mono text-[10px] text-[var(--ink-subtle)] mt-px">{sub}</div>}
    </div>
  );
}


// ─────────────────────────────────────────────────────────
// Step 4 — Audit body
// ─────────────────────────────────────────────────────────


// Audit warnings the inline drawer can resolve. Any other code (budget,
// landing, photos) is either fixed elsewhere in the wizard or needs an
// action that lives outside the drawer (raise budget, generate landing).
const FIXABLE_CODES = new Set(["contacts", "audience", "offer"]);

function AuditBody({
  audit,
  loading,
  onFix,
}: {
  audit: WizardAuditResponse | null;
  loading: boolean;
  onFix?: (code: "contacts" | "audience" | "offer") => void;
}) {
  if (loading || !audit) {
    return (
      <div className="space-y-2 py-3">
        <div className="flex items-center gap-2 text-sm text-[var(--ink-mute)]">
          <Loader2 className="size-4 animate-spin" /> AI читает метрики и сравнивает с benchmarks...
        </div>
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-4/5" />
      </div>
    );
  }

  const verdictLabel = audit.recommendation === "launch"
    ? "Запускать можно"
    : audit.recommendation === "fix_first"
      ? "Можно с риском"
      : "Не запускать";
  const verdictBg = audit.recommendation === "launch"
    ? "var(--sage-soft)"
    : audit.recommendation === "fix_first"
      ? "#FBEDD3"
      : "#F7DDD0";
  const verdictColor = audit.recommendation === "launch"
    ? "#456838"
    : audit.recommendation === "fix_first"
      ? "var(--warn)"
      : "var(--destructive)";

  return (
    <>
      {/* Score + verdict header */}
      <div
        className="rounded-xl flex items-center gap-5 p-5"
        style={{ background: "var(--card-soft)", border: "1px solid var(--border)" }}
      >
        <ScoreCircle score={audit.score} />
        <div className="flex-1 min-w-0">
          <div className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-subtle)]">
            ВЕРДИКТ AI
          </div>
          <div className="font-heading text-[22px] font-bold tracking-[-0.02em] mt-1">
            {verdictLabel}
          </div>
          {audit.ai_summary && (
            <div className="text-[13.5px] text-[var(--ink-mute)] mt-1.5 leading-[1.5] tracking-[-0.005em]">
              {audit.ai_summary}
            </div>
          )}
        </div>
        <div
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12.5px] font-semibold"
          style={{ background: verdictBg, color: verdictColor }}
        >
          {audit.recommendation === "launch" ? (
            <Check className="size-3" strokeWidth={2.5} />
          ) : audit.recommendation === "fix_first" ? (
            <AlertTriangle className="size-3" strokeWidth={2.2} />
          ) : (
            <X className="size-3" strokeWidth={2.2} />
          )}
          {audit.recommendation === "launch"
            ? "Готова"
            : audit.recommendation === "fix_first"
              ? "Внимание"
              : "Стоп"}
        </div>
      </div>

      {/* Items */}
      <div className="mt-3.5 space-y-2">
        {audit.items.map((it, i) => (
          <AuditItemCard
            key={i}
            item={it}
            onFix={
              onFix && it.code && FIXABLE_CODES.has(it.code)
                ? () => onFix(it.code as "contacts" | "audience" | "offer")
                : undefined
            }
          />
        ))}
      </div>

      {/* AI priority fix */}
      {audit.ai_priority_fix && (
        <div
          className="mt-4 rounded-xl flex items-start gap-3 p-3.5"
          style={{
            background: "linear-gradient(135deg, #FCF1E8 0%, #F8E8D9 100%)",
            border: "1px solid #F5DDC8",
          }}
        >
          <Sparkles className="size-5 text-[var(--peach)] shrink-0" strokeWidth={1.6} />
          <div className="flex-1 min-w-0">
            <div className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.1em] text-[var(--peach-deep)] mb-1.5">
              🎯 Приоритет AI
            </div>
            <div className="text-[14px] font-medium text-foreground tracking-[-0.005em]">
              {audit.ai_priority_fix}
            </div>
            {audit.ai_why_priority && (
              <div className="text-[12.5px] text-[var(--ink-mute)] mt-1 leading-[1.5]">
                {audit.ai_why_priority}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}


function AuditItemCard({
  item,
  onFix,
}: {
  item: { status: string; message: string; fix: string | null };
  onFix?: () => void;
}) {
  const color = item.status === "ok" ? "var(--sage)" : item.status === "warn" ? "var(--warn)" : "var(--destructive)";
  const bg = item.status === "ok" ? "var(--sage-soft)" : item.status === "warn" ? "#FBEDD3" : "#F7DDD0";
  const Icon = item.status === "ok" ? Check : AlertTriangle;
  return (
    <div
      className="rounded-lg bg-card border p-3.5 flex items-start gap-2.5"
      style={{ borderLeftWidth: 3, borderLeftColor: color, borderColor: "var(--border)" }}
    >
      <div
        className="size-[18px] rounded-full flex items-center justify-center shrink-0 mt-0.5"
        style={{ background: bg }}
      >
        <Icon className="size-3" style={{ color }} strokeWidth={2.4} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13.5px] text-foreground leading-[1.5] tracking-[-0.005em]">
          {item.message}
        </div>
        {item.fix && (
          <div className="text-[12px] italic text-[var(--ink-mute)] mt-1 leading-[1.5]">
            ↳ {item.fix}
          </div>
        )}
      </div>
      {onFix && (
        // For non-OK warnings the action is loud (peach) because clearing
        // the warning matters. For OK items we still want to let the user
        // refine the answer ('AI guessed wrong on the audience') but in a
        // way that doesn't visually compete with real problems → ghost
        // pencil button.
        item.status === "ok" ? (
          <button
            type="button"
            onClick={onFix}
            className="shrink-0 inline-flex items-center gap-1 rounded-md px-2 py-1 text-[12px] font-medium transition-colors hover:bg-[var(--card-soft)]"
            style={{ color: "var(--ink-mute)" }}
            title="Изменить"
          >
            <Pencil className="size-[12px]" strokeWidth={2} />
            Изменить
          </button>
        ) : (
          <button
            type="button"
            onClick={onFix}
            className="shrink-0 inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[12px] font-medium transition-opacity hover:opacity-80"
            style={{ background: "var(--peach)", color: "#fff" }}
          >
            Внести правки <ArrowRight className="size-3" strokeWidth={2.2} />
          </button>
        )
      )}
    </div>
  );
}


// ─────────────────────────────────────────────────────────
// Step 5 — Launch result row
// ─────────────────────────────────────────────────────────

/**
 * Build a deep link to the platform's ads manager so the user can jump
 * straight to the PAUSED campaign we just created. Meta's URL uses
 * `act` (numeric ad account id, no prefix) + `selected_campaign_ids`.
 * Google's uses the "customers/N" numeric segment + campaignId.
 */
function buildAdsManagerUrl(r: WizardLaunchResult): string {
  const { platform, campaign_id, platform_account_id } = r;
  if (!campaign_id || !platform_account_id) return "#";
  if (platform === "meta") {
    // "act_1234567" → "1234567"; also handle already-stripped form.
    const actId = platform_account_id.replace(/^act_/, "");
    return `https://adsmanager.facebook.com/adsmanager/manage/campaigns?act=${actId}&selected_campaign_ids=${encodeURIComponent(campaign_id)}`;
  }
  if (platform === "google") {
    // Google's "customers/N/..." — pull just the customer id digits.
    const custMatch = platform_account_id.match(/customers?\/(\d+)/);
    const custId = custMatch ? custMatch[1] : platform_account_id.replace(/\D/g, "");
    return `https://ads.google.com/aw/campaigns?ocid=${custId}&campaignId=${encodeURIComponent(campaign_id)}`;
  }
  return "#";
}


function LaunchResultRow({ result }: { result: WizardLaunchResult }) {
  const ok = result.ok;
  const isMeta = result.platform === "meta";
  const Glyph = isMeta ? MetaGlyph : GoogleGlyph;
  return (
    <div
      className="rounded-xl p-3.5 flex items-start gap-3"
      style={{
        background: ok ? "rgba(220, 230, 211, 0.4)" : "var(--peach-wash)",
        border: `1px solid ${ok ? "#BFD0B0" : "#E8B59C"}`,
      }}
    >
      <div
        className="size-8 rounded-lg bg-white flex items-center justify-center shrink-0"
        style={{ border: `1px solid ${ok ? "#BFD0B0" : "#E8B59C"}` }}
      >
        <Glyph size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="text-[14px] font-semibold text-foreground tracking-[-0.005em]">
            {isMeta ? "Meta" : "Google Ads"}
          </span>
          <span
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-mono text-[9.5px] font-semibold uppercase tracking-[0.04em] text-white"
            style={{ background: ok ? "var(--sage)" : "var(--destructive)" }}
          >
            {ok ? <Check className="size-2.5" strokeWidth={2.5} /> : <X className="size-2.5" strokeWidth={2.5} />}
            {ok ? "CREATED" : "FAILED"}
          </span>
        </div>
        {ok ? (
          <>
            <div className="text-[12.5px] text-[var(--ink-mute)] leading-[1.5]">{result.detail}</div>
            {result.campaign_id && (
              <div className="font-mono text-[11px] text-[var(--ink-subtle)] mt-1 tabular-nums">
                {isMeta ? "meta_camp_" : "google_camp_"}
                {result.campaign_id}
              </div>
            )}
            {result.campaign_id && result.platform_account_id && (
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <a
                  href={buildAdsManagerUrl(result)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-[6px] text-[11.5px] font-medium text-[var(--peach-deep)] transition-colors hover:bg-white/60"
                  style={{ border: "1px solid var(--peach-soft)", background: "white" }}
                >
                  <ExternalLink className="size-3" />
                  Открыть в {isMeta ? "Ads Manager" : "Google Ads"}
                </a>
                <Link
                  href={`/campaigns/${encodeURIComponent(result.campaign_id)}`}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-[6px] text-[11.5px] font-medium text-[var(--ink-mute)] transition-colors hover:bg-white/60"
                  style={{ border: "1px solid var(--border)", background: "white" }}
                >
                  Открыть в UniAds →
                </Link>
              </div>
            )}
          </>
        ) : (
          <div className="text-[12.5px] text-[var(--ink-mute)] leading-[1.5]">{result.error}</div>
        )}
      </div>
    </div>
  );
}


// ─────────────────────────────────────────────────────────
// Step 1 — Goal picker (4 chips)
// ─────────────────────────────────────────────────────────

const GOALS = [
  { key: "leads", label: "Лиды", detail: "Заявки, звонки, форма" },
  { key: "sales", label: "Продажи", detail: "Покупки на сайте / оффлайн" },
  { key: "traffic", label: "Трафик", detail: "Клики на сайт, охват" },
  { key: "bookings", label: "Записи", detail: "Онлайн-бронь / расписание" },
] as const;

function GoalPicker({
  value,
  onChange,
}: {
  value: "leads" | "sales" | "traffic" | "bookings";
  onChange: (v: "leads" | "sales" | "traffic" | "bookings") => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {GOALS.map((g) => {
        const active = value === g.key;
        return (
          <button
            key={g.key}
            type="button"
            onClick={() => onChange(g.key)}
            className="text-left rounded-[10px] px-3.5 py-3 transition-colors"
            style={{
              background: active ? "var(--peach-wash)" : "var(--card-soft)",
              border: `1.5px solid ${active ? "var(--peach)" : "var(--border)"}`,
            }}
          >
            <div
              className="text-[13.5px] font-semibold"
              style={{ color: active ? "var(--peach-deep)" : "var(--ink)" }}
            >
              {g.label}
            </div>
            <div className="mt-0.5 text-[11.5px] text-[var(--ink-mute)]">
              {g.detail}
            </div>
          </button>
        );
      })}
    </div>
  );
}


// ─────────────────────────────────────────────────────────
// Step 2 — Audience & Geo
// ─────────────────────────────────────────────────────────

const DESTINATIONS: { key: import("@/lib/tg-bridge").Destination; label: string; hint: string; needsUrl?: boolean; isLanding?: boolean }[] = [
  { key: "site", label: "Сайт", hint: "вставь ссылку", needsUrl: true },
  { key: "landing", label: "Лендинг", hint: "сгенерим страницу", isLanding: true },
  { key: "lead_form", label: "Форма Meta", hint: "заявка без сайта" },
  { key: "whatsapp", label: "WhatsApp", hint: "чат" },
  { key: "instagram", label: "Instagram", hint: "Direct" },
  { key: "facebook", label: "Facebook", hint: "Messenger" },
  { key: "booking", label: "Онлайн-запись", hint: "расписание" },
];

// "Куда ведём клиента" — the destination decision, made here rather than
// nagged about at launch. Landing option generates a page on the spot.
function DestinationPicker({
  serviceId, value, onChange, url, onUrl,
}: {
  serviceId: number | null;
  value: import("@/lib/tg-bridge").Destination | null;
  onChange: (v: import("@/lib/tg-bridge").Destination) => void;
  url: string;
  onUrl: (v: string) => void;
}) {
  const [genBusy, setGenBusy] = useState(false);
  const [landingUrl, setLandingUrl] = useState<string | null>(null);

  async function genLanding() {
    if (serviceId == null) return;
    setGenBusy(true);
    try {
      const r = await tgBridge.generateLanding(serviceId);
      if (r.url) {
        setLandingUrl(r.url);
        onUrl(r.url);
        toast.success("Лендинг сгенерирован");
      } else {
        toast.error("Не удалось получить ссылку лендинга");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "не удалось сгенерить лендинг");
    } finally {
      setGenBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {DESTINATIONS.map((d) => {
          const active = value === d.key;
          return (
            <button
              key={d.key}
              type="button"
              onClick={() => onChange(d.key)}
              className="text-left rounded-[10px] px-3 py-2.5 transition-colors"
              style={{
                background: active ? "var(--peach-wash)" : "var(--card-soft)",
                border: `1.5px solid ${active ? "var(--peach)" : "var(--border)"}`,
              }}
            >
              <div className="text-[13px] font-semibold" style={{ color: active ? "var(--peach-deep)" : "var(--ink)" }}>
                {d.label}
              </div>
              <div className="text-[11px] text-[var(--ink-mute)] mt-0.5">{d.hint}</div>
            </button>
          );
        })}
      </div>

      {value === "site" && (
        <LabeledInput
          label="Ссылка на сайт / страницу"
          placeholder="https://твой-сайт.ee/услуга"
          value={url}
          onChange={onUrl}
        />
      )}

      {value === "landing" && (
        <div
          className="rounded-[10px] px-3.5 py-3 flex items-center gap-3"
          style={{ background: "var(--peach-wash)", border: "1px solid var(--peach-soft)" }}
        >
          <div className="flex-1 text-[12.5px] leading-relaxed text-[var(--ink)]">
            {landingUrl ? (
              <>Лендинг готов: <a href={landingUrl} target="_blank" rel="noreferrer" className="underline text-[var(--peach-deep)]">{landingUrl.replace(/^https?:\/\//, "")}</a></>
            ) : (
              <>AI соберёт лендинг под эту услугу из профиля — заголовок, выгоды, кнопка заявки.</>
            )}
          </div>
          <button
            onClick={genLanding}
            disabled={genBusy}
            className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[9px] text-[12.5px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ background: "var(--peach)" }}
          >
            {genBusy ? <Loader2 className="size-3.5 animate-spin" /> : <Sparkles className="size-3.5" />}
            {landingUrl ? "Пересобрать" : "Сгенерировать"}
          </button>
        </div>
      )}
    </div>
  );
}

function AudienceForm({
  country, onCountry,
  city, onCity,
  ageMin, onAgeMin,
  ageMax, onAgeMax,
  interests, onInterests,
  businessAudienceHint,
}: {
  country: string;
  onCountry: (v: string) => void;
  city: string;
  onCity: (v: string) => void;
  ageMin: number;
  onAgeMin: (n: number) => void;
  ageMax: number;
  onAgeMax: (n: number) => void;
  interests: string;
  onInterests: (v: string) => void;
  businessAudienceHint: string | null;
}) {
  return (
    <div className="flex flex-col gap-4">
      {businessAudienceHint && (
        <div
          className="rounded-[10px] px-3.5 py-2.5 text-[12px] leading-relaxed"
          style={{
            background: "var(--sage-soft)",
            border: "1px solid #BFD0B0",
          }}
        >
          <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.06em]" style={{ color: "#456838" }}>
            AI знает
          </span>
          <span className="text-[var(--ink)] ml-2">{businessAudienceHint}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <LabeledInput
          label="Страна (ISO-2)"
          placeholder="EE"
          value={country}
          maxLength={2}
          onChange={(v) => onCountry(v.toUpperCase())}
        />
        <LabeledInput
          label="Город"
          placeholder="Tallinn"
          value={city}
          onChange={onCity}
        />
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[11px] font-medium uppercase tracking-[0.04em] text-[var(--ink-subtle)]">
            Возраст
          </span>
          <span className="font-mono text-[12px] tabular-nums text-[var(--ink)]">
            {ageMin} — {ageMax}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <input
              type="range"
              min={13}
              max={ageMax - 1}
              value={ageMin}
              onChange={(e) => onAgeMin(Number(e.target.value))}
              className="w-full accent-[var(--peach)]"
            />
            <div className="font-mono text-[10px] text-[var(--ink-subtle)] mt-0.5">от {ageMin}</div>
          </div>
          <div>
            <input
              type="range"
              min={ageMin + 1}
              max={100}
              value={ageMax}
              onChange={(e) => onAgeMax(Number(e.target.value))}
              className="w-full accent-[var(--peach)]"
            />
            <div className="font-mono text-[10px] text-[var(--ink-subtle)] mt-0.5 text-right">до {ageMax}</div>
          </div>
        </div>
      </div>

      <LabeledInput
        label="Интересы (через запятую, опционально)"
        placeholder="ювелирные украшения, ручная работа, эко-косметика"
        value={interests}
        onChange={onInterests}
        multiline
      />
    </div>
  );
}

function LabeledInput({
  label, value, onChange, placeholder, maxLength, multiline,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  maxLength?: number;
  multiline?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1 inline-block text-[11px] font-medium uppercase tracking-[0.04em] text-[var(--ink-subtle)]">
        {label}
      </span>
      {multiline ? (
        <textarea
          rows={2}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full resize-none rounded-[10px] px-3 py-2 text-[13.5px] outline-none transition-colors"
          style={{
            background: "var(--card-soft)",
            border: "1.5px solid var(--border)",
            color: "var(--ink)",
          }}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          className="w-full rounded-[10px] px-3 py-2 text-[13.5px] outline-none transition-colors"
          style={{
            background: "var(--card-soft)",
            border: "1.5px solid var(--border)",
            color: "var(--ink)",
          }}
        />
      )}
    </label>
  );
}


// ─────────────────────────────────────────────────────────
// Step 3 — Creative preview + regenerate
// ─────────────────────────────────────────────────────────

type CreativeStatus = {
  photo_source: "site" | "upload" | "mixed" | "none";
  own_photo_count: number;
  content_generated: boolean;
  content_stale: boolean;
  variant_count: number;
};

function CreativePreview({
  service,
  regenBusy,
  onRegen,
}: {
  service: ServiceSummary | null;
  regenBusy: boolean;
  onRegen: () => void;
}) {
  const [status, setStatus] = useState<CreativeStatus | null>(null);
  const [uploading, setUploading] = useState(false);
  // Bumped after regen/upload so ServiceBanner re-fetches the PNG (its URL is
  // otherwise stable and would serve the cached image).
  const [refreshKey, setRefreshKey] = useState(0);
  const [autoRegenDone, setAutoRegenDone] = useState(false);
  // Local copy of the previews so per-banner delete/regenerate can update this
  // step without threading state back through the parent wizard.
  const [localPreviews, setLocalPreviews] = useState(service?.banner_previews ?? []);
  const [variantBusy, setVariantBusy] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const serviceId = service?.id ?? null;

  useEffect(() => {
    setLocalPreviews(service?.banner_previews ?? []);
  }, [service?.id, service?.banner_previews]);

  async function deleteOne(index: number) {
    if (serviceId == null) return;
    if (!confirm("Удалить этот креатив?")) return;
    try {
      await tgBridge.deleteVariant(serviceId, index);
      setLocalPreviews((p) => p.filter((_, i) => i !== index));
      setRefreshKey((k) => k + 1);
      toast.success("Креатив удалён");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "не удалось удалить");
    }
  }

  async function regenOne(index: number) {
    if (serviceId == null) return;
    setVariantBusy(index);
    try {
      const updated = await tgBridge.regenerateVariant(serviceId, index);
      setLocalPreviews(updated.banner_previews);
      setRefreshKey((k) => k + 1);
      toast.success("Креатив перегенерирован");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "не удалось перегенерить");
    } finally {
      setVariantBusy(null);
    }
  }

  const loadStatus = useCallback(() => {
    if (serviceId == null) return;
    tgBridge.creativeStatus(serviceId).then(setStatus).catch(() => setStatus(null));
  }, [serviceId]);

  useEffect(() => { loadStatus(); }, [loadStatus]);

  // Auto-refresh copy after intake: if the profile was edited more recently
  // than the creatives were generated, regenerate once on entering this step
  // so the user sees fresh, profile-driven ads without hunting for a button.
  useEffect(() => {
    if (!status || autoRegenDone || regenBusy) return;
    if (status.content_stale) {
      setAutoRegenDone(true);
      onRegen();
    }
  }, [status, autoRegenDone, regenBusy, onRegen]);

  // When a regen finishes (regenBusy true→false), refresh banners + status.
  const prevBusy = useRef(regenBusy);
  useEffect(() => {
    if (prevBusy.current && !regenBusy) {
      setRefreshKey((k) => k + 1);
      loadStatus();
    }
    prevBusy.current = regenBusy;
  }, [regenBusy, loadStatus]);

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      await tgBridge.uploadBusinessPhotos(Array.from(files).slice(0, 10));
      toast.success("Фото загружены — пересобираю баннеры");
      setRefreshKey((k) => k + 1);
      loadStatus();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "не удалось загрузить");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  if (!service) {
    return (
      <div className="rounded-[10px] bg-[var(--card-soft)] px-4 py-6 text-center text-[12.5px] text-[var(--ink-subtle)]">
        Услуга не выбрана — вернись на шаг «Цель».
      </div>
    );
  }

  const brand = service.name;

  return (
    <div className="flex flex-col gap-4">
      {/* Honest photo-source line — tells the user WHERE the banner images
          came from, and offers upload when we have nothing of theirs. */}
      <PhotoSourceCard
        status={status}
        uploading={uploading}
        onPick={() => fileRef.current?.click()}
      />
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleUpload(e.target.files)}
      />

      <div className="flex items-center justify-between gap-3">
        <div className="text-[12.5px] text-[var(--ink-mute)]">
          <b className="text-[var(--ink)]">{service.name}</b>
          {" · "}
          {localPreviews.length > 0 ? `${localPreviews.length} варианта` : "нет креативов"}
          {status?.content_stale && (
            <span className="ml-2 text-[var(--peach-deep)]">· обновляю…</span>
          )}
        </div>
        <button
          onClick={onRegen}
          disabled={regenBusy}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-[12px] font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ background: "var(--peach)", color: "white" }}
        >
          {regenBusy ? <Loader2 className="size-3.5 animate-spin" /> : <Sparkles className="size-3.5" />}
          Перегенерировать
        </button>
      </div>

      {localPreviews.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {localPreviews.slice(0, 3).map((v, i) => (
            <div key={i} className="relative">
              {/* Per-banner actions — always visible, top-left. */}
              <div className="absolute top-2 left-2 z-20 flex gap-1.5">
                <button
                  onClick={() => regenOne(i)}
                  disabled={variantBusy === i}
                  title="Перегенерировать этот баннер"
                  className="size-7 rounded-full bg-white flex items-center justify-center shadow-md hover:bg-[var(--peach-wash)] transition-colors disabled:opacity-60"
                >
                  {variantBusy === i
                    ? <Loader2 className="size-3.5 animate-spin text-[var(--peach-deep)]" />
                    : <Sparkles className="size-3.5 text-[var(--peach-deep)]" />}
                </button>
                <button
                  onClick={() => deleteOne(i)}
                  title="Удалить баннер"
                  className="size-7 rounded-full bg-white flex items-center justify-center shadow-md hover:bg-[#F8DDD0] transition-colors"
                >
                  <Trash2 className="size-3.5 text-[var(--destructive)]" />
                </button>
              </div>
              <ServiceBanner
                serviceId={service.id}
                index={i}
                headline={v.headline || service.name}
                subheadline={v.subheadline}
                colorScheme={v.color_scheme}
                platform="meta"
                brand={brand}
                refreshKey={refreshKey}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-[10px] bg-[var(--card-soft)] px-4 py-6 text-center text-[12.5px] text-[var(--ink-subtle)]">
          Креативов ещё нет — нажми «Перегенерировать», AI соберёт 3 варианта за ~30с.
        </div>
      )}

      {/* Deep-profile nudge kept, but secondary now that banners are real. */}
      <a
        href={`/services/${service.id}/intake`}
        className="flex items-start gap-2.5 rounded-[10px] px-3.5 py-2.5 transition-colors hover:opacity-90"
        style={{ background: "var(--peach-wash)", border: "1px solid var(--peach-soft)" }}
      >
        <Sparkles className="size-3.5 mt-0.5 shrink-0" style={{ color: "var(--peach-deep)" }} />
        <div className="text-[12px] leading-relaxed text-[var(--ink)]">
          Не нравятся тексты? <b>Заполни профиль продукта</b> — AI соберёт
          объявления из реальных слов твоих клиентов, а не шаблонов. →
        </div>
      </a>
    </div>
  );
}

// Honest sourcing line for the banner photos.
function PhotoSourceCard({
  status,
  uploading,
  onPick,
}: {
  status: CreativeStatus | null;
  uploading: boolean;
  onPick: () => void;
}) {
  if (!status) {
    return <Skeleton className="h-12 w-full rounded-[10px]" />;
  }

  const { photo_source, own_photo_count } = status;

  // Own photos (from site scrape or upload) → reassure + attribute.
  if (photo_source === "site" || photo_source === "mixed") {
    return (
      <SourceRow
        tone="sage"
        text={
          <>
            Фото взял <b>с твоего сайта / соцсетей</b> ({own_photo_count} шт) и
            собрал баннеры из них.
          </>
        }
        action={{ label: uploading ? "Гружу…" : "Заменить своими", onClick: onPick, busy: uploading }}
      />
    );
  }
  if (photo_source === "upload") {
    return (
      <SourceRow
        tone="sage"
        text={<>Использую <b>твои {own_photo_count} загруженных фото</b> в баннерах.</>}
        action={{ label: uploading ? "Гружу…" : "Добавить ещё", onClick: onPick, busy: uploading }}
      />
    );
  }
  // No own photos — explain the fallback and push upload.
  return (
    <SourceRow
      tone="peach"
      text={
        <>
          Своих фото нет — <b>AI сгенерит</b> под каждый баннер. Хочешь свои?
          Загрузи фото товара / работ или желаемые примеры.
        </>
      }
      action={{ label: uploading ? "Гружу…" : "Загрузить фото", onClick: onPick, busy: uploading, primary: true }}
    />
  );
}

function SourceRow({
  tone,
  text,
  action,
}: {
  tone: "sage" | "peach";
  text: ReactNode;
  action: { label: string; onClick: () => void; busy?: boolean; primary?: boolean };
}) {
  const isSage = tone === "sage";
  return (
    <div
      className="flex items-center gap-3 rounded-[10px] px-3.5 py-2.5"
      style={{
        background: isSage ? "var(--sage-soft)" : "var(--peach-wash)",
        border: `1px solid ${isSage ? "#BFD0B0" : "var(--peach-soft)"}`,
      }}
    >
      {isSage ? (
        <Check className="size-4 shrink-0" style={{ color: "var(--sage)" }} />
      ) : (
        <ImageIconLucide className="size-4 shrink-0" style={{ color: "var(--peach-deep)" }} />
      )}
      <div className="flex-1 text-[12.5px] leading-relaxed text-[var(--ink)]">{text}</div>
      <button
        onClick={action.onClick}
        disabled={action.busy}
        className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-[12px] font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
        style={
          action.primary
            ? { background: "var(--peach)", color: "white" }
            : { background: "var(--card)", border: "1px solid var(--border)", color: "var(--ink)" }
        }
      >
        {action.busy ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
        {action.label}
      </button>
    </div>
  );
}
