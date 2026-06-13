"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles, ArrowRight, Loader2, Mic,
  // Section icons
  Bot, Globe, Inbox, BarChart3, Wand2, Plug, Check, MessageSquare,
  Smile, Scissors, Activity, Scale, ShoppingBag, Wrench, GraduationCap,
  Building2, ChevronDown, Plus,
} from "lucide-react";
import { useState as useStateLocal } from "react";

import { api } from "@/lib/api";
import { getSessionToken, saveSession } from "@/lib/session";
import { GoogleLoginButton, MetaLoginButton } from "@/components/social-login";

/**
 * Marketing landing — bold direction (iteration 4, variant B).
 *
 * Full-bleed dark gradient with two radial glows (peach top-left, sage
 * bottom-right). Two columns:
 *   • Left  — pitch panel: logo, SMB badge, big headline, body, 3 proof stats.
 *   • Right — floating white auth card centered on the dark background.
 *
 * Returning visitors with a session token skip the page entirely.
 *
 * Authentication options: email magic-link-ish (currently passwordless via
 * /api/auth/email-login), Google, Facebook. Telegram lives inside the
 * dashboard at /accounts as a "connect TG for voice" flow — not a primary
 * sign-in method, per the 2026-05-24 product call.
 */

export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    if (getSessionToken()) {
      router.replace("/dashboard");
    }
  }, [router]);

  return (
    <div className="min-h-screen">
      <DarkHero />
      <Features />
      <Audience />
      <Pricing />
      <FaqSection />
      <LandingFooter />
    </div>
  );
}


// ═════════════════════════════════════════════════════════════════════════════
// Dark hero — first viewport (the original variant B floating-card pitch)
// ═════════════════════════════════════════════════════════════════════════════

function DarkHero() {
  return (
    <div
      className="relative overflow-hidden text-[var(--hero-cream)]"
      style={{ background: "var(--hero-bg)" }}
    >
      {/* Warm peach glow, top-left. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 -top-40 size-[600px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(232,149,108,0.18) 0%, transparent 62%)",
        }}
      />
      {/* Cool sage glow, bottom-right. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-44 right-44 size-[540px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(133,162,117,0.10) 0%, transparent 62%)",
        }}
      />

      <Header />

      <main className="relative mx-auto flex min-h-[calc(100vh-64px)] w-full max-w-[1320px] flex-col gap-12 px-6 py-10 lg:flex-row lg:items-center lg:gap-0 lg:px-12 lg:py-16">
        <Pitch />
        <AuthCard />
      </main>
    </div>
  );
}


// ═════════════════════════════════════════════════════════════════════════════
// Header — minimal, transparent over the dark background
// ═════════════════════════════════════════════════════════════════════════════

function Header() {
  return (
    <header className="relative z-10">
      <div className="mx-auto flex h-16 max-w-[1320px] items-center gap-8 px-6 lg:px-12">
        <a href="/" className="flex shrink-0 items-center gap-2.5">
          <Sparkles
            className="size-5"
            strokeWidth={1.6}
            style={{ color: "var(--hero-cream)" }}
          />
          <span
            className="font-heading text-[20px] font-bold tracking-tight"
            style={{ color: "var(--hero-cream)" }}
          >
            MiloAI
          </span>
        </a>
        <nav
          className="hidden items-center gap-7 text-[14px] md:flex"
          style={{ color: "var(--hero-cream-65)" }}
        >
          <a href="#features" className="hover:text-[var(--hero-cream)] transition-colors">Возможности</a>
          <a href="#pricing" className="hover:text-[var(--hero-cream)] transition-colors">Цены</a>
          <a href="#audience" className="hover:text-[var(--hero-cream)] transition-colors">Кому подходит</a>
          <a href="#faq" className="hover:text-[var(--hero-cream)] transition-colors">FAQ</a>
        </nav>
        <div className="flex-1" />
        <span
          className="hidden font-mono text-[11px] uppercase tracking-wider sm:inline"
          style={{ color: "var(--hero-cream-45)" }}
        >
          RU
        </span>
        <a
          href="#auth"
          className="inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-[13.5px] font-medium text-white"
          style={{ background: "var(--peach)" }}
        >
          Начать
          <ArrowRight className="size-3.5" />
        </a>
      </div>
    </header>
  );
}


// ═════════════════════════════════════════════════════════════════════════════
// Pitch — left column: badge, headline, body, 3 proof stats
// ═════════════════════════════════════════════════════════════════════════════

function Pitch() {
  return (
    <div className="relative flex-1 lg:max-w-[600px] lg:pr-10">
      {/* SMB badge — peach pill with dot */}
      <div
        className="mb-6 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5"
        style={{
          background: "var(--hero-peach-wash)",
          border: "1px solid var(--hero-peach-border)",
        }}
      >
        <span
          className="size-1.5 rounded-full"
          style={{ background: "var(--peach)" }}
        />
        <span
          className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.08em]"
          style={{ color: "var(--peach)" }}
        >
          SMB · Estonia · EU
        </span>
      </div>

      <h1
        className="font-heading text-[44px] font-bold leading-[1.04] tracking-[-0.035em] sm:text-[52px] lg:text-[56px]"
        style={{ color: "var(--hero-cream)" }}
      >
        AI медиабайер,
        <br />
        с которым{" "}
        <em
          className="not-italic italic"
          style={{ color: "var(--peach)" }}
        >
          можно говорить
        </em>
      </h1>

      <p
        className="mt-5 max-w-[500px] text-[16px] leading-[1.5] tracking-[-0.01em]"
        style={{ color: "var(--hero-cream-65)" }}
      >
        Meta и Google голосом — из Telegram.{" "}
        <span
          className="font-medium"
          style={{ color: "var(--hero-cream)" }}
        >
          Заменяет агентство за €500–1500 — за €99.
        </span>
      </p>

      <div className="mt-9 flex gap-8">
        <Proof value="47" label="клиник Эстонии" />
        <Proof value="3.3×" label="ниже CPA рынка" accent />
        <Proof value="1.8с" label="время отклика" />
      </div>

      <p
        className="mt-12 hidden font-mono text-[11px] tracking-wider lg:flex lg:gap-5"
        style={{ color: "var(--hero-cream-45)" }}
      >
        <span>© 2026 MiloAI OÜ</span>
        <span>Tallinn, EE</span>
      </p>
    </div>
  );
}

