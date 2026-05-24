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
            <span className="font-heading text-[20px] font-bold tracking-tight">MiloAI</span>
          </Link>
          <nav className="flex items-center gap-5 text-[13.5px] text-[var(--ink-mute)]">
            <Link href="/privacy" className="hover:text-[var(--ink)] transition-colors">Privacy</Link>
            <Link href="/terms"   className="hover:text-[var(--ink)] transition-colors">Terms</Link>
          </nav>
        </div>
      </header>
      <main className="max-w-[760px] mx-auto px-6 lg:px-8 py-12 lg:py-16">
        {children}
      </main>
      <footer className="border-t border-[var(--border)]/40 mt-10">
        <div className="max-w-[760px] mx-auto px-6 lg:px-8 py-6 text-[12.5px] text-[var(--ink-subtle)] flex justify-between">
          <span>© MiloAI · Estonia · 2026</span>
          <span>
            <Link href="/" className="hover:text-[var(--ink-mute)]">Home</Link>
            {" · "}
            <a href="mailto:hello@miloai.ee" className="hover:text-[var(--ink-mute)]">hello@miloai.ee</a>
          </span>
        </div>
      </footer>
    </div>
  );
}
