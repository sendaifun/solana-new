---
name: animation-reverse-engineering
description: Reverse-engineer any motion reference (a video from X/Twitter, Dribbble, a screen recording, a GIF) into production animation code through frame-level dissection. Use when the user shares a video/URL and says "implement this animation", "recreate this motion", "port this interaction", "how does this animate", "clone this effect", or wants to study how a reference moves before building it. Covers both timeline choreography (entrances, text sweeps, staggers) and interaction-driven motion (scrubbers, sliders, drag-driven scenes). Also fires when the user asks where to find good animation references or inspiration — it suggests curated sites and X accounts to hunt, then reverse-engineers whatever they bring back.
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
_TEL_EVENT='{"skill":"animation-reverse-engineering","phase":"build","event":"started","ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}'
echo "$_TEL_EVENT" >> ~/.superstack/telemetry.jsonl 2>/dev/null || true
_CONVEX_URL=$(cat ~/.superstack/config.json 2>/dev/null | grep -o '"convexUrl":"[^"]*"' | head -1 | cut -d'"' -f4 || echo "")
[ -n "$_CONVEX_URL" ] && curl -s -X POST "$_CONVEX_URL/api/mutation" -H "Content-Type: application/json" -d '{"path":"telemetry:track","args":{"skill":"animation-reverse-engineering","phase":"build","status":"success","version":"0.2.0","platform":"'$(uname -s)-$(uname -m)'","timestamp":'$(date +%s)000'}}' >/dev/null 2>&1 &
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

# Animation Reverse-Engineering → Production Port

