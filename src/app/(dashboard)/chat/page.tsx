"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { tgBridge, type WebMessage, type Me } from "@/lib/tg-bridge";
import { toast } from "sonner";

export default function ChatPage() {
  const [me, setMe] = useState<Me | null>(null);
  const [messages, setMessages] = useState<WebMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Initial load: profile + history.
  useEffect(() => {
    tgBridge.me().then(setMe).catch(() => {});
    tgBridge.listMessages().then(setMessages).catch(() => {});
  }, []);

  // Subscribe to SSE for live updates.
  useEffect(() => {
    const es = tgBridge.openStream((msg) => {
      setMessages((prev) => {
        // Dedupe by id when web also posted the same row a moment ago.
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    });
    return () => es.close();
  }, []);

  // Auto-scroll to bottom on new messages.
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
      // SSE will push the row back — no need to optimistic-update here.
    } catch (e) {
      toast.error("Не удалось отправить");
      console.error(e);
      setDraft(text);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl flex flex-col h-screen md:h-[calc(100vh)]">
      <header className="flex items-center justify-between mb-4 shrink-0">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            Чат с AI
            {me?.has_telegram_paired ? (
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-200 dark:border-emerald-900 text-[10px]">
                live · Telegram подключён
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[10px]">
                offline · нет pairing
              </Badge>
            )}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Telegram ↔ Web sync. Голос с телефона → текст в браузере в реальном времени.
          </p>
        </div>
      </header>

      {/* Messages pane */}
      <Card className="flex-1 min-h-0 mb-3">
        <CardContent
          ref={scrollRef}
          className="h-full overflow-y-auto p-4 space-y-2"
        >
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-sm text-muted-foreground">
              <MessageCircle className="size-10 mb-3 text-muted-foreground/40" />
              <p className="font-medium text-foreground">Пока пусто.</p>
              <p className="mt-1">
                {me?.has_telegram_paired
                  ? "Напиши боту в Telegram или из поля ниже — сообщения появятся здесь."
                  : "Подключи Telegram в /accounts — потом сообщения начнут синхронизироваться."}
              </p>
            </div>
          ) : (
            messages.map((m) => <MessageBubble key={m.id} msg={m} />)
          )}
        </CardContent>
      </Card>

      {/* Composer */}
      <div className="flex gap-2 shrink-0">
        <Input
          placeholder={me?.has_telegram_paired ? "Сообщение... (Enter — отправить)" : "Подключи Telegram чтобы писать"}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          disabled={!me?.has_telegram_paired || sending}
        />
        <Button
          onClick={send}
          disabled={!draft.trim() || sending || !me?.has_telegram_paired}
        >
          {sending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        </Button>
      </div>
    </div>
  );
}


function MessageBubble({ msg }: { msg: WebMessage }) {
  const isUser = msg.direction === "in";
  const fromTg = msg.source === "telegram";
  const time = new Date(msg.created_at).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[80%] rounded-lg px-3 py-2 text-sm shadow-sm",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-foreground"
        )}
      >
        {msg.kind === "user_voice" && msg.voice_transcript && (
          <div className="text-[10px] opacity-70 mb-1">🎤 voice</div>
        )}
        <div className="whitespace-pre-wrap break-words">
          {msg.text ?? msg.voice_transcript ?? ""}
        </div>
        <div className={cn("text-[10px] mt-1 opacity-60", isUser ? "text-right" : "text-left")}>
          {fromTg ? "📱 TG · " : "🌐 Web · "}
          {time}
        </div>
      </div>
    </div>
  );
}
