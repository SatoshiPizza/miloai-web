"use client";

/**
 * /onboarding — funnel state machine.
 *
 * Walks the user through 6 canonical onboarding steps. We split the first
 * gate into two sub-screens (1a category + 1b source) because they reflect
 * different decisions in the UI even though the backend treats them as one
 * step ("О бизнесе").
 *
 * For the first MVP we render steps 2 (cabinets), 4 (profile), 5 (Telegram)
 * and 6 (plan) as compact placeholders that let the user move forward — the
 * Telegram pairing flow already lives at `/accounts`, and cabinet OAuth +
 * profile review will follow in the next pass. Step 3 (AI analysis) is the
 * killer moment and is fully wired to `POST /api/web/onboarding/analyze`.
 *
 * Persistence: we PATCH `active_business.onboarding_step` after each step so
 * the user can resume mid-flow from any device. The initial step is derived
 * from `me.businesses[0].onboarding_step` when the page mounts.
 */

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, Plug, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { getSessionToken } from "@/lib/session";
import { tgBridge, type BusinessDetail, type Me } from "@/lib/tg-bridge";
import { OnbFrame } from "@/components/onboarding/onb-frame";
import { Step1Category } from "@/components/onboarding/step-1-category";
import {
  Step1bSource,
  type SourceChoice,
} from "@/components/onboarding/step-1b-source";
import { Step2Cabinets } from "@/components/onboarding/step-2-cabinets";
import { Step3Analysis } from "@/components/onboarding/step-3-analysis";
import { Step4Profile } from "@/components/onboarding/step-4-profile";
import { Step5Telegram } from "@/components/onboarding/step-5-telegram";
import { Step6Plan } from "@/components/onboarding/step-6-plan";

type Phase = "1a" | "1b" | "2" | "3" | "4" | "5" | "6";

