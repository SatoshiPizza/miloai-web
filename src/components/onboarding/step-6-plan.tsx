"use client";

/**
 * Step 6 — Starting plan.
 *
 * Reference: `screen-onboarding.jsx::OnbStep6` (rich) + `OnbStep6Empty`.
 *
 * The plan is whatever the backend stuffed into `Business.starting_plan` —
 * the campaign-import roll-up produced during Step 3. Two variants:
 *
 *   • Rich data — at least one platform connected with real campaigns.
 *     Renders imported campaign names + current CPL + a proposed CPL band
 *     that AI suggests after applying the audit. User clicks «Принять план»
 *     and we mark onboarding_complete and redirect to /dashboard.
 *
 *   • Empty — no cabinets connected (or all failed). Renders a checklist of
 *     what's missing (cabinet OAuth, photos, contacts) with single-click
 *     deeplinks. Same primary action: «Открыть дашборд». The user can come
 *     back to onboarding later via the BusinessSwitcher's «+ Добавить
 *     бизнес».
 *
 * Design rules from `README_iteration_3_onboarding.md` §6:
 *   - never invent numbers. CPLs, plans, etc shown only when present.
 *   - AI shows the SOURCE of each conclusion (badge: photo from site /
 *     imported campaign / fresh research).
 */

import { ArrowLeft, ArrowRight, Check, AlertTriangle, Sparkles, Image as ImageIcon, Plug, Camera, FileText } from "lucide-react";

import { OnbFrame } from "./onb-frame";
import type { BusinessDetail } from "@/lib/tg-bridge";


type TopCampaign = {
  name: string;
  status: string;
  spend_7d: number;
  leads_7d: number;
  cpa: number | null;
  cpc: number | null;
  ctr: number | null;
};

type PlatformPlan = {
  connected: boolean;
  account_name?: string | null;
  campaigns_count?: number;
  active_count?: number;
  spend_7d?: number;
  leads_7d?: number;
  cpl_7d?: number | null;
  top_campaigns?: TopCampaign[];
  error?: string;
};

type StartingPlan = {
  platforms?: Record<string, PlatformPlan>;
  total_spend_7d?: number;
  total_leads_7d?: number;
  any_connected?: boolean;
};


export function Step6Plan({
  business,
  onBack,
  onAccept,
  accepting,
}: {
  business: BusinessDetail;
  onBack: () => void;
  onAccept: () => void;
  accepting?: boolean;
}) {
  // `starting_plan` lives on BusinessDetail.photo_pool's neighbour — but our
  // bridge type doesn't expose it yet (added it server-side only). Read it
  // from a loose extension cast.
  const plan = (business as unknown as { starting_plan?: StartingPlan }).starting_plan;
  const hasRichData = !!plan?.any_connected;

  return (
    <OnbFrame stepIdx={5}>
      <div className="w-full max-w-[900px]">
        <div className="mb-5 text-center">
          <div
            className="mb-4 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.06em]"
            style={{
              background: "var(--peach-wash)",
              border: "1px solid var(--peach-soft)",
              color: "var(--peach-deep)",
            }}
          >
            <Sparkles className="size-3.5" />
            Стартовый план · AI собрал
          </div>
          <h1 className="font-heading text-[32px] sm:text-[36px] font-bold leading-[1.1] tracking-[-0.03em]">
            {hasRichData
              ? "Вот с чего начнём"
              : `Готов к старту, ${business.name}`}
          </h1>
          <p className="mt-3 text-[14.5px] leading-relaxed text-[var(--ink-mute)]">
            {hasRichData
              ? "AI разобрал твои кабинеты и сложил план без вранья. Можешь принять как есть или дополнить."
              : "Профиль готов. Чтобы AI запустил кампании — подключи остальное в дашборде."}
          </p>
        </div>

        {hasRichData
          ? <RichPlan plan={plan!} business={business} />
          : <EmptyPlan plan={plan} business={business} />}

        {/* Nav */}
        <div className="mt-7 flex items-center justify-between">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-[10px] px-4 py-2.5 text-[13.5px] text-[var(--ink-mute)] hover:text-[var(--ink)] transition-colors"
          >
            <ArrowLeft className="size-[14px]" strokeWidth={2} />
            Назад
          </button>
          <button
            onClick={onAccept}
            disabled={accepting}
            className="inline-flex items-center gap-2.5 rounded-[11px] px-8 py-3 text-[14.5px] font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            style={{
              background: "var(--peach)",
              boxShadow: "0 6px 18px -6px rgba(232,149,108,0.55)",
            }}
          >
            {accepting ? "Открываю…" : hasRichData ? "Принять план" : "Открыть дашборд"}
            <ArrowRight className="size-[14px]" strokeWidth={2} />
          </button>
        </div>
      </div>
    </OnbFrame>
  );
}


