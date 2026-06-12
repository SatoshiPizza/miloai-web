"use client";

/**
 * Step 3 — AI analysis live log.
 *
 * Reference: `screen-onboarding.jsx::OnbStep3`.
 *
 * This is the killer moment: the user pasted a URL, clicked through Step 2,
 * and now watches MiloAI read their site and pull out services in real time.
 * The backend SSE endpoint is `POST /api/web/onboarding/analyze` — see
 * `app/services/onboarding_analyzer.py`.
 *
 * Event shapes (mirror `analyze_and_persist` yields):
 *   • {type:'log', message}              — terminal-style log line
 *   • {type:'profile', profile:{...}}    — extracted business profile
 *   • {type:'found_services', services:[{name, description, price?, ...}]}
 *   • {type:'done', business_id, services_created, duration_ms}
 *   • {type:'error', message}
 *
 * UX rules:
 *   • Auto-scroll the log feed to the latest line.
 *   • Services appear as animated chips as they land.
 *   • Profile card reveals once `profile` event arrives.
 *   • «Дальше» is gated until `done`.
 *
 * We POST with fetch (not EventSource) because Authorization headers are
 * needed and the payload carries the source URL / text description.
 */

import { useEffect, useRef, useState } from "react";
import { ArrowRight, ArrowLeft, AlertCircle, Sparkles, Loader2 } from "lucide-react";

import { OnbFrame } from "./onb-frame";
import { config } from "@/lib/config";
import { getSessionToken } from "@/lib/session";

type LogLine = { id: number; message: string };

type ProfileSnapshot = {
  name?: string;
  category?: string;
  usp?: string | null;
  target_audience?: string | null;
  country?: string | null;
  city?: string | null;
  languages?: string[];
  contact_phone?: string | null;
  contact_email?: string | null;
};

type ServiceSnapshot = {
  name: string;
  description?: string | null;
  price?: number | null;
  price_currency?: string;
  price_note?: string | null;
  target_audience?: string | null;
};

type Status = "idle" | "running" | "done" | "error";

