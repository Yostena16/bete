# Build Prompt — Addis Ababa Property Marketplace (Portfolio Project)

> **How to use this:** Paste the whole file into Cursor as your first message, then work through it phase by phase. Do not ask Cursor to build all seven phases in one go — it will produce shallow, broken code. Say: *"Read this whole spec, then implement Phase 1 only. Stop when Phase 1's definition of done is met."*

---

## 0. Context for the agent

You are building a property rental and sales marketplace for Addis Ababa, Ethiopia. This is a portfolio project, so it does not need payments, real users, or a business model — it needs to be **complete, polished, realistic, and demonstrably built for the Ethiopian market rather than a generic Western real estate clone**.

The single most important thing: a reviewer should be able to tell within 30 seconds that whoever built this understands Addis Ababa property, not just React.

### Ground rules

- TypeScript everywhere. No `any` unless justified in a comment.
- No placeholder content. No "Lorem ipsum." No `TODO: implement later` left in shipped phases.
- Every phase must run without errors before moving to the next.
- Do not invent neighbourhood names, property types, or amenities. Use exactly the lists given in Section 3.
- Mobile-first. The primary user is on an Android phone on a slow connection. Test at 375px width before 1440px.
- Ask me before adding any dependency not listed in Section 2.

---

## 0.5 Name and brand

**Product name: Bete** — from the Amharic **ቤቴ**, "my house."

Not "a house" or "houses" — *mine*. The name is first-person on purpose: the moment the product is built around is the one where a place stops being a listing and becomes yours. It also sidesteps the plural *Betoch* / *BetDelala* / *EthioBetoch* cluster already in this market.

- Domain to assume: `bete.et` (use `getbete.com` in copy if needed)
- Pronounced *BEH-teh*
- Amharic wordmark: **ቤቴ**
- English tagline: **Homes that are still open**
- Amharic tagline: **ክፍት ቤቶች ብቻ** ("only open houses")

The tagline points at the freshness system in Section 5, which is the project's differentiator.

### Logo

Assets are provided as `bete-mark.svg` and `bete-logo-sheet.svg`. Place the mark at `/public/logo/`.

A gabled house with overhanging eaves, drawn as three open strokes rather than a closed silhouette. The doorway is filled ochre and stands open. The window is a single mint dot — the same token used for the availability signal on every listing card's freshness badge, so the logo and the core feature share one shape.

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" role="img" aria-label="Bete">
  <path d="M6 33 L32 9 L58 33" fill="none" stroke="#0C3A3C" stroke-width="6.5"
        stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M14 32 V58" fill="none" stroke="#0C3A3C" stroke-width="6.5"/>
  <path d="M50 32 V58" fill="none" stroke="#0C3A3C" stroke-width="6.5"/>
  <circle cx="32" cy="27" r="4.6" fill="#4FBFA0"/>
  <path d="M25 58 V45 Q25 39 32 39 Q39 39 39 45 V58 Z" fill="#E0A32E"/>
</svg>
```

**Rules:** keep the eaves overhanging past the walls — pulling them flush turns the mark into the generic house pentagon every competitor uses. Never close the silhouette into a filled shape. Never place the mark inside a location pin. Clear space on all sides equals the width of the doorway. Below 20px, drop the mint window dot. On dark backgrounds the strokes go `#EEF1EF`; the doorway and window keep their colours.

### Palette — use these as your Tailwind theme tokens

Primary is `rgb(12, 58, 60)` — a deep teal, per the brief. Everything else is derived to support it.

| Token | Hex | Use |
|---|---|---|
| `bete` | `#0C3A3C` | Primary. Brand colour, the house strokes, headers, primary buttons. |
| `ink` | `#061F20` | Body text and dark surfaces. Same hue, driven darker — never a neutral black. |
| `mint` | `#4FBFA0` | The availability signal. "Confirmed available" badges, success states, the window dot. |
| `ochre` | `#E0A32E` | The single warm accent against the teal. The open doorway, "confirmed recently" amber state, price highlights. Use sparingly. |
| `stone` | `#B4BFBE` | Borders, dividers, muted and stale states. |
| `paper` | `#EEF1EF` | Page background. Cool off-white pulled toward the teal, deliberately not a warm cream. |

