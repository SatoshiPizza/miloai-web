"use client";

/**
 * /services/[id]/intake — the deep per-product profile screen.
 *
 * Four blocks (economics, buyers, proof, entry point), each answered by
 * talking or typing one paragraph; the backend AI sorts the answer into
 * structured fields, which we show back as editable chips. A live score +
 * max-CPL panel updates after every answer, so the user sees the payoff of
 * filling more in (and the honest budget ceiling their economics imply).
 *
 * This is where "junior-marketer" output gets fixed: the profile built here
 * is the primary source the creative generator reads.
 */

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Sparkles, TrendingUp } from "lucide-react";
import { toast } from "sonner";

import { tgBridge, type IntakeBlock, type OfferProfile, type OfferProfileResponse } from "@/lib/tg-bridge";
import { VoiceAnswer } from "@/components/intake/voice-answer";
import { EditableChips, type ChipField } from "@/components/intake/editable-chips";
import { Skeleton } from "@/components/ui/skeleton";

type BlockDef = {
  key: IntakeBlock;
  title: string;
  prompt: string;
  placeholder: string;
};

// Prompts are memory-questions, never "describe your audience". They mirror
// the field docstrings in app/ai/schemas/offer_profile.py.
const BLOCKS: BlockDef[] = [
  {
    key: "economics",
    title: "Деньги",
    prompt: "Сколько это стоит и сколько ты зарабатываешь?",
    placeholder:
      "Например: услуга стоит от 800€, средний чек ~1200€, после расходов остаётся примерно 400€. Из 10 обращений покупает 1-2. В месяц могу взять 6-8 объектов.",
  },
  {
    key: "buyers",
    title: "Кто покупает",
    prompt: "Вспомни последних трёх клиентов — кто это был и с чем пришли?",
    placeholder:
      "Например: две семьи делали ремонт перед переездом, один сдавал квартиру в аренду. Боялись, что затянем сроки и выйдем за смету. Спрашивали про гарантию и можно ли переделать, если не понравится.",
  },
  {
    key: "proof",
    title: "Доказательства",
    prompt: "Чем докажешь, что работаешь хорошо? Кейсы, цифры, отзывы?",
    placeholder:
      "Например: 7 лет на рынке, больше 200 объектов в Таллине, есть фото до/после, отзывы на Google. Первый результат виден через неделю.",
  },
  {
    key: "entry_point",
    title: "Первый шаг",
    prompt: "Что клиент получит на первом шаге, не покупая сразу всё?",
    placeholder:
      "Например: бесплатный замер и смета на месте за 30 минут. Приезжаю, замеряю, называю точную цену и сроки. Гарантия на работы 2 года.",
  },
];

