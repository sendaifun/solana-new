# shadcn Integration

How to turn 5 seed colors into the full shadcn token set and write them to `app/globals.css`.

## The shadcn token roles

shadcn defines ~14 semantic tokens. Each has a `--<name>` and a `--<name>-foreground` pair. Here's what each one means in plain language:

| Token | What it is | Common use |
|---|---|---|
| `--background` / `--foreground` | Page base | `<body>` bg and default text |
| `--card` / `--card-foreground` | Card surface | Elevated content blocks |
| `--popover` / `--popover-foreground` | Floating surface | Dropdowns, tooltips, command palette |
| `--primary` / `--primary-foreground` | Main brand color | CTA buttons, focus ring, links |
| `--secondary` / `--secondary-foreground` | Secondary surface | Less-prominent buttons, subtle fills |
| `--muted` / `--muted-foreground` | Low-attention surface | Placeholders, helper text, disabled |
| `--accent` / `--accent-foreground` | Hover / focus highlight | Hovered menu items, selected rows |
| `--destructive` / `--destructive-foreground` | Error/danger | Delete buttons, error states |
| `--border` | Hairline borders | Input borders, dividers |
| `--input` | Input backgrounds | Form field fills |
| `--ring` | Focus ring color | `focus-visible` outline |
| `--radius` | Corner rounding | Single scalar, not a color |

## Mapping 5 seeds → 14 tokens

Given the 5 seeds from `palette-recipes.md` or `palette-generation.md`:

- `bg-base` → `--background`
- `bg-elevated` → `--card`, `--popover`
- `primary` → `--primary`, `--ring`
- `primary-soft` → used in `--accent`, `--secondary` derivations
- `fg-base` → `--foreground`, `--card-foreground`, `--popover-foreground`

The rest are derived with OKLCH transformations from these five. Use the table below.

### Dark mode derivation table

Assume seeds: `BG`, `BGE` (bg-elevated), `P` (primary), `PS` (primary-soft), `FG`.

| Token | Formula | Rationale |
|---|---|---|
| `--background` | `BG` | Direct |
| `--foreground` | `FG` | Direct |
| `--card` | `BGE` | Direct |
| `--card-foreground` | `FG` | Same text color as page |
| `--popover` | `BGE` with L + 0.02 | Slightly brighter than card |
| `--popover-foreground` | `FG` | Same |
| `--primary` | `P` | Direct |
| `--primary-foreground` | L = 0.10 if `P` L ≥ 0.70, else L = 0.97 | Auto contrast |
| `--secondary` | `BGE` with L + 0.04, C + 0.01 | A slight step up from card |
| `--secondary-foreground` | `FG` | Same |
| `--muted` | `BGE` with L + 0.02 | Slightly above card |
| `--muted-foreground` | `FG` with L − 0.30 (floor 0.60) | Dimmed text |
| `--accent` | `BGE` with L + 0.06, blend 10% toward `P` H | Hover highlight |
| `--accent-foreground` | `FG` | Same |
| `--destructive` | `oklch(0.65 0.22 25)` | Fixed red, not from brand |
| `--destructive-foreground` | `oklch(0.98 0 0)` | Always near-white |
| `--border` | `BGE` with L + 0.08, C unchanged | Visible but quiet |
| `--input` | `BGE` | Same as card |
| `--ring` | `P` with L ± 0.05 for contrast against `BG` | Match primary |
| `--radius` | `0.5rem` default, `0.375rem` for minimal, `0.75rem` for warm/playful | Not a color |

### Light mode derivation table

Light mode uses the **light-mode seeds** from the palette (not inverted dark-mode seeds). Same derivation pattern:

| Token | Formula | Rationale |
|---|---|---|
| `--background` | `BG` (light seed) | Direct |
| `--foreground` | `FG` (light seed) | Direct |
| `--card` | `BGE` (light seed) | Usually pure white or near-white |
| `--card-foreground` | `FG` | Same |
| `--popover` | `BGE` | Same as card |
| `--popover-foreground` | `FG` | Same |
| `--primary` | `P` (light seed) | Darker than dark-mode primary |
| `--primary-foreground` | L = 0.98 if `P` L ≤ 0.55, else L = 0.12 | Auto contrast |
| `--secondary` | `BG` with L − 0.04, C + 0.005 | Slight tint |
| `--secondary-foreground` | `FG` | Same |
| `--muted` | `BG` with L − 0.03 | Quiet fill |
| `--muted-foreground` | `FG` with L + 0.30 (ceiling 0.45) | Dimmed text |
| `--accent` | `BG` with L − 0.05, blend 8% toward `P` H | Hover highlight |
| `--accent-foreground` | `FG` | Same |
| `--destructive` | `oklch(0.55 0.22 25)` | Fixed red |
| `--destructive-foreground` | `oklch(0.98 0 0)` | Near-white |
| `--border` | `BG` with L − 0.08 | Subtle gray |
| `--input` | `BG` with L − 0.02 | Slightly recessed |
| `--ring` | `P` | Match primary |
| `--radius` | same as dark | — |

## The CSS template

Write this exact shape to `app/globals.css`. The comments document which seed each value came from so future maintainers can see the logic.

