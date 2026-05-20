import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Rocket } from "lucide-react";
import Link from "next/link";

export default function CampaignsPage() {
  return (
    <div className="p-8 space-y-6 max-w-7xl">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Кампании</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Все живые кампании из подключённых Meta &amp; Google аккаунтов.
          </p>
        </div>
        <Link href="/campaigns/new">
          <Button size="lg" className="gap-2">
            <Rocket className="size-4" /> Новая кампания
          </Button>
        </Link>
      </header>

      <Card>
        <CardContent className="p-12 text-sm text-muted-foreground text-center">
          <p className="font-medium text-foreground">Список кампаний появится здесь.</p>
          <p className="mt-2">
            Сначала подключите Telegram в{" "}
            <Link href="/accounts" className="underline">/accounts</Link>{" "}
            и хотя бы один Meta/Google аккаунт.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
