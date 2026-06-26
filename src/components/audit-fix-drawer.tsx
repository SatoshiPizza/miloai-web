"use client";

/**
 * AuditFixDrawer — sliding panel for the "Внести правки" action on a
 * wizard-audit warning. Three flavours, picked by the warning's `code`:
 *
 *   contacts → three plain inputs (phone / whatsapp / email). No AI
 *              prefill — phone numbers can't be hallucinated honestly.
 *   audience → single textarea; "🤖 Подсказать AI" button calls
 *              POST /api/web/audit/suggest-fix and drops the text in.
 *   offer    → identical to audience but writes to business.usp for now
 *              (we don't have a dedicated offer field on Business; usp
 *              is the closest carrier and the prompt knows it).
 *
 * Saves through tgBridge.patchBusiness, then signals the parent to
 * re-run the audit so the warning flips to OK.
 */

import { useState, useEffect, useCallback } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Sparkles, Check } from "lucide-react";
import { toast } from "sonner";
import { tgBridge, type BusinessDetail } from "@/lib/tg-bridge";

type FixCode = "contacts" | "audience" | "offer";

export function AuditFixDrawer({
  open,
  code,
  business,
  serviceId,
  onClose,
  onSaved,
}: {
  open: boolean;
  code: FixCode | null;
  business: BusinessDetail | null;
  serviceId?: number;
  onClose: () => void;
  onSaved: () => void;
}) {
  // Pre-seed inputs from current business so the user sees what's
  // already there before they overwrite it.
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [audience, setAudience] = useState("");
  const [offer, setOffer] = useState("");
  const [aiBusy, setAiBusy] = useState(false);
  const [aiReason, setAiReason] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Reset state every time the drawer opens with a fresh code.
  useEffect(() => {
    if (!open || !business) return;
    setPhone(business.contact_phone || "");
    setWhatsapp(business.contact_whatsapp || "");
    setEmail(business.contact_email || "");
    setAudience(business.target_audience || "");
    setOffer(business.usp || "");
    setAiReason(null);
  }, [open, business]);

  const handleAiSuggest = useCallback(async () => {
    if (!code || code === "contacts") return;
    setAiBusy(true);
    setAiReason(null);
    try {
      const res = await tgBridge.auditSuggestFix({ code, service_id: serviceId });
      if (code === "audience") setAudience(res.suggestion);
      else if (code === "offer") setOffer(res.suggestion);
      setAiReason(res.reasoning);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "AI отказала";
      toast.error(`Не получилось: ${msg}`);
    } finally {
      setAiBusy(false);
    }
  }, [code, serviceId]);

  const handleSave = useCallback(async () => {
    if (!business || !code) return;
    setSaving(true);
    try {
      const patch: Partial<BusinessDetail> = {};
      if (code === "contacts") {
        patch.contact_phone = phone.trim() || null;
        patch.contact_whatsapp = whatsapp.trim() || null;
        patch.contact_email = email.trim() || null;
      } else if (code === "audience") {
        patch.target_audience = audience.trim() || null;
      } else if (code === "offer") {
        // No dedicated offer column on Business — fold it into the USP
        // text so the next generation prompt sees it. When we add a
        // proper offer field this branch moves to that.
        patch.usp = offer.trim() || null;
      }
      await tgBridge.patchBusiness(business.id, patch);
      toast.success("Сохранено. Аудит сейчас пересоберётся.");
      onSaved();
      onClose();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "не удалось сохранить";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }, [business, code, phone, whatsapp, email, audience, offer, onSaved, onClose]);

  if (!open || !code) return null;

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <SheetContent side="right" className="w-full sm:max-w-[460px]">
        <SheetHeader>
          <SheetTitle className="font-heading text-[22px] tracking-[-0.018em]">
            {code === "contacts" && "Добавь контакты"}
            {code === "audience" && "Опиши аудиторию"}
            {code === "offer" && "First-step оффер"}
          </SheetTitle>
          <SheetDescription className="text-[13px] leading-relaxed">
            {code === "contacts" && "Лиды должны знать как с тобой связаться. Хотя бы одно поле — телефон или WhatsApp."}
            {code === "audience" && "Кому именно показываем рекламу. Чем точнее — тем дешевле лид."}
            {code === "offer" && "Бесплатный или дешёвый первый шаг — чтобы холодные клиенты дали свой контакт."}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 flex flex-col gap-4">
          {code === "contacts" && (
            <>
              <Field
                label="Телефон"
                hint="С кодом страны, например +372 5555 5555"
                value={phone}
                onChange={setPhone}
                placeholder="+372 5681 7483"
              />
              <Field
                label="WhatsApp"
                hint="Если совпадает с номером выше — продублируй"
                value={whatsapp}
                onChange={setWhatsapp}
                placeholder="+372 5681 7483"
              />
              <Field
                label="Email"
                value={email}
                onChange={setEmail}
                placeholder="info@uniads.eu"
                type="email"
              />
            </>
          )}

          {(code === "audience" || code === "offer") && (
            <>
              <div className="flex items-center justify-between">
                <Label className="text-[12.5px] text-[var(--ink-mute)]">
                  {code === "audience" ? "Описание целевой аудитории" : "Оффер первого шага"}
                </Label>
                <button
                  type="button"
                  onClick={handleAiSuggest}
                  disabled={aiBusy}
                  className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[12px] font-medium transition-opacity hover:opacity-80 disabled:opacity-50"
                  style={{ background: "var(--peach-wash)", color: "var(--peach-deep)" }}
                >
                  {aiBusy ? <Loader2 className="size-3 animate-spin" /> : <Sparkles className="size-3" />}
                  Подсказать AI
                </button>
              </div>
              <textarea
                value={code === "audience" ? audience : offer}
                onChange={(e) => code === "audience" ? setAudience(e.target.value) : setOffer(e.target.value)}
                placeholder={
                  code === "audience"
                    ? 'Например: "Владельцы квартир и домов в Таллине, 30-55 лет, делают капремонт, ценят чистую работу под ключ."'
                    : 'Например: "Бесплатный замер и смета за 1 день, никаких обязательств."'
                }
                className="w-full min-h-[140px] rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-colors resize-y"
                style={{
                  background: "var(--card)",
                  border: "1.5px solid var(--border)",
                  color: "var(--ink)",
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--peach)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
              />
              {aiReason && (
                <div
                  className="rounded-lg px-3 py-2 text-[12px] leading-relaxed"
                  style={{ background: "var(--card-soft)", color: "var(--ink-mute)" }}
                >
                  <Sparkles className="inline size-3 mr-1" style={{ color: "var(--peach)" }} />
                  <b className="text-[var(--ink)]">AI:</b> {aiReason}
                </div>
              )}
            </>
          )}
        </div>

        <div className="mt-8 flex items-center justify-end gap-2.5">
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Отмена
          </Button>
          <Button onClick={handleSave} disabled={saving} className="gap-1.5">
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
            Сохранить
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Field({
  label,
  hint,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <Label className="text-[12.5px] text-[var(--ink-mute)] mb-1.5 block">{label}</Label>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="text-[14px]"
      />
      {hint && <div className="text-[11.5px] text-[var(--ink-subtle)] mt-1">{hint}</div>}
    </div>
  );
}
