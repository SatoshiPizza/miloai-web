# MiloAI — Design iteration 2 (handoff)

> **Что делать**: применить эти изменения к существующему репо `miloai-web`. Все мокапы лежат рядом в `.design/handoff/` — открывай `MiloAI Mockup.html` чтобы смотреть как должно выглядеть.

---

## Что нового в iteration 2

1. **Передизайн Wizard «Новая кампания»** (5 шагов) — был дженерик shadcn, стал на нашу палитру + AI-прогноз бюджета + score circle + audit items в правильном стиле
2. **5 новых экранов в мокапе** (раньше были `ComingSoon`):
   - Accounts &amp; интеграции (с Telegram bridge как hero-карточка)
   - Landings (с iframe-style превью)
   - Competitors (с Meta Ad Library grid + AI-разбор)
   - Settings (с табами, профилем бизнеса, целевыми метриками, биллингом)
3. **Полировка существующих экранов** — список конкретных правок ниже

---

## Приоритет правок

### 🔴 Iteration 2A — high impact

1. **Передизайн Wizard** (`src/app/(dashboard)/campaigns/new/page.tsx`)
   - См. артборды W1–W5 в моём мокапе. Конкретные правки:
     - **Header**: добавить peach-gradient иконку 44×44 с ракетой, заголовок Bricolage Grotesque 28/700
     - **Stepper**: один контейнер-карточка вместо строки. Done-step — `bg-sage` (наш success), active — `bg-peach` с soft ring, pending — `bg-card-soft` + border
     - **Step 1 (Платформы)**: вместо плоских строк — карточки с реальным glyph'ом платформы 42×42 + название + sub-line + highlight-line с акцентом цветом платформы. Selected состояние — мягкая платформенная подсветка фоном (см. `PlatformOption` в `screen-wizard.jsx`)
     - **Step 2 (Услуга)**: вместо `outline` badges M/G — настоящие пилюли с readiness state (✨ = ready, ⊙ = will-gen) и glyph'ом
     - **Step 3 (Бюджет)**: вместо обычного `<Input>` — big peach-tinted блок с €56 шрифтом + presets ниже + **новый AI Forecast tile** (месячный бюджет / прогноз лидов / ожидаемый CPL). Это сильно повысит conviction юзера на этом шаге
     - **Step 4 (Аудит)**: добавить ScoreCircle (SVG, peach progress arc) рядом с вердиктом. Items — белые карточки с left-border-3px по статусу. AI priority fix — peach-gradient блок с двумя action-кнопками
     - **Step 5 (Готово)**: переделать success-rows на платформенные карточки с green-soft фоном, перечислением объектов (`Campaign · Ad Set · 3 ads`), id моноширинно. Добавить notification card "AI буду присматривать"

2. **Dashboard polish** (`src/app/(dashboard)/dashboard/page.tsx`)
   - Greeting: `"Доброе утро, ${businessName}"` вместо просто "Dashboard"
   - **PlatformBadge** компонент вместо emoji `📘 🔍`
   - **Sparkline 7д** в каждой строке кампаний (см. SVG-код ниже)
   - Platform breakdown bar внизу KPI карточек (Spend / Leads): 2 flex-полоски по цветам Meta/Google + проценты
   - Опционально — right column 300px с AI Chat Mini виджетом и Anomalies feed

3. **Campaign detail** (`src/app/(dashboard)/campaigns/[id]/page.tsx`)
   - **Dual-line chart** (Spend & Conversions, 7 days) — SVG, синяя линия Meta + dashed sage линия conversions. См. `DualLineChart` в `screen-campaign.jsx`
   - **AI Recommendations panel** справа: peach-gradient карточка с 3 рекомендациями, каждая с peach-кнопкой «Применить»
   - **Quick Actions grid 2×3** справа (Pause / +20% / -20% / Regenerate / Audit landing / Audience)
   - **Timeline events** внизу — 4 строки с tinted-bubble иконкой + title + body + relative time

