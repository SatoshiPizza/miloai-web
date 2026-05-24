"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, Loader2, Mic } from "lucide-react";
import { api } from "@/lib/api";
import { getSessionToken, saveSession } from "@/lib/session";
import { GoogleLoginButton } from "@/components/social-login";

/**
 * Marketing landing — replaces the old `/` → /dashboard redirect.
 *
 * If a session JWT is already in localStorage we send the user straight
 * to /dashboard so returning visitors don't see the marketing page
 * unless they explicitly log out.
 *
 * Authentication on this page is email + Google. Telegram login lives
 * INSIDE the dashboard at /accounts as a "connect your TG" flow, not as
 * a primary login method (per user feedback 2026-05-24) — TG widget is
 * heavyweight UX and we only want it for voice control, not for sign-in.
 */

export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    if (getSessionToken()) {
      router.replace("/dashboard");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header />
      <main className="max-w-[1280px] mx-auto px-6 lg:px-8 py-10 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-10 lg:gap-14 items-start">
          <Hero />
          <AuthPanel />
        </div>
      </main>
    </div>
  );
}


// ═════════════════════════════════════════════════════════════════════════════
// Header
// ═════════════════════════════════════════════════════════════════════════════

function Header() {
  return (
    <header className="border-b border-[var(--border)]/40 sticky top-0 bg-[var(--background)]/85 backdrop-blur z-10">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-8 h-[64px] flex items-center gap-8">
        <a href="/" className="flex items-center gap-2 shrink-0">
          <Sparkles className="size-5 text-[var(--peach)]" strokeWidth={1.6} />
          <span className="font-heading text-[20px] font-bold tracking-tight">MiloAI</span>
        </a>
        <nav className="hidden md:flex items-center gap-6 text-[14px] text-[var(--ink-mute)]">
          <a href="#features" className="hover:text-[var(--ink)] transition-colors">Возможности</a>
          <a href="#pricing"  className="hover:text-[var(--ink)] transition-colors">Цены</a>
          <a href="#audience" className="hover:text-[var(--ink)] transition-colors">Кому подходит</a>
          <a href="#faq"      className="hover:text-[var(--ink)] transition-colors">FAQ</a>
        </nav>
        <div className="flex-1" />
        <span className="hidden sm:inline font-mono text-[11px] text-[var(--ink-subtle)] uppercase tracking-wider">RU</span>
        <a
          href="#auth"
          className="px-4 py-2 rounded-md text-[13.5px] font-medium text-white inline-flex items-center gap-1.5"
          style={{ background: "var(--ink)" }}
        >
          Начать
          <ArrowRight className="size-3.5" />
        </a>
      </div>
    </header>
  );
}


// ═════════════════════════════════════════════════════════════════════════════
// Hero
// ═════════════════════════════════════════════════════════════════════════════

function Hero() {
  return (
    <div>
      <div
        className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-6"
        style={{ background: "var(--peach-wash)", border: "1px solid var(--peach-soft)" }}
      >
        <span className="size-1.5 rounded-full" style={{ background: "var(--peach-deep)" }} />
        <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.12em]" style={{ color: "var(--peach-deep)" }}>
          SMB · Estonia · EU · 2026
        </span>
      </div>

      <h1 className="font-heading font-bold leading-[0.95] tracking-[-0.035em] text-[44px] sm:text-[56px] lg:text-[68px] text-[var(--ink)]">
        AI медиабайер,<br />
        с которым{" "}
        <span className="italic" style={{ color: "var(--peach)" }}>
          можно говорить
        </span>
      </h1>

      <p className="mt-6 text-[16px] lg:text-[17px] leading-[1.6] text-[var(--ink-mute)] max-w-[520px] tracking-[-0.005em]">
        Управляй рекламой в Meta и Google голосом — прямо из Telegram. AI запускает кампании, замечает аномалии, генерирует креативы.{" "}
        <b className="text-[var(--ink)]">Заменяет агентство за €500–1500/мес — за €99.</b>
      </p>

      {/* Stats — placeholder numbers; bump as friends sign up (per user 2026-05-24) */}
      <div className="mt-9 grid grid-cols-3 gap-4 max-w-[520px]">
        <Stat value="47"    label="клиентов" />
        <Stat value="3.3×"  label="ниже CPA vs benchmark" />
        <Stat value="1.8с"  label="среднее время отклика" />
      </div>

      <KillerFeatureCard />
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="font-mono text-[30px] lg:text-[34px] font-semibold tabular-nums tracking-[-0.02em] leading-none text-[var(--ink)]">
        {value}
      </div>
      <div className="text-[11.5px] text-[var(--ink-mute)] mt-1.5 leading-snug">
        {label}
      </div>
    </div>
  );
}