function Proof({
  value,
  label,
  accent,
}: {
  value: string;
  label: string;
  accent?: boolean;
}) {
  return (
    <div className="flex flex-col">
      <span
        className="font-mono text-[28px] font-semibold leading-none tabular-nums tracking-[-0.025em] lg:text-[32px]"
        style={{ color: accent ? "var(--peach)" : "var(--hero-cream)" }}
      >
        {value}
      </span>
      <span
        className="mt-2 text-[12px] leading-snug"
        style={{ color: "var(--hero-cream-55)" }}
      >
        {label}
      </span>
    </div>
  );
}


// ═════════════════════════════════════════════════════════════════════════════
// Auth — right column: floating white card centered on the dark bg
// ═════════════════════════════════════════════════════════════════════════════

function AuthCard() {
  const router = useRouter();
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submitEmail() {
    const e = email.trim().toLowerCase();
    if (!e || !e.includes("@")) {
      setError("Введи валидный email");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await api.post<{
        token: string;
        user_id: number;
        email: string;
        first_name: string | null;
      }>("/api/auth/email-login", { email: e });
      saveSession({
        token: res.token,
        user_id: res.user_id,
        telegram_id: 0,
        first_name: res.first_name,
        username: null,
        email: res.email,
      });
      router.replace("/dashboard");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Не удалось войти";
      setError(msg);
      setBusy(false);
    }
  }

  return (
    <div className="relative flex w-full justify-center lg:w-[520px] lg:shrink-0 lg:justify-end">
      <div
        id="auth"
        className="w-full max-w-[400px] rounded-[20px] bg-white p-9"
        style={{
          boxShadow:
            "0 40px 90px -24px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)",
        }}
      >
        {/* Tabs */}
        <div
          className="mb-6 flex gap-1 rounded-[10px] p-1"
          style={{ background: "var(--card-soft)" }}
        >
          <button
            onClick={() => setTab("login")}
            className="flex-1 rounded-[7px] py-2 text-[13px] font-medium transition-colors"
            style={{
              background: tab === "login" ? "#fff" : "transparent",
              color: tab === "login" ? "var(--ink)" : "var(--ink-mute)",
              boxShadow:
                tab === "login"
                  ? "0 1px 3px rgba(31,29,26,0.06), 0 0 0 1px var(--border)"
                  : "none",
            }}
          >
            Войти
          </button>
          <button
            onClick={() => setTab("signup")}
            className="flex-1 rounded-[7px] py-2 text-[13px] font-medium transition-colors"
            style={{
              background: tab === "signup" ? "#fff" : "transparent",
              color: tab === "signup" ? "var(--ink)" : "var(--ink-mute)",
              boxShadow:
                tab === "signup"
                  ? "0 1px 3px rgba(31,29,26,0.06), 0 0 0 1px var(--border)"
                  : "none",
            }}
          >
            Регистрация
          </button>
        </div>

        <h2 className="font-heading text-[24px] font-bold tracking-[-0.022em] text-[var(--ink)]">
          {tab === "login" ? "С возвращением." : "Добро пожаловать."}
        </h2>
        <p className="mt-1.5 text-[13.5px] leading-relaxed text-[var(--ink-mute)]">
          {tab === "login"
            ? "Войди и проверь, что AI делал, пока тебя не было."
            : "Заводи аккаунт за 10 секунд. Без паролей, без верификации карты."}
        </p>

        {/* Email field */}
        <label className="mt-5 block text-[12px] font-medium text-[var(--ink-mute)]">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submitEmail()}
          placeholder="vällu@vallu.ee"
          className="mt-1.5 w-full rounded-[10px] px-3.5 py-3 text-[14px] outline-none transition-colors"
          style={{
            background: "var(--card)",
            border: `1.5px solid ${
              error
                ? "var(--destructive)"
                : email
                  ? "var(--peach)"
                  : "var(--border)"
            }`,
            boxShadow: email && !error
              ? "0 0 0 4px rgba(232,149,108,0.1)"
              : undefined,
            color: "var(--ink)",
          }}
        />

        <button
          onClick={submitEmail}
          disabled={busy || !email.trim()}
          className="mt-3.5 inline-flex w-full items-center justify-center gap-2 rounded-[10px] py-3 text-[14px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ background: "var(--ink)" }}
        >
          {busy && <Loader2 className="size-4 animate-spin" />}
          {tab === "login" ? "Прислать magic-ссылку" : "Создать аккаунт"}
          {!busy && (
            <ArrowRight
              className="size-3.5"
              style={{ color: "var(--peach)" }}
            />
          )}
        </button>

        {error && (
          <div className="mt-3 rounded-[10px] border border-[#E9C4B5] bg-[#F8DDD0] px-3 py-2 text-[12.5px] text-[var(--destructive)]">
            {error}
          </div>
        )}

        {/* OAuth divider */}
        <div className="my-5 flex items-center gap-3 font-mono text-[10.5px] uppercase tracking-[0.1em] text-[var(--ink-subtle)]">
          <span className="h-px flex-1 bg-[var(--border)]" />
          или
          <span className="h-px flex-1 bg-[var(--border)]" />
        </div>

        <div className="flex flex-col gap-2.5">
          <GoogleLoginButton
            next="/dashboard"
            onStart={() => {
              setBusy(true);
              setError(null);
            }}
            onError={(m) => {
              setError(m);
              setBusy(false);
            }}
            onDone={() => setBusy(false)}
          />
          <MetaLoginButton
            next="/dashboard"
            onStart={() => {
              setBusy(true);
              setError(null);
            }}
            onError={(m) => {
              setError(m);
              setBusy(false);
            }}
            onDone={() => setBusy(false)}
          />
        </div>

        <p className="mt-5 flex items-start gap-1.5 text-[11px] leading-relaxed text-[var(--ink-subtle)]">
          <Mic
            className="mt-0.5 size-3 shrink-0"
            style={{ color: "var(--peach-deep)" }}
          />
          Голосовое управление — после первого входа: подключи Telegram
          в&nbsp;настройках, и&nbsp;управляй рекламой голосом.
        </p>

        <p className="mt-4 text-[10.5px] leading-relaxed text-[var(--ink-subtle)]">
          Создавая аккаунт ты соглашаешься с{" "}
          <a
            href="/terms"
            className="underline hover:text-[var(--ink-mute)]"
          >
            Условиями
          </a>{" "}
          и{" "}
          <a
            href="/privacy"
            className="underline hover:text-[var(--ink-mute)]"
          >
            Политикой конфиденциальности
          </a>
          .
        </p>
      </div>
    </div>
  );
}


