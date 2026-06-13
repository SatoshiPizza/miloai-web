"use client";

/**
 * Step 2 — Connect ad cabinets.
 *
 * Reference: `screen-onboarding.jsx::OnbStep2`.
 *
 * Two cards (Meta + Google). Each:
 *   • Not connected → "Подключить" → opens OAuth in a new tab, then polls
 *     /api/web/ad-accounts every 3s until the platform reports `has_*=true`.
 *   • Connected → green check + account name + "Отключить".
 *
 * Per design rationale: cabinets connect BEFORE the Step 3 analysis so AI
 * can import existing campaigns / pixel history. If the user opts out via
 * "Сделать позже", we still advance — Step 3 will run scrape-only and
 * Step 6 falls back to the empty starting-plan variant.
 *
 * OnbAccountSelect modal (BM with >1 ad account → pick one) is intentionally
 * deferred — backend already pins meta_ad_account_id / google_ad_account_id
 * on the Business, the UI just doesn't expose the picker yet. First user
 * with a >1-account BM is the trigger to build that modal.
 */

import { useEffect, useRef, useState } from "react";
import { ArrowRight, ArrowLeft, Check, Loader2, Plug, ExternalLink } from "lucide-react";

import { OnbFrame } from "./onb-frame";
import { tgBridge, type AccountsResponse } from "@/lib/tg-bridge";
import { MetaGlyph, GoogleGlyph } from "@/components/platform-badge";
import { toast } from "sonner";

type Platform = "meta" | "google";

