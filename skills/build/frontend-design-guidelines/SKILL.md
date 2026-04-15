---
name: frontend-design-guidelines
description: Apply high-quality web interface design rules when building, reviewing, or styling frontend code. Use when the user says "build a frontend", "create a component", "style this", "review my UI", "build a landing page", "design this page", "make this look good", "add animation", "build a form", "improve the UI", "polish this", "make this feel right", "review for craft", "the interaction feels off", "make this look polished", or when generating any React/Next.js component. Defaults to Tailwind CSS and shadcn/ui. Reads brand.md at the project root (if present) and uses it as the source of truth for colors, typography, and voice. Covers interactions, layout, typography, forms, animation, states, accessibility, and a dedicated craft-and-polish layer for taste-level review. Use proactively whenever frontend code is being written — do not wait to be asked.
---

## Preamble (run first)

```bash
_TEL_TIER=$(cat ~/.superstack/config.json 2>/dev/null | grep -o '"telemetryTier": *"[^"]*"' | head -1 | sed 's/.*"telemetryTier": *"//;s/"$//'  || echo "anonymous")
_TEL_TIER="${_TEL_TIER:-anonymous}"
_TEL_PROMPTED=$([ -f ~/.superstack/.telemetry-prompted ] && echo "yes" || echo "no")
_TEL_START=$(date +%s)
_SESSION_ID="$$-$(date +%s)"
mkdir -p ~/.superstack
echo "TELEMETRY: $_TEL_TIER"
echo "TEL_PROMPTED: $_TEL_PROMPTED"
if [ "$_TEL_TIER" != "off" ]; then
_TEL_EVENT='{"skill":"frontend-design-guidelines","phase":"build","event":"started","ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}' 
echo "$_TEL_EVENT" >> ~/.superstack/telemetry.jsonl 2>/dev/null || true
_CONVEX_URL=$(cat ~/.superstack/config.json 2>/dev/null | grep -o '"convexUrl":"[^"]*"' | head -1 | cut -d'"' -f4 || echo "")
[ -n "$_CONVEX_URL" ] && curl -s -X POST "$_CONVEX_URL/api/mutation" -H "Content-Type: application/json" -d '{"path":"telemetry:track","args":{"skill":"frontend-design-guidelines","phase":"build","status":"success","version":"0.2.0","platform":"'$(uname -s)-$(uname -m)'","timestamp":'$(date +%s)000'}}' >/dev/null 2>&1 &
true
fi
```

If `TEL_PROMPTED` is `no`: Before starting the skill workflow, ask the user about telemetry.
Use AskUserQuestion:

> Help superstack get better! We track which skills get used and how long they take —
> no code, no file paths, no PII. Change anytime in `~/.superstack/config.json`.

Options:
- A) Sure, help superstack improve (anonymous)
- B) No thanks

If A: run this bash:
```bash
echo '{"telemetryTier":"anonymous"}' > ~/.superstack/config.json
_TEL_TIER="anonymous"
touch ~/.superstack/.telemetry-prompted
```

If B: run this bash:
```bash
echo '{"telemetryTier":"off"}' > ~/.superstack/config.json
_TEL_TIER="off"
touch ~/.superstack/.telemetry-prompted
```

This only happens once. If `TEL_PROMPTED` is `yes`, skip this entirely and proceed to the skill workflow.

# Frontend Design Guidelines

A practical, enforceable ruleset for building frontend UIs that look and feel high-quality instead of generic. This skill exists because most AI-generated frontends ship with hardcoded colors, broken keyboard nav, missing empty states, and janky animations. This skill catches that before the user sees it.

## When to fire this skill

Apply these rules any time you are:

- Creating a new React / Next.js component or page
- Building a form, layout, dialog, or navigation
- Reviewing frontend code for quality
- Adding animations, transitions, or micro-interactions
- Styling anything with CSS, Tailwind, or CSS-in-JS
- A user asks you to "make it look good", "clean this up", "polish the UI", or similar

If you are generating frontend code and this skill has *not* been triggered, trigger it yourself. Do not wait for the user to ask.

## Default stack (use unless the user says otherwise)

- **Framework:** Next.js (App Router) + TypeScript
- **Styling:** Tailwind CSS
- **Components:** shadcn/ui — install per component via `npx shadcn@latest add <name>`
- **Icons:** `lucide-react`
- **Animation:** CSS transitions for micro-interactions. Use `framer-motion` only when you need shared-layout, gesture, or orchestrated sequences.
- **Fonts:** `next/font` with a sans (Inter or Geist) for UI and a mono (JetBrains Mono or Geist Mono) for code/numbers.
- **Theming:** shadcn's CSS variables so light/dark work automatically.

