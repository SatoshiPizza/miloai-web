import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Megaphone, Globe } from "lucide-react";

export default function AccountsPage() {
  return (
    <div className="p-8 space-y-6 max-w-3xl">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Подключения</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Telegram-bridge и рекламные аккаунты.
        </p>
      </header>

      {/* TG bridge — the killer feature */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <MessageCircle className="size-4" /> Telegram
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Управляй ботом с телефона — голосовые, push-уведомления, быстрые действия.
                Чат синхронизируется с вебом в обе стороны.
              </p>
            </div>
            <Badge variant="outline">не подключено</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Button disabled className="w-full">
            🔗 Подключить Telegram (скоро — pairing-flow)
          </Button>
        </CardContent>
      </Card>

      {/* Meta */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Megaphone className="size-4" /> Meta Ads
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Facebook + Instagram. OAuth даёт доступ ко всем аккаунтам в Business Manager.
              </p>
            </div>
            <Badge variant="outline">не подключено</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Button disabled className="w-full">
            🔗 Подключить через Meta OAuth
          </Button>
        </CardContent>
      </Card>

      {/* Google */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Globe className="size-4" /> Google Ads
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Search-кампании и Performance Max. Требует Manager Account (MCC).
              </p>
            </div>
            <Badge variant="outline">не подключено</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Button disabled className="w-full">
            🔗 Подключить через Google OAuth
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
