# Gradient Recipes

Two gradients per project, derived from the chosen palette. No more, no less. Gradients are high-cost visual elements — adding a third or fourth creates noise.

## The two gradient types

### Type 1 — Subtle background gradient

**Purpose:** adds depth and warmth to hero sections, page headers, and large empty areas without dominating.

**Shape:** diagonal, low-contrast, one hue. The user should barely notice it's there.

**Derivation from palette seeds:**

- Start color: `bg-base`
- End color: `bg-base` with L + 0.03 and H shifted +15°
- Direction: `135deg` (top-left to bottom-right)

For **dark mode**, lightening by 0.03 moves toward a brighter shade of the base. For **light mode**, darken by 0.03 instead (the direction of "add depth" is opposite).

**CSS output:**

```css
/* Dark mode */
--gradient-bg: linear-gradient(
  135deg,
  oklch(0.14 0.02 265) 0%,
  oklch(0.17 0.025 280) 100%
);

/* Light mode */
--gradient-bg: linear-gradient(
  135deg,
  oklch(0.98 0.01 265) 0%,
  oklch(0.95 0.015 280) 100%
);
```

**Use:** apply to `<body>` or hero `<section>`. Should be almost invisible on a small screen and noticed only peripherally on a large one.

---

### Type 2 — Brand accent gradient

**Purpose:** hero CTAs, feature-card headers, data-viz accent bars, "premium" badge treatments. The user should notice this one.

**Shape:** angled, two-stop, uses `primary` and a related hue for energy.

**Derivation from palette seeds:**

- Start color: `primary`
- End color: `primary` with H shifted:
  - +30° for analogous energy (default)
  - +60° for a bolder shift (for playful/electric moods)
  - -30° for a calmer shift (for serious/calm moods)
- Direction: `to right` for horizontal flow, `to bottom right` for dynamic feel

**The shift direction depends on the palette's hue** — you want to move toward a hue that's naturally warmer or brighter at that C level. Use this guide:

| Primary H | Shift direction | Why |
|---|---|---|
| 0–60 (red/orange) | +20 to +40 (toward yellow) | Sunset feel |
| 60–120 (yellow/lime) | +20 to +40 (toward green) | Fresh growth |
| 120–180 (green/teal) | +20 to +40 (toward cyan) | Cool progression |
| 180–240 (cyan/blue) | -20 to -40 (toward teal) OR +30 to +60 (toward purple) | Two good options |
| 240–300 (blue/violet) | +30 to +60 (toward pink/magenta) | Plasma feel |
| 300–360 (magenta/pink) | +20 to +40 (toward red) | Warm finish |

**CSS output:**

```css
/* Dark mode — "Midnight Signal" primary at H=250 */
--gradient-accent: linear-gradient(
  to right,
  oklch(0.72 0.17 250) 0%,
  oklch(0.74 0.18 285) 100%
);

/* Light mode */
--gradient-accent: linear-gradient(
  to right,
  oklch(0.52 0.17 250) 0%,
  oklch(0.54 0.18 285) 100%
);
```

**Use:** apply to hero CTAs, the first row of a pricing table, feature cards. Never to body text backgrounds — gradients fight with text contrast.

---

## Where to write the gradients

Add to `app/globals.css` alongside the palette tokens:

```css
:root {
  /* ...existing shadcn tokens... */
  --gradient-bg: linear-gradient(135deg, oklch(0.98 0.01 265) 0%, oklch(0.95 0.015 280) 100%);
  --gradient-accent: linear-gradient(to right, oklch(0.52 0.17 250) 0%, oklch(0.54 0.18 285) 100%);
}

.dark {
  /* ...existing dark tokens... */
  --gradient-bg: linear-gradient(135deg, oklch(0.14 0.02 265) 0%, oklch(0.17 0.025 280) 100%);
  --gradient-accent: linear-gradient(to right, oklch(0.72 0.17 250) 0%, oklch(0.74 0.18 285) 100%);
}
```

## Exposing as Tailwind utilities

For Tailwind v4, add to the `@theme` block:

```css
@theme {
  --background-image-brand-bg: var(--gradient-bg);
  --background-image-brand-accent: var(--gradient-accent);
}
```

This gives you `bg-brand-bg` and `bg-brand-accent` utilities.

For Tailwind v3, extend the config:

```js
theme: {
  extend: {
    backgroundImage: {
      "brand-bg": "var(--gradient-bg)",
      "brand-accent": "var(--gradient-accent)",
    },
  },
}
```

## Usage examples to include in brand.md

```tsx
// Subtle hero background
<section className="bg-brand-bg">
  <div className="mx-auto max-w-5xl py-24 px-6">
    <h1>Welcome to SolFeed</h1>
  </div>
</section>

// Brand accent CTA
<button className="bg-brand-accent text-white px-6 py-3 rounded-lg font-medium">
  Get started
</button>
```

## Anti-patterns

- **Do not** put body text directly on `--gradient-accent`. Add a solid background card or use the gradient only as a border/outline.
- **Do not** use more than one of the two gradients per screen. Either the subtle bg gradient OR the accent gradient, rarely both.
- **Do not** use `background: <gradient>, <gradient>` stacks. One gradient at a time.
- **Do not** animate gradients on hover. It looks cheap. Change solid background color or add a subtle shadow instead.
- **Do not** use high-angle gradients (30°, 60°) — 135° or horizontal/vertical read cleaner at small sizes.
- **Do not** add a third gradient because "this hero also needs something." If the design needs more visual energy, add a shape, a border treatment, or a subtle pattern — not another gradient.

## When to skip gradients entirely

Some moods shouldn't have gradients at all:

| Mood | Gradient recommendation |
|---|---|
| minimal | **Skip.** Minimal means no decoration. Flat all the way down. |
| serious (finance-heavy) | Skip or use only the subtle bg. No accent gradient on money UIs — it looks frivolous. |
| premium | Use both, but keep both extremely restrained (low chroma, small L delta). |
| technical | Skip or subtle bg only. Accent gradient fights with data-viz colors. |
| bold / playful / electric | Use both, push the accent saturation up. |
| warm | Both work well. Accent can go more expressive. |

If the user's chosen palette is in a "skip gradients" mood, the skill should ask:

> This palette is in a minimal direction — gradients usually fight minimal. Want to skip gradients? (y/n)

And default to skip.

## Contrast warning

Gradients can fail AA in the "middle" of their fade, even if the start and end both pass individually. If a gradient is used under text, check the midpoint color against the text color. If the midpoint fails, either:

- Tighten the L delta between start and end (reduce the gradient's visual change)
- Add a solid overlay: `background: var(--gradient-bg); background-color: color-mix(in oklch, var(--background) 60%, transparent);`
- Move the text off the gradient entirely

Flag this in `brand.md` if the user's chosen typography will frequently appear over gradient areas.
