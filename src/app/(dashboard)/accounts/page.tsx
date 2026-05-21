"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MessageCircle, Megaphone, Globe, Copy, Check, ExternalLink, Loader2, Unplug,
} from "lucide-react";
import { tgBridge, type Me, type PairStart, type AccountsResponse } from "@/lib/tg-bridge";
import { toast } from "sonner";

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

  // Poll /me every 3s after a pair token is shown, so the UI flips to "paired"
  // automatically once the user clicks /start in Telegram.
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

  // After OAuth opens in new tab, poll /ad-accounts every 4s until the new
  // platform appears — then close the spinner and toast.
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
    // Stop polling after 5 minutes — user probably bailed.
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

  const metaConnected = accounts?.has_meta ?? false;
  const googleConnected = accounts?.has_google ?? false;
  const metaCount = accounts?.accounts.filter((a) => a.platform === "meta").length ?? 0;
  const googleCount = accounts?.accounts.filter((a) => a.platform === "google").length ?? 0;

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

  return (
    <div className="p-8 space-y-6 max-w-3xl">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Подключения</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Telegram-bridge и рекламные аккаунты.
        </p>
      </header>

      {/* ── Telegram bridge — the killer feature ───────────── */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <MessageCircle className="size-4" /> Telegram
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Управляй ботом с телефона — голосовые, push, быстрые действия.
                Чат синхронизируется с вебом в обе стороны.
              </p>
            </div>
            {loadingMe ? (
              <Badge variant="outline">…</Badge>
            ) : me?.has_telegram_paired ? (
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-200 dark:border-emerald-900">
                ✓ подключено{me.telegram_username ? ` · @${me.telegram_username}` : ""}
              </Badge>
            ) : (
              <Badge variant="outline">не подключено</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {!me && !loadingMe && (
            <div className="rounded-md bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 px-3 py-2 text-xs text-amber-800 dark:text-amber-200">
              Не нашли web-юзера. Добавь <code>NEXT_PUBLIC_DEV_USER_ID</code>{" "}
              в <code>.env.local</code> и перезапусти dev сервер.
            </div>
          )}

          {me?.has_telegram_paired ? (
            <div className="text-sm text-muted-foreground">
              Открой Telegram → @miloailevbot. Любое сообщение увидишь в{" "}
              <a href="/chat" className="underline text-foreground">/chat</a>.
            </div>
          ) : pair ? (
            <div className="space-y-3">
              <div className="text-xs text-muted-foreground">
                Открой эту ссылку с телефона (или скопируй и пришли себе в TG):
              </div>
              <div className="flex gap-2">
                <code className="flex-1 bg-muted px-3 py-2 rounded text-xs break-all">
                  {pair.deep_link}
                </code>
                <Button variant="outline" size="icon" onClick={copyLink}>
                  {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => window.open(pair.deep_link, "_blank", "noopener,noreferrer")}
                >
                  <ExternalLink className="size-4" />
                </Button>
              </div>
              <div className="text-xs text-muted-foreground">
                Ссылка живёт 24ч. Жду подключения…
              </div>
            </div>
          ) : (
            <Button
              className="w-full"
              onClick={startPair}
              disabled={generating || !me}
            >
              {generating ? "Генерю токен..." : "🔗 Подключить Telegram"}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Meta */}
      <PlatformCard
        platform="meta"
        icon={Megaphone}
        label="Meta Ads"
        description="Facebook + Instagram. OAuth даёт доступ ко всем аккаунтам в Business Manager."
        connected={metaConnected}
        accountCount={metaCount}
        oauthLoading={oauthLoading === "meta"}
        waiting={waitingForOauth === "meta"}
        onConnect={() => connectPlatform("meta")}
        onDisconnect={() => disconnectPlatform("meta")}
      />

      {/* Google */}
      <PlatformCard
        platform="google"
        icon={Globe}
        label="Google Ads"
        description="Search-кампании и Performance Max. Требует Manager Account (MCC) + одобренный developer-token."
        connected={googleConnected}
        accountCount={googleCount}
        oauthLoading={oauthLoading === "google"}
        waiting={waitingForOauth === "google"}
        onConnect={() => connectPlatform("google")}
        onDisconnect={() => disconnectPlatform("google")}
      />
    </div>
  );
}


function PlatformCard({
  icon: Icon, label, description, connected, accountCount,
  oauthLoading, waiting, onConnect, onDisconnect,
}: {
  platform: "meta" | "google";
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  description: string;
  connected: boolean;
  accountCount: number;
  oauthLoading: boolean;
  waiting: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Icon className="size-4" strokeWidth={1.6} /> {label}
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          </div>
          {connected ? (
            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-200 dark:border-emerald-900">
              ✓ {accountCount} аккаунт{accountCount === 1 ? "" : accountCount < 5 ? "а" : "ов"}
            </Badge>
          ) : (
            <Badge variant="outline">не подключено</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {connected ? (
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={onConnect} disabled={oauthLoading}>
              {oauthLoading ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
              🔄 Переподключить
            </Button>
            <Button variant="outline" onClick={onDisconnect}>
              <Unplug className="size-4" />
            </Button>
          </div>
        ) : waiting ? (
          <Button disabled className="w-full">
            <Loader2 className="size-4 animate-spin mr-2" />
            Жду подтверждения в новой вкладке...
          </Button>
        ) : (
          <Button className="w-full" onClick={onConnect} disabled={oauthLoading}>
            {oauthLoading ? (
              <><Loader2 className="size-4 animate-spin mr-2" /> Получаю ссылку...</>
            ) : (
              <>🔗 Подключить через OAuth</>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