export default function OfferIntakePage() {
  const params = useParams();
  const router = useRouter();
  const serviceId = Number(params?.id);

  const [state, setState] = useState<OfferProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeBlock, setActiveBlock] = useState<IntakeBlock>("economics");
  const [busy, setBusy] = useState(false);
  // Raw answer text per block — kept at page level so each block remembers its
  // own input across tab switches (and after submit), instead of a single
  // shared textarea that bled one block's answer into the next.
  const [texts, setTexts] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!Number.isFinite(serviceId)) return;
    tgBridge
      .getOfferProfile(serviceId)
      .then(setState)
      .catch(() => toast.error("Не удалось загрузить профиль"))
      .finally(() => setLoading(false));
  }, [serviceId]);

  const submitAnswer = useCallback(
    async (text: string) => {
      setBusy(true);
      try {
        const next = await tgBridge.intakeExtract(serviceId, activeBlock, text);
        setState(next);
        // Advance strictly to the NEXT block in order — predictable, matches
        // how the user reads the tabs left-to-right. (Earlier "jump to first
        // empty block" felt like a random skip when an earlier block already
        // had data.) Stay put on the last block.
        const order: IntakeBlock[] = ["economics", "buyers", "proof", "entry_point"];
        const idx = order.indexOf(activeBlock);
        if (idx >= 0 && idx < order.length - 1) setActiveBlock(order[idx + 1]);
        toast.success("Записал. Профиль обновлён.");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "не удалось разобрать");
      } finally {
        setBusy(false);
      }
    },
    [serviceId, activeBlock],
  );

  if (loading) {
    return (
      <div className="p-7 max-w-[1000px]">
        <Skeleton className="h-8 w-64 mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const def = BLOCKS.find((b) => b.key === activeBlock)!;
  const chips = state ? chipsForBlock(activeBlock, state) : [];

  return (
    <div className="p-7 max-w-[1000px]">
      <button
        onClick={() => router.push("/services")}
        className="inline-flex items-center gap-1.5 text-[13px] text-[var(--ink-mute)] hover:text-[var(--ink)] transition-colors mb-4"
      >
        <ArrowLeft className="size-3.5" /> Услуги
      </button>

      <header className="mb-6">
        <h1 className="font-heading text-[28px] font-bold leading-none tracking-[-0.025em]">
          Расскажи про этот продукт
        </h1>
        <p className="text-[13.5px] text-[var(--ink-mute)] mt-2 leading-relaxed max-w-[620px]">
          Чем точнее ответишь — тем сильнее креативы и честнее бюджет. Отвечай
          своими словами, можно голосом. AI сам разложит по полям, а ты
          поправишь.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        {/* Left: block tabs + answer + parsed review */}
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap gap-2">
            {BLOCKS.map((b) => {
              const active = b.key === activeBlock;
              // "Done" = this block has any answer, computed from its own data
              // — not from weakest_blocks (a cross-block ranking).
              const done = state ? blockHasData(b.key, state.offer_profile) : false;
              return (
                <button
                  key={b.key}
                  onClick={() => setActiveBlock(b.key)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[10px] text-[13px] font-medium transition-colors"
                  style={{
                    background: active ? "var(--peach)" : "var(--card)",
                    color: active ? "white" : "var(--ink-mute)",
                    border: `1px solid ${active ? "var(--peach)" : "var(--border)"}`,
                  }}
                >
                  {done && !active && <Check className="size-3.5" style={{ color: "var(--sage)" }} />}
                  {b.title}
                </button>
              );
            })}
          </div>

          <div
            className="rounded-[16px] p-5"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}
          >
            <div className="mb-3 flex items-start gap-2">
              <Sparkles className="size-4 mt-0.5 shrink-0" style={{ color: "var(--peach-deep)" }} />
              <div className="text-[15px] font-semibold leading-snug text-[var(--ink)]">
                {def.prompt}
              </div>
            </div>
            <VoiceAnswer
              placeholder={def.placeholder}
              busy={busy}
              value={texts[activeBlock] ?? ""}
              onChange={(t) => setTexts((p) => ({ ...p, [activeBlock]: t }))}
              onSubmit={submitAnswer}
            />
          </div>

          {chips.length > 0 && (
            <div
              className="rounded-[16px] p-5"
              style={{ background: "var(--card)", border: "1px solid var(--border)" }}
            >
              <div className="mb-3 font-mono text-[10.5px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-subtle)]">
                Что AI понял
              </div>
              <EditableChips fields={chips} />
            </div>
          )}
        </div>

        {/* Right: live score + economics */}
        <aside className="flex flex-col gap-4">
          <ScorePanel state={state} />
          <EconomicsPanel state={state} />

          <button
            onClick={() => router.push(`/campaigns/new?service=${serviceId}`)}
            className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-[11px] text-[14px] font-medium text-white transition-opacity hover:opacity-90"
            style={{ background: "var(--peach)", boxShadow: "0 6px 18px -6px rgba(232,149,108,0.55)" }}
          >
            К запуску кампании
            <ArrowRight className="size-4" />
          </button>
          <p className="text-[11.5px] text-[var(--ink-subtle)] text-center leading-relaxed">
            Можно запускать в любой момент — чем полнее профиль, тем лучше
            результат.
          </p>
        </aside>
      </div>
    </div>
  );
}


function ScorePanel({ state }: { state: OfferProfileResponse | null }) {
  const score = state?.profile_score ?? 0;
  const color =
    score >= 70 ? "var(--sage)" : score >= 40 ? "var(--peach)" : "var(--destructive)";
  return (
    <div
      className="rounded-[16px] p-5"
      style={{ background: "var(--card)", border: "1px solid var(--border)" }}
    >
      <div className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-subtle)]">
        Профиль заполнен
      </div>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="font-mono text-[34px] font-medium tabular-nums leading-none" style={{ color }}>
          {score}
        </span>
        <span className="text-[15px] text-[var(--ink-subtle)]">/ 100</span>
      </div>
      <div className="mt-3 h-2 rounded-full overflow-hidden" style={{ background: "var(--card-soft)" }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${score}%`, background: color }} />
      </div>
    </div>
  );
}


function EconomicsPanel({ state }: { state: OfferProfileResponse | null }) {
  const maxCpl = state?.max_cpl_eur ?? null;
  const breakeven = state?.breakeven_cpl_eur ?? null;
  const budget = state?.suggested_daily_budget_eur ?? null;
  const conf = state?.max_cpl_confidence ?? "low";

  return (
    <div
      className="rounded-[16px] p-5"
      style={{ background: "var(--card)", border: "1px solid var(--border)" }}
    >
      <div className="flex items-center gap-1.5 mb-3">
        <TrendingUp className="size-3.5" style={{ color: "var(--peach-deep)" }} />
        <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-subtle)]">
          Экономика лида
        </span>
      </div>
      {maxCpl == null ? (
        <p className="text-[12.5px] text-[var(--ink-mute)] leading-relaxed">
          Ответь в блоке «Деньги» — посчитаю максимальную цену заявки, при
          которой реклама окупается.
        </p>
      ) : (
        <div className="flex flex-col gap-2.5">
          <Row label="Рекомендуем до" value={`€${maxCpl.toFixed(0)}`} strong />
          {breakeven != null && (
            <Row label="Безубыточность" value={`€${breakeven.toFixed(0)}`} />
          )}
          {budget != null && (
            <Row label="Бюджет в день" value={`€${budget.toFixed(0)}`} />
          )}
          {conf === "low" && (
            <p className="text-[11px] text-[var(--ink-subtle)] leading-snug mt-1">
              Оценка грубая — уточни маржу и конверсию для точной цифры.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[12.5px] text-[var(--ink-mute)]">{label}</span>
      <span
        className="font-mono tabular-nums"
        style={{
          fontSize: strong ? "18px" : "14px",
          fontWeight: strong ? 600 : 400,
          color: strong ? "var(--peach-deep)" : "var(--ink)",
        }}
      >
        {value}
      </span>
    </div>
  );
}


// True if the user has given any answer for this block — drives the tab
// checkmark and auto-advance. Reads the block's own fields, so a filled block
// always registers as done regardless of how complete the others are.
function blockHasData(block: IntakeBlock, profile: OfferProfile | undefined): boolean {
  const b = (profile?.[block] ?? {}) as Record<string, unknown>;
  return Object.values(b).some((v) => {
    if (Array.isArray(v)) return v.length > 0;
    return v !== null && v !== undefined && v !== "";
  });
}

// Map the raw offer_profile block into display chips.
function chipsForBlock(block: IntakeBlock, state: OfferProfileResponse): ChipField[] {
  const p = state.offer_profile;
  if (block === "economics") {
    const e = p.economics ?? {};
    const scalars: ChipField[] = [];
    if (e.what_it_is) scalars.push({ label: "Что получает клиент", values: [e.what_it_is], scalar: true });
    const nums: string[] = [];
    if (e.avg_check_eur != null) nums.push(`средний чек €${e.avg_check_eur}`);
    if (e.margin_per_sale_eur != null) nums.push(`маржа €${e.margin_per_sale_eur}`);
    if (e.close_rate != null) nums.push(`конверсия ${Math.round(e.close_rate * 100)}%`);
    if (e.monthly_capacity != null) nums.push(`до ${e.monthly_capacity}/мес`);
    if (e.repeat_revenue_eur != null) nums.push(`повторно €${e.repeat_revenue_eur}`);
    if (nums.length) scalars.push({ label: "Цифры", values: nums });
    return scalars;
  }
  if (block === "buyers") {
    const b = p.buyers ?? {};
    return [
      { label: "Кто покупает", values: b.who_buys ?? [] },
      { label: "Когда ищут", values: b.trigger_situations ?? [] },
      { label: "Проблемы (их слова)", values: b.top_problems ?? [] },
      { label: "Страхи перед покупкой", values: b.pre_purchase_fears ?? [] },
      { label: "Частые вопросы", values: b.common_questions ?? [] },
      { label: "Что пробовали до тебя", values: b.what_they_tried ?? [] },
      { label: "За что хвалят", values: b.why_choose_us ?? [] },
    ];
  }
  if (block === "proof") {
    const pr = p.proof ?? {};
    const out: ChipField[] = [];
    if (pr.concrete_result) out.push({ label: "Результат", values: [pr.concrete_result], scalar: true });
    if (pr.time_to_first_result) out.push({ label: "Первый результат через", values: [pr.time_to_first_result], scalar: true });
    out.push({ label: "Цифры", values: pr.numbers ?? [] });
    out.push({ label: "Кейсы", values: pr.cases ?? [] });
    out.push({ label: "Есть доказательства", values: (pr.available_proof ?? []).map(proofLabel) });
    return out;
  }
  // entry_point
  const ep = p.entry_point ?? {};
  const out: ChipField[] = [];
  if (ep.generated_offer) out.push({ label: "Готовый оффер", values: [ep.generated_offer], scalar: true });
  else if (ep.what_they_get) out.push({ label: "Что получит", values: [ep.what_they_get], scalar: true });
  const facts: string[] = [];
  if (ep.price_eur != null) facts.push(ep.price_eur === 0 ? "бесплатно" : `€${ep.price_eur}`);
  if (ep.duration) facts.push(ep.duration);
  if (ep.guarantee) facts.push(`гарантия: ${ep.guarantee}`);
  if (facts.length) out.push({ label: "Детали", values: facts });
  return out;
}

const PROOF_LABELS: Record<string, string> = {
  testimonials: "отзывы",
  before_after: "фото до/после",
  client_video: "видео клиентов",
  cases: "кейсы",
  certificates: "сертификаты",
  licenses: "лицензии",
  guarantee: "гарантия",
  known_clients: "известные клиенты",
  team_photo: "фото команды",
};
function proofLabel(k: string): string {
  return PROOF_LABELS[k] ?? k;
}
