# MiloAI — Design Handoff

> AI-powered media buyer SaaS для small business. Один помощник заменяет агентство (€500-1500/мес) за €50-100/мес. Killer-фича: всем продуктом можно управлять через привязанный Telegram-бот в реальном времени.

---

## About the design files in this bundle

The HTML files in this folder are **design references created in HTML** — prototypes that show intended visual style, layout, copy, and behaviour. They are **not production code** to copy directly.

The task is to **recreate these designs in the target codebase's existing environment** (likely Next.js + FastAPI per the brief), using established patterns, component library, and styling system. If no environment exists yet, pick a stack that matches the brief's "Browser (Next.js) → REST + SSE → FastAPI + Postgres → OpenAI / Meta Ads / Google Ads".

If you have a UI library (shadcn/ui, Radix, etc.), prefer its components over hand-rolling — match the **visual treatment** described in this doc, not the JSX literal-for-literal.

---

## Fidelity

**High-fidelity.** Colors, typography, spacing, and layout are intentional and final-direction. Recreate them pixel-perfectly. Iconography is lucide-style — use the actual `lucide-react` package, the SVG paths inlined in the mockups are placeholders to communicate intent.

---

## Product overview

**Target users:** stomatologists, lawyers, master-class teachers, repair shops, ecommerce SMBs in Estonia / EU + freelance media buyers managing 5-30 client accounts.
**Languages:** RU / ET / EN.
**Core value:** turn voice → action across web + Telegram, in real time.

### Architecture (per brief)

```
Browser (Next.js)            Phone (Telegram)
     │                            │
     │ REST + SSE                 │ MTProto (voice/text)
     ▼                            ▼
   ┌──────────────────────────────────┐
   │  Backend (FastAPI + Postgres)    │
   │  AI: OpenAI GPT-4o + Whisper     │
   │  Meta API + Google Ads API       │
   └──────────────────────────────────┘
```

### Sections (sidebar nav)

In order:

1. **Dashboard** — KPI cards, AI insights of the day, active campaigns, anomalies feed (last 24h)
2. **Каналы (Channels)** — **NEW** — Meta vs Google side-by-side comparison, AI budget allocation
3. **Кампании (Campaigns)** — unified list across platforms with filter chips, drill-in details
4. **Услуги (Services)** — catalog of business services, each with creatives + landing + actions
5. **Чат с AI (AI Chat)** — bidirectional, synced with Telegram
6. **Креативы (Creatives)** — gallery of AI-generated banners
7. **Лендинги (Landing pages)** — list + visual editor + code editor
8. **Lead Inbox** — Kanban: new → contacted → won / lost
9. **Аналитика (Analytics)** — deeper graphs, cohort tables
10. **Конкуренты (Competitors)** — Meta Ad Library mining
11. Bottom: **Аккаунты (Accounts)**, **Настройки (Settings)**

---

## Design system

### Colors

```ts
// Stage / surfaces
const stage      = '#EBE7DE';   // warm cream stage background
const stageDeep  = '#DAD3C5';
const surface    = '#FAFAF9';   // main dashboard bg
const card       = '#FFFFFF';
const cardSoft   = '#F7F4EE';   // sidebar items, code blocks
const border     = '#E8E2D6';
const borderSoft = '#EFEAE0';
const divider    = 'rgba(31,29,26,0.06)';

// Ink (text)
const ink        = '#1F1D1A';   // primary
const inkMute    = '#6F6962';   // secondary
const inkSubtle  = '#A39E94';   // tertiary, labels

// Brand accent — peach
const peach      = '#E8956C';
const peachDeep  = '#C26F46';
const peachSoft  = '#FBE4D6';
const peachWash  = '#FCF1E8';
const peachInk   = '#7A3A18';

// Status
const success    = '#85A275';   // muted sage
const successSoft= '#DCE6D3';
const danger     = '#C46A4A';
const dangerSoft = '#F7DDD0';
const warn       = '#D9A04E';
```