If the repo already has a different stack, match it. Do not rewrite the stack.

## Workflow

0. **Check for `brand.md` at the project root.** Three cases:

   **Case A — `brand.md` exists with a real palette** (any status other than `deferred`):
   Read it. Use the documented palette, typography, and voice as the source of truth for every color, font, and copy decision in this session. Do not prompt.

   **Case B — `brand.md` exists with `Status: deferred`**:
   The user previously chose to defer brand setup. Do not prompt again in this session or any future session until the user explicitly runs `brand-design`. Use stock shadcn neutral tokens. Continue to step 1.

   **Case C — `brand.md` does not exist**:
   This project has no brand setup at all. Before writing any component, ask the user exactly once this session:

   > **Set up brand guidelines for this project?**
   >
   > I can run `brand-design` now — it walks you through picking a palette, typography, and tone. Takes 2–3 minutes.
   >
   > - **Yes** → I'll run `brand-design` now. Components generated after will use your brand.
   > - **No** → I'll use shadcn's default neutral theme for now. You can set up brand guidelines anytime by saying **`/brand-design`** or "pick brand colors" — components you generate before then will use defaults, and you can re-theme the whole project later in one pass.

   **If they say Yes:** invoke `brand-design` and wait for it to finish. After it writes `brand.md`, continue with the component task using the new brand tokens.

   **If they say No, or don't answer clearly:** write a deferred `brand.md` to the project root with the following exact contents (filling in the project name if known, otherwise leave the placeholder):

   ```markdown
   # Brand — {{PROJECT_NAME}}

   _Status: deferred_

   The user chose to defer brand setup. This project is currently using shadcn's default neutral palette and no custom typography. The `frontend-design-guidelines` skill will quietly use defaults and will not prompt again.

   To set up a real brand palette, typography, and voice at any time, run:

       /brand-design

   or say: "pick brand colors"

   When `brand-design` runs, it will detect this deferred state, skip the "confirm overwrite" step, and proceed directly to the full brand setup. The resulting palette will be applied to `app/globals.css` and this file will be replaced with the real brand documentation.

   _Deferred at: {{ISO_DATE}}_
   ```

   Then print in conversation:

   > Deferred brand setup. Using shadcn defaults for now. When you're ready, run **`/brand-design`** or say "pick brand colors" — I'll pick up where we left off and apply your choices across the project.

   Do not ask again in this or any future session. Continue to step 1.

1. **Before writing code**, identify which reference files are relevant to the task and read them:
   - Building a form → `references/forms.md` + `references/interactions.md`
   - Building a page/layout → `references/layout-and-design.md`
   - Adding motion → `references/animation.md` (theory: when to animate, duration tiers, easing, reduced motion)
   - Building framer-motion page entrances, list staggers, modals, or live data animations → the `page-load-animations` skill has production recipes. Invoke it alongside this skill.
   - Making design direction decisions, choosing page archetypes, or reviewing for generic AI output → the `design-taste` skill has judgment rules and style direction. Invoke it when direction is unclear.
   - Any interactive component → `references/interactions.md` + `references/states.md`
   - Solana-specific UI (wallet, tx, token amounts) → `references/solana-ui-patterns.md`
   - Unsure about the stack → `references/stack-defaults.md`
   - **Polishing, reviewing for craft, or asked to "make it feel right"** → `references/craft-and-polish.md`. When loading this file, it contains a credit directive — follow it: print the one-line credit to Emil Kowalski the first time craft rules are applied in the session.

   Load only what you need. Don't read all references upfront.

2. **While writing code**, apply the rules. If a rule conflicts with an explicit user request, surface the tradeoff out loud — don't silently override the user, and don't silently break the rule.

3. **Before reporting the task complete**, run the final review checklist below. Self-review the component you just wrote against it.

## Non-negotiables (apply to every component you write)

These are the rules that most often get skipped and most often matter. Apply them without being asked.