export function Step3Analysis({
  siteUrl,
  textDescription,
  onBack,
  onDone,
}: {
  siteUrl?: string;
  textDescription?: string;
  onBack: () => void;
  onDone: () => void;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [profile, setProfile] = useState<ProfileSnapshot | null>(null);
  const [services, setServices] = useState<ServiceSnapshot[]>([]);
  const [duration, setDuration] = useState<number | null>(null);

  const logRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Auto-scroll the log feed.
  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [logs.length]);

  // Run once on mount.
  useEffect(() => {
    if (!siteUrl && !textDescription) {
      setStatus("error");
      setErrorMsg("Не указан источник анализа");
      return;
    }
    const ctl = new AbortController();
    abortRef.current = ctl;
    runAnalyze({
      siteUrl,
      textDescription,
      signal: ctl.signal,
      onLog: (msg) =>
        setLogs((prev) => [...prev, { id: prev.length, message: msg }]),
      onProfile: setProfile,
      onServices: setServices,
      onDone: (ms) => {
        setStatus("done");
        setDuration(ms);
      },
      onError: (m) => {
        setStatus("error");
        setErrorMsg(m);
      },
      onStart: () => setStatus("running"),
    });
    return () => ctl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <OnbFrame stepIdx={2}>
      <div className="grid w-full max-w-[1100px] gap-6 lg:grid-cols-[1.1fr_1fr]">
        {/* Left: terminal-style live log */}
        <div
          className="flex h-[460px] flex-col overflow-hidden rounded-[18px]"
          style={{
            background: "var(--ink)",
            border: "1px solid var(--hero-border-strong)",
          }}
        >
          <div
            className="flex items-center gap-2 border-b px-5 py-3"
            style={{
              borderColor: "var(--hero-border)",
            }}
          >
            {status === "running" ? (
              <Loader2
                className="size-3.5 animate-spin"
                style={{ color: "var(--peach)" }}
              />
            ) : (
              <Sparkles
                className="size-3.5"
                style={{ color: "var(--peach)" }}
              />
            )}
            <span
              className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.1em]"
              style={{ color: "var(--peach)" }}
            >
              AI · onboarding analyze
            </span>
            <span
              className="ml-auto font-mono text-[10.5px]"
              style={{ color: "var(--hero-cream-45)" }}
            >
              {status === "running" && "live"}
              {status === "done" && duration != null &&
                `${(duration / 1000).toFixed(1)}s · done`}
              {status === "error" && "error"}
            </span>
          </div>
          <div
            ref={logRef}
            className="flex-1 overflow-y-auto px-5 py-4 font-mono text-[12.5px] leading-[1.65]"
            style={{ color: "var(--hero-cream-65)" }}
          >
            {logs.length === 0 && status === "running" && (
              <div style={{ color: "var(--hero-cream-45)" }}>
                Стартую…
              </div>
            )}
            {logs.map((l) => (
              <div key={l.id} className="flex gap-3">
                <span style={{ color: "var(--peach)" }}>›</span>
                <span>{l.message}</span>
              </div>
            ))}
            {status === "error" && errorMsg && (
              <div
                className="mt-3 flex items-start gap-2 rounded-[8px] px-3 py-2"
                style={{
                  background: "rgba(196,106,74,0.18)",
                  border: "1px solid rgba(196,106,74,0.4)",
                  color: "#E89B7C",
                }}
              >
                <AlertCircle className="mt-px size-3.5 shrink-0" />
                <span className="text-[12px]">{errorMsg}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: profile + services */}
        <div className="flex flex-col gap-4">
          <div
            className="rounded-[16px] bg-white p-5"
            style={{ border: "1px solid var(--border)" }}
          >
            <div className="flex items-center gap-2">
              <Sparkles
                className="size-3.5"
                style={{ color: "var(--peach)" }}
              />
              <span
                className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.1em]"
                style={{ color: "var(--peach-deep)" }}
              >
                Профиль
              </span>
            </div>
            {profile ? (
              <ProfileCard profile={profile} />
            ) : (
              <SkeletonBlock lines={3} />
            )}
          </div>

          <div
            className="flex flex-1 flex-col rounded-[16px] bg-white p-5"
            style={{ border: "1px solid var(--border)" }}
          >
            <div className="flex items-center gap-2">
              <Sparkles
                className="size-3.5"
                style={{ color: "var(--peach)" }}
              />
              <span
                className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.1em]"
                style={{ color: "var(--peach-deep)" }}
              >
                Услуги · {services.length}
              </span>
            </div>
            <div className="mt-3 flex flex-1 flex-col gap-2 overflow-y-auto">
              {services.length === 0 ? (
                <SkeletonBlock lines={2} />
              ) : (
                services.map((s, i) => <ServiceChip key={i} svc={s} />)
              )}
            </div>
          </div>
        </div>

        {/* Footer nav — spans both columns */}
        <div className="flex items-center justify-between lg:col-span-2">
          <button
            onClick={() => {
              abortRef.current?.abort();
              onBack();
            }}
            className="inline-flex items-center gap-2 rounded-[10px] px-4 py-2.5 text-[13.5px] text-[var(--ink-mute)] hover:text-[var(--ink)] transition-colors"
          >
            <ArrowLeft className="size-[14px]" strokeWidth={2} />
            Назад
          </button>
          <button
            onClick={onDone}
            disabled={status !== "done"}
            className="inline-flex items-center gap-2.5 rounded-[11px] px-8 py-3 text-[14.5px] font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            style={{
              background: "var(--peach)",
              boxShadow: "0 6px 18px -6px rgba(232,149,108,0.55)",
            }}
          >
            {status === "done" ? "Подтвердить профиль" : "Идёт анализ…"}
            {status === "done" && (
              <ArrowRight className="size-[14px]" strokeWidth={2} />
            )}
          </button>
        </div>
      </div>
    </OnbFrame>
  );
}

function ProfileCard({ profile }: { profile: ProfileSnapshot }) {
  return (
    <div className="mt-3 space-y-2 text-[13.5px]">
      {profile.name && (
        <div className="font-heading text-[18px] font-bold tracking-[-0.018em]">
          {profile.name}
        </div>
      )}
      {profile.category && (
        <Field label="Категория" value={profile.category} />
      )}
      {profile.usp && <Field label="USP" value={profile.usp} multiline />}
      {profile.target_audience && (
        <Field label="Аудитория" value={profile.target_audience} multiline />
      )}
      {(profile.country || profile.city) && (
        <Field
          label="Гео"
          value={[profile.city, profile.country].filter(Boolean).join(", ")}
        />
      )}
      {profile.languages && profile.languages.length > 0 && (
        <Field label="Языки" value={profile.languages.join(", ")} />
      )}
    </div>
  );
}

