# Layout & Design

Visual rules that separate "looks thrown together" from "looks designed." Apply to every screen you build.

## Alignment

1. **Optical alignment beats mathematical alignment.** An icon-plus-label pair should look centered, even if the pixel math says it isn't. When the label starts with a capital letter and the icon is a circle, nudge the icon up 1 px so it feels right.
2. **Align to a single vertical line.** Labels, inputs, buttons, and body text in a form should share one left edge. Indented sub-content is fine; random offsets aren't.
3. **Baseline-align text across adjacent elements.** A big number next to small label text should share their baselines, not their top edges. Use `items-baseline` on flex containers mixing type sizes.
4. **Center text blocks against themselves, not their padding.** Text inside a button should be visually centered with the same padding on all sides — accounting for the font's optical center, which is slightly above the geometric center.

## Spacing rhythm

1. **Use a 4 px grid.** Tailwind's default scale already does this. Stay on it: `p-1/2/3/4/6/8/12/16/24`.
2. **Related elements are closer together than unrelated elements.** This is the single most important layout rule. A label is 4 px from its input; the next form field is 16 px away; the next section is 32 px away.
3. **Consistent gutter.** Pick one page gutter (e.g., `px-4 md:px-6 lg:px-8`) and use it everywhere. Don't let each section invent its own.
4. **White space is a feature, not waste.** Cramped interfaces feel cheap. Err on more breathing room, especially around headings and primary actions.

## Layout width

1. **Max reading width is 65–75 characters** (`max-w-prose` ≈ 65ch). Anything wider is uncomfortable to read.
2. **Content containers max out at 1280 px** (`max-w-7xl`). Beyond that, the eye loses the left edge returning to the next line.
3. **Full-bleed sections are fine for backgrounds** (color, image, border) but the content inside stays within the container.
4. **Sidebars stay between 240 and 320 px wide.** Narrower breaks labels; wider wastes space.

## Responsive

1. **Design mobile-first.** Start narrow, add breakpoints as needed. Tailwind default: base styles are mobile, `sm:` kicks in at 640 px, `md:` at 768 px, `lg:` at 1024 px, `xl:` at 1280 px.
2. **Test at 375 px, 768 px, and 1280 px at minimum.** Most bugs happen at 375.
3. **Avoid hover-only interactions.** On touch, hover doesn't exist. Anything hover-only must have a touch equivalent.
4. **Respect safe areas on iOS.** Fixed bottom nav? Add `pb-[env(safe-area-inset-bottom)]` or a Tailwind utility for it.
5. **Don't hide content on small screens unless it's genuinely secondary.** Hamburger menus hide things users need.
6. **Fluid type for hero headings, fixed type for body.** `text-3xl md:text-4xl lg:text-5xl` for display, plain `text-sm` or `text-base` for body.

## Color

1. **Use tokens, not hex values.** `bg-background`, `text-foreground`, `border-border`, `bg-primary text-primary-foreground`. If a color isn't in the token set, add it to the token set — don't inline it.
2. **One accent color.** If you use `primary` for the CTA, don't also use a different accent elsewhere unless it has semantic meaning (destructive red, success green).
3. **Grays have a temperature.** Cool grays (blue-tinted) feel modern and neutral; warm grays (brown-tinted) feel cozy. Pick one and stick with it — mixing both looks muddy.
4. **Semantic colors for semantic meaning only.** Red is destructive, green is success, yellow is warning, blue is info. Don't use red just because it "pops."
5. **Dark mode is not "invert colors."** Surfaces get lighter as they elevate (base `#0A0A0A`, card `#141414`, popover `#1A1A1A`). Text uses softer whites (`#EDEDED`, not pure white) to avoid glare.

## Contrast (non-negotiable)

Pass WCAG AA or don't ship.

| Content | Minimum ratio |
|---|---|
| Body text | 4.5:1 against background |
| Large text (18px+ or 14px+ bold) | 3:1 |
| Icon or button border | 3:1 |
| Focus ring | 3:1 against its adjacent background |
| Disabled text | *no requirement, but* readable-enough is still nicer than grey-on-grey |

**Common failures to watch for:**
- Placeholder text (`text-muted-foreground`) on `bg-muted` — frequently under 4.5:1
- Secondary text (`text-muted-foreground`) at `text-xs` — small text needs the higher 4.5:1 even though it's "secondary"
- Ghost buttons on colored backgrounds
- White text on a brand gradient that includes a light color

Use a contrast checker. If you aren't sure, darken the text or lighten the background until it passes.

## Borders, radius, shadow

1. **Pick one radius per element class and don't mix.** All cards are `rounded-lg`; all buttons are `rounded-md`. Randomly mixing `rounded-md` and `rounded-xl` on similar elements looks sloppy.
2. **Borders are 1 px.** 2 px borders are a stylistic choice that rarely pays off and doubles the visual weight.
3. **Use border OR shadow to separate, not both.** Pick a style: flat with borders, or floating with shadows. Mixing both is visual noise.
4. **Shadows are subtle.** `shadow-sm`, `shadow-md`, occasionally `shadow-lg`. `shadow-xl` is for overlays (modals, command palette) only.
5. **Shadow color follows the background.** On dark backgrounds, boost opacity and use pure black; on light backgrounds, use a slightly cool gray at low opacity.

## Anti-aliasing and rendering

1. **Use `antialiased` by default** on the `<body>` in Tailwind. It smooths text on macOS.
2. **Avoid tiny fonts below 12 px.** They render inconsistently across platforms.
3. **Test on Windows** if you can. Windows renders fonts differently and subtle weights can look off.
4. **Gradients can band.** If you see visible stripes, add 1–2% noise or use a wider gradient range.

## Icons

1. **Use one icon library.** Mixing Lucide, Heroicons, and emoji looks like a mood board.
2. **Size icons to match their neighboring text.** 16 px icon next to `text-sm` (14 px text), 20 px icon next to `text-base`.
3. **Icons have matching stroke widths.** Don't mix 1.5 px and 2 px strokes on the same screen.
4. **Decorative icons get `aria-hidden="true"`.** Icons that carry meaning (with no visible text label) get `aria-label="..."`.

## Images

1. **Always set `width` and `height`** (or `aspect-ratio`) to prevent layout shift while loading.
2. **Use `next/image` in Next.js.** It handles resizing, lazy loading, and format conversion.
3. **Meaningful images have `alt` text.** Decorative images have `alt=""` (empty, not missing).
4. **Avatars fall back to initials or a generated shape**, not a broken image icon.
