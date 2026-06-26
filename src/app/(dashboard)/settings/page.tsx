"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { Settings as SettingsIcon, Sparkles, ExternalLink, Check, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import {
  tgBridge,
  type Me,
  type DashboardKpi,
  type BillingStatus,
  type BillingTier,
} from "@/lib/tg-bridge";
import { LinkedIdentitiesBlock } from "@/components/linked-identities";

/**
 * Settings — design handoff iter-2 §screen-extras SETTINGS.
 *
 * Tabs: Профиль · Цели · Биллинг · Команда · API ключи · Уведомления.
 * Backend endpoints for editing not shipped yet — render read-only views.
 */

// Surface only the tabs that are actually wired. Notifications / API keys /
// Team had "Скоро" placeholders — confusing for the user since the rest of
// the app works. They'll come back when there's real implementation behind
// them (webhook-token gen, in-app notification rules, agency seat invites).
type TabKey = "profile" | "logins" | "goals" | "billing";

const TABS: { key: TabKey; label: string }[] = [
  { key: "profile",       label: "Профиль" },
  { key: "logins",        label: "Логин" },
  { key: "goals",         label: "Цели" },
  { key: "billing",       label: "Биллинг" },
];

export default function SettingsPage() {
  const [active, setActive] = useState<TabKey>("profile");
  const [me, setMe] = useState<Me | null>(null);
  const [kpi, setKpi] = useState<DashboardKpi | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([tgBridge.me().catch(() => null), tgBridge.kpi().catch(() => null)])
      .then(([m, k]) => {
        setMe(m);
        setKpi(k);
      })
      .finally(() => setLoading(false));
  }, []);

  // Stripe Checkout redirects back with ?billing=success|cancel.
  // We flash a toast, force-select the Billing tab, and let BillingTab
  // poll /billing/status until it flips to active.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const billing = params.get("billing");
    if (billing === "success") {
      setActive("billing");
      toast.success("Платёж принят — Stripe подтверждает подписку…");
      const url = new URL(window.location.href);
      url.searchParams.delete("billing");
      url.searchParams.delete("session_id");
      window.history.replaceState({}, "", url.toString());
    } else if (billing === "cancel") {
      setActive("billing");
      toast.info("Оплата отменена");
      const url = new URL(window.location.href);
      url.searchParams.delete("billing");
      window.history.replaceState({}, "", url.toString());
    }
  }, []);

  return (
    <div className="p-7 max-w-[820px]">
      <header className="mb-[18px]">
        <h1 className="font-heading text-[28px] font-bold leading-none tracking-[-0.025em]">
          Настройки
        </h1>
        <p className="text-[13.5px] text-[var(--ink-mute)] mt-1.5">
          Профиль бизнеса, целевые метрики, биллинг, ключи API
        </p>
      </header>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[var(--border)] mb-[18px] overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setActive(t.key)}
            className="px-4 py-2.5 -mb-px text-[13.5px] transition-colors tracking-[-0.005em] whitespace-nowrap"
            style={{
              borderBottom: active === t.key ? `2px solid var(--peach)` : "2px solid transparent",
              fontWeight: active === t.key ? 600 : 400,
              color: active === t.key ? "var(--ink)" : "var(--ink-mute)",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Body */}
      <div className="flex flex-col gap-[18px]">
        {active === "profile" && <ProfileTab me={me} loading={loading} />}
        {active === "logins" && <LinkedIdentitiesBlock />}
        {active === "goals" && <GoalsTab kpi={kpi} loading={loading} />}
        {active === "billing" && <BillingTab />}
      </div>
    </div>
  );
}


// ═════════════════════════════════════════════════════════════════════════════
// Tabs
// ═════════════════════════════════════════════════════════════════════════════

function ProfileTab({ me, loading }: { me: Me | null; loading: boolean }) {
  return (
    <SettingsBlock
      title="Бизнес-профиль"
      subtitle="Заполняется автоматически из URL сайта и голосового описания. AI обновляет при пересканах."
    >
      {loading ? (
        <Skeleton className="h-40" />
      ) : (
        <>
          <SettingsField label="Название" value={me?.business_name || "—"} />
          <SettingsField label="Имя владельца" value={me?.first_name || "—"} />
          <SettingsField label="Telegram" value={me?.telegram_username ? `@${me.telegram_username}` : "не подключён"} />
          <SettingsField label="Язык" value={me?.language_code ? me.language_code.toUpperCase() : "—"} pills />
          <OnboardingStatusRow done={!!me?.onboarding_complete} />
        </>
      )}
    </SettingsBlock>
  );
}

