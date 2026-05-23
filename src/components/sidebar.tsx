"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid, Rocket, FolderOpen, MessageCircle, Image as ImageIcon,
  Globe, Inbox, BarChart3, TrendingUp, Users, Plug, Settings, LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { clearSession, getSessionUser } from "@/lib/session";
import { useEffect, useState } from "react";

/**
 * Sidebar nav per design handoff (README.md §0).
 *
 * Style notes:
 *   - bg: cream (#F8F5EE → token --sidebar)
 *   - logo: peach sparkle + "MiloAI" in Bricolage Grotesque 18/700
 *   - nav items: 14-15 Geist; active = card-soft bg + ink text + 500 weight
 *   - bottom items (Accounts / Settings) pinned via flex-1 spacer above
 */

const TOP_NAV = [
  { href: "/dashboard",  label: "Dashboard",   icon: LayoutGrid },
  { href: "/channels",   label: "Каналы",      icon: BarChart3 },
  { href: "/campaigns",  label: "Кампании",    icon: Rocket },
  { href: "/services",   label: "Услуги",      icon: FolderOpen },
  { href: "/chat",       label: "Чат с AI",    icon: MessageCircle },
  { href: "/creatives",  label: "Креативы",    icon: ImageIcon },
  { href: "/landings",   label: "Лендинги",    icon: Globe },
  { href: "/inbox",      label: "Lead Inbox",  icon: Inbox },
  { href: "/analytics",  label: "Аналитика",   icon: TrendingUp },
  { href: "/competitors", label: "Конкуренты", icon: Users },
] as const;

const BOTTOM_NAV = [
  { href: "/accounts", label: "Аккаунты",  icon: Plug },
  { href: "/settings", label: "Настройки", icon: Settings },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const [me, setMe] = useState<ReturnType<typeof getSessionUser> | null>(null);
  useEffect(() => { setMe(getSessionUser()); }, [pathname]);

  function logout() {
    clearSession();
    window.location.assign("/login");
  }

  return (
    <aside
      className="hidden md:flex h-screen w-60 shrink-0 flex-col bg-sidebar border-r"
      style={{ borderColor: "var(--sidebar-border)" }}
    >
      {/* Logo */}
      <div className="px-4 pt-5 pb-4 flex items-center gap-2.5">
        <SparkleLogo size={22} />
        <div className="leading-tight">
          <div className="font-heading text-[18px] font-bold tracking-tight text-foreground">
            MiloAI
          </div>
          <div className="text-[11px] text-[var(--ink-subtle)] -mt-0.5">
            AI media buyer
          </div>
        </div>
      </div>

      {/* Top items */}
      <nav className="px-2 py-2 space-y-0.5">
        {TOP_NAV.map((item) => (
          <NavItem key={item.href} {...item} active={isActive(pathname, item.href)} />
        ))}
      </nav>

      <div className="flex-1" />

      {/* Bottom items */}
      <nav className="px-2 py-2 space-y-0.5">
        {BOTTOM_NAV.map((item) => (
          <NavItem key={item.href} {...item} active={isActive(pathname, item.href)} />
        ))}
      </nav>

      {me && (
        <button
          onClick={logout}
          className="mx-2 mb-1 flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] text-[var(--ink-mute)] hover:bg-[var(--card-soft)]/60 hover:text-foreground transition-colors"
          title="Завершить сессию"
        >
          <LogOut className="size-[15px]" strokeWidth={1.6} />
          <div className="flex-1 min-w-0 text-left leading-tight">
            <div className="truncate text-[13px] text-foreground">
              {me.first_name || me.username || "Пользователь"}
            </div>
            <div className="truncate font-mono text-[10.5px] text-[var(--ink-subtle)]">
              {me.username ? `@${me.username}` : `id ${me.user_id}`} · выйти
            </div>
          </div>
        </button>
      )}
      <div className="px-4 py-2 text-[10px] text-[var(--ink-subtle)] font-mono">
        v0.1 · {process.env.NEXT_PUBLIC_API_URL ? "prod" : "dev"}
      </div>
    </aside>
  );
}

function NavItem({
  href, label, icon: Icon, active,
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
        "flex items-center gap-3 rounded-lg px-3 py-2 text-[14px] transition-colors",
        active
          ? "bg-[var(--card-soft)] text-foreground font-medium"
          : "text-[var(--ink-mute)] hover:bg-[var(--card-soft)]/60 hover:text-foreground"
      )}
    >
      <Icon
        className={cn(
          "size-[17px] shrink-0",
          active ? "text-foreground" : "text-[var(--ink-mute)]"
        )}
        strokeWidth={1.6}
      />
      <span className="tracking-[-0.01em]">{label}</span>
    </Link>
  );
}

function isActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(href + "/");
}

/**
 * The brand mark — two-pointed sparkle, peach-on-ink-fill at full opacity +
 * smaller satellite at 55% opacity. Matches the SparkleLogo SVG in
 * design_handoff_miloai/components.jsx.
 */
function SparkleLogo({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" aria-hidden>
      <path
        d="M14 2l2 9 9 2-9 2-2 9-2-9-9-2 9-2 2-9z"
        fill="var(--peach)"
      />
      <path
        d="M22.5 4l.7 2.8 2.8.7-2.8.7-.7 2.8-.7-2.8-2.8-.7 2.8-.7.7-2.8z"
        fill="var(--peach)"
        opacity="0.55"
      />
    </svg>
  );
}
