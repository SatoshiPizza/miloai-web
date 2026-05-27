"use client";

import { useState } from "react";
import { Search, Loader2, Users, FileText, Layers, Activity, Lightbulb, ExternalLink, AlertTriangle } from "lucide-react";
import { MetaGlyph, GoogleGlyph } from "@/components/platform-badge";
import { toast } from "sonner";
import { tgBridge, type CompetitorResearchResult, type CompetitorAd } from "@/lib/tg-bridge";

/**
 * Competitors — niche-level intel. Backend is a deterministic mock until
 * Meta App Review approves the ads_archive permission; UI is final.
 *
 * Tabs: Google Ads / Meta Ads. Same data shape per platform.
 *
 * Default view: empty search bar + a hint card. Real content renders after
 * the user types a niche (e.g. "стоматология Tallinn") and hits Enter.
 */

type Tab = "google" | "meta";

export default function CompetitorsPage() {
  const [tab, setTab] = useState<Tab>("meta");
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState("EE");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CompetitorResearchResult | null>(null);

  async function runResearch() {
    const q = query.trim();
    if (!q) {
      toast.error("Введи нишу — например 'стоматология' или 'jewelry'");
      return;
    }
    setLoading(true);
    try {
      const r = await tgBridge.researchCompetitors(q, country);
      if (!r.ok) {
        toast.error(r.error || "Не удалось получить данные");
      }
      setResult(r);
    } catch (e: unknown) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : "Ошибка запроса");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-7 max-w-[1400px]">
      <header className="mb-5">
        <h1 className="font-heading text-[28px] font-bold leading-none tracking-[-0.025em]">
          Конкуренты
        </h1>
        <p className="text-[13.5px] text-[var(--ink-mute)] mt-1.5">
          Что крутят в Meta Ad Library и Google Ads Transparency игроки твоей ниши — учимся на их углах
        </p>
      </header>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[var(--border)] mb-5 overflow-x-auto">
        <TabButton active={tab === "google"} onClick={() => setTab("google")}>
          <GoogleGlyph size={14} /> Google Ads
        </TabButton>
        <TabButton active={tab === "meta"} onClick={() => setTab("meta")}>
          <MetaGlyph size={14} /> Meta Ads
        </TabButton>
      </div>

      {/* Search bar */}
      <div className="rounded-[12px] border border-[var(--border)] bg-card p-3.5 flex items-center gap-2.5 mb-5">
        <Search className="size-[15px] text-[var(--ink-subtle)]" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !loading && runResearch()}
          placeholder="Ниша: стоматология / jewelry / fitness…"
          className="flex-1 bg-transparent outline-none text-[14px] placeholder:text-[var(--ink-subtle)] text-[var(--ink)]"
        />
        <select
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="px-2 py-1 rounded-md border border-[var(--border)] bg-[var(--card-soft)] text-[12.5px] outline-none"
        >
          <option value="EE">Estonia</option>
          <option value="UA">Ukraine</option>
          <option value="DE">Germany</option>
          <option value="FI">Finland</option>
          <option value="LV">Latvia</option>
          <option value="LT">Lithuania</option>
          <option value="US">USA</option>
        </select>
        <button
          onClick={runResearch}
          disabled={loading || !query.trim()}
          className="px-3.5 py-1.5 rounded-md text-[12.5px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50 inline-flex items-center gap-1.5"
          style={{ background: "var(--ink)" }}
        >
          {loading && <Loader2 className="size-3.5 animate-spin" />}
          Разобрать
        </button>
      </div>

      {!result ? (
        <EmptyHint />
      ) : (
        <Report result={result} platform={tab} />
      )}
    </div>
  );
}


// ═════════════════════════════════════════════════════════════════════════════
// Tabs
// ═════════════════════════════════════════════════════════════════════════════

function TabButton({
  active, onClick, children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2.5 -mb-px text-[13.5px] inline-flex items-center gap-2 transition-colors whitespace-nowrap"
      style={{
        borderBottom: active ? `2px solid var(--peach)` : "2px solid transparent",
        fontWeight: active ? 600 : 400,
        color: active ? "var(--ink)" : "var(--ink-mute)",
      }}
    >
      {children}
    </button>
  );
}


// ═════════════════════════════════════════════════════════════════════════════
// Report (Overview + Donuts + Top Ads + Insights)
// ═════════════════════════════════════════════════════════════════════════════

