"use client";

/**
 * Linked-accounts panel for /settings → "Логин".
 *
 * Lists the user's existing identities (Telegram / Google / Meta / Email)
 * and lets them add more or unlink. Adding a new identity is just our
 * existing social login buttons reused in "link" mode — the backend's
 * upsert_login() detects that there's already a session JWT and merges
 * the new identity into the current user.
 */

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Trash2, Mail } from "lucide-react";
import { tgBridge, type Identity, type IdentityProvider } from "@/lib/tg-bridge";
import { MetaGlyph, GoogleGlyph } from "@/components/platform-badge";
import { GoogleLoginButton } from "@/components/social-login";

const PROVIDER_META: Record<string, { label: string; icon: React.ReactNode }> = {
  telegram: {
    label: "Telegram",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="#229ED9" aria-hidden>
        <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z" />
      </svg>
    ),
  },
  google: { label: "Google", icon: <GoogleGlyph size={20} /> },
  meta: { label: "Facebook", icon: <MetaGlyph size={20} /> },
  email: { label: "Email", icon: <Mail className="size-5 text-[var(--ink-mute)]" /> },
};

export function LinkedIdentitiesBlock() {
  const [items, setItems] = useState<Identity[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<number | null>(null);
  const [linking, setLinking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = async () => {
    try {
      const list = await tgBridge.identities();
      setItems(list);
    } catch (e) {
      console.error(e);
      toast.error("Не удалось загрузить список");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
  }, []);

  async function onUnlink(id: number) {
    setBusy(id);
    try {
      await tgBridge.unlinkIdentity(id);
      toast.success("Отвязано");
      await reload();
    } catch (e: unknown) {
      console.error(e);
      const msg = e instanceof Error ? e.message : "Не удалось отвязать";
      toast.error(msg);
    } finally {
      setBusy(null);
    }
  }

  const haveProvider = (p: IdentityProvider) =>
    (items ?? []).some((i) => i.provider === p);

  return (
    <section className="rounded-[14px] border border-[var(--border)] bg-card p-5">
      <div className="mb-3.5">
        <h2 className="font-heading text-[18px] font-bold tracking-[-0.018em] text-[var(--ink)]">
          Подключенные аккаунты
        </h2>
        <p className="text-[12.5px] text-[var(--ink-mute)] mt-1 leading-relaxed">
          Несколько способов войти в один и тот же аккаунт UniAds. Можно подключить Telegram + Google + Email — все будут вести в одну сессию.
        </p>
      </div>

      {loading ? (
        <div className="text-[12.5px] text-[var(--ink-subtle)]">…</div>
      ) : (
        <div className="flex flex-col gap-2">
          {(items ?? []).map((i) => {
            const meta = PROVIDER_META[i.provider] || { label: i.provider, icon: null };
            return (
              <div
                key={i.id}
                className="flex items-center gap-3 px-3 py-2.5 rounded-[10px] border border-[var(--border)]"
                style={{ background: "var(--card-soft)" }}
              >
                <div className="size-9 rounded-full bg-white flex items-center justify-center shrink-0">
                  {meta.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium text-[var(--ink)] truncate">
                    {meta.label}
                  </div>
                  <div className="font-mono text-[11px] text-[var(--ink-subtle)] truncate">
                    {i.display_name || i.provider_uid}
                    {i.last_login_at && (
                      <>
                        {" · "}был {timeAgo(i.last_login_at)}
                      </>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => onUnlink(i.id)}
                  disabled={busy === i.id || (items?.length ?? 0) <= 1}
                  title={
                    (items?.length ?? 0) <= 1
                      ? "Это единственный способ входа — добавь другой, прежде чем отвязать"
                      : "Отвязать"
                  }
                  className="px-2 py-1 rounded-md border border-[var(--border)] text-[var(--ink-subtle)] hover:text-[var(--destructive)] hover:bg-[#F8DDD0] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {busy === i.id ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Add new provider — only show buttons for providers not yet linked */}
      <div className="mt-4 pt-4 border-t border-[var(--border)]">
        <div className="text-[11.5px] font-mono uppercase tracking-[0.08em] text-[var(--ink-subtle)] mb-2.5">
          Добавить ещё способ входа
        </div>
        {error && (
          <div className="mb-3 px-3 py-2 rounded-md text-[12px] bg-[#F8DDD0] border border-[#E9C4B5] text-[var(--destructive)]">
            {error}
          </div>
        )}
        <div className="flex flex-col gap-2.5 max-w-[320px]">
          {!haveProvider("google") && (
            <GoogleLoginButton
              next="/settings"
              onStart={() => { setLinking(true); setError(null); }}
              onError={(m) => { setError(m); setLinking(false); }}
              onDone={async () => { setLinking(false); await reload(); }}
            />
          )}
          {/* Meta linking removed 2026-07-06 — Meta migrated the app
              to 'Facebook Login for Business' which doesn't ship
              email/public_profile in the classic scope shape. Ads
              OAuth via /accounts still works. */}
          {!haveProvider("telegram") && (
            <a
              href="/accounts"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-[13.5px] font-medium border border-[var(--border)] bg-card text-[var(--ink)] hover:bg-[var(--card-soft)] transition-colors"
            >
              {PROVIDER_META.telegram.icon}
              Привязать Telegram
            </a>
          )}
          {linking && (
            <div className="flex items-center gap-2 text-[12.5px] text-[var(--ink-mute)]">
              <Loader2 className="size-3.5 animate-spin" />
              Связываем…
            </div>
          )}
          {haveProvider("google") && haveProvider("meta") && haveProvider("telegram") && (
            <p className="text-[12px] text-[var(--ink-subtle)] italic">
              Все способы входа уже привязаны.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

function timeAgo(iso: string): string {
  const d = new Date(iso);
  const diffMin = Math.floor((Date.now() - d.getTime()) / 60000);
  if (diffMin < 1) return "только что";
  if (diffMin < 60) return `${diffMin} мин назад`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH} ч назад`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 30) return `${diffD} д назад`;
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}