**Platform colors** (used as informational markers, not backgrounds):

```ts
const Meta = {
  primary:   '#0866FF',
  soft:      '#E5EEFE',
  border:    '#CDDDFA',
  ink:       '#0344AA',  // text on light soft bg
};

const Google = {
  primary:   '#4285F4',
  soft:      '#E8F0FE',
  border:    '#D6E4FB',
  ink:       '#1A56C7',
  // For Google's multi-color glyph:
  red:       '#EA4335',
  yellow:    '#FBBC04',
  green:     '#34A853',
};
```

### Typography

```ts
// Headings (h1, h2, page titles)
fontFamily: 'Bricolage Grotesque, Geist, sans-serif'
fontWeight: 700
letterSpacing: '-0.025em' for large, '-0.018em' for medium
lineHeight: 1.0-1.1

// Body / UI text
fontFamily: 'Geist, ui-sans-serif, system-ui, sans-serif'
fontWeight: 400 / 500 / 600
letterSpacing: '-0.01em' for headings, '-0.005em' for body

// Numbers, metrics, monospace
fontFamily: 'Geist Mono, ui-monospace, monospace'
fontVariantNumeric: 'tabular-nums'  // always for metrics
letterSpacing: '-0.01em' to '-0.02em' for big numbers
```

Sizes (web app, 1440×900 viewport):

| Use | Size | Weight |
|---|---|---|
| Page title (h1) | 28-32 | 700 |
| Section title | 18-22 | 700 |
| Body | 13.5-14 | 400 |
| Metric values | 22-32 | 500 (Geist Mono) |
| KPI value | 26-30 | 500 (Geist Mono) |
| Label (UPPERCASE) | 10-11 | 600 (Geist Mono), `letter-spacing: 0.08-0.1em` |
| Button text | 12.5-14 | 500 |
| Small monospace | 10-11.5 | 400-500 |

### Spacing

Use a 4-px base scale: `4, 8, 10, 12, 14, 16, 18, 20, 22, 26, 28`. Cards use `12-18px` padding, page padding is `22-28px`.

### Border radius

```
6  — small chips, pills
7-8 — buttons, input fields
9-10 — sub-cards, action buttons
12-14 — main cards
22 — phone screen, large containers
100 — fully-rounded pills
```

### Shadows

```css
/* Soft card lift */
box-shadow: 0 4px 18px -8px rgba(232, 149, 108, 0.66), 0 1px 3px rgba(31,29,26,0.04);

/* Hover / floating panel */
box-shadow: 0 14px 32px -14px rgba(31, 29, 26, 0.16);

/* Heavy (modals, focused devices) */
box-shadow: 0 40px 90px -20px rgba(31, 29, 26, 0.22),
            0 14px 28px -10px rgba(31, 29, 26, 0.10);
```

### Icons

`lucide-react` thin-line style, `strokeWidth: 1.6` default, sizes 13/14/15/16/17/18 px.

---

## Components by screen

> **Convention:** I describe layout in flex/grid terms. Use Tailwind, CSS Modules, or whatever the host codebase uses.

### 0. Shared chrome

**Sidebar (240px fixed, collapses to 60px on tablet, drawer on mobile)**
- Background: `#F8F5EE`
- Right border: `1px solid divider`
- Padding: `22px 14px`
- Logo row: sparkle SVG + "MiloAI" (Bricolage 18/700) + subtitle "AI media buyer" (Geist 11)
- Nav items: 14px Geist, icon 17px, padding `8px 12px`, radius 9
- Active state: `background: cardSoft`, text `ink`, weight 500
- Hover: `background: cardSoft @ 0.5 opacity`
- Right-side count chips: Geist Mono 10.5, `card` bg, border, padding `1px 6px`, radius 6
- Notification dot: 6×6 peach circle

