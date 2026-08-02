# Bete — design plan

Written before any UI code, per Section 8 of the brief.

---

## 1. Palette

Six tokens. The brief fixes the primary at `rgb(12, 58, 60)`; everything else is derived to serve it. Each is justified against something physically present in Addis rather than a mood board.

| Token | Hex | Where it comes from | Where it is used |
|---|---|---|---|
| `bete` | `#0C3A3C` | The eucalyptus stands on Entoto read almost black-green at distance. This is that green with the light taken out of it. | Brand colour, house strokes, headers, primary buttons, footer |
| `ink` | `#061F20` | Same hue driven darker — never a neutral black, because a neutral black next to teal reads as a printing error. | Body text, dark surfaces |
| `mint` | `#4FBFA0` | The one bright colour in the city's built environment is painted sheet metal, and pale green is the most common shade of it. | The availability signal. Confirmed badges, success states, the logo's window dot |
| `ochre` | `#E0A32E` | Unpainted render and the dust that settles on everything in Bega, the dry season. | The single warm accent. Open doorway in the mark, "ageing" freshness state, price emphasis |
| `stone` | `#B4BFBE` | Raw concrete block, the material every half-finished G+2 in the city is made of. | Borders, dividers, muted and stale states |
| `paper` | `#EEF1EF` | Cool off-white pulled toward the teal. Deliberately not a warm cream. | Page background |

Rules I am binding myself to:

- The three freshness states derive from this palette and nothing else: fresh = `mint`, ageing = `ochre`, stale = `stone`.
- No blue anywhere. No red outside destructive confirmation.
- `#0C3A3C` on `#EEF1EF` is 11.6:1, passes AAA.
- `mint` on `paper` fails for text. It is only ever a fill, a dot, or a rail — never a text colour. Text that sits with mint is `ink`.

## 2. Type

| Role | Face | Reason |
|---|---|---|
| Display | **Outfit** | Geometric sans, closed apertures, holds up at `-0.035em` tracking. Used for the wordmark, page titles, prices |
| Body (Latin) | **IBM Plex Sans** | Engineered rather than neutral, and it ships real tabular figures (`tnum`), which the brief requires for price columns |
| Body (Amharic) | **Noto Sans Ethiopic** | Full Ge'ez coverage. Loaded as a font-family fallback on the same stack so `ቤቴ` and Latin text share one CSS class |

Amharic is not an afterthought font swap. Every text style declares the stack `Outfit/Plex → Noto Sans Ethiopic → sans-serif`, so a mixed string like `Bole Medhanialem · ቦሌ መድሃኒዓለም` renders without a visible seam. Ethiopic glyphs sit slightly larger at the same point size, so Amharic-heavy blocks get a `1.7` line-height against Latin's `1.55`.

Type scale (1.25 minor third, 16px base):

```
display   3.052rem / 0.95  / -0.035em
h1        2.441rem / 1.05  / -0.03em
h2        1.953rem / 1.15  / -0.025em
h3        1.563rem / 1.25  / -0.02em
lg        1.25rem  / 1.4
base      1rem     / 1.55
sm        0.875rem / 1.5
xs        0.75rem  / 1.45  / 0.01em
price     tabular-nums, always, at every size
```

## 3. Layout

### Landing

One sentence: a full-bleed teal masthead that states the problem in words, not a stock photo, with the search bar as the only bright object on the screen.

```
┌────────────────────────────────────────────────────────────┐
│ ቤቴ Bete        Rent  Buy  Map            አማርኛ  Post  Sign in│  teal bar
├────────────────────────────────────────────────────────────┤
│                                                            │
│   Homes that are still open                       (display)│
│   Every listing here shows the last time someone           │
│   confirmed it was actually available.                     │
│                                                            │
│   ┌──────────┬──────────────────────┬──────────┬────────┐  │
│   │ Rent ▾   │ Area or landmark     │ Max ETB  │ Search │  │  ochre CTA
│   └──────────┴──────────────────────┴──────────┴────────┘  │
│                                                            │
│   ●  312 listings confirmed available this week            │  live stat
│                                                            │
├────────────────────────────────────────────────────────────┤
│  Where people actually look                     paper bg   │
│  ┌──────────┐┌──────────┐┌──────────┐┌──────────┐          │
│  │ CMC      ││ Bole Med.││ Kazanchis││ Gerji    │  → areas │
│  │ 41 open  ││ 63 open  ││ 22 open  ││ 38 open  │          │
│  └──────────┘└──────────┘└──────────┘└──────────┘          │
├────────────────────────────────────────────────────────────┤
│  Confirmed in the last three days              [see all →] │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐               │
│  │ card   │ │ card   │ │ card   │ │ card   │               │
│  └────────┘ └────────┘ └────────┘ └────────┘               │
├────────────────────────────────────────────────────────────┤
│  Why we ask listers to confirm  │  How the badge works     │
└────────────────────────────────────────────────────────────┘
```

At 375px the four search fields stack into one tappable bar that opens a full-screen sheet; area cards become a horizontal snap-scroll row.

### Results

One sentence: filters live in a left rail on desktop and a bottom sheet on mobile, and the result count updates as a live region so the filter never feels like a form submission.

