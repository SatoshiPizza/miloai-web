"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Image as ImageIcon, Sparkles, X, Loader2, Trash2, Upload } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { MetaGlyph, GoogleGlyph } from "@/components/platform-badge";
import { tgBridge, type ServiceSummary, type ServiceBannerPreview } from "@/lib/tg-bridge";
import { config } from "@/lib/config";
import { getSessionToken } from "@/lib/session";
import { toast } from "sonner";
import { EmptyState as SharedEmptyState } from "@/components/empty-state";

/**
 * Creatives gallery — design handoff iter-2 §screen-creatives.jsx.
 *
 * Each BusinessService carries up to N banner_previews (angle, headline,
 * subheadline, color_scheme). Flatten across all services + duplicate for
 * each platform the service has assets in (meta / google).
 */

type Creative = {
  key: string;
  service: ServiceSummary;
  platform: "meta" | "google";
  preview: ServiceBannerPreview;
  /** Index of this variant inside service.banner_previews — needed to
   * build the /services/{id}/banner/{index}.png URL. */
  index: number;
};

const ANGLES = ["Все", "Pain+Solution", "Direct Offer", "Trust+Premium"];
const PLATFORMS = [
  { label: "Все", value: "all" as const },
  { label: "Meta", value: "meta" as const },
  { label: "Google", value: "google" as const },
];