**Top bar (56px)**
- Search input: maxWidth 360, padding `8px 14px`, `cardSoft` bg, border, radius 9
  - lucide `search` 14px + placeholder "Поиск, действия, AI…" + ⌘K kbd chip
- Right: bell with red badge counter, avatar gradient (peach → peachDeep), name + sublabel

**Browser frame chrome (only for mockup; not real)**
- Top bar 44px: 3 traffic lights, URL pill centered max 460px
- Real app: no chrome, full-bleed

### 1. Dashboard

**Layout:** Sidebar | (TopBar / Content). Content is `flex: row, gap: 22px`, padding `24px 28px`.

**Main column (flex 1):**
1. Header row: greeting (h1 28/700) + subtitle (13.5 inkMute) + 2 action buttons right-aligned
2. KPI Row: `grid-cols-4 gap-14`
3. AI Insights Row (peach gradient card)
4. Campaigns Table (full-width card)

**Right column (width 300):**
1. AI Chat Mini widget
2. Anomalies Feed (3 anomalies, 24h)

#### KPI Card

```
┌─────────────────────────────┐
│ [icon] Label             ↓  │
│                             │
│ €2,184                      │
│ ↑ +12% к прошлой неделе     │
│                             │
│ ████ ███ 65% · 35%          │  ← platform breakdown
└─────────────────────────────┘
```
- Card: `card` bg, `border`, radius 13, padding `16px 18px`
- Icon: 14px `inkSubtle`
- Label: Geist 12.5 inkMute
- Value: Geist Mono 26/500 ink, `letter-spacing: -0.02em`, tabular-nums
- Delta: 11px Geist Mono in `success` or `danger`
- Optional platform breakdown bar at bottom: 2 thin (height 4) flex bars colored Meta/Google, percentages right

#### AI Insights Row

- Background: `linear-gradient(135deg, #FCF1E8 0%, #F8E8D9 100%)`
- Border: `1px solid #F5DDC8`
- Radius 14, padding 20
- Left: 38×38 white sparkle avatar
- Right: header "AI · СЕГОДНЯ" (Geist Mono 10.5/600 peachDeep, uppercase, tracking 0.1em) + dot + "обновлено 4 мин назад"
- 3 insight rows: 18×18 check/alert/bolt icon in tinted bubble + 13.5 body text with **bold key terms**

#### Campaigns Table

- Card with header row containing title + 4 filter chips on the right (Все / Meta / Google / Paused)
- Filter chip active: `ink` bg, white text, count subtle inside
- Filter chip inactive: transparent, border, inkMute
- Header row: Geist Mono 10.5 uppercase, gridcols `1fr 110px 70px 60px 60px 80px 100px 24px`
- Body rows: status-dot (active=success, attention=warn with light bg row tint, paused=inkSubtle) + name (Geist 13.5/500) + service sub-line + platform badge + spend + conv + cpa + 7-day sparkline (80×28) + budget + chevron
- Sparkline: line + 8% area fill, colored by platform (or `warn` if attention status)

#### Platform Badge

Inline-flex, padding `3px 8px`, radius 6, `metaSoft` / `googleSoft` bg, glyph + "Meta" / "Google" in Geist Mono 10.5/600 uppercase tracking 0.02em.

#### AI Chat Mini (sidebar widget)

- Card, radius 14, header with sparkle + title + sync dot
- Body: alternating bot/user bubbles (small, 12.5px font)
- Action pills: peach wash bg, peachDeep text, "Подними до €45" / "Объясни прогноз"
- Footer: voice mic + "Спроси или дай команду…" placeholder + ⌘K chip

### 2. Channels (NEW — Meta vs Google)

**Why this exists:** brief says Meta is creative-heavy, Google is keyword/RSA-heavy. Unified campaigns view is the daily driver, but this page lets the user compare and rebalance.