```
┌────────────────────────────────────────────────────────────┐
│ ቤቴ    Rent  Buy  Map                       አማርኛ  Post  ⌂    │
├───────────────┬────────────────────────────────────────────┤
│ FILTERS       │  248 homes for rent in Bole                │
│               │  ┌──────────────────────────┬───────────┐  │
│ Property type │  │ Freshest first        ▾  │ ⊞  ▤  🗺  │  │
│ ☑ Apartment   │  └──────────────────────────┴───────────┘  │
│ ☐ Condominium │                                            │
│ ☐ Villa       │  ┌─────────────────┐ ┌─────────────────┐   │
│               │  │▓▓▓▓▓▓▓▓▓░░░░░░░░│ │▓▓▓▓░░░░░░░░░░░░░│ ← life rail
│ Price ETB     │  │                 │ │                 │   │
│ ├──●────●───┤ │  │     photo       │ │     photo       │   │
│               │  │              ⚡🛢 │ │              ⚡  │   │
│ Bedrooms      │  ├─────────────────┤ ├─────────────────┤   │
│ [1][2][3][4+] │  │ ● Confirmed 2d  │ │ ◐ Confirmed 12d │   │
│               │  │ 38,000 ETB /mo  │ │ 25,000 ETB /mo  │   │
│ Advance months│  │ 2 bed · 1 bath  │ │ 1 bed · G+0     │   │
│ [1][3][6][12] │  │ CMC, Bole       │ │ Gerji, Bole     │   │
│               │  │ Broker          │ │ Owner           │   │
│ Must have     │  └─────────────────┘ └─────────────────┘   │
│ ☑ Generator   │                                            │
│ ☑ Water tank  │  ┌─────────────────┐ ┌─────────────────┐   │
│ ☐ Elevator    │  │       …         │ │       …         │   │
│               │                                            │
│ Listed by     │            ‹ 1 2 3 … 11 ›                  │
│ ☐ Owner only  │                                            │
│               │                                            │
│ [Clear all]   │                                            │
└───────────────┴────────────────────────────────────────────┘
```

Card anatomy, deliberate choices:

- The **life rail** sits above the photo, not below the text, so it is the first thing the eye lands on when scanning a column.
- **⚡ generator** and **🛢 water tank** get dedicated glyphs burned onto the photo corner. Every other amenity waits for the detail page. These two are the ones that tell an Addis renter whether the place is livable.
- Price is on its own line in tabular figures so a column of cards forms a readable price column.
- `listerType` is printed in plain text on the card. Competitors hide it. Saying "Broker" out loud is a feature.

## 4. Signature element — the life rail

Every listing has a 30-day life. `lastConfirmedAt` resets it; day 30 without confirmation expires it.

The **life rail** renders that 30-day life as a thin horizontal bar across the top edge of every card, filled by the proportion of life remaining, coloured by band:

```
day 0-7    ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░   mint    "Confirmed 3 days ago"
day 8-21   ▓▓▓▓▓▓▓▓▓░░░░░░░░░░░   ochre   "Confirmed 2 weeks ago"
day 22-30  ▓▓░░░░░░░░░░░░░░░░░░   stone   "Not confirmed recently"
```

It scales to three sizes and never changes shape:

- **3px rail** on cards
- **Full meter with day count** on the detail page, next to the contact button, where it is doing its real work: telling you whether calling this number is worth your airtime
- **A row of rails** on the lister dashboard, which turns "which of my listings are going stale" into a single glance and makes the Confirm still available button feel obvious rather than nagging

The mint dot in the logo's window is the same token as the fresh state. The mark and the core feature share one shape, so the brand and the differentiator reinforce each other for free.

## 5. Self-critique

I went through the plan looking for anything I would have produced for a generic property site. Four things failed, and here is what I changed.

1. **The hero was a photo with a floating search bar.** That is the exact thing the brief names as the default. Changed to a typographic masthead in solid `bete` teal that states the freshness promise in words. No house photo above the fold at all. A property site whose hero is not a house photo is immediately unusual, and it puts the differentiator in the first sentence a visitor reads.

2. **Featured areas were going to be photo tiles.** Every site does this, and the photos are always generic skyline shots that could be Nairobi. Changed to typographic tiles carrying a live open-listing count. The useful information on an area tile is "how much is actually here," not what the sky looks like.

3. **The freshness badge was just a coloured pill.** A pill is forgettable and reads as a status chip like any other. Adding the life rail turns a discrete three-state label into a continuous quantity you can compare across cards without reading, and it gives the feature a shape that survives at 3px. The pill stays, but as the caption to the rail rather than the whole idea.

4. **The amenity list was a uniform icon row.** Uniform treatment says every amenity matters equally, which is false here. Promoted generator and water tank onto the photo and demoted the other thirteen to the detail page. This is the single cheapest signal in the whole design that the builder knows the market.

One thing I am keeping despite it being conventional: the left filter rail on desktop. Rightmove's layout is the benchmark for a reason and inventing a novel filter interaction would cost usability for no gain. Novelty belongs in the freshness system, not in the controls.

## 6. What I am taking from the reference sites, and what I am not

| Site | Taking | Deliberately not |
|---|---|---|
| betdelala.com | Phone number as the primary contact action, because that is how deals actually happen here | Its listing density — it shows too little per screen on mobile |
| livingethio.com | The confidence that a local site can look composed rather than classified-ad | Its heavy hero imagery and Western-luxury tone |
| ethiopiapropertycentre.com | The URL taxonomy: `/rent/[area]/[bedrooms]` is genuinely good for SEO and I am copying the shape | Its dated, cramped visual layer |
| ethiobetoch.com | Public property IDs, view counts, and the negotiable-price flag as first-class card data | Nothing much beyond that |
| realethio / betoch.et / homeaddis | Card patterns that survive a slow connection | Their reliance on watermarked broker photos |
| property24.co.za | Saved searches with alerts, and the map/list result parity | Its ad density |
| rightmove.co.uk | Filter panel structure and URL-encoded search state | Its information density at mobile widths |
| zillow.com | Clustered price pins and the map-list sync model | The polygon-draw tool — over-engineered for a city this size |

The one thing none of them do, and the reason this project exists: none of them tell you whether the listing you are looking at is still real.