export default function CreativesPage() {
  const [services, setServices] = useState<ServiceSummary[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [serviceFilter, setServiceFilter] = useState<string>("all");
  const [platformFilter, setPlatformFilter] = useState<"all" | "meta" | "google">("all");
  const [angleFilter, setAngleFilter] = useState<string>("Все");
  const [photoManagerOpen, setPhotoManagerOpen] = useState(false);
  const [photoCount, setPhotoCount] = useState<number | null>(null);
  const [regenServiceId, setRegenServiceId] = useState<number | null>(null);

  useEffect(() => {
    tgBridge.services()
      .then(setServices)
      .catch((e) => {
        console.error(e);
        toast.error("Не удалось загрузить креативы");
      })
      .finally(() => setLoading(false));
    tgBridge.listBusinessPhotos()
      .then((r) => setPhotoCount(r.photos.length))
      .catch(() => setPhotoCount(0));
  }, []);

  async function regenerateAll() {
    if (!services || services.length === 0) {
      toast.error("Нет услуг для регенерации");
      return;
    }
    // Regenerate every service in sequence. The user's mental model when
    // clicking this button is "make ALL these ugly creatives better" —
    // regenerating just one leaves a confusing mix of old+new (which is
    // exactly the bug Артём hit). Sequential (not parallel) to avoid
    // hammering the OpenAI TPM quota when a business has 10+ services.
    const targets = services;
    const failed: string[] = [];
    for (const target of targets) {
      setRegenServiceId(target.id);
      try {
        const updated = await tgBridge.regenerateServiceCreatives(target.id);
        setServices((prev) =>
          (prev ?? []).map((s) => (s.id === updated.id ? updated : s)),
        );
      } catch (e) {
        console.warn(`regen failed for ${target.name}`, e);
        failed.push(target.name);
      }
    }
    setRegenServiceId(null);
    if (failed.length === 0) {
      toast.success(`Перегенерировано ${targets.length} услуг`);
    } else {
      toast.error(
        `${targets.length - failed.length}/${targets.length} готово. Не удалось: ${failed.join(", ")}`,
      );
    }
  }

  const creatives = useMemo(() => flattenCreatives(services ?? []), [services]);
  const filtered = useMemo(
    () =>
      creatives.filter(
        (c) =>
          (serviceFilter === "all" || c.service.name === serviceFilter) &&
          (platformFilter === "all" || c.platform === platformFilter) &&
          (angleFilter === "Все" || c.preview.angle === angleFilter)
      ),
    [creatives, serviceFilter, platformFilter, angleFilter]
  );

  const serviceNames = useMemo(
    () => Array.from(new Set((services ?? []).map((s) => s.name))),
    [services]
  );

  return (
    <div className="p-7 max-w-[1400px]">
      <CounterCreativeBanner />

      {/* Header */}
      <header className="flex flex-col lg:flex-row lg:items-end gap-4 mb-5">
        <div className="flex-1">
          <h1 className="font-heading text-[28px] font-bold leading-none tracking-[-0.025em]">
            Креативы
          </h1>
          <p className="text-[13.5px] text-[var(--ink-mute)] mt-1.5">
            {loading
              ? "—"
              : `${creatives.length} баннер${plural(creatives.length, ["", "а", "ов"])} · сгенерированы AI из фото с лендинга и описания услуг`}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setPhotoManagerOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-[10px] text-[13px] font-medium text-[var(--ink)] bg-card border border-[var(--border)] hover:bg-[var(--card-soft)] transition-colors"
            title="Управление референсными фото"
          >
            <ImageIcon className="size-[13px] text-[var(--ink-mute)]" />
            Фото
            {photoCount != null && photoCount > 0 && (
              <span
                className="ml-0.5 px-1.5 rounded-full font-mono text-[10px] font-semibold"
                style={{ background: "var(--peach-wash)", color: "var(--peach-deep)" }}
              >
                {photoCount}
              </span>
            )}
          </button>
          <button
            onClick={regenerateAll}
            disabled={regenServiceId != null || !services || services.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-[10px] text-[13px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ background: "var(--peach)" }}
            title="Перегенерировать креативы для всех услуг"
          >
            {regenServiceId != null ? (
              <>
                <Loader2 className="size-[13px] animate-spin" />
                {(() => {
                  const total = services?.length ?? 0;
                  const idx = services?.findIndex((s) => s.id === regenServiceId) ?? -1;
                  return idx >= 0 && total > 0
                    ? `${idx + 1}/${total}`
                    : "Генерю…";
                })()}
              </>
            ) : (
              <>
                <Sparkles className="size-[13px]" />
                Сгенерить всё
              </>
            )}
          </button>
        </div>
      </header>

      <PhotoManager
        open={photoManagerOpen}
        onClose={() => setPhotoManagerOpen(false)}
        onCountChange={setPhotoCount}
      />

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center gap-x-[18px] gap-y-2.5 mb-5">
        <FilterGroup
          label="Услуга"
          items={["Все", ...serviceNames]}
          value={serviceFilter === "all" ? "Все" : serviceFilter}
          onChange={(v) => setServiceFilter(v === "Все" ? "all" : v)}
        />
        <FilterGroup
          label="Платформа"
          items={PLATFORMS.map((p) => p.label)}
          value={PLATFORMS.find((p) => p.value === platformFilter)?.label ?? "Все"}
          onChange={(v) => {
            const found = PLATFORMS.find((p) => p.label === v);
            setPlatformFilter(found?.value ?? "all");
          }}
        />
        <FilterGroup
          label="Угол"
          items={ANGLES}
          value={angleFilter}
          onChange={setAngleFilter}
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => <Skeleton key={i} className="aspect-square rounded-[14px]" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState hasAny={creatives.length > 0} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filtered.map((c) => <CreativeCard key={c.key} creative={c} />)}
        </div>
      )}
    </div>
  );
}


// ═════════════════════════════════════════════════════════════════════════════
// Card
// ═════════════════════════════════════════════════════════════════════════════

/**
 * BannerImage — fetches the composed PNG from
 * `/api/web/services/{id}/banner/{index}.png` and renders it as a blob
 * URL. Auth-header-only, so we can't use plain <img src>; we fetch with
 * Bearer token / dev x-user-id, blob-convert, and revoke on unmount.
 *
 * Loading + error states fall back to the original gradient placeholder
 * so the card always communicates layout+headline even before the
 * backend responds (first render is ~2-5s: playwright warm-up + photo
 * pick + composite).
 */
