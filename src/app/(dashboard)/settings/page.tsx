import { Card, CardContent } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="p-8 space-y-6 max-w-3xl">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Настройки</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Профиль бизнеса, target-метрики, биллинг.
        </p>
      </header>
      <Card>
        <CardContent className="p-8 text-sm text-muted-foreground text-center">
          Скоро: профиль бизнеса, цели (target CPA / ROAS), биллинг (Stripe).
        </CardContent>
      </Card>
    </div>
  );
}
