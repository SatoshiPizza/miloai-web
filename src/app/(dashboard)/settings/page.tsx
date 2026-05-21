"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Settings as SettingsIcon, Sparkles, ExternalLink } from "lucide-react";
import { tgBridge, type Me, type DashboardKpi } from "@/lib/tg-bridge";

/**
 * Settings — design handoff iter-2 §screen-extras SETTINGS.
 *
 * Tabs: Профиль · Цели · Биллинг · Команда · API ключи · Уведомления.
 * Backend endpoints for editing not shipped yet — render read-only views.
 */

type TabKey = "profile" | "goals" | "billing" | "team" | "api" | "notifications";

const TABS: { key: TabKey; label: string }[] = [
  { key: "profile",       label: "Профиль" },
  { key: "goals",         label: "Цели" },
  { key: "billing",       label: "Биллинг" },
  { key: "team",          label: "Команда" },
  { key: "api",           label: "API ключи" },
  { key: "notifications", label: "Уведомления" },
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
        {active === "goals" && <GoalsTab kpi={kpi} loading={loading} />}
        {active === "billing" && <BillingTab />}
        {active === "team" && <PlaceholderBlock title="Команда" body="Управляй приглашениями и ролями на странице /accounts." />}
        {active === "api" && <PlaceholderBlock title="API ключи" body="Скоро: генерация webhook-токенов для CRM, экспорт лидов." />}
        {active === "notifications" && <PlaceholderBlock title="Уведомления" body="Скоро: настройка триггеров — какие изменения слать в Telegram." />}
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
          <SettingsField
            label="Онбординг"
            value={me?.onboarding_complete ? "Завершён" : "Не завершён"}
          />
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

function BillingTab() {
  return (
    <SettingsBlock title="Тариф & биллинг" subtitle="">
      <div
        className="flex flex-col md:flex-row md:items-center gap-3.5 p-4 rounded-[11px] border"
        style={{ background: "linear-gradient(135deg, #FCF1E8 0%, #F8E8D9 100%)", borderColor: "#F5DDC8" }}
      >
        <div
          className="px-2.5 py-1 rounded-full font-mono text-[10px] font-bold uppercase shrink-0"
          style={{ background: "#fff", color: "var(--peach-deep)", letterSpacing: "0.05em" }}
        >
          FREE
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[14px] font-semibold tracking-[-0.005em] text-[var(--ink)]">
            Бета-доступ
          </div>
          <div className="text-[12px] text-[var(--ink-mute)] mt-0.5 leading-relaxed">
            Без лимитов в beta · Meta + Google · Telegram-bridge · до 10 кампаний
          </div>
        </div>
        <div className="font-mono text-[11.5px] text-[var(--ink-mute)] text-left md:text-right">
          платный тариф<br />
          скоро
        </div>
        <button
          disabled
          className="px-3 py-1.5 rounded-md text-[12px] font-medium border bg-white disabled:opacity-70 inline-flex items-center gap-1.5"
          style={{ color: "var(--peach-deep)", borderColor: "var(--peach-soft)" }}
          title="Скоро: Stripe Portal"
        >
          Stripe Portal
          <ExternalLink className="size-3" />
        </button>
      </div>
    </SettingsBlock>
  );
}

function PlaceholderBlock({ title, body }: { title: string; body: string }) {
  return (
    <SettingsBlock title={title} subtitle="">
      <div
        className="rounded-[11px] border border-dashed border-[var(--border)] px-4 py-8 text-center"
        style={{ background: "var(--card-soft)" }}
      >
        <Sparkles className="size-5 mx-auto mb-2 text-[var(--peach)]" strokeWidth={1.7} />
        <p className="text-[12.5px] text-[var(--ink-mute)] max-w-md mx-auto leading-relaxed">{body}</p>
      </div>
    </SettingsBlock>
  );
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
