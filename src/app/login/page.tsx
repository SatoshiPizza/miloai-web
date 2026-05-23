"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Sparkles, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { saveSession, getSessionToken } from "@/lib/session";
import { config } from "@/lib/config";

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

          <div ref={widgetSlot} className="flex justify-center" />

          {busy && (
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