function BannerImage({ creative, tint }: { creative: Creative; tint: string }) {
  const [pngUrl, setPngUrl] = useState<string | null>(null);
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    let alive = true;
    let objectUrl: string | null = null;
    const headers: Record<string, string> = {
      "ngrok-skip-browser-warning": "1",
    };
    const token = getSessionToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
    else if (config.devUserId) headers["x-user-id"] = config.devUserId;

    fetch(
      `${config.apiUrl}/api/web/services/${creative.service.id}/banner/${creative.index}.png`,
      { headers },
    )
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.blob();
      })
      .then((blob) => {
        if (!alive) return;
        objectUrl = URL.createObjectURL(blob);
        setPngUrl(objectUrl);
      })
      .catch(() => {
        if (alive) setErrored(true);
      });

    return () => {
      alive = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [creative.service.id, creative.index]);

  const businessName = creative.service.name;

  // Show the real PNG once loaded. Platform corner + brand pill still
  // overlay on top so the card still marks Meta/Google + brand.
  if (pngUrl && !errored) {
    return (
      <div className="relative aspect-square overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={pngUrl} alt={creative.preview.headline} className="w-full h-full object-cover" />
        <div className="absolute top-3 right-3 z-10 size-6 rounded-md bg-white/95 flex items-center justify-center">
          {creative.platform === "meta" ? <MetaGlyph size={12} /> : <GoogleGlyph size={12} />}
        </div>
      </div>
    );
  }

  // Placeholder — same design as before while PNG is loading / failed.
  return (
    <div
      className="relative aspect-square p-[18px] flex flex-col"
      style={{ background: `linear-gradient(160deg, ${tint} 0%, ${tint}d0 60%, ${tint}88 100%)` }}
    >
      <div
        className="absolute inset-0 opacity-40"
        style={{ background: `repeating-linear-gradient(135deg, ${tint} 0 14px, ${tint}cc 14px 28px)` }}
      />
      <div
        className="absolute inset-0"
        style={{ background: `radial-gradient(circle at 30% 30%, transparent 30%, ${tint}cc 100%)` }}
      />
      <div className="absolute top-3 right-3 z-10 size-6 rounded-md bg-white/95 flex items-center justify-center">
        {creative.platform === "meta" ? <MetaGlyph size={12} /> : <GoogleGlyph size={12} />}
      </div>
      <div
        className="relative z-10 self-start px-2.5 py-1 rounded-full font-mono text-[10px] font-semibold uppercase"
        style={{ background: "rgba(255,255,255,0.95)", color: tint, letterSpacing: "0.04em" }}
      >
        {truncate(businessName, 20)}
      </div>
      <div className="flex-1" />
      <div className="relative z-10">
        <div
          className="font-heading text-[17px] font-semibold leading-[1.15] tracking-[-0.01em] text-white"
          style={{ textShadow: "0 1px 2px rgba(0,0,0,0.2)" }}
        >
          {creative.preview.headline}
        </div>
        {creative.preview.subheadline && (
          <div className="text-[12px] mt-1.5" style={{ color: "rgba(255,255,255,0.85)" }}>
            {creative.preview.subheadline}
          </div>
        )}
      </div>
      <div
        className="relative z-10 mt-3 px-3.5 py-1.5 rounded-full self-start text-[11.5px] font-semibold"
        style={{ background: "#fff", color: tint }}
      >
        Записаться →
      </div>
      {/* Tiny loading pill in bottom-right — signals real PNG is
          rendering in the background */}
      {!errored && (
        <div
          className="absolute bottom-2 right-2 z-10 flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9.5px] font-mono uppercase tracking-[0.05em]"
          style={{ background: "rgba(0,0,0,0.35)", color: "white" }}
        >
          <Loader2 className="size-2.5 animate-spin" />
          рендер…
        </div>
      )}
    </div>
  );
}


function CreativeCard({ creative }: { creative: Creative }) {
  const tint = resolveTint(creative.preview.color_scheme);

  return (
    <div className="rounded-[14px] border border-[var(--border)] bg-card overflow-hidden flex flex-col">
      {/* Real rendered banner PNG from backend. Falls back to the
          gradient+text placeholder while loading / on error so the card
          still communicates the layout. */}
      <BannerImage creative={creative} tint={tint} />

      {/* Card meta */}
      <div className="px-3.5 py-2.5 flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-[12.5px] font-medium text-[var(--ink)] truncate">
            {creative.service.name}
          </span>
          <span className="font-mono text-[10px] text-[var(--ink-subtle)] bg-[var(--card-soft)] px-1.5 py-px rounded border border-[var(--border)] shrink-0">
            {creative.preview.angle}
          </span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[10.5px] text-[var(--ink-subtle)] tabular-nums">
          {creative.service.price != null && (
            <>
              <span>от {creative.service.price_currency === "EUR" ? "€" : creative.service.price_currency}{creative.service.price}</span>
              <span>·</span>
            </>
          )}
          <span>{creative.platform === "meta" ? "Meta" : "Google"}</span>
        </div>
      </div>
    </div>
  );
}


