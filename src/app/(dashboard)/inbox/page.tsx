"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Inbox, Sparkles, Check, ArrowRight, Phone, Mail } from "lucide-react";
import { MetaGlyph, GoogleGlyph } from "@/components/platform-badge";
import { tgBridge, type DashboardKpi, type CampaignsResponse } from "@/lib/tg-bridge";

/**
 * Lead Inbox — design handoff iter-2 §screen-inbox.jsx.
 *
 * Backend endpoint `/api/web/leads` doesn't ship yet. We render the full
 * Kanban scaffolding (4 columns, header stats) with empty states per column
 * so the design lives. When the API ships, swap data source.
 */

type ColumnKey = "new" | "contacted" | "won" | "lost";

const COLUMNS: { key: ColumnKey; label: string; color: string; bg: string; ring: string }[] = [
  { key: "new",       label: "Новые",    color: "var(--peach)",       bg: "var(--peach-wash)", ring: "#F5DDC8" },
  { key: "contacted", label: "В работе", color: "#4F7A8C",            bg: "#E5EEF2",           ring: "#C8D9DF" },
  { key: "won",       label: "Won",      color: "var(--sage)",        bg: "var(--sage-soft)",  ring: "#BFD0B0" },
  { key: "lost",      label: "Lost",     color: "var(--ink-subtle)",  bg: "var(--card-soft)",  ring: "var(--border)" },
];

export default function InboxPage() {
  const [kpi, setKpi] = useState<DashboardKpi | null>(null);
  const [campaigns, setCampaigns] = useState<CampaignsResponse | null>(null);

  useEffect(() => {
    tgBridge.kpi().then(setKpi).catch(() => {});
    tgBridge.campaigns().then(setCampaigns).catch(() => {});
  }, []);

  const hasMetaActive = (campaigns?.campaigns ?? []).some(
    (c) => c.platform === "meta" && c.status === "active"
  );

  return (
    <div className="p-7 max-w-[1500px] flex flex-col h-[calc(100vh-1px)]">
      {/* Header */}
      <header className="flex flex-col lg:flex-row lg:items-end gap-4 mb-5 shrink-0">
        <div className="flex-1">
          <h1 className="font-heading text-[28px] font-bold leading-none tracking-[-0.025em]">
            Lead Inbox
          </h1>
          <p className="text-[13.5px] text-[var(--ink-mute)] mt-1.5">
            Лиды из Meta Lead Forms + Google форм. AI готовит ответ, твоё дело подтвердить.
          </p>
        </div>
        <div className="flex gap-[18px] items-center">
          <Stat label="Сегодня" value="0" />
          <Stat label="Эта неделя" value={String(kpi?.leads_7d ?? "—")} />
          <Stat label="Конверсия" value="—" />
        </div>
      </header>

      {/* Kanban grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3.5 flex-1 min-h-0 mb-2">
        {COLUMNS.map((col) => (
          <KanbanColumn key={col.key} col={col} hasMetaActive={hasMetaActive} />
        ))}
      </div>
    </div>
  );
}


// ═════════════════════════════════════════════════════════════════════════════
// Header stat
// ═════════════════════════════════════════════════════════════════════════════

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-mono text-[9.5px] uppercase tracking-[0.08em] text-[var(--ink-subtle)]">
        {label}
      </div>
      <div className="font-mono text-[22px] font-medium tabular-nums leading-none mt-1 text-[var(--ink)]">
        {value}
      </div>
    </div>
  );
}


// ═════════════════════════════════════════════════════════════════════════════
// Kanban column
// ═════════════════════════════════════════════════════════════════════════════

function KanbanColumn({
  col,
  hasMetaActive,
}: {
  col: (typeof COLUMNS)[number];
  hasMetaActive: boolean;
}) {
  return (
    <div
      className="rounded-[14px] border flex flex-col p-3 gap-2.5 min-h-[300px]"
      style={{ background: col.bg, borderColor: col.ring }}
    >
      <div className="flex items-center gap-2 px-1 pt-1 pb-2 shrink-0">
        <span className="size-2 rounded-full" style={{ background: col.color }} />
        <span className="text-[13px] font-semibold text-[var(--ink)] tracking-[-0.005em]">
          {col.label}
        </span>
        <span
          className="font-mono text-[11px] text-[var(--ink-subtle)] px-1.5 py-px rounded-md border"
          style={{ background: "rgba(255,255,255,0.6)", borderColor: "var(--border)" }}
        >
          0
        </span>
      </div>

      {/* Mini examples for the New column to explain the AI response feature */}
      {col.key === "new" ? (
        <NewColumnEmpty hasMetaActive={hasMetaActive} />
      ) : col.key === "contacted" ? (
        <ColumnEmpty
          icon={<ArrowRight className="size-5" style={{ color: col.color }} />}
          title="Пока никого"
          body="Когда нажмёшь «Написать» на лиде — он переедет сюда."
        />
      ) : col.key === "won" ? (
        <ColumnEmpty
          icon={<Check className="size-5" style={{ color: col.color }} />}
          title="0 сделок"
          body="Закрытые лиды появятся здесь. Отметь вручную или дождись авто-синка с CRM."
        />
      ) : (
        <ColumnEmpty
          icon={<span className="text-[var(--ink-subtle)] text-lg">×</span>}
          title="0 потерь"
          body="Лиды без ответа или с причиной отказа архивируются сюда."
        />
      )}
    </div>
  );
}

