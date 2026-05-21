"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  MessageCircle, Paperclip, Image as ImageIcon, Mic, Send, Loader2, Search, Bell,
  Sparkles, Check,
} from "lucide-react";
import { tgBridge, type WebMessage, type Me } from "@/lib/tg-bridge";
import { toast } from "sonner";

/**
 * Chat split-view — design handoff iter-2 §screen-chat.jsx.
 * Left: web chat (peach user bubbles, cream bot bubbles, day dividers).
 * Right: 320px Telegram preview mirroring the same conversation.
 */

export default function ChatPage() {
  const [me, setMe] = useState<Me | null>(null);
  const [messages, setMessages] = useState<WebMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    tgBridge.me().then(setMe).catch(() => {});
    tgBridge.listMessages().then(setMessages).catch(() => {});
  }, []);

  useEffect(() => {
    const es = tgBridge.openStream((msg) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    });
    return () => es.close();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  async function send() {
    const text = draft.trim();
    if (!text || sending) return;
    setSending(true);
    setDraft("");
    try {
      await tgBridge.sendMessage(text);
    } catch (e) {
      toast.error("Не удалось отправить");
      console.error(e);
      setDraft(text);
    } finally {
      setSending(false);
    }
  }

  const initials = useMemo(() => {
    const name = me?.first_name || me?.business_name || "Я";
    return name.trim().split(/\s+/).map((p) => p[0]).slice(0, 2).join("").toUpperCase() || "Я";
  }, [me?.first_name, me?.business_name]);

  const paired = me?.has_telegram_paired ?? false;
  const groups = useMemo(() => groupByDay(messages), [messages]);

  return (
    <div className="p-7 max-w-[1400px] h-[calc(100vh-0px)] flex flex-col">
      {/* Header */}
      <header className="shrink-0 mb-4">
        <div className="flex items-center gap-2.5 mb-1.5">
          <div
            className="size-[26px] rounded-full flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, var(--peach), var(--peach-deep))" }}
          >
            <Sparkles className="size-[14px] text-white" strokeWidth={1.7} />
          </div>
          <h1 className="font-heading text-[26px] font-bold leading-none tracking-[-0.02em]">
            Чат с AI
          </h1>
          <SyncBadge paired={paired} />
        </div>
        <p className="text-[13.5px] text-[var(--ink-mute)] ml-[36px]">
          Всё что пишешь здесь — летит в Telegram. И наоборот: голос → распознанный текст → действие.
        </p>
      </header>

      {/* Split body */}
      <div className="flex-1 min-h-0 flex gap-[22px]">
        {/* ── Left: web chat ────────────────────────────────────── */}
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex-1 min-h-0 rounded-[14px] border border-[var(--border)] bg-card overflow-hidden flex flex-col">
            {/* Day header */}
            <div className="px-[18px] py-3 border-b border-[var(--border)] bg-[var(--card-soft)] flex items-center gap-2.5">
              <span className="font-mono text-[10.5px] text-[var(--ink-subtle)] uppercase tracking-[0.08em]">
                {todayLabel()}
              </span>
              <span className="flex-1" />
              <Search className="size-3.5 text-[var(--ink-mute)]" />
            </div>

            {/* Scroll area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-[22px] py-[18px] flex flex-col gap-3.5">
              {messages.length === 0 ? (
                <EmptyState paired={paired} />
              ) : (
                groups.map((g) => (
                  <div key={g.day} className="flex flex-col gap-3.5">
                    <DayDivider label={g.day} />
                    {g.items.map((m) => (
                      <Bubble key={m.id} msg={m} initials={initials} />
                    ))}
                  </div>
                ))
              )}
            </div>

            {/* Composer */}
            <div className="px-[18px] py-3.5 border-t border-[var(--border)] flex items-center gap-2.5">
              <button
                type="button"
                disabled={!paired}
                className="text-[var(--ink-subtle)] hover:text-[var(--ink-mute)] disabled:opacity-40 transition-colors"
                title="Прикрепить файл (скоро)"
              >
                <Paperclip className="size-4" />
              </button>
              <button
                type="button"
                disabled={!paired}
                className="text-[var(--ink-subtle)] hover:text-[var(--ink-mute)] disabled:opacity-40 transition-colors"
                title="Прикрепить картинку (скоро)"
              >
                <ImageIcon className="size-4" />
              </button>
              <Input
                placeholder={paired ? "Команда, вопрос или голосовое…" : "Подключи Telegram чтобы писать"}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                disabled={!paired || sending}
                className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none px-0 text-[13.5px] placeholder:text-[var(--ink-subtle)]"
              />
              <kbd className="font-mono text-[11px] text-[var(--ink-subtle)] bg-[var(--card-soft)] px-1.5 py-0.5 rounded border border-[var(--border)] hidden md:inline">
                ⌘K
              </kbd>
              <button
                onClick={send}
                disabled={!paired || sending || !draft.trim()}
                className="size-8 rounded-full flex items-center justify-center transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ background: "var(--peach)" }}
                title="Отправить"
              >
                {sending ? (
                  <Loader2 className="size-[15px] text-white animate-spin" />
                ) : draft.trim() ? (
                  <Send className="size-[14px] text-white" strokeWidth={1.8} />
                ) : (
                  <Mic className="size-[15px] text-white" strokeWidth={1.8} />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ── Right: Telegram preview (320px) ───────────────────── */}
        <aside className="hidden lg:flex w-[320px] shrink-0 flex-col gap-3.5">
          <div className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-subtle)]">
            То же самое в Telegram
          </div>
          <TelegramPreview messages={messages} paired={paired} />
        </aside>
      </div>
    </div>
  );
}


