# MiloAI — Web

AI media buyer for SMB. Web client for the FastAPI backend in
`../ai-media-buyer/`. Telegram bot is the mobile/voice companion — same
backend, paired identity.

## Stack

- Next.js 16 (App Router) + React 19
- TypeScript 5
- Tailwind 4 + shadcn (Nova preset)
- NextAuth.js (Magic Link) — TBD
- Connects to FastAPI on `localhost:8000` for all business logic

## Architecture

```
   Browser (Next.js)            Phone (Telegram)
        │                           │
        │  REST + SSE/WS            │  MTProto (voice/text)
        ▼                           ▼
   ┌────────────────────────────────────┐
   │  FastAPI backend                   │
   │  - business_services / campaigns   │
   │  - audit / ai-advisor              │
   │  - launch (Meta + Google)          │
   │  - landing publisher               │
   │  - tg-bridge pubsub                │
   └────────────────────────────────────┘
                  │
                  ▼
              Postgres
```

The Telegram bridge: user pairs their `telegram_id` to a web `user_id`
through a one-time deep-link (`t.me/miloailevbot?start=PAIR_XXX`).
After that, any TG message → mirrored to web in real-time, and any
web message → echoed to TG via Bot API.

## Local dev

```bash
# 1. Start the Python backend (separate repo)
cd ../ai-media-buyer && python -m app.telegram.bot     # port 8000

# 2. Run the web
cp .env.example .env.local                              # fill in values
npm install
npm run dev                                             # port 3000
```

Open <http://localhost:3000> — root redirects to `/dashboard`.

## Routes

| Path | Status | What |
|---|---|---|
| `/dashboard` | scaffold | KPI cards + live campaigns + anomalies |
| `/campaigns` | scaffold | List of live campaigns |
| `/campaigns/new` | TODO | Multi-step wizard (platforms → service → budget → audit → launch) |
| `/campaigns/[id]` | TODO | Drill-in: metrics + AI advice + actions + landing audit |
| `/services` | scaffold | Service catalog with cached creatives |
| `/chat` | scaffold | TG-bridge live chat pane |
| `/accounts` | scaffold | TG pairing + Meta/Google OAuth |
| `/settings` | scaffold | Profile + billing |

## Differentiator (so we don't drift)

- **Voice-first** — record on phone, see/act on web
- **End-to-end create** — service → creatives → landing → keywords → launch
- **Pre-launch audit** — block obvious money-leaks before spend
- **EU/EE locale** — RU/ET/EN, EUR, niche benchmarks
- **Agency replacement** — €100/mo, not €500-1500 of a local shop

## Branches

- `main` — scaffold + shadcn baseline
- `feature/dashboard-mvp` — current work: skeleton + first endpoints