// ═════════════════════════════════════════════════════════════════════════════
// Features section — 6 cards in editorial 3×2 grid on cream
// ═════════════════════════════════════════════════════════════════════════════

function Features() {
  const items = [
    {
      icon: Bot,
      title: "AI-анализ сайта за 30 секунд",
      body: "GPT-4o читает страницы, вытаскивает услуги, цены, USP. Не выдумывает — оставляет пустым что не нашёл.",
    },
    {
      icon: Mic,
      title: "Голосовое управление из Telegram",
      body: "Записал голосовое — AI распознал, выполнил. «Подними бюджет на 20%», «покажи лучшую кампанию».",
    },
    {
      icon: Plug,
      title: "Импорт существующих кампаний",
      body: "Подключил Meta или Google — AI забирает 7-дневные метрики, видит CPL, замечает аномалии.",
    },
    {
      icon: Wand2,
      title: "Креативы из реальных фото",
      body: "Vision-AI отделяет настоящие фото клиники/работ от стоков. Только настоящее идёт в баннеры.",
    },
    {
      icon: Globe,
      title: "Лендинги под услугу автоматом",
      body: "AI собирает страницу под конкретную услугу — заголовок, оффер, форма, контакты. Размещает у тебя или у нас.",
    },
    {
      icon: Inbox,
      title: "Lead Inbox с AI-черновиком ответа",
      body: "Каждый лид из Meta/Google падает в один inbox. AI готовит черновик ответа — ты редактируешь и шлёшь в WhatsApp.",
    },
  ];

  return (
    <section
      id="features"
      className="border-y bg-[var(--background)] py-16 lg:py-24"
      style={{ borderColor: "var(--border)" }}
    >
      <div className="mx-auto max-w-[1320px] px-6 lg:px-12">
        <SectionEyebrow>Возможности</SectionEyebrow>
        <h2 className="mt-4 font-heading text-[34px] lg:text-[44px] font-bold leading-[1.05] tracking-[-0.03em] text-[var(--ink)]">
          Шесть машин внутри{" "}
          <em
            className="not-italic italic"
            style={{ color: "var(--peach)" }}
          >
            одного интерфейса
          </em>
        </h2>
        <p className="mt-4 max-w-[640px] text-[16px] leading-relaxed text-[var(--ink-mute)]">
          Анализ. Запуск. Креативы. Лендинги. Лиды. Аналитика. Все шесть стадий
          без переключения вкладок и без агентства.
        </p>

        <div className="mt-12 grid grid-cols-1 gap-x-10 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
          {items.map((it, i) => (
            <FeatureItem key={i} {...it} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureItem({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof Bot;
  title: string;
  body: string;
}) {
  return (
    <div>
      <div
        className="mb-4 inline-flex size-11 items-center justify-center rounded-[12px]"
        style={{
          background: "var(--peach-wash)",
          border: "1px solid var(--peach-soft)",
        }}
      >
        <Icon
          className="size-[20px]"
          strokeWidth={1.7}
          style={{ color: "var(--peach-deep)" }}
        />
      </div>
      <div className="font-heading text-[19px] font-bold leading-tight tracking-[-0.018em] text-[var(--ink)]">
        {title}
      </div>
      <p className="mt-2 text-[14px] leading-relaxed text-[var(--ink-mute)]">
        {body}
      </p>
    </div>
  );
}


// ═════════════════════════════════════════════════════════════════════════════
// Audience section — niche chips with brief positioning
// ═════════════════════════════════════════════════════════════════════════════

function Audience() {
  const niches = [
    { icon: Smile, label: "Стоматология", sub: "CPL €38–55 vs €78 рынка" },
    { icon: Scissors, label: "Красота / косметология", sub: "CPL €14–22" },
    { icon: Activity, label: "Фитнес / здоровье", sub: "CPL €16–26" },
    { icon: Scale, label: "Юристы / нотариусы", sub: "CPL €48–70" },
    { icon: Wrench, label: "Ремонт / автосервис", sub: "CPL €22–32" },
    { icon: ShoppingBag, label: "Малый e-commerce", sub: "ROAS 3.0+" },
    { icon: GraduationCap, label: "Курсы / образование", sub: "CPL €22–35" },
    { icon: Building2, label: "Локальные сервисы", sub: "По запросу" },
  ];

  return (
    <section
      id="audience"
      className="py-16 lg:py-24"
      style={{ background: "var(--card-soft)" }}
    >
      <div className="mx-auto max-w-[1320px] px-6 lg:px-12">
        <SectionEyebrow>Кому подходит</SectionEyebrow>
        <h2 className="mt-4 font-heading text-[34px] lg:text-[44px] font-bold leading-[1.05] tracking-[-0.03em] text-[var(--ink)]">
          Малому бизнесу без своего{" "}
          <em
            className="not-italic italic"
            style={{ color: "var(--peach)" }}
          >
            маркетолога
          </em>
        </h2>
        <p className="mt-4 max-w-[640px] text-[16px] leading-relaxed text-[var(--ink-mute)]">
          Лучше всего работаем там, где средний чек €100+ и решение принимает
          один человек. Estonia, EU, ru-/en-/et-говорящая аудитория.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {niches.map((n, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-[12px] bg-white px-4 py-3.5"
              style={{ border: "1px solid var(--border)" }}
            >
              <div
                className="flex size-9 shrink-0 items-center justify-center rounded-[10px]"
                style={{ background: "var(--card-soft)" }}
              >
                <n.icon
                  className="size-[17px]"
                  strokeWidth={1.7}
                  style={{ color: "var(--peach-deep)" }}
                />
              </div>
              <div className="min-w-0">
                <div className="truncate text-[13.5px] font-semibold text-[var(--ink)]">
                  {n.label}
                </div>
                <div className="truncate font-mono text-[10.5px] text-[var(--ink-subtle)]">
                  {n.sub}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


// ═════════════════════════════════════════════════════════════════════════════
// Pricing — 3 tiers
// ═════════════════════════════════════════════════════════════════════════════

function Pricing() {
  const tiers = [
    {
      name: "Starter",
      price: "€29",
      sub: "/ месяц",
      tagline: "Один бизнес, попробовать AI",
      features: [
        "1 бизнес-профиль",
        "AI-анализ сайта и услуг",
        "Креативы и лендинги (×30 в месяц)",
        "Lead Inbox + AI-черновики ответов",
        "Подключение Meta + Google",
      ],
      ctaLabel: "Начать с €29",
      featured: false,
    },
    {
      name: "Pro",
      price: "€99",
      sub: "/ месяц",
      tagline: "Один бизнес активно растёт",
      features: [
        "Всё из Starter",
        "Голосовое управление из Telegram",
        "Vision-классификатор фото",
        "Импорт прошлых кампаний",
        "Бенчмарки по нише EE/EU",
        "Безлимит креативов и лендингов",
      ],
      ctaLabel: "Взять Pro",
      featured: true,
    },
    {
      name: "Agency",
      price: "€499",
      sub: "/ месяц",
      tagline: "Маркетолог с клиентами",
      features: [
        "Всё из Pro",
        "До 30 бизнес-профилей",
        "Один OAuth — много кабинетов",
        "Multi-business switcher",
        "Приоритетный саппорт",
        "White-label опционально",
      ],
      ctaLabel: "Связаться",
      featured: false,
    },
  ];

  return (
    <section
      id="pricing"
      className="border-y bg-[var(--background)] py-16 lg:py-24"
      style={{ borderColor: "var(--border)" }}
    >
      <div className="mx-auto max-w-[1320px] px-6 lg:px-12">
        <SectionEyebrow>Цены</SectionEyebrow>
        <h2 className="mt-4 font-heading text-[34px] lg:text-[44px] font-bold leading-[1.05] tracking-[-0.03em] text-[var(--ink)]">
          Дешевле любого{" "}
          <em
            className="not-italic italic"
            style={{ color: "var(--peach)" }}
          >
            подрядчика-маркетолога
          </em>
        </h2>
        <p className="mt-4 max-w-[640px] text-[16px] leading-relaxed text-[var(--ink-mute)]">
          Подрядчик €500–1500/мес делает то же что Pro за €99. Месяц на тест,
          отмена в один клик, никакой верификации карты на Starter.
        </p>

        <div className="mt-12 grid grid-cols-1 gap-5 lg:grid-cols-3">
          {tiers.map((t, i) => (
            <PricingTier key={i} {...t} />
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingTier({
  name,
  price,
  sub,
  tagline,
  features,
  ctaLabel,
  featured,
}: {
  name: string;
  price: string;
  sub: string;
  tagline: string;
  features: string[];
  ctaLabel: string;
  featured: boolean;
}) {
  return (
    <div
      className="relative flex flex-col rounded-[18px] p-6 lg:p-7"
      style={{
        background: featured ? "var(--peach-wash)" : "#fff",
        border: featured
          ? "1.5px solid var(--peach)"
          : "1px solid var(--border)",
        boxShadow: featured
          ? "0 24px 60px -24px rgba(232,149,108,0.35)"
          : "0 4px 14px -6px rgba(31,29,26,0.08)",
      }}
    >
      {featured && (
        <div
          className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-full px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-white"
          style={{ background: "var(--peach)" }}
        >
          <Sparkles className="size-3" />
          Самый популярный
        </div>
      )}

      <div className="font-heading text-[22px] font-bold tracking-[-0.022em] text-[var(--ink)]">
        {name}
      </div>
      <div className="mt-1 text-[13px] text-[var(--ink-mute)]">{tagline}</div>

      <div className="mt-5 flex items-baseline gap-1.5">
        <span className="font-mono text-[42px] font-semibold leading-none tabular-nums tracking-[-0.025em] text-[var(--ink)]">
          {price}
        </span>
        <span className="text-[14px] text-[var(--ink-mute)]">{sub}</span>
      </div>

      <ul className="mt-6 flex-1 space-y-2.5">
        {features.map((f, i) => (
          <li
            key={i}
            className="flex items-start gap-2.5 text-[13.5px] leading-snug text-[var(--ink)]"
          >
            <Check
              className="mt-0.5 size-[14px] shrink-0"
              strokeWidth={2.5}
              style={{ color: featured ? "var(--peach-deep)" : "var(--sage)" }}
            />
            {f}
          </li>
        ))}
      </ul>

      <a
        href="#auth"
        className="mt-7 inline-flex items-center justify-center gap-2 rounded-[11px] py-3 text-[14px] font-medium transition-opacity hover:opacity-90"
        style={{
          background: featured ? "var(--peach)" : "var(--ink)",
          color: "#fff",
          boxShadow: featured
            ? "0 6px 18px -6px rgba(232,149,108,0.55)"
            : undefined,
        }}
      >
        {ctaLabel}
        <ArrowRight className="size-[14px]" />
      </a>
    </div>
  );
}


// ═════════════════════════════════════════════════════════════════════════════
// FAQ — accordion
// ═════════════════════════════════════════════════════════════════════════════

function FaqSection() {
  const items = [
    {
      q: "А мои данные безопасны? Куда уходит то что AI видит?",
      a: "Сайт и кампании читаем через OpenAI/Anthropic, профиль и метрики храним только у себя в Estonia. OAuth-токены шифруем AES-256 в БД и не передаём третьим лицам. Отключаешь кабинет — токен стирается.",
    },
    {
      q: "Что значит «голосовое управление»? Это правда работает?",
      a: "Подключаешь Telegram-бота через QR. Записываешь голосовое — Whisper распознаёт, AI понимает контекст («подними бюджет лучшей кампании на 30%»), выполняет в кабинете. Можно так с пляжа.",
    },
    {
      q: "А что если я не знаю что писать в креативе?",
      a: "AI пишет за тебя. Структура из 3 углов (Pain → Direct → Trust), цены подтягиваются из услуг, фото — только реальные (vision-классификатор отделяет стоки). Ты ревьюишь и отправляешь.",
    },
    {
      q: "Сколько занимает запуск первой кампании?",
      a: "От сайта до запущенной кампании в Meta — 8 минут. Сайт парсится 30 секунд, профиль подтверждаешь, кабинеты подключены за минуту, креативы и лендинг генерируются параллельно, оплачиваешь карту в Meta и всё.",
    },
    {
      q: "А почему €99 а не €19? У AI же нет себестоимости.",
      a: "Себестоимость есть: vision-классификация, GPT-4o, генерация креативов через image-API, инфра. Один Pro-юзер съедает $15–25 LLM-токенов в месяц. €99 — это окно, в котором мы устойчиво растём и не закрываемся через год.",
    },
    {
      q: "Есть ли возврат денег?",
      a: "Первые 14 дней — возврат без вопросов. После — нет, но отмена в один клик из Settings → Billing. Никаких звонков в саппорт за «удержанием».",
    },
  ];

  return (
    <section
      id="faq"
      className="py-16 lg:py-24"
      style={{ background: "var(--card-soft)" }}
    >
      <div className="mx-auto max-w-[860px] px-6 lg:px-12">
        <SectionEyebrow>FAQ</SectionEyebrow>
        <h2 className="mt-4 font-heading text-[34px] lg:text-[44px] font-bold leading-[1.05] tracking-[-0.03em] text-[var(--ink)]">
          Частые вопросы
        </h2>

        <div
          className="mt-10 divide-y rounded-[16px] bg-white"
          style={{
            border: "1px solid var(--border)",
            // @ts-expect-error -- tailwind divide handles via children
            "--tw-divide-y-reverse": "0",
          }}
        >
          {items.map((it, i) => (
            <FaqRow key={i} q={it.q} a={it.a} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FaqRow({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useStateLocal(false);
  return (
    <button
      onClick={() => setOpen((p) => !p)}
      className="w-full px-5 py-4 text-left transition-colors hover:bg-[var(--card-soft)]/50 lg:px-7 lg:py-5"
    >
      <div className="flex items-center gap-3">
        <span className="flex-1 text-[15px] font-semibold tracking-[-0.01em] text-[var(--ink)] lg:text-[16px]">
          {q}
        </span>
        <div
          className="flex size-7 shrink-0 items-center justify-center rounded-full transition-transform"
          style={{
            background: open ? "var(--peach)" : "var(--card-soft)",
            color: open ? "#fff" : "var(--ink-mute)",
            transform: open ? "rotate(45deg)" : "rotate(0deg)",
          }}
        >
          <Plus className="size-[14px]" strokeWidth={2.5} />
        </div>
      </div>
      {open && (
        <div className="mt-3 text-[14px] leading-relaxed text-[var(--ink-mute)]">
          {a}
        </div>
      )}
    </button>
  );
}


// ═════════════════════════════════════════════════════════════════════════════
// Footer
// ═════════════════════════════════════════════════════════════════════════════

function LandingFooter() {
  return (
    <footer
      className="border-t bg-[var(--background)]"
      style={{ borderColor: "var(--border)" }}
    >
      <div className="mx-auto flex max-w-[1320px] flex-col gap-6 px-6 py-10 lg:flex-row lg:items-center lg:gap-10 lg:px-12">
        <a href="/" className="flex items-center gap-2.5 shrink-0">
          <Sparkles
            className="size-[18px]"
            strokeWidth={1.6}
            style={{ color: "var(--peach)" }}
          />
          <span className="font-heading text-[18px] font-bold tracking-[-0.02em] text-[var(--ink)]">
            MiloAI
          </span>
        </a>
        <nav className="flex flex-wrap gap-5 text-[13.5px] text-[var(--ink-mute)]">
          <a href="#features" className="hover:text-[var(--ink)] transition-colors">Возможности</a>
          <a href="#pricing" className="hover:text-[var(--ink)] transition-colors">Цены</a>
          <a href="#audience" className="hover:text-[var(--ink)] transition-colors">Кому подходит</a>
          <a href="#faq" className="hover:text-[var(--ink)] transition-colors">FAQ</a>
          <a href="/privacy" className="hover:text-[var(--ink)] transition-colors">Privacy</a>
          <a href="/terms" className="hover:text-[var(--ink)] transition-colors">Terms</a>
        </nav>
        <div className="flex-1" />
        <div className="flex items-center gap-3 font-mono text-[11px] text-[var(--ink-subtle)]">
          <span>© 2026 MiloAI OÜ</span>
          <span>·</span>
          <span>Tallinn, EE</span>
          <span>·</span>
          <a
            href="mailto:hello@miloai.ee"
            className="hover:text-[var(--ink-mute)] transition-colors"
          >
            hello@miloai.ee
          </a>
        </div>
      </div>
    </footer>
  );
}


// Shared eyebrow chip for every section.
function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="inline-flex items-center gap-2 rounded-full px-3 py-1 font-mono text-[10.5px] font-semibold uppercase tracking-[0.1em]"
      style={{
        background: "var(--peach-wash)",
        border: "1px solid var(--peach-soft)",
        color: "var(--peach-deep)",
      }}
    >
      <Sparkles className="size-3" />
      {children}
    </div>
  );
}
