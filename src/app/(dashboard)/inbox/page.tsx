"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Inbox as InboxIcon, Sparkles, Phone, Mail, Check, ArrowRight, Plus,
  Loader2,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { MetaGlyph, GoogleGlyph } from "@/components/platform-badge";
import { toast } from "sonner";
import {
  tgBridge,
  type DashboardKpi,
  type CampaignsResponse,
  type Lead,
  type LeadStatus,
  type LeadStreamEvent,
} from "@/lib/tg-bridge";

/**
 * Lead Inbox — Kanban backed by /api/web/leads + SSE.
 * Design handoff iter-2 §screen-inbox.jsx.
 */

type ColumnKey = LeadStatus;

const COLUMNS: { key: ColumnKey; label: string; color: string; bg: string; ring: string }[] = [
  { key: "new",       label: "Новые",    color: "var(--peach)",       bg: "var(--peach-wash)", ring: "#F5DDC8" },
  { key: "contacted", label: "В работе", color: "#4F7A8C",            bg: "#E5EEF2",           ring: "#C8D9DF" },
  { key: "won",       label: "Won",      color: "var(--sage)",        bg: "var(--sage-soft)",  ring: "#BFD0B0" },
  { key: "lost",      label: "Lost",     color: "var(--ink-subtle)",  bg: "var(--card-soft)",  ring: "var(--border)" },
];

