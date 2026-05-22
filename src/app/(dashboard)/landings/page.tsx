"use client";

import { useEffect, useMemo, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Globe, Sparkles, Check, Settings as SettingsIcon, ExternalLink, Upload, Loader2 } from "lucide-react";
import { tgBridge, type ServiceSummary } from "@/lib/tg-bridge";
import { toast } from "sonner";

/**
 * Landings page — design handoff iter-2 §screen-extras LANDINGS.
 *
 * One landing per BusinessService. has_landing + landing_url drive status.
 * Visitor / conv stats: backend endpoint TBD; for now hide that strip when
 * no real data and just show the preview + meta.
 */

type LandingStatus = "published" | "draft" | "none";

type LandingItem = {
  service: ServiceSummary;
  status: LandingStatus;
  url: string | null;
  tint: string;
  heroHeadline: string;
};

export default function LandingsPage() {
  const [services, setServices] = useState<ServiceSummary[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [republishing, setRepublishing] = useState<number | null>(null);

  useEffect(() => {
    tgBridge.services()
      .then(setServices)
      .catch((e) => {
        console.error(e);
        toast.error("Не удалось загрузить лендинги");
      })
      .finally(() => setLoading(false));
  }, []);

  async function republish(serviceId: number) {
    setRepublishing(serviceId);
    try {
      const r = await tgBridge.republishLanding(serviceId);
      if (!r.ok) {
        toast.error(r.detail ?? "Не удалось перевыложить");
        return;
      }
      toast.success(`Перевыложено · ${r.backend === "cloudflare" ? "Cloudflare KV" : "локально"}`);
      // Refresh service list so URL updates immediately.
      const fresh = await tgBridge.services();
      setServices(fresh);
    } catch (e: unknown) {
      console.error(e);
      const msg = e instanceof Error ? e.message : "Не удалось перевыложить";
      toast.error(msg);
    } finally {
      setRepublishing(null);
    }
  }

  const items = useMemo(() => buildItems(services ?? []), [services]);

  return (
    <div className="p-7 max-w-[1400px]">
      <header className="flex flex-col lg:flex-row lg:items-end gap-4 mb-5">
        <div className="flex-1">
          <h1 className="font-heading text-[28px] font-bold leading-none tracking-[-0.025em]">
            Лендинги
          </h1>
          <p className="text-[13.5px] text-[var(--ink-mute)] mt-1.5">
            AI-генерированные одностраничники под каждую услугу — с реальными контактами и формой
          </p>
        </div>
        <div className="flex gap-2">
          <button
            disabled
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-[10px] text-[13px] font-medium text-[var(--ink)] bg-card border border-[var(--border)] disabled:opacity-60"
            title="Скоро: кастомный домен"
          >
            <Globe className="size-[13px] text-[var(--ink-mute)]" />
            Кастомный домен
          </button>
          <button
            disabled
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-[10px] text-[13px] font-medium text-white disabled:opacity-80"
            style={{ background: "var(--peach)" }}
            title="Скоро: ручной триггер регенерации"
          >
            <Sparkles className="size-[13px]" />
            Сгенерить лендинг
          </button>
        </div>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-[360px] rounded-[14px]" />)}
        </div>
      ) : items.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
          {items.map((it) => (
            <LandingCard
              key={it.service.id}
              item={it}
              busy={republishing === it.service.id}
              onRepublish={() => republish(it.service.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}


// ═════════════════════════════════════════════════════════════════════════════
// Card
// ═════════════════════════════════════════════════════════════════════════════

function LandingCard({
  item, busy, onRepublish,
}: {
  item: LandingItem;
  busy: boolean;
  onRepublish: () => void;
}) {
  const businessName = item.service.name;
  const isCloudflare = (item.url ?? "").includes(".workers.dev") || (item.url ?? "").includes("landings.");
  const isLocal = (item.url ?? "").includes("localhost") || (item.url ?? "").startsWith("http://127");
  return (
    <div className="rounded-[14px] border border-[var(--border)] bg-card overflow-hidden flex flex-col">
      {/* Preview area */}
      <div
        className="relative h-[200px] p-4 flex flex-col"
        style={
          item.status === "none"
            ? { background: `repeating-linear-gradient(135deg, #f3eee2 0 10px, #ece6d6 10px 20px)` }
            : { background: `linear-gradient(160deg, ${item.tint} 0%, ${item.tint}aa 60%, ${item.tint}55 100%)` }
        }
      >
        {item.status === "none" ? (
          <div className="m-auto text-center">
            <Globe className="size-6 mx-auto text-[var(--ink-subtle)]" />
            <div className="text-[12px] text-[var(--ink-subtle)] mt-2">Лендинг не создан</div>
          </div>
        ) : (
          <>
            <div
              className="absolute inset-0 opacity-25"
              style={{ background: `repeating-linear-gradient(135deg, ${item.tint} 0 14px, ${item.tint}cc 14px 28px)` }}
            />
            <div className="relative z-10 flex items-center gap-1.5">
              <div
                className="px-2 py-0.5 rounded-full font-mono text-[10px] font-semibold uppercase"
                style={{ background: "rgba(255,255,255,0.9)", color: item.tint, letterSpacing: "0.04em" }}
              >
                {truncate(businessName, 16)}
              </div>
              <div className="flex-1" />
              <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.9)" }}>
                Услуги · Команда · Контакты
              </span>
            </div>
            <div className="flex-1" />
            <div className="relative z-10">
              <div
                className="font-heading text-[22px] font-bold leading-[1.1] tracking-[-0.015em] text-white mb-2"
                style={{ textShadow: "0 1px 2px rgba(0,0,0,0.15)" }}
              >
                {item.heroHeadline}
              </div>
              <div
                className="px-3.5 py-1.5 rounded-full text-[12px] font-semibold inline-block"
                style={{ background: "#fff", color: item.tint }}
              >
                Записаться бесплатно →
              </div>
            </div>
          </>
        )}

        {item.status === "published" && (
          <div
            className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full flex items-center gap-1 font-mono text-[9.5px] font-semibold uppercase"
            style={{ background: "rgba(255,255,255,0.95)", color: "#456838", letterSpacing: "0.04em" }}
          >
            <span className="size-1.5 rounded-full" style={{ background: "var(--sage)" }} />
            LIVE
          </div>
        )}
        {item.status === "draft" && (
          <div
            className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full flex items-center gap-1 font-mono text-[9.5px] font-semibold uppercase"
            style={{ background: "rgba(255,255,255,0.95)", color: "var(--warn)", letterSpacing: "0.04em" }}
          >
            <span className="size-1.5 rounded-full" style={{ background: "var(--warn)" }} />
            DRAFT
          </div>
        )}
      </div>

      {/* Meta */}
      <div className="px-4 py-3.5 flex flex-col gap-2.5">
        <div className="flex items-center gap-2.5">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <div className="text-[14px] font-semibold text-[var(--ink)] truncate">
                {item.service.name}
              </div>
              {item.status === "published" && (isLocal || isCloudflare) && (
                <span
                  className="px-1.5 py-px rounded font-mono text-[9.5px] font-semibold uppercase tracking-[0.04em] shrink-0"
                  style={
                    isCloudflare
                      ? { background: "var(--meta-soft)", color: "var(--meta-ink)" }
                      : { background: "var(--card-soft)", color: "var(--ink-mute)" }
                  }
                  title={isCloudflare ? "Раздаётся через Cloudflare Workers KV" : "Раздаётся локально из FastAPI"}
                >
                  {isCloudflare ? "CF KV" : "LOCAL"}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 font-mono text-[11px] text-[var(--ink-subtle)] mt-0.5">
              <Globe className="size-[10px]" />
              <span className="truncate">{item.url ?? "—"}</span>
            </div>
          </div>
          {item.status === "published" && <ScoreBadge score={8} />}
        </div>

        <div className="flex gap-1.5 mt-1 flex-wrap">
          {item.status === "published" && item.url ? (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[7px] text-[11.5px] font-medium text-[var(--ink)] bg-[var(--card-soft)] border border-[var(--border)] hover:bg-[var(--background)] transition-colors"
            >
              <ExternalLink className="size-[11px] text-[var(--ink-mute)]" />
              Открыть
            </a>
          ) : (
            <button
              onClick={onRepublish}
              disabled={busy || item.status === "none"}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[7px] text-[11.5px] font-medium text-[var(--ink)] bg-[var(--card-soft)] border border-[var(--border)] hover:bg-[var(--background)] transition-colors disabled:opacity-50"
              title={item.status === "none" ? "HTML ещё не сгенерирован — пройди визард" : "Опубликовать через активный backend"}
            >
              {busy ? <Loader2 className="size-[11px] animate-spin" /> : <Globe className="size-[11px] text-[var(--ink-mute)]" />}
              {item.status === "draft" ? "Опубликовать" : "Создать"}
            </button>
          )}
          {item.status === "published" && (
            <button
              onClick={onRepublish}
              disabled={busy}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[7px] text-[11.5px] font-medium text-[var(--ink)] bg-[var(--card-soft)] border border-[var(--border)] hover:bg-[var(--background)] transition-colors disabled:opacity-50"
              title="Перевыложить через активный backend (например после переключения на Cloudflare)"
            >
              {busy ? <Loader2 className="size-[11px] animate-spin" /> : <Upload className="size-[11px] text-[var(--ink-mute)]" />}
              Перевыложить
            </button>
          )}
          <button
            disabled
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[7px] text-[11.5px] font-medium text-[var(--ink)] bg-[var(--card-soft)] border border-[var(--border)] disabled:opacity-50"
            title="Скоро: A/B-тест версии лендинга"
          >
            <Sparkles className="size-[11px] text-[var(--ink-mute)]" />
            A/B тест
          </button>
          <div className="flex-1" />
          <button
            disabled
            className="flex items-center px-2 py-1.5 rounded-[7px] bg-[var(--card-soft)] border border-[var(--border)] disabled:opacity-50"
            title="Настройки лендинга"
          >
            <SettingsIcon className="size-[11px] text-[var(--ink-mute)]" />
          </button>
        </div>
      </div>
    </div>
  );
}


// ═════════════════════════════════════════════════════════════════════════════
// Score badge
// ═════════════════════════════════════════════════════════════════════════════

function ScoreBadge({ score }: { score: number }) {
  const tone =
    score >= 8 ? { fg: "var(--sage)", bg: "var(--sage-soft)" }
    : score >= 6 ? { fg: "var(--warn)", bg: "#FBEDD3" }
    : { fg: "var(--destructive)", bg: "#F8DDD0" };
  return (
    <span
      className="flex items-center gap-1 px-2 py-1 rounded-[7px] font-mono text-[11px] font-semibold shrink-0"
      style={{ background: tone.bg, color: tone.fg }}
    >
      <Check className="size-[10px]" strokeWidth={2.4} />
      {score}/10
    </span>
  );
}


// ═════════════════════════════════════════════════════════════════════════════
// Empty state
// ═════════════════════════════════════════════════════════════════════════════

function EmptyState() {
  return (
    <div className="rounded-[14px] border border-[var(--border)] bg-card px-6 py-12 text-center">
      <Globe className="size-10 mx-auto mb-3 text-[var(--ink-subtle)]/50" />
      <p className="text-sm font-medium text-[var(--ink)]">Лендингов пока нет.</p>
      <p className="text-xs text-[var(--ink-mute)] mt-1">
        Добавь услугу в /services — AI сгенерит лендинг автоматически.
      </p>
    </div>
  );
}


// ═════════════════════════════════════════════════════════════════════════════
// Helpers
// ═════════════════════════════════════════════════════════════════════════════

function buildItems(services: ServiceSummary[]): LandingItem[] {
  return services.map((s) => {
    const status: LandingStatus =
      s.has_landing && s.landing_url ? "published"
      : s.has_landing ? "draft"
      : "none";
    return {
      service: s,
      status,
      url: s.landing_url ?? null,
      tint: pickTint(s.id, s.name),
      heroHeadline: s.sample_headlines[0] || s.name,
    };
  });
}

/** Deterministic tint from id/name so two re-renders match. */
function pickTint(id: number, name: string): string {
  const palette = ["#3B5C44", "#46538C", "#4C5B3E", "#5E4A38", "#2E3F4F", "#3C5F70", "#695440", "#4A4040"];
  let h = id;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return palette[h % palette.length];
}

function truncate(s: string, n: number): string {
  return s.length <= n ? s : `${s.slice(0, n - 1)}…`;
}