Derive the three freshness-badge states directly from this: fresh = `mint`, ageing = `ochre`, stale = `stone`. Do not introduce a blue or a red outside of destructive actions.

Contrast note: `#0C3A3C` on `#EEF1EF` passes AAA. `mint` on `paper` does **not** pass for text — use it as a fill or dot, and pair it with `ink` text.

### Type

- Display: a geometric sans with tight negative tracking for the wordmark and headings
- Body: must have full Ge'ez glyph coverage — pair with **Noto Sans Ethiopic** and verify Amharic strings render before shipping any UI
- Numerals: tabular figures for prices, always. Prices are compared in columns.

---

## 1. Product summary

A two-sided marketplace where landlords and brokers list properties for rent or sale, and seekers browse, filter, save, and contact.

**Roles:**
- `SEEKER` — browses, saves listings, saves searches
- `LISTER` — everything a seeker can do, plus creates and manages listings
- `ADMIN` — approves/rejects listings, manages areas and amenities, sees analytics

**Out of scope (do not build):** in-app messaging, payments, reviews/ratings, virtual tours, native mobile apps, real-time chat.

---

## 2. Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router) + TypeScript |
| Styling | Tailwind CSS |
| UI primitives | shadcn/ui |
| Database | PostgreSQL with PostGIS extension |
| ORM | Prisma |
| Auth | Auth.js (NextAuth) — credentials + Google |
| Images | Cloudinary (upload, transform, serve WebP) |
| Maps | Leaflet + react-leaflet + OpenStreetMap tiles (free, no API key) |
| Forms | react-hook-form + zod |
| i18n | next-intl |
| Hosting | Vercel + Neon |

Do not use Google Maps — it requires billing setup and this project must run for free.

---

## 3. Domain data — use these exact values

This section is the heart of the project. Getting it right is what makes the app credible.

### 3.1 Listing types
`FOR_RENT`, `FOR_SALE`

### 3.2 Property types
```
CONDOMINIUM        // government condo units (20/80, 40/60 schemes)
APARTMENT          // unit in a private building
VILLA              // standalone house, described as G+0 / G+1 / G+2 / G+3
SERVICE_QUARTER    // ሰርቪስ ቤት — single room, shared compound
WHOLE_BUILDING     // G+4 and above, usually commercial
SHOP
OFFICE
WAREHOUSE
LAND
```

Note on villas: Ethiopians describe buildings as **G+1, G+2, G+3** (ground plus N floors), not "two-storey." Store this as an integer field `floorsGPlus` and render it as "G+2" in the UI. This detail matters.

### 3.3 Sub-cities (11 — seed all)
Bole, Yeka, Kirkos, Arada, Lideta, Gullele, Addis Ketema, Kolfe Keranio, Nifas Silk-Lafto, Akaky Kaliti, Lemi Kura

### 3.4 Areas — seed all of these with approximate lat/lng

This is what people actually search by. Nobody searches "Kirkos." They search "Kazanchis."