function GoalsTab({ kpi, loading }: { kpi: DashboardKpi | null; loading: boolean }) {
  const currentCpl = kpi?.cpl;
  const targetCpl = kpi?.target_cpl;
  const cplSub =
    currentCpl != null && targetCpl != null
      ? currentCpl <= targetCpl
        ? `текущий €${currentCpl.toFixed(0)} ✓`
        : `текущий €${currentCpl.toFixed(0)} — выше цели`
      : currentCpl != null
        ? `текущий €${currentCpl.toFixed(0)}`
        : "нет данных";
  const cplGood = currentCpl != null && targetCpl != null && currentCpl <= targetCpl;

  return (
    <SettingsBlock
      title="Целевые метрики"
      subtitle="AI будет ориентироваться на эти цели при автоматических рекомендациях"
    >
      {loading ? (
        <Skeleton className="h-24" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <GoalInput
            label="Target CPL"
            value={targetCpl != null ? `€${targetCpl.toFixed(0)}` : "—"}
            sub={cplSub}
            good={cplGood}
          />
          <GoalInput
            label="Лидов / неделя"
            value={kpi?.leads_7d != null ? String(kpi.leads_7d) : "—"}
            sub="текущий за 7д"
          />
          <GoalInput
            label="Активных кампаний"
            value={kpi ? `${kpi.active_campaigns} / ${kpi.total_campaigns}` : "—"}
            sub="—"
          />
        </div>
      )}
      <p className="text-[11.5px] text-[var(--ink-subtle)] italic mt-1">
        Редактирование таргетов появится когда backend /goals API выйдет в прод.
      </p>
    </SettingsBlock>
  );
}

const TIERS: { key: BillingTier | "starter"; name: string; price: string; period: string; features: string[]; cta: string }[] = [
  {
    key: "starter",
    name: "Starter",
    price: "€0",
    period: "beta",
    features: ["1 ад-аккаунт", "Telegram-bridge", "Бета-функции", "AI 10 запр/день"],
    cta: "Текущий план",
  },
  {
    key: "pro",
    name: "Pro",
    price: "€49",
    period: "в месяц",
    features: ["5 ад-аккаунтов", "Meta + Google", "Lead Inbox", "AI 50 запр/день", "Stripe Portal"],
    cta: "Перейти на Pro",
  },
  {
    key: "growth",
    name: "Growth",
    price: "€149",
    period: "в месяц",
    features: ["Всё из Pro", "Безлимитные аккаунты", "AI 200 запр/день", "Приоритет в очереди", "Прямая поддержка"],
    cta: "Перейти на Growth",
  },
];

