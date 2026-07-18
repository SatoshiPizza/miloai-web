"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState as SharedEmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Rocket, RefreshCcw, Globe, FolderOpen, Sparkles, FileText, X, Check,
} from "lucide-react";
import { tgBridge, type ServiceSummary, type ServiceBannerPreview } from "@/lib/tg-bridge";

/**
 * Services catalog — design handoff §5.
 * Each service is a horizontal card with three columns:
 *   left  — identity (name, price, status, landing, stats)
 *   center — 3 mini-banner previews + sample Google headlines
 *   right — vertical action stack (Launch / Regenerate / Edit / Landing)
 */

export default function ServicesPage() {
  const [services, setServices] = useState<ServiceSummary[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    tgBridge.services()
      .then(setServices)
      .catch((e) => {
        console.error(e);
        setError("Не удалось загрузить услуги.");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8 max-w-[1200px] space-y-6">
      <header>
        <h1 className="font-heading text-[28px] font-bold tracking-tight">
          Что рекламируем?
        </h1>
        <p className="text-[13.5px] text-[var(--ink-mute)] mt-1">
          Выбери продукт — с него и начинается кампания.
        </p>
      </header>

      <HowItWorks />

      {error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-44 w-full" />)}
        </div>
      ) : !services || services.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-4">
          {services.map((s) => <ServiceCard key={s.id} service={s} />)}
        </div>
      )}
    </div>
  );
}