function Field({
  label,
  value,
  multiline,
}: {
  label: string;
  value: string;
  multiline?: boolean;
}) {
  return (
    <div>
      <div className="text-[10.5px] uppercase tracking-[0.06em] text-[var(--ink-subtle)] font-mono">
        {label}
      </div>
      <div
        className={`text-[var(--ink)] ${multiline ? "leading-snug" : ""}`}
      >
        {value}
      </div>
    </div>
  );
}

function ServiceChip({ svc }: { svc: ServiceSnapshot }) {
  const price = svc.price
    ? `${svc.price_note ? svc.price_note + " " : ""}${svc.price} ${svc.price_currency ?? ""}`
    : null;
  return (
    <div
      className="rounded-[10px] px-3 py-2.5"
      style={{
        background: "var(--peach-wash)",
        border: "1px solid var(--peach-soft)",
      }}
    >
      <div className="flex items-center gap-2">
        <div className="text-[13px] font-semibold tracking-[-0.01em] text-[var(--ink)]">
          {svc.name}
        </div>
        {price && (
          <div
            className="ml-auto font-mono text-[11.5px] tabular-nums"
            style={{ color: "var(--peach-deep)" }}
          >
            {price}
          </div>
        )}
      </div>
      {svc.description && (
        <div className="mt-1 text-[11.5px] leading-snug text-[var(--ink-mute)]">
          {svc.description}
        </div>
      )}
    </div>
  );
}

function SkeletonBlock({ lines }: { lines: number }) {
  return (
    <div className="mt-3 space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-3 animate-pulse rounded-[4px]"
          style={{ background: "var(--card-soft)", width: i === 0 ? "70%" : "100%" }}
        />
      ))}
    </div>
  );
}

// ── SSE driver ──────────────────────────────────────────────────────────────

async function runAnalyze({
  siteUrl,
  textDescription,
  signal,
  onLog,
  onProfile,
  onServices,
  onDone,
  onError,
  onStart,
}: {
  siteUrl?: string;
  textDescription?: string;
  signal: AbortSignal;
  onLog: (msg: string) => void;
  onProfile: (p: ProfileSnapshot) => void;
  onServices: (s: ServiceSnapshot[]) => void;
  onDone: (durationMs: number) => void;
  onError: (msg: string) => void;
  onStart: () => void;
}) {
  const token = getSessionToken();
  if (!token) {
    onError("Нет сессии — войди заново");
    return;
  }
  onStart();
  try {
    const res = await fetch(`${config.apiUrl}/api/web/onboarding/analyze`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "1",
      },
      body: JSON.stringify({
        site_url: siteUrl || null,
        text_description: textDescription || null,
      }),
      signal,
    });
    if (!res.ok || !res.body) {
      onError(`HTTP ${res.status}`);
      return;
    }
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      // SSE frames separated by blank line
      let idx;
      while ((idx = buffer.indexOf("\n\n")) >= 0) {
        const frame = buffer.slice(0, idx).trim();
        buffer = buffer.slice(idx + 2);
        if (!frame.startsWith("data:")) continue;
        try {
          const payload = JSON.parse(frame.slice(5).trim());
          dispatchEvent(payload, { onLog, onProfile, onServices, onDone, onError });
        } catch {
          // ignore malformed frame
        }
      }
    }
  } catch (e) {
    if ((e as Error).name === "AbortError") return;
    onError((e as Error).message || "stream broken");
  }
}

function dispatchEvent(
  payload: { type: string;[k: string]: unknown },
  cbs: {
    onLog: (m: string) => void;
    onProfile: (p: ProfileSnapshot) => void;
    onServices: (s: ServiceSnapshot[]) => void;
    onDone: (ms: number) => void;
    onError: (m: string) => void;
  }
) {
  switch (payload.type) {
    case "log":
      cbs.onLog(String(payload.message ?? ""));
      break;
    case "profile":
      cbs.onProfile((payload.profile as ProfileSnapshot) || {});
      break;
    case "found_services":
      cbs.onServices((payload.services as ServiceSnapshot[]) || []);
      break;
    case "done":
      cbs.onDone(Number(payload.duration_ms ?? 0));
      break;
    case "error":
      cbs.onError(String(payload.message ?? "AI failed"));
      break;
  }
}