function BillingTab() {
  const [status, setStatus] = useState<BillingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<BillingTier | "portal" | null>(null);

  const load = async () => {
    try {
      const s = await tgBridge.billingStatus();
      setStatus(s);
      return s;
    } catch (e) {
      console.error(e);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // After Stripe Checkout success, poll until the webhook flips status to active.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    // Only relevant on first mount when /settings was loaded with the success flag.
    // Even though SettingsPage strips the flag, we still want to poll because
    // the flag was present this render.
    if (params.get("billing") !== "success" && !document.referrer.includes("stripe.com")) {
      // Skip polling — but still do a single refresh in case the user reloaded.
    }
    let cancelled = false;
    let tries = 0;
    const tick = async () => {
      if (cancelled || tries > 12) return;
      tries += 1;
      const s = await load();
      if (s?.status === "active") return;
      setTimeout(tick, 2500);
    };
    setTimeout(tick, 1500);
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function startCheckout(tier: BillingTier) {
    setPending(tier);
    try {
      const { url } = await tgBridge.billingCheckout(tier);
      window.location.assign(url);
    } catch (e: unknown) {
      console.error(e);
      const msg = e instanceof Error ? e.message : "Не удалось открыть Checkout";
      toast.error(msg);
      setPending(null);
    }
  }

  async function openPortal() {
    setPending("portal");
    try {
      const { url } = await tgBridge.billingPortal();
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (e: unknown) {
      console.error(e);
      const msg = e instanceof Error ? e.message : "Portal недоступен";
      toast.error(msg);
    } finally {
      setPending(null);
    }
  }

  const currentPlan = status?.plan ?? "starter";
  const isActive = status?.status === "active";

  return (
    <>
      {/* Status hero */}
      <SettingsBlock title="Тариф & биллинг" subtitle="">
        <div
          className="flex flex-col md:flex-row md:items-center gap-3.5 p-4 rounded-[11px] border"
          style={{ background: "linear-gradient(135deg, #FCF1E8 0%, #F8E8D9 100%)", borderColor: "#F5DDC8" }}
        >
          <div
            className="px-2.5 py-1 rounded-full font-mono text-[10px] font-bold uppercase shrink-0"
            style={{ background: "#fff", color: "var(--peach-deep)", letterSpacing: "0.05em" }}
          >
            {currentPlan.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            {loading ? (
              <Skeleton className="h-5 w-40" />
            ) : (
              <>
                <div className="text-[14px] font-semibold tracking-[-0.005em] text-[var(--ink)]">
                  {labelForPlan(currentPlan)}
                </div>
                <div className="text-[12px] text-[var(--ink-mute)] mt-0.5 leading-relaxed">
                  Статус: <b style={{ color: isActive ? "var(--sage)" : "var(--ink)" }}>{labelForStatus(status?.status)}</b>
                  {status?.current_period_end && (
                    <>{" · следующее списание "}{formatDate(status.current_period_end)}</>
                  )}
                </div>
              </>
            )}
          </div>
          {status?.has_payment_method ? (
            <button
              onClick={openPortal}
              disabled={pending === "portal"}
              className="px-3 py-1.5 rounded-md text-[12px] font-medium border bg-white disabled:opacity-70 inline-flex items-center gap-1.5"
              style={{ color: "var(--peach-deep)", borderColor: "var(--peach-soft)" }}
            >
              {pending === "portal" ? <Loader2 className="size-3 animate-spin" /> : <ExternalLink className="size-3" />}
              Stripe Portal
            </button>
          ) : null}
        </div>
      </SettingsBlock>

      {/* Tier picker */}
      <SettingsBlock title="Выбрать тариф" subtitle="Оплата через Stripe — отменить можно в любой момент через Portal">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {TIERS.map((t) => {
            const isCurrent = currentPlan === t.key;
            const isUpgradable = t.key !== "starter";
            const isBusy = pending === t.key;
            return (
              <div
                key={t.key}
                className="rounded-[11px] border p-4 flex flex-col gap-2.5"
                style={{
                  background: isCurrent ? "var(--peach-wash)" : "var(--card-soft)",
                  borderColor: isCurrent ? "var(--peach-soft)" : "var(--border)",
                }}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <div className="font-heading text-[16px] font-bold tracking-[-0.015em]">{t.name}</div>
                  {isCurrent && (
                    <span
                      className="px-1.5 py-0.5 rounded font-mono text-[9.5px] font-bold uppercase"
                      style={{ background: "var(--peach)", color: "#fff", letterSpacing: "0.04em" }}
                    >
                      текущий
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-mono text-[24px] font-semibold tabular-nums tracking-[-0.02em]">{t.price}</span>
                  <span className="font-mono text-[11px] text-[var(--ink-subtle)]">{t.period}</span>
                </div>
                <ul className="flex flex-col gap-1 mt-1">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-start gap-1.5 text-[12.5px] text-[var(--ink)] tracking-[-0.005em]">
                      <Check className="size-3 mt-1 shrink-0" style={{ color: "var(--sage)" }} strokeWidth={2.4} />
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-2">
                  {isCurrent ? (
                    <button
                      disabled
                      className="w-full px-3 py-1.5 rounded-md text-[12px] font-medium border bg-white text-[var(--ink-mute)] disabled:opacity-70"
                      style={{ borderColor: "var(--border)" }}
                    >
                      Активен
                    </button>
                  ) : isUpgradable ? (
                    <button
                      onClick={() => startCheckout(t.key as BillingTier)}
                      disabled={isBusy}
                      className="w-full px-3 py-1.5 rounded-md text-[12px] font-medium text-white disabled:opacity-70 inline-flex items-center justify-center gap-1.5"
                      style={{ background: "var(--peach)" }}
                    >
                      {isBusy && <Loader2 className="size-3 animate-spin" />}
                      {t.cta}
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full px-3 py-1.5 rounded-md text-[12px] font-medium border bg-white text-[var(--ink-mute)] disabled:opacity-70"
                      style={{ borderColor: "var(--border)" }}
                    >
                      {t.cta}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-[11.5px] text-[var(--ink-subtle)] italic mt-1">
          Pro и Growth доступны если backend получил <code>STRIPE_PRICE_PRO</code> / <code>STRIPE_PRICE_GROWTH</code>. Иначе кнопка вернёт ошибку.
        </p>
      </SettingsBlock>
    </>
  );
}

function labelForPlan(plan: string): string {
  if (plan === "pro") return "Pro";
  if (plan === "growth" || plan === "agency") return "Growth";
  return "Бета-доступ";
}

function labelForStatus(s: string | undefined): string {
  if (s === "active") return "активна";
  if (s === "trial") return "trial";
  if (s === "expired") return "истёк срок";
  if (s === "cancelled") return "отменена";
  return s || "—";
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return iso;
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// Building blocks
// ═════════════════════════════════════════════════════════════════════════════

function SettingsBlock({
  title, subtitle, children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[14px] border border-[var(--border)] bg-card p-5">
      <div className="mb-3.5">
        <h2 className="font-heading text-[18px] font-bold tracking-[-0.018em] text-[var(--ink)]">
          {title}
        </h2>
        {subtitle && (
          <p className="text-[12.5px] text-[var(--ink-mute)] mt-1 leading-relaxed">{subtitle}</p>
        )}
      </div>
      <div className="flex flex-col gap-3">{children}</div>
    </section>
  );
}

// Onboarding row gets its own component because the "не завершён" state
// needs an inline CTA back to /onboarding — a plain SettingsField has no
// slot for an action button, and pushing the user to figure out where to
// resume was the very thing that made this row useless.
function OnboardingStatusRow({ done }: { done: boolean }) {
  return (
    <div className="flex items-center gap-3.5 py-2.5 border-b border-[var(--border)] last:border-b-0">
      <div className="w-[120px] text-[13px] text-[var(--ink-mute)] shrink-0">Онбординг</div>
      <div className="flex-1 text-[13.5px] tracking-[-0.005em]">
        {done ? (
          <span className="inline-flex items-center gap-1.5 text-[var(--ink)]">
            <Check className="size-3.5" style={{ color: "var(--sage)" }} />
            Завершён
          </span>
        ) : (
          <span className="text-[var(--ink-mute)]">Не завершён</span>
        )}
      </div>
      {done ? (
        <SettingsIcon className="size-3.5 text-[var(--ink-subtle)] opacity-40 cursor-not-allowed" />
      ) : (
        <Link
          href="/onboarding"
          className="inline-flex items-center gap-1.5 rounded-[8px] px-3 py-1.5 text-[12.5px] font-medium text-white transition-opacity hover:opacity-90"
          style={{ background: "var(--peach)" }}
        >
          Продолжить
          <ArrowRight className="size-[13px]" strokeWidth={2} />
        </Link>
      )}
    </div>
  );
}


function SettingsField({
  label, value, pills,
}: {
  label: string;
  value: string;
  pills?: boolean;
}) {
  return (
    <div className="flex items-center gap-3.5 py-2.5 border-b border-[var(--border)] last:border-b-0">
      <div className="w-[120px] text-[13px] text-[var(--ink-mute)] shrink-0">{label}</div>
      <div className="flex-1 text-[13.5px] text-[var(--ink)] tracking-[-0.005em]">
        {pills ? (
          <div className="flex gap-1.5 flex-wrap">
            {value.split(/\s*·\s*/).map((p, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-full border font-mono text-[11px]"
                style={{ background: "var(--card-soft)", borderColor: "var(--border)", color: "var(--ink)" }}
              >
                {p}
              </span>
            ))}
          </div>
        ) : (
          value
        )}
      </div>
      <SettingsIcon className="size-3.5 text-[var(--ink-subtle)] opacity-40 cursor-not-allowed" />
    </div>
  );
}

function GoalInput({
  label, value, sub, good,
}: {
  label: string;
  value: string;
  sub: string;
  good?: boolean;
}) {
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-[0.08em] font-semibold text-[var(--ink-subtle)] mb-1.5">
        {label}
      </div>
      <div
        className="px-3 py-2.5 rounded-[9px] border bg-[var(--card-soft)] font-mono text-[18px] font-medium tabular-nums tracking-[-0.01em] text-[var(--ink)]"
        style={{ borderColor: "var(--border)" }}
      >
        {value}
      </div>
      <div
        className="font-mono text-[11px] mt-1"
        style={{ color: good ? "var(--sage)" : "var(--ink-mute)" }}
      >
        {sub}
      </div>
    </div>
  );
}