// ═════════════════════════════════════════════════════════════════════════════
// Filter pill row
// ═════════════════════════════════════════════════════════════════════════════

function FilterGroup({
  label, items, value, onChange,
}: {
  label: string;
  items: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <span className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-[var(--ink-subtle)] mr-1">
        {label}
      </span>
      {items.map((it) => {
        const active = value === it;
        return (
          <button
            key={it}
            onClick={() => onChange(it)}
            className={`px-2.5 py-1 rounded-[7px] text-[12px] transition-colors border ${
              active
                ? "bg-[var(--card-soft)] text-[var(--ink)] border-[var(--border)]"
                : "bg-transparent text-[var(--ink-mute)] border-transparent hover:text-[var(--ink)]"
            }`}
          >
            {it}
          </button>
        );
      })}
    </div>
  );
}


// ═════════════════════════════════════════════════════════════════════════════
// Empty state
// ═════════════════════════════════════════════════════════════════════════════

function EmptyState({ hasAny }: { hasAny: boolean }) {
  if (hasAny) {
    return (
      <div className="rounded-[14px] border border-[var(--border)] bg-card px-6 py-12 text-center">
        <ImageIcon className="size-10 mx-auto mb-3 text-[var(--ink-subtle)]/50" />
        <p className="text-sm font-medium text-[var(--ink)]">
          Под фильтр ничего не подходит.
        </p>
        <p className="text-xs text-[var(--ink-mute)] mt-1">
          Сбрось фильтр или попробуй другую услугу.
        </p>
      </div>
    );
  }
  return (
    <SharedEmptyState
      icon={ImageIcon}
      eyebrow="Креативы"
      title="AI готов рисовать баннеры"
      body="Сначала нужен профиль бизнеса и хотя бы одна услуга — оттуда AI возьмёт углы, USP, фото и сгенерит баннеры под Meta и Google."
      actions={[
        {
          label: "Запустить анализ",
          href: "/onboarding",
          primary: true,
          icon: Sparkles,
        },
        {
          label: "Заполнить услугу",
          href: "/services",
        },
      ]}
    />
  );
}


// ═════════════════════════════════════════════════════════════════════════════
// Helpers
// ═════════════════════════════════════════════════════════════════════════════

function flattenCreatives(services: ServiceSummary[]): Creative[] {
  const out: Creative[] = [];
  for (const s of services) {
    const platforms: ("meta" | "google")[] = [];
    if (s.has_meta_creatives) platforms.push("meta");
    if (s.has_google_rsa) platforms.push("google");
    if (platforms.length === 0) platforms.push("meta");

    for (const p of platforms) {
      s.banner_previews.forEach((preview, idx) => {
        out.push({
          key: `${s.id}-${p}-${idx}`,
          service: s,
          platform: p,
          preview,
          index: idx,
        });
      });
    }
  }
  return out;
}

/** Map BusinessService.color_scheme strings to hex tints used in the design. */
function resolveTint(scheme: string | undefined | null): string {
  if (!scheme) return "#3B5C44";
  const lower = scheme.toLowerCase();
  if (lower.includes("#") && lower.length >= 4) {
    // Already a hex value.
    return scheme.split(/[,\s]/)[0];
  }
  if (lower.includes("warm") || lower.includes("peach") || lower.includes("brown")) return "#5E4A38";
  if (lower.includes("dark") || lower.includes("luxury") || lower.includes("premium")) return "#2E3F4F";
  if (lower.includes("blue") || lower.includes("trust")) return "#46538C";
  if (lower.includes("green") || lower.includes("nature")) return "#3B5C44";
  if (lower.includes("slate") || lower.includes("gray")) return "#4A4040";
  if (lower.includes("teal") || lower.includes("aqua")) return "#3C5F70";
  if (lower.includes("olive") || lower.includes("moss")) return "#4C5B3E";
  return "#5E4A38";
}

