"use client";

/**
 * ChatRail — the dark vertical command rail on the Chat screen.
 *
 * Reference: `screen-bold-chat.jsx::ScreenChatBold` (left column).
 *
 * Holds:
 *   • a peach "Killer feature" pill
 *   • a Bricolage h1 with the voice-control pitch (peach accent on "голосом")
 *   • a "SYNC" indicator with three editorial stats: messages this week,
 *     voice commands, average response time
 *   • a quiet footer line at the bottom about phone-first usage
 *
 * The rail is intentionally dark to mirror the HeroBand pattern on every
 * other primary screen — Chat doesn't get a top dark band because the rail
 * IS the dark element here.
 */

import { Sparkles } from "lucide-react";

import { sparkPath } from "@/components/bold/spark-path";

export function ChatRail({
  paired,
  botUsername,
  messagesThisWeek,
  voiceCommands,
  avgResponseSec,
}: {
  paired: boolean;
  botUsername: string;
  messagesThisWeek: number;
  voiceCommands: number;
  avgResponseSec: number;
}) {
  return (
    <aside
      className="relative hidden w-[290px] shrink-0 flex-col overflow-hidden p-7 text-[var(--hero-cream)] lg:flex"
      style={{ background: "var(--hero-bg)" }}
    >
      {/* Warm peach glow, top-left */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-16 -top-24 size-[320px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(232,149,108,0.2) 0%, transparent 65%)",
        }}
      />

      <div className="relative">
        {/* Killer-feature pill */}
        <div
          className="mb-4 inline-flex items-center gap-1.5 rounded-full px-3 py-[5px]"
          style={{
            background: "var(--hero-peach-wash)",
            border: "1px solid var(--hero-peach-border)",
          }}
        >
          <Sparkles className="size-3" style={{ color: "var(--peach)" }} />
          <span
            className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em]"
            style={{ color: "var(--peach)" }}
          >
            Killer feature
          </span>
        </div>

        {/* Headline */}
        <h2
          className="font-heading text-[25px] font-bold leading-[1.15] tracking-[-0.025em]"
          style={{ color: "var(--hero-cream)" }}
        >
          Управляй рекламой{" "}
          <span style={{ color: "var(--peach)" }}>голосом</span> из Telegram
        </h2>

        <p
          className="mt-3 text-[13px] leading-[1.5]"
          style={{ color: "var(--hero-cream-65)" }}
        >
          Всё что пишешь здесь — летит в Telegram. Голос с телефона →
          распознанный текст → действие.
        </p>

        {/* Sync indicator block */}
        <div
          className="mt-6 rounded-[12px] p-3.5"
          style={{
            background: "var(--hero-surface)",
            border: "1px solid var(--hero-border)",
          }}
        >
          <div className="mb-3 flex items-center gap-2">
            <span
              className="size-[7px] rounded-full"
              style={{
                background: paired ? "var(--sage)" : "var(--peach)",
                boxShadow: paired
                  ? "0 0 0 3px rgba(133,162,117,0.2)"
                  : "0 0 0 3px rgba(232,149,108,0.2)",
              }}
            />
            <span
              className="font-mono text-[10.5px] tracking-[0.06em]"
              style={{ color: "var(--hero-cream-65)" }}
            >
              {paired ? `SYNC · @${botUsername}` : "TG не подключён"}
            </span>
          </div>
          <div className="space-y-2">
            <Stat label="Сообщений за неделю" value={String(messagesThisWeek)} />
            <Stat label="Голосовых команд" value={String(voiceCommands)} />
            <Stat
              label="Время отклика"
              value={`${avgResponseSec.toFixed(1)}с`}
              spark={voiceCommands > 0 ? [3, 5, 4, 6, 4, 3, 2] : undefined}
            />
          </div>
        </div>
      </div>

      <div className="flex-1" />

      <p
        className="relative text-[11.5px] leading-[1.5]"
        style={{ color: "var(--hero-cream-45)" }}
      >
        Основной сценарий — с телефона. Веб-чат и Telegram всегда синхронны.
      </p>
    </aside>
  );
}

function Stat({
  label,
  value,
  spark,
}: {
  label: string;
  value: string;
  spark?: number[];
}) {
  return (
    <div className="flex items-baseline gap-2">
      <div
        className="min-w-[42px] font-mono text-[17px] font-semibold tabular-nums"
        style={{ color: "var(--hero-cream)" }}
      >
        {value}
      </div>
      <div
        className="flex-1 text-[11.5px]"
        style={{ color: "var(--hero-cream-50)" }}
      >
        {label}
      </div>
      {spark && spark.length > 1 && (
        <svg width={42} height={14} viewBox="0 0 42 14">
          <path
            d={sparkPath(spark, 42, 14)}
            fill="none"
            stroke="var(--peach)"
            strokeWidth={1.4}
            strokeLinecap="round"
          />
        </svg>
      )}
    </div>
  );
}