| Area | Sub-city |
|---|---|
| Bole Medhanialem | Bole |
| Bole Rwanda | Bole |
| Bole Japan | Bole |
| Bole Atlas | Bole |
| Bole Michael | Bole |
| Gerji | Bole |
| Wollo Sefer | Bole |
| Airport Area | Bole |
| CMC | Bole |
| Megenagna | Yeka |
| Summit | Yeka |
| Ayat | Yeka |
| Kotebe | Yeka |
| Signal | Yeka |
| Kazanchis | Kirkos |
| Meskel Flower | Kirkos |
| Bambis | Kirkos |
| Urael | Kirkos |
| Piassa | Arada |
| Sidist Kilo | Arada |
| Arat Kilo | Arada |
| Kebena | Arada |
| Sarbet | Nifas Silk-Lafto |
| Old Airport | Nifas Silk-Lafto |
| Jemo | Nifas Silk-Lafto |
| Lebu | Nifas Silk-Lafto |
| Lafto | Nifas Silk-Lafto |
| Hana Mariam | Nifas Silk-Lafto |
| Mexico | Lideta |
| Lideta | Lideta |
| Torhailoch | Lideta |
| Merkato | Addis Ketema |
| Autobis Tera | Addis Ketema |
| Shiro Meda | Gullele |
| Kuas Meda | Gullele |
| Kolfe | Kolfe Keranio |
| Ayer Tena | Kolfe Keranio |
| Asko | Kolfe Keranio |
| Kality | Akaky Kaliti |
| Tulu Dimtu | Akaky Kaliti |
| Koye Feche | Akaky Kaliti |
| Jacros | Lemi Kura |
| Bisrate Gebriel | Nifas Silk-Lafto |
| Haya Hulet | Yeka |
| Gurd Shola | Yeka |

Store `nameEn`, `nameAm` (Amharic), `subCity`, `lat`, `lng`. Look up real coordinates — do not fabricate them.

### 3.5 Amenities — Ethiopia-specific, use these

```
Parking
Backup generator          ← critical, power cuts are routine
Water reserve tank        ← critical, water interruptions are routine
Elevator
Gated compound
24-hour security guard
Service quarter included
Balcony / terrace
Garden
Internet ready
Own electricity meter
Own water meter
Furnished kitchen
Hot water / shower
Wheelchair accessible
```

Generator and water tank are the two that signal you know this market. Show them prominently on listing cards, not buried in a list.

### 3.6 Ethiopia-specific listing fields (do not skip these)

- **`advanceMonths`** — how many months of rent are demanded upfront (1, 3, 6, 12). This is one of the biggest real filters for renters here and no existing site offers it. Make it a first-class filter.
- **`priceNegotiable`** — boolean, shown as a badge
- **`currency`** — `ETB` or `USD`. High-end and diaspora-targeted listings are priced in USD. Show both with a toggle and a stored conversion rate.
- **`rentPeriod`** — `MONTHLY` or `ANNUAL`
- **`furnishing`** — `FURNISHED` | `SEMI_FURNISHED` | `UNFURNISHED`
- **`listerType`** — `OWNER` | `BROKER` | `AGENCY`. Be honest that brokers dominate; surface it as a filter so seekers can choose.

---

## 4. Data model

