"use client";

import { useState } from "react";
import { Search, Sparkles, Eye } from "lucide-react";
import { MetaGlyph } from "@/components/platform-badge";
import { toast } from "sonner";

/**
 * Competitors — design handoff iter-2 §screen-extras COMPETITORS.
 *
 * Backend integration with Meta Ad Library is TBD. Render the full UI with
 * a search bar + a primed empty state explaining how it'll work.
 */

export default function CompetitorsPage() {
  const [query, setQuery] = useState("");

  function onAnalyze() {
    const q = query.trim();
    if (!q) {
      toast.error("Вставь URL или Instagram-handle");
      return;
    }
    toast.info("Парсер Meta Ad Library подключаем — backend endpoint в работе.");
  }

  return (
    <div className="p-7 max-w-[1400px]">
      <header className="mb-5">
        <h1 className="font-heading text-[28px] font-bold leading-none tracking-[-0.025em]">
          Конкуренты
        </h1>
        <p className="text-[13.5px] text-[var(--ink-mute)] mt-1.5">
          Что крутят в Meta Ad Library соседи по нише — учимся на их углах
        </p>
      </header>

      {/* Search bar */}
      <div className="rounded-[12px] border border-[var(--border)] bg-card p-3.5 flex items-center gap-2.5 mb-5">
        <Search className="size-[15px] text-[var(--ink-subtle)]" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onAnalyze()}
          placeholder="vällu.ee, stomatologyplus.ee или instagram.com/clinic"
          className="flex-1 bg-transparent outline-none text-[13.5px] placeholder:text-[var(--ink-subtle)] text-[var(--ink)]"
        />
        <button
          onClick={onAnalyze}
          className="px-3.5 py-1.5 rounded-md text-[12.5px] font-medium text-white transition-opacity hover:opacity-90"
          style={{ background: "var(--ink)" }}
        >
          Разобрать
        </button>
      </div>

      {/* Result split — two columns: ads on the left, AI panel on the right */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-4">
        {/* Ads area */}
        <div>
          <div className="flex items-center gap-2.5 mb-3">
            <div className="font-heading text-[18px] font-bold tracking-[-0.018em] text-[var(--ink)]">
              Кого разобрать
            </div>
            <span className="px-2 py-0.5 rounded-full font-mono text-[10.5px] text-[var(--ink-mute)] bg-[var(--card-soft)]">
              0 активных объявлений
            </span>
          </div>
          <CompetitorEmptyGrid />
        </div>

        {/* AI panel */}
        <aside
          className="rounded-[14px] border p-4 self-start"
          style={{ background: "linear-gradient(135deg, #FCF1E8 0%, #F8E8D9 100%)", borderColor: "#F5DDC8" }}
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="size-[24px] rounded-full bg-white flex items-center justify-center">
              <Sparkles className="size-[12px] text-[var(--peach)]" strokeWidth={1.7} />
            </div>
            <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.1em] text-[var(--peach-deep)]">
              AI · разбор
            </span>
          </div>
          <p className="text-[12.5px] text-[var(--peach-ink)]/85 leading-snug mb-3">
            Вставь URL конкурента — AI достанет их активные креативы из Meta Ad Library и сравнит с твоими углами.
          </p>
          <div className="flex flex-col gap-2">
            <InsightSlot label="Основной угол" body="Какую боль крутят чаще всего" />
            <InsightSlot label="Средний headline" body="Длина и тональность заголовков" />
            <InsightSlot label="Креативы" body="Stock vs реальные фото клиники" />
            <InsightSlot label="Частота смены" body="Признаки выгорания и недо-обновлений" />
          </div>
          <div className="flex gap-1.5 mt-3">
            <button
              disabled
              className="px-3 py-1.5 rounded-md text-[12px] font-medium text-white disabled:opacity-80"
              style={{ background: "var(--peach)" }}
            >
              Создать контр-креатив
            </button>
            <button
              disabled
              className="px-3 py-1.5 rounded-md text-[12px] font-medium text-[var(--peach-deep)] disabled:opacity-80"
              style={{ background: "rgba(255,255,255,0.6)" }}
            >
              Сравнить
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}


// ═════════════════════════════════════════════════════════════════════════════
// Empty competitor ads grid — 6 skeleton ad cards explaining the future state
// ═════════════════════════════════════════════════════════════════════════════

function CompetitorEmptyGrid() {
  const slots = Array.from({ length: 6 }, (_, i) => i);
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
      {slots.map((i) => (
        <div key={i} className="rounded-[10px] border border-[var(--border)] bg-card overflow-hidden">
          <div
            className="h-[160px] relative flex flex-col p-3"
            style={{
              background: `repeating-linear-gradient(135deg, var(--card-soft) 0 14px, var(--background) 14px 28px)`,
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <Eye className="size-5 text-[var(--ink-subtle)]/40" />
            </div>
          </div>
          <div className="px-3 py-2 flex items-center gap-1.5 font-mono text-[10px] text-[var(--ink-subtle)]">
            <MetaGlyph size={9} />
            — дней · CTA «—»
          </div>
        </div>
      ))}
    </div>
  );
}


// ═════════════════════════════════════════════════════════════════════════════
// Insight slot (gray placeholder in AI panel)
// ═════════════════════════════════════════════════════════════════════════════

function InsightSlot({ label, body }: { label: string; body: string }) {
  return (
    <div className="rounded-[9px] px-3 py-2.5" style={{ background: "rgba(255,255,255,0.55)" }}>
      <div className="font-mono text-[9.5px] uppercase tracking-[0.08em] font-semibold" style={{ color: "var(--peach-deep)" }}>
        {label}
      </div>
      <div className="text-[12px] text-[var(--ink-mute)] mt-1 leading-snug">{body}</div>
    </div>
  );
}