4. **Chat split view** (`src/app/(dashboard)/chat/page.tsx`)
   - Раздели на 2 колонки: основной чат (flex 1) + **Telegram preview panel** (320px справа) — как в `ScreenChatSync`
   - Telegram preview — карточка с TG-стилем (#F4EFE5 фон, peach TG header, white message bubbles, voice waveform bubble внизу)
   - На user-сообщениях из TG — синий пилюль `[telegram glyph] из Telegram`
   - Бот-аватарки 30×30 peach-gradient + sparkle
   - Day dividers (`ПН · СЕГОДНЯ`)

### 🟡 Iteration 2B — новые экраны (заменяют ComingSoon)

5. **`src/app/(dashboard)/channels/page.tsx`** — Каналы (Meta vs Google)
   - Allocation strip (split-bar 65/35 с цветами платформ)
   - AI Allocation Card (peach gradient с конкретным «сдвинь €X с Y на Z»)
   - Grid 2×1: Meta panel (креативы по углам, аудитории) | Google panel (keywords с match-types, RSA headlines с performance-метками)

6. **`src/app/(dashboard)/services/page.tsx`** — Услуги
   - Horizontal cards 220px+flex+180px
   - Левая колонка: название (Bricolage 19/700), цена, статус-пилюля (Активна/Готова/Черновик), URL лендинга, 3 stat'а
   - Центральная: 3 mini-creative cards с tinted gradient + angle tag
   - Правая: 4 vertical action buttons

7. **`src/app/(dashboard)/creatives/page.tsx`** — Креативы (галерея 4×)
   - Square cards 1:1 banner preview с tinted gradient + vignette + diagonal stripe
   - Top corners: "VÄLLU CLINIC" pill + platform glyph
   - Body: headline + sub + CTA pill
   - Bottom meta: service + angle chip + CTR/CPC/Active

8. **`src/app/(dashboard)/inbox/page.tsx`** — Lead Inbox (Kanban)
   - 4 columns: Новые / В работе / Won / Lost
   - **New lead card** — самая богатая: avatar, name+phone+age, source platform pill, **AI response block** (peachWash bg, "AI · ОТВЕТ", suggested message), "Написать" button
   - Won — компакт + ✓ + value (success green)
   - Lost — faded + reason pill

9. **`src/app/(dashboard)/landings/page.tsx`** — Лендинги
   - Grid 2×n cards: top — iframe-style preview (gradient + fake header + headline + CTA pill + LIVE pill), bottom — service name + URL + ScoreBadge + 3 stats + action buttons

10. **`src/app/(dashboard)/competitors/page.tsx`** — Конкуренты
    - Search bar (URL/Instagram input + "Разобрать" button)
    - Result split: ads grid 3×n (компактные preview-карточки конкурента) | AI Analysis side panel (peach gradient с 4 rival insights)

11. **`src/app/(dashboard)/accounts/page.tsx`** — обновить
    - **Telegram-карточка** должна стать hero — peach gradient, badge "KILLER", 4 sync-метрики (сообщений / голосовых / команд применено / время отклика)
    - Meta/Google карточки — добавить glyph 22px, connected badge с зелёной точкой, sub-line с детализацией (BM ID, MCC, currency)
    - Team section внизу — список участников с role pills

12. **`src/app/(dashboard)/settings/page.tsx`** — Настройки
    - Tabs строкой: Профиль / Цели / Биллинг / Команда / API ключи / Уведомления
    - **Профиль**: SettingsFields (label слева 120px, value справа) для Название/Сайт/Категория/Гео + textarea для USP
    - **Цели**: 3-col grid с GoalInput карточками (Target CPA / ROAS / Лидов в неделю)
    - **Биллинг**: peach-gradient card с тарифом PRO + Stripe Portal button

---

## Сниппеты — готовые компоненты для копирования

Эти компоненты можно вытащить из мокапа и положить в `src/components/`:

### `src/components/platform-badge.tsx`

```tsx
import { cn } from "@/lib/utils";

export function MetaGlyph({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M3 17.5c0 .8.2 1.5.7 2 .5.5 1.1.8 1.9.8 1 0 1.8-.3 2.5-.9.7-.6 1.5-1.6 2.4-3 .8-1.2 1.5-2.4 2.1-3.6 1.3 2.5 2.4 4.3 3.4 5.3 1 1 2.1 1.5 3.4 1.5 1.2 0 2.2-.4 2.9-1.2.7-.8 1.1-1.9 1.1-3.4V11c0-2.6-.7-4.7-2-6.3-1.3-1.5-3.1-2.3-5.3-2.3-1.4 0-2.7.4-3.9 1.2-1.2.8-2.3 2-3.4 3.6-1-1.6-2-2.8-3-3.6-1-.8-2.1-1.2-3.2-1.2-1.2 0-2.1.4-2.9 1.2C.4 4.4 0 5.5 0 6.9c0 1.4.4 3 1.2 4.7L3 17.5z" fill="var(--meta)"/>
    </svg>
  );
}

export function GoogleGlyph({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M21.6 12.2c0-.7-.1-1.4-.2-2.1H12v3.9h5.4c-.2 1.2-.9 2.3-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3z" fill="var(--google)"/>
      <path d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1V16C4.7 19.6 8.1 22 12 22z" fill="#34A853"/>
      <path d="M6.4 13.9c-.2-.6-.3-1.2-.3-1.9s.1-1.3.3-1.9V7.7H3.1A10 10 0 002 12c0 1.6.4 3.1 1.1 4.3l3.3-2.4z" fill="#FBBC04"/>
      <path d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.8-2.8C16.9 3 14.7 2 12 2 8.1 2 4.7 4.4 3.1 7.7l3.3 2.4C7.2 7.8 9.4 5.9 12 5.9z" fill="#EA4335"/>
    </svg>
  );
}

export function PlatformBadge({ platform, size = "sm" }: { platform: "meta" | "google"; size?: "sm" | "md" }) {
  const sm = size === "sm";
  const isMeta = platform === "meta";
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded-md font-mono font-semibold uppercase",
      sm ? "px-2 py-0.5 text-[10.5px]" : "px-2.5 py-1 text-[12px]",
      isMeta ? "bg-meta-soft text-meta-ink border border-[#CDDDFA]"
             : "bg-google-soft text-google-ink border border-[#D6E4FB]"
    )} style={{ letterSpacing: "0.02em" }}>
      {isMeta ? <MetaGlyph size={sm ? 10 : 12}/> : <GoogleGlyph size={sm ? 10 : 12}/>}
      {isMeta ? "Meta" : "Google"}
    </span>
  );
}
```

### `src/components/sparkline.tsx`

```tsx
export function Sparkline({
  data,
  color = "var(--meta)",
  width = 80,
  height = 28,
}: {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
}) {
  if (!data?.length) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => [
    (i / (data.length - 1)) * width,
    height - ((v - min) / range) * (height - 6) - 3,
  ]);
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ");
  const fillPath = path + ` L${width},${height} L0,${height} Z`;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <path d={fillPath} fill={color} opacity={0.08}/>
      <path d={path} fill="none" stroke={color} strokeWidth={1.5}
            strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
```

### `src/components/score-circle.tsx`

```tsx
export function ScoreCircle({ score, max = 10, size = 72 }: { score: number; max?: number; size?: number }) {
  const pct = score / max;
  const r = size * 0.39;
  const cx = size / 2;
  const cy = size / 2;
  const circ = 2 * Math.PI * r;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--border)" strokeWidth={5}/>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--peach)" strokeWidth={5}
                strokeDasharray={`${circ * pct} ${circ}`} strokeLinecap="round"/>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="font-mono text-[22px] font-semibold leading-none tabular-nums tracking-tight">{score}</div>
        <div className="font-mono text-[9px] text-[var(--ink-subtle)] mt-0.5 tracking-wider">/ {max}</div>
      </div>
    </div>
  );
}
```

### `src/components/ai-card.tsx`

```tsx
import { Sparkles } from "lucide-react";

export function AiCard({
  label,
  body,
  actions,
}: {
  label: string;
  body: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div
      className="rounded-[14px] border p-4 flex items-start gap-3"
      style={{
        background: "linear-gradient(135deg, var(--peach-wash) 0%, #F8E8D9 100%)",
        borderColor: "#F5DDC8",
      }}
    >
      <div className="size-9 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">
        <Sparkles className="size-[18px] text-[var(--peach)]" strokeWidth={1.6}/>
      </div>
      <div className="flex-1">
        <div className="font-mono text-[10.5px] uppercase font-semibold tracking-[0.1em] text-[var(--peach-deep)] mb-2">
          {label}
        </div>
        <div className="text-[14px] leading-relaxed">{body}</div>
        {actions && <div className="flex gap-2 mt-3">{actions}</div>}
      </div>
    </div>
  );
}
```

---

## Что не нужно трогать

- `globals.css` — токены уже на месте, не ломай
- `sidebar.tsx` — корректен, только может добавить «Каналы» если не было (он сейчас уже там есть)
- `tg-bridge.ts` — API-bridge, инженерия
- `coming-soon.tsx` — можно постепенно убирать как заменяешь страницы реальным контентом

---

## Как реализовать

Скажи Claude Code что-то типа:
> Read `.design/handoff/README_iteration_2.md` and `.design/handoff/screen-wizard.jsx`, `.design/handoff/screen-extras.jsx` for reference. Implement iteration 2A (redesign Wizard) first — replace `src/app/(dashboard)/campaigns/new/page.tsx` to match the 5 artboards from screen-wizard.jsx. Use the new shared components (PlatformBadge, ScoreCircle, AiCard) from `src/components/`. Match colors and typography exactly. Don't add new dependencies — use what's already in `package.json` (shadcn, lucide, etc).

После 2A — задавай 2B по одному экрану за раз, чтобы можно было ревьюить каждый.

---

## Открытые вопросы (приоритет ↑)

1. **Финальное название** — MiloAI остаётся как есть? Если меняем — все упоминания в `sidebar.tsx`, `<title>` в `layout.tsx`, копи в `coming-soon.tsx`
2. **Реальные данные для AI Forecast** в Wizard Step 3 — нужен endpoint вроде `/api/web/campaigns/wizard/forecast` который возвращает estimated leads + CPL на основе бенчмарков ниши
3. **Search Terms / Keywords Research** в Channels Google panel — нужен endpoint `/api/web/google/keywords/research`
4. **Meta Ad Library scraping** для Competitors — это серверная часть, не дизайн, но без неё страница пустая