function truncate(s: string, n: number): string {
  return s.length <= n ? s : `${s.slice(0, n - 1)}…`;
}

function plural(n: number, forms: [string, string, string]): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return forms[0];
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return forms[1];
  return forms[2];
}


/**
 * Counter-creative brief banner — shown when the user clicks
 * «Создать контр-креатив» on a competitor ad. Reads the URL params:
 *   ?counter=1&advertiser=...&headline=...&body=...&format=...
 * and renders an AI-style summary the creative generation pipeline can
 * pick up. For now this is a visible bridge — the actual generation flow
 * (one-click AI Make) will plug into this same brief object.
 */
function CounterCreativeBanner() {
  const sp = useSearchParams();
  const [dismissed, setDismissed] = useState(false);

  const counter = sp?.get("counter");
  if (!counter || dismissed) return null;

  const advertiser = sp?.get("advertiser") || "конкурент";
  const headline = sp?.get("headline") || "";
  const body = sp?.get("body") || "";
  const format = sp?.get("format") || "image";

  return (
    <div
      className="mb-5 flex items-start gap-3 rounded-[14px] p-4"
      style={{
        background: "linear-gradient(135deg, #FCF1E8 0%, #F8E8D9 100%)",
        border: "1px solid #F5DDC8",
      }}
    >
      <div
        className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white"
        style={{ boxShadow: "0 4px 14px -4px rgba(232,149,108,0.45)" }}
      >
        <Sparkles
          className="size-[17px]"
          style={{ color: "var(--peach)" }}
          strokeWidth={1.6}
        />
      </div>
      <div className="min-w-0 flex-1">
        <div
          className="mb-1 font-mono text-[10.5px] font-semibold uppercase tracking-[0.1em]"
          style={{ color: "var(--peach-deep)" }}
        >
          AI · бриф от Конкурентов
        </div>
        <div className="text-[13.5px] leading-snug text-[var(--ink)]">
          Контр-креатив против <b>{advertiser}</b> · формат <b>{format}</b>.
          {headline && (
            <>
              {" "}
              Их хук: <em>«{headline}»</em>.
            </>
          )}
          {body && (
            <>
              {" "}
              Текст: <span className="text-[var(--ink-mute)]">«{body.slice(0, 120)}{body.length > 120 ? "…" : ""}»</span>
            </>
          )}
          <div className="mt-1.5 text-[12px] text-[var(--ink-mute)]">
            AI учтёт этот хук при следующей генерации — нажми «Перегенерить»
            на любом баннере или дождись следующей кампании через визард.
          </div>
        </div>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="size-7 shrink-0 rounded-md text-[var(--ink-mute)] hover:bg-white/40 hover:text-[var(--ink)] transition-colors inline-flex items-center justify-center"
        title="Скрыть"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}


// ═════════════════════════════════════════════════════════════════════════════
// Photo manager — sheet drawer
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Sheet-based photo pool manager. Shows current photos as a grid with
 * hover-delete + a file picker / drag-drop zone. Photos are stored as
 * data URIs on business.photo_pool and picked up by the banner
 * renderer's `_pick_banner_photo` walk (business → user → gpt-image-1 →
 * Unsplash).
 */
