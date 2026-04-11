# Contrast Rules

Every generated palette must pass WCAG AA on every foreground/background pair that will appear on screen. No exceptions. A palette that fails contrast is not shown to the user — it's either auto-fixed or dropped and regenerated.

## The targets

| Pair type | Minimum ratio | Rule |
|---|---|---|
| Body text on its background | **4.5:1** | Small text needs the full ratio |
| Large text (≥18 px, or ≥14 px bold) | **3.0:1** | Slightly looser |
| UI icons and meaningful graphics | **3.0:1** | Same as large text |
| Focus rings against adjacent bg | **3.0:1** | So they're visible |
| Disabled text | No requirement | But readable-ish is still nicer |

## Which pairs to check for a shadcn palette

After deriving the full token set, verify these pairs in both light and dark mode:

| Foreground | Background | Min ratio | Why |
|---|---|---|---|
| `--foreground` | `--background` | 4.5:1 | Body text on page |
| `--foreground` | `--card` | 4.5:1 | Body text on card |
| `--foreground` | `--popover` | 4.5:1 | Body text in dropdown |
| `--foreground` | `--muted` | 4.5:1 | Text on muted fill |
| `--muted-foreground` | `--background` | 4.5:1 | Helper/placeholder text |
| `--muted-foreground` | `--card` | 4.5:1 | Helper text inside cards |
| `--primary-foreground` | `--primary` | 4.5:1 | Button label on primary |
| `--secondary-foreground` | `--secondary` | 4.5:1 | Button label on secondary |
| `--accent-foreground` | `--accent` | 4.5:1 | Highlighted menu item |
| `--destructive-foreground` | `--destructive` | 4.5:1 | Error button label |
| `--primary` | `--background` | 3.0:1 | Primary text/link on page |
| `--ring` | `--background` | 3.0:1 | Focus ring visibility |
| `--border` | `--background` | 1.5:1 | Loosest — borders just need to be visible |

A palette is valid only if **every pair in the above table** passes in both light and dark mode.

## Calculating contrast

WCAG uses the luminance-based formula:

```
contrast = (L_lighter + 0.05) / (L_darker + 0.05)
```

where L is the relative luminance of each color in linear sRGB. The ratio ranges from 1 (identical) to 21 (black on white).

**In practice**, don't hand-calculate. Either:

1. Use Claude's internal reasoning to estimate (OKLCH L gives a close approximation: a pair with ΔL ≥ 0.45 almost always passes 4.5:1 on neutral hues; tint-heavy pairs need ΔL ≥ 0.55).
2. If in doubt, verify in the HTML preview step — the browser renders the actual computed color and the user's eye is the final check.

### Quick OKLCH-based heuristics

These are not substitutes for a real calculation, but they get you close:

| Situation | Passes 4.5:1 if… |
|---|---|
| Near-neutral pair (both C ≤ 0.05) | `|L_fg − L_bg|` ≥ 0.50 |
| Moderate-chroma pair (one C 0.05–0.15) | `|L_fg − L_bg|` ≥ 0.55 |
| High-chroma pair (one C > 0.15) | `|L_fg − L_bg|` ≥ 0.60 |
| Warm-on-warm (both in 0–90 hue) | Add 0.05 margin |
| Cool-on-cool (both in 180–270 hue) | Default margin is usually fine |

## Auto-adjust procedure

When a pair fails, do not reject the palette immediately. First, try to nudge.

### Step 1 — Identify the failing pair

Which pair failed, and by how much? If it's within 10% of passing, small adjustments usually work.

### Step 2 — Choose the variable

Which side is easier to adjust without breaking other pairs?

- **If the foreground is muted or soft text** (`--muted-foreground`), adjust its L first — it doesn't cascade to other pairs.
- **If the foreground is on a colored background** (`--primary-foreground` on `--primary`), adjust the foreground L (push it closer to pure white or pure black).
- **If the background is `--background` itself**, be careful — every pair depends on it. Adjust the foreground instead.

### Step 3 — Nudge

Move the chosen L by 0.03–0.05 in the direction that increases contrast:

- Foreground too dark, bg also dark → lighten foreground
- Foreground too light, bg also light → darken foreground
- Bg is the problem and it's shared → do not touch it; fix all foregrounds instead

### Step 4 — Re-check

Re-verify the failing pair and any pair that shares the adjusted token. Repeat up to **3 times**.

### Step 5 — Give up and regenerate

If 3 rounds didn't fix it, the palette has a structural problem (too-similar seeds, or a hue combination that fights contrast). Drop it. Generate a new palette per `palette-generation.md` and try again.

## Common failures and fixes

### Failure: `--muted-foreground` on `--background` — not enough contrast

**Cause:** the muted foreground is too dim (too close to bg L).

**Fix:** in dark mode, raise muted-foreground L from e.g. 0.60 to 0.66. In light mode, lower it from 0.48 to 0.44.

**Don't fix by:** making muted-foreground fully saturated again. It should stay quieter than `--foreground`.

### Failure: `--primary-foreground` on `--primary` — not enough contrast

**Cause:** the primary color is at a middle L (0.55–0.65) where neither pure-white nor pure-black lands cleanly on it.

**Fix:** push primary's L further from middle:
- If primary L is 0.58 in dark mode, bump to 0.68 (lighter) so pure-black foreground passes.
- If primary L is 0.55 in light mode, drop to 0.45 (darker) so pure-white foreground passes.

**Don't fix by:** using a gray foreground on the primary. That rarely passes and looks muddy.

### Failure: `--border` on `--background` — borders invisible

**Cause:** border is too close to bg L (same hue, tiny ΔL).

**Fix:** push border L further from bg. In dark mode, border L = bg L + 0.12. In light mode, border L = bg L − 0.10. Borders don't need full AA — 1.5:1 is the practical floor for "visible enough."

### Failure: primary looks washed out on bg

**Cause:** primary chroma is too low for the L difference available.

**Fix:** raise chroma by 0.02–0.04. If it's already at the max for the hue, switch to a slightly more saturated hue (shift 10° toward a naturally high-chroma zone like 240 or 30).

## Large text and icons — the 3.0:1 exemption

For any foreground that will ONLY ever be used on large text or icons (≥18 px, or ≥14 px bold, or a 24+ px icon), the target is 3.0:1 instead of 4.5:1. This gives you some breathing room.

**But:** don't assume a token will only be used on large text. If a designer later uses `--muted-foreground` for a 12 px caption, you want it to still pass 4.5:1. Err on the strict side.

## Hex vs OKLCH contrast checking

If you're writing values as `oklch(...)` in the CSS but calculating contrast from hex, there's a conversion step. For checking, always compute the sRGB luminance from the actual rendered color. OKLCH L ≠ sRGB luminance exactly — they correlate well but drift in some hue/chroma regions.

Safest approach: once a palette is generated, render it in the HTML preview, then sample the actual pixel color from the browser if uncertain. The user's eye sees rendered sRGB regardless of how the value was specified.

## When to call it good

You do not need every pair at 7:1 (AAA). 4.5:1 for body text and 3.0:1 for large text is the standard, and palettes that clear it with ~1 point of margin feel right. Pushing higher generally hurts the mood — "minimal + calm" palettes should feel soft, not high-contrast.

A palette that passes AA by 0.2–1.0 points is fine. A palette that passes by 3+ points on every pair is probably too stark for a minimal/premium mood — consider softening the primary or muted.