```prisma
model User {
  id            String    @id @default(cuid())
  name          String
  phone         String    @unique     // +251 format, this is the real identity here
  email         String?   @unique
  role          Role      @default(SEEKER)
  listerType    ListerType?
  phoneVerified Boolean   @default(false)
  createdAt     DateTime  @default(now())
  listings      Listing[]
  savedListings SavedListing[]
  savedSearches SavedSearch[]
}

model Listing {
  id              String   @id @default(cuid())
  userId          String
  listingType     ListingType
  propertyType    PropertyType
  titleEn         String
  titleAm         String?
  descriptionEn   String   @db.Text
  descriptionAm   String?  @db.Text

  price           Decimal
  currency        Currency @default(ETB)
  priceNegotiable Boolean  @default(false)
  rentPeriod      RentPeriod?
  advanceMonths   Int?

  bedrooms        Int?
  bathrooms       Int?
  areaSqm         Float?
  floorsGPlus     Int?
  furnishing      Furnishing?

  areaId          String
  addressNote     String?                 // "behind Edna Mall"
  lat             Float
  lng             Float

  status          ListingStatus @default(PENDING)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  lastConfirmedAt DateTime @default(now())   // ← powers the freshness system
  expiresAt       DateTime
  views           Int      @default(0)

  user            User @relation(fields: [userId], references: [id])
  area            Area @relation(fields: [areaId], references: [id])
  images          ListingImage[]
  amenities       ListingAmenity[]

  @@index([listingType, propertyType, status])
  @@index([areaId])
  @@index([price])
  @@index([lastConfirmedAt])
}

model ListingImage {
  id         String  @id @default(cuid())
  listingId  String
  url        String
  publicId   String        // Cloudinary
  order      Int
  isCover    Boolean @default(false)
  listing    Listing @relation(fields: [listingId], references: [id], onDelete: Cascade)
}

model Area {
  id       String @id @default(cuid())
  nameEn   String
  nameAm   String
  subCity  SubCity
  lat      Float
  lng      Float
  listings Listing[]
}

model Amenity {
  id       String @id @default(cuid())
  nameEn   String @unique
  nameAm   String
  icon     String
  listings ListingAmenity[]
}

model ListingAmenity {
  listingId String
  amenityId String
  listing   Listing @relation(fields: [listingId], references: [id], onDelete: Cascade)
  amenity   Amenity @relation(fields: [amenityId], references: [id])
  @@id([listingId, amenityId])
}

model SavedListing {
  userId    String
  listingId String
  createdAt DateTime @default(now())
  user      User @relation(fields: [userId], references: [id])
  @@id([userId, listingId])
}

model SavedSearch {
  id        String @id @default(cuid())
  userId    String
  name      String
  queryJson Json
  frequency AlertFrequency @default(DAILY)
  lastSentAt DateTime?
  user      User @relation(fields: [userId], references: [id])
}

enum Role          { SEEKER LISTER ADMIN }
enum ListerType    { OWNER BROKER AGENCY }
enum ListingType   { FOR_RENT FOR_SALE }
enum PropertyType  { CONDOMINIUM APARTMENT VILLA SERVICE_QUARTER WHOLE_BUILDING SHOP OFFICE WAREHOUSE LAND }
enum Currency      { ETB USD }
enum RentPeriod    { MONTHLY ANNUAL }
enum Furnishing    { FURNISHED SEMI_FURNISHED UNFURNISHED }
enum ListingStatus { DRAFT PENDING ACTIVE RENTED SOLD EXPIRED REJECTED }
enum SubCity       { BOLE YEKA KIRKOS ARADA LIDETA GULLELE ADDIS_KETEMA KOLFE_KERANIO NIFAS_SILK_LAFTO AKAKY_KALITI LEMI_KURA }
enum AlertFrequency { INSTANT DAILY WEEKLY }
```

---

## 5. The signature feature — listing freshness

**This is the differentiator. Do not treat it as optional.**

The number one complaint about every property site in Addis is dead listings: you call about a house, it was rented three months ago. Solve it visibly.

Requirements:

1. Every listing has `lastConfirmedAt` and `expiresAt` (default: created + 30 days).
2. Listing cards show a freshness badge:
   - Confirmed within 7 days → green, "Confirmed 3 days ago"
   - 8–21 days → amber, "Confirmed 2 weeks ago"
   - 22–30 days → grey, "Not confirmed recently"
3. A cron job (Vercel Cron) runs daily and:
   - At day 21, emails the lister: "Is this still available?" with one-click **Still available** / **Already taken** links
   - At day 30 with no confirmation, sets status to `EXPIRED` and removes it from search
4. Search results default-sort by a blended score of freshness and recency, not price.
5. The lister dashboard has a prominent **Confirm still available** button that resets `lastConfirmedAt`.
6. Homepage shows a live stat: "X listings confirmed available this week."

Write this feature up in the README as the project's central idea.

---

## 6. Pages and routes

