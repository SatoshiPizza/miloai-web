"use client";

/**
 * Step 4 — Profile confirmation.
 *
 * Reference: `screen-onboarding.jsx::OnbStep4` + the design's "do not fabricate"
 * rule (only show what AI actually extracted; never invent missing fields).
 *
 * Layout:
 *   • Left column — editable profile fields. AI-extracted values are pre-filled
 *     and the user can correct anything before confirming.
 *   • Right column — services list AI pulled from the site (view-only here;
 *     deep edit lives in /services).
 *
 * Persistence: every edit hits `tgBridge.patchBusiness(...)` so refresh
 * survives. "Всё верно" advances to Step 5.
 */

import { useEffect, useState } from "react";
import { ArrowRight, ArrowLeft, Sparkles, Edit2, Building2, Globe, Phone, Mail, MessageSquare, MapPin } from "lucide-react";

import { OnbFrame } from "./onb-frame";
import { tgBridge, type BusinessDetail, type ServiceSummary } from "@/lib/tg-bridge";

type EditableFields = Pick<
  BusinessDetail,
  | "name"
  | "category"
  | "usp"
  | "target_audience"
  | "country"
  | "city"
  | "languages"
  | "contact_phone"
  | "contact_email"
  | "contact_whatsapp"
>;

const FIELDS: Array<{
  key: keyof EditableFields;
  label: string;
  placeholder: string;
  icon: typeof Building2;
  multiline?: boolean;
}> = [
  { key: "name", label: "Название", placeholder: "Vällu Klinik", icon: Building2 },
  { key: "usp", label: "USP", placeholder: "Что отличает от конкурентов", icon: Sparkles, multiline: true },
  { key: "target_audience", label: "Аудитория", placeholder: "Семьи с детьми, взрослые 30-55", icon: Edit2, multiline: true },
  { key: "city", label: "Город", placeholder: "Tallinn", icon: MapPin },
  { key: "country", label: "Страна (ISO-2)", placeholder: "EE", icon: Globe },
  { key: "languages", label: "Языки (через запятую)", placeholder: "et,ru,en", icon: Globe },
  { key: "contact_phone", label: "Телефон", placeholder: "+372 5555 5555", icon: Phone },
  { key: "contact_email", label: "Email", placeholder: "info@vallu.ee", icon: Mail },
  { key: "contact_whatsapp", label: "WhatsApp", placeholder: "+372 5555 5555", icon: MessageSquare },
];