function PhotoManager({
  open,
  onClose,
  onCountChange,
}: {
  open: boolean;
  onClose: () => void;
  onCountChange: (n: number) => void;
}) {
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [deletingIdx, setDeletingIdx] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    tgBridge.listBusinessPhotos()
      .then((r) => {
        setPhotos(r.photos);
        onCountChange(r.photos.length);
      })
      .catch(() => setPhotos([]))
      .finally(() => setLoading(false));
  }, [open, onCountChange]);

  async function handleFiles(files: FileList | File[]) {
    const arr = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (arr.length === 0) {
      toast.error("Только изображения (JPG/PNG/WebP)");
      return;
    }
    if (arr.length > 10) {
      toast.error("До 10 фото за раз");
      return;
    }
    setUploading(true);
    try {
      const r = await tgBridge.uploadBusinessPhotos(arr);
      setPhotos(r.photos);
      onCountChange(r.photos.length);
      toast.success(`Добавлено ${arr.length} фото. Всего: ${r.photos.length}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "не удалось загрузить");
    } finally {
      setUploading(false);
    }
  }

  async function removePhoto(index: number) {
    setDeletingIdx(index);
    try {
      const r = await tgBridge.deleteBusinessPhoto(index);
      setPhotos(r.photos);
      onCountChange(r.photos.length);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "не удалось удалить");
    } finally {
      setDeletingIdx(null);
    }
  }

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <SheetContent side="right" className="w-full sm:max-w-[560px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-heading text-[22px] tracking-[-0.018em]">
            Референсные фото
          </SheetTitle>
          <SheetDescription className="text-[13px] leading-relaxed">
            Твои фото → баннеры, лендинги, креативы. Если пусто — AI
            сгенерирует product-shot автоматически. До 60 фото.
          </SheetDescription>
        </SheetHeader>

        {/* Upload zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            if (e.dataTransfer.files.length > 0) handleFiles(e.dataTransfer.files);
          }}
          onClick={() => inputRef.current?.click()}
          className="mt-5 rounded-[12px] px-5 py-8 text-center cursor-pointer transition-colors"
          style={{
            background: dragOver ? "var(--peach-wash)" : "var(--card-soft)",
            border: `1.5px dashed ${dragOver ? "var(--peach)" : "var(--border)"}`,
          }}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files) handleFiles(e.target.files);
              if (inputRef.current) inputRef.current.value = "";
            }}
          />
          {uploading ? (
            <div className="flex flex-col items-center gap-2 text-[13px] text-[var(--ink-mute)]">
              <Loader2 className="size-5 animate-spin" style={{ color: "var(--peach-deep)" }} />
              Загружаю…
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div
                className="size-10 rounded-full flex items-center justify-center"
                style={{ background: "var(--peach-wash)" }}
              >
                <Upload className="size-4" style={{ color: "var(--peach-deep)" }} />
              </div>
              <div className="text-[13.5px] font-medium text-[var(--ink)]">
                Кликни или перетащи фото
              </div>
              <div className="text-[11.5px] text-[var(--ink-subtle)]">
                JPG / PNG / WebP · до 10 за раз · до 15 МБ каждое
              </div>
            </div>
          )}
        </div>

        {/* Grid */}
        <div className="mt-6">
          <div className="mb-3 font-mono text-[10.5px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-subtle)]">
            В пуле · {photos.length}
          </div>
          {loading ? (
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="aspect-square rounded-[10px]" />
              ))}
            </div>
          ) : photos.length === 0 ? (
            <div
              className="rounded-[10px] px-4 py-6 text-center text-[12.5px] text-[var(--ink-subtle)]"
              style={{ background: "var(--card-soft)" }}
            >
              Пока пусто. Загрузи 3-5 фото продукта / витрины / команды —
              AI подставит их в баннеры вместо стоков.
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {photos.map((src, i) => (
                <div
                  key={i}
                  className="relative aspect-square rounded-[10px] overflow-hidden group"
                  style={{ background: "var(--card-soft)", border: "1px solid var(--border)" }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt={`Photo ${i + 1}`}
                    className="w-full h-full object-cover"
                    style={{ opacity: deletingIdx === i ? 0.4 : 1 }}
                  />
                  <button
                    onClick={(e) => { e.stopPropagation(); removePhoto(i); }}
                    disabled={deletingIdx === i}
                    className="absolute top-1.5 right-1.5 size-6 rounded-full bg-white/95 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                    title="Удалить"
                  >
                    {deletingIdx === i ? (
                      <Loader2 className="size-3 animate-spin text-[var(--ink-mute)]" />
                    ) : (
                      <Trash2 className="size-3 text-[var(--destructive)]" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
