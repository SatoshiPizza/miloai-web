"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Copy, Check, ExternalLink, Loader2, Unplug, RotateCw, Settings as SettingsIcon,
  UserPlus, Sparkles,
} from "lucide-react";
import { MetaGlyph, GoogleGlyph } from "@/components/platform-badge";
import { tgBridge, type Me, type PairStart, type AccountsResponse } from "@/lib/tg-bridge";
import { toast } from "sonner";

/**
 * Accounts — design handoff iter-2 §screen-extras ACCOUNTS.
 *
 * TG hero card (peach gradient, sync stats, KILLER badge), platform cards
 * (Meta + Google) with health pills, Team section.
 */

export default function AccountsPage() {
  const [me, setMe] = useState<Me | null>(null);
  const [loadingMe, setLoadingMe] = useState(true);
  const [pair, setPair] = useState<PairStart | null>(null);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const [accounts, setAccounts] = useState<AccountsResponse | null>(null);
  const [oauthLoading, setOauthLoading] = useState<"meta" | "google" | null>(null);
  const [waitingForOauth, setWaitingForOauth] = useState<"meta" | "google" | null>(null);

  useEffect(() => {
    Promise.all([tgBridge.me(), tgBridge.adAccounts()])
      .then(([m, a]) => {
        setMe(m);
        setAccounts(a);
      })
      .catch((e) => console.warn("Could not load profile — set NEXT_PUBLIC_DEV_USER_ID", e))
      .finally(() => setLoadingMe(false));
  }, []);

  useEffect(() => {
    if (!pair || me?.has_telegram_paired) return;
    const t = setInterval(() => {
      tgBridge.me().then((updated) => {
        setMe(updated);
        if (updated.has_telegram_paired) {
          setPair(null);
          toast.success("Telegram подключён! Чат теперь live.");
        }
      }).catch(() => {});
    }, 3000);
    return () => clearInterval(t);
  }, [pair, me?.has_telegram_paired]);

  useEffect(() => {
    if (!waitingForOauth) return;
    const t = setInterval(() => {
      tgBridge.adAccounts().then((a) => {
        const wasConnected = waitingForOauth === "meta" ? accounts?.has_meta : accounts?.has_google;
        const nowConnected = waitingForOauth === "meta" ? a.has_meta : a.has_google;
        setAccounts(a);
        if (!wasConnected && nowConnected) {
          toast.success(`${waitingForOauth === "meta" ? "Meta Ads" : "Google Ads"} подключён!`);
          setWaitingForOauth(null);
        }
      }).catch(() => {});
    }, 4000);
    const stop = setTimeout(() => setWaitingForOauth(null), 5 * 60 * 1000);
    return () => { clearInterval(t); clearTimeout(stop); };
  }, [waitingForOauth, accounts?.has_meta, accounts?.has_google]);

  async function connectPlatform(platform: "meta" | "google") {
    setOauthLoading(platform);
    try {
      const { url } = platform === "meta"
        ? await tgBridge.metaOauthUrl()
        : await tgBridge.googleOauthUrl();
      window.open(url, "_blank", "noopener,noreferrer");
      setWaitingForOauth(platform);
      toast.info("OAuth открыт в новой вкладке. Жду подтверждения...");
    } catch (e) {
      console.error(e);
      toast.error("Не удалось получить OAuth-ссылку. Backend на :8000?");
    } finally {
      setOauthLoading(null);
    }
  }

  async function disconnectPlatform(platform: "meta" | "google") {
    if (!confirm(`Отключить ${platform === "meta" ? "Meta" : "Google"} Ads? Все ad-аккаунты этой платформы станут неактивными (данные сохранятся).`)) return;
    try {
      await tgBridge.disconnectPlatform(platform);
      const a = await tgBridge.adAccounts();
      setAccounts(a);
      toast.success(`${platform === "meta" ? "Meta" : "Google"} отключён`);
    } catch (e) {
      console.error(e);
      toast.error("Не удалось отключить");
    }
  }

  async function startPair() {
    setGenerating(true);
    try {
      const result = await tgBridge.startPair();
      setPair(result);
    } catch (e) {
      toast.error("Не удалось создать pair-токен. Backend на :8000?");
      console.error(e);
    } finally {
      setGenerating(false);
    }
  }

  function copyLink() {
    if (!pair) return;
    navigator.clipboard.writeText(pair.deep_link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  const metaConnected = accounts?.has_meta ?? false;
  const googleConnected = accounts?.has_google ?? false;
  const metaAccounts = accounts?.accounts.filter((a) => a.platform === "meta") ?? [];
  const googleAccounts = accounts?.accounts.filter((a) => a.platform === "google") ?? [];

  return (
    <div className="p-7 max-w-[860px]">
      <header className="mb-5">
        <h1 className="font-heading text-[28px] font-bold leading-none tracking-[-0.025em]">
          Аккаунты &amp; интеграции
        </h1>
        <p className="text-[13.5px] text-[var(--ink-mute)] mt-1.5">
          Telegram-мост + рекламные платформы. Все OAuth-токены хранятся зашифрованно.
        </p>
      </header>

      {/* TG hero card */}
      <TelegramHero
        me={me}
        loading={loadingMe}
        pair={pair}
        generating={generating}
        copied={copied}
        onStartPair={startPair}
        onCopyLink={copyLink}
      />

      <div className="h-3.5" />

      {/* Meta */}
      <AdAccountCard
        platform="meta"
        connected={metaConnected}
        accounts={metaAccounts.map((a) => a.account_name ?? a.platform_account_id)}
        oauthLoading={oauthLoading === "meta"}
        waiting={waitingForOauth === "meta"}
        onConnect={() => connectPlatform("meta")}
        onDisconnect={() => disconnectPlatform("meta")}
      />

      <div className="h-3.5" />

      {/* Google */}
      <AdAccountCard
        platform="google"
        connected={googleConnected}
        accounts={googleAccounts.map((a) => a.account_name ?? a.platform_account_id)}
        oauthLoading={oauthLoading === "google"}
        waiting={waitingForOauth === "google"}
        onConnect={() => connectPlatform("google")}
        onDisconnect={() => disconnectPlatform("google")}
      />

      {/* Team */}
      <div className="mt-7 mb-3.5">
        <div className="font-mono text-[10.5px] uppercase tracking-[0.1em] font-semibold text-[var(--ink-subtle)]">
          КОМАНДА
        </div>
      </div>
      <TeamCard me={me} />
    </div>
  );
}


// ═════════════════════════════════════════════════════════════════════════════
// Telegram hero card (peach gradient)
// ═════════════════════════════════════════════════════════════════════════════

function TelegramHero({
  me, loading, pair, generating, copied, onStartPair, onCopyLink,
}: {
  me: Me | null;
  loading: boolean;
  pair: PairStart | null;
  generating: boolean;
  copied: boolean;
  onStartPair: () => void;
  onCopyLink: () => void;
}) {
  const paired = me?.has_telegram_paired ?? false;

  return (
    <div
      className="rounded-[14px] border p-5 relative"
      style={{ background: "linear-gradient(135deg, #FCF1E8 0%, #F8E8D9 100%)", borderColor: "#F5DDC8" }}
    >
      <div className="flex items-start gap-3.5">
        {/* Logo block */}
        <div
          className="size-12 rounded-[12px] bg-white flex items-center justify-center shrink-0"
          style={{ boxShadow: "0 4px 14px -4px rgba(232,149,108,0.5)" }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="#229ED9" aria-hidden>
            <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z" />
          </svg>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2.5 mb-1">
            <span className="font-heading text-[19px] font-bold tracking-[-0.018em] text-[var(--ink)]">
              Telegram
            </span>
            {loading ? (
              <Skeleton className="h-5 w-32" />
            ) : paired ? (
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white font-mono text-[10px] font-semibold uppercase"
                style={{ color: "#456838", letterSpacing: "0.04em" }}
              >
                <span className="size-1.5 rounded-full" style={{ background: "var(--sage)" }} />
                Подключено{me?.telegram_username ? ` · @${me.telegram_username}` : ""}
              </span>
            ) : (
              <span
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/70 font-mono text-[10px] font-semibold uppercase text-[var(--ink-mute)]"
                style={{ letterSpacing: "0.04em" }}
              >
                Не подключено
              </span>
            )}
            <span
              className="px-2.5 py-0.5 rounded-full font-mono text-[9.5px] font-bold text-white uppercase"
              style={{ background: "var(--peach)", letterSpacing: "0.05em" }}
            >
              KILLER
            </span>
          </div>
          <p
            className="text-[13px] text-[var(--peach-ink)]/80 leading-relaxed tracking-[-0.005em]"
          >
            Голосовые с телефона → автоматически распознаются и применяются. Каждое действие в браузере — летит ответом в чат.
          </p>

          {/* Pairing UI */}
          {paired ? (
            <div className="mt-3 text-[12.5px] text-[var(--peach-ink)]/75">
              Открой Telegram → бот. Сообщения и голосовые увидишь в{" "}
              <a href="/chat" className="underline font-medium" style={{ color: "var(--peach-deep)" }}>
                /chat
              </a>.
            </div>
          ) : pair ? (
            <div className="mt-3 space-y-2">
              <div className="text-[11.5px] text-[var(--peach-ink)]/75">
                Открой эту ссылку с телефона (или скопируй и пришли себе в TG):
              </div>
              <div className="flex gap-1.5">
                <code
                  className="flex-1 px-3 py-2 rounded text-[11px] break-all"
                  style={{ background: "rgba(255,255,255,0.7)", color: "var(--ink)" }}
                >
                  {pair.deep_link}
                </code>
                <button
                  onClick={onCopyLink}
                  className="size-9 rounded-md border border-[var(--peach-soft)] bg-white flex items-center justify-center hover:bg-[var(--peach-wash)] transition-colors"
                  aria-label="Copy"
                >
                  {copied ? <Check className="size-4 text-[var(--sage)]" /> : <Copy className="size-4 text-[var(--peach-deep)]" />}
                </button>
                <button
                  onClick={() => window.open(pair.deep_link, "_blank", "noopener,noreferrer")}
                  className="size-9 rounded-md border border-[var(--peach-soft)] bg-white flex items-center justify-center hover:bg-[var(--peach-wash)] transition-colors"
                  aria-label="Open"
                >
                  <ExternalLink className="size-4 text-[var(--peach-deep)]" />
                </button>
              </div>
              <div className="text-[11px] text-[var(--peach-ink)]/60">
                Ссылка живёт 24ч. Жду подключения…
              </div>
            </div>
          ) : (
            <Button
              onClick={onStartPair}
              disabled={generating || !me}
              className="mt-3.5"
              size="sm"
            >
              <Sparkles className="size-3.5 mr-1.5" />
              {generating ? "Генерю токен..." : "Подключить Telegram"}
            </Button>
          )}
        </div>

        {/* Open bot button — only when paired */}
        {paired && (
          <a
            href={`https://t.me/${process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME ?? "miloailevbot"}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-1.5 rounded-[9px] text-[12.5px] font-medium text-[var(--ink)] bg-white border border-[var(--border)] hover:bg-[var(--card-soft)] transition-colors shrink-0"
          >
            Открыть бота →
          </a>
        )}
      </div>
    </div>
  );
}


// ═════════════════════════════════════════════════════════════════════════════
// Ad account card
// ═════════════════════════════════════════════════════════════════════════════

function AdAccountCard({
  platform, connected, accounts, oauthLoading, waiting, onConnect, onDisconnect,
}: {
  platform: "meta" | "google";
  connected: boolean;
  accounts: string[];
  oauthLoading: boolean;
  waiting: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}) {
  const isMeta = platform === "meta";
  const Glyph = isMeta ? MetaGlyph : GoogleGlyph;
  const platformInk = isMeta ? "var(--meta-ink)" : "var(--google-ink)";
  const label = isMeta ? "Meta Ads" : "Google Ads";
  const description = isMeta
    ? "Facebook + Instagram · OAuth даёт доступ ко всем аккаунтам в Business Manager."
    : "Search + Performance Max · требует Manager Account (MCC) + одобренный developer-token.";

  return (
    <div className="rounded-[14px] border border-[var(--border)] bg-card p-[18px] flex items-start gap-3.5">
      <div className="size-12 rounded-[12px] bg-white border border-[var(--border)] flex items-center justify-center shrink-0">
        <Glyph size={22} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2.5 mb-1">
          <span
            className="font-heading text-[17px] font-bold tracking-[-0.018em]"
            style={{ color: platformInk }}
          >
            {label}
          </span>
          {connected ? (
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-mono text-[9.5px] font-semibold uppercase"
              style={{ background: "var(--sage-soft)", color: "#456838", letterSpacing: "0.04em" }}
            >
              <span className="size-1 rounded-full" style={{ background: "var(--sage)" }} />
              Подключено
            </span>
          ) : (
            <span
              className="px-2 py-0.5 rounded-full font-mono text-[9.5px] font-semibold uppercase"
              style={{ background: "var(--card-soft)", color: "var(--ink-mute)", letterSpacing: "0.04em" }}
            >
              Не подключено
            </span>
          )}
        </div>
        {connected && accounts.length > 0 && (
          <div className="font-mono text-[12.5px] text-[var(--ink)] mt-1 truncate">
            {accounts.length === 1 ? accounts[0] : `${accounts[0]} +${accounts.length - 1}`}
          </div>
        )}
        <p className="text-[12.5px] text-[var(--ink-mute)] leading-relaxed mt-1 tracking-[-0.005em]">
          {description}
        </p>
      </div>

      <div className="flex gap-1.5 shrink-0">
        {connected ? (
          <>
            <button
              onClick={onConnect}
              disabled={oauthLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-[12px] font-medium text-[var(--ink-mute)] border border-[var(--border)] bg-transparent hover:bg-[var(--card-soft)] transition-colors disabled:opacity-50"
            >
              {oauthLoading ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <RotateCw className="size-3.5" />
              )}
              Переподключить
            </button>
            <button
              onClick={onDisconnect}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-[12px] font-medium text-[var(--destructive)] border bg-transparent hover:bg-[#F8DDD0] transition-colors"
              style={{ borderColor: "#E9C4B5" }}
            >
              <Unplug className="size-3.5" />
              Отвязать
            </button>
          </>
        ) : waiting ? (
          <button
            disabled
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-[12px] font-medium text-[var(--ink-mute)] border border-[var(--border)] opacity-80"
          >
            <Loader2 className="size-3.5 animate-spin" />
            Жду подтверждения…
          </button>
        ) : (
          <button
            onClick={onConnect}
            disabled={oauthLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-[12px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ background: "var(--peach)" }}
          >
            {oauthLoading ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Sparkles className="size-3.5" />
            )}
            Подключить
          </button>
        )}
      </div>
    </div>
  );
}


// ═════════════════════════════════════════════════════════════════════════════
// Team card
// ═════════════════════════════════════════════════════════════════════════════

function TeamCard({ me }: { me: Me | null }) {
  const owner = me
    ? {
        name: me.business_name || me.first_name || "Owner",
        email: me.telegram_username ? `@${me.telegram_username}` : "—",
        role: "Owner" as const,
        initials: ((me.first_name || me.business_name || "VK")
          .trim()
          .split(/\s+/)
          .map((p) => p[0])
          .slice(0, 2)
          .join("") || "OW").toUpperCase(),
      }
    : null;

  return (
    <div className="rounded-[14px] border border-[var(--border)] bg-card overflow-hidden">
      <div className="px-[18px] py-3.5 border-b border-[var(--border)] flex items-center">
        <div className="text-[14px] font-semibold text-[var(--ink)]">
          {owner ? "1 участник" : "—"}
        </div>
        <div className="flex-1" />
        <button
          disabled
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-[12px] font-medium text-white disabled:opacity-70"
          style={{ background: "var(--ink)" }}
          title="Скоро: приглашение членов команды"
        >
          <UserPlus className="size-3.5" />
          Пригласить
        </button>
      </div>
      {owner ? (
        <div className="px-[18px] py-3 flex items-center gap-3">
          <div
            className="size-9 rounded-full flex items-center justify-center text-white text-[12px] font-semibold"
            style={{ background: "linear-gradient(135deg, var(--peach), var(--peach-deep))" }}
          >
            {owner.initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[14px] font-medium text-[var(--ink)] truncate">{owner.name}</div>
            <div className="font-mono text-[11px] text-[var(--ink-subtle)] truncate">{owner.email}</div>
          </div>
          <span
            className="px-2 py-0.5 rounded-full font-mono text-[10px] font-semibold uppercase"
            style={{ background: "var(--peach-wash)", color: "var(--peach-deep)", letterSpacing: "0.04em" }}
          >
            {owner.role}
          </span>
          <button disabled className="ml-1 p-1.5 rounded text-[var(--ink-subtle)] opacity-40">
            <SettingsIcon className="size-3.5" />
          </button>
        </div>
      ) : (
        <div className="px-[18px] py-5 text-[12.5px] text-[var(--ink-mute)] text-center">
          Не нашли web-юзера. Добавь NEXT_PUBLIC_DEV_USER_ID в .env.local.
        </div>
      )}
    </div>
  );
}
