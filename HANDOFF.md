# VoltMarket — Landing Page Handoff & Styling Guide

A framework-agnostic spec for rebuilding the VoltMarket EV ecommerce landing page.
Reference implementation: React + Tailwind CSS v4 (CSS-first tokens), lucide icons.
Everything below is expressed in raw CSS values so it ports to any stack.

---

## 1. Overview

Single-page dark commerce landing page. Section order, top to bottom:

| # | Section | Anchor | Purpose |
|---|---------|--------|---------|
| 1 | Navbar (fixed) | — | Brand, nav links, sign-in CTA |
| 2 | Hero | — | Slogan + New/Used shopping CTAs + trust stats |
| 3 | Charger Map | `#chargers` | Global charging coverage + network stats |
| 4 | Deals | `#deals` | Hot deals / recommended vehicle cards |
| 5 | Footer | — | Copyright + legal links |

**Desktop (1440px)**

![Full page — desktop](images/home-desktop.png)

**Mobile (390px)**

![Full page — mobile](images/home-mobile.png)

The visual concept: near-black blue-tinted canvas, one saturated electric-green→cyan
gradient used as the only accent, and a single high-contrast white navbar pinned on top.

---

## 2. Design tokens

All colors are authored in OKLCH. Hex is a sRGB approximation — prefer OKLCH if your
stack supports it, since the greens clip slightly in sRGB.

### Core palette

| Token | OKLCH | Hex ≈ | Usage |
|---|---|---|---|
| `--background` | `oklch(0.14 0.02 250)` | `#040A11` | Page canvas |
| `--foreground` | `oklch(0.98 0.005 250)` | `#F6F9FC` | Primary text |
| `--card` | `oklch(0.19 0.025 250)` | `#0B151F` | Cards, panels, tooltips |
| `--card-foreground` | `oklch(0.98 0.005 250)` | `#F6F9FC` | Text on cards |
| `--primary` | `oklch(0.82 0.19 145)` | `#68E371` | Electric green (same as `--electric`) |
| `--primary-foreground` | `oklch(0.15 0.02 250)` | `#050C13` | Text on green fills |
| `--secondary` | `oklch(0.24 0.03 250)` | `#14202D` | Subtle button / surface fill |
| `--secondary-foreground` | `oklch(0.98 0.005 250)` | `#F6F9FC` | — |
| `--muted` | `oklch(0.22 0.02 250)` | `#141B24` | Muted surface |
| `--muted-foreground` | `oklch(0.68 0.02 250)` | `#8F9AA4` | Secondary/body copy |
| `--accent` | `oklch(0.72 0.17 200)` | `#00C2CE` | Cyan (same as `--electric-glow`) |
| `--border` | `oklch(0.28 0.02 250)` | `#212A33` | All 1px hairlines |
| `--ring` | `oklch(0.82 0.19 145)` | `#68E371` | Focus ring |
| `--electric` | `oklch(0.82 0.19 145)` | `#68E371` | Brand accent, icons, pins |
| `--electric-glow` | `oklch(0.72 0.17 200)` | `#00C2CE` | Gradient end stop |

The navbar is the one intentional exception to the dark palette — it uses
`white / 90%` background, `black / 10%` border, and neutral-900/600 text.

### Gradients & shadow

```css
--gradient-hero:
  radial-gradient(ellipse at top right, oklch(0.35 0.14 200 / 0.4), transparent 60%),
  radial-gradient(ellipse at bottom left, oklch(0.45 0.18 145 / 0.35), transparent 55%),
  linear-gradient(180deg, oklch(0.14 0.02 250), oklch(0.11 0.02 250));

--gradient-accent: linear-gradient(135deg, var(--electric), var(--electric-glow));

--shadow-glow: 0 20px 60px -20px color-mix(in oklab, var(--electric) 55%, transparent);
```

Helper classes built on these (rename freely in your stack):

| Class | Effect |
|---|---|
| `.bg-hero` | `background: var(--gradient-hero)` |
| `.bg-electric-gradient` | `background: var(--gradient-accent)` |
| `.shadow-glow` | `box-shadow: var(--shadow-glow)` |
| `.text-gradient` | accent gradient + `background-clip: text; color: transparent` |

### Radius scale

`--radius: 0.75rem` (12px) is the base.

| Name | Value |
|---|---|
| sm | 8px (`radius - 4`) |
| md | 10px (`radius - 2`) |
| lg | 12px |
| xl | 16px (`radius + 4`) |
| Cards | 16px (`rounded-2xl`) |
| Map panel | 24px (`rounded-3xl`) |
| Pills / badges | fully rounded |

---

## 3. Typography

Two families, both Google Fonts, loaded via `<link>` in the document head:

- **Display** — `Space Grotesk` (600/700). All `h1–h4`, big numerals, brand wordmark.
  Always with `letter-spacing: -0.02em`.
- **Body** — `Inter` (400/500/600). Paragraphs, labels, buttons, nav.

`-webkit-font-smoothing: antialiased` on `body`.

| Role | Size (mobile → desktop) | Weight | Notes |
|---|---|---|---|
| Hero H1 | 48px → 72px | 700 | `line-height: 1.05`, `tracking: -0.02em` |
| Section H2 | 36px → 48px | 700 | max-width ~36rem |
| Card H3 | 20px | 700 | — |
| Eyebrow label | 12px | 600 | uppercase, `letter-spacing: 0.1em`, electric green |
| Stat numeral | 20–24px | 700 | display font |
| Body / lead | 16–18px | 400 | `--muted-foreground` |
| Small meta | 12–14px | 400–500 | `--muted-foreground` |

---

## 4. Layout system

- **Container:** `max-width: 80rem` (1280px), horizontally centered.
- **Gutters:** `padding-inline: 1.5rem` (24px) at every breakpoint.
- **Section rhythm:** `padding-block: 6rem` (96px) for Charger Map and Deals.
  Hero: `padding-top: 8rem → 10rem`, `padding-bottom: 5rem → 8rem`, `min-height: 90vh`.
- **Footer:** `padding-block: 2.5rem`.
- **Breakpoint:** a single `md` breakpoint at **768px** drives every responsive change
  (nav links appear, grids go multi-column, section headers become side-by-side rows).
- **Section header pattern** (used by Charger Map and Deals): flex column on mobile,
  `row / items-end / justify-between` at `md`, `gap: 1.5rem`, `margin-bottom: 3rem`.
  Left = eyebrow + H2; right = supporting paragraph or a text link.
- **Dividers:** sections are separated by `border-top: 1px solid var(--border)` (Deals
  uses 50% opacity border).

---

## 5. Component specs

### 5.1 Navbar

![Navbar](images/navbar.png)

- **Position:** `fixed`, full width, `z-index: 50`.
- **Surface:** `background: rgba(255,255,255,0.9)`, `backdrop-filter: blur(24px)`,
  `border-bottom: 1px solid rgba(0,0,0,0.1)`.
- **Inner:** container, `display: flex; align-items: center; justify-content: space-between;`
  `padding: 1rem 1.5rem`.
- **Brand:** 32×32 rounded-lg tile filled with `--gradient-accent` + `--shadow-glow`,
  containing a white bolt icon (16px, stroke 2.5). Wordmark "VoltMarket" in display font,
  700, 18px, neutral-900.
- **Links:** `Shop · Chargers · Deals · About`, 14px, neutral-600, `gap: 2rem`,
  hover → neutral-900. Hidden below 768px.
- **CTA:** "Sign in" pill — neutral-900 bg, white text, 14px/500, `padding: .5rem 1rem`,
  `radius: 8px`, hover → neutral-700.
- Because the navbar is fixed and light, the hero must reserve top space (see below)
  and must not place light text under it.

### 5.2 Hero

![Hero](images/hero.png)

- **Structure:** `position: relative; overflow: hidden;` full-bleed section,
  `min-height: 90vh`, contents vertically centered.
- **Background image:** absolutely positioned `<img>` covering the whole section
  (`inset: 0; width/height: 100%; object-fit: cover`). Asset: dark studio side profile
  of an EV, subject weighted to the right so the left third stays clean for copy.
- **Overlay stack** (two layers, both absolute, above the image, below content):
  1. `linear-gradient(to right, var(--background), var(--background)/85%, var(--background)/20%)`
     — keeps the left column readable.
  2. `--gradient-hero` at `opacity: 0.6`, `mix-blend-mode: multiply` — brand tint.
- **Content column:** `max-width: 42rem`, left aligned inside the container.
  - Eyebrow pill: `card/60%` bg, 1px border, backdrop blur, 12px muted text,
    sparkle icon in electric green. `padding: .25rem .75rem`, fully rounded.
  - H1: two lines, the word "current" wrapped in `.text-gradient`.
  - Lead paragraph: 18px, muted, `max-width: 32rem`, `margin-top: 1.5rem`.
  - **CTA row** (`margin-top: 2.5rem`, `gap: 1rem`, wraps):
    - Primary "Shop New EVs" → `--gradient-accent` fill, `--primary-foreground` text,
      600 weight, `padding: .875rem 1.5rem`, `radius: 12px`, `--shadow-glow`,
      hover `opacity: .95`. Trailing arrow icon translates `4px` on hover.
    - Secondary "Shop Used EVs" → 1px border, `card/40%` bg + backdrop blur,
      hover: border → electric, bg → `card/70%`. Same size/radius/arrow behavior.
  - **Stat row** (`margin-top: 3rem`, `gap: 2rem`): three items, display-font 24px/700
    numeral over a 14px muted label. Content: `12k+ Vehicles listed`,
    `220k Charger points`, `4.9★ Buyer rating`.