export function Step2Cabinets({
  onBack,
  onNext,
}: {
  onBack: () => void;
  onNext: (skipped: boolean) => void;
}) {
  const [accounts, setAccounts] = useState<AccountsResponse | null>(null);
  const [oauthLoading, setOauthLoading] = useState<Platform | null>(null);
  const [waiting, setWaiting] = useState<Platform | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Initial load.
  useEffect(() => {
    tgBridge.adAccounts().then(setAccounts).catch(() => setAccounts(null));
  }, []);

  // Poll while waiting for OAuth.
  useEffect(() => {
    if (!waiting) return;
    const t = setInterval(async () => {
      try {
        const a = await tgBridge.adAccounts();
        const wasConnected = waiting === "meta" ? accounts?.has_meta : accounts?.has_google;
        const nowConnected = waiting === "meta" ? a.has_meta : a.has_google;
        setAccounts(a);
        if (!wasConnected && nowConnected) {
          toast.success(`${waiting === "meta" ? "Meta Ads" : "Google Ads"} подключён`);
          setWaiting(null);
        }
      } catch {
        // ignore — next tick will retry
      }
    }, 3000);
    pollRef.current = t;
    // 5-min watchdog
    const stop = setTimeout(() => setWaiting(null), 5 * 60 * 1000);
    return () => {
      clearInterval(t);
      clearTimeout(stop);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [waiting]);

  async function connect(p: Platform) {
    setOauthLoading(p);
    try {
      const { url } =
        p === "meta"
          ? await tgBridge.metaOauthUrl()
          : await tgBridge.googleOauthUrl();
      window.open(url, "_blank", "noopener,noreferrer");
      setWaiting(p);
      toast.info("OAuth открыт в новой вкладке — подтверди доступ");
    } catch {
      toast.error("Не удалось получить OAuth-ссылку");
    } finally {
      setOauthLoading(null);
    }
  }

  const metaConnected = !!accounts?.has_meta;
  const googleConnected = !!accounts?.has_google;
  const anyConnected = metaConnected || googleConnected;

  return (
    <OnbFrame stepIdx={1}>
      <div className="w-full max-w-[760px]">
        <div className="mb-6 text-center">
          <div
            className="mb-4 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.06em]"
            style={{
              background: "var(--peach-wash)",
              border: "1px solid var(--peach-soft)",
              color: "var(--peach-deep)",
            }}
          >
            <Plug className="size-3.5" />
            Рекламные кабинеты
          </div>
          <h1 className="font-heading text-[32px] sm:text-[36px] font-bold leading-[1.1] tracking-[-0.03em]">
            Подключи Meta и Google
          </h1>
          <p className="mt-3 text-[14.5px] leading-relaxed text-[var(--ink-mute)]">
            До анализа: AI увидит твои текущие кампании, посчитает CPL,
            импортирует креативы. Без них — Step 3 пройдёт по сайту и
            запустимся с нуля.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <CabinetCard
            platform="meta"
            label="Meta Ads"
            sub="Pages · Pixel · ad accounts"
            connected={metaConnected}
            accountName={
              accounts?.accounts.find((a) => a.platform === "meta")?.account_name ?? null
            }
            loading={oauthLoading === "meta"}
            waiting={waiting === "meta"}
            onConnect={() => connect("meta")}
          />
          <CabinetCard
            platform="google"
            label="Google Ads"
            sub="Search · Display · Performance Max"
            connected={googleConnected}
            accountName={
              accounts?.accounts.find((a) => a.platform === "google")?.account_name ?? null
            }
            loading={oauthLoading === "google"}
            waiting={waiting === "google"}
            onConnect={() => connect("google")}
          />
        </div>

        {/* Nav */}
        <div className="mt-7 flex items-center justify-between">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-[10px] px-4 py-2.5 text-[13.5px] text-[var(--ink-mute)] hover:text-[var(--ink)] transition-colors"
          >
            <ArrowLeft className="size-[14px]" strokeWidth={2} />
            Назад
          </button>
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => onNext(true)}
              className="rounded-[10px] px-4 py-2.5 text-[13.5px] text-[var(--ink-mute)] hover:text-[var(--ink)] transition-colors"
            >
              Сделать позже
            </button>
            <button
              onClick={() => onNext(false)}
              className="inline-flex items-center gap-2.5 rounded-[11px] px-8 py-3 text-[14.5px] font-medium text-white transition-opacity hover:opacity-90"
              style={{
                background: "var(--peach)",
                boxShadow: "0 6px 18px -6px rgba(232,149,108,0.55)",
              }}
            >
              {anyConnected ? "Дальше · анализ" : "Дальше"}
              <ArrowRight className="size-[14px]" strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>
    </OnbFrame>
  );
}


function CabinetCard({
  platform,
  label,
  sub,
  connected,
  accountName,
  loading,
  waiting,
  onConnect,
}: {
  platform: Platform;
  label: string;
  sub: string;
  connected: boolean;
  accountName: string | null;
  loading: boolean;
  waiting: boolean;
  onConnect: () => void;
}) {
  const Glyph = platform === "meta" ? MetaGlyph : GoogleGlyph;
  const accent = platform === "meta" ? "var(--meta)" : "var(--google)";

  return (
    <div
      className="flex flex-col gap-3 rounded-[14px] bg-white p-5"
      style={{
        border: `1.5px solid ${connected ? "var(--sage)" : "var(--border)"}`,
        boxShadow: connected ? "0 0 0 4px var(--sage-soft)" : "none",
      }}
    >
      <div className="flex items-center gap-2.5">
        <div
          className="flex size-9 items-center justify-center rounded-[10px]"
          style={{
            background: connected ? "var(--sage-soft)" : "var(--card-soft)",
          }}
        >
          <Glyph size={18} />
        </div>
        <div className="flex-1">
          <div className="text-[14px] font-semibold text-[var(--ink)]">
            {label}
          </div>
          <div className="font-mono text-[10.5px] text-[var(--ink-subtle)]">
            {sub}
          </div>
        </div>
        {connected && (
          <div
            className="flex size-6 items-center justify-center rounded-full"
            style={{ background: "var(--sage)" }}
          >
            <Check className="size-[13px] text-white" strokeWidth={3} />
          </div>
        )}
      </div>

      {connected ? (
        <div className="rounded-[10px] bg-[var(--sage-soft)] px-3 py-2 text-[12.5px] text-[var(--ink)]">
          {accountName ? (
            <>
              Подключён · <b>{accountName}</b>
            </>
          ) : (
            "Подключён"
          )}
        </div>
      ) : waiting ? (
        <div className="flex items-center gap-2 rounded-[10px] bg-[var(--card-soft)] px-3 py-2 text-[12.5px] text-[var(--ink-mute)]">
          <Loader2 className="size-3 animate-spin" />
          Жду подтверждения OAuth…
        </div>
      ) : (
        <button
          onClick={onConnect}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-[10px] py-2.5 text-[13px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ background: accent }}
        >
          {loading ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <ExternalLink className="size-3.5" strokeWidth={2} />
          )}
          Подключить {label}
        </button>
      )}
    </div>
  );
}
