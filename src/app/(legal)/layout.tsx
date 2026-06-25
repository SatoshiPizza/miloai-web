import Link from "next/link";
import { Sparkles } from "lucide-react";

/**
 * Shared chrome for legal pages (/privacy, /terms). Minimal — no auth gate,
 * no sidebar. Anyone (including Meta/Google reviewers) can read these
 * without an account.
 */

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="border-b border-[var(--border)]/40">
        <div className="max-w-[760px] mx-auto px-6 lg:px-8 h-[64px] flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <Sparkles className="size-5 text-[var(--peach)]" strokeWidth={1.6} />
            <span className="font-heading text-[20px] font-bold tracking-tight">UniAds</span>
          </Link>
          <nav className="flex items-center gap-5 text-[13.5px] text-[var(--ink-mute)]">
            <Link href="/about" className="hover:text-[var(--ink)] transition-colors">About</Link>
            <Link href="/privacy" className="hover:text-[var(--ink)] transition-colors">Privacy</Link>
            <Link href="/terms"   className="hover:text-[var(--ink)] transition-colors">Terms</Link>
          </nav>
        </div>
      </header>
      <main className="max-w-[760px] mx-auto px-6 lg:px-8 py-12 lg:py-16">
        {children}
      </main>
      <footer className="border-t border-[var(--border)]/40 mt-10">
        <div className="max-w-[760px] mx-auto px-6 lg:px-8 py-6 text-[12px] leading-relaxed text-[var(--ink-subtle)] flex flex-col gap-1 sm:flex-row sm:justify-between">
          <div>
            <div>© 2026 <b className="font-semibold text-[var(--ink-mute)]">Siberian OÜ</b> (reg. 16192007) &middot; Tala tn 4, Tallinn 11415, Estonia</div>
            <div>UniAds is a product brand operated by Siberian OÜ.</div>
          </div>
          <div className="shrink-0 sm:text-right">
            <Link href="/" className="hover:text-[var(--ink-mute)]">Home</Link>
            {" · "}
            <Link href="/about" className="hover:text-[var(--ink-mute)]">About</Link>
            {" · "}
            <a href="mailto:info@uniads.eu" className="hover:text-[var(--ink-mute)]">info@uniads.eu</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