**Layout:** standard sidebar + content. Content is `flex-col gap-16`:
1. Header
2. **Allocation Strip** (big card with split-bar)
3. **AI Allocation Card** (peach gradient with concrete recommendation)
4. `grid-cols-2 gap-16`: Meta Panel | Google Panel

#### Allocation Strip

- Card padding 20
- Top: "SPEND · 7 ДНЕЙ" label + value €2,184 (Geist Mono 32/500) + small metrics (Лиды/CPL/ROAS)
- **Split bar**: two flex children, height 36, divided 65/35 (Meta/Google), each colored their primary, white text. Left has rounded-left, right has rounded-right.
- Each side shows: glyph + name + percentage + amount on the right
- Below: 2-column detail row with leads/CPL/ROAS per platform, ROAS colored `success` if winning

#### Meta Panel

Header: `linear-gradient(0deg, white, #F8FAFE)` with `1px solid #DCE5F4` bottom border, glyph in 36×36 white box, "Meta" in Bricolage 17/700 metaInk, sync dot + account info.

Body (`flex-col gap-18`):
1. **Креативы по углам** — 3 creative rows. Each row: 36×36 thumb (gradient placeholder for clinic photo), angle pill (`peachWash` bg, peachDeep text, monospace 9.5), headline (Geist 12.5), CTR + leads on the right.
2. **AI Insight block** — `successSoft` bg with bullet list: what's working ("Pain+Solution opene Direct Offer +30%", "Photos beat stock", "Headlines under 40 chars +0.4pp")
3. **Ad Sets · Аудитории** — audience rows: users icon, name, LAL 1% pill, reach, CPA
4. Footer buttons: "Сгенерить креатив" (primary, ink bg) + "Аудитории"

#### Google Panel

Same shape, different content:

1. **Топ ключевиков (по конверсиям)** — keyword rows in 5-col grid (match-pill + term mono + impressions + CTR + CPC + leads). Match types color-coded:
   - `exact` — `#E8F5E0` bg, `#456838` text
   - `phrase` — `metaSoft` bg, metaInk text
   - `broad` — `cardSoft` bg, inkMute text
   - `brand` — `peachWash` bg, peachDeep text
   Featured keyword has subtle blue tint background.
2. **AI Insight** — keyword/match insights
3. **RSA · Топ Headlines (15)** — performance-tagged rows: BEST (success) / GOOD (light green) / OK (neutral) / LOW (danger). Tag 9px monospace 700, text, CTR right.
4. Footer: "Сгенерить headlines" + "Keywords research"

### 3. Campaign Detail (drill-in)

**Layout:** breadcrumb + name+platform header. Then `grid: 1fr | 320px gap-22`:

**Main column:**
1. Spend & Conversions chart (700×200 SVG, dual-line: Meta blue solid + success green dashed, dual y-axis, grid lines, 7-day x-axis)
2. Metric grid 4-col 8 metrics: Spend/Conv/CPA/CTR/CPC/Reach/Freq/ROAS
3. Timeline events — 4 rows with colored bubble icon + title + body + relative time on right

**Right column:**
1. AI Recommendations panel (peach gradient) with 3 specific actions (each has icon, title, body, "Применить" button in peach)
2. Quick Actions grid 2×3: Pause / +20% budget (peach) / -20% / Regenerate / Audit landing / Audience

### 4. AI Chat + Telegram sync

**Layout:** sidebar + content. Content `flex-row gap-22`:

**Web chat (flex 1):**
- Header: sparkle + "Чат с AI" (Bricolage 26) + green pill "Sync · Telegram @vallu_clinic_bot" + description
- Conversation card (flex 1): day divider, message bubbles, action pills, **Telegram-origin tag** on user messages that came from TG (blue pill with telegram icon)
- Spend visualization inside bot bubble: per-platform rows with glyph, name, value, percent bar
- Footer: paperclip / image / placeholder / ⌘K / mic button (peach circle)

