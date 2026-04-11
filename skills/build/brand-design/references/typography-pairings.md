# Typography Pairings

Font pairs that match the moods from `palette-recipes.md`. **All fonts in this file are from [Google Fonts](https://fonts.google.com)** — free, open-source, served via `next/font/google` with zero layout shift. No paid licenses. No system stacks. Everything is production-ready and self-hosted after Next.js's build step.

## How the skill uses this file

After the user picks a palette in step 5, the skill shows **6 font-pair candidates** as a visual HTML preview in the browser (see `typography-preview.md` for the preview template). Each candidate renders sample text in the user's already-chosen brand palette, so they see exactly how the font looks on their actual theme.

The user picks one of the 6 (or says "skip" — see the default fallback section below), and the skill wires the chosen pair into `app/layout.tsx` via `next/font/google`.

### Why 6 and not 2

Typography is at least as consequential as color — a great palette with the wrong font pair feels wrong. Showing only 2 candidates forces users into a false binary. Showing 6 gives real comparison range without drowning them. The 6 are picked as: 1 primary mood match, 1 adjacent mood match, and 4 complementary options from the wider pool — so the user sees both "safe choices for my mood" and "what if I went a different direction."

## The pairs

Each pair has a **display font** (for headings and hero copy), a **body font** (for UI and reading text), and usually a **mono font** (for numbers, code, addresses — especially important for Solana apps).

### Pair A — "Inter + JetBrains Mono"
**Mood fit:** technical · serious · minimal · calm
**Feel:** Neutral, trusted, engineering-forward. The default for 90% of dev-tools and dashboards for a reason.

- Display & body: **Inter**
- Mono: **JetBrains Mono**

```ts
import { Inter, JetBrains_Mono } from "next/font/google";

const sans = Inter({ subsets: ["latin"], variable: "--font-sans" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });
```

```tsx
<html lang="en" className={`${sans.variable} ${mono.variable}`}>
  <body className="font-sans antialiased">{children}</body>
</html>
```

---

### Pair B — "Geist Sans + Geist Mono"
**Mood fit:** technical · minimal · serious · premium
**Feel:** Modern, slightly warmer than Inter, very clean geometry. Great for clean dashboards and devtools that want to feel a bit more distinctive.

- Display & body: **Geist**
- Mono: **Geist Mono**

```ts
import { Geist, Geist_Mono } from "next/font/google";

const sans = Geist({ subsets: ["latin"], variable: "--font-sans" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" });
```

---

### Pair C — "Instrument Serif + Inter + JetBrains Mono"
**Mood fit:** premium · warm · serious · calm
**Feel:** Editorial. A serif headline atop a clean sans body gives immediate credibility. Think editorial magazine meets SaaS.

- Display: **Instrument Serif** (use for H1/hero only)
- Body: **Inter**
- Mono: **JetBrains Mono**

```ts
import { Instrument_Serif, Inter, JetBrains_Mono } from "next/font/google";

const serif = Instrument_Serif({ weight: "400", subsets: ["latin"], variable: "--font-serif" });
const sans = Inter({ subsets: ["latin"], variable: "--font-sans" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });
```

Usage note: apply the serif only to H1/hero headings via `font-serif`. Everything else uses the sans.

---

### Pair D — "DM Sans + DM Mono"
**Mood fit:** warm · playful · calm · premium
**Feel:** Friendly, rounded, humane. Softens the interface without looking unprofessional.

- Display & body: **DM Sans**
- Mono: **DM Mono**

```ts
import { DM_Sans, DM_Mono } from "next/font/google";

const sans = DM_Sans({ subsets: ["latin"], variable: "--font-sans" });
const mono = DM_Mono({ weight: ["400", "500"], subsets: ["latin"], variable: "--font-mono" });
```

---

### Pair E — "Space Grotesk + Space Mono"
**Mood fit:** bold · playful · technical · weird
**Feel:** Distinctive, slightly quirky. Has personality without being silly. Pairs well with memecoin and experimental projects.

- Display & body: **Space Grotesk**
- Mono: **Space Mono**

```ts
import { Space_Grotesk, Space_Mono } from "next/font/google";

const sans = Space_Grotesk({ subsets: ["latin"], variable: "--font-sans" });
const mono = Space_Mono({ weight: ["400", "700"], subsets: ["latin"], variable: "--font-mono" });
```

---

### Pair F — "Fraunces + Inter + IBM Plex Mono"
**Mood fit:** warm · premium · playful · creative
**Feel:** Expressive serif with optical sizing. Beautiful for creative and NFT projects that want character. Inter keeps the body readable.

- Display: **Fraunces** (variable, use for hero headings)
- Body: **Inter**
- Mono: **IBM Plex Mono**

```ts
import { Fraunces, Inter, IBM_Plex_Mono } from "next/font/google";

const serif = Fraunces({ subsets: ["latin"], variable: "--font-serif" });
const sans = Inter({ subsets: ["latin"], variable: "--font-sans" });
const mono = IBM_Plex_Mono({ weight: ["400", "500"], subsets: ["latin"], variable: "--font-mono" });
```

---

### Pair G — "IBM Plex Sans + IBM Plex Mono"
**Mood fit:** technical · serious · premium
**Feel:** Corporate-tech. More personality than Inter without losing credibility. Great for enterprise-adjacent tools.

- Display & body: **IBM Plex Sans**
- Mono: **IBM Plex Mono**

```ts
import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";

const sans = IBM_Plex_Sans({ weight: ["400", "500", "600"], subsets: ["latin"], variable: "--font-sans" });
const mono = IBM_Plex_Mono({ weight: ["400", "500"], subsets: ["latin"], variable: "--font-mono" });
```

---

### Pair H — "Manrope + JetBrains Mono"
**Mood fit:** minimal · premium · calm · modern
**Feel:** Sharp geometric sans with rounded terminals. Modern SaaS without the Inter cliché.

- Display & body: **Manrope**
- Mono: **JetBrains Mono**

```ts
import { Manrope, JetBrains_Mono } from "next/font/google";

const sans = Manrope({ subsets: ["latin"], variable: "--font-sans" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });
```

---

### Pair I — "Plus Jakarta Sans + JetBrains Mono"
**Mood fit:** playful · warm · bold · friendly
**Feel:** Approachable, rounded, crypto-native. Popular in consumer crypto apps.

- Display & body: **Plus Jakarta Sans**
- Mono: **JetBrains Mono**

```ts
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";

const sans = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-sans" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });
```

---

## Mood → 6 candidates mapping

When the skill presents 6 candidates, use this table. The first column is the strongest mood-match, the next three are adjacent good fits, and the last two are "different direction" options so the user sees real contrast.

| Mood | Slot 1 (primary) | Slot 2 | Slot 3 | Slot 4 | Slot 5 | Slot 6 |
|---|---|---|---|---|---|---|
| **minimal** | A (Inter + JBM) | B (Geist + Geist Mono) | H (Manrope + JBM) | G (Plex Sans + Plex Mono) | C (Instrument Serif + Inter + JBM) | D (DM Sans + DM Mono) |
| **bold** | E (Space Grotesk + Space Mono) | I (Plus Jakarta + JBM) | B (Geist + Geist Mono) | D (DM Sans + DM Mono) | F (Fraunces + Inter + Plex Mono) | A (Inter + JBM) |
| **warm** | D (DM Sans + DM Mono) | F (Fraunces + Inter + Plex Mono) | I (Plus Jakarta + JBM) | C (Instrument Serif + Inter + JBM) | A (Inter + JBM) | E (Space Grotesk + Space Mono) |
| **calm** | A (Inter + JBM) | D (DM Sans + DM Mono) | H (Manrope + JBM) | B (Geist + Geist Mono) | G (Plex Sans + Plex Mono) | I (Plus Jakarta + JBM) |
| **playful** | E (Space Grotesk + Space Mono) | I (Plus Jakarta + JBM) | D (DM Sans + DM Mono) | F (Fraunces + Inter + Plex Mono) | B (Geist + Geist Mono) | A (Inter + JBM) |
| **serious** | A (Inter + JBM) | G (Plex Sans + Plex Mono) | B (Geist + Geist Mono) | H (Manrope + JBM) | C (Instrument Serif + Inter + JBM) | D (DM Sans + DM Mono) |
| **technical** | B (Geist + Geist Mono) | A (Inter + JBM) | G (Plex Sans + Plex Mono) | H (Manrope + JBM) | E (Space Grotesk + Space Mono) | D (DM Sans + DM Mono) |
| **premium** | C (Instrument Serif + Inter + JBM) | H (Manrope + JBM) | A (Inter + JBM) | F (Fraunces + Inter + Plex Mono) | G (Plex Sans + Plex Mono) | B (Geist + Geist Mono) |
| **electric** | E (Space Grotesk + Space Mono) | I (Plus Jakarta + JBM) | B (Geist + Geist Mono) | F (Fraunces + Inter + Plex Mono) | A (Inter + JBM) | D (DM Sans + DM Mono) |
| **weird** | E (Space Grotesk + Space Mono) | F (Fraunces + Inter + Plex Mono) | I (Plus Jakarta + JBM) | D (DM Sans + DM Mono) | C (Instrument Serif + Inter + JBM) | A (Inter + JBM) |

If the user picked 2 moods (e.g., `technical · serious`), blend: take slot 1 from each, then fill the remaining 4 from the union of slots 2–6 across both moods, deduplicated.

**The default fallback (Pair A — Inter + JBM) is always in the list** — it appears in every mood's 6 candidates. This is intentional: even if the user doesn't know what they want, Inter is always there as the safe bet.

## Tailwind config integration

After wiring `next/font`, the skill also needs to tell Tailwind to use the CSS variables. For Tailwind v4 (the default in new projects):

```css
/* app/globals.css */
@theme {
  --font-sans: var(--font-sans);
  --font-mono: var(--font-mono);
  --font-serif: var(--font-serif); /* only if a serif display font was chosen */
}
```

For Tailwind v3:

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
        serif: ["var(--font-serif)", "ui-serif", "Georgia", "serif"],
      },
    },
  },
};
```

After this, `font-sans`, `font-mono`, and (if present) `font-serif` utilities work throughout the app.

## Type scale recommendation

A single type scale that works with any of the above pairs. The skill writes this to `brand.md` as guidance.

| Role | Tailwind class | Pixel (16 base) | Use |
|---|---|---|---|
| Display | `text-5xl font-semibold tracking-tight` | 48 | Hero only, one per page |
| H1 (page) | `text-3xl font-semibold tracking-tight` | 30 | Page title |
| H2 (section) | `text-xl font-semibold` | 20 | Section breaks |
| H3 (subsection) | `text-base font-medium` | 16 | Card titles |
| Body | `text-sm` | 14 | Default UI text |
| Reading | `text-base leading-7` | 16 | Long-form content |
| Small | `text-xs text-muted-foreground` | 12 | Meta, timestamps |
| Mono | `font-mono tabular-nums` | — | Numbers, addresses, code |

## A note on performance

`next/font/google` inlines font files at build time — no FOUT, no runtime fetch, no layout shift. That's why we use it instead of `<link>` tags. The user doesn't need to think about it, but it's worth writing into `brand.md` so they know not to swap it out for a naive `<link>` later.

## The default — Inter + JetBrains Mono

If the user picks "neither", says "skip", ignores the question, or gives an unclear answer, **default to Pair A — Inter + JetBrains Mono**. Do not fall back to a system stack. Do not fall back to no font.

Why Inter as the default:
- It's free on Google Fonts, served instantly by `next/font/google`
- It works with every palette mood in this file — neutral enough to be invisible when it needs to be
- Variable font, so you get every weight for one download
- It's the single most battle-tested UI font in modern web apps
- JetBrains Mono pairs with it cleanly for numbers, addresses, and code

Wire it exactly as Pair A's snippet describes, tell the user in conversation:

> No custom typography picked — defaulting to **Inter + JetBrains Mono**. You can change this later by re-running `brand-design`.

Then continue to step 7 (gradients). The user never ends up with zero typography set.