// ═════════════════════════════════════════════════════════════════════════════
// Header pieces
// ═════════════════════════════════════════════════════════════════════════════

function SyncBadge({ paired }: { paired: boolean }) {
  if (paired) {
    return (
      <span
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border"
        style={{ background: "var(--sage-soft)", borderColor: "#BFD0B0" }}
      >
        <span className="size-1.5 rounded-full" style={{ background: "var(--sage)" }} />
        <span className="font-mono text-[11px] font-medium" style={{ color: "#456838" }}>
          Sync · Telegram
        </span>
      </span>
    );
  }
  return (
    <Badge variant="outline" className="text-[10px] font-mono">
      offline · нет pairing
    </Badge>
  );
}


// ═════════════════════════════════════════════════════════════════════════════
// Bubbles
// ═════════════════════════════════════════════════════════════════════════════

function Bubble({ msg, initials }: { msg: WebMessage; initials: string }) {
  const isUser = msg.direction === "in";
  const fromTg = msg.source === "telegram";
  const time = formatTime(msg.created_at);
  const text = msg.text ?? msg.voice_transcript ?? "";

  if (isUser) {
    return (
      <div className="flex gap-3 items-start justify-end">
        <div className="max-w-[70%]">
          <div className="flex items-baseline gap-2 mb-1 justify-end">
            {fromTg && <TgFromBadge />}
            <span className="font-mono text-[10.5px] text-[var(--ink-subtle)]">{time}</span>
          </div>
          <div
            className="px-3.5 py-2.5 text-[13.5px] leading-[1.5] text-white"
            style={{
              background: "var(--peach)",
              borderRadius: "12px 12px 4px 12px",
              letterSpacing: "-0.005em",
            }}
          >
            {msg.kind === "user_voice" && msg.voice_transcript && (
              <span className="opacity-80 text-[11px] mr-1.5">🎤</span>
            )}
            <span className="whitespace-pre-wrap break-words">{text}</span>
          </div>
        </div>
        <Avatar variant="user" initials={initials} />
      </div>
    );
  }

  return (
    <div className="flex gap-3 items-start">
      <Avatar variant="bot" />
      <div className="max-w-[78%]">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-[12.5px] font-semibold text-[var(--ink)]">MiloAI</span>
          <span className="font-mono text-[10.5px] text-[var(--ink-subtle)]">{time}</span>
        </div>
        <div
          className="px-3.5 py-2.5 text-[13.5px] leading-[1.5] text-[var(--ink)] border border-[var(--border)]"
          style={{
            background: "var(--card-soft)",
            borderRadius: "12px 12px 12px 4px",
            letterSpacing: "-0.005em",
          }}
        >
          <span className="whitespace-pre-wrap break-words">{text}</span>
        </div>
      </div>
    </div>
  );
}

