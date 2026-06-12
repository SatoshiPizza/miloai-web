"use client";

/**
 * BusinessSwitcher — workspace picker at the top of the sidebar.
 *
 * Design reference: design-handoff/design_handoff_miloai/screen-switcher.jsx.
 *
 * Behaviour:
 *   • Shows the active business as a card (peach border + glow ring).
 *   • Clicking toggles a dropdown listing every business the user owns.
 *   • Picking another business POSTs /api/web/businesses/switch and reloads
 *     the page so every data-bearing screen re-fetches under the new scope.
 *   • "+ Добавить бизнес" navigates to /onboarding, which is also the entry
 *     point for the very first business (an existing user without a default
 *     ends up there too).
 *
 * Why a full page reload on switch instead of in-app navigation:
 *   The bridge reads from many endpoints (/me, /campaigns, /services, /leads,
 *   /dashboard/kpi …) that are all scoped to active_business_id on the
 *   server. A reload guarantees every cached fetch is invalidated and the
 *   sidebar badge counts stay consistent — cheaper than threading a stale-
 *   invalidation signal through every page.
 */

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Check, Plus, AlertTriangle } from "lucide-react";

import { cn } from "@/lib/utils";
import { tgBridge, type BusinessSummary } from "@/lib/tg-bridge";

// Pre-baked palette of "brand" gradients to colour business avatars by id.
// Matches the screen-switcher reference (peach for the active, blue / purple
// for the rest). New ids cycle through the list.
const AVATAR_GRADIENTS: Array<[string, string]> = [
  ["var(--peach)", "var(--peach-deep)"],
  ["#5B7B9E", "#3D5A70"],
  ["#A08BB0", "#7D6890"],
  ["#6FA68E", "#4F7A66"],
  ["#C9925E", "#9B6A3F"],
];

function avatarGradient(businessId: number): [string, string] {
  return AVATAR_GRADIENTS[businessId % AVATAR_GRADIENTS.length];
}

function initialOf(name: string): string {
  const t = name.trim();
  if (!t) return "?";
  return t[0].toUpperCase();
}