// ── Rich (cabinets connected, real data) ──────────────────────────────────


function RichPlan({
  plan,
  business,
}: {
  plan: StartingPlan;
  business: BusinessDetail;
}) {
  const platforms = Object.entries(plan.platforms || {});
  return (
    <div className="space-y-4">
      {/* Totals */}
      <div
        className="rounded-[16px] bg-white p-5"
        style={{ border: "1px solid var(--border)" }}
      >
        <div className="mb-3 font-mono text-[10.5px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-subtle)]">
          Итого по подключённым кабинетам · 7 дней
        </div>
        <div className="grid grid-cols-3 gap-6">
          <Stat label="Спенд" value={`€${Math.round(plan.total_spend_7d || 0)}`} />
          <Stat label="Лиды" value={String(plan.total_leads_7d || 0)} />
          <Stat
            label="CPL"
            value={
              plan.total_leads_7d && plan.total_leads_7d > 0
                ? `€${Math.round((plan.total_spend_7d || 0) / plan.total_leads_7d)}`
                : "—"
            }
          />
        </div>
      </div>

      {/* Per-platform */}
      {platforms.map(([key, p]) => (
        <PlatformBlock key={key} platform={key} data={p} />
      ))}

      {/* Photos audit */}
      <PhotoNote business={business} />
    </div>
  );
}


