# Palette Generation

Rules for generating new palettes algorithmically when the user asks for variations ("more like #3", "more minimal", "cooler") or when the curated recipes don't have enough matches.

All generation happens in **OKLCH** color space — it's perceptually uniform, so equal L steps look like equal brightness steps, and hue shifts preserve saturation correctly across the spectrum. HSL does not do this; do not use HSL for derivations.

## OKLCH cheat sheet

`oklch(L C H)` where:

- **L (Lightness)**: 0 (black) to 1 (white). Linear brightness. A value of 0.50 is middle gray.
- **C (Chroma)**: 0 (gray) to ~0.37 (most saturated). Think of it as "how colorful."
- **H (Hue)**: 0 to 360 degrees. 0/360 = red, 60 = yellow, 120 = green, 180 = cyan, 240 = blue, 300 = magenta.

CSS syntax: `oklch(0.72 0.17 250)` — lightness 0.72, chroma 0.17, hue 250°.

## Hue → mood mapping

When you need to pick a **primary hue** from the user's mood + category, use these ranges. If the user has two moods, blend the ranges (pick the middle).

| Mood / feel | Hue range | Notes |
|---|---|---|
| trustworthy, technical, calm | 220–260 (blue) | The safest hue for money and tools |
| growth, success, natural, patient | 140–170 (green/teal) | Defi, staking, sustainability |
| warm, energetic, friendly, human | 20–60 (orange/amber) | Consumer, social, lifestyle |
| alert, urgent, bold, loud | 5–25 (red) | Memecoin, action, critical infra |
| premium, mystery, creative, luxe | 280–320 (violet/purple) | Ai, nft, premium |
| fresh, analytical, clean | 180–210 (cyan) | Data, realtime, modern |
| playful, bright, electric | 50–100 (yellow) | Memecoin, alerts, weird |
| rich, decadent, aged | 60–90 (gold) | NFT, auction, premium warm |
| loud, feminine, fun | 320–350 (pink/magenta) | Dating, community, memes |
| neutral | none (C ≤ 0.02) | Minimal, grayscale-forward |

For two-mood combos, pick the intersection. "technical + warm" → narrow a blue toward 230 and pair with a warm secondary accent around 40.

## Chroma guidelines by mood

Chroma is "how vivid." Higher C = louder. Match to mood:

| Mood | Primary C range |
|---|---|
| minimal | 0.00–0.05 (near-gray or monochrome) |
| serious, premium | 0.10–0.16 (restrained, confident) |
| calm, trustworthy | 0.12–0.18 (visible but not loud) |
| bold, energetic | 0.18–0.24 (saturated, confident) |
| playful, electric, weird | 0.22–0.30 (maximum expressiveness) |

Going above 0.28 often produces out-of-gamut or clipping colors — verify the hex rendering.

## The 5-seed derivation pattern

Given a **primary hue** (H) and a **mood chroma** (C), derive the 5 seeds this way:

### Dark mode seeds

| Seed | L | C | H |
|---|---|---|---|
| bg-base | 0.12 ± 0.02 | same H, C = 0.01–0.03 (slight tint) | H |
| bg-elevated | 0.17 ± 0.02 | same H, C = 0.02–0.04 | H |
| primary | 0.68–0.78 | mood C | H |
| primary-soft | primary L + 0.12, C − 0.06 | same H | H |
| fg-base | 0.96–0.98 | C = 0.005–0.02 (tiny H influence) | H |

Rule of thumb: `bg-base` and `bg-elevated` stay close in L (≤0.06 apart) so the elevation is felt but not dramatic. `primary` must be light enough (L ≥ 0.65) to pass 4.5:1 against `bg-base` at L ≤ 0.15.

### Light mode seeds (same H, flipped L curve)

| Seed | L | C | H |
|---|---|---|---|
| bg-base | 0.97–0.99 | same H, C = 0.005–0.02 | H |
| bg-elevated | 1.00 | 0 | — |
| primary | 0.45–0.58 | mood C | H |
| primary-soft | primary L + 0.15, C − 0.04 | same H | H |
| fg-base | 0.15–0.22 | same H, C = 0.01–0.03 | H |

In light mode, `primary` must be darker (L ≤ 0.55) to pass 4.5:1 against near-white `bg-base`. This is the single most common failure mode: picking a mid-L primary that looks good in dark mode but fails contrast in light mode. Derive light mode independently — don't try to invert.

## Secondary / accent hue derivation

If the palette needs a second accent hue (e.g., for success/warning states or a complementary brand color), use harmonic relationships:

| Relationship | Hue offset | Feel |
|---|---|---|
| Analogous | ±30° | Gentle, unified, one-note |
| Split-complement | ±150° | Dynamic, balanced |
| Complementary | 180° | High contrast, dramatic |
| Triadic | ±120° | Vibrant, energetic |
| Tetradic | ±90° + 180° | Rich, complex (use sparingly) |

