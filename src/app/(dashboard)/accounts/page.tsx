"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Megaphone, Globe, Copy, Check, ExternalLink } from "lucide-react";
import { tgBridge, type Me, type PairStart } from "@/lib/tg-bridge";
import { toast } from "sonner";

export default function AccountsPage() {
  const [me, setMe] = useState<Me | null>(null);
  const [loadingMe, setLoadingMe] = useState(true);
  const [pair, setPair] = useState<PairStart | null>(null);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    tgBridge.me()
      .then(setMe)
      .catch((e) => console.warn("Could not load /me — set NEXT_PUBLIC_DEV_USER_ID in .env.local", e))
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
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Megaphone className="size-4" /> Meta Ads
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Facebook + Instagram. OAuth даёт доступ ко всем аккаунтам в Business Manager.
              </p>
            </div>
            <Badge variant="outline">не подключено</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Button disabled className="w-full">
            🔗 Подключить через Meta OAuth (скоро)
          </Button>
        </CardContent>
      </Card>

      {/* Google */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Globe className="size-4" /> Google Ads
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Search-кампании и Performance Max. Требует Manager Account (MCC).
              </p>
            </div>
            <Badge variant="outline">не подключено</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Button disabled className="w-full">
            🔗 Подключить через Google OAuth (скоро)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