export default function InboxPage() {
  const [kpi, setKpi] = useState<DashboardKpi | null>(null);
  const [campaigns, setCampaigns] = useState<CampaignsResponse | null>(null);
  const [leads, setLeads] = useState<Lead[] | null>(null);
  const [loading, setLoading] = useState(true);

  const [busy, setBusy] = useState<number | null>(null);
  const [wonOpen, setWonOpen] = useState<Lead | null>(null);
  const [lostOpen, setLostOpen] = useState<Lead | null>(null);
  const [manualOpen, setManualOpen] = useState(false);

  // Initial load.
  useEffect(() => {
    Promise.all([
      tgBridge.leads().catch(() => null),
      tgBridge.kpi().catch(() => null),
      tgBridge.campaigns().catch(() => null),
    ])
      .then(([l, k, c]) => {
        setLeads(l);
        setKpi(k);
        setCampaigns(c);
      })
      .finally(() => setLoading(false));
  }, []);

  // SSE: live updates.
  useEffect(() => {
    const es = tgBridge.openLeadsStream((ev) => {
      if (ev.event === "heartbeat") return;
      const lead = ev as Lead & { event: "created" | "updated" };
      setLeads((prev) => {
        const cur = prev ?? [];
        const idx = cur.findIndex((l) => l.id === lead.id);
        if (idx === -1) return [lead, ...cur];
        const next = [...cur];
        next[idx] = lead;
        return next;
      });
    });
    return () => es.close();
  }, []);

  const grouped = useMemo(() => {
    const out: Record<ColumnKey, Lead[]> = { new: [], contacted: [], won: [], lost: [] };
    for (const l of leads ?? []) {
      const k = (l.status as ColumnKey) in out ? (l.status as ColumnKey) : "new";
      out[k].push(l);
    }
    return out;
  }, [leads]);

  const hasMetaActive = (campaigns?.campaigns ?? []).some(
    (c) => c.platform === "meta" && c.status === "active"
  );

  // Stats.
  const todayCount = useMemo(() => {
    if (!leads) return 0;
    const startToday = new Date();
    startToday.setHours(0, 0, 0, 0);
    return leads.filter((l) => new Date(l.created_at) >= startToday).length;
  }, [leads]);
  const wonCount = grouped.won.length;
  const total = leads?.length ?? 0;
  const conversionPct = total > 0 ? Math.round((wonCount / total) * 100) : null;

  // Actions.
  async function setStatus(lead: Lead, status: LeadStatus, extra?: { value?: number; reason?: string }) {
    setBusy(lead.id);
    try {
      const updated = await tgBridge.updateLead(lead.id, { status, ...extra });
      // SSE will push too, but optimistic local replace makes UI snappy.
      setLeads((prev) => (prev ?? []).map((l) => (l.id === updated.id ? updated : l)));
      toast.success(label(status));
    } catch (e: unknown) {
      console.error(e);
      const msg = e instanceof Error ? e.message : "Не удалось обновить";
      toast.error(msg);
    } finally {
      setBusy(null);
    }
  }

  const refresh = useCallback(async () => {
    const fresh = await tgBridge.leads();
    setLeads(fresh);
  }, []);

  return (
    <div className="p-7 max-w-[1500px] flex flex-col h-[calc(100vh-1px)]">
      {/* Header */}
      <header className="flex flex-col lg:flex-row lg:items-end gap-4 mb-5 shrink-0">
        <div className="flex-1">
          <h1 className="font-heading text-[28px] font-bold leading-none tracking-[-0.025em]">
            Lead Inbox
          </h1>
          <p className="text-[13.5px] text-[var(--ink-mute)] mt-1.5">
            Лиды из Meta Lead Forms + ручной ввод. AI готовит ответ, твоё дело подтвердить.
          </p>
        </div>
        <div className="flex gap-[18px] items-center">
          <Stat label="Сегодня" value={String(todayCount)} />
          <Stat label="Всего" value={kpi?.leads_7d != null ? String(kpi.leads_7d) : String(total)} />
          <Stat label="Конверсия" value={conversionPct != null ? `${conversionPct}%` : "—"} />
          <Button size="sm" onClick={() => setManualOpen(true)}>
            <Plus className="size-3.5 mr-1" /> Добавить
          </Button>
        </div>
      </header>

      {/* Kanban */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3.5 flex-1 min-h-0 mb-2 overflow-hidden">
        {COLUMNS.map((col) => (
          <KanbanColumn
            key={col.key}
            col={col}
            leads={grouped[col.key]}
            loading={loading}
            hasMetaActive={hasMetaActive}
            busy={busy}
            onMarkContacted={(l) => setStatus(l, "contacted")}
            onOpenWon={(l) => setWonOpen(l)}
            onOpenLost={(l) => setLostOpen(l)}
            onReopen={(l) => setStatus(l, "new")}
          />
        ))}
      </div>

      {/* Won dialog */}
      <WonDialog
        lead={wonOpen}
        onClose={() => setWonOpen(null)}
        onConfirm={async (value) => {
          if (!wonOpen) return;
          await setStatus(wonOpen, "won", { value });
          setWonOpen(null);
        }}
      />

      {/* Lost dialog */}
      <LostDialog
        lead={lostOpen}
        onClose={() => setLostOpen(null)}
        onConfirm={async (reason) => {
          if (!lostOpen) return;
          await setStatus(lostOpen, "lost", { reason });
          setLostOpen(null);
        }}
      />

      {/* Manual add dialog */}
      <ManualAddDialog
        open={manualOpen}
        onClose={() => setManualOpen(false)}
        onCreated={async () => {
          setManualOpen(false);
          await refresh();
        }}
      />
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
  col, leads, loading, hasMetaActive, busy,
  onMarkContacted, onOpenWon, onOpenLost, onReopen,
}: {
  col: (typeof COLUMNS)[number];
  leads: Lead[];
  loading: boolean;
  hasMetaActive: boolean;
  busy: number | null;
  onMarkContacted: (l: Lead) => void;
  onOpenWon: (l: Lead) => void;
  onOpenLost: (l: Lead) => void;
  onReopen: (l: Lead) => void;
}) {
  return (
    <div
      className="rounded-[14px] border flex flex-col p-3 gap-2.5 min-h-[300px] overflow-hidden"
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
          {leads.length}
        </span>
      </div>

      <div className="flex-1 flex flex-col gap-2 overflow-y-auto pr-0.5">
        {loading && leads.length === 0 ? (
          <Skeleton className="h-32" />
        ) : leads.length === 0 ? (
          <ColumnEmpty col={col} hasMetaActive={hasMetaActive} />
        ) : (
          leads.map((l) => (
            <LeadCard
              key={l.id}
              lead={l}
              busy={busy === l.id}
              status={col.key}
              onMarkContacted={() => onMarkContacted(l)}
              onOpenWon={() => onOpenWon(l)}
              onOpenLost={() => onOpenLost(l)}
              onReopen={() => onReopen(l)}
            />
          ))
        )}
      </div>
    </div>
  );
}


// ═════════════════════════════════════════════════════════════════════════════
// Lead card
// ═════════════════════════════════════════════════════════════════════════════

function LeadCard({
  lead, busy, status, onMarkContacted, onOpenWon, onOpenLost, onReopen,
}: {
  lead: Lead;
  busy: boolean;
  status: ColumnKey;
  onMarkContacted: () => void;
  onOpenWon: () => void;
  onOpenLost: () => void;
  onReopen: () => void;
}) {
  const initials = (lead.name || "?")
    .trim()
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "?";
  const isLost = status === "lost";

  return (
    <div
      className="rounded-[10px] border border-[var(--border)] bg-card px-3 py-2.5 flex flex-col gap-2"
      style={isLost ? { opacity: 0.75 } : undefined}
    >
      <div className="flex items-center gap-2">
        <div
          className="size-7 rounded-full flex items-center justify-center text-[11px] font-semibold text-[var(--ink)]"
          style={{ background: "#E2DCCC" }}
        >
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-medium text-[var(--ink)] truncate">
            {lead.name || "Без имени"}
          </div>
          <div className="font-mono text-[10.5px] text-[var(--ink-subtle)] truncate">
            {lead.phone || lead.email || "контакт не указан"}
            {lead.value != null && (
              <>{" · "}<b style={{ color: "var(--sage)" }}>€{Number(lead.value).toFixed(0)}</b></>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 font-mono text-[10.5px] text-[var(--ink-mute)] flex-wrap">
        <PlatformChip platform={lead.platform} />
        {lead.platform_campaign_id && (
          <>
            <span>·</span>
            <span className="truncate" style={{ maxWidth: 180 }}>{lead.platform_campaign_id.slice(0, 24)}</span>
          </>
        )}
      </div>

      {status === "new" && lead.ai_response && (
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
              {lead.ai_response}
            </div>
          </div>
        </div>
      )}

      {lead.reason && status === "lost" && (
        <div className="text-[11px] font-mono text-[var(--destructive)] px-2 py-1 rounded bg-[#F8DDD0] inline-block self-start">
          {lead.reason}
        </div>
      )}

      <div className="flex items-center gap-1.5">
        <span className="font-mono text-[10.5px] text-[var(--ink-subtle)] flex-1">
          {timeAgo(lead.created_at)}
        </span>
        {busy && <Loader2 className="size-3 animate-spin text-[var(--ink-subtle)]" />}
        {status === "new" && (
          <button
            onClick={onMarkContacted}
            disabled={busy}
            className="px-2.5 py-1 rounded-md text-[11.5px] font-medium text-white inline-flex items-center gap-1.5 disabled:opacity-50"
            style={{ background: "var(--ink)" }}
            title="Я связался"
          >
            <Phone className="size-3" /> Связаться
          </button>
        )}
        {status === "contacted" && (
          <>
            <button
              onClick={onOpenWon}
              disabled={busy}
              className="px-2 py-1 rounded-md text-[11.5px] font-medium text-white inline-flex items-center gap-1 disabled:opacity-50"
              style={{ background: "var(--sage)" }}
              title="Закрыть как Won"
            >
              <Check className="size-3" /> Won
            </button>
            <button
              onClick={onOpenLost}
              disabled={busy}
              className="px-2 py-1 rounded-md text-[11.5px] font-medium border border-[var(--border)] inline-flex items-center gap-1 disabled:opacity-50 text-[var(--ink-mute)]"
              title="Lost"
            >
              Lost
            </button>
          </>
        )}
        {(status === "won" || status === "lost") && (
          <button
            onClick={onReopen}
            disabled={busy}
            className="px-2 py-1 rounded-md text-[10.5px] text-[var(--ink-mute)] hover:text-[var(--ink)] disabled:opacity-50"
            title="Вернуть в воронку"
          >
            <ArrowRight className="size-3 inline -scale-x-100" /> вернуть
          </button>
        )}
      </div>
    </div>
  );
}

function PlatformChip({ platform }: { platform: string }) {
  if (platform === "meta") {
    return (
      <span
        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded"
        style={{ background: "var(--meta-soft)" }}
      >
        <MetaGlyph size={9} />
        <span className="font-semibold" style={{ color: "var(--meta-ink)", letterSpacing: "0.02em" }}>META</span>
      </span>
    );
  }
  if (platform === "google") {
    return (
      <span
        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded"
        style={{ background: "var(--google-soft)" }}
      >
        <GoogleGlyph size={9} />
        <span className="font-semibold" style={{ color: "var(--google-ink)", letterSpacing: "0.02em" }}>GOOG</span>
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded"
      style={{ background: "var(--card-soft)" }}
    >
      <span className="font-semibold uppercase" style={{ color: "var(--ink-mute)", letterSpacing: "0.04em" }}>
        manual
      </span>
    </span>
  );
}


// ═════════════════════════════════════════════════════════════════════════════
// Column empty state
// ═════════════════════════════════════════════════════════════════════════════

function ColumnEmpty({
  col, hasMetaActive,
}: {
  col: (typeof COLUMNS)[number];
  hasMetaActive: boolean;
}) {
  if (col.key === "new") {
    if (hasMetaActive) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-3 py-4 gap-2">
          <InboxIcon className="size-5 text-[var(--peach-deep)]/60" />
          <p className="text-[12.5px] font-medium text-[var(--ink)]">Лидов пока нет</p>
          <p className="text-[11.5px] text-[var(--ink-mute)] leading-relaxed max-w-[210px]">
            Meta-кампания запущена — лиды приземлятся сюда автоматически.
          </p>
        </div>
      );
    }
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center px-3 py-4 gap-3">
        <InboxIcon className="size-5 text-[var(--peach-deep)]/60" />
        <p className="text-[12.5px] font-medium text-[var(--ink)]">Лидов пока нет</p>
        <p className="text-[11.5px] text-[var(--ink-mute)] leading-relaxed max-w-[210px]">
          Запусти Meta-кампанию с lead-формой или добавь лид вручную.
        </p>
        <Link
          href="/campaigns/new"
          className="px-3 py-1.5 rounded-md text-[11.5px] font-medium text-white inline-flex items-center gap-1.5"
          style={{ background: "var(--peach)" }}
        >
          <Sparkles className="size-3" /> Кампания
        </Link>
      </div>
    );
  }
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-3 py-6 gap-2">
      <p className="text-[12px] text-[var(--ink-mute)] leading-relaxed max-w-[200px]">
        {col.key === "contacted"
          ? "Когда отметишь лид как «Связался» — он переедет сюда."
          : col.key === "won"
            ? "Закрытые сделки появятся здесь."
            : "Отказы и потерянные лиды архивируются сюда."}
      </p>
    </div>
  );
}