For most brand palettes, **analogous or split-complement** feel more designed than straight complementary. Straight complementary (180°) can feel amateurish or "Christmas-y" when both colors are saturated.

## Variation rules (for the regenerate loop)

When the user says "more like N" or "tweak N", **do not** throw out palette N. Generate 6 variations that all inherit something from it.

### "more like N" (no adjective)

Generate 6 palettes that share N's primary hue ±10° and N's bg-base L ±0.02, but vary:

1. Same H, ±5% chroma (one subtler, one bolder)
2. Same H, ±0.03 primary L (one darker, one lighter)
3. Analogous hue shift (+30°)
4. Analogous hue shift (−30°)
5. Same H, different bg-elevated L (more or less contrast)
6. Same H, warmer fg-base (+5° toward 40)

### "more like N, but cooler"

All variations shift hue toward 200–240 range.

### "more like N, but warmer"

All variations shift hue toward 20–60 range.

### "more like N, but bolder"

All variations increase primary C by 0.04–0.06, maybe increase primary L for punch.

### "more like N, but softer"

All variations decrease primary C by 0.04–0.06, lower contrast between bg-base and bg-elevated.

### "more like N, but darker"

All variations decrease all L values by 0.03–0.05, but keep contrast ratios.

### "more like N, but more minimal"

All variations drop primary C to near-zero (0.00–0.06), become grayscale or near-grayscale. Lean on elevation and typography instead of color.

## "more <adjective>" (no reference palette)

Regenerate fresh, but add the adjective to the mood. Go through the hue/chroma mapping again with the extended mood list.

## Contrast check after generation

**Every** generated palette must pass AA contrast. After computing the 5 seeds, run through `contrast-rules.md`:

- `fg-base` vs `bg-base`: ≥ 4.5:1
- `fg-base` vs `bg-elevated`: ≥ 4.5:1
- `primary` vs `bg-base`: ≥ 3.0:1 (it's large/UI, not body)
- `primary-foreground` (derived in shadcn mapping) vs `primary`: ≥ 4.5:1

If any fails, adjust the L of the failing component by ±0.05 and re-check. Repeat up to 3 times. If it still fails, regenerate the palette entirely.

## OKLCH → hex conversion notes

Modern browsers support `oklch()` in CSS directly, so you can write the tokens as `oklch(...)` and skip hex entirely for shadcn. But for the HTML preview and the `brand.md` file, hex is still useful as a portable representation.

For conversion, use these properties:
- Pure grays: C = 0, H irrelevant. `oklch(0.50 0 0)` → `#777777` (approx)
- Saturated colors: use a well-tested converter. Node `culori` package, or the CSS `color()` function, or any standard tool.

When in doubt, verify by rendering the palette in a browser (the HTML preview step does this anyway).

## Example: generating a "defi + technical + bold" palette

1. **Category:** defi → lean toward trustworthy hues
2. **Mood:** technical + bold → blue range (220–260) with higher chroma
3. **Pick primary H:** 245 (deep blue with slight violet)
4. **Pick primary C:** 0.20 (bold, but still restrained for money)
5. **Derive dark mode seeds:**
   - bg-base: `oklch(0.12 0.02 245)` (near-black with blue tint)
   - bg-elevated: `oklch(0.17 0.025 245)`
   - primary: `oklch(0.72 0.20 245)` (bright, saturated blue)
   - primary-soft: `oklch(0.84 0.14 245)`
   - fg-base: `oklch(0.96 0.01 245)` (near-white, tiny blue cast)
6. **Derive light mode seeds:**
   - bg-base: `oklch(0.98 0.01 245)`
   - bg-elevated: `oklch(1 0 0)`
   - primary: `oklch(0.52 0.20 245)` (darker, same saturation)
   - primary-soft: `oklch(0.72 0.14 245)`
   - fg-base: `oklch(0.18 0.02 245)`
7. **Check contrast:** verify all pairs. Dark mode: primary L=0.72 vs bg-base L=0.12 → ~9:1, easily passes. Light mode: primary L=0.52 vs bg-base L=0.98 → ~7:1, passes.
8. **Name it:** "Azure Protocol" or similar — two-word, memorable, category-appropriate.

## When to generate vs when to use the library

- **User is in step 2 of the workflow** (first showing) → 3 from library + 3 generated.
- **User said "more like N"** → 6 generated, all anchored on N.
- **User said "more <adjective>"** → 3 from library (filtered by new mood) + 3 generated.
- **User said "none" or reset** → back to 3 + 3 with the new mood answers.
- **Library has fewer than 3 matches for the mood combo** → supplement with generated palettes until you have 3.
