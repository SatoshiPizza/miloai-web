"use client";

/**
 * Step 1b — where should AI read about the business from?
 *
 * Reference: `screen-onboarding.jsx::OnbStep1b`.
 *
 * Three choices that feed the analyzer pipeline (Step 3):
 *   • Сайт   — AI scrapes the URL + 15 inner pages
 *   • Instagram — for now we treat it like a text intake (we parse the bio
 *     and recent captions later; out of scope for today's pipeline)
 *   • Сам опишу — free-text description, no scrape
 *
 * The category from Step 1 stays visible as a peach chip so the user keeps
 * context and can hit «Назад» without losing it.
 */

import { useState } from "react";
import { ArrowRight, ArrowLeft, Globe, AtSign, Mic } from "lucide-react";

import { OnbFrame } from "./onb-frame";

export type SourceChoice = {
  type: "site" | "instagram" | "none";
  site_url?: string;
  instagram_url?: string;
  text_description?: string;
};

export function Step1bSource({
  category,
  value,
  onChange,
  onBack,
  onNext,
}: {
  category: string | null;
  value: SourceChoice | null;
  onChange: (next: SourceChoice) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const [type, setType] = useState<SourceChoice["type"]>(
    value?.type ?? "site"
  );
  const [siteUrl, setSiteUrl] = useState(value?.site_url ?? "");
  const [igUrl, setIgUrl] = useState(value?.instagram_url ?? "");
  const [desc, setDesc] = useState(value?.text_description ?? "");

  function commit() {
    onChange({
      type,
      site_url: type === "site" ? siteUrl.trim() : undefined,
      instagram_url: type === "instagram" ? igUrl.trim() : undefined,
      text_description: type === "none" ? desc.trim() : undefined,
    });
    onNext();
  }

  const canContinue =
    (type === "site" && siteUrl.trim().length >= 4) ||
    (type === "instagram" && igUrl.trim().length >= 3) ||
    (type === "none" && desc.trim().length >= 20);

  return (
    <OnbFrame stepIdx={0}>
      <div className="w-full max-w-[640px] text-center">
        {category && (
          <div
            className="mb-5 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.05em]"
            style={{
              background: "var(--peach-wash)",
              border: "1px solid var(--peach-soft)",
              color: "var(--peach-deep)",
            }}
          >
            {category}
          </div>
        )}

        <h1 className="font-heading text-[32px] sm:text-[36px] font-bold leading-[1.1] tracking-[-0.03em]">
          Откуда AI прочитает про твой бизнес?
        </h1>
        <p className="mt-3 text-[15.5px] leading-relaxed tracking-[-0.005em] text-[var(--ink-mute)]">
          Чем больше реальных данных — тем точнее профиль, услуги и креативы.
        </p>

        {/* Source pick: 3 tabs */}
        <div className="mt-7 flex gap-2.5">
          <SourceTab
            active={type === "site"}
            onClick={() => setType("site")}
            icon={<Globe className="size-[17px]" strokeWidth={1.7} />}
            label="Сайт"
            sub="Лучший вариант"
          />
          <SourceTab
            active={type === "instagram"}
            onClick={() => setType("instagram")}
            icon={<AtSign className="size-[17px]" strokeWidth={1.7} />}
            label="Instagram"
            sub="Bio + посты"
          />
          <SourceTab
            active={type === "none"}
            onClick={() => setType("none")}
            icon={<Mic className="size-[17px]" strokeWidth={1.7} />}
            label="Сам опишу"
            sub="Голосом / текстом"
          />
        </div>

        {/* Input area — switches per source type */}
        <div className="mt-6 rounded-[14px] bg-white p-5 text-left"
          style={{ border: "1px solid var(--border)" }}>
          {type === "site" && (
            <SourceInput
              label="URL твоего сайта"
              hint="AI прочитает до 15 страниц: главную, услуги, цены, контакты"
              value={siteUrl}
              onChange={setSiteUrl}
              placeholder="vallu.ee"
            />
          )}
          {type === "instagram" && (
            <SourceInput
              label="Ссылка на Instagram"
              hint="Парсим bio + последние 12 постов"
              value={igUrl}
              onChange={setIgUrl}
              placeholder="instagram.com/vallu_klinik"
            />
          )}
          {type === "none" && (
            <div>
              <label className="text-[12px] font-medium text-[var(--ink-mute)]">
                Расскажи про бизнес в 2-3 предложения
              </label>
              <textarea
                rows={4}
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Стоматология в Таллине, работаем 8 лет, имплантация Astra Tech от €890, средний чек €1200…"
                className="mt-2 w-full resize-none rounded-[10px] px-3.5 py-3 text-[14px] outline-none"
                style={{
                  background: "var(--card-soft)",
                  border: "1.5px solid var(--border)",
                  color: "var(--ink)",
                }}
              />
              <div className="mt-1.5 text-[11px] text-[var(--ink-subtle)]">
                Чем больше деталей — тем меньше нам потом править профиль. Можно
                голосом — позже в Telegram.
              </div>
            </div>
          )}
        </div>

        {/* Nav */}
        <div className="mt-7 flex items-center justify-between">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-[10px] px-4 py-2.5 text-[13.5px] text-[var(--ink-mute)] hover:text-[var(--ink)] transition-colors"
          >
            <ArrowLeft className="size-[14px]" strokeWidth={2} />
            Назад
          </button>
          <button
            onClick={commit}
            disabled={!canContinue}
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

function SourceTab({
  active,
  onClick,
  icon,
  label,
  sub,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  sub?: string;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-1 flex-col items-center gap-1.5 rounded-[12px] px-3 py-4 transition-colors"
      style={{
        background: active ? "var(--peach-wash)" : "var(--card)",
        border: `1.5px solid ${active ? "var(--peach)" : "var(--border)"}`,
        boxShadow: active
          ? "0 0 0 4px rgba(232,149,108,0.08)"
          : "0 1px 3px rgba(31,29,26,0.04)",
      }}
    >
      <div
        className="flex size-9 items-center justify-center rounded-[10px]"
        style={{
          background: active ? "#fff" : "var(--card-soft)",
          color: active ? "var(--peach-deep)" : "var(--ink-mute)",
        }}
      >
        {icon}
      </div>
      <span
        className="text-[13px]"
        style={{
          fontWeight: active ? 600 : 500,
          color: active ? "var(--ink)" : "var(--ink-mute)",
        }}
      >
        {label}
      </span>
      {sub && (
        <span
          className="font-mono text-[10px] tracking-[0.04em]"
          style={{ color: "var(--ink-subtle)" }}
        >
          {sub}
        </span>
      )}
    </button>
  );
}

function SourceInput({
  label,
  hint,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <label className="text-[12px] font-medium text-[var(--ink-mute)]">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full rounded-[10px] px-3.5 py-3 text-[14px] outline-none"
        style={{
          background: "var(--card-soft)",
          border: `1.5px solid ${value ? "var(--peach)" : "var(--border)"}`,
          boxShadow: value
            ? "0 0 0 4px rgba(232,149,108,0.08)"
            : undefined,
          color: "var(--ink)",
        }}
      />
      {hint && (
        <div className="mt-1.5 text-[11.5px] text-[var(--ink-subtle)]">
          {hint}
        </div>
      )}
    </div>
  );
}
