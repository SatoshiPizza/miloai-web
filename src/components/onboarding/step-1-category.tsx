"use client";

/**
 * Step 1 — business category. Drives benchmark lookups, creative angles,
 * and the lead-cost forecast on Step 6.
 *
 * Reference: `screen-onboarding.jsx::OnbStep1`.
 *
 * The categories map 1:1 to the `category` enum the AI extractor produces
 * (see `app/ai/schemas/onboarding.py::ParsedBusiness.category`). When the
 * user later runs Step 3 against a real site, the AI may pick a different
 * category — in which case we surface a "AI suggested X instead, keep / fix"
 * prompt on Step 4 rather than silently overwriting this manual pick.
 */

import { ArrowRight, Sparkles, Check } from "lucide-react";
import {
  Smile, Scale, Sparkles as Beauty, Wrench, ShoppingBag, GraduationCap,
  Activity, Grid3x3,
  type LucideIcon,
} from "lucide-react";

import { OnbFrame } from "./onb-frame";

type Category = {
  slug: string;
  label: string;
  icon: LucideIcon;
  /** Benchmark teaser shown when this category is selected. */
  benchmark?: { market: string; ours: string };
};

const CATEGORIES: Category[] = [
  {
    slug: "dental",
    label: "Стоматология",
    icon: Smile,
    benchmark: { market: "€78", ours: "€38–55" },
  },
  { slug: "legal", label: "Юристы / нотариусы", icon: Scale,
    benchmark: { market: "€95", ours: "€48–70" } },
  { slug: "beauty", label: "Красота / косметология", icon: Beauty,
    benchmark: { market: "€32", ours: "€14–22" } },
  { slug: "auto_repair", label: "Ремонт / сервис", icon: Wrench,
    benchmark: { market: "€44", ours: "€22–32" } },
  { slug: "ecommerce", label: "E-commerce", icon: ShoppingBag,
    benchmark: { market: "€18", ours: "€8–14" } },
  { slug: "education", label: "Образование / курсы", icon: GraduationCap,
    benchmark: { market: "€48", ours: "€22–35" } },
  { slug: "fitness", label: "Фитнес / здоровье", icon: Activity,
    benchmark: { market: "€36", ours: "€16–26" } },
  { slug: "other", label: "Другое", icon: Grid3x3 },
];

export function Step1Category({
  value,
  onPick,
  onNext,
}: {
  value: string | null;
  onPick: (slug: string) => void;
  onNext: () => void;
}) {
  const selected = CATEGORIES.find((c) => c.slug === value);

  return (
    <OnbFrame stepIdx={0}>
      <div className="w-full max-w-[720px] text-center">
        {/* Peach sparkle disc */}
        <div
          className="mx-auto mb-6 flex size-16 items-center justify-center rounded-[20px]"
          style={{
            background:
              "linear-gradient(135deg, var(--peach), var(--peach-deep))",
            boxShadow: "0 12px 32px -8px rgba(232,149,108,0.55)",
          }}
        >
          <Sparkles className="size-8 text-white" strokeWidth={1.6} />
        </div>

        <h1 className="font-heading text-[34px] sm:text-[38px] font-bold leading-[1.08] tracking-[-0.03em]">
          Привет! Чем занимается твой бизнес?
        </h1>
        <p className="mt-3 text-[16px] leading-relaxed tracking-[-0.008em] text-[var(--ink-mute)]">
          От категории зависят бенчмарки, углы креативов и прогноз цены лида.
        </p>

        {/* 2×4 / 4×2 grid */}
        <div className="mt-8 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {CATEGORIES.map((c) => (
            <CategoryCard
              key={c.slug}
              cat={c}
              selected={value === c.slug}
              onClick={() => onPick(c.slug)}
            />
          ))}
        </div>

        {/* Benchmark teaser — shows for the selected category */}
        {selected?.benchmark && (
          <div
            className="mt-6 inline-flex items-center gap-2.5 rounded-full px-4 py-2.5 text-[12.5px] text-[var(--ink-mute)]"
            style={{
              background: "rgba(255,255,255,0.7)",
              border: "1px solid rgba(31,29,26,0.08)",
            }}
          >
            <Sparkles
              className="size-[14px]"
              style={{ color: "var(--peach)" }}
              strokeWidth={1.6}
            />
            <span>
              {selected.label} в EE: средний CPL{" "}
              <b className="text-[var(--ink)]">{selected.benchmark.market}</b> · мои
              клиенты платят{" "}
              <b style={{ color: "var(--peach-deep)" }}>{selected.benchmark.ours}</b>
            </span>
          </div>
        )}

        {/* Next */}
        <div className="mt-7 flex justify-center">
          <button
            onClick={onNext}
            disabled={!value}
            className="inline-flex items-center gap-2.5 rounded-[11px] px-8 py-3 text-[14.5px] font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            style={{
              background: "var(--peach)",
              boxShadow: "0 6px 18px -6px rgba(232,149,108,0.55)",
            }}
          >
            Дальше
            <ArrowRight className="size-[14px]" strokeWidth={2} />
          </button>
        </div>
      </div>
    </OnbFrame>
  );
}

function CategoryCard({
  cat,
  selected,
  onClick,
}: {
  cat: Category;
  selected: boolean;
  onClick: () => void;
}) {
  const Icon = cat.icon;
  return (
    <button
      onClick={onClick}
      className="relative flex flex-col items-center rounded-[13px] px-2.5 pb-4 pt-[18px] transition-colors"
      style={{
        background: selected ? "var(--peach-wash)" : "var(--card)",
        border: `1.5px solid ${selected ? "var(--peach)" : "var(--border)"}`,
        boxShadow: selected
          ? "0 0 0 4px rgba(232,149,108,0.08)"
          : "0 1px 3px rgba(31,29,26,0.04)",
      }}
    >
      {selected && (
        <div
          className="absolute right-2 top-2 flex size-4 items-center justify-center rounded-full"
          style={{ background: "var(--peach)" }}
        >
          <Check className="size-[10px] text-white" strokeWidth={3} />
        </div>
      )}
      <div
        className="mb-2 flex size-9 items-center justify-center rounded-[10px]"
        style={{
          background: selected ? "#fff" : "var(--card-soft)",
        }}
      >
        <Icon
          className="size-[17px]"
          strokeWidth={1.7}
          style={{
            color: selected ? "var(--peach-deep)" : "var(--ink-mute)",
          }}
        />
      </div>
      <span
        className="text-[12.5px] leading-tight tracking-[-0.005em]"
        style={{
          color: selected ? "var(--ink)" : "var(--ink-mute)",
          fontWeight: selected ? 600 : 500,
        }}
      >
        {cat.label}
      </span>
    </button>
  );
}