function Avatar({ variant, initials }: { variant: "bot" | "user"; initials?: string }) {
  if (variant === "bot") {
    return (
      <div
        className="size-[30px] rounded-full flex items-center justify-center shrink-0"
        style={{ background: "linear-gradient(135deg, var(--peach), var(--peach-deep))" }}
      >
        <Sparkles className="size-[14px] text-white" strokeWidth={1.8} />
      </div>
    );
  }
  return (
    <div
      className="size-[30px] rounded-full flex items-center justify-center shrink-0 text-white font-semibold text-[12px]"
      style={{ background: "linear-gradient(135deg, var(--peach), var(--peach-deep))" }}
    >
      {initials}
    </div>
  );
}

function TgFromBadge() {
  return (
    <span
      className="inline-flex items-center gap-1 font-mono text-[10px] px-1.5 py-0.5 rounded"
      style={{ background: "#E8F4FB", color: "#0088CC", border: "1px solid #C3E1F3" }}
    >
      <svg width="9" height="9" viewBox="0 0 24 24" fill="#0088CC" aria-hidden>
        <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z" />
      </svg>
      из Telegram
    </span>
  );
}

function DayDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 my-1">
      <span className="flex-1 h-px bg-[var(--border)]" />
      <span className="font-mono text-[10.5px] text-[var(--ink-subtle)] uppercase tracking-[0.1em]">
        {label}
      </span>
      <span className="flex-1 h-px bg-[var(--border)]" />
    </div>
  );
}

function EmptyState({ paired }: { paired: boolean }) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center text-sm text-[var(--ink-mute)]">
      <MessageCircle className="size-10 mb-3 text-[var(--ink-subtle)]/50" />
      <p className="font-medium text-[var(--ink)]">Пока пусто.</p>
      <p className="mt-1 max-w-xs">
        {paired
          ? "Напиши боту в Telegram или из поля ниже — сообщения появятся здесь."
          : "Подключи Telegram в /accounts — потом сообщения начнут синхронизироваться."}
      </p>
    </div>
  );
}


// ═════════════════════════════════════════════════════════════════════════════
// Telegram preview panel (right side)
// ═════════════════════════════════════════════════════════════════════════════

function TelegramPreview({ messages, paired }: { messages: WebMessage[]; paired: boolean }) {
  const last = messages.slice(-6);

  return (
    <div
      className="flex-1 rounded-[22px] overflow-hidden border flex flex-col"
      style={{ background: "#F4EFE5", borderColor: "var(--border)" }}
    >
      {/* TG header */}
      <div className="px-4 py-3 flex items-center gap-2.5 border-b" style={{ background: "#EEE6D8", borderColor: "var(--border)" }}>
        <div
          className="size-8 rounded-full flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, var(--peach), var(--peach-deep))" }}
        >
          <Sparkles className="size-4 text-white" strokeWidth={1.7} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[13.5px] font-semibold text-[var(--ink)] truncate">MiloAI Bot</div>
          <div className="text-[11px]" style={{ color: paired ? "var(--sage)" : "var(--ink-subtle)" }}>
            {paired ? "в сети" : "не подключён"}
          </div>
        </div>
        <Bell className="size-3.5 text-[var(--ink-subtle)]" />
      </div>

      {/* Mirror messages */}
      <div className="flex-1 px-3 py-3.5 flex flex-col gap-2 overflow-y-auto">
        {last.length === 0 ? (
          <div className="text-center text-[11.5px] text-[var(--ink-subtle)] my-auto px-4 leading-relaxed">
            {paired
              ? "Когда придёт сообщение в Telegram — оно появится здесь."
              : "Подключи Telegram в /accounts."}
          </div>
        ) : (
          last.map((m) => <TgBubble key={m.id} msg={m} />)
        )}
      </div>

      {/* TG input */}
      <div className="px-3 py-2.5 border-t flex items-center gap-2" style={{ background: "#EEE6D8", borderColor: "var(--border)" }}>
        <Paperclip className="size-[18px] text-[var(--ink-subtle)]" />
        <div
          className="flex-1 rounded-2xl px-3 py-1.5 text-[12px] text-[var(--ink-subtle)] border"
          style={{ background: "#fff", borderColor: "var(--border)" }}
        >
          Сообщение
        </div>
        <div
          className="size-[30px] rounded-full flex items-center justify-center"
          style={{ background: "var(--peach)" }}
        >
          <Mic className="size-[14px] text-white" strokeWidth={1.8} />
        </div>
      </div>
    </div>
  );
}

