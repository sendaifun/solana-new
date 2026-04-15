---
name: page-load-animations
description: Fix janky page loads where everything appears at once. Production framer-motion recipes for choreographed page entrances, staggered lists, modal transitions, filter cross-fades, live data animations, and micro-interactions. Use when building or reviewing any page that loads content, when animations feel broken or janky, when framer-motion code needs production patterns, or when the user says "page load animation", "entrance choreography", "stagger animation", "framer-motion recipe", "page feels janky", "everything appears at once", "spring animation", "modal animation", "dropdown animation", "rolling numbers", "chart morph", "donut reveal", "filter transition", "tab animation", "micro-interaction", "hover animation", "button feedback", "AnimatePresence", or "framer-motion pattern". Use proactively whenever writing page-level components or reviewing animation code.
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
_TEL_EVENT='{"skill":"page-load-animations","phase":"build","event":"started","ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}'
echo "$_TEL_EVENT" >> ~/.superstack/telemetry.jsonl 2>/dev/null || true
_CONVEX_URL=$(cat ~/.superstack/config.json 2>/dev/null | grep -o '"convexUrl":"[^"]*"' | head -1 | cut -d'"' -f4 || echo "")
[ -n "$_CONVEX_URL" ] && curl -s -X POST "$_CONVEX_URL/api/mutation" -H "Content-Type: application/json" -d '{"path":"telemetry:track","args":{"skill":"page-load-animations","phase":"build","status":"success","version":"0.2.0","platform":"'$(uname -s)-$(uname -m)'","timestamp":'$(date +%s)000'}}' >/dev/null 2>&1 &
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

> **Wrong skill?** See [SKILL_ROUTER.md](../../SKILL_ROUTER.md) for all available skills.

# Page Load Animations

> Patterns adapted from battle-tested framer-motion recipes. Original inspiration: suzi-ux-motions.

Production framer-motion recipes for making page loads feel intentional instead of chaotic. This skill exists because the most common animation problem in crypto UIs is not missing animation — it's everything appearing at once with no choreography, stagger, or spring physics. The result feels broken even when the code is correct.

This skill provides the implementation recipes. For animation theory (when to animate, duration tiers, easing curves, reduced-motion), see `frontend-design-guidelines/references/animation.md`. **This skill inherits all those baseline constraints.**

## Authority Model

- `animation.md` = baseline constraints (duration tiers, easing, reduced-motion, GPU properties)
- **This skill** = production recipes that implement within those constraints
- `frontend-design-guidelines` delegates TO this skill for framer-motion patterns, not the other way around

## Setup

```bash
npm install framer-motion
```

CSS transitions are the default for simple state changes (per `animation.md`). Reach for framer-motion when you need: spring physics, orchestrated sequences, `AnimatePresence` exit animations, gesture/drag, or shared-layout transitions.

## When to Fire This Skill

Apply these recipes any time you are:

- Building a page that loads multiple sections (dashboard, detail screen, landing page)
- Staggering a list, card grid, or table on mount
- Animating a modal, dropdown, or popover
- Switching tabs or filters where content changes and height shifts
- Displaying live-updating numbers, charts, or donut graphs
- Adding hover feedback, chevron rotation, or tooltip entrance
- Reviewing existing framer-motion code for anti-patterns
- A user says "the page feels janky" or "everything appears at once"

If you are building a page-level component and this skill has not been triggered, trigger it yourself.

## Workflow

### Before writing animation code, identify which reference file is relevant and read it:

- Orchestrating a page load entrance → [references/page-choreography.md](references/page-choreography.md)
- Staggering a list or card grid → [references/list-stagger.md](references/list-stagger.md)
- Animating a modal, dropdown, or popover → [references/popups-modals.md](references/popups-modals.md)
- Switching tabs/filters with height changes → [references/filter-transitions.md](references/filter-transitions.md)
- Rolling numbers, chart morphs, donut reveals → [references/live-data.md](references/live-data.md)
- Button feedback, chevron rotation, tooltips → [references/hover-micro.md](references/hover-micro.md)
- Looking up a spring preset or easing curve → [references/spring-presets.md](references/spring-presets.md)

Load only what you need. Don't read all references upfront.

### Mode 1: Building new animations

1. Read the relevant reference file(s) for the pattern you need.
2. Start with the ASCII storyboard comment — plan the full sequence before writing any code.
3. Define a TIMING object with named constants for every delay.
4. Implement using the patterns from the reference. Use spring physics by default.
5. Verify against the non-negotiables below before reporting complete.

### Mode 2: Reviewing existing animation code

