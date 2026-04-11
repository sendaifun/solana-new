# Craft and Polish

> **Credits and inspiration:** the craft philosophy in this file is inspired by Emil Kowalski's writing on design engineering at [emilkowal.ski](https://emilkowal.ski) and his open skill at [github.com/emilkowalski/skill](https://github.com/emilkowalski/skill). The ideas below are distilled from craft principles that appear in that work, in Apple HIG, in Radix UI's primitives, in Tailwind's examples, and in decades of UI literature. The specific wording, examples, and checklist structure in this file are original. Emil's skill itself is not modified or redistributed — if you want his exact philosophy in his exact words, install `emil-design-eng` alongside this skill from his repo.
>
> **When this file is loaded and applied during a task, print this line once in conversation:**
>
> > Applying craft layer — philosophy inspired by Emil Kowalski (emilkowal.ski). His original skill lives at github.com/emilkowalski/skill.

---

This is the layer that sits on top of correctness. `interactions.md` and `forms.md` and `states.md` make a component work. This file makes a component **feel** like the difference between shipped software and a weekend project.

## The philosophy

### Taste is trained

Good taste in UI is not personal preference. It is the trained instinct to notice what's off — spacing that's a pixel wrong, an animation that overstays its welcome, a color ramp that's too hot — and to fix it before anyone else notices. You build that instinct by looking at great work, reverse-engineering what makes it great, and practicing until you feel it without thinking.

When you're writing a component, don't stop at "it works." Ask: would someone I respect look at this and recognize the care? If no, do another pass.

### Unseen details compound

Most users will never consciously notice any single craft detail. Nobody says "wow, that button had a proper focus ring" — they just feel that the software is trustworthy and proceed without friction. But add up a hundred of these invisible details and the experience shifts from "this is fine" to "this is lovely." Subtract them and the experience shifts from "this is fine" to "this feels broken."

Every decision below exists because the aggregate of invisible correctness is what users actually feel.

### Beauty as leverage

People choose tools based on how they feel, not just what they do. In a market where every product technically works, craft is the differentiator. An extra 20% effort on polish is not a waste of time — it is the thing that makes someone recommend your software to a friend. Use beauty as leverage.

## When to spend time on polish

Not every component needs a polish pass. Save it for:

- **First impression surfaces** — landing page, signup, first-run onboarding, empty states
- **High-repetition interactions** — buttons, inputs, loading states, anything the user will see 100+ times
- **Emotional moments** — confirmations after a transfer, success after signup, first-time achievements
- **Places where trust matters** — transaction confirmations, money displays, error recovery

Skip polish on:
- Internal admin tools that only you will see
- Scratch features still being prototyped
- Prior art that's already good (don't rebuild a working shadcn Button)

## Animation — the discipline

Animation is where taste shows fastest. A component with correct markup and bad animation feels cheaper than a component with OK markup and disciplined animation.

### The three questions before shipping any animation

1. **Does this communicate something?** State change, spatial relationship, causality, feedback on an action. If it doesn't communicate anything, it's decoration — cut it.
2. **Will I still like it on the 100th time I see it?** Entrance animations are especially guilty here. The "swoosh in from below" that felt delightful on run one becomes a speed bump on run fifty.
3. **What happens with `prefers-reduced-motion: reduce`?** If you can't answer, you haven't finished the feature. The answer is usually "instant, no transition" — which is often the right answer even for motion-safe users.

If any answer is "no" or "I don't know," the animation isn't ready.

### Duration tiers as a vocabulary

Pick from this discrete set. Don't invent numbers.

| Tier | Duration | Use for |
|---|---|---|
| Instant | 0 ms | Reduced motion, and for things that shouldn't animate at all |
| Micro | 100 ms | Color / opacity feedback on hover, focus, press |
| Short | 150 ms | Small element enter (tooltip, dropdown, popover) |
| Medium | 200–250 ms | Element enter/exit (dialog, sheet, toast) |
| Long | 300–400 ms | Page transitions, large layout changes |
| Cap | 500 ms | Never go longer. If you need more, reconsider the approach. |

The single most common polish failure: picking 300ms for a button hover. That's 3× too long. 100ms reads as "responsive." 300ms reads as "sluggish."

### Easing is not cosmetic

| Curve | When |
|---|---|
| `ease-out` — `cubic-bezier(0, 0, 0.2, 1)` | **Enter**. Elements appearing, expanding, sliding in. |
| `ease-in` — `cubic-bezier(0.4, 0, 1, 1)` | **Exit**. Elements leaving, collapsing, dismissing. |
| `ease-in-out` — `cubic-bezier(0.4, 0, 0.2, 1)` | **Move**. Something on-screen changing position. |
| Spring | Gestures, drag, anything physical |