### 5.3 Charger Map

![Charger map](images/charger-map.png)

Hover state on a pin:

![Charger map tooltip](images/charger-map-tooltip.png)

- Section header: eyebrow `⚡ GLOBAL CHARGING NETWORK`, H2
  "Charge anywhere. **Never range-anxious.**" (second sentence in `.text-gradient`),
  right-side paragraph `max-width: 24rem`.
- **Panel:** `radius: 24px`, 1px border, `--card` bg, `--shadow-glow`, `overflow: hidden`.
- **Map plate:** `aspect-ratio: 16 / 8`, background =
  ```css
  radial-gradient(circle at 30% 30%, oklch(0.25 0.06 200 / .6), transparent 50%),
  radial-gradient(circle at 70% 60%, oklch(0.22 0.08 145 / .5), transparent 50%),
  linear-gradient(180deg, oklch(0.17 0.02 250), oklch(0.13 0.02 250));
  ```
- **Grid + continents:** one inline SVG at `viewBox="0 0 1000 500"`, `opacity: 0.3`.
  A 40×40 `<pattern>` grid stroked `foreground / 8%`, plus six hand-drawn continent
  paths filled `electric / 8%` and stroked `electric / 40%`, stroke-width `0.5`.
  This is decorative — swap for a real GeoJSON map if you want accuracy.
- **Pins:** absolutely positioned with percentage `top`/`left`, translated `-50%,-50%`.
  Each pin = a 12px electric-green dot with `--shadow-glow`, plus a duplicate dot behind
  it running a `ping` animation (scale to 2, fade to 0, 1s, `cubic-bezier(0,0,.2,1)`,
  infinite) at `opacity: .75`.
- **Tooltip:** hidden by default (`opacity: 0`), fades in on pin hover. `--card` bg,
  1px border, `radius: 8px`, `padding: .375rem .75rem`, 12px text; bold city name over a
  muted "N stations" line. Positioned `left: 1rem`, vertically centered, `white-space: nowrap`.
- **Pin data shape:**
  ```ts
  type Pin = { top: string; left: string; label: string; count: string }
  ```
  Ten seeded cities: San Francisco 1,240 · Chicago 890 · New York 2,110 · London 3,450 ·
  Berlin 2,880 · Istanbul 540 · Shanghai 5,120 · Tokyo 3,200 · Sydney 1,020 · São Paulo 760.
- **Stat strip:** inside the same panel, below the map. 2 columns → 4 at `md`, joined by
  `gap: 1px` over a `--border` background so the gaps read as hairline dividers; each cell
  is `--card` with `padding: 1.25rem`, a green map-pin icon, display-font value, muted label.
  Values: `220,481 Stations · 68 Countries · 22 min Avg. charge time · 99.7% Uptime`.

### 5.4 Deals

![Deals section](images/deals.png)

Single card:

![Deal card](images/deal-card.png)

- Section sits on `--background` with a `border-top` at 50% border opacity.
- Header: eyebrow `🔥 HOT DEALS & PICKS`, H2 "This week's **top volts**." with the last
  two words gradient-filled; right side a green text link "Browse all listings →".
- **Grid:** 1 column → 3 at `md`, `gap: 1.5rem`.
- **Card:** `radius: 16px`, 1px border, `--card` bg, `overflow: hidden`.
  Hover: border → electric, `translateY(-4px)`, `--shadow-glow`. Transition `all`.
  - **Media:** `aspect-ratio: 4 / 3`, `--secondary` placeholder bg, image `object-fit: cover`,
    `loading="lazy"`. Hover: `scale(1.05)` over `500ms`.
  - **Badge:** absolute `top/left: 1rem`, gradient fill, `--primary-foreground` text,
    12px/600, `padding: .25rem .625rem`, fully rounded. Values: `Hot Deal`,
    `Editor's Pick`, `Best Value`.
  - **Body** (`padding: 1.5rem`): title row = H3 left, rating right (filled green star +
    number, 14px muted). Then a 14px muted subtitle (`2024 · New`, `2023 · Used · 12k mi`).
  - **Spec row** (`margin-top: 1rem`, `gap: 1rem`, 12px muted): battery icon + range,
    gauge icon + 0-60 time. Icons 14px electric green.
  - **Price row:** separated by `margin-top/padding-top: 1.25rem` + `border-top`.
    Left = display-font 24px/700 price over a 12px muted `line-through` original price.
    Right = "View" button, `--secondary` bg, 14px/600, `padding: .5rem 1rem`, `radius: 8px`,
    hover → electric bg with `--primary-foreground` text.