```
/                                    Landing — search bar, featured areas, freshness stat
/[locale]/rent                       Rent search results
/[locale]/buy                        Sale search results
/[locale]/rent/[area]                SEO landing, e.g. /rent/bole-medhanialem
/[locale]/rent/[area]/[bedrooms]     e.g. /rent/cmc/2-bedroom
/[locale]/listing/[id]               Listing detail
/[locale]/map                        Full-screen map search
/[locale]/post                       Multi-step listing creation wizard
/[locale]/dashboard                  Lister's listings + confirm buttons + view stats
/[locale]/saved                      Saved listings and saved searches
/[locale]/admin                      Moderation queue + analytics
/[locale]/login  /register
```

**Search state must live in the URL.** `/rent?area=cmc&beds=2&maxPrice=40000&generator=true&advanceMax=3` must be shareable and back-button-safe. Use `nuqs` or native `useSearchParams`.

---

## 7. Build phases

Complete each phase fully. Do not start the next until the definition of done is met.

### Phase 1 — Foundation
Next.js + TypeScript + Tailwind + shadcn/ui scaffold. Prisma schema from Section 4. Postgres running. All enums, `Area` table seeded with the full Section 3.4 list including real coordinates, `Amenity` table seeded from Section 3.5.
**Done when:** `npx prisma studio` shows 45 areas with valid coordinates and 15 amenities.

### Phase 2 — Seed data
Generate **80 realistic listings**: 55 rentals, 25 sales. Spread across property types and areas. Prices must be realistic for Addis in 2026 — research current ranges, do not guess randomly. A 2-bedroom in Bole is not the same price as a service quarter in Kolfe. Use real property photos from Unsplash/Pexels. Descriptions in natural English with some Amharic titles. Vary `lastConfirmedAt` across the freshness bands so the badges are visible.
**Done when:** 80 listings render as JSON from a `/api/listings` route.

### Phase 3 — Browse and search
Listing cards, results grid, the full filter panel (Section 3.6 fields included), URL-synced state, pagination, sorting, empty states.
**Done when:** every filter works, results are shareable by URL, and it looks correct at 375px.

### Phase 4 — Listing detail + map
Photo gallery with keyboard nav, full spec table, amenity grid with icons, Leaflet map pin, contact-reveal button (hide the phone number until clicked, count the reveal), similar-listings section, view counter.
Then the `/map` page: clustered price pins, click a pin to preview, filters synced with the list view.
**Done when:** detail page is complete and map search returns the same result set as list search.

### Phase 5 — Auth, posting, dashboard
Auth.js with phone-based registration. Multi-step post wizard: type → location (map pin drop) → details → amenities → photos → price → review. Draft autosave. Cloudinary upload with client-side compression and drag-to-reorder. Lister dashboard with listing status, views, and the confirm-availability button.
**Done when:** a new user can register, post a listing, and see it in the moderation queue.

### Phase 6 — Freshness system + saved searches + admin
Everything in Section 5. Saved listings and saved searches with email alerts. Admin moderation queue with approve/reject and a reason field, plus a simple analytics view.
**Done when:** the cron job correctly expires a listing you backdate in the database.

### Phase 7 — Polish
Amharic translation via next-intl for all UI strings (not listing content). Skeleton loaders. Proper 404 and error pages. SEO: metadata, JSON-LD `RealEstateListing` schema, sitemap, OG images. Lighthouse ≥ 90 on all four scores. Keyboard accessible, visible focus rings, `prefers-reduced-motion` respected.
**Done when:** Lighthouse passes and every string has an Amharic translation.

---

## 8. Design direction

Do not build the default AI real-estate site: white background, blue accent, rounded cards, stock hero with a search bar floating over a house photo. That is what every site in this space already looks like.

Before writing any UI code, produce a short design plan and show it to me:

- **Palette:** 4–6 named hex values. Draw from something real — Ethiopian textile borders (*tibeb*), the specific ochre and eucalyptus-green of Addis's built environment, the corrugated-metal and concrete palette of the city. Justify each colour in one line. Avoid warm-cream-plus-terracotta and near-black-plus-acid-green; both are AI defaults.
- **Type:** a characteristic display face and a body face that supports Ethiopic script properly. Check that your body face has Ge'ez glyph coverage — Noto Sans Ethiopic is the safe pairing partner. Set a real type scale.
- **Layout:** one-sentence description plus an ASCII wireframe for the landing page and the results page.
- **Signature element:** the one thing this site is remembered for. Suggestion, not a mandate: make the freshness system the visual signature — a confidence indicator that appears on every card and becomes the site's identity.

Then critique your own plan: if any part of it is what you'd produce for any generic property site, change it and tell me what you changed.

**Copy rules:** active voice, sentence case, plain verbs. Buttons say what happens: "Confirm still available," not "Submit." Empty states tell people what to do next. Errors say what broke and how to fix it.

---

## 9. Definition of done for the whole project

- 80+ realistic listings, no placeholder content anywhere
- Every filter in Section 3.6 works and is URL-encoded
- Freshness system fully functional, including the cron job
- Full Amharic UI translation
- Lighthouse ≥ 90 across performance, accessibility, best practices, SEO
- Works on a throttled 3G connection at 375px
- README explaining the market problem, the freshness solution, and the architecture decisions — written for a hiring manager who has never been to Ethiopia

---

## 10. Git workflow — commits and pull requests

Work in atomic commits on feature branches, one pull request per feature. This is a requirement of the project, not a preference.

### Branching

```
main                      protected, always deployable
  ├── feat/schema-and-seed
  ├── feat/listing-card
  ├── feat/search-filters
  ├── feat/map-search
  ├── feat/freshness-cron
  └── fix/amharic-font-fallback
```

Branch prefixes: `feat/`, `fix/`, `refactor/`, `chore/`, `docs/`, `test/`, `style/`, `perf/`

### Commit rules

Use Conventional Commits with a scope:

```
feat(search): add advance-payment months filter
feat(freshness): expire listings unconfirmed for 30 days
fix(map): correct Megenagna coordinates in area seed
refactor(listing): extract FreshnessBadge from ListingCard
docs(readme): explain the stale-listing problem
test(filters): cover URL state round-trip
chore(deps): add nuqs for URL search state
```

**One logical change per commit.** Do not batch a schema change, a component, and a bug fix into one commit. If the body of a commit message needs the word "and," split it.

Concretely: adding the advance-payment filter is at minimum four commits — schema field, API query handling, filter UI control, URL state wiring. That is normal, not padding.

### Pull requests

Open one PR per feature branch, roughly 15–25 across the project. Each PR description must contain:

- **What** changed, in one sentence
- **Why**, referencing the market problem where relevant
- **How to test it** — the exact steps a reviewer would follow
- A screenshot or short recording for anything visual

Do not squash-merge. Use a merge commit or rebase-merge so individual commits survive on `main`. Squash-merging collapses a 12-commit branch into one and destroys the history you are building.

### What I want from you, the agent

- After each meaningful unit of work, stop and tell me the exact `git add` and `git commit` command to run, with the message written out.
- Do not run git commands yourself unless I ask.
- At the end of each phase, draft the PR title and description for me.
- Never commit `.env`, `node_modules`, or Cloudinary credentials. Set up `.gitignore` in Phase 1.

---

## 11. Reference sites to study before starting

Look at these and tell me what you're taking from each and what you're deliberately doing differently:

- betdelala.com — closest local equivalent, has a mobile app
- livingethio.com — best visual polish in the local market
- ethiopiapropertycentre.com — the deepest category taxonomy and URL structure
- ethiobetoch.com — property IDs, view counts, negotiable-price flags
- realethio.com, betoch.et, homeaddis.com — listing card patterns
- property24.co.za — the closest African market with a mature product
- rightmove.co.uk — the filter UI benchmark
- zillow.com — the map search benchmark

---

**Start with Phase 1. Show me the design plan from Section 8 before you write any UI code.**
