# Bete — homes that are still open

Property to rent and buy in **Addis Ababa**, built around one idea: every listing must show the last time a person confirmed it was still available.

This is a portfolio product for a hiring manager who may never have looked for a house in Ethiopia. The short version of the market problem is below. The product answer is the freshness system.

---

## The problem

Ask anyone who has rented in Addis and you get the same story: you call about a flat, it went three months ago. Telegram channels and local listing sites have almost no reason to remove a dead post, so seekers burn airtime on numbers that lead nowhere.

Addresses work by landmark ("behind Edna Mall"), not street numbers. Advance rent (often three to twelve months) matters as much as price. Brokers dominate supply. Amharic and English sit side by side. A generic global real-estate template fails all of that.

## The answer — freshness

Every listing has a **thirty-day life**.

| Day | What happens |
|---|---|
| 0–7 | **Fresh** — mint life rail, call with confidence |
| 8–21 | **Ageing** — ochre rail, still worth asking |
| 22–30 | **Stale** — stone rail, treat carefully |
| 21 | Cron emails the lister: still available / already taken |
| 30 | No confirmation → status `EXPIRED`, removed from search |

Search defaults to a blended freshness + recency score, not price. Price-sorted defaults are exactly how dead cheap listings rise to the top on every competing site.

The lister dashboard’s main action is **Confirm still available**. That button *is* the product.

---

## Stack

| Layer | Choice | Why |
|---|---|---|
| App | Next.js 15 App Router + TypeScript | Server components for shareable search URLs |
| UI | Tailwind 4 + shadcn primitives | Mapped onto a fixed Addis-derived palette |
| Data | PostgreSQL + PostGIS via Prisma | Real distance for “similar” and map pins |
| Auth | Auth.js — phone + password | Phone is the identity that matters here |
| Maps | Leaflet + OSM | Free, no billing gate |
| i18n | next-intl (`en` / `am`) | Amharic is first-class, not a font swap |
| Host | Vercel + Neon-shaped Postgres | Daily cron for freshness |

Design notes live in [`docs/design-plan.md`](docs/design-plan.md). The full brief is [`docs/brief.md`](docs/brief.md).

---

## Local setup

```bash
cp .env.example .env
# Fill AUTH_SECRET (npx auth secret) and leave CRON_SECRET as the example for local cron

npm install
npm run db:up          # PostGIS via docker compose on :5433
npm run db:migrate
npm run db:seed        # 45 areas, 15 amenities, ~80 listings, demo users
npm run dev
```

Open [http://localhost:3000/en](http://localhost:3000/en).

### Demo accounts

Password for every seeded user: `bete-demo-2026`

| Role | Phone |
|---|---|
| Admin | `+251911000001` |
| Owner lister | `+251911204471` |
| Seeker | `+251911402863` |

### Freshness cron (local)

```bash
curl -H "Authorization: Bearer local-dev-cron-secret" http://localhost:3000/api/cron/freshness
```

Without `RESEND_API_KEY`, reminder emails print to the server console.

---

## Architecture decisions worth knowing

1. **Search state lives in the URL.** Filters are links, not client-only state, so a search is shareable and back-button safe.
2. **Prices stay in the advertised currency.** USD and ETB are compared for filtering via a conversion, but the card always shows what was quoted.
3. **Generator and water tank are first-class filters.** They decide whether a place is livable in Addis; everything else waits for the detail page.
4. **Similar listings use PostGIS distance**, not sub-city name. A house just over the Bole/Yeka line beats one at the far end of the same sub-city.
5. **Public map pins are approximate.** The landmark note carries the real address detail until you call.

---

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Next.js dev server |
| `npm run build` | `prisma generate` + production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run db:seed` | Re-seed areas, amenities, users, listings |
| `npm run db:studio` | Prisma Studio |

---

## What is in / not yet polished

Shipped through Phase 6: browse, detail, map, auth, post wizard, dashboard confirm, freshness cron, saved hearts, admin moderation.

Still open for Phase 7 polish: Cloudinary upload in the post wizard (URLs work today), saved-search email alerts, SEO area landing routes, Lighthouse pass on a deployed URL.