- **Card data shape:**
  ```ts
  type Deal = {
    img: string; tag: string; name: string; year: string;
    price: string; original: string; range: string; speed: string; rating: number;
  }
  ```
  Seeded: Aurora X5 SUV $46,900 (was $52,400, 412 mi, 3.8s, 4.9) ·
  Volt Sedan GT $38,200 (was $44,900, 358 mi, 2.9s, 4.8) ·
  Micro Bolt EV $19,750 (was $23,000, 220 mi, 6.5s, 4.7).

### 5.5 Footer

![Footer](images/footer.png)

- `border-top: 1px solid var(--border)`, `padding: 2.5rem 1.5rem`, 14px muted text.
- Container: column on mobile, `row / justify-between / items-center` at `md`, `gap: 1rem`.
- Left: `© {year} VoltMarket. Powering the switch.`
- Right: `Privacy · Terms · Contact`, `gap: 1.5rem`, hover → `--foreground`.

---

## 6. Interaction & motion

| Element | Trigger | Behavior |
|---|---|---|
| Hero CTA arrow | hover on button | `translateX(4px)`, default ~150ms ease |
| Hero secondary CTA | hover | border → electric, bg `card/40%` → `card/70%` |
| Charger pin | always | `ping`: scale 1→2 + opacity .75→0, 1s, `cubic-bezier(0,0,.2,1)`, infinite |
| Charger tooltip | hover on pin | opacity 0→1, ~150ms |
| Deal card | hover | `translateY(-4px)` + electric border + glow shadow |
| Deal image | hover on card | `scale(1.05)`, 500ms |
| "View" button | hover | `--secondary` → electric fill, dark text |
| Nav links / footer links | hover | color shift only |

No scroll-triggered animation, no JS-driven motion — everything is CSS transitions and
one keyframe animation. Respect `prefers-reduced-motion` by disabling the pin ping and
the card lift.

---

## 7. Assets

Located in `src/assets/` in the reference build; copy into your own asset pipeline.

| File | Used by | Notes |
|---|---|---|
| `hero-ev.jpg` | Hero background | Dark studio EV profile, subject right-weighted. Not lazy-loaded (LCP). Alt: "Sleek electric vehicle". |
| `ev-1.jpg` | Deal card — Aurora X5 SUV | 1024×1024, lazy-loaded, alt = vehicle name |
| `ev-2.jpg` | Deal card — Volt Sedan GT | same |
| `ev-3.jpg` | Deal card — Micro Bolt EV | same |

Deal images declare intrinsic `width`/`height` (1024×1024) to avoid layout shift, and are
cropped to 4:3 by the card's aspect-ratio container.

Icons: [lucide](https://lucide.dev) — `Zap`, `Sparkles`, `ArrowRight`, `MapPin`, `Flame`,
`Battery`, `Gauge`, `Star`. Default stroke 2 (brand bolt uses 2.5); sizes 14–20px.

---

## 8. Reimplementation notes

- **Token-first.** Define the palette once as CSS custom properties and reference them
  everywhere. Do not hardcode `#fff` / `#000` in components — the only literal-color
  exception in this design is the navbar's white surface, and even that is worth
  promoting to a `--nav-surface` token if you plan a light mode.
- **Dark is the baseline**, not a variant. There is no light theme; if you add one, the
  hero overlay gradients and the map plate need separate values.
- **One accent, used sparingly.** Green/cyan appears only on: brand tile, eyebrow labels,
  gradient words in headings, primary CTA, icons, charger pins, hover borders. Everything
  else is grayscale-blue. Resist adding a second accent hue.
- **Accessibility:** single `<h1>` (hero); sections are semantic `<section>` with `id`
  anchors matching the nav links; footer/nav are landmarks. Charger pin tooltips are
  hover-only in the reference build — add focus/keyboard handling (`tabindex`, `:focus-visible`)
  if the data is meaningful rather than decorative. Verify contrast for muted text
  (`#8F9AA4` on `#040A11` ≈ 7.5:1, passes) and for green-on-dark small text.
- **SEO:** title under 60 chars with the primary keyword, meta description under 160,
  `og:title` / `og:description` / `og:type=website` / `twitter:card=summary_large_image`.
  Add an absolute `og:image` URL once the hero is hosted.
- **Performance:** hero image is the LCP element — preload it and serve a modern format;
  everything below the fold lazy-loads. There is no client-side data fetching on this page.