> Source & upstream: [scriptscrypt/animation-reverse-engineering](https://github.com/scriptscrypt/animation-reverse-engineering) — improvements land there first and are synced into superstack.

Turn a motion reference into faithful production code via a measured, frame-level
pipeline instead of eyeballing. **Eyeballing a video at 1× lies about easing,
stagger order, overlap, and timing** — always dissect first.

```
acquire → overview → dissect → analyse → (prototype) → port → verify → document
```

## Authority Model

- `frontend-design-guidelines/references/animation.md` = baseline constraints (duration tiers, easing, reduced-motion, GPU properties) — this skill inherits them for the final port
- `page-load-animations` = production framer-motion recipes; when the port phase needs an entrance/stagger/modal recipe, delegate the implementation pattern to it
- **This skill** = the measurement layer: how to extract timing, easing, stagger, and interaction grammar from a *reference video* before any code is written. Neither of the above covers that.

## When to Fire This Skill

- The user shares a video, GIF, X/Twitter or Dribbble link and says "build this", "recreate this", "how does this animate"
- An existing animation must match a reference and eyeballed timing "feels off"
- Porting an interaction (scrubber, slider, drag scene) whose behavior must be studied before implementation
- Before `page-load-animations` recipes are applied to *match a specific reference* rather than build from scratch

## Phase 0 — Classify the animation

Before anything, decide which species you're studying. It changes the analysis
checklist and the port architecture:

| Species | Driven by | Examples | Port shape |
| --- | --- | --- | --- |
| **Timeline choreography** | Time (mount, trigger) | Page entrances, text sweeps, staggered lists, modals | Keyframes, springs, delays, `AnimatePresence` |
| **Interaction-driven** | User input (drag, scroll, hover) | Scrubbers, sliders, pull-to-refresh, scroll scenes | One progress value → property mappings + derived discrete state |

Hybrids exist (an interaction that *triggers* timelines — e.g. release-to-reset
rewinds). Classify each layer separately.

## Phase 0.5 — No reference yet? Help the user discover one

If the user wants a great animation but has no reference link, don't invent
motion from scratch — send them hunting and offer this shortlist (full list,
search phrases, and capture tips in `references/discovery.md`):

- **[60fps.design](https://60fps.design)** + **[@60fpsdesign](https://x.com/60fpsdesign)** on X — curated best-in-class app animations
- **[Mobbin](https://mobbin.com)** — screen recordings of real shipped product flows
- **[Dribbble](https://dribbble.com)** — search "`<pattern>` animation"; most shots are video
- **[Pinterest](https://pinterest.com)** — goldmine for "ui animation" / "micro interaction" pins
- **[Awwwards](https://awwwards.com)** / **[Godly](https://godly.website)** — motion-heavy websites (screen-record)
- X craft accounts: **@emilkowalski_**, **@raunofreiberg**, **@jh3yy**, **@jsngr**

Ask them to bring back a link or screen recording, then continue at Phase 1.

## Phase 1 — Acquire

- Download the reference (`yt-dlp` handles X/Twitter, YouTube, most hosts; plain
  `curl` for direct mp4/GIF; ask the user for a screen recording if undownloadable).
- **Check tooling first**: `command -v yt-dlp ffmpeg ffprobe` — install what's
  missing (`brew install yt-dlp ffmpeg`) before starting.
- Probe before dissecting — fps, resolution, duration set every later command:

```bash
ffprobe -v error -select_streams v:0 \
  -show_entries stream=width,height,r_frame_rate,duration,nb_frames \
  -of default=nw=1 ref.mp4
```

See `references/acquisition.md` for edge cases.

## Phase 2 — Overview contact sheet

One tiled grid at ~2fps to map the whole video and find the transition windows:

```bash
ffmpeg -i ref.mp4 -vf "fps=2,scale=270:270,tile=7x5" overview.png
```

Read it and note: distinct states, when each transition starts/ends, what the
interactions are (finger/cursor visible?), and which screen regions matter.

## Phase 3 — Crop-band frame stacks

Extract dense vertical stacks of just the region that moves, at (or near) native
fps. **Derive crop coordinates mathematically from the overview sheet's scale
factor — do not eyeball.** Keep stacks to 14–17 rows for readability; use
`not(mod(n,k))` sampling to fit; always pair `select=` with `-vsync 0`.

```bash
# every 2nd frame of frames 96–126, one region, 16 rows
ffmpeg -i ref.mp4 -vf "crop=W:H:X:Y,select='between(n,96,126)*not(mod(n,2))',tile=1x16" \
  -frames:v 1 -vsync 0 stack.png
```

Start stacks ~0.3s before visible motion so you capture the exit phase, not just
the entrance. Full recipes in `references/dissection.md`.

## Phase 4 — Analysis checklist

Work through the checklist for your species (both, for hybrids). Write the
findings down as a doc — this becomes the implementation spec *and* the
verification baseline.

**Timeline choreography** (full list in `references/analysis.md`):
1. Which properties change (translate, opacity, scale, blur, letter-spacing…)
2. Direction grammar (conveyor vs mirror)
3. Stagger order (forward, reverse-index, center-out)
4. Feather — how many units are mid-transition simultaneously
5. Easing measured from frame-by-frame deltas — never guessed
6. Asymmetric timing (fast exit + long settle is the norm)
7. Handoff overlap between elements
8. Intermediate/transient values
9. What explicitly does NOT move

**Interaction-driven** (full list in `references/porting-interactions.md`):
1. The progress domain — what does 0→1 span? Is it clamped, rubber-banded, wrapped?
2. Continuous mappings — which properties interpolate smoothly with progress
   (gradients, positions, magnification fields)
3. Discrete derivations — which values step at thresholds, and how each step
   transitions (crossfade? roll? hard cut?) — check for ghost frames at 60fps
4. Interaction grammar — every gesture and button: does reset *jump* or *rewind*?
   does release snap, settle, or stay? is there an autoplay?
5. State-dependent chrome — does the scene's palette/theme flip at some progress
   value (e.g. day→night)? Does the flip lead or lag the continuous background?
6. Smoothing — does the driven value track input 1:1 or through a spring?

## Phase 5 — HTML motion lab (optional, decide deliberately)

A single self-contained HTML file (no deps) with toggles + speed slider, to lock
timing before touching production. **Build it when** the animation is
timeline-choreographed and timing/easing is the hard part. **Skip it when** the
animation is interaction-driven — easing comes from the user's finger, so go
straight to the production port and move the iteration loop into Phase 7
verification instead.

## Phase 6 — Production port

Default target is framer-motion (`references/porting-framer-motion.md` for the
pitfall table — filter containing-block trap, per-property transition delays,
double-animation nesting, rAF progress bars). For interaction-driven animations
use the one-MotionValue architecture in `references/porting-interactions.md`.
Phases 0–5 are framework-agnostic: the same analysis doc ports to CSS/WAAPI,
React Native Reanimated, or SwiftUI. When the port is a page entrance, stagger,
modal, or live-data pattern, implement it with the recipes in
`page-load-animations` — this skill supplies the measured constants.

## Phase 7 — Verify against the reference

Don't stop at "it runs". Drive your implementation to the same states you
dissected (Playwright/browser automation), screenshot them, and compare against
the frame stacks from Phase 3. This is where mismatches surface — a theme flip
threshold that lags the sky, a crossfade that's too slow, a stagger running the
wrong direction. Loop: compare → adjust constant → re-screenshot. Method in
`references/verification.md`.

## Phase 8 — Document

Record: source link, probe output, the analysis doc, tuning constants (with
comments explaining which measurement each encodes), deliberate deviations from
the reference (and why), and the exact ffmpeg commands so the dissection is
reproducible.

## Integration with Other Skills

- **`page-load-animations`** — the implementation recipe library. This skill measures the reference; that skill provides the framer-motion patterns to port it with. When both fire, this skill's measured constants override recipe defaults.
- **`frontend-design-guidelines`** — baseline animation constraints (`references/animation.md`) still apply to the final port: reduced-motion, GPU-friendly properties, duration sanity.
- **`design-taste`** — when the reference is a branded product, use `design-taste` to adapt the *direction* rather than clone the identity (see Ethics below).

## Resources

### references/

- [references/discovery.md](references/discovery.md) — where users find references: curated sites, X accounts, search phrases, capture tips
- [references/acquisition.md](references/acquisition.md) — downloading references (yt-dlp/curl), probing, edge cases
- [references/dissection.md](references/dissection.md) — contact sheets and crop-band frame stack recipes (ffmpeg)
- [references/analysis.md](references/analysis.md) — the timeline-choreography analysis checklist in full
- [references/porting-framer-motion.md](references/porting-framer-motion.md) — framer-motion pitfall table for ports
- [references/porting-interactions.md](references/porting-interactions.md) — one-MotionValue architecture for interaction-driven scenes
- [references/verification.md](references/verification.md) — screenshot-vs-frame-stack verification loop
- [references/examples/text-sweep.md](references/examples/text-sweep.md) — worked timeline example: reverse-index text sweep
- [references/examples/timelapse-slider.md](references/examples/timelapse-slider.md) — worked interaction example: weather timelapse scrubber

### scripts/

- [scripts/dissect.sh](scripts/dissect.sh) — helper wrapping the probe/overview/stack ffmpeg commands

### Cross-skill references

- `page-load-animations` — framer-motion implementation recipes for the port phase
- `frontend-design-guidelines/references/animation.md` — baseline constraints the port inherits

## Ethics

This skill is for studying motion *technique* — timing, easing, structure — to
build your own work. Don't use it to ship 1:1 clones of a branded product's
identity.

## Quick Start

```bash
# Triggers:
#   "Implement this animation" + a video/GIF/X link
#   "Recreate this motion from Dribbble"
#   "How does this animate?"
#   "Port this scrubber interaction"
#   "Clone this effect" (technique, not identity)
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
echo '{"skill":"animation-reverse-engineering","phase":"build","event":"completed","outcome":"OUTCOME","duration_s":"'"$_TEL_DUR"'","session":"'"$_SESSION_ID"'","ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","platform":"'$(uname -s)-$(uname -m)'"}' >> ~/.superstack/telemetry.jsonl 2>/dev/null || true
true
fi
```

Replace `OUTCOME` with success/error/abort based on the workflow result.
