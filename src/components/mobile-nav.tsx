"use client";

/**
 * MobileNav — fixed top bar shown only below md (< 768px).
 *
 * The desktop sidebar is `hidden md:flex` so on phones there's currently no
 * navigation at all. This component fills that gap with:
 *   • brand mark on the left
 *   • current business name (compact business switcher)
 *   • hamburger that opens a full-height drawer with the same nav items as
 *     the sidebar
 *
 * Drawer state is local — opens on hamburger tap, closes on overlay tap,
 * Escape, or any nav-item click (so the user lands on the chosen route
 * without an extra dismiss action).
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Menu, X, Sparkles, LogOut,
  LayoutGrid, Rocket, FolderOpen, MessageCircle, Image as ImageIcon,
  Globe, Inbox, BarChart3, TrendingUp, Users, Plug, Settings,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { clearSession, getSessionUser } from "@/lib/session";
import { tgBridge, type BusinessSummary, type Me } from "@/lib/tg-bridge";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/channels", label: "Каналы", icon: BarChart3 },
  { href: "/campaigns", label: "Кампании", icon: Rocket },
  { href: "/services", label: "Услуги", icon: FolderOpen },
  { href: "/chat", label: "Чат с AI", icon: MessageCircle },
  { href: "/creatives", label: "Креативы", icon: ImageIcon },
  { href: "/landings", label: "Лендинги", icon: Globe },
  { href: "/inbox", label: "Lead Inbox", icon: Inbox },
  { href: "/analytics", label: "Аналитика", icon: TrendingUp },
  { href: "/competitors", label: "Конкуренты", icon: Users },
  { href: "/accounts", label: "Аккаунты", icon: Plug },
  { href: "/settings", label: "Настройки", icon: Settings },
] as const;

export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState<ReturnType<typeof getSessionUser> | null>(null);
  const [activeBiz, setActiveBiz] = useState<BusinessSummary | null>(null);

  // Close drawer on route change.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // Lock body scroll while open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    setSession(getSessionUser());
  }, [pathname]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const me: Me = await tgBridge.me();
        if (cancelled) return;
        const found = me.businesses?.find((b) => b.id === me.active_business_id) ?? null;
        setActiveBiz(found);
      } catch {
        // silent
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  function logout() {
    clearSession();
    window.location.assign("/");
  }

  return (
    <>
      {/* Top bar — visible only on mobile */}
      <div
        className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-[var(--background)]/95 px-4 backdrop-blur md:hidden"
        style={{ borderColor: "var(--border)" }}
      >
        <Link href="/dashboard" className="flex items-center gap-2 shrink-0">
          <Sparkles
            className="size-[18px]"
            strokeWidth={1.6}
            style={{ color: "var(--peach)" }}
          />
          <span className="font-heading text-[17px] font-bold tracking-[-0.018em] text-[var(--ink)]">
            UniAds
          </span>
        </Link>

        {activeBiz && (
          <>
            <span className="text-[var(--ink-subtle)]">·</span>
            <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-[var(--ink-mute)]">
              {activeBiz.name}
            </span>
          </>
        )}
        {!activeBiz && <div className="flex-1" />}

        <button
          onClick={() => setOpen(true)}
          className="flex size-9 items-center justify-center rounded-md text-[var(--ink-mute)] hover:bg-[var(--card-soft)]/60 hover:text-[var(--ink)] transition-colors"
          aria-label="Открыть меню"
        >
          <Menu className="size-5" strokeWidth={1.7} />
        </button>
      </div>

      {/* Drawer + overlay */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-[var(--ink)]/40"
            onClick={() => setOpen(false)}
            aria-label="Закрыть меню"
          />
          <aside
            className="absolute right-0 top-0 flex h-full w-[280px] flex-col bg-sidebar shadow-2xl"
            style={{ borderLeft: "1px solid var(--sidebar-border)" }}
          >
            {/* Drawer header */}
            <div
              className="flex items-center gap-2 border-b px-4 py-3.5"
              style={{ borderColor: "var(--sidebar-border)" }}
            >
              <Sparkles
                className="size-[18px]"
                strokeWidth={1.6}
                style={{ color: "var(--peach)" }}
              />
              <span className="font-heading text-[17px] font-bold tracking-[-0.018em] text-[var(--ink)]">
                UniAds
              </span>
              <div className="flex-1" />
              <button
                onClick={() => setOpen(false)}
                className="flex size-8 items-center justify-center rounded-md text-[var(--ink-mute)] hover:bg-[var(--card-soft)]/60 hover:text-[var(--ink)] transition-colors"
                aria-label="Закрыть"
              >
                <X className="size-4" strokeWidth={1.7} />
              </button>
            </div>

            {activeBiz && (
              <div
                className="border-b px-4 py-3"
                style={{ borderColor: "var(--sidebar-border)" }}
              >
                <div className="text-[12px] text-[var(--ink-subtle)]">
                  Активный бизнес
                </div>
                <div className="mt-0.5 truncate text-[14px] font-semibold text-[var(--ink)]">
                  {activeBiz.name}
                </div>
              </div>
            )}

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
              {NAV.map((item) => (
                <NavItem
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                  active={isActive(pathname, item.href)}
                />
              ))}
            </nav>

            {/* Session + logout */}
            {session && (
              <button
                onClick={logout}
                className="mx-2 mb-3 flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] text-[var(--ink-mute)] hover:bg-[var(--card-soft)]/60 hover:text-[var(--ink)] transition-colors"
              >
                <LogOut className="size-[15px]" strokeWidth={1.6} />
                <div className="flex-1 min-w-0 text-left leading-tight">
                  <div className="truncate text-[13px] text-[var(--ink)]">
                    {session.first_name || session.username || session.email || "Пользователь"}
                  </div>
                  <div className="truncate font-mono text-[10.5px] text-[var(--ink-subtle)]">
                    выйти
                  </div>
                </div>
              </button>
            )}
          </aside>
        </div>
      )}
    </>
  );
}

function NavItem({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-[14px] transition-colors",
        active
          ? "bg-[var(--card-soft)] text-[var(--ink)] font-medium"
          : "text-[var(--ink-mute)] hover:bg-[var(--card-soft)]/60 hover:text-[var(--ink)]",
      )}
    >
      <Icon
        className={cn(
          "size-[17px] shrink-0",
          active ? "text-[var(--ink)]" : "text-[var(--ink-mute)]",
        )}
        strokeWidth={1.6}
      />
      <span className="tracking-[-0.01em]">{label}</span>
    </Link>
  );
}

function isActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(href + "/");
}
