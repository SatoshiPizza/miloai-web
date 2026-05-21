import { Card, CardContent } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

/**
 * Friendly empty-state for routes that the sidebar links to but haven't been
 * built yet. Matches the "never plain 'No data'" rule from design handoff §
 * Empty states.
 */
export function ComingSoon({
  title,
  description,
  upcoming,
}: {
  title: string;
  description: string;
  upcoming?: string[];
}) {
  return (
    <div className="p-8 max-w-3xl space-y-6">
      <header>
        <h1 className="text-[28px] font-heading font-bold tracking-tight">{title}</h1>
        <p className="text-[14px] text-[var(--ink-mute)] mt-1">{description}</p>
      </header>

      <Card className="border-[var(--peach-soft)] bg-[var(--peach-wash)]/40">
        <CardContent className="p-8 flex flex-col items-center text-center gap-3">
          <Sparkles className="size-7 text-[var(--peach)]" strokeWidth={1.6} />
          <div className="font-medium">Раздел в разработке</div>
          <div className="text-sm text-[var(--ink-mute)] max-w-md">
            Скоро будет здесь. Сейчас всю работу можно делать через{" "}
            <a href="/dashboard" className="underline">Dashboard</a>,{" "}
            <a href="/campaigns" className="underline">Кампании</a>,{" "}
            <a href="/chat" className="underline">Чат с AI</a>.
          </div>
          {upcoming && upcoming.length > 0 && (
            <ul className="mt-3 text-sm text-left space-y-1.5">
              {upcoming.map((u, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-[var(--peach-deep)]">→</span>
                  <span className="text-[var(--ink-mute)]">{u}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
