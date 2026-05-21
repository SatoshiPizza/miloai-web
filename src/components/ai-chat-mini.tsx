"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowUpRight, Loader2 } from "lucide-react";
import { tgBridge, type WebMessage } from "@/lib/tg-bridge";

/**
 * Compact AI chat preview for the dashboard right column.
 * Per design handoff §AI Chat Mini:
 *   - radius 14, header with sparkle + title + green sync dot
 *   - last 3-4 messages, smaller bubbles (12.5px)
 *   - peach-wash quick-action pills below
 *   - footer with mic + "Спроси или дай команду…" placeholder + ⌘K chip
 *
 * Subscribes to SSE so new messages from Telegram or web pop in live.
 */

export function AiChatMini({ paired }: { paired: boolean }) {
  const [messages, setMessages] = useState<WebMessage[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!paired) {
      setLoaded(true);
      return;
    }
    tgBridge.listMessages()
      .then((m) => setMessages(m.slice(-4)))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, [paired]);

  useEffect(() => {
    if (!paired) return;
    const es = tgBridge.openStream((msg) => {
      setMessages((prev) => {
        if (prev.some((x) => x.id === msg.id)) return prev;
        return [...prev, msg].slice(-4);
      });
    });
    return () => es.close();
  }, [paired]);

  return (
    <div
      className="rounded-[14px] bg-card border overflow-hidden flex flex-col"
      style={{ borderColor: "var(--border)", boxShadow: "0 6px 22px -10px rgba(31,29,26,0.10)" }}
    >
      {/* Header */}
      <div
        className="px-4 py-2.5 flex items-center gap-2.5 border-b"
        style={{ background: "var(--card-soft)", borderColor: "var(--sidebar-border)" }}
      >
        <Sparkles className="size-[18px] text-[var(--peach)]" strokeWidth={1.6} />
        <div className="text-[13px] font-semibold text-foreground">Чат с AI</div>
        <div className="flex-1" />
        {paired && (
          <div className="flex items-center gap-1.5 text-[10.5px] text-[var(--ink-subtle)] font-mono">
            <span className="size-1.5 rounded-full bg-[var(--sage)] inline-block" />
            Telegram sync
          </div>
        )}
        <Link
          href="/chat"
          className="text-[11px] text-[var(--ink-mute)] hover:text-foreground inline-flex items-center gap-0.5"
        >
          Открыть <ArrowUpRight className="size-3" />
        </Link>
      </div>

      {/* Messages */}
      <div className="px-4 py-3 flex flex-col gap-2 min-h-[140px]">
        {!loaded ? (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="size-3 animate-spin" /> загружаю...
          </div>
        ) : !paired ? (
          <div className="text-[12.5px] text-[var(--ink-mute)] flex flex-col gap-2">
            <p>Подключи Telegram → пиши боту голосом → действия применятся здесь.</p>
            <Link
              href="/accounts"
              className="text-[var(--peach-deep)] font-medium hover:underline"
            >
              Подключить →
            </Link>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-[12.5px] text-[var(--ink-mute)]">
            Напиши боту в Telegram или вебе — диалог появится здесь.
          </div>
        ) : (
          messages.map((m) => <MiniBubble key={m.id} msg={m} />)
        )}
      </div>

      {/* Quick action pills */}
      {paired && messages.length > 0 && (
        <div className="px-4 pb-3 flex gap-1.5 flex-wrap">
          <QuickPill>Анализ кампаний</QuickPill>
          <QuickPill>+20% бюджета</QuickPill>
          <QuickPill>Аномалии</QuickPill>
        </div>
      )}

      {/* Footer */}
      <Link
        href="/chat"
        className="px-3.5 py-2.5 flex items-center gap-2.5 border-t hover:bg-[var(--card-soft)]/40 transition-colors"
        style={{ borderColor: "var(--sidebar-border)" }}
      >
        <div className="size-7 rounded-full bg-[var(--peach)] flex items-center justify-center shrink-0">
          <Sparkles className="size-3.5 text-white" strokeWidth={2} />
        </div>
        <div className="flex-1 text-[12.5px] text-[var(--ink-subtle)] truncate">
          Спроси или дай команду…
        </div>
        <kbd
          className="font-mono text-[10px] text-[var(--ink-subtle)] border rounded px-1.5 py-0.5"
          style={{ borderColor: "var(--border)" }}
        >
          ⌘K
        </kbd>
      </Link>
    </div>
  );
}

function MiniBubble({ msg }: { msg: WebMessage }) {
  const isUser = msg.direction === "in";
  const txt = msg.text || msg.voice_transcript || "";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-lg px-2.5 py-1.5 text-[12.5px] leading-snug ${
          isUser
            ? "bg-[var(--peach)] text-white"
            : "bg-[var(--card-soft)] text-foreground border"
        }`}
        style={!isUser ? { borderColor: "var(--border)" } : undefined}
      >
        {msg.kind === "user_voice" && (
          <div className="text-[9px] opacity-70 mb-0.5">🎤 voice</div>
        )}
        <div className="whitespace-pre-wrap break-words">
          {txt.length > 140 ? txt.slice(0, 140) + "…" : txt}
        </div>
      </div>
    </div>
  );
}

function QuickPill({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-[10px] px-2.5 py-1 text-[11.5px] font-medium border"
      style={{
        background: "var(--peach-wash)",
        color: "var(--peach-deep)",
        borderColor: "var(--peach-soft)",
      }}
    >
      {children}
    </div>
  );
}
