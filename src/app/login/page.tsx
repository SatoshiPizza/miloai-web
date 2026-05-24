"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Sparkles, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { saveSession, getSessionToken } from "@/lib/session";
import { config } from "@/lib/config";
import { GoogleLoginButton, MetaLoginButton } from "@/components/social-login";

/**
 * /login — Telegram Login Widget entry point.
 *
 * Renders the official telegram-widget.js login button. On approval, the
 * widget calls our global `onTelegramAuth(user)` callback which posts to
 * /api/auth/telegram-login. Backend HMAC-verifies, finds/creates the User
 * row, and returns a session JWT. We store it in localStorage (see
 * src/lib/session.ts) and redirect to the requested `?next=...` (default
 * /dashboard).
 */

type TgAuthPayload = {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
};

type AuthResponse = {
  token: string;
  user_id: number;
  telegram_id: number;
  first_name: string | null;
  username: string | null;
};

declare global {
  interface Window {
    onTelegramAuth?: (user: TgAuthPayload) => void;
  }
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/dashboard";

  const widgetSlot = useRef<HTMLDivElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Email signup form state
  const [emailMode, setEmailMode] = useState(false);
  const [email, setEmail] = useState("");
  const [emailName, setEmailName] = useState("");

  async function emailSubmit() {
    if (!email.trim() || !email.includes("@")) {
      setError("Введи валидный email");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await api.post<{
        token: string; user_id: number; email: string; first_name: string | null;
      }>("/api/auth/email-login", {
        email: email.trim(),
        first_name: emailName.trim() || null,
      });
      saveSession({
        token: res.token,
        user_id: res.user_id,
        telegram_id: 0,
        first_name: res.first_name,
        username: null,
        email: res.email,
      });
      router.replace(next);
    } catch (e: unknown) {
      console.error(e);
      const msg = e instanceof Error ? e.message : "Не удалось войти";
      setError(msg);
      setBusy(false);
    }
  }

  // If already logged in, skip the form.
  useEffect(() => {
    if (getSessionToken()) {
      router.replace(next);
    }
  }, [router, next]);

  // Inject widget script once.
  useEffect(() => {
    if (!widgetSlot.current) return;
    // Cleanup any prior widget.
    widgetSlot.current.innerHTML = "";

    window.onTelegramAuth = async (tgUser) => {
      setBusy(true);
      setError(null);
      try {
        const res = await api.post<AuthResponse>("/api/auth/telegram-login", tgUser);
        saveSession({
          token: res.token,
          user_id: res.user_id,
          telegram_id: res.telegram_id,
          first_name: res.first_name,
          username: res.username,
        });
        router.replace(next);
      } catch (e: unknown) {
        console.error(e);
        const msg = e instanceof Error ? e.message : "Не удалось войти";
        setError(msg);
        setBusy(false);
      }
    };

    const script = document.createElement("script");
    script.async = true;
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.setAttribute("data-telegram-login", config.telegramBotUsername);
    script.setAttribute("data-size", "large");
    script.setAttribute("data-userpic", "true");
    script.setAttribute("data-request-access", "write");
    script.setAttribute("data-onauth", "onTelegramAuth(user)");
    widgetSlot.current.appendChild(script);

    return () => {
      delete window.onTelegramAuth;
    };
  }, [router, next]);

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-6">
      <div className="w-full max-w-[400px]">
        <div className="flex flex-col items-center text-center mb-8">
          <div
            className="size-12 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: "linear-gradient(135deg, var(--peach), var(--peach-deep))" }}
          >
            <Sparkles className="size-6 text-white" strokeWidth={1.7} />
          </div>
          <h1 className="font-heading text-[28px] font-bold leading-tight tracking-[-0.025em]">
            MiloAI
          </h1>
          <p className="text-[13.5px] text-[var(--ink-mute)] mt-1.5">
            AI media buyer для малого бизнеса
          </p>
        </div>

        <div
          className="rounded-[16px] border border-[var(--border)] bg-card p-7 shadow-[0_1px_3px_rgba(31,29,26,0.04)]"
        >
          <h2 className="font-heading text-[18px] font-bold tracking-[-0.018em] mb-1.5">
            Войти через Telegram
          </h2>
          <p className="text-[12.5px] text-[var(--ink-mute)] leading-relaxed mb-5">
            Авторизуйся через свой Telegram-аккаунт — никаких паролей. После входа подключишь Meta/Google рекламные кабинеты в одном клике.
          </p>

          {!emailMode && (
            <>
              {/* Social — Google + Facebook (shown only when their NEXT_PUBLIC_* env is set) */}
              <div className="flex flex-col gap-2.5 mb-3">
                <GoogleLoginButton
                  next={next}
                  onStart={() => { setBusy(true); setError(null); }}
                  onDone={() => setBusy(false)}
                  onError={(m) => { setError(m); setBusy(false); }}
                />
                <MetaLoginButton
                  next={next}
                  onStart={() => { setBusy(true); setError(null); }}
                  onDone={() => setBusy(false)}
                  onError={(m) => { setError(m); setBusy(false); }}
                />
              </div>
              <div ref={widgetSlot} className="flex justify-center" />
            </>
          )}

          {emailMode && (
            <div className="space-y-3">
              <div>
                <label className="text-[12px] font-medium text-[var(--ink-mute)] block mb-1">Email</label>
                <input
                  type="email"
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && emailSubmit()}
                  placeholder="you@example.com"
                  className="w-full px-3 py-2 rounded-md border border-[var(--border)] bg-[var(--card-soft)] text-[14px] text-[var(--ink)] outline-none focus:border-[var(--peach)]"
                />
              </div>
              <div>
                <label className="text-[12px] font-medium text-[var(--ink-mute)] block mb-1">Имя (опционально)</label>
                <input
                  type="text"
                  value={emailName}
                  onChange={(e) => setEmailName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && emailSubmit()}
                  placeholder="Как тебя называть"
                  className="w-full px-3 py-2 rounded-md border border-[var(--border)] bg-[var(--card-soft)] text-[14px] text-[var(--ink)] outline-none focus:border-[var(--peach)]"
                />
              </div>
              <button
                onClick={emailSubmit}
                disabled={busy || !email.trim()}
                className="w-full py-2.5 rounded-md text-[14px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50 inline-flex items-center justify-center gap-2"
                style={{ background: "var(--peach)" }}
              >
                {busy && <Loader2 className="size-4 animate-spin" />}
                Войти / создать аккаунт
              </button>
            </div>
          )}

          <div className="my-4 flex items-center gap-2.5 text-[11px] text-[var(--ink-subtle)]">
            <div className="flex-1 h-px bg-[var(--border)]" />
            или
            <div className="flex-1 h-px bg-[var(--border)]" />
          </div>

          <button
            onClick={() => { setEmailMode((v) => !v); setError(null); }}
            className="w-full py-2 rounded-md text-[13px] font-medium border border-[var(--border)] bg-card text-[var(--ink)] hover:bg-[var(--card-soft)] transition-colors"
          >
            {emailMode ? "Войти через Telegram" : "Войти через email"}
          </button>

          {busy && !emailMode && (
            <div className="flex items-center justify-center gap-2 mt-4 text-[13px] text-[var(--ink-mute)]">
              <Loader2 className="size-4 animate-spin" />
              Создаём сессию…
            </div>
          )}

          {error && (
            <div className="mt-4 px-3 py-2.5 rounded-md bg-[#F8DDD0] border border-[#E9C4B5] text-[12.5px] text-[var(--destructive)]">
              {error}
            </div>
          )}
        </div>

        <p className="text-[11px] text-[var(--ink-subtle)] text-center mt-4 leading-relaxed">
          Нажимая «Log in with Telegram» ты соглашаешься на передачу нам публичных данных профиля (id, имя, юзернейм, аватар). Мы не запрашиваем доступ к сообщениям.
        </p>
      </div>
    </div>
  );
}