function KillerFeatureCard() {
  return (
    <div
      className="mt-10 rounded-[18px] border p-5 flex flex-col sm:flex-row gap-5 items-start sm:items-center max-w-[640px]"
      style={{ background: "var(--card-soft)", borderColor: "var(--border)" }}
    >
      {/* Mini phone mockup */}
      <div
        className="shrink-0 w-[120px] h-[170px] rounded-[18px] flex items-end justify-center p-2.5 relative"
        style={{
          background: "linear-gradient(135deg, #F8E8D9 0%, #FCF1E8 100%)",
          border: "1px solid var(--peach-soft)",
        }}
      >
        <div
          className="absolute top-2.5 left-2.5 right-2.5 px-2 py-1.5 rounded-md text-[8.5px] font-semibold uppercase text-white tracking-[0.04em]"
          style={{ background: "var(--peach)" }}
        >
          Подними бюджет до €25
        </div>
        <div className="absolute bottom-2.5 left-2.5 right-2.5 px-2 py-1.5 rounded-md bg-white border border-[var(--border)] flex items-center gap-1.5">
          <span className="size-1.5 rounded-full" style={{ background: "var(--sage)" }} />
          <span className="font-mono text-[9.5px] font-medium text-[var(--ink)]">€25/день</span>
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.12em]" style={{ color: "var(--peach-deep)" }}>
          KILLER FEATURE
        </div>
        <div className="font-heading text-[18px] font-bold tracking-[-0.018em] mt-1 text-[var(--ink)]">
          Telegram ↔ Web в реальном времени
        </div>
        <p className="text-[13px] text-[var(--ink-mute)] leading-relaxed mt-1.5">
          Записал голосовое с пляжа — кампания обновилась в дашборде. Двусторонний sync.
        </p>
      </div>
    </div>
  );
}


// ═════════════════════════════════════════════════════════════════════════════
// Auth panel
// ═════════════════════════════════════════════════════════════════════════════

function AuthPanel() {
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
        token: string; user_id: number; email: string; first_name: string | null;
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
    <div
      id="auth"
      className="rounded-[18px] border p-7"
      style={{ background: "#fff", borderColor: "var(--border)", boxShadow: "0 4px 20px -8px rgba(31,29,26,0.08)" }}
    >
      <div className="flex p-1 rounded-md mb-5" style={{ background: "var(--card-soft)" }}>
        <button
          onClick={() => setTab("login")}
          className="flex-1 py-2 rounded text-[13px] font-medium transition-colors"
          style={{
            background: tab === "login" ? "#fff" : "transparent",
            color: tab === "login" ? "var(--ink)" : "var(--ink-mute)",
            boxShadow: tab === "login" ? "0 1px 3px rgba(31,29,26,0.06)" : "none",
          }}
        >
          Войти
        </button>
        <button
          onClick={() => setTab("signup")}
          className="flex-1 py-2 rounded text-[13px] font-medium transition-colors"
          style={{
            background: tab === "signup" ? "#fff" : "transparent",
            color: tab === "signup" ? "var(--ink)" : "var(--ink-mute)",
            boxShadow: tab === "signup" ? "0 1px 3px rgba(31,29,26,0.06)" : "none",
          }}
        >
          Регистрация
        </button>
      </div>

      <h2 className="font-heading text-[22px] font-bold tracking-[-0.02em]">
        {tab === "login" ? "С возвращением." : "Добро пожаловать."}
      </h2>
      <p className="text-[13px] text-[var(--ink-mute)] mt-1.5 leading-relaxed">
        {tab === "login"
          ? "Войди и проверь, что AI делал, пока тебя не было."
          : "Заводи аккаунт за 10 секунд. Без паролей, без верификации карты."}
      </p>

      <div className="my-5">
        <label className="text-[12px] font-medium text-[var(--ink-mute)] block mb-1.5">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submitEmail()}
          placeholder="vällu@vallu.ee"
          className="w-full px-3 py-2.5 rounded-md border text-[14px] outline-none transition-colors"
          style={{
            background: "var(--card-soft)",
            borderColor: error ? "var(--destructive)" : "var(--border)",
            color: "var(--ink)",
          }}
        />
      </div>

      <button
        onClick={submitEmail}
        disabled={busy || !email.trim()}
        className="w-full py-2.5 rounded-md text-[14px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50 inline-flex items-center justify-center gap-2"
        style={{ background: "var(--ink)" }}
      >
        {busy && <Loader2 className="size-4 animate-spin" />}
        {tab === "login" ? "Войти" : "Создать аккаунт"}
        {!busy && <ArrowRight className="size-3.5" />}
      </button>

      <p className="text-[11px] text-[var(--ink-subtle)] mt-2.5 leading-relaxed">
        Без паролей. Сессия 30 дней. Telegram подключишь внутри платформы — для голосового управления.
      </p>

      {error && (
        <div className="mt-3 px-3 py-2 rounded-md text-[12.5px] bg-[#F8DDD0] border border-[#E9C4B5] text-[var(--destructive)]">
          {error}
        </div>
      )}

      <div className="my-5 flex items-center gap-3 text-[10.5px] font-mono uppercase tracking-[0.12em] text-[var(--ink-subtle)]">
        <span className="flex-1 h-px bg-[var(--border)]" />
        или
        <span className="flex-1 h-px bg-[var(--border)]" />
      </div>

      <GoogleLoginButton
        next="/dashboard"
        onStart={() => { setBusy(true); setError(null); }}
        onError={(m) => { setError(m); setBusy(false); }}
        onDone={() => setBusy(false)}
      />

      <p className="text-[11px] text-[var(--ink-subtle)] mt-5 leading-relaxed flex items-start gap-1.5">
        <Mic className="size-3 mt-0.5 shrink-0" style={{ color: "var(--peach-deep)" } as React.CSSProperties} />
        Голосовое управление — после первого входа: подключи Telegram в&nbsp;настройках, и&nbsp;управляй рекламой голосом.
      </p>
    </div>
  );
}