export default function OnboardingPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("1a");
  const [category, setCategory] = useState<string | null>(null);
  const [source, setSource] = useState<SourceChoice | null>(null);
  const [business, setBusiness] = useState<BusinessDetail | null>(null);

  // Bootstrap: read /me, pick the active business, restore phase.
  useEffect(() => {
    if (!getSessionToken()) {
      router.replace("/");
      return;
    }
    (async () => {
      try {
        const me: Me = await tgBridge.me();
        const activeId = me.active_business_id;
        if (!activeId) {
          // User has no business yet — keep them on phase 1a.
          return;
        }
        const biz = await tgBridge.activeBusiness();
        setBusiness(biz);
        setCategory(biz.category ?? null);
        // Re-hydrate source choice from biz fields when present. For the
        // 'Сам опишу' branch we stash the user's typed description into
        // biz.description at step 1b so a page refresh / mid-flow return
        // doesn't lose it — otherwise Step 3 would fire 'Не указан
        // источник анализа' because text_description was only in memory.
        if (biz.source_type) {
          setSource({
            type: biz.source_type as SourceChoice["type"],
            site_url: biz.site_url ?? undefined,
            instagram_url: biz.instagram_url ?? undefined,
            text_description:
              biz.source_type === "none"
                ? biz.description ?? undefined
                : undefined,
          });
        }
        // Resume mid-flow.
        if (biz.onboarding_complete) {
          router.replace("/dashboard");
          return;
        }
        // If resuming into step 3 but the source fields are empty (BUG E
        // legacy: user filled Step 1b before the fix that persisted
        // text_description to business.description), Step 3 would land
        // on a dead-end "Нет данных о бизнесе" tupik. Force them back to
        // Step 1b to re-enter the source so analyze has something to eat.
        const targetStep = biz.onboarding_step;
        const hasSource = Boolean(
          biz.site_url || biz.instagram_url ||
          (biz.source_type === "none" && biz.description)
        );
        if (targetStep === 3 && !hasSource) {
          toast.info(
            "Расскажи ещё раз про бизнес — прошлые данные не сохранились."
          );
          setPhase("1b");
          return;
        }
        if (targetStep >= 6) setPhase("6");
        else if (targetStep === 5) setPhase("5");
        else if (targetStep === 4) setPhase("4");
        else if (targetStep === 3) setPhase("3");
        else if (targetStep === 2) setPhase("2");
        else if (biz.category) setPhase("1b");
        // else stay at "1a"
      } catch {
        // Silent — falls back to 1a with no business attached.
      }
    })();
  }, [router]);

  // Helpers to persist + advance.
  const persistStep = useCallback(
    async (
      patches: Partial<BusinessDetail> & { onboarding_step?: number },
    ) => {
      try {
        // Need an active business id. If the user just signed up and has
        // none, create one on the fly.
        let biz = business;
        if (!biz) {
          biz = await tgBridge.createBusiness({
            name: "Мой бизнес",
            category: patches.category ?? category ?? undefined,
          });
        }
        const updated = await tgBridge.patchBusiness(biz.id, patches);
        setBusiness(updated);
      } catch {
        // Network failure → don't block UX, the next step's PATCH will retry.
      }
    },
    [business, category],
  );

  // ── Step 1a → pick category, move to 1b ──
  if (phase === "1a") {
    return (
      <Step1Category
        value={category}
        onPick={setCategory}
        onNext={async () => {
          if (!category) return;
          await persistStep({ category, onboarding_step: 1 });
          setPhase("1b");
        }}
      />
    );
  }

  // ── Step 1b → pick source, move to 2 ──
  if (phase === "1b") {
    return (
      <Step1bSource
        category={category}
        value={source}
        onChange={setSource}
        onBack={() => setPhase("1a")}
        onNext={async () => {
          await persistStep({
            source_type: source?.type ?? null,
            site_url: source?.site_url ?? null,
            instagram_url: source?.instagram_url ?? null,
            // Persist the free-text intake into business.description so
            // Step 3 can resume after a refresh. Step 3 overwrites this
            // with the AI-extracted description on success, so this is
            // only the interim staging value.
            description:
              source?.type === "none"
                ? source?.text_description ?? null
                : undefined,
            onboarding_step: 2,
          });
          setPhase("2");
        }}
      />
    );
  }

  // ── Step 2: cabinets — inline OAuth with polling ──
  if (phase === "2") {
    return (
      <Step2Cabinets
        onBack={() => setPhase("1b")}
        onNext={async () => {
          await persistStep({ onboarding_step: 3 });
          setPhase("3");
        }}
      />
    );
  }

  // ── Step 3: live AI analysis ──
  if (phase === "3") {
    // Guard: if we somehow landed here without source data (edge cases like
    // partial state after refresh or hot-reload), bounce back to 1b instead
    // of stranding the user on a red-error screen. Resume path in the
    // bootstrap effect above catches the pre-fix legacy case; this covers
    // the runtime case.
    const hasSource = Boolean(
      source?.site_url || source?.instagram_url || source?.text_description
    );
    if (!hasSource) {
      queueMicrotask(() => {
        toast.info("Сначала укажи источник — сайт, IG или опиши бизнес.");
        setPhase("1b");
      });
      return null;
    }
    return (
      <Step3Analysis
        siteUrl={source?.site_url}
        textDescription={source?.text_description}
        onBack={() => setPhase("2")}
        onDone={async () => {
          // Step 3 wrote fresh fields directly into the DB via the analyzer;
          // re-fetch the active business so Step 4 sees the AI-extracted
          // USP/audience/contacts instead of the stale React state.
          try {
            const fresh = await tgBridge.activeBusiness();
            setBusiness(fresh);
            setCategory(fresh.category ?? null);
          } catch {
            // best-effort; the manual persistStep below still advances
          }
          await persistStep({ onboarding_step: 4 });
          setPhase("4");
        }}
      />
    );
  }

  // ── Step 4: profile confirmation ──
  if (phase === "4") {
    if (!business) {
      // Edge case — analyze finished but business wasn't re-fetched. Show a
      // bridge that retries; once business is in state, this branch
      // re-renders into the full editor.
      return (
        <PlaceholderStep
          stepIdx={3}
          eyebrow="Профиль"
          title="Подгружаю профиль…"
          primaryLabel="Назад к анализу"
          onPrimary={() => setPhase("3")}
        />
      );
    }
    return (
      <Step4Profile
        business={business}
        onBack={() => setPhase("3")}
        onBusinessUpdate={setBusiness}
        onNext={async () => {
          await persistStep({ onboarding_step: 5 });
          setPhase("5");
        }}
      />
    );
  }

  // ── Step 5: Telegram pairing — inline deep-link + poll ──
  if (phase === "5") {
    return (
      <Step5Telegram
        initialPaired={false /* /me re-poll inside the component will flip it */}
        onBack={() => setPhase("4")}
        onNext={async () => {
          await persistStep({ onboarding_step: 6 });
          setPhase("6");
        }}
      />
    );
  }

  // ── Step 6: starting plan ──
  if (!business) {
    return (
      <PlaceholderStep
        stepIdx={5}
        eyebrow="Готово"
        title="Подгружаю план…"
        primaryLabel="Назад"
        onPrimary={() => setPhase("5")}
      />
    );
  }
  return (
    <Step6Plan
      business={business}
      onBack={() => setPhase("5")}
      onAccept={async () => {
        await persistStep({ onboarding_complete: true, onboarding_step: 6 });
        router.replace("/dashboard");
      }}
    />
  );
}

