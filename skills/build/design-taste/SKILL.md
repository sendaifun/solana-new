---
name: design-taste
description: Design direction, judgment calls, and anti-AI-slop review for crypto UIs. Use when the user says "this looks generic", "this looks AI-generated", "anti-slop", "design judgment", "premium feel", "design direction", "what direction should this take", "make this feel more premium", "review for taste", "theme reference", "warm monochrome", "stark minimal", "gradient trust", "workstation dense", "soft consumer", "gallery editorial", "density", "page archetype", "design brief", "pitch deck style", "deck visual direction". Also use when building any new page-level component that needs aesthetic direction before implementation. Does NOT claim "make this look good" or "polish this" — those belong to frontend-design-guidelines.
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
_TEL_EVENT='{"skill":"design-taste","phase":"build","event":"started","ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}'
echo "$_TEL_EVENT" >> ~/.superstack/telemetry.jsonl 2>/dev/null || true
_CONVEX_URL=$(cat ~/.superstack/config.json 2>/dev/null | grep -o '"convexUrl":"[^"]*"' | head -1 | cut -d'"' -f4 || echo "")
[ -n "$_CONVEX_URL" ] && curl -s -X POST "$_CONVEX_URL/api/mutation" -H "Content-Type: application/json" -d '{"path":"telemetry:track","args":{"skill":"design-taste","phase":"build","status":"success","version":"0.2.0","platform":"'$(uname -s)-$(uname -m)'","timestamp":'$(date +%s)000'}}' >/dev/null 2>&1 &
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

# Design Taste

> Design judgment patterns adapted from curated design system references, independent UI craft writing, and observational analysis of high-craft products across SaaS, fintech, trading, and consumer.

The taste layer that sits between brand selection and mechanical implementation. This skill answers: "Given the constraints, what should this actually look like?" It catches generic AI output, makes judgment calls about density and layout, and defines what polished, intentional interfaces feel like.

`frontend-design-guidelines` tells you how to build it right. `brand-design` tells you how to brand it. **This skill tells you what design direction to take.**

## Authority Model

- `brand-design` → palette/typography selection → writes `brand.md`
- **This skill** → design direction, judgment calls, anti-slop review
- `frontend-design-guidelines` → mechanical correctness (a11y, forms, states) → invokes this skill when direction is needed
- `page-load-animations` → framer-motion implementation recipes

`frontend-design-guidelines` delegates direction questions TO this skill. This skill does NOT invoke `frontend-design-guidelines`.

**Conflict resolution with brand.md:** If `brand-design` chose Inter as the typeface, this skill does NOT ban Inter. It ensures Inter is used with intentional weight, tracking, and hierarchy — not as a lazy default. Anti-slop rules apply to thoughtless defaults, not deliberate brand choices.

## When to Fire This Skill

- The user says "this looks generic" or "this feels AI-generated"
- The user asks what direction a page or component should take
- The user wants something to feel "more premium" or "less generic"
- Building a new page and the aesthetic direction is unclear
- Reviewing existing UI for AI-slop patterns
- The user references a design direction ("make it warm and premium", "dense trading feel")

Do NOT fire on "make this look good", "polish this", or "design this page" — those belong to `frontend-design-guidelines`.

## Workflow

### Step 0: Read brand.md if present
Understand the existing aesthetic direction. Respect it — don't override palette or typeface choices.

### Step 1: Identify which reference is relevant
- Checking for generic AI patterns → [references/anti-ai-slop.md](references/anti-ai-slop.md)
- Making layout/density/component decisions → [references/design-judgment.md](references/design-judgment.md)
- Looking for style direction and inspiration → [references/theme-references.md](references/theme-references.md)
- Choosing visual direction for a pitch deck → [references/theme-references.md](references/theme-references.md) § "Pitch Deck Styles"

Load only what you need. Don't read all references upfront.

### Step 2: Apply direction and produce a design brief

When making direction decisions, output a compact **design brief**:

```
Direction: [archetype — e.g., "dark dashboard, warm-monochrome style"]
Density:   [spacious / comfortable / compact]
Surface:   [cards on dark bg / flat sections / panels]
Type mood: [3 descriptors — e.g., "tight, technical, mono-heavy"]
Motion:    [1 descriptor — e.g., "crisp springs, no bounce"]
Do:        [3-5 specific direction choices]
Don't:     [3-5 specific anti-patterns to avoid]
```

