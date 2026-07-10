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
  const narrative = buildPlanNarrative(plan);
  return (
    <div className="space-y-4">
      {/* Narrative — the "so what?" of all the numbers below */}
      <PlanNarrative narrative={narrative} />

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

      {/* Per-platform — collapsible detail */}
      <details className="group">
        <summary
          className="cursor-pointer list-none inline-flex items-center gap-1.5 font-mono text-[10.5px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-subtle)] hover:text-[var(--ink-mute)]"
        >
          <span className="transition-transform group-open:rotate-90">▸</span>
          Детали по кабинетам
        </summary>
        <div className="mt-3 space-y-3">
          {platforms.map(([key, p]) => (
            <PlatformBlock key={key} platform={key} data={p} />
          ))}
        </div>
      </details>

      {/* Photos audit */}
      <PhotoNote business={business} />
    </div>
  );
}


// ── Narrative builder ──────────────────────────────────────────────────────

type NarrativeBlock = {
  headline: string;
  observations: string[];    // what AI noticed in the data
  next_actions: string[];    // what to do about it
};

/**
 * Rule-based narrative from starting_plan stats. Turns the data-dump
 * ("17 campaigns · €69 · 2 leads") into a plain-language "here's what
 * this means and what we should do" para so users understand WHY they're
 * looking at this screen. Heuristics tuned for SMB budgets:
 *
 *  - CPA < €20      → cheap acquisition, scale
 *  - CPA €20-50     → normal, refine targeting
 *  - CPA > €50 or 0 → creative/audience burnout, replace
 *  - 0 productive   → no active tests, launch fresh
 *  - all paused     → dormant account, restart
 */
function buildPlanNarrative(plan: StartingPlan): NarrativeBlock {
  const platforms = Object.values(plan.platforms || {});
  const allCampaigns = platforms.flatMap((p) => p.top_campaigns || []);
  const productive = allCampaigns.filter((c) => c.spend_7d > 0);
  const paused = allCampaigns.filter((c) => c.status !== "active");
  const totalLeads = plan.total_leads_7d || 0;
  const totalSpend = plan.total_spend_7d || 0;
  const cpa = totalLeads > 0 ? totalSpend / totalLeads : null;
  const topProd = productive.slice().sort((a, b) => (b.spend_7d || 0) - (a.spend_7d || 0))[0];

  // ── 1. No productive campaigns at all — starting from scratch
  if (productive.length === 0) {
    return {
      headline: "Активных кампаний нет — стартуем с чистого листа",
      observations: [
        allCampaigns.length > 0
          ? `${allCampaigns.length} кампаний в аккаунте, все на паузе или без спенда за 7 дней.`
          : "Пока ни одной кампании в подключённом кабинете.",
      ],
      next_actions: [
        "Запустим первый тест через визард — цель / аудитория / бюджет / креативы за 3 минуты.",
        "AI сгенерит баннеры + текст под твой профиль без stock-мусора.",
      ],
    };
  }

  // ── 2. Productive campaigns exist — evaluate performance
  const observations: string[] = [];
  const next_actions: string[] = [];

  observations.push(
    `${productive.length} из ${allCampaigns.length} кампаний тратят реально: €${Math.round(totalSpend)} за 7д, ${totalLeads} лид${plural(totalLeads, ["", "а", "ов"])}.`,
  );

  if (topProd) {
    const parts: string[] = [`Топ — «${topProd.name}»`];
    if (topProd.cpa != null && topProd.leads_7d > 0) {
      parts.push(`CPA €${topProd.cpa.toFixed(0)}`);
    }
    if (topProd.ctr != null) {
      parts.push(`CTR ${(topProd.ctr * 100).toFixed(1)}%`);
    }
    observations.push(parts.join(" · ") + ".");
  }

  let headline: string;
  if (cpa != null && cpa < 20) {
    headline = "Дешёвая цена лида — масштабируем";
    next_actions.push(`CPA €${cpa.toFixed(0)} ниже рынка. Поднимаем бюджет на топ-кампанию в 2x.`);
    next_actions.push("Дублируем креатив на 2 новых аудитории — проверить width.");
  } else if (cpa != null && cpa < 50) {
    headline = "Работает, но можно лучше";
    next_actions.push(`CPA €${cpa.toFixed(0)} нормальный. Тестируем 3 новых креатива против текущего winner'а.`);
    if (topProd && topProd.ctr != null && topProd.ctr < 0.015) {
      next_actions.push(`CTR ${(topProd.ctr * 100).toFixed(1)}% низкий — креативы выгорают, пора обновить.`);
    }
  } else if (totalLeads === 0 && totalSpend > 10) {
    headline = "Спенд идёт, лидов нет — надо чинить";
    next_actions.push("Аудит: проверим лендинг, оффер, targeting и креатив.");
    next_actions.push("Ставим текущие кампании на паузу, запускаем чистый тест с новыми креативами.");
  } else {
    headline = "Есть база — но нужно оптимизировать";
    if (cpa != null) {
      next_actions.push(`CPA €${cpa.toFixed(0)} дороже, чем должно быть. Меняем креативы + сужаем аудиторию.`);
    }
    next_actions.push("Запускаем 3 новых теста через визард, старые ставим на паузу.");
  }

  if (paused.length >= 5) {
    observations.push(`${paused.length} кампаний в паузе — почистим через месяц если не активируешь.`);
  }

  return { headline, observations, next_actions };
}

function PlanNarrative({ narrative }: { narrative: NarrativeBlock }) {
  return (
    <div
      className="rounded-[16px] p-5"
      style={{
        background: "linear-gradient(135deg, #FCF1E8 0%, #F8E8D9 100%)",
        border: "1px solid #F5DDC8",
      }}
    >
      <div className="mb-1 font-mono text-[10.5px] font-semibold uppercase tracking-[0.1em]" style={{ color: "var(--peach-deep)" }}>
        Вердикт AI
      </div>
      <div className="font-heading text-[19px] font-bold leading-[1.25] tracking-[-0.018em] text-[var(--ink)]">
        {narrative.headline}
      </div>

      <div className="mt-4 space-y-2.5">
        <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--ink-subtle)]">
          Что вижу
        </div>
        {narrative.observations.map((o, i) => (
          <div key={i} className="flex items-start gap-2 text-[13px] leading-relaxed text-[var(--ink)]">
            <span className="mt-1.5 size-1 shrink-0 rounded-full" style={{ background: "var(--peach)" }} />
            <span>{o}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-2.5">
        <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--ink-subtle)]">
          Что предлагаю
        </div>
        {narrative.next_actions.map((a, i) => (
          <div key={i} className="flex items-start gap-2 text-[13px] leading-relaxed text-[var(--ink)]">
            <span className="mt-1.5 size-1 shrink-0 rounded-full" style={{ background: "var(--sage)" }} />
            <span>{a}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function plural(n: number, forms: [string, string, string]): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return forms[0];
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return forms[1];
  return forms[2];
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