```css
@import "tailwindcss";

@layer base {
  :root {
    /* Light mode — derived from {palette-name} */
    --background: <light BG>;
    --foreground: <light FG>;
    --card: <light BGE>;
    --card-foreground: <light FG>;
    --popover: <light BGE>;
    --popover-foreground: <light FG>;
    --primary: <light P>;
    --primary-foreground: <auto>;
    --secondary: <derived>;
    --secondary-foreground: <light FG>;
    --muted: <derived>;
    --muted-foreground: <derived>;
    --accent: <derived>;
    --accent-foreground: <light FG>;
    --destructive: oklch(0.55 0.22 25);
    --destructive-foreground: oklch(0.98 0 0);
    --border: <derived>;
    --input: <derived>;
    --ring: <light P>;
    --radius: 0.5rem;
  }

  .dark {
    /* Dark mode — derived from {palette-name} */
    --background: <dark BG>;
    --foreground: <dark FG>;
    --card: <dark BGE>;
    --card-foreground: <dark FG>;
    --popover: <derived>;
    --popover-foreground: <dark FG>;
    --primary: <dark P>;
    --primary-foreground: <auto>;
    --secondary: <derived>;
    --secondary-foreground: <dark FG>;
    --muted: <derived>;
    --muted-foreground: <derived>;
    --accent: <derived>;
    --accent-foreground: <dark FG>;
    --destructive: oklch(0.65 0.22 25);
    --destructive-foreground: oklch(0.98 0 0);
    --border: <derived>;
    --input: <dark BGE>;
    --ring: <dark P>;
    --radius: 0.5rem;
  }
}
```

All values should be written as `oklch(L C H)` literals. Modern Chrome, Safari, and Firefox all support `oklch()` in CSS natively.

## How to write to globals.css

**Do not overwrite the whole file.** The project's `globals.css` also contains Tailwind imports, custom base styles, font imports, and other things. Only replace the `:root` and `.dark` blocks inside `@layer base`.

Procedure:

1. Back up: `cp app/globals.css app/globals.css.bak`
2. Read the current file
3. Find the `:root { ... }` block. If it exists inside `@layer base`, replace just its contents. If the project doesn't have `@layer base` wrapping it, add one.
4. Find the `.dark { ... }` block. If it exists, replace. If it doesn't, insert one immediately after `:root`.
5. Preserve every other line in the file — Tailwind directives, custom layers, `@font-face`, comments, everything.
6. Write the file back.
7. Verify: read it back, confirm the new blocks are present, confirm nothing else changed.

If the project uses **shadcn v3 or older**, the variables are in HSL space (`hsl(var(--background))`) and the file uses different Tailwind directives. Detect this by grepping for `hsl(var(--` in existing CSS. If found, generate HSL values instead of OKLCH — but warn the user the precision is slightly worse. Prefer upgrading the project to shadcn v4 + OKLCH if possible.

## Example: "Midnight Signal" applied

From `palette-recipes.md`:

- `bg-base` → `oklch(0.14 0.02 265)`
- `bg-elevated` → `oklch(0.19 0.02 265)`
- `primary` → `oklch(0.72 0.17 250)`
- `primary-soft` → `oklch(0.82 0.11 250)`
- `fg-base` → `oklch(0.96 0.01 265)`

And the light-mode seeds (derived per `palette-generation.md`):
- `bg-base` → `oklch(0.98 0.01 265)`
- `bg-elevated` → `oklch(1 0 0)`
- `primary` → `oklch(0.52 0.17 250)`
- `primary-soft` → `oklch(0.72 0.11 250)`
- `fg-base` → `oklch(0.18 0.02 265)`

Applied:

```css
:root {
  --background: oklch(0.98 0.01 265);
  --foreground: oklch(0.18 0.02 265);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.18 0.02 265);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.18 0.02 265);
  --primary: oklch(0.52 0.17 250);
  --primary-foreground: oklch(0.98 0 0);
  --secondary: oklch(0.94 0.01 265);
  --secondary-foreground: oklch(0.18 0.02 265);
  --muted: oklch(0.95 0.01 265);
  --muted-foreground: oklch(0.48 0.015 265);
  --accent: oklch(0.93 0.02 250);
  --accent-foreground: oklch(0.18 0.02 265);
  --destructive: oklch(0.55 0.22 25);
  --destructive-foreground: oklch(0.98 0 0);
  --border: oklch(0.90 0.01 265);
  --input: oklch(0.96 0.01 265);
  --ring: oklch(0.52 0.17 250);
  --radius: 0.5rem;
}

.dark {
  --background: oklch(0.14 0.02 265);
  --foreground: oklch(0.96 0.01 265);
  --card: oklch(0.19 0.02 265);
  --card-foreground: oklch(0.96 0.01 265);
  --popover: oklch(0.21 0.02 265);
  --popover-foreground: oklch(0.96 0.01 265);
  --primary: oklch(0.72 0.17 250);
  --primary-foreground: oklch(0.10 0 0);
  --secondary: oklch(0.23 0.03 265);
  --secondary-foreground: oklch(0.96 0.01 265);
  --muted: oklch(0.21 0.02 265);
  --muted-foreground: oklch(0.66 0.015 265);
  --accent: oklch(0.25 0.03 250);
  --accent-foreground: oklch(0.96 0.01 265);
  --destructive: oklch(0.65 0.22 25);
  --destructive-foreground: oklch(0.98 0 0);
  --border: oklch(0.27 0.03 265);
  --input: oklch(0.19 0.02 265);
  --ring: oklch(0.72 0.17 250);
  --radius: 0.5rem;
}
```

## Tailwind config notes

If the project uses Tailwind v4, `tailwind.config.*` doesn't need color mappings — Tailwind v4 reads the CSS variables directly. Don't touch the config.

If the project uses Tailwind v3, the config needs `colors.background: "hsl(var(--background))"` mappings. Check `tailwind.config.*` and add mappings for any missing tokens.

Don't rewrite the whole config — only add/update the `colors` section inside `extend`.