export function BusinessSwitcher({
  active,
  businesses,
  onChanged,
}: {
  active: BusinessSummary | null;
  businesses: BusinessSummary[];
  onChanged?: () => void;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  // Close on outside click + Escape — standard popover hygiene.
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

  async function pick(b: BusinessSummary) {
    if (busy) return;
    if (active && b.id === active.id) {
      setOpen(false);
      return;
    }
    setBusy(true);
    try {
      await tgBridge.switchBusiness(b.id);
      setOpen(false);
      onChanged?.();
      // Hard reload — invalidates every cached fetch downstream.
      router.refresh();
      window.location.reload();
    } catch {
      setBusy(false);
    }
  }

  function addBusiness() {
    setOpen(false);
    router.push("/onboarding");
  }

  // No active business AND no businesses at all → the user hasn't completed
  // onboarding. Render a single CTA instead of a switcher.
  if (!active && businesses.length === 0) {
    return (
      <button
        onClick={addBusiness}
        className="flex w-full items-center gap-2.5 rounded-[11px] border border-dashed px-2.5 py-2.5 text-left transition-colors hover:bg-[var(--card-soft)]/60"
        style={{ borderColor: "var(--peach)" }}
      >
        <div
          className="flex size-[30px] shrink-0 items-center justify-center rounded-lg text-base font-normal"
          style={{
            border: "1.5px dashed var(--peach)",
            color: "var(--peach-deep)",
          }}
        >
          <Plus className="size-[16px]" />
        </div>
        <div className="min-w-0 flex-1 leading-tight">
          <div
            className="text-[13.5px] font-medium tracking-tight"
            style={{ color: "var(--peach-deep)" }}
          >
            Создай первый бизнес
          </div>
          <div
            className="font-mono text-[10px]"
            style={{ color: "var(--ink-subtle)" }}
          >
            AI просканирует сайт за 1 мин
          </div>
        </div>
      </button>
    );
  }

  const grad = active ? avatarGradient(active.id) : avatarGradient(0);

  return (
    <div ref={ref} className="relative">
      {/* ── Active business trigger (peach ring) ── */}
      <button
        type="button"
        disabled={busy}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex w-full items-center gap-2.5 rounded-[11px] px-2.5 py-2.5 text-left transition-colors",
          "border-[1.5px] bg-[var(--card)] hover:bg-[var(--card-soft)]/40",
          open && "shadow-[0_0_0_4px_rgba(232,178,140,0.08)]"
        )}
        style={{
          borderColor: open ? "var(--peach)" : "var(--border)",
        }}
      >
        <Avatar initial={active ? initialOf(active.name) : "?"} gradient={grad} />
        <div className="min-w-0 flex-1 leading-tight">
          <div className="truncate text-[13.5px] font-semibold tracking-tight text-foreground">
            {active?.name ?? "Без бизнеса"}
          </div>
          <div
            className="truncate font-mono text-[10px]"
            style={{ color: "var(--ink-subtle)" }}
          >
            {active?.category ?? "категория не задана"}
          </div>
        </div>
        <ChevronDown
          className={cn(
            "size-[14px] shrink-0 transition-transform",
            open && "rotate-180"
          )}
          style={{ color: "var(--ink-mute)" }}
        />
      </button>

      {/* ── Dropdown ── */}
      {open && (
        <div
          className="absolute left-0 right-0 top-[calc(100%+4px)] z-50 overflow-hidden rounded-[13px] border bg-[var(--card)]"
          style={{
            borderColor: "var(--border)",
            boxShadow:
              "0 24px 52px -16px rgba(31,29,26,0.25), 0 4px 12px -4px rgba(31,29,26,0.08)",
          }}
        >
          <div
            className="px-3.5 pt-2.5 pb-2 font-mono text-[9.5px] font-semibold uppercase tracking-[0.1em]"
            style={{ color: "var(--ink-subtle)" }}
          >
            Твои бизнесы · {businesses.length}
          </div>

          {businesses.map((b) => (
            <BusinessRow
              key={b.id}
              business={b}
              isActive={!!active && b.id === active.id}
              onPick={() => pick(b)}
            />
          ))}

          <div
            className="my-1 h-px"
            style={{ background: "var(--border-soft)" }}
          />

          <button
            onClick={addBusiness}
            className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left transition-colors hover:bg-[var(--card-soft)]/50"
          >
            <div
              className="flex size-[28px] shrink-0 items-center justify-center rounded-lg"
              style={{
                border: "1.5px dashed var(--peach)",
                color: "var(--peach-deep)",
              }}
            >
              <Plus className="size-[14px]" />
            </div>
            <div className="flex-1 leading-tight">
              <div
                className="text-[13px] font-medium tracking-tight"
                style={{ color: "var(--peach-deep)" }}
              >
                Добавить бизнес
              </div>
              <div
                className="mt-[1px] text-[10.5px]"
                style={{ color: "var(--ink-subtle)" }}
              >
                AI просканирует новый сайт · 1 мин
              </div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}

function BusinessRow({
  business,
  isActive,
  onPick,
}: {
  business: BusinessSummary;
  isActive: boolean;
  onPick: () => void;
}) {
  const grad = avatarGradient(business.id);
  return (
    <button
      type="button"
      onClick={onPick}
      className={cn(
        "flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left transition-colors",
        isActive ? "bg-[var(--peach-wash,rgba(232,178,140,0.08))]" : "hover:bg-[var(--card-soft)]/40"
      )}
    >
      <Avatar initial={initialOf(business.name)} gradient={grad} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <div
            className={cn(
              "truncate text-[13.5px] tracking-tight",
              isActive ? "font-semibold" : "font-medium"
            )}
            style={{ color: "var(--ink)" }}
          >
            {business.name}
          </div>
          {!business.onboarding_complete && (
            <span
              className="rounded px-1.5 py-[1px] font-mono text-[9px] font-bold tracking-[0.04em]"
              style={{
                background: "var(--warn-soft, rgba(232,178,140,0.18))",
                color: "var(--peach-deep)",
              }}
              title="Онбординг не завершён"
            >
              <AlertTriangle className="inline size-[8px]" /> setup
            </span>
          )}
        </div>
        <div
          className="mt-[1px] truncate font-mono text-[10px]"
          style={{ color: "var(--ink-subtle)" }}
        >
          {business.category ?? "категория не задана"}
        </div>
      </div>
      {isActive && (
        <Check
          className="size-[14px] shrink-0"
          strokeWidth={2.4}
          style={{ color: "var(--peach-deep)" }}
        />
      )}
    </button>
  );
}

function Avatar({
  initial,
  gradient,
}: {
  initial: string;
  gradient: [string, string];
}) {
  return (
    <div
      className="flex size-[30px] shrink-0 items-center justify-center rounded-lg font-heading text-[13px] font-bold text-white"
      style={{
        background: `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})`,
      }}
    >
      {initial}
    </div>
  );
}