**Telegram preview (320px):**
- Mock phone surface (no full phone frame on this screen, just the chat region in a 22-radius card)
- Header: peach avatar + "MiloAI Bot" + "в сети"
- Same messages mirrored, including a **voice waveform bubble** (peach mic + 17 thin bars + duration "0:08")

### 5. Services

Each service is a horizontal card (radius 14, padding 18, flex-row gap-22):
- **Left column (220px):** name (Bricolage 19/700), price (Geist Mono 12.5 inkMute), status pill (Активна / Готова к запуску / Черновик), landing URL (dotted underline), 3 small stats (Кампаний / Лидов 7д / CPL)
- **Center (flex 1):** "3 креатива (Meta) · 15 headlines (Google)" label, then 3 mini-creative cards in a row. Each mini-creative is a tinted gradient with angle tag and headline.
- **Right column (180px):** 4 vertical action buttons (Запустить кампанию primary if status=ready, Регенерировать, Редактировать, Лендинг)

If no creatives yet: striped placeholder block.

### 6. Creatives Gallery

4-col grid of square cards.

Each card:
- Top: **1:1 banner preview**:
  - Tinted gradient bg (different tint per service — `#3B5C44` for Импланты, `#46538C` for Отбеливание, etc.)
  - Vignette + diagonal stripe texture overlay
  - Top-left corner: "VÄLLU CLINIC" pill on white bg
  - Top-right corner: platform glyph in 24×24 white rounded square
  - Body: headline (Bricolage 17/600 white, text-shadow) + sub-text
  - CTA pill bottom-left: "Записаться →" white bg, tint-colored text
- Bottom meta: service name (Geist 12.5/500) + angle chip + metrics row (CTR / CPC / Active)

Filters row above grid: 3 filter-groups (Услуга / Платформа / Угол) with chips.

### 7. Lead Inbox (Kanban)

4 columns: Новые / В работе / Won / Lost. Each column has its own bg tint, header with count chip, drag-and-drop cards.

**New lead card (most detailed):**
- Avatar (initials) + name + phone + age
- Source platform pill + service
- **AI response block** (peachWash bg): sparkle icon + "AI · ОТВЕТ" label + 2-3-line suggested message
- Footer: time + "Написать" button (ink bg)

**Won card:**
- Compact: success check + name + value (in success green) + service + source pill

**Lost card:**
- Faded (opacity 0.75) + reason pill (danger)

---

## Interactions & behaviour

### Real-time sync (the killer feature)

When the user does anything via Telegram:
1. Web receives SSE event
2. Bot typing indicator appears in web chat
3. After ~600ms, action applies (e.g. budget €20 → €25 with a "tick" animation)
4. KPI card pulses (1× scale + peach glow ring, 0.9s)
5. Confirmation bubble appears in web chat
6. Sparkle confetti briefly at the changed element (8 particles, peach + peachDeep, 1.4s out)

And vice versa for web → Telegram.

### Toast / anomaly

Anomalies render as a sliding-in toast from top-right (380×auto), `danger` left border 3px, `dangerSoft` border, 14px padding, 380px wide. In animation, slides in over 0.5s, holds, slides out 0.5s after 4s.

### Skeleton loaders

For any data fetch >200ms, render skeletons matching the final layout (rectangular blocks with `cardSoft` bg, subtle shimmer).

### Empty states

Never plain "No data". Always:
- Icon or sparkle illustration (subtle)
- Heading ("Пока нет креативов для этой услуги")
- 1-line description
- Primary CTA button ("✨ Сгенерить первый креатив")

### Cursor and focus

- Buttons: `cursor: pointer`, `transition: background 120ms`
- Cards-as-rows: hover → background lifts to `cardSoft @ 50%`
- Focus ring: 2px peach outer ring with 2px offset

### Stagger animations

When a list of cards/items appears, stagger by 50ms between items.

### Voice waveform

When recording or replaying a voice message, animate 17 vertical bars (height varies from 3-24px) at ~5fps to suggest activity. Use peach color.

