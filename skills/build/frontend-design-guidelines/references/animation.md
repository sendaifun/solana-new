# Animation

Animation is easy to add and easy to get wrong. The default should be "do not animate." Only animate when it communicates something: state change, causality, spatial relationship, feedback.

## The three questions

Before adding any animation, ask:

1. **Does this communicate something?** (state change, causality, where something came from / went to, feedback on an action)
2. **Will it still look good after the 100th time the user sees it?** If no, cut it.
3. **What happens if the user has `prefers-reduced-motion: reduce`?** If you can't answer, you haven't finished the feature.

If any answer is "no" or "I don't know", do not ship the animation.

## `prefers-reduced-motion`

Always respect it. This is an accessibility setting, not a preference.

**Tailwind approach:** use the `motion-safe:` and `motion-reduce:` variants.

```tsx
<div className="motion-safe:transition-transform motion-safe:duration-150 motion-safe:hover:scale-105">
```

**CSS approach:**

```css
.card {
  transition: none;
}
@media (prefers-reduced-motion: no-preference) {
  .card {
    transition: transform 150ms ease-out;
  }
}
```

**Framer Motion:** use the `useReducedMotion` hook and set duration to 0 or disable transforms when it returns true.

Never animate `opacity` changes on essential content for reduced-motion users either — if they turned it on, they get no motion or instant transitions, not a slow fade.

## Duration tiers

Pick from this list. Do not invent new numbers.

| Tier | Duration | Use for |
|---|---|---|
| Instant | 0 ms | reduced-motion, or things that shouldn't animate |
| Micro | 100 ms | color/opacity feedback on hover, focus, press |
| Short | 150 ms | small element enter (tooltip, dropdown, popover) |
| Medium | 200–250 ms | element enter/exit (dialog, sheet, toast) |
| Long | 300–400 ms | page transitions, large layout changes |
| Never longer than | 500 ms | if you need >500 ms, reconsider — the user will wait |

**Exception for mount reveals and data visualization:** rolling number digits (600ms), SVG donut sweeps (1300ms), and chart morphs (600ms) legitimately exceed 500ms because they are decorative reveals that don't block user interaction. These are non-interactive animations that run after the page is usable. See `page-load-animations` skill for the specific patterns and timing.

## Easing curves

Never use `linear` for UI motion (it feels mechanical). Never use `ease` (the default is wrong for most things).

| Curve | When |
|---|---|
| `ease-out` (`cubic-bezier(0, 0, 0.2, 1)`) | Enter — element appearing, sliding in, expanding |
| `ease-in` (`cubic-bezier(0.4, 0, 1, 1)`) | Exit — element leaving, collapsing, dismissing |
| `ease-in-out` (`cubic-bezier(0.4, 0, 0.2, 1)`) | Move — something already on screen changing position |
| Spring | Gestures, drag, anything with physical feel |

Tailwind: `ease-out`, `ease-in`, `ease-in-out`. Use a custom timing function via config only if you have a good reason.

## Properties — what's cheap, what's not

**Animate these (GPU-accelerated, cheap):**
- `transform` (translate, scale, rotate)
- `opacity`
- `filter` (sparingly)

**Avoid animating these (trigger layout, expensive):**
- `width`, `height`, `top`, `left`, `margin`, `padding`
- `background-color` is fine but only on small elements
- Anything that causes layout reflow on the whole page

**Never do this:**
```css
transition: all 300ms;
```
It animates properties you never intended to animate and causes layout thrash. Always specify exactly what transitions:
```css
transition: transform 150ms ease-out, opacity 150ms ease-out;
```

Tailwind equivalent: `transition-transform`, `transition-opacity`, `transition-colors` — never `transition-all` in production.

## Interruption

Animations must be interruptible. If the user moves the mouse off a hovered element before the hover-in finishes, the hover-out must take over from the current state, not snap to the start.

- CSS transitions handle this correctly by default.
- Framer Motion handles it if you use it idiomatically.
- Manual JS (`setTimeout`, custom tween loops) usually doesn't. Avoid.

## Entrance animations

1. **Don't animate the whole page on load.** It delays the user's first action. Animate only the specific element that just appeared (dropdown, dialog, toast).
2. **Staggered list entrances are fine on first mount**, but skip the stagger on refetches and re-renders — it gets annoying by the third time.
3. **Never animate content the user is reading into view.** Text that slides in from below while you're scrolling breaks the reading flow.

## Common mistakes to avoid

- Animating on every render (check your `useEffect` deps)
- Animating scroll position against the user's own scroll
- Parallax that fights the user's scroll speed
- Marquee / auto-scrolling text (accessibility disaster)
- Entrance animations longer than 300 ms for interactive elements
- Hover animations on touch devices (use `@media (hover: hover)`)
- Animating `display: none` ↔ `display: block` — use `opacity` + `visibility` or framer-motion's `AnimatePresence`

## Micro-interaction checklist

For any interactive element with hover/focus/active states:

- [ ] Transition uses `colors` or `transform`, never `all`
- [ ] Duration is 100–150 ms
- [ ] `ease-out` for entering the state, `ease-in` for leaving
- [ ] Wrapped in `motion-safe:` or inside a `prefers-reduced-motion: no-preference` block
- [ ] Only appears on devices with `hover: hover` when it's hover-triggered
- [ ] Does not jank on slow devices (test at 4× CPU throttle)

## Framer-Motion Production Recipes

This file covers animation theory — when to animate, duration tiers, easing curves, GPU properties, reduced motion. For production framer-motion code recipes, see the **`page-load-animations`** skill (`skills/build/page-load-animations/`), which covers:

- Page entrance choreography (stage-driven, spring physics)
- Staggered list animations
- Modal and dropdown transitions
- Filter cross-fades with height springs
- Live data animations (rolling numbers, chart morphs, donut reveals)
- Micro-interaction patterns (CSS vs framer-motion decision matrix)
- Spring preset library