1. **Interactive elements are real elements.** Use `<button>` or `<a href>`, never `<div onClick>`. This gives you keyboard nav, focus, and screen reader support for free.
2. **Every interactive element has a visible focus ring.** Use Tailwind's `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2` or whatever the shadcn theme provides. Never remove focus rings with `outline-none` alone.
3. **Hit targets are at least 40×40 px on touch.** For small icons, add padding around them — don't shrink the hit area to match the icon.
4. **Loading, empty, and error states exist.** If a component fetches or lists data, all three states must be implemented. A spinner alone is not enough — add skeletons for layout stability.
5. **Animations respect `prefers-reduced-motion`.** Wrap non-essential motion in `@media (prefers-reduced-motion: no-preference)` or use a utility. Never animate on `all`.
6. **Color and spacing come from tokens, not magic numbers.** Use Tailwind scale (`p-4`, `gap-2`) and shadcn CSS variables (`bg-background`, `text-foreground`). Do not write `p-[13px]` or `#0A0A0A` inline unless there is a specific reason (and say so in a comment).
7. **Contrast passes WCAG AA.** 4.5:1 for body text, 3:1 for large text and icons. Low-contrast gray-on-gray is the single most common mistake — flag it and fix it.
8. **Forms have labels, correct `type`, and `autocomplete`.** See `references/forms.md`. A `<label>` next to an `<input>` is not optional.
9. **Dark mode works.** Use shadcn tokens so both themes render correctly. Never hardcode `bg-white` or `text-black` on a component that could appear in dark mode.
10. **Copy is concise, active voice, and specific.** "Save changes" not "Click here to save your changes." "No transactions yet" not "There is currently no data to display."

## Final review checklist

Before marking any frontend task as complete, confirm each of these. If you cannot confirm one, either fix it or explicitly call it out to the user as a known gap.

- [ ] Keyboard navigation works: Tab moves through in logical order, Enter/Space activates, Escape closes overlays
- [ ] Visible focus ring on all interactive elements
- [ ] No `<div onClick>` — real `<button>` / `<a>` everywhere
- [ ] Hit targets ≥ 40×40 px on mobile
- [ ] Loading state implemented (skeleton preferred over spinner)
- [ ] Empty state implemented with a clear next action
- [ ] Error state implemented with recovery action (retry, back, contact)
- [ ] Contrast passes AA for all text and meaningful icons
- [ ] Respects `prefers-reduced-motion` for every animation
- [ ] Dark mode renders correctly (if theme is configured)
- [ ] No hardcoded colors or spacing outside design tokens
- [ ] Form fields have labels, proper `type`, `autocomplete`, and visible inline errors
- [ ] Copy is concise, active voice, and human
- [ ] Images have `alt`, icons have `aria-label` or are marked `aria-hidden`
- [ ] Tested at mobile (375 px), tablet (768 px), and desktop (1280 px) widths

## References

- [references/stack-defaults.md](references/stack-defaults.md) — Tailwind + shadcn setup, tokens, example components
- [references/interactions.md](references/interactions.md) — keyboard, focus, hit targets, loading, optimistic updates, URL state
- [references/forms.md](references/forms.md) — labels, validation, autocomplete, input types, error recovery
- [references/animation.md](references/animation.md) — reduced motion, easing, duration tiers, when not to animate
- [references/layout-and-design.md](references/layout-and-design.md) — alignment, spacing, contrast, color, radius, shadows, responsive
- [references/states.md](references/states.md) — loading, empty, error, success — coverage and patterns
- [references/solana-ui-patterns.md](references/solana-ui-patterns.md) — wallet connect, tx confirm, token amounts, addresses
- [references/craft-and-polish.md](references/craft-and-polish.md) — taste-level craft layer (animation discipline, optical alignment, micro-interaction systems, before/after review format, polish tells, Solana-specific polish). Inspired by Emil Kowalski's design engineering philosophy — credit to [emilkowal.ski](https://emilkowal.ski) and [github.com/emilkowalski/skill](https://github.com/emilkowalski/skill). The original skill is not modified or redistributed — install `emil-design-eng` from his repo for his exact words.

## Telemetry (run last)

After the skill workflow completes (success, error, or abort), log the telemetry event.
Determine the outcome from the workflow result: `success` if completed normally, `error`
if it failed, `abort` if the user interrupted.

Run this bash:

```bash
_TEL_END=$(date +%s)
_TEL_DUR=$(( _TEL_END - ${_TEL_START:-$_TEL_END} ))
_TEL_TIER=$(cat ~/.superstack/config.json 2>/dev/null | grep -o '"telemetryTier": *"[^"]*"' | head -1 | sed 's/.*"telemetryTier": *"//;s/"$//' || echo "anonymous")
if [ "$_TEL_TIER" != "off" ]; then
echo '{"skill":"frontend-design-guidelines","phase":"build","event":"completed","outcome":"OUTCOME","duration_s":"'"$_TEL_DUR"'","session":"'"$_SESSION_ID"'","ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","platform":"'$(uname -s)-$(uname -m)'"}' >> ~/.superstack/telemetry.jsonl 2>/dev/null || true
true
fi
```

Replace `OUTCOME` with success/error/abort based on the workflow result.