---

## State management

Use whatever the host codebase prefers (Zustand, Redux, Jotai, Vue Pinia, etc).

Key state surfaces:
- **Auth & account** (user, business profile, language)
- **Connections** (Telegram pairing status, Meta BM, Google MCC — OAuth tokens)
- **Campaigns** (cached list with last-update timestamp; SSE patches individual rows)
- **Realtime sync** (SSE event stream → updates campaigns, chat, anomalies)
- **AI chat** (conversation thread, typing indicator, pending actions)
- **Anomalies** (24h rolling window, badge count for bell)
- **Lead inbox** (Kanban board state, drag-and-drop)

Data fetching: REST for initial load, SSE for live updates (campaigns, chat, anomalies, leads).

---

## Assets

- **Logo:** the sparkle SVG (`SparkleLogo` in `components.jsx`). Replace with real brand when finalized.
- **Lucide icons:** use `lucide-react` package — the inlined SVG paths in the mockups are placeholder names, fetch the real ones.
- **Client photos:** mocks use diagonal-stripe placeholders. Real product pulls from the connected business's website via scraping at onboarding.
- **Fonts:**
  - `Geist` + `Geist Mono` from Vercel — install via `@fontsource/geist` and `@fontsource/geist-mono` or load from Google Fonts.
  - `Bricolage Grotesque` from Google Fonts.

---

## Files in this bundle

- `MiloAI Mockup.html` — main canvas with all screens. **Open this first.**
- `MiloAI Magic Moment RU.html`, `MiloAI Magic Moment EN.html` — animated explainer videos showing the killer feature (Telegram ↔ Web sync). Reference for motion design and the "magic moment" interaction.
- `components.jsx` — visual base (color tokens, icons, BrowserFrame, PhoneFrame, etc)
- `mockup-shared.jsx` — platform colors (Meta blue / Google multi-color), badges, sidebar
- `screen-dashboard.jsx` — Dashboard implementation
- `screen-channels.jsx` — **Channels (Meta vs Google) comparison page**
- `screen-campaign.jsx` — Campaign drill-in detail
- `screen-chat.jsx` — AI Chat + Telegram split view
- `screen-creatives.jsx` — Creatives gallery
- `screen-services.jsx` — Services catalog
- `screen-inbox.jsx` — Lead Inbox Kanban
- `animations.jsx` — animation primitives (only relevant for video files)
- `scene.jsx`, `copy-ru.js`, `copy-en.js` — video composition

---

## Implementation priority (suggested phased rollout)

If shipping in phases:

**Phase 1 — core single-user flow:**
- Auth + business onboarding (voice description + site parsing)
- Account connections (Telegram, Meta, Google)
- Services catalog (manual add)
- Creatives gallery (Meta only)
- Campaign launch (Meta only)
- Basic dashboard

**Phase 2 — sync & intelligence:**
- AI chat (web)
- Telegram bot sync (the magic moment)
- Anomaly detection
- AI recommendations

**Phase 3 — Google + comparison:**
- Google Ads connection (MCC)
- Keyword research + RSA generation
- Channels comparison page

**Phase 4 — growth tools:**
- Lead Inbox + Kanban
- Competitor intel
- Landing builder
- Analytics deep-dive

---

## Open questions for product

1. **Branding** — "MiloAI" is a working name; final name TBD (candidates: Adler, Niko, Saga, Helm, Verve, Lumi, Knack)
2. **Naming inside UI:** keep "Каналы" or use "Платформы"?
3. **Mobile breakpoint priorities** — mockups are desktop-first. Chat is mobile-first per brief — design separately.
4. **Bilingual switching** — every visible string should be a translation key from day 1 (RU / EN / ET).

---

## Questions during implementation

If anything in this doc is ambiguous, **ask the design owner before guessing**. Reach out via the project chat. Better to clarify than to ship a wrong interpretation that costs a re-do.