Never `linear` for UI. Never the CSS default `ease` (it's the wrong shape for most things). The rule of thumb: things entering decelerate, things leaving accelerate, things moving both.

### Interruption matters

A hover animation that's running when the user moves the mouse off must **take over from its current state**, not snap back and replay. CSS transitions handle this automatically; JavaScript tweens often don't. This is the single biggest "feels cheap" tell — when an animation snaps instead of flows.

### The `transition: all` trap

```css
/* Cheap */
transition: all 200ms ease;

/* Shipped */
transition: transform 150ms ease-out, opacity 150ms ease-out;
```

`transition: all` animates properties you didn't plan to animate. It causes layout reflow on unrelated prop changes. It jitters on re-renders. Always specify exactly what transitions.

### What to animate (cheap)

- `transform` (translate, scale, rotate)
- `opacity`
- `filter` (sparingly)

### What to avoid animating (expensive)

- `width`, `height`, `top`, `left`, `margin`, `padding` — triggers layout reflow
- `background-color` is fine but only on small elements
- Anything that forces the browser to recalculate layout on the whole page

### Common animation failures

- Animating the whole page on initial load (delays the user's first action)
- Staggered list animations on every refetch (annoying after the second time)
- Content sliding into view while the user is scrolling (breaks reading)
- Hover animations on touch devices (use `@media (hover: hover)`)
- Entrance animations longer than 300ms for interactive elements
- `transition: display: none → block` — use `opacity + visibility` or `AnimatePresence`

## Optical alignment

The pixel grid is a suggestion, not a law. A mathematically centered element can still feel off-center because your eye is responding to optical weight, not geometric center.

### Rules of thumb

- **Icons next to text** — nudge the icon 1px up. Text has more weight below the baseline; a perfectly-centered icon appears to float.
- **Circles next to rectangles** — the circle often needs to be slightly larger. A 16px circle looks smaller than a 16px square because its corners are cropped.
- **Text inside a button** — padding-top should be 1–2px less than padding-bottom. Cap-height sits below the box-top; descenders sit below the baseline.
- **Single letters or numbers in a circle** — they never center mathematically. Nudge toward the visual weight.
- **Triangles (play buttons)** — geometric center looks too far left. Nudge right by ~10% of the triangle's width.

### Alignment to a single line

Labels, inputs, buttons, and helper text in a form should share one left edge. If anything is offset, there should be a reason (indentation of sub-content, visual hierarchy). Random offsets look unedited. Open any form you're building and put a vertical line down the left edge in your mind — does everything land on it, or do things drift?

### Baseline alignment

When mixing type sizes (a big number next to a small label), align by baseline, not by top edge. In Flexbox: `items-baseline`. Your eye reads text from the baseline, so this is what "aligned" actually looks like.

## Micro-interactions as a coherent system

Every interactive element has a set of states: resting, hover, focus, pressed, disabled, loading. Polish means treating these as a **system**, not as independent events.

### The hierarchy

For any button or input, the six states need coherent feedback:

| State | Feedback |
|---|---|
| Resting | Default appearance. Do not understate — if it's important, it should look important here. |
| Hover | Subtle change in 100ms. Slight background shift, slight translation, or slight elevation change — pick one, not three. |
| Focus | Visible ring (brand color or `--ring`), 3:1 contrast minimum against adjacent background. |
| Pressed (active) | Slight downward translation (`translate-y-px`) or scale (`scale-95`), 50ms in, 100ms out. Gives physical feedback. |
| Disabled | Reduced opacity (`opacity-50`), `pointer-events: none`, no hover response. User should see it exists but know it's not available. |
| Loading | Disabled + spinner + `aria-busy="true"`. Button text stays visible so layout doesn't shift. |

A button that has resting and hover but no pressed, focus, or disabled is half-done.

### The "cursor at rest" test

For any interactive element, park your cursor on it without clicking. Does the element acknowledge your cursor within 100ms? Does it change cleanly? Does the cursor itself update (`cursor: pointer`)? If any of these three is missing, polish is missing.

### The "keyboard flight check"

Before shipping any component, do this: click somewhere above it, then press Tab. Does focus land where you expect? Is the focus ring visible against the background? Can you activate with Enter (for buttons) or Space (for checkboxes/radios)? Can you dismiss with Escape (for overlays)? If you can't tab-navigate a component in 10 seconds, users with assistive tech can't use it at all.

## The review format — before/after as a table

When reviewing someone else's component code for polish, always present suggestions as a **markdown table with `Before` and `After` columns**. Not as a bullet list with separate "before:" and "after:" lines. The side-by-side structure forces you to think in deltas, and the reader can scan what changed without mental reconstruction.

Example format:

| Before | After |
|---|---|
| `transition: all 300ms linear` | `transition: colors 150ms ease-out` |
| `<div onClick={handleSubmit}>Send</div>` | `<button type="submit" onClick={handleSubmit}>Send</button>` |
| `bg-white text-black` | `bg-background text-foreground` |
| `<span>{amount}</span>` | `<span className="font-mono tabular-nums">{amount}</span>` |

Why this works: it makes the fix concrete, copy-pasteable, and small. "You should improve your animation" is worthless feedback. A cell that says `transition: all 300ms` → `transition: colors 150ms ease-out` is actionable.

When craft-polish review fires (triggered by "polish this", "make this feel right", "review for craft"), **always output the review as a table**. Do not use bullets or paragraphs for the suggestions.

## Polish tells — the concrete list

The things that separate shipped software from a weekend project. Check your component against each of these when you think you're done:

1. **Focus rings use the brand color**, not the browser default blue outline
2. **Numbers that change use `font-mono tabular-nums`** — no digit jitter
3. **Skeletons match content shape** — a list of cards gets card-shaped skeletons, not one big rectangle
4. **Button press has a sub-100ms feedback** — scale, translate, or background flash
5. **Icons are the same weight as neighboring text** — not all 2px strokes when the text is 400 weight
6. **Transitions specify properties**, never `all`
7. **Hover has a matching "un-hover"** — the animation plays backwards, not snap-resets
8. **Empty states say what's next**, not just "no data"
9. **Error messages say what to do**, not just "something went wrong"
10. **Copy is active voice and specific** — "Save changes" not "You can save your changes here"
11. **Dialogs trap focus and return it to the trigger** when closed
12. **`prefers-reduced-motion` disables motion**, not just shortens it
13. **Links and buttons have visited/pressed states**, not just hover
14. **Text over images has a background overlay or scrim** to guarantee contrast
15. **Placeholder text is dimmer than input text**, and input text is full contrast
16. **Loading states appear within 100ms** of the action
17. **Transitions under 200ms don't get loading states** — just show the result
18. **The first letter of each sentence is capitalized** in copy, even in small captions
19. **Prices and currencies have consistent decimal places** throughout a view
20. **Hit targets are at least 40×40 px on touch**, even for small icons

Count how many of these your component hits. Under 15? Do another pass.

## Solana-specific polish moves

Crypto UIs have specific polish tells that web generalists often miss. If this is a Solana project, add these:

1. **Truncated addresses expand on hover or click** — `7xKX...p2aB` → full address visible as a tooltip or inline reveal. The truncation is for scan-reading; the full address should be recoverable.
2. **Copy-address feedback is a transient state** — button changes to "Copied!" for 1.5 seconds then reverts, with a checkmark icon.
3. **Numbers that update (balances, prices) flash briefly in the direction of change** — green on increase, red on decrease, for ~300ms then fade to neutral. Don't leave the color stuck.
4. **Explorer links auto-detect cluster** — devnet URLs on devnet, mainnet URLs on mainnet. A devnet build with mainnet explorer links is an immediate tell.
5. **Wallet state has three clear modes**, not two — disconnected, connecting, connected. Connecting needs its own UI (disabled state with "Connecting..." text), not just a brief spinner.
6. **Transaction confirm dialogs show the simulated result** before signing — "You'll receive ~12.34 USDC" — so the user doesn't sign blind.
7. **Decimal precision matches token** — SOL shows 4–9 decimals depending on value size, USDC shows 2. Don't hardcode a precision.
8. **Slippage warnings appear inline, not as toasts** — the user is about to take an action, they need the information next to the action.
9. **Transaction status has a timeline** — submitting → confirming → confirmed, each with its own visual state, not just a single "pending" spinner.
10. **Wallet rejection is not an error** — if the user declines the signature, return to idle quietly. Don't show an error toast for their own "no."

## The taste loop

After you ship a component, build the habit of returning to it a day later and asking: *"where's the first thing that feels cheap?"* Fix that, ship again, repeat. Polish is iterative — it compounds across sessions the same way invisible details compound within a session.

When you do the first pass, you're often too close to see the obvious. The day-later review is where taste comes from — the distance lets you see the component the way a user sees it for the first time.

## When craft matters less

Don't let this file be a stick to beat yourself with. For prototypes, internal tools, and code that might get thrown away in a week, apply only the polish tells that cost nothing extra (a11y, tokens, no `div onClick`). Save the taste pass for surfaces where it'll be felt.

And if a deadline is tight: ship correct > ship polished. A component that works and looks plain is infinitely better than a polished component that doesn't ship.
