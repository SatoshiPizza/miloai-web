"use client";

/**
 * VoiceAnswer — the answer surface for one intake block.
 *
 * A single open textarea plus a mic button. The mic uses the browser's
 * Web Speech API (Chrome/Edge) to dictate straight into the textarea — no
 * server round-trip, no cost. When the API is absent (Firefox/Safari) the
 * mic hides and the user just types; the block still works.
 *
 * We deliberately do NOT show the block's individual fields here. The whole
 * point of the design is "talk/type once, AI sorts it into fields". The
 * parsed result is shown for review by the parent (EditableChips), not here.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { Mic, MicOff, Loader2, Send } from "lucide-react";

// Minimal shape of the Web Speech API we use — it isn't in the TS DOM lib.
type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
  onerror: ((e: unknown) => void) | null;
};

function getRecognitionCtor(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function VoiceAnswer({
  placeholder,
  busy,
  onSubmit,
  lang = "ru-RU",
}: {
  placeholder: string;
  busy: boolean;
  onSubmit: (text: string) => void;
  lang?: string;
}) {
  const [text, setText] = useState("");
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const recogRef = useRef<SpeechRecognitionLike | null>(null);
  // Text already committed before the current dictation began, so interim
  // speech results append instead of clobbering what the user typed.
  const baseRef = useRef("");

  useEffect(() => {
    setSupported(getRecognitionCtor() !== null);
    return () => {
      try {
        recogRef.current?.stop();
      } catch {
        /* already stopped */
      }
    };
  }, []);

  const toggleMic = useCallback(() => {
    if (listening) {
      recogRef.current?.stop();
      return;
    }
    const Ctor = getRecognitionCtor();
    if (!Ctor) return;
    const r = new Ctor();
    r.lang = lang;
    r.continuous = true;
    r.interimResults = true;
    baseRef.current = text ? text + " " : "";
    r.onresult = (e) => {
      let chunk = "";
      for (let i = 0; i < e.results.length; i++) {
        chunk += e.results[i][0].transcript;
      }
      setText(baseRef.current + chunk);
    };
    r.onend = () => setListening(false);
    r.onerror = () => setListening(false);
    recogRef.current = r;
    r.start();
    setListening(true);
  }, [listening, text, lang]);

  const canSend = text.trim().length >= 3 && !busy;

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
          rows={5}
          disabled={busy}
          className="w-full resize-none rounded-[12px] px-4 py-3 pr-12 text-[14px] leading-relaxed outline-none transition-colors disabled:opacity-60"
          style={{
            background: "var(--card-soft)",
            border: `1.5px solid ${listening ? "var(--peach)" : "var(--border)"}`,
            color: "var(--ink)",
          }}
        />
        {supported && (
          <button
            type="button"
            onClick={toggleMic}
            disabled={busy}
            title={listening ? "Остановить запись" : "Говорить голосом"}
            className="absolute top-3 right-3 size-8 rounded-full flex items-center justify-center transition-colors disabled:opacity-40"
            style={{
              background: listening ? "var(--peach)" : "var(--card)",
              border: `1px solid ${listening ? "var(--peach)" : "var(--border)"}`,
            }}
          >
            {listening ? (
              <MicOff className="size-4 text-white" />
            ) : (
              <Mic className="size-4 text-[var(--ink-mute)]" />
            )}
          </button>
        )}
        {listening && (
          <div
            className="absolute bottom-2.5 left-4 flex items-center gap-1.5 text-[11px] font-medium"
            style={{ color: "var(--peach-deep)" }}
          >
            <span className="size-1.5 rounded-full animate-pulse" style={{ background: "var(--peach)" }} />
            Слушаю…
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-[11.5px] text-[var(--ink-subtle)]">
          {supported
            ? "Наговори или напиши — AI сам разложит по полям"
            : "Опиши своими словами — AI сам разложит по полям"}
        </span>
        <button
          type="button"
          onClick={() => canSend && onSubmit(text.trim())}
          disabled={!canSend}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[9px] text-[13px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40"
          style={{ background: "var(--peach)" }}
        >
          {busy ? <Loader2 className="size-3.5 animate-spin" /> : <Send className="size-3.5" />}
          {busy ? "Разбираю…" : "Готово"}
        </button>
      </div>
    </div>
  );
}