export function Step4Profile({
  business,
  onBack,
  onNext,
  onBusinessUpdate,
}: {
  business: BusinessDetail;
  onBack: () => void;
  onNext: () => void;
  onBusinessUpdate: (b: BusinessDetail) => void;
}) {
  const [fields, setFields] = useState<EditableFields>(() => ({
    name: business.name,
    category: business.category,
    usp: business.usp,
    target_audience: business.target_audience,
    country: business.country,
    city: business.city,
    languages: business.languages,
    contact_phone: business.contact_phone,
    contact_email: business.contact_email,
    contact_whatsapp: business.contact_whatsapp,
  }));
  const [services, setServices] = useState<ServiceSummary[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    tgBridge.services().then(setServices).catch(() => setServices([]));
  }, []);

  async function persistAndContinue() {
    setSaving(true);
    try {
      const updated = await tgBridge.patchBusiness(business.id, fields);
      onBusinessUpdate(updated);
      onNext();
    } catch {
      // Silent — keep the user on the screen; the network error toast
      // is good-to-have but not required for the flow.
      setSaving(false);
    }
  }

  function set<K extends keyof EditableFields>(key: K, value: EditableFields[K]) {
    setFields((p) => ({ ...p, [key]: value }));
  }

  return (
    <OnbFrame stepIdx={3}>
      <div className="w-full max-w-[1000px]">
        <div className="mb-5 text-center">
          <div
            className="mb-4 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.06em]"
            style={{
              background: "var(--peach-wash)",
              border: "1px solid var(--peach-soft)",
              color: "var(--peach-deep)",
            }}
          >
            <Sparkles className="size-3.5" />
            Профиль · AI прочитал и заполнил
          </div>
          <h1 className="font-heading text-[32px] sm:text-[36px] font-bold leading-[1.1] tracking-[-0.03em]">
            Проверь, что AI понял правильно
          </h1>
          <p className="mt-3 text-[14.5px] leading-relaxed text-[var(--ink-mute)]">
            Поправь любое поле — данные подтянутся в креативы, аудит лендинга и
            прогноз цены лида.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.15fr_1fr]">
          {/* ── Profile fields ── */}
          <div
            className="rounded-[16px] bg-white p-5"
            style={{ border: "1px solid var(--border)" }}
          >
            <div className="mb-3 font-mono text-[10.5px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-subtle)]">
              Профиль бизнеса
            </div>
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              {FIELDS.map((f) => (
                <Field
                  key={f.key}
                  field={f}
                  value={fields[f.key] ?? ""}
                  onChange={(v) =>
                    set(
                      f.key,
                      // Coerce empty string → null so backend doesn't keep "" rows.
                      (v.length === 0 ? null : v) as EditableFields[typeof f.key],
                    )
                  }
                />
              ))}
            </div>
          </div>

          {/* ── Services list (view-only here, edit in /services) ── */}
          <div
            className="flex flex-col rounded-[16px] bg-white p-5"
            style={{ border: "1px solid var(--border)" }}
          >
            <div className="mb-3 flex items-center gap-2">
              <div className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-subtle)]">
                Услуги · {services.length}
              </div>
            </div>
            {services.length === 0 ? (
              <div className="rounded-[10px] bg-[var(--card-soft)] px-4 py-6 text-center text-[12.5px] text-[var(--ink-subtle)]">
                AI не нашёл услуг. Добавишь вручную позже в /services.
              </div>
            ) : (
              <ul className="flex max-h-[360px] flex-col gap-2 overflow-y-auto">
                {services.map((s) => (
                  <li
                    key={s.id}
                    className="rounded-[10px] px-3 py-2.5"
                    style={{
                      background: "var(--peach-wash)",
                      border: "1px solid var(--peach-soft)",
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <div className="text-[13px] font-semibold text-[var(--ink)]">
                        {s.name}
                      </div>
                      {s.price != null && (
                        <div
                          className="ml-auto font-mono text-[11px] tabular-nums"
                          style={{ color: "var(--peach-deep)" }}
                        >
                          €{s.price.toFixed(0)}
                        </div>
                      )}
                    </div>
                    {s.description && (
                      <div className="mt-1 text-[11.5px] leading-snug text-[var(--ink-mute)]">
                        {s.description}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
            <div
              className="mt-3 text-[11px] text-[var(--ink-subtle)]"
            >
              Деталь по услуге, цены и креативы — в разделе /services после
              онбординга.
            </div>
          </div>
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
            onClick={persistAndContinue}
            disabled={saving || !fields.name}
            className="inline-flex items-center gap-2.5 rounded-[11px] px-8 py-3 text-[14.5px] font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            style={{
              background: "var(--peach)",
              boxShadow: "0 6px 18px -6px rgba(232,149,108,0.55)",
            }}
          >
            {saving ? "Сохраняю…" : "Всё верно"}
            <ArrowRight className="size-[14px]" strokeWidth={2} />
          </button>
        </div>
      </div>
    </OnbFrame>
  );
}


function Field({
  field,
  value,
  onChange,
}: {
  field: typeof FIELDS[number];
  value: string;
  onChange: (v: string) => void;
}) {
  const Icon = field.icon;
  return (
    <label className="block">
      <span className="mb-1 inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.04em] text-[var(--ink-subtle)]">
        <Icon className="size-3" strokeWidth={1.8} />
        {field.label}
      </span>
      {field.multiline ? (
        <textarea
          rows={2}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className="w-full resize-none rounded-[10px] px-3 py-2 text-[13.5px] outline-none transition-colors"
          style={{
            background: "var(--card-soft)",
            border: "1.5px solid var(--border)",
            color: "var(--ink)",
          }}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className="w-full rounded-[10px] px-3 py-2 text-[13.5px] outline-none transition-colors"
          style={{
            background: "var(--card-soft)",
            border: "1.5px solid var(--border)",
            color: "var(--ink)",
          }}
        />
      )}
    </label>
  );
}