function ServiceCard({ service }: { service: ServiceSummary }) {
  const hasCreatives = service.has_meta_creatives && service.banner_previews.length > 0;
  const ready = hasCreatives && service.has_google_rsa;
  const statusLabel = ready ? "Готова к запуску" : hasCreatives ? "Креативы есть" : "Черновик";
  const statusColor = ready ? "var(--sage)" : hasCreatives ? "var(--warn)" : "var(--ink-subtle)";
  const statusBg = ready ? "var(--sage-soft)" : hasCreatives ? "#FBEFD4" : "var(--card-soft)";

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex flex-col lg:flex-row gap-0">
          {/* ── Left: identity 220px ── */}
          <div className="p-5 lg:w-[240px] shrink-0 border-b lg:border-b-0 lg:border-r" style={{ borderColor: "var(--border)" }}>
            <h3 className="font-heading text-[19px] font-bold tracking-tight leading-tight">
              {service.name}
            </h3>
            {service.price ? (
              <div className="font-mono text-[12.5px] text-[var(--ink-mute)] mt-1 tabular-nums">
                {service.price_currency === "EUR" ? "€" : ""}{Math.round(service.price)}
              </div>
            ) : (
              <div className="font-mono text-[12.5px] text-[var(--ink-subtle)] mt-1 italic">цена не задана</div>
            )}

            <div className="flex flex-wrap items-center gap-1.5 mt-3">
              <div
                className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md font-mono text-[10.5px] font-semibold uppercase tracking-[0.04em]"
                style={{ background: statusBg, color: statusColor }}
              >
                <span className="size-1.5 rounded-full" style={{ background: statusColor }} />
                {statusLabel}
              </div>
              <ReadinessPill score={service.profile_score} />
            </div>

            {service.landing_url && (
              <a
                href={service.landing_url}
                target="_blank"
                rel="noreferrer"
                className="block mt-3 text-[12px] text-[var(--peach-deep)] underline decoration-dotted underline-offset-2 truncate"
              >
                {service.landing_url.replace(/^https?:\/\//, "")}
              </a>
            )}

            <div className="mt-4 space-y-1.5 text-[11.5px] font-mono text-[var(--ink-mute)]">
              <Stat label="Аудитория" value={service.target_audience || "—"} />
              <Stat label="Описание" value={truncate(service.description, 60) || "—"} />
            </div>
          </div>

          {/* ── Center: creatives preview (flex 1) ── */}
          <div className="p-5 flex-1 min-w-0 space-y-3">
            <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--ink-subtle)]">
              {hasCreatives
                ? `${service.banner_previews.length} креатив${service.banner_previews.length === 1 ? "" : "а"} (Meta) · ${service.sample_headlines.length} headline (Google)`
                : "Креативы не сгенерированы"}
            </div>

            {hasCreatives ? (
              <>
                <div className="grid grid-cols-3 gap-2">
                  {service.banner_previews.map((b, i) => (
                    <MiniCreative key={i} banner={b} brand={service.name} />
                  ))}
                </div>
                {service.sample_headlines.length > 0 && (
                  <div className="rounded-md border bg-[var(--card-soft)]/40 p-2.5 mt-2" style={{ borderColor: "var(--border)" }}>
                    <div className="font-mono text-[9.5px] font-semibold uppercase tracking-[0.08em] text-[var(--ink-subtle)] mb-1.5 flex items-center gap-1">
                      <FileText className="size-2.5" /> Google headlines
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {service.sample_headlines.slice(0, 5).map((h, i) => (
                        <span
                          key={i}
                          className="font-mono text-[11px] px-2 py-0.5 rounded bg-white border tabular-nums"
                          style={{ borderColor: "var(--border)", color: "var(--ink)" }}
                        >
                          {h}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div
                className="rounded-md p-5 text-center border-2 border-dashed"
                style={{ borderColor: "var(--border)" }}
              >
                <Sparkles className="size-5 mx-auto text-[var(--peach)] mb-1.5" strokeWidth={1.6} />
                <div className="text-[12.5px] text-[var(--ink-mute)]">
                  Запусти кампанию — AI сгенерит 3 баннера + 15 headlines + лендинг (~30 сек).
                </div>
              </div>
            )}
          </div>

          {/* ── Right: actions 180px ──
              Novice steering: when the offer profile is thin (<60), the first,
              filled button is "Заполнить профиль" — that's what makes creatives
              good. Once filled, "Запустить кампанию" takes the primary slot. */}
          <div className="p-5 lg:w-[200px] shrink-0 flex flex-col gap-2 border-t lg:border-t-0 lg:border-l bg-[var(--card-soft)]/30" style={{ borderColor: "var(--border)" }}>
            {service.profile_score < 60 ? (
              <>
                <Link href={`/services/${service.id}/intake`}>
                  <Button className="w-full justify-start gap-2">
                    <FileText className="size-4" strokeWidth={1.8} />
                    Заполнить профиль
                  </Button>
                </Link>
                <Link href={`/campaigns/new?service=${service.id}`}>
                  <Button variant="outline" className="w-full justify-start gap-2" disabled={!ready}>
                    <Rocket className="size-4" strokeWidth={1.6} />
                    Запустить кампанию
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href={`/campaigns/new?service=${service.id}`}>
                  <Button className="w-full justify-start gap-2" disabled={!ready}>
                    <Rocket className="size-4" strokeWidth={1.8} />
                    Запустить кампанию
                  </Button>
                </Link>
                <Link href={`/services/${service.id}/intake`}>
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <FileText className="size-4" strokeWidth={1.6} />
                    Профиль
                  </Button>
                </Link>
              </>
            )}
            <Button variant="outline" className="w-full justify-start gap-2" disabled>
              <RefreshCcw className="size-4" strokeWidth={1.6} />
              Регенерить
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2" disabled={!service.has_landing}>
              <Globe className="size-4" strokeWidth={1.6} />
              {service.has_landing ? "Лендинг" : "Сгенерить лендинг"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


/**
 * Mini banner preview — tinted gradient by color_scheme + angle pill + headline.
 * Maps the BannerVariant color_scheme keyword to a CSS gradient pair.
 */
function MiniCreative({ banner, brand }: { banner: ServiceBannerPreview; brand: string }) {
  const palettes: Record<string, { from: string; to: string; accent: string; text: string }> = {
    red:    { from: "#7C1D1D", to: "#A22D2D", accent: "#FFE074", text: "#fff" },
    blue:   { from: "#1E3A8A", to: "#2954B8", accent: "#FBBF24", text: "#fff" },
    dark:   { from: "#0F0F12", to: "#26242A", accent: "#C8A04E", text: "#fff" },
    green:  { from: "#1F4D31", to: "#2E6E47", accent: "#FEF08A", text: "#fff" },
    purple: { from: "#3F1F6E", to: "#5B2D9F", accent: "#FDE047", text: "#fff" },
    orange: { from: "#7C2D12", to: "#A04515", accent: "#FEF3C7", text: "#fff" },
    navy:   { from: "#0B1437", to: "#1B2A5E", accent: "#FBBF24", text: "#fff" },
  };
  const p = palettes[banner.color_scheme] || palettes.red;
  const angleLabel = (() => {
    switch (banner.angle) {
      case "pain_solution": return "PAIN+";
      case "direct_offer": return "OFFER";
      case "trust_premium": return "TRUST";
      default: return banner.angle.toUpperCase().slice(0, 6);
    }
  })();

  return (
    <div
      className="aspect-square rounded-md p-3 flex flex-col justify-between overflow-hidden relative shadow-sm"
      style={{
        background: `linear-gradient(135deg, ${p.from} 0%, ${p.to} 100%)`,
        color: p.text,
      }}
    >
      {/* Diagonal stripe overlay for texture (per handoff §Creatives Gallery). */}
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage: "repeating-linear-gradient(135deg, transparent 0 12px, rgba(255,255,255,0.04) 12px 14px)",
        }}
      />

      {/* Top row: brand pill + angle pill */}
      <div className="flex items-start justify-between relative z-10">
        <span
          className="font-mono text-[8.5px] font-semibold uppercase tracking-[0.08em] px-1.5 py-0.5 rounded bg-white/95"
          style={{ color: p.from }}
        >
          {brand.slice(0, 14).toUpperCase()}
        </span>
        <span
          className="font-mono text-[8.5px] font-semibold uppercase tracking-[0.06em] px-1.5 py-0.5 rounded"
          style={{ background: p.accent, color: p.from }}
        >
          {angleLabel}
        </span>
      </div>

      {/* Headline */}
      <div className="relative z-10">
        <div
          className="font-heading text-[11.5px] font-bold leading-tight"
          style={{ textShadow: "0 1px 2px rgba(0,0,0,0.3)" }}
        >
          {banner.headline.slice(0, 28)}
        </div>
        {banner.subheadline && (
          <div className="text-[9px] mt-0.5 opacity-90" style={{ color: p.accent }}>
            {banner.subheadline.slice(0, 28)}
          </div>
        )}
      </div>
    </div>
  );
}


function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-[var(--ink-subtle)] shrink-0">{label}</span>
      <span className="text-[var(--ink)] truncate text-right">{value}</span>
    </div>
  );
}


function EmptyState() {
  return (
    <SharedEmptyState
      icon={FolderOpen}
      eyebrow="Услуги"
      title="AI ещё не разобрал твой бизнес"
      body="Пройди онбординг с реальным AI-анализом сайта — за 30 секунд я вытащу услуги, цены, USP и сложу каталог."
      actions={[
        {
          label: "Запустить анализ",
          href: "/onboarding",
          primary: true,
          icon: Sparkles,
        },
        {
          label: "Добавить вручную в чате",
          href: "/chat",
        },
      ]}
    />
  );
}


function truncate(s: string | null | undefined, n: number): string {
  if (!s) return "";
  return s.length > n ? s.slice(0, n) + "…" : s;
}


// ── "How it works" strip ─────────────────────────────────────────────────

const HOWITWORKS_KEY = "uniads.services.howitworks.dismissed";

// A three-step orientation for first-timers who clicked "Новая кампания" and
// landed here. Dismissible and remembered, so it doesn't nag returning users.
function HowItWorks() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Read on mount to avoid SSR/localStorage mismatch.
    setShow(
      typeof window !== "undefined" &&
        window.localStorage.getItem(HOWITWORKS_KEY) !== "1",
    );
  }, []);

  if (!show) return null;

  const steps = [
    { n: 1, title: "Выбери продукт", body: "то, что рекламируешь — ниже в списке" },
    { n: 2, title: "Заполни профиль", body: "5 минут голосом → AI соберёт сильные креативы" },
    { n: 3, title: "Запусти кампанию", body: "бюджет, аудит и старт в Meta / Google" },
  ];

  return (
    <div
      className="relative rounded-[14px] p-4 pr-10"
      style={{
        background: "linear-gradient(135deg, #FCF1E8 0%, #F8E8D9 100%)",
        border: "1px solid #F5DDC8",
      }}
    >
      <button
        onClick={() => {
          window.localStorage.setItem(HOWITWORKS_KEY, "1");
          setShow(false);
        }}
        className="absolute top-3 right-3 size-6 rounded-md flex items-center justify-center text-[var(--ink-mute)] hover:bg-white/50 transition-colors"
        title="Скрыть"
      >
        <X className="size-3.5" />
      </button>
      <div className="mb-2.5 font-mono text-[10px] font-semibold uppercase tracking-[0.1em]" style={{ color: "var(--peach-deep)" }}>
        Как запустить рекламу
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {steps.map((s) => (
          <div key={s.n} className="flex items-start gap-2.5">
            <div
              className="mt-0.5 size-6 shrink-0 rounded-full flex items-center justify-center font-mono text-[12px] font-semibold text-white"
              style={{ background: "var(--peach)" }}
            >
              {s.n}
            </div>
            <div>
              <div className="text-[13px] font-semibold text-[var(--ink)] leading-tight">
                {s.title}
              </div>
              <div className="text-[11.5px] text-[var(--peach-ink)]/75 leading-snug mt-0.5">
                {s.body}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


// ── Per-card profile readiness ───────────────────────────────────────────

// Compact readiness pill + a hint of which action to take next. Green when
// the offer profile is filled enough for good creatives, peach when it still
// needs answers.
function ReadinessPill({ score }: { score: number }) {
  const ready = score >= 60;
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-mono text-[10px] font-semibold uppercase tracking-[0.04em]"
      style={{
        background: ready ? "var(--sage-soft)" : "var(--peach-wash)",
        color: ready ? "#456838" : "var(--peach-deep)",
      }}
      title={ready ? "Профиль заполнен — креативы будут сильными" : "Заполни профиль, чтобы креативы стали конкретными"}
    >
      {ready ? <Check className="size-2.5" strokeWidth={3} /> : null}
      Профиль {score}%
    </span>
  );
}
