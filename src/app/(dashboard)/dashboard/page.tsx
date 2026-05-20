import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Rocket, TrendingUp, Target, MousePointerClick, Euro, ArrowUpRight,
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="p-8 space-y-8 max-w-7xl">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Сводка по активным кампаниям за последние 7 дней.
          </p>
        </div>
        <Link href="/campaigns/new">
          <Button size="lg" className="gap-2">
            <Rocket className="size-4" />
            Новая кампания
          </Button>
        </Link>
      </header>

      {/* KPI cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={Euro} label="Spend (7d)" value="€—" sub="—" />
        <KpiCard icon={Target} label="Leads (7d)" value="—" sub="—" />
        <KpiCard icon={MousePointerClick} label="CPL" value="€—" sub="vs €— target" />
        <KpiCard icon={TrendingUp} label="ROAS" value="—" sub="—" />
      </section>

      {/* Активные кампании */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Активные кампании
          </h2>
          <Link href="/campaigns" className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
            Все <ArrowUpRight className="size-3" />
          </Link>
        </div>
        <Card>
          <CardContent className="p-0">
            <div className="p-6 text-sm text-muted-foreground text-center">
              <p>Бот ещё не подключён к этому веб-аккаунту.</p>
              <p className="mt-1">
                <span className="text-foreground font-medium">Подключи Telegram</span> в{" "}
                <Link href="/accounts" className="underline">/accounts</Link>{" "}
                — кампании Артёма из бота появятся здесь.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Аномалии */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Что изменилось за 24ч
          </h2>
          <Badge variant="outline" className="text-[10px]">live · через TG-bridge</Badge>
        </div>
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground text-center">
            Подключение к backend появится после auth + TG pairing.
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
          <Icon className="size-3.5" />
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold tracking-tight">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{sub}</p>
      </CardContent>
    </Card>
  );
}
