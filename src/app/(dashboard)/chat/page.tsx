import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle } from "lucide-react";

export default function ChatPage() {
  return (
    <div className="p-8 space-y-6 max-w-4xl">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            Чат с AI
            <Badge variant="outline" className="text-[10px] font-normal">
              синхронизирован с Telegram
            </Badge>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Всё что ты пишешь боту в Telegram появляется здесь. Отправь сообщение из
            браузера — оно прилетит и в Telegram, и AI ответит в обоих местах.
          </p>
        </div>
      </header>

      <Card className="min-h-[60vh]">
        <CardContent className="p-12 flex flex-col items-center justify-center text-center text-sm text-muted-foreground">
          <MessageCircle className="size-10 mb-3 text-muted-foreground/40" />
          <p className="font-medium text-foreground">Подключи Telegram чтобы начать.</p>
          <p className="mt-1 max-w-md">
            После pairing'а вся история сообщений с ботом и AI будет жить здесь.
            Голос с телефона → текст в браузере в реальном времени.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