function ColumnEmpty({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-3 py-6 gap-2">
      <div className="size-9 rounded-full bg-white/70 flex items-center justify-center">
        {icon}
      </div>
      <p className="text-[12.5px] font-medium text-[var(--ink)]">{title}</p>
      <p className="text-[11.5px] text-[var(--ink-mute)] leading-relaxed max-w-[200px]">
        {body}
      </p>
    </div>
  );
}


// ═════════════════════════════════════════════════════════════════════════════
// "New" column — empty state with sample card + connect-CTA
// ═════════════════════════════════════════════════════════════════════════════

function NewColumnEmpty({ hasMetaActive }: { hasMetaActive: boolean }) {
  if (hasMetaActive) {
    return (
      <div className="flex-1 flex flex-col gap-2.5">
        <SampleLeadCard />
        <p className="text-[11px] text-[var(--ink-mute)] text-center px-2 mt-1 leading-relaxed">
          Это пример карточки. Лиды появятся когда Meta Lead Forms отправит данные — backend endpoint в работе.
        </p>
      </div>
    );
  }
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-3 py-4 gap-3">
      <div
        className="size-10 rounded-full flex items-center justify-center"
        style={{ background: "rgba(255,255,255,0.7)" }}
      >
        <Inbox className="size-5" style={{ color: "var(--peach-deep)" }} />
      </div>
      <p className="text-[12.5px] font-medium text-[var(--ink)]">Лидов пока нет</p>
      <p className="text-[11.5px] text-[var(--ink-mute)] leading-relaxed max-w-[210px]">
        Запусти Meta-кампанию с lead-формой — лиды начнут падать сюда в реальном времени.
      </p>
      <Link
        href="/campaigns/new"
        className="px-3.5 py-1.5 rounded-md text-[11.5px] font-medium text-white inline-flex items-center gap-1.5"
        style={{ background: "var(--peach)" }}
      >
        <Sparkles className="size-[12px]" /> Создать кампанию
      </Link>
    </div>
  );
}

/**
 * Visual sample of how a lead card looks. Renders an obvious placeholder name
 * so users don't confuse it with real data.
 */
function SampleLeadCard() {
  return (
    <div className="rounded-[10px] border border-[var(--border)] bg-card px-3 py-2.5 flex flex-col gap-2 opacity-90">
      <div className="flex items-center gap-2">
        <div
          className="size-7 rounded-full flex items-center justify-center text-[11px] font-semibold text-[var(--ink)]"
          style={{ background: "#E2DCCC" }}
        >
          —
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-medium text-[var(--ink)] truncate">
            Будущий лид
          </div>
          <div className="font-mono text-[10.5px] text-[var(--ink-subtle)]">
            +372 5• •• ••
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1.5 font-mono text-[10.5px] text-[var(--ink-mute)]">
        <span
          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded"
          style={{ background: "var(--meta-soft)" }}
        >
          <MetaGlyph size={9} />
          <span className="font-semibold" style={{ color: "var(--meta-ink)", letterSpacing: "0.02em" }}>
            META
          </span>
        </span>
        <span>·</span>
        <span>Услуга из лендинга</span>
      </div>
      <div
        className="px-2.5 py-2 rounded-lg flex gap-2 items-start"
        style={{ background: "var(--peach-wash)", border: "1px solid var(--peach-soft)" }}
      >
        <Sparkles className="size-[12px] mt-0.5 shrink-0" style={{ color: "var(--peach-deep)" }} />
        <div className="flex-1">
          <div className="font-mono text-[9.5px] uppercase tracking-[0.08em] font-semibold mb-1" style={{ color: "var(--peach-deep)" }}>
            AI · ответ
          </div>
          <div className="text-[12px] text-[var(--ink)] leading-snug tracking-[-0.005em]">
            AI составит персональный ответ на основе данных формы + контекста кампании.
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="font-mono text-[10.5px] text-[var(--ink-subtle)] flex-1">скоро</span>
        <button
          disabled
          className="px-2.5 py-1 rounded-md text-[11.5px] font-medium text-white opacity-60 inline-flex items-center gap-1.5"
          style={{ background: "var(--ink)" }}
        >
          <Phone className="size-3" /> Написать
        </button>
        <button
          disabled
          className="px-2 py-1 rounded-md border border-[var(--border)] opacity-60"
          title="Email-ответ"
        >
          <Mail className="size-3 text-[var(--ink-mute)]" />
        </button>
      </div>
    </div>
  );
}

// Keep the icon imports used to silence unused-import lints if not referenced elsewhere.
void GoogleGlyph;
