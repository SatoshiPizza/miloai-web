"use client";

/**
 * AnomalyBell — sticky top-right bell that surfaces 24h campaign anomalies.
 *
 * Reference: iter-3 wiring spec ("Bell в топбаре → дропдаун со списком
 * аномалий за 24ч"). Sits as a floating button so we don't have to lift
 * a full top bar across every dashboard page.
 *
 * Source: `tgBridge.campaigns()` already returns per-campaign anomalies
 * with severity + message. We flatten, dedupe trivially, and bucket by
 * critical / warn / info. Polls every 60s while the dropdown is open;
 * otherwise re-fetches on click.
 *
 * Hidden when there are zero anomalies (so the bell isn't visual noise on
 * a healthy account).
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Bell, Flame, TriangleAlert, Lightbulb, X, ArrowUpRight, Sparkles,
} from "lucide-react";

import { tgBridge, type CampaignSummary } from "@/lib/tg-bridge";

type Flat = {
  id: string;
  campaign_id: string;
  campaign_name: string;
  platform: string;
  severity: "info" | "warn" | "critical";
  message: string;
};


export function AnomalyBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Flat[]>([]);
  const [loaded, setLoaded] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  const fetchAnomalies = useCallback(async () => {
    try {
      const res = await tgBridge.campaigns();
      const flat = flatten(res.campaigns ?? []);
      setItems(flat);
      setLoaded(true);
    } catch {
      // Silent — bell stays hidden if backend is unreachable. Better than
      // a stuck red dot.
      setLoaded(true);
    }
  }, []);

  // Initial + 60s refresh.
  useEffect(() => {
    fetchAnomalies();
    const t = setInterval(fetchAnomalies, 60_000);
    return () => clearInterval(t);
  }, [fetchAnomalies]);

  // Outside click + Escape to close.
  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const count = items.length;
  const critical = items.filter((i) => i.severity === "critical").length;

  // Don't render anything until we know the count — keeps from flashing the
  // bell on first paint. Also hide when there's nothing to nag about.
  if (!loaded || count === 0) return null;

  return (
    <div
      ref={ref}
      className="fixed right-5 top-5 z-40 md:right-7 md:top-6"
    >
      <button
        onClick={() => setOpen((p) => !p)}
        className="relative flex size-10 items-center justify-center rounded-full bg-[var(--card)] shadow-md transition-shadow hover:shadow-lg"
        style={{ border: "1px solid var(--border)" }}
        title={`${count} аномали${pluralize(count, "я", "и", "й")} за 24ч`}
      >
        <Bell
          className="size-[18px]"
          style={{ color: critical > 0 ? "var(--destructive)" : "var(--ink-mute)" }}
          strokeWidth={1.7}
        />
        <span
          className="absolute -right-1 -top-1 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 font-mono text-[10.5px] font-bold text-white"
          style={{
            background: critical > 0 ? "var(--destructive)" : "var(--peach)",
            boxShadow: "0 4px 10px -4px rgba(232,149,108,0.55)",
          }}
        >
          {count}
        </span>
      </button>

      {open && <Dropdown items={items} onClose={() => setOpen(false)} />}
    </div>
  );
}


function Dropdown({
  items,
  onClose,
}: {
  items: Flat[];
  onClose: () => void;
}) {
  return (
    <div
      className="absolute right-0 top-[calc(100%+8px)] w-[360px] overflow-hidden rounded-[14px] bg-white shadow-2xl"
      style={{ border: "1px solid var(--border)" }}
    >
      <div
        className="flex items-center gap-2 border-b px-4 py-3"
        style={{ borderColor: "var(--border)" }}
      >
        <Sparkles className="size-3.5" style={{ color: "var(--peach)" }} />
        <span
          className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.1em]"
          style={{ color: "var(--peach-deep)" }}
        >
          AI · Изменения за 24ч
        </span>
        <div className="flex-1" />
        <button
          onClick={onClose}
          className="flex size-6 items-center justify-center rounded-md text-[var(--ink-subtle)] hover:bg-[var(--card-soft)] hover:text-[var(--ink-mute)] transition-colors"
        >
          <X className="size-3.5" />
        </button>
      </div>

      <ul className="max-h-[420px] divide-y overflow-y-auto" style={{ borderColor: "var(--border)" }}>
        {items.slice(0, 12).map((it) => (
          <li key={it.id}>
            <Link
              href={`/campaigns/${it.campaign_id}`}
              onClick={onClose}
              className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-[var(--card-soft)]/40"
            >
              <SeverityIcon severity={it.severity} />
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-medium text-[var(--ink)] truncate">
                  {it.campaign_name}
                </div>
                <div className="mt-0.5 text-[12px] leading-snug text-[var(--ink-mute)]">
                  {it.message}
                </div>
              </div>
              <ArrowUpRight
                className="mt-0.5 size-3.5 shrink-0 text-[var(--ink-subtle)]"
                strokeWidth={1.6}
              />
            </Link>
          </li>
        ))}
      </ul>

      {items.length > 12 && (
        <div
          className="border-t bg-[var(--card-soft)]/40 px-4 py-2 text-center font-mono text-[10.5px] text-[var(--ink-subtle)]"
          style={{ borderColor: "var(--border)" }}
        >
          и ещё {items.length - 12}
        </div>
      )}
    </div>
  );
}


function SeverityIcon({ severity }: { severity: Flat["severity"] }) {
  if (severity === "critical") {
    return (
      <Flame
        className="mt-0.5 size-4 shrink-0"
        style={{ color: "var(--destructive)" }}
        strokeWidth={1.8}
      />
    );
  }
  if (severity === "warn") {
    return (
      <TriangleAlert
        className="mt-0.5 size-4 shrink-0"
        style={{ color: "var(--warn)" }}
        strokeWidth={1.8}
      />
    );
  }
  return (
    <Lightbulb
      className="mt-0.5 size-4 shrink-0"
      style={{ color: "var(--ink-mute)" }}
      strokeWidth={1.6}
    />
  );
}


function flatten(campaigns: CampaignSummary[]): Flat[] {
  const out: Flat[] = [];
  for (const c of campaigns) {
    if (!c.anomalies) continue;
    for (let i = 0; i < c.anomalies.length; i++) {
      const a = c.anomalies[i];
      out.push({
        id: `${c.platform}-${c.id}-${i}`,
        campaign_id: c.id,
        campaign_name: c.name,
        platform: c.platform,
        severity: (a.severity as Flat["severity"]) ?? "info",
        message: a.message,
      });
    }
  }
  // Critical first, then warn, then info; preserve campaign order inside
  // each bucket — gives the user a deterministic, scannable list.
  const order = { critical: 0, warn: 1, info: 2 } as const;
  out.sort((a, b) => order[a.severity] - order[b.severity]);
  return out;
}


function pluralize(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}


// Useful when other components want to render their own count badge,
// but we keep all bell logic internal for now.
export const __bell_internals = { flatten };
