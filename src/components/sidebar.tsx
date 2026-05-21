"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Rocket,
  FolderOpen,
  Plug,
  MessageCircle,
  Settings,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/campaigns", label: "Кампании", icon: Rocket },
  { href: "/services", label: "Услуги", icon: FolderOpen },
  { href: "/chat", label: "Чат с AI", icon: MessageCircle },
  { href: "/accounts", label: "Аккаунты", icon: Plug },
  { href: "/settings", label: "Настройки", icon: Settings },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden md:flex h-screen w-60 shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground">
      <div className="px-5 py-5 border-b">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold tracking-tight">
          <Sparkles className="size-4 text-primary" />
          <span className="text-base">MiloAI</span>
        </Link>
        <p className="mt-1 text-[11px] text-muted-foreground">
          AI media buyer
        </p>
      </div>

      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className="size-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-3 text-[11px] text-muted-foreground">
        <p>v0.1 · web :3001 · api :8000</p>
      </div>
    </aside>
  );
}
