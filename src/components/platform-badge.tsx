import { cn } from "@/lib/utils";

/**
 * Platform glyphs + composite badge — design handoff iter-2 §Снippets.
 * Replaces the emoji-based `📘 / 🔍` we used before.
 */

export function MetaGlyph({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M3 17.5c0 .8.2 1.5.7 2 .5.5 1.1.8 1.9.8 1 0 1.8-.3 2.5-.9.7-.6 1.5-1.6 2.4-3 .8-1.2 1.5-2.4 2.1-3.6 1.3 2.5 2.4 4.3 3.4 5.3 1 1 2.1 1.5 3.4 1.5 1.2 0 2.2-.4 2.9-1.2.7-.8 1.1-1.9 1.1-3.4V11c0-2.6-.7-4.7-2-6.3-1.3-1.5-3.1-2.3-5.3-2.3-1.4 0-2.7.4-3.9 1.2-1.2.8-2.3 2-3.4 3.6-1-1.6-2-2.8-3-3.6-1-.8-2.1-1.2-3.2-1.2-1.2 0-2.1.4-2.9 1.2C.4 4.4 0 5.5 0 6.9c0 1.4.4 3 1.2 4.7L3 17.5z"
        fill="var(--meta)"
      />
    </svg>
  );
}

export function GoogleGlyph({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M21.6 12.2c0-.7-.1-1.4-.2-2.1H12v3.9h5.4c-.2 1.2-.9 2.3-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3z" fill="var(--google)" />
      <path d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1V16C4.7 19.6 8.1 22 12 22z" fill="#34A853" />
      <path d="M6.4 13.9c-.2-.6-.3-1.2-.3-1.9s.1-1.3.3-1.9V7.7H3.1A10 10 0 002 12c0 1.6.4 3.1 1.1 4.3l3.3-2.4z" fill="#FBBC04" />
      <path d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.8-2.8C16.9 3 14.7 2 12 2 8.1 2 4.7 4.4 3.1 7.7l3.3 2.4C7.2 7.8 9.4 5.9 12 5.9z" fill="#EA4335" />
    </svg>
  );
}

export function PlatformBadge({
  platform,
  size = "sm",
}: {
  platform: "meta" | "google";
  size?: "sm" | "md";
}) {
  const sm = size === "sm";
  const isMeta = platform === "meta";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md font-mono font-semibold uppercase",
        sm ? "px-2 py-0.5 text-[10.5px]" : "px-2.5 py-1 text-[12px]",
        isMeta
          ? "bg-[var(--meta-soft)] text-[var(--meta-ink)]"
          : "bg-[var(--google-soft)] text-[var(--google-ink)]"
      )}
      style={{
        letterSpacing: "0.02em",
        border: isMeta ? "1px solid #CDDDFA" : "1px solid #D6E4FB",
      }}
    >
      {isMeta ? <MetaGlyph size={sm ? 10 : 12} /> : <GoogleGlyph size={sm ? 10 : 12} />}
      {isMeta ? "Meta" : "Google"}
    </span>
  );
}
