"use client";

/**
 * Step 5 — Telegram pairing.
 *
 * Reference: `screen-onboarding.jsx::OnbStep5`.
 *
 * Same deep-link mechanism as /accounts:
 *   1. POST /api/web/pair/start → {token, deep_link, expires_at}
 *   2. Open deep_link in a new tab (Telegram resolves it into the bot
 *      chat with /start <token> pre-filled)
 *   3. User taps START. Bot calls back the pair endpoint which sets
 *      User.telegram_id.
 *   4. Poll /api/web/me every 3s. As soon as has_telegram_paired flips
 *      to true, show the green confirmation card.
 *
 * Skipping is fine — the user can pair later from /accounts. Voice
 * control just won't work until they do.
 */

import { useEffect, useState } from "react";
import { ArrowRight, ArrowLeft, Check, Loader2, Send, Copy } from "lucide-react";

import { OnbFrame } from "./onb-frame";
import { tgBridge, type PairStart } from "@/lib/tg-bridge";
import { toast } from "sonner";


export function Step5Telegram({
  onBack,
  onNext,
  initialPaired,
}: {
  onBack: () => void;
  onNext: (skipped: boolean) => void;
  initialPaired: boolean;
}) {
  const [paired, setPaired] = useState(initialPaired);
  const [pair, setPair] = useState<PairStart | null>(null);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  // Once we kick off pairing, poll /me until the bot calls back.
  useEffect(() => {
    if (!pair || paired) return;
    const t = setInterval(async () => {
      try {
        const me = await tgBridge.me();
        if (me.has_telegram_paired) {
          setPaired(true);
          setPair(null);
          toast.success("Telegram подключён");
        }
      } catch {
        // ignore
      }
    }, 3000);
    return () => clearInterval(t);
  }, [pair, paired]);

  async function start() {
    setGenerating(true);
    try {
      const result = await tgBridge.startPair();
      setPair(result);
      window.open(result.deep_link, "_blank", "noopener,noreferrer");
      toast.info("Telegram открыт — нажми START в боте");
    } catch {
      toast.error("Не удалось создать pair-токен");
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
    <OnbFrame stepIdx={4}>
      <div className="w-full max-w-[640px] text-center">
        <div
          className="mb-4 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.06em]"
          style={{
            background: "var(--peach-wash)",
            border: "1px solid var(--peach-soft)",
            color: "var(--peach-deep)",
          }}
        >
          <Send className="size-3.5" />
          Telegram · голосовое управление
        </div>
        <h1 className="font-heading text-[32px] sm:text-[36px] font-bold leading-[1.1] tracking-[-0.03em]">
          {paired ? "Telegram подключён" : "Управляй голосом из Telegram"}
        </h1>
        <p className="mt-3 text-[14.5px] leading-relaxed text-[var(--ink-mute)]">
          {paired
            ? "Запиши голосовое в боте — AI распознает и выполнит. Любая команда: «подними бюджет на 20%», «покажи лучшую кампанию»."
            : "Соединим этот аккаунт с нашим ботом. После — записал голосовое из любого места, AI выполнил в кабинете."}
        </p>

        {paired ? (
          <div
            className="mx-auto mt-7 flex max-w-[420px] items-center justify-center gap-3 rounded-[14px] px-5 py-4"
            style={{
              background: "var(--sage-soft)",
              border: "1px solid #BFD0B0",
            }}
          >
            <div
              className="flex size-9 items-center justify-center rounded-full"
              style={{ background: "var(--sage)" }}
            >
              <Check className="size-[16px] text-white" strokeWidth={3} />
            </div>
            <div className="text-left">
              <div className="text-[13.5px] font-semibold text-[var(--ink)]">
                Готов принимать команды
              </div>
              <div className="font-mono text-[10.5px] text-[var(--ink-subtle)]">
                Голос → AI → действие в кабинете
              </div>
            </div>
          </div>
        ) : pair ? (
          <div
            className="mx-auto mt-7 max-w-[460px] rounded-[14px] bg-white p-5"
            style={{ border: "1px solid var(--border)" }}
          >
            <div className="flex items-center gap-2.5 text-[13px]">
              <Loader2
                className="size-4 animate-spin"
                style={{ color: "var(--peach)" }}
              />
              <span className="text-[var(--ink-mute)]">
                Жду тебя в Telegram — нажми{" "}
                <b className="text-[var(--ink)]">START</b> в боте.
              </span>
            </div>
            <div className="mt-3 flex items-center gap-2 rounded-[10px] bg-[var(--card-soft)] px-3 py-2 text-left">
              <code className="flex-1 truncate font-mono text-[11.5px] text-[var(--ink-mute)]">
                {pair.deep_link}
              </code>
              <button
                onClick={copyLink}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium text-[var(--ink-mute)] hover:text-[var(--ink)] transition-colors"
                title="Скопировать ссылку"
              >
                <Copy className="size-3" />
                {copied ? "Скопировано" : "Копировать"}
              </button>
            </div>
            <div className="mt-2 font-mono text-[10.5px] text-[var(--ink-subtle)]">
              Если Telegram не открылся — скопируй ссылку и открой вручную.
            </div>
          </div>
        ) : (
          <button
            onClick={start}
            disabled={generating}
            className="mx-auto mt-7 inline-flex items-center gap-2.5 rounded-[11px] px-7 py-3 text-[14.5px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{
              background: "linear-gradient(135deg, #229ED9, #1B8AC0)",
              boxShadow: "0 6px 18px -6px rgba(34,158,217,0.5)",
            }}
          >
            {generating ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-[14px]" strokeWidth={2} />
            )}
            Подключить Telegram
          </button>
        )}

        {/* Nav */}
        <div className="mt-9 flex items-center justify-between">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-[10px] px-4 py-2.5 text-[13.5px] text-[var(--ink-mute)] hover:text-[var(--ink)] transition-colors"
          >
            <ArrowLeft className="size-[14px]" strokeWidth={2} />
            Назад
          </button>
          <div className="flex items-center gap-2.5">
            {!paired && (
              <button
                onClick={() => onNext(true)}
                className="rounded-[10px] px-4 py-2.5 text-[13.5px] text-[var(--ink-mute)] hover:text-[var(--ink)] transition-colors"
              >
                Сделать позже
              </button>
            )}
            <button
              onClick={() => onNext(!paired)}
              className="inline-flex items-center gap-2.5 rounded-[11px] px-8 py-3 text-[14.5px] font-medium text-white transition-opacity hover:opacity-90"
              style={{
                background: "var(--peach)",
                boxShadow: "0 6px 18px -6px rgba(232,149,108,0.55)",
              }}
            >
              {paired ? "Принять стартовый план" : "Дальше"}
              <ArrowRight className="size-[14px]" strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>
    </OnbFrame>
  );
}