### Step 3: Run anti-slop check before reporting complete
Scan for the detection signals in `anti-ai-slop.md`. Flag any that match.

## 3 Modes

### Direction mode
Choosing what the page/component should look like before building. Produces a design brief. Used at the start of UI work.

### Review mode
Auditing existing UI for generic/AI-slop patterns. Diagnostic only — detects problems and names them. For constructive polish suggestions, defer to `craft-and-polish.md` in `frontend-design-guidelines`.

### Quick lookup
"What layout for a dashboard?" → page archetype from `design-judgment.md`.
"What density for a trading surface?" → density guidance.
"How should this card feel?" → component direction.

## Enforceable Rules (code-scannable)

These can be verified by scanning code. Confidence varies:

1. **No pure black `#000` or `#000000` in product UI** — unless it is a deliberate brand token documented in `brand.md` or theme tokens. Grep for exact hex. (high confidence)
2. **No `transition: all` or `transition-all`** — grep for exact string (high confidence)
3. **No arbitrary Tailwind values in spacing** — grep for `p-\[`, `m-\[`, `gap-\[` patterns (medium confidence — some arbitrary values are legitimate)

## Judgment Heuristics (review guidance, not hard rules)

These require visual/contextual judgment and cannot be mechanically checked:

1. Single accent + grayscale preferred — multiple competing colors is a smell
2. Content inside cards/panels, not bare page background
3. Entry takes longer than exit (asymmetric timing)
4. Convergence test: "If someone said AI made this, would they believe immediately?"
5. Typography hierarchy: 3 weights max, 4-5 sizes max
6. Whitespace signals confidence — cramped signals cheap
7. Custom easing curves preferred over CSS defaults (hard to grep reliably — review manually)
8. Shadow opacity should be low (4-8% for cards, 12% max for overlays)

## State Transition Quick Reference

How states should change (the "feel" layer that `states.md` doesn't cover):

| Transition | Feel | Timing |
|---|---|---|
| Skeleton → loaded | Cross-fade, 300-500ms | Show skeleton within 300ms of action |
| Success → idle | Toast auto-dismiss 5s, green flash then fade | Check animation 300ms |
| Error → recovery | Error persists until action, retry button | Shake 200ms (subtle) |
| Filter/sort change | Cross-fade content 120ms, height spring 350ms | Stagger new rows 40ms |
| Mount (first appearance) | Dramatic, expressive | 300-600ms |
| Update (subsequent) | Subtle, smooth | 100-150ms |
| Entry vs exit | Entry takes longer | Enter 300ms, exit 200ms |

## Resources

### references/

- [references/anti-ai-slop.md](references/anti-ai-slop.md) — Detection checklist for generic AI output + fix rules + 11 aesthetic directions
- [references/design-judgment.md](references/design-judgment.md) — Decision trees (cards vs lists, density, asymmetry, form controls, modals), page archetypes, mobile collapse rules
- [references/theme-references.md](references/theme-references.md) — 6 style references (Warm Monochrome, Stark Minimal, Gradient Trust, Workstation Dense, Soft Consumer, Gallery Editorial) + trait index + mix-and-match composition guide

### Cross-skill references

- `frontend-design-guidelines/references/craft-and-polish.md` — constructive polish (this skill is diagnostic, that skill is constructive)
- `frontend-design-guidelines/references/layout-and-design.md` — spacing rules and contrast (this skill provides direction, that provides constraints)
- `brand-design` → `brand.md` — palette and typography choices (this skill respects them)

## Quick Start

```bash
# Triggers:
#   "This looks generic / AI-generated"
#   "What direction should this dashboard take?"
#   "Make this feel more premium"
#   "Review for taste"
#   "Make it feel warm-monochrome / stark-minimal"
#   "What density for this trading surface?"
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
echo '{"skill":"design-taste","phase":"build","event":"completed","outcome":"OUTCOME","duration_s":"'"$_TEL_DUR"'","session":"'"$_SESSION_ID"'","ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","platform":"'$(uname -s)-$(uname -m)'"}' >> ~/.superstack/telemetry.jsonl 2>/dev/null || true
true
fi
```

Replace `OUTCOME` with success/error/abort based on the workflow result.