function Report({ result, platform }: { result: CompetitorResearchResult; platform: Tab }) {
  const overview = result.overview;
  return (
    <>
      {result.is_mock && (
        <div
          className="rounded-[10px] border p-3 mb-5 flex items-start gap-2.5 text-[12.5px]"
          style={{ background: "#FBEDD3", borderColor: "#E9C9A0", color: "var(--peach-deep)" }}
        >
          <AlertTriangle className="size-4 mt-0.5 shrink-0" />
          <div>
            <b>Mock data.</b> Сейчас показаны детерминированные демо-цифры — реальная Meta Ad Library подключается после одобрения <code>ads_archive</code> в App Review. UI и логика финальные; данные подменятся одним переключателем флага в backend.
          </div>
        </div>
      )}

      <h2 className="font-heading text-[18px] font-bold tracking-[-0.018em] text-[var(--peach-deep)] mb-3">
        Overview
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <OverviewCard icon={Users}    label="Players"    value={overview.players.toString()} />
        <OverviewCard icon={FileText} label="Pages"      value={overview.pages.toString()} />
        <OverviewCard icon={Layers}   label="Ads (90D)"  value={overview.ads_90d.toString()} />
        <OverviewCard icon={Activity} label="Active Ads" value={overview.active_ads.toString()} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-7">
        <DonutCard
          title="Top Ad Formats"
          data={overview.top_formats}
          palette={{ image: "#5764F1", video: "#0FB6B0", carousel: "#F0A030" }}
        />
        <DonutCard
          title="Top Languages"
          data={overview.top_languages}
          palette={{ et: "#5764F1", ru: "#0FB6B0", en: "#F0A030", uk: "#5764F1", es: "#0FB6B0", fr: "#F0A030" }}
        />
        <DonutCard
          title="Ad Destinations"
          data={overview.ad_destinations}
          palette={{
            website: "#5764F1",
            direct_message: "#0FB6B0",
            instagram_page: "#F0A030",
            product: "#22A06B",
          }}
        />
      </div>

      <h2 className="font-heading text-[18px] font-bold tracking-[-0.018em] text-[var(--peach-deep)] mb-3">
        Top Media Ads
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-7">
        {result.top_ads.map((ad, i) => <AdCard key={i} ad={ad} platform={platform} />)}
      </div>

      <h2 className="font-heading text-[18px] font-bold tracking-[-0.018em] text-[var(--peach-deep)] mb-3">
        Strategic Insights
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
        {result.insights.map((it, i) => (
          <div
            key={i}
            className="rounded-[10px] border border-[var(--border)] bg-card p-4"
          >
            <div className="flex items-start gap-2.5">
              <Lightbulb className="size-4 mt-0.5 shrink-0" style={{ color: "var(--peach-deep)" } as React.CSSProperties} />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-[14px] text-[var(--ink)] tracking-[-0.005em] mb-1">
                  {it.headline}
                </div>
                <div className="text-[13px] text-[var(--ink-mute)] leading-relaxed">
                  {it.body}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}


// ═════════════════════════════════════════════════════════════════════════════
// Building blocks
// ═════════════════════════════════════════════════════════════════════════════

function OverviewCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[10px] border border-[var(--border)] bg-card p-4">
      <div className="flex items-center gap-1.5 mb-1.5">
        <Icon className="size-[13px] text-[var(--ink-subtle)]" strokeWidth={1.7} />
        <span className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-[var(--ink-subtle)]">
          {label}
        </span>
      </div>
      <div className="font-mono text-[26px] font-semibold tabular-nums tracking-[-0.015em] text-[var(--ink)] leading-none">
        {value}
      </div>
    </div>
  );
}

function DonutCard({
  title,
  data,
  palette,
}: {
  title: string;
  data: Record<string, number>;
  palette: Record<string, string>;
}) {
  const entries = Object.entries(data).filter(([, v]) => v > 0);
  const total = entries.reduce((a, [, v]) => a + v, 0) || 1;
  const size = 160;
  const cx = size / 2;
  const cy = size / 2;
  const r = 58;
  const thickness = 18;

  let cumulative = 0;
  const segments = entries.map(([key, value]) => {
    const pct = value / total;
    const start = cumulative;
    cumulative += pct;
    const end = cumulative;
    return { key, value, pct, start, end, color: palette[key] || "var(--ink-subtle)" };
  });

  function arcPath(start: number, end: number): string {
    const startAngle = start * 2 * Math.PI - Math.PI / 2;
    const endAngle = end * 2 * Math.PI - Math.PI / 2;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const largeArc = end - start > 0.5 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;
  }

  return (
    <div className="rounded-[10px] border border-[var(--border)] bg-card p-4">
      <div className="text-[13.5px] font-semibold text-[var(--ink)] mb-3">{title}</div>
      <div className="flex flex-col items-center">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
          {segments.map((s) => (
            <path
              key={s.key}
              d={arcPath(s.start, s.end)}
              fill="none"
              stroke={s.color}
              strokeWidth={thickness}
              strokeLinecap="butt"
            />
          ))}
        </svg>
        <div className="flex flex-wrap justify-center gap-3 mt-3 text-[11px]">
          {segments.map((s) => (
            <span key={s.key} className="inline-flex items-center gap-1.5">
              <span className="size-2 rounded-sm" style={{ background: s.color }} />
              <span className="text-[var(--ink-mute)]">
                {s.key} <span className="font-mono tabular-nums text-[var(--ink)]">{Math.round(s.pct * 100)}%</span>
              </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function AdCard({ ad, platform }: { ad: CompetitorAd; platform: Tab }) {
  // Deterministic colour per advertiser so re-renders don't reshuffle the look.
  const colorIdx = ad.advertiser_name.length % 8;
  const tints = ["#3B5C44", "#46538C", "#4C5B3E", "#5E4A38", "#2E3F4F", "#3C5F70", "#695440", "#4A4040"];
  const tint = tints[colorIdx];

  return (
    <div className="rounded-[10px] border border-[var(--border)] bg-card overflow-hidden flex flex-col">
      <div
        className="aspect-[4/5] relative flex flex-col p-3"
        style={{ background: `linear-gradient(160deg, ${tint} 0%, ${tint}aa 60%, ${tint}55 100%)` }}
      >
        <div
          className="absolute inset-0 opacity-25"
          style={{ background: `repeating-linear-gradient(135deg, ${tint} 0 14px, ${tint}cc 14px 28px)` }}
        />
        <div className="relative flex items-center justify-between gap-1.5 z-10">
          <span
            className="px-2 py-0.5 rounded-full font-mono text-[9px] font-semibold uppercase"
            style={{ background: "rgba(255,255,255,0.9)", color: tint, letterSpacing: "0.04em" }}
          >
            {ad.advertiser_name.split(".")[0].slice(0, 12).toUpperCase()}
          </span>
          <span
            className="px-1.5 py-0.5 rounded font-mono text-[9.5px] font-semibold text-white"
            style={{ background: "rgba(0,0,0,0.45)" }}
          >
            {ad.days_running} days
          </span>
        </div>
        <div className="flex-1" />
        <div className="relative z-10">
          {ad.headline && (
            <div
              className="font-heading text-[13.5px] font-bold leading-tight tracking-[-0.005em] text-white"
              style={{ textShadow: "0 1px 2px rgba(0,0,0,0.2)" }}
            >
              {ad.headline}
            </div>
          )}
          {ad.body && (
            <div className="text-[10.5px] mt-1.5 line-clamp-2" style={{ color: "rgba(255,255,255,0.85)" }}>
              {ad.body}
            </div>
          )}
        </div>
      </div>
      <div className="px-3 py-2.5 flex flex-col gap-1.5">
        <div className="text-[12.5px] font-medium text-[var(--ink)] truncate">
          {ad.advertiser_name}
        </div>
        <div className="font-mono text-[10px] text-[var(--ink-subtle)] truncate">
          {ad.legal_name}
        </div>
        <div className="flex items-center gap-1.5 text-[10.5px]">
          <span
            className="px-1.5 py-px rounded font-mono uppercase font-semibold"
            style={{ background: "var(--card-soft)", color: "var(--ink-mute)", letterSpacing: "0.04em" }}
          >
            {ad.format}
          </span>
          <a
            href={ad.archive_url}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto inline-flex items-center gap-1 text-[var(--peach-deep)] hover:underline"
          >
            Open in {platform === "meta" ? "Ad Library" : "Ads Transparency"}
            <ExternalLink className="size-2.5" />
          </a>
        </div>
      </div>
    </div>
  );
}


// ═════════════════════════════════════════════════════════════════════════════
// Empty state
// ═════════════════════════════════════════════════════════════════════════════

function EmptyHint() {
  return (
    <div className="rounded-[14px] border border-dashed border-[var(--border)] bg-card px-6 py-12 text-center">
      <Search className="size-9 mx-auto mb-3 text-[var(--ink-subtle)]/50" />
      <p className="text-[14px] font-medium text-[var(--ink)] mb-1.5">
        Введи нишу и нажми «Разобрать»
      </p>
      <p className="text-[12.5px] text-[var(--ink-mute)] max-w-md mx-auto leading-relaxed">
        Например: <i>стоматология</i>, <i>jewelry</i>, <i>фитнес клуб</i>.
        AI соберёт: количество игроков, share-of-voice, top-объявления (с тем сколько дней они в эфире),
        форматы / языки / куда ведут — и в конце выдаст 6–8 стратегических инсайтов.
      </p>
      <p className="text-[11px] text-[var(--ink-subtle)] mt-3 italic max-w-md mx-auto">
        Можешь спросить то же самое голосом в Telegram-бота: «разбери конкурентов в стоматологии Tallinn» — AI вызовет тот же инструмент.
      </p>
    </div>
  );
}