// ═════════════════════════════════════════════════════════════════════════════
// Dialogs
// ═════════════════════════════════════════════════════════════════════════════

function WonDialog({
  lead, onClose, onConfirm,
}: {
  lead: Lead | null;
  onClose: () => void;
  onConfirm: (value: number | undefined) => Promise<void>;
}) {
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (lead) setValue("");
  }, [lead]);

  return (
    <Dialog open={!!lead} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Закрыть как Won</DialogTitle>
          <DialogDescription>{lead?.name || "Лид"} · сумма сделки в EUR</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="won-value">Сумма (EUR)</Label>
          <Input
            id="won-value"
            type="number"
            min={0}
            step={1}
            placeholder="например 890"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Отмена</Button>
          <Button
            onClick={async () => {
              const v = value ? parseFloat(value) : undefined;
              if (value && (!Number.isFinite(v) || (v ?? -1) < 0)) {
                toast.error("Введи число ≥ 0 или оставь пустым");
                return;
              }
              setBusy(true);
              try {
                await onConfirm(v);
              } finally {
                setBusy(false);
              }
            }}
            disabled={busy}
          >
            {busy && <Loader2 className="size-3.5 animate-spin mr-1.5" />}
            Подтвердить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function LostDialog({
  lead, onClose, onConfirm,
}: {
  lead: Lead | null;
  onClose: () => void;
  onConfirm: (reason: string | undefined) => Promise<void>;
}) {
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (lead) setReason("");
  }, [lead]);

  return (
    <Dialog open={!!lead} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Закрыть как Lost</DialogTitle>
          <DialogDescription>{lead?.name || "Лид"} · причина (Цена / Не ответил / ...)</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="lost-reason">Причина</Label>
          <Input
            id="lost-reason"
            placeholder="Цена / Не ответил / Не пришёл"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <div className="flex gap-1.5 flex-wrap pt-1">
            {["Цена", "Не отвечает", "Не пришёл", "Передумал"].map((s) => (
              <button
                key={s}
                onClick={() => setReason(s)}
                className="px-2 py-0.5 rounded-full text-[11px] border border-[var(--border)] hover:bg-[var(--card-soft)] transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Отмена</Button>
          <Button
            onClick={async () => {
              setBusy(true);
              try {
                await onConfirm(reason.trim() || undefined);
              } finally {
                setBusy(false);
              }
            }}
            disabled={busy}
          >
            {busy && <Loader2 className="size-3.5 animate-spin mr-1.5" />}
            Подтвердить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ManualAddDialog({
  open, onClose, onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) {
      setName(""); setPhone(""); setEmail(""); setNotes("");
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Добавить лид вручную</DialogTitle>
          <DialogDescription>
            Используй для лидов из звонков, walk-ins или для теста без Meta webhook.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="manual-name">Имя</Label>
            <Input id="manual-name" placeholder="Marie Tamm" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <div className="space-y-1.5">
              <Label htmlFor="manual-phone">Телефон</Label>
              <Input id="manual-phone" placeholder="+372 5..." value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="manual-email">Email</Label>
              <Input id="manual-email" type="email" placeholder="x@y.ee" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="manual-notes">Заметки</Label>
            <Input id="manual-notes" placeholder="Интересует имплант, бюджет ~€2k" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Отмена</Button>
          <Button
            onClick={async () => {
              if (!name.trim() && !phone.trim() && !email.trim()) {
                toast.error("Нужно хотя бы одно поле: имя / телефон / email");
                return;
              }
              setBusy(true);
              try {
                await tgBridge.createManualLead({
                  name: name.trim() || undefined,
                  phone: phone.trim() || undefined,
                  email: email.trim() || undefined,
                  notes: notes.trim() || undefined,
                });
                toast.success("Лид добавлен");
                await onCreated();
              } catch (e: unknown) {
                console.error(e);
                const msg = e instanceof Error ? e.message : "Не удалось добавить";
                toast.error(msg);
              } finally {
                setBusy(false);
              }
            }}
            disabled={busy}
          >
            {busy && <Loader2 className="size-3.5 animate-spin mr-1.5" />}
            Добавить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


// ═════════════════════════════════════════════════════════════════════════════
// Helpers
// ═════════════════════════════════════════════════════════════════════════════

function timeAgo(iso: string): string {
  const d = new Date(iso);
  const diffMs = Date.now() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "только что";
  if (diffMin < 60) return `${diffMin} мин`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH} ч`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `${diffD} ${diffD === 1 ? "день" : diffD < 5 ? "дня" : "дней"}`;
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}

function label(status: LeadStatus): string {
  if (status === "contacted") return "Перешёл в «В работе»";
  if (status === "won") return "Закрыт как Won";
  if (status === "lost") return "Закрыт как Lost";
  return "Вернулся в «Новые»";
}

// Silence unused imports under some configurations.
void Mail;
