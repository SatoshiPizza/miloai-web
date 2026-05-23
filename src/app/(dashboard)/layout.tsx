import { Sidebar } from "@/components/sidebar";
import { SessionGuard } from "@/components/session-guard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionGuard>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </SessionGuard>
  );
}