function PlatformBlock({ platform, data }: { platform: string; data: PlatformPlan }) {
  const label = platform === "meta" ? "Meta Ads" : platform === "google" ? "Google Ads" : platform;
  if (!data.connected) return null;
  if (data.error) {
    return (
      <div
        className="flex items-start gap-3 rounded-[16px] p-4"
        style={{
          background: "rgba(196,106,74,0.08)",
          border: "1px solid rgba(196,106,74,0.25)",
        }}
      >
        <AlertTriangle className="size-4 shrink-0" style={{ color: "var(--destructive)" }} />
        <div className="flex-1">
          <div className="text-[13px] font-semibold text-[var(--ink)]">{label}</div>
          <div className="mt-1 text-[12.5px] text-[var(--ink-mute)]">{data.error}</div>
        </div>
      </div>
    );
  }

  const top = data.top_campaigns || [];
  return (
    <div
      className="rounded-[16px] bg-white p-5"
      style={{ border: "1px solid var(--border)" }}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Plug className="size-[15px]" style={{ color: "var(--ink-mute)" }} />
          <div className="text-[14px] font-semibold text-[var(--ink)]">{label}</div>
          {data.account_name && (
            <span className="font-mono text-[10.5px] text-[var(--ink-subtle)]">
              · {data.account_name}
            </span>
          )}
        </div>
        <div className="font-mono text-[10.5px] text-[var(--ink-subtle)]">
          {data.active_count ?? 0}/{data.campaigns_count ?? 0} активных
        </div>
      </div>

      {top.length === 0 ? (
        <div className="rounded-[10px] bg-[var(--card-soft)] px-3 py-3 text-[12.5px] text-[var(--ink-subtle)]">
          Кампаний пока нет — AI запустит первую с нуля по твоему профилю.
        </div>
      ) : (
        <ul className="space-y-2">
          {top.slice(0, 4).map((c, i) => (
            <li
              key={i}
              className="rounded-[10px] px-3 py-2.5"
              style={{
                background: "var(--peach-wash)",
                border: "1px solid var(--peach-soft)",
              }}
            >
              <div className="flex items-center gap-2">
                <div className="text-[13px] font-medium text-[var(--ink)] truncate">
                  {c.name}
                </div>
                <div className="ml-auto font-mono text-[10.5px] text-[var(--ink-subtle)]">
                  {c.status}
                </div>
              </div>
              <div className="mt-1 flex items-center gap-3 font-mono text-[11px] tabular-nums text-[var(--ink-mute)]">
                <span>€{c.spend_7d.toFixed(0)} спенд</span>
                <span>· {c.leads_7d} лидов</span>
                {c.cpa != null && <span>· CPA €{c.cpa.toFixed(0)}</span>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}


function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[var(--ink-subtle)]">
        {label}
      </div>
      <div className="mt-1.5 font-mono text-[26px] font-medium leading-none tabular-nums text-[var(--ink)]">
        {value}
      </div>
    </div>
  );
}


function PhotoNote({ business }: { business: BusinessDetail }) {
  const n = business.photo_pool?.length ?? 0;
  if (n === 0) return null;
  return (
    <div
      className="flex items-center gap-3 rounded-[14px] px-4 py-3 text-[12.5px]"
      style={{
        background: "var(--sage-soft)",
        border: "1px solid #BFD0B0",
      }}
    >
      <Camera className="size-4 shrink-0" style={{ color: "var(--sage)" }} />
      <div className="flex-1 text-[var(--ink)]">
        <b>{n} реальных фото</b> отобраны для креативов
      </div>
      <span className="font-mono text-[10px] text-[var(--ink-subtle)]">vision</span>
    </div>
  );
}


// ── Empty (no cabinets / nothing imported) ────────────────────────────────


function EmptyPlan({
  plan,
  business,
}: {
  plan: StartingPlan | undefined;
  business: BusinessDetail;
}) {
  const photosCount = business.photo_pool?.length ?? 0;
  const items = [
    {
      icon: Check,
      tone: "ok" as const,
      title: "Профиль готов",
      sub: business.name + (business.city ? ` · ${business.city}` : ""),
    },
    photosCount > 0
      ? {
          icon: Check,
          tone: "ok" as const,
          title: `${photosCount} реальных фото`,
          sub: "Отобраны vision-AI для креативов",
        }
      : {
          icon: ImageIcon,
          tone: "todo" as const,
          title: "Нужны фото",
          sub: "Без них креативы будут на стоках. Загрузишь в /services",
        },
    plan?.any_connected
      ? null
      : {
          icon: Plug,
          tone: "todo" as const,
          title: "Подключи рекламные кабинеты",
          sub: "Meta / Google — без них AI не сможет запустить кампанию",
        },
    {
      icon: FileText,
      tone: "info" as const,
      title: "Лендинги — при запуске кампании",
      sub: "AI соберёт лендинг под услугу автоматически в визарде",
    },
  ].filter(Boolean) as Array<{
    icon: typeof Check;
    tone: "ok" | "todo" | "info";
    title: string;
    sub: string;
  }>;

  return (
    <div className="space-y-2">
      {items.map((it, i) => (
        <ChecklistRow key={i} {...it} />
      ))}
    </div>
  );
}


function ChecklistRow({
  icon: Icon,
  tone,
  title,
  sub,
}: {
  icon: typeof Check;
  tone: "ok" | "todo" | "info";
  title: string;
  sub: string;
}) {
  const colors = {
    ok: { bg: "var(--sage-soft)", border: "#BFD0B0", iconBg: "var(--sage)" },
    todo: { bg: "var(--peach-wash)", border: "var(--peach-soft)", iconBg: "var(--peach)" },
    info: { bg: "var(--card-soft)", border: "var(--border)", iconBg: "var(--ink-mute)" },
  }[tone];

  return (
    <div
      className="flex items-center gap-3 rounded-[14px] bg-white px-4 py-3.5"
      style={{ border: "1px solid var(--border)" }}
    >
      <div
        className="flex size-9 shrink-0 items-center justify-center rounded-[10px]"
        style={{ background: colors.bg, border: `1px solid ${colors.border}` }}
      >
        <Icon className="size-[16px]" style={{ color: colors.iconBg }} strokeWidth={1.8} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13.5px] font-medium text-[var(--ink)]">{title}</div>
        <div className="mt-0.5 text-[11.5px] text-[var(--ink-mute)]">{sub}</div>
      </div>
    </div>
  );
}
