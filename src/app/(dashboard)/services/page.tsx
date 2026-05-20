import { Card, CardContent } from "@/components/ui/card";

export default function ServicesPage() {
  return (
    <div className="p-8 space-y-6 max-w-7xl">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Услуги</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Сервисы бизнеса с кешированными креативами (Meta + Google) и лендингом.
        </p>
      </header>

      <Card>
        <CardContent className="p-12 text-sm text-muted-foreground text-center">
          Здесь будут карточки твоих услуг с превью баннеров и Google RSA.
        </CardContent>
      </Card>
    </div>
  );
}