// ── Placeholder UI used for steps still under construction ────────────────

function PlaceholderStep({
  stepIdx,
  eyebrow,
  title,
  body,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
  bullets,
}: {
  stepIdx: number;
  eyebrow: string;
  title: string;
  body?: string;
  primaryLabel: string;
  onPrimary: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  bullets?: { icon: typeof Plug; label: string; sub?: string }[];
}) {
  return (
    <OnbFrame stepIdx={stepIdx}>
      <div className="w-full max-w-[640px] text-center">
        <div
          className="mb-5 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.06em]"
          style={{
            background: "var(--peach-wash)",
            border: "1px solid var(--peach-soft)",
            color: "var(--peach-deep)",
          }}
        >
          <Sparkles className="size-3.5" />
          {eyebrow}
        </div>
        <h1 className="font-heading text-[32px] sm:text-[36px] font-bold leading-[1.1] tracking-[-0.03em]">
          {title}
        </h1>
        {body && (
          <p className="mt-3.5 text-[15.5px] leading-relaxed text-[var(--ink-mute)]">
            {body}
          </p>
        )}

        {bullets && bullets.length > 0 && (
          <div className="mx-auto mt-7 flex max-w-[460px] flex-col gap-2.5">
            {bullets.map((b, i) => {
              const Icon = b.icon;
              return (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-[12px] bg-white px-4 py-3 text-left"
                  style={{ border: "1px solid var(--border)" }}
                >
                  <div
                    className="flex size-9 items-center justify-center rounded-[10px]"
                    style={{ background: "var(--card-soft)" }}
                  >
                    <Icon
                      className="size-[16px]"
                      style={{ color: "var(--peach-deep)" }}
                      strokeWidth={1.7}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="text-[13.5px] font-medium text-[var(--ink)]">
                      {b.label}
                    </div>
                    {b.sub && (
                      <div className="text-[11.5px] text-[var(--ink-subtle)]">
                        {b.sub}
                      </div>
                    )}
                  </div>
                  <CheckCircle2
                    className="size-4 shrink-0"
                    style={{ color: "var(--ink-subtle)" }}
                  />
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-8 flex items-center justify-center gap-3">
          {secondaryLabel && onSecondary && (
            <button
              onClick={onSecondary}
              className="inline-flex items-center gap-2 rounded-[10px] px-4 py-2.5 text-[13.5px] text-[var(--ink-mute)] hover:text-[var(--ink)] transition-colors"
            >
              <ArrowLeft className="size-[14px]" strokeWidth={2} />
              {secondaryLabel}
            </button>
          )}
          <button
            onClick={onPrimary}
            className="inline-flex items-center gap-2.5 rounded-[11px] px-8 py-3 text-[14.5px] font-medium text-white transition-opacity hover:opacity-90"
            style={{
              background: "var(--peach)",
              boxShadow: "0 6px 18px -6px rgba(232,149,108,0.55)",
            }}
          >
            {primaryLabel}
            <ArrowRight className="size-[14px]" strokeWidth={2} />
          </button>
        </div>
      </div>
    </OnbFrame>
  );
}
