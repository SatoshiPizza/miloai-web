"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, Loader2, Mic } from "lucide-react";

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
    <div
      className="relative min-h-screen overflow-hidden text-[var(--hero-cream)]"
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
