import { Sidebar } from "@/components/sidebar";
import { MobileNav } from "@/components/mobile-nav";
import { SessionGuard } from "@/components/session-guard";
import { AnomalyBell } from "@/components/anomaly-bell";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionGuard>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 min-w-0">
          <MobileNav />
          {children}
        </main>
        <AnomalyBell />
      </div>
    </SessionGuard>
  );
}
