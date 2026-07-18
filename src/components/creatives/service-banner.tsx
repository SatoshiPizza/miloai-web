"use client";

/**
 * ServiceBanner — fetches and renders one composed banner PNG from
 * `/api/web/services/{id}/banner/{index}.png`, with a gradient+text
 * placeholder while it loads (first render is 2-5s: photo pick + composite).
 *
 * Auth-header-only endpoint, so we can't use a plain <img src> — we fetch
 * with the session token, blob-convert, and revoke on unmount. Extracted from
 * the /creatives gallery so the launch wizard's Creatives step shows the same
 * real banners the user will actually run.
 */

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { MetaGlyph, GoogleGlyph } from "@/components/platform-badge";
import { config } from "@/lib/config";
import { getSessionToken } from "@/lib/session";

export function ServiceBanner({
  serviceId,
  index,
  headline,
  subheadline,
  colorScheme,
  platform,
  brand,
  /** Bump to force a re-fetch (e.g. after regenerate) — appended as ?v=. */
  refreshKey,
}: {
  serviceId: number;
  index: number;
  headline: string;
  subheadline?: string;
  colorScheme?: string;
  platform: "meta" | "google";
  brand: string;
  refreshKey?: number;
}) {
  const [pngUrl, setPngUrl] = useState<string | null>(null);
  const [errored, setErrored] = useState(false);
  const tint = resolveTint(colorScheme);

  useEffect(() => {
    let alive = true;
    let objectUrl: string | null = null;
    setPngUrl(null);
    setErrored(false);
    const headers: Record<string, string> = { "ngrok-skip-browser-warning": "1" };
    const token = getSessionToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
    else if (config.devUserId) headers["x-user-id"] = config.devUserId;

    const bust = refreshKey ? `?v=${refreshKey}` : "";
    fetch(`${config.apiUrl}/api/web/services/${serviceId}/banner/${index}.png${bust}`, { headers })
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
  }, [serviceId, index, refreshKey]);

  if (pngUrl && !errored) {
    return (
      <div className="relative aspect-square overflow-hidden rounded-[10px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={pngUrl} alt={headline} className="w-full h-full object-cover" />
        <div className="absolute top-2.5 right-2.5 z-10 size-5 rounded-md bg-white/95 flex items-center justify-center">
          {platform === "meta" ? <MetaGlyph size={11} /> : <GoogleGlyph size={11} />}
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative aspect-square p-3.5 flex flex-col rounded-[10px] overflow-hidden"
      style={{ background: `linear-gradient(160deg, ${tint} 0%, ${tint}d0 60%, ${tint}88 100%)` }}
    >
      <div className="absolute inset-0 opacity-40" style={{ background: `repeating-linear-gradient(135deg, ${tint} 0 14px, ${tint}cc 14px 28px)` }} />
      <div className="absolute inset-0" style={{ background: `radial-gradient(circle at 30% 30%, transparent 30%, ${tint}cc 100%)` }} />
      <div className="absolute top-2.5 right-2.5 z-10 size-5 rounded-md bg-white/95 flex items-center justify-center">
        {platform === "meta" ? <MetaGlyph size={11} /> : <GoogleGlyph size={11} />}
      </div>
      <div
        className="relative z-10 self-start px-2 py-0.5 rounded-full font-mono text-[9px] font-semibold uppercase"
        style={{ background: "rgba(255,255,255,0.95)", color: tint, letterSpacing: "0.04em" }}
      >
        {brand.length > 18 ? brand.slice(0, 18) + "…" : brand}
      </div>
      <div className="flex-1" />
      <div className="relative z-10">
        <div className="font-heading text-[14px] font-semibold leading-tight tracking-[-0.01em] text-white" style={{ textShadow: "0 1px 2px rgba(0,0,0,0.2)" }}>
          {headline}
        </div>
        {subheadline && (
          <div className="text-[10.5px] mt-1" style={{ color: "rgba(255,255,255,0.85)" }}>{subheadline}</div>
        )}
      </div>
      {!errored && (
        <div className="absolute bottom-2 right-2 z-10 flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-mono uppercase" style={{ background: "rgba(0,0,0,0.35)", color: "white" }}>
          <Loader2 className="size-2.5 animate-spin" /> рендер…
        </div>
      )}
    </div>
  );
}

function resolveTint(scheme: string | undefined | null): string {
  if (!scheme) return "#3B5C44";
  const l = scheme.toLowerCase();
  if (l.includes("blue")) return "#1E3A8A";
  if (l.includes("green") || l.includes("sage")) return "#2F5233";
  if (l.includes("dark") || l.includes("black")) return "#1A1A1A";
  if (l.includes("red") || l.includes("peach") || l.includes("orange")) return "#B5451F";
  return "#3B5C44";
}