function TgBubble({ msg }: { msg: WebMessage }) {
  const isUser = msg.direction === "in";
  const text = msg.text ?? msg.voice_transcript ?? "";
  const isVoice = msg.kind === "user_voice";

  if (isUser && isVoice) {
    return (
      <div
        className="self-end flex items-center gap-2 px-2.5 py-1.5 rounded-[18px] max-w-[85%]"
        style={{ background: "#fff", border: "1.5px solid var(--peach)" }}
      >
        <Mic className="size-3.5" style={{ color: "var(--peach)" } as React.CSSProperties} />
        <div className="flex items-center gap-[2px] flex-1 h-4">
          {[3, 7, 12, 18, 24, 19, 14, 9, 14, 21, 17, 10, 6, 11, 16, 12, 8].map((h, i) => (
            <span
              key={i}
              className="rounded-[1px]"
              style={{ width: 2, height: h, background: "var(--peach)", opacity: 0.7 }}
            />
          ))}
        </div>
        <span className="font-mono text-[10.5px] text-[var(--ink-mute)]">0:08</span>
      </div>
    );
  }

  if (isUser) {
    return (
      <div
        className="self-end max-w-[85%] px-3 py-2 text-[12.5px] text-white leading-[1.4]"
        style={{
          background: "var(--peach)",
          borderRadius: "12px 12px 3px 12px",
        }}
      >
        {text}
      </div>
    );
  }

  return (
    <div
      className="self-start max-w-[85%] px-3 py-2 text-[12.5px] text-[var(--ink)] leading-[1.4] border"
      style={{
        background: "#fff",
        borderRadius: "12px 12px 12px 3px",
        borderColor: "var(--border)",
      }}
    >
      {text}
    </div>
  );
}


// ═════════════════════════════════════════════════════════════════════════════
// Helpers
// ═════════════════════════════════════════════════════════════════════════════

/** "ПН · сегодня" / "ВТ · вчера" / "ПН · 17 май" — RU labels matching design. */
function dayLabelFor(date: Date): string {
  const weekdays = ["вс", "пн", "вт", "ср", "чт", "пт", "сб"];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yest = new Date(today);
  yest.setDate(today.getDate() - 1);
  const d = new Date(date);
  const dStart = new Date(d);
  dStart.setHours(0, 0, 0, 0);
  const wd = weekdays[d.getDay()].toUpperCase();
  if (dStart.getTime() === today.getTime()) return `${wd} · сегодня`;
  if (dStart.getTime() === yest.getTime()) return `${wd} · вчера`;
  const months = ["янв", "фев", "мар", "апр", "май", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];
  return `${wd} · ${d.getDate()} ${months[d.getMonth()]}`;
}

function todayLabel(): string {
  const d = new Date();
  const weekdays = ["воскресенье", "понедельник", "вторник", "среда", "четверг", "пятница", "суббота"];
  const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return `${weekdays[d.getDay()]} · ${time}`;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function groupByDay(messages: WebMessage[]): { day: string; items: WebMessage[] }[] {
  const groups: { day: string; items: WebMessage[] }[] = [];
  for (const m of messages) {
    const label = dayLabelFor(new Date(m.created_at));
    const last = groups[groups.length - 1];
    if (last && last.day === label) last.items.push(m);
    else groups.push({ day: label, items: [m] });
  }
  return groups;
}

// Silence unused-import lint: Check is reserved for future "delivered" tick on bubbles.
void Check;
