"use client";

/**
 * AdAccountPicker — slide-in sheet for picking which of the user's
 * connected ad accounts should be pinned to their active Business.
 *
 * Why this exists:
 *   Meta grants a token scoped to ANY ad account the OAuth-ing user
 *   is a business-manager admin of — often dozens. Without a picker
 *   we end up with `+45 accounts` cluttering /accounts and the
 *   onboarding analyzer scanning all of them (with all showing €0
 *   because most are dormant). One click here binds ONE account to
 *   the Business and deactivates the rest on the backend.
 */

import { useCallback, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { tgBridge, type AdAccountSummary } from "@/lib/tg-bridge";

export function AdAccountPicker({
  open,
  platform,
  accounts,
  onClose,
  onSaved,
}: {
  open: boolean;
  platform: "meta" | "google";
  accounts: AdAccountSummary[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const platformAccounts = accounts.filter((a) => a.platform === platform);
  const currentlySelected = platformAccounts.find((a) => a.is_selected)?.id ?? null;
  const [pickedId, setPickedId] = useState<number | null>(currentlySelected);
  const [saving, setSaving] = useState(false);

  const handleSave = useCallback(async () => {
    if (!pickedId) return;
    setSaving(true);
    try {
      await tgBridge.selectAdAccount(platform, pickedId);
      toast.success(
        `${platform === "meta" ? "Meta" : "Google"} кабинет привязан. Остальные скрыты.`
      );
      onSaved();
      onClose();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "не удалось сохранить";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }, [platform, pickedId, onClose, onSaved]);

  if (!open) return null;

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <SheetContent side="right" className="w-full sm:max-w-[480px]">
        <SheetHeader>
          <SheetTitle className="font-heading text-[22px] tracking-[-0.018em]">
            Выбери {platform === "meta" ? "Meta" : "Google"} кабинет
          </SheetTitle>
          <SheetDescription className="text-[13px] leading-relaxed">
            У тебя доступ к {platformAccounts.length}{" "}
            {platformAccounts.length === 1
              ? "кабинету"
              : platformAccounts.length < 5
                ? "кабинетам"
                : "кабинетам"}
            . Выбери один для этого бизнеса — остальные скроются из списка
            (можно вернуть, переподключив OAuth).
          </SheetDescription>
        </SheetHeader>

        <div className="mt-5 flex flex-col gap-2 max-h-[60vh] overflow-y-auto pr-1">
          {platformAccounts.length === 0 && (
            <div className="text-[13px] text-[var(--ink-mute)] py-8 text-center">
              Нет доступных кабинетов. Сначала подключи{" "}
              {platform === "meta" ? "Meta" : "Google"} OAuth.
            </div>
          )}
          {platformAccounts.map((a) => {
            const active = pickedId === a.id;
            return (
              <button
                key={a.id}
                type="button"
                onClick={() => setPickedId(a.id)}
                className="text-left flex items-center gap-3 rounded-[10px] px-3.5 py-3 transition-colors"
                style={{
                  background: active ? "var(--peach-wash)" : "var(--card)",
                  border: `1.5px solid ${active ? "var(--peach)" : "var(--border)"}`,
                }}
              >
                <div
                  className="size-4 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    background: active ? "var(--peach)" : "transparent",
                    border: `1.5px solid ${active ? "var(--peach)" : "var(--ink-subtle)"}`,
                  }}
                >
                  {active && <Check className="size-2.5 text-white" strokeWidth={3} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13.5px] font-medium text-[var(--ink)] truncate">
                    {a.account_name || `Account ${a.platform_account_id}`}
                  </div>
                  <div className="font-mono text-[11px] text-[var(--ink-subtle)] tabular-nums">
                    {a.platform_account_id} · {a.currency}
                  </div>
                </div>
                {a.is_selected && (
                  <span
                    className="shrink-0 px-2 py-0.5 rounded-full font-mono text-[9.5px] font-semibold uppercase tracking-[0.05em]"
                    style={{
                      background: "var(--sage-soft)",
                      color: "var(--sage)",
                    }}
                  >
                    Текущий
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-6 flex items-center justify-end gap-2.5">
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Отмена
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || !pickedId || pickedId === currentlySelected}
            className="gap-1.5"
          >
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
            Привязать
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