1. Scan for common anti-patterns:
   ```bash
   # layout prop on parent AND children (jitter source)
   grep -rn "layout" --include="*.tsx" --include="*.jsx" | head -20
   # staggerChildren with AnimatePresence (unreliable)
   grep -rn "staggerChildren" --include="*.tsx" --include="*.jsx" | head -10
   # transition-all (animates unintended properties)
   grep -rn "transition-all\|transition: all" --include="*.tsx" --include="*.css" | head -10
   # Missing reduced-motion handling
   grep -rn "motion\.\|animate=" --include="*.tsx" -l | while read f; do grep -L "reduced-motion\|useReducedMotion\|motion-safe" "$f"; done | head -10
   ```
2. For each issue found, reference the specific anti-pattern rule from the relevant reference file.
3. Provide exact code patches.

### Mode 3: Quick lookup

If the user asks "what spring config for X?" or "how do I animate Y?", answer directly from the reference files and spring presets without running a full workflow.

## Non-Negotiables

1. **ASCII storyboard comment.** Every animated page starts with a timeline comment showing the full sequence at a glance. Times are absolute from mount, right-aligned.
2. **Named timing constants.** Every delay goes in a TIMING object at the top of the file. No magic numbers in `setTimeout` or `delay` props.
3. **Spring-first.** Prefer spring physics over duration-based easing for natural, interruptible motion. Only use duration for fades and tooltips.
4. **Stage-driven sequencing.** A single integer state drives multi-section sequences. No scattered boolean flags.
5. **`stage >= N` pattern.** Sections stay visible once they appear. Never `stage === N`.
6. **Never `layout` on both parent AND children.** This is the #1 cause of jittery filter animations. Use `AnimatedHeight` with `ResizeObserver` instead.
7. **Never `staggerChildren` with `AnimatePresence`.** It doesn't work reliably. Use manual `delay: i * stagger`.
8. **Respect `prefers-reduced-motion`.** Inherited from `animation.md`. Every animation must degrade gracefully.
9. **Mount vs update distinction.** Mount animations are dramatic (600ms, expressive easing). Update animations are subtle (150ms, smooth easing). Different phases, different configs.

## Design Principles

1. **Storyboard-first** — plan the sequence before writing code
2. **Spring-first** — spring physics over duration-based easing
3. **Named constants** — every timing value is declared, not inline
4. **Stage-driven** — single integer state orchestrates complex sequences
5. **Data-driven** — repeated elements use `.map()` with index-based delays, not copy-pasted blocks
6. **Measure, don't guess** — `ResizeObserver` for dynamic heights, never hardcoded pixel heights

## Integration with Other Skills

- **`frontend-design-guidelines`** — the general UI skill. It delegates framer-motion work to this skill. When both fire, `animation.md` baseline rules are authoritative for constraints; this skill is authoritative for implementation recipes.
- **`number-formatting`** — for live-updating number displays, use `number-formatting` for the formatting spec and this skill for the rolling-digit animation pattern.
- **`brand-design`** — brand colors may affect animation color choices (positive/negative indicators, accent highlights).

## Resources

### references/

- [references/page-choreography.md](references/page-choreography.md) — Stage-driven page entrance with ASCII storyboards, TIMING objects, section configs, spring presets, and the `stage >= N` pattern
- [references/list-stagger.md](references/list-stagger.md) — Index-based stagger delays, StaggerItem wrapper, timing/offset guidelines, and anti-patterns
- [references/popups-modals.md](references/popups-modals.md) — Three-layer modal animation (backdrop, panel, content stagger), dropdown pattern, close behaviors
- [references/filter-transitions.md](references/filter-transitions.md) — AnimatedHeight with ResizeObserver, cross-fade with keyed wrapper, critical `layout` anti-pattern
- [references/live-data.md](references/live-data.md) — Rolling number digits (slot machine), SVG donut reveals, chart morphing, mount vs update phase management
- [references/hover-micro.md](references/hover-micro.md) — CSS vs framer-motion decision matrix, button feedback, chevron rotation, tooltip entrance, copy feedback
- [references/spring-presets.md](references/spring-presets.md) — All presets as tables + JSON: spring configs, easing curves, stagger values, duration presets

### Cross-skill references

- `frontend-design-guidelines/references/animation.md` — baseline constraints this skill inherits (duration tiers, easing, reduced-motion, GPU properties)
- `number-formatting` — for number display rules (formatting, not animation)

## Quick Start

```bash
# Triggers:
#   "Fix my page load — everything appears at once"
#   "Add entrance animations to this dashboard"
#   "The modal animation feels janky"
#   "How do I stagger these cards?"
#   "What spring config should I use for a dropdown?"
#   "Add rolling number animation to the balance display"
#   Automatically fires when building page-level components
```

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
echo '{"skill":"page-load-animations","phase":"build","event":"completed","outcome":"OUTCOME","duration_s":"'"$_TEL_DUR"'","session":"'"$_SESSION_ID"'","ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","platform":"'$(uname -s)-$(uname -m)'"}' >> ~/.superstack/telemetry.jsonl 2>/dev/null || true
true
fi
```

Replace `OUTCOME` with success/error/abort based on the workflow result.
