---
name: brand-design
description: Generate, preview, and apply a brand color palette (plus typography, gradients, and tone/voice) to a frontend project. Use when a user says "pick brand colors", "choose a color palette", "brand design", "generate a palette", "theme this project", "what colors should I use", "brand identity", "design my brand", "set up brand colors", "time to build the frontend", "let's start the UI", "make this look branded", or any time a project is about to start frontend work and has no brand.md yet. Presents 6 candidate palettes as a visual HTML preview opened in the user's browser, supports an infinite regenerate loop until the user is satisfied, then writes the chosen palette to shadcn CSS variables (light + dark), wires up typography via next/font, derives brand gradients, and writes brand.md for future reference.
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
_TEL_EVENT='{"skill":"brand-design","phase":"build","event":"started","ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}' 
echo "$_TEL_EVENT" >> ~/.superstack/telemetry.jsonl 2>/dev/null || true
_CONVEX_URL=$(cat ~/.superstack/config.json 2>/dev/null | grep -o '"convexUrl":"[^"]*"' | head -1 | cut -d'"' -f4 || echo "")
[ -n "$_CONVEX_URL" ] && curl -s -X POST "$_CONVEX_URL/api/mutation" -H "Content-Type: application/json" -d '{"path":"telemetry:track","args":{"skill":"brand-design","phase":"build","status":"success","version":"0.2.0","platform":"'$(uname -s)-$(uname -m)'","timestamp":'$(date +%s)000'}}' >/dev/null 2>&1 &
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

# Brand Design

Turn a project from "unthemed shadcn default" into something with real identity. This skill runs the full brand pass: palette, typography, gradients, tone/voice. Pairs with `scaffold-project` (runs after it) and `frontend-design-guidelines` (which reads the `brand.md` this skill writes).

## When to fire this skill

Apply this skill any time the user is:

- Starting frontend work on a newly scaffolded project and has no `brand.md`
- Explicitly asking for brand colors, a palette, or a theme
- Asking what the app "should look like" before any UI code is written
- Unhappy with a stock shadcn neutral theme and wants personality

If the user is already deep in component work, **do not interrupt** to run this skill unless they ask. Offer it once at the start of the frontend phase, then drop it.

## Prerequisites check

Before starting, quickly read the project to ground the interview:

1. `.superstack/idea-context.md` if present — gives you the product name, category, and audience
2. `.superstack/build-context.md` if present — tells you the stack
3. `package.json` — confirms Next.js + Tailwind + shadcn
4. `app/globals.css` — current theme (usually shadcn default)
5. `brand.md` in project root — **three cases**:

   **Case A — `brand.md` does not exist**: first-time setup. Proceed normally.

   **Case B — `brand.md` exists with `Status: deferred`**: the user previously deferred brand setup via `frontend-design-guidelines`'s Step 0. Treat this as first-time setup — do NOT ask "keep or replace?" The deferred file is a placeholder, not a real palette. Tell the user:

   > Picking up where we left off. You deferred brand setup earlier — I'll run the full interview now and replace the deferred placeholder with your choices.

   Then proceed to Step 1 normally. When Step 8 writes the real `brand.md`, it overwrites the deferred file — no backup needed because the deferred file has no real content to preserve.

   **Case C — `brand.md` exists with a real palette** (any status other than `deferred`): show the user the current palette name and ask before overwriting:

   > You already have a brand palette set up: **{{CURRENT_NAME}}**. Want to:
   >
   > 1. Keep it and exit — I won't touch anything
   > 2. Replace it — I'll back up the current `brand.md` to `brand.md.bak` and run a fresh setup
   > 3. Tweak it — tell me what you want to change and I'll regenerate variations around the current palette

   Wait for the user's response. Never overwrite a real palette without explicit confirmation.

If the project is not a Next.js + Tailwind project, the skill still works but the "apply" step adapts — it writes the palette to `brand.md` only and explains how the user can map it into their stack manually.

## Workflow

### Step 1 — Context interview

Ask four short questions. Do not skip. Do not combine. Wait for answers between questions.

1. **Product name + one line of what it does** (e.g., "SolFeed — a realtime Solana activity feed"). If you already have this from `idea-context.md`, confirm: "I see this is {name} — {description}. Correct?"

2. **Category** — pick one, or the closest match:
   `defi` · `infra/data` · `consumer/social` · `memecoin/playful` · `ai/tech` · `nft/creative` · `tooling/dev`

3. **Mood** — pick 1 or 2 from this list. If user picks more than 2, push back: "Two is the max — which two matter most?"
   `minimal` · `bold` · `warm` · `calm` · `playful` · `serious` · `technical` · `premium`

4. **Reference brands** — "Any existing apps or sites you like the feel of? (Optional — 1 to 3 is ideal.)" Accept "no" as a valid answer.

### Step 2 — Generate 6 candidate palettes

Using the answers from step 1:

- Read `references/palette-recipes.md` and select **3 curated palettes** that match the category × mood intersection. If fewer than 3 exact matches exist, fall back to adjacent moods (e.g., "calm" is adjacent to "serious" and "minimal").
- Read `references/palette-generation.md` and generate **3 algorithmic variants** — one that tightly matches the mood, one that pushes slightly bolder, one that pushes slightly softer. Vary hue/saturation/lightness across the three so the user sees range.
- For each palette, compute the full shadcn token set (both light and dark mode) using `references/shadcn-integration.md`.
- Verify every palette against `references/contrast-rules.md`. If any token pair fails WCAG AA, auto-adjust lightness until it passes. If it can't be made to pass, drop the palette and generate a replacement.

Each candidate palette has:
- A short memorable name (two words, e.g., "Midnight Signal", "Forest Stake")
- A one-line vibe (e.g., "tech · serious · trustworthy")
- 5 seed colors in OKLCH + hex: `bg-base`, `bg-elevated`, `primary`, `primary-soft`, `fg-base`
- Derived full shadcn token set for light mode and dark mode
- All contrast pairs verified

### Step 3 — Render the HTML preview

Read `references/html-preview.md` for the exact HTML template **and** the contextual mini-UI templates. The palette preview shows the SAME mini-UI rendered 6 times with 6 different palette tokens — only the colors change across the 6 sections. This is the whole point: the user sees how their **specific product** looks across 6 brand options.

**Pick the contextual mini-UI template** based on the interview's category answer and product description. The options are in `html-preview.md`'s "Contextual mini-UI templates" section:

- `wallet` — for wallet apps, portfolio trackers, custody (balance + send/receive/swap)
- `swap` — for DEXes, AMMs, swap UIs, bridges (token in → token out)
- `staking` — for staking dashboards, lending vaults, yield (supplied + APR)
- `nft` — for NFT marketplaces, collections, drops (floor + buy)
- `dashboard` — for analytics, data tools, observability (KPI card)
- `social` — for feeds, chat, community (post card)
- `generic` — fallback for anything unclear (welcome + search)

Pick by category first; fall back to keyword matches in the product description and reference brands. **Never use `generic` when a specific template clearly fits** — a wallet app should see wallet UI, not "Welcome back."

Write the filled template to:

```
<project-root>/.brand-preview/index.html
```

Each of the 6 palettes is rendered as a stacked section with the chosen contextual mini-UI. All six sections share a single light/dark toggle at the top.

After writing the file, open it automatically:

```bash
# macOS
open .brand-preview/index.html
# linux
xdg-open .brand-preview/index.html 2>/dev/null
# windows
start .brand-preview/index.html
```

Detect the OS (`uname -s`) and run the right command. If `open`/`xdg-open`/`start` is unavailable, print the absolute `file://` path and tell the user to open it manually.

Tell the user in the conversation:

> I've opened a preview in your browser with 6 candidates. Take a look and tell me:
> - Pick one: "I'll take 3"
> - Ask for variations: "more like 2 but cooler" or "more minimal"
> - Reject all: "none" or "nothing fits"

### Step 4 — Regenerate loop

Parse the user's next message. Match against these intents, in order:

| Pattern | Intent | Action |
|---|---|---|
| `<number>` (1-6), or "take N", or "I like N", or "the Nth one" | **Pick** | Go to step 5 with the chosen palette |
| "more like N", "variations of N", "N but {adjective}", "tweak N" | **Vary around N** | Regenerate 6 new palettes all derived from palette N per `palette-generation.md` variation rules (±15% on saturation, ±10 hue, re-roll secondary). Back to step 3. |
| "more {adjective}", "cooler", "warmer", "more minimal", "brighter", "darker", "softer" | **Adjust mood** | Keep the original category but add or replace the adjective in the mood. Back to step 2. |
| "none", "nothing fits", "all no", "start over", "different direction" | **Reset** | Go back to step 1 question 3 (mood) and ask "what didn't work about these?" Then regenerate from scratch. |
| "more" / "show me more" | **More of same** | Regenerate 6 fresh candidates with the same mood/category. Back to step 2. |
| Ambiguous | **Clarify** | Ask: "Do you want to pick one of these, see variations of a specific one, or try a different direction?" |

**There is no iteration limit.** The user stays in the loop until they explicitly pick or quit. If they quit ("nevermind", "let's skip this"), stop the skill cleanly — do not force a palette on them.

### Step 5 — Apply the chosen palette

Only after the user has picked:

1. **Back up the existing theme**. Copy `app/globals.css` to `app/globals.css.bak`. Never skip this.
2. **Write the new shadcn tokens** to `app/globals.css` under `:root` (light) and `.dark` (dark). Use the exact CSS block from `references/shadcn-integration.md`. Preserve everything else in the file (Tailwind imports, custom layers, etc.) — only replace the token block.
3. **Verify the contrast on the final written values** one more time. If somehow the write corrupts anything, roll back from the backup and warn the user.
4. **Run a brief sanity check**: print a summary of the 4 most important tokens to the conversation so the user can see the applied change: `--background`, `--foreground`, `--primary`, `--primary-foreground`.

### Step 6 — Typography pairing

Typography gets the same HTML preview treatment as the palette. **Never present font options as plain text in conversation** — always render them visually in the browser.

1. **Read `references/typography-pairings.md`** and look up the 6 candidate font pairs for the chosen palette's mood (the "Mood → 6 candidates mapping" table). If the user picked two moods, blend the two mood rows per the instructions in that file.

2. **Read `references/typography-preview.md`** for the exact HTML template. Fill it with:
   - The user's chosen palette's CSS variables (so each font pair renders on the real brand, not on a white page)
   - The 6 font pairs from step 1, each with its `--pair-sans`, `--pair-mono`, and `--pair-serif` values
   - The project name, description, and category-appropriate display sample (see the sample content table in `typography-preview.md`)
   - Google Fonts `<link>` URL covering all 6 pairs — every font in the file is on Google Fonts, served free

3. **Write to** `<project-root>/.brand-preview/typography.html` (same folder as the palette preview).

4. **Open it** with the same OS-detection command used in step 3 (`open` / `xdg-open` / `start`).

5. **Tell the user in conversation:**

   > I've opened a typography preview with 6 font pairs, each rendered on your chosen palette so you see exactly how they look on your brand. Pick **1-6**, or say **"skip"** to default to Inter + JetBrains Mono.

6. **Wait for the user's response** and parse the intent per the "User response parsing" table in `typography-preview.md`:
   - Number 1-6, or "I'll take N", or "the Nth one" → pick that pair
   - "skip" / "neither" / "no" / unclear → default to Pair A (Inter + JetBrains Mono), tell the user
   - "more" / "show me all" → re-render the preview with all 9 pairs from `typography-pairings.md`

7. **Wire the chosen pair** (or the default):
   - Update `app/layout.tsx` (or wherever the root layout lives) with `next/font/google` imports for the chosen pair
   - Update the `tailwind.config.*` `fontFamily` section if the project uses `font-sans` / `font-mono` utilities
   - Add the font CSS variables (`--font-sans`, `--font-mono`, and `--font-serif` if the pair includes a serif) to `globals.css` so they work with shadcn's token system
   - For Tailwind v4, use the `@theme` block; for v3, extend `theme.fontFamily` in the config

8. **Tell the user what was applied**, including whether it was their explicit pick or the default fallback:

   > Applied **Inter + JetBrains Mono** (your pick). Wired via `next/font/google` in `app/layout.tsx`. CSS variables `--font-sans` and `--font-mono` are now available on every shadcn token.

**Default handling — always safe:** if the user picks "neither", "skip", "no", or gives an unclear/missing answer, default to Inter + JetBrains Mono (Pair A). Never end this step with zero typography configured. See `typography-pairings.md`'s "The default — Inter + JetBrains Mono" section.

### Step 7 — Gradient derivation (optional)

Ask: "Want brand gradients too? I'll derive 2 — a subtle background gradient and a brand accent gradient. (y/n)"

If yes, read `references/gradient-recipes.md` and derive both. Write them as CSS variables (`--gradient-bg`, `--gradient-accent`) in `globals.css` and export them as Tailwind utilities via the config.

### Step 8 — Write brand.md

Read `references/brand-md-template.md` and write the filled template to the project root as `brand.md`. This file contains:

- Project name and one-line description
- Chosen palette name, seeds, and full shadcn token set (light + dark)
- Typography choice
- Gradients (if generated)
- Tone/voice notes (3 short paragraphs, auto-derived from mood)
- Usage dos-and-don'ts

This is the artifact future sessions (and other skills) can read to understand the brand.

### Step 9 — Close the loop

Tell the user in conversation:

- What was applied (palette name, typography, gradients if any)
- Where the backup went (`app/globals.css.bak`)
- To run `pnpm dev` and view the result
- To delete `.brand-preview/` once they're happy: `rm -rf .brand-preview/`
- That `brand.md` has been written and will be read by `frontend-design-guidelines` on future component work

## Non-negotiables

1. **Every generated palette passes WCAG AA.** Body text 4.5:1, large text and icons 3:1. Auto-adjust until it does or drop the palette. See `references/contrast-rules.md`.
2. **Light and dark are both derived from the same seeds**, not independently. They must feel like the same brand at different times of day.
3. **OKLCH, not HSL.** All seed definitions and derivations use OKLCH. Hex is for display only.
4. **Back up before applying.** Always copy `app/globals.css` → `app/globals.css.bak` before writing the new tokens.
5. **Never scrape external sites.** All palette sources are inside the skill's own references. No WebFetch of ColorHunt, Coolors, etc. at runtime.
6. **The regenerate loop has no hard limit.** The user decides when they're satisfied.
7. **Do not force a palette.** If the user quits the picker ("never mind"), exit cleanly. No pressure.
8. **Confirm before overwriting an existing `brand.md`.** Show the current values first.
9. **Tailwind + shadcn are the default application target.** If the project uses something else, write to `brand.md` only and tell the user how to map it.

## Final checklist

Before marking the skill complete, confirm:

- [ ] User explicitly picked a palette (not assumed)
- [ ] All 12+ shadcn tokens derived for both light and dark mode
- [ ] Contrast verified on every foreground/background pair (AA pass)
- [ ] `app/globals.css.bak` exists (backup was made)
- [ ] `app/globals.css` updated with new `:root` and `.dark` token blocks
- [ ] Typography wired up via `next/font` (if user picked a pair)
- [ ] Gradients written to CSS variables (if user opted in)
- [ ] `brand.md` written to project root
- [ ] `.brand-preview/` still exists (user may want to re-check before deleting)
- [ ] User told how to see the result (`pnpm dev`) and how to clean up (`rm -rf .brand-preview/`)
- [ ] User told that future `frontend-design-guidelines` sessions will read `brand.md`

## References

- [references/palette-recipes.md](references/palette-recipes.md) — 30 curated palettes by category × mood
- [references/palette-generation.md](references/palette-generation.md) — OKLCH rules for algorithmic generation + variation
- [references/shadcn-integration.md](references/shadcn-integration.md) — map 5 seeds to the full shadcn token set
- [references/contrast-rules.md](references/contrast-rules.md) — WCAG AA checks and auto-adjust
- [references/html-preview.md](references/html-preview.md) — palette preview HTML template + contextual mini-UI templates (wallet/swap/staking/nft/dashboard/social/generic)
- [references/typography-pairings.md](references/typography-pairings.md) — 9 font pairs (all Google Fonts), mood → 6 candidates mapping
- [references/typography-preview.md](references/typography-preview.md) — typography preview HTML template (6 font pairs rendered on the chosen palette)
- [references/gradient-recipes.md](references/gradient-recipes.md) — deriving brand gradients from a palette
- [references/brand-md-template.md](references/brand-md-template.md) — the brand.md output template

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
echo '{"skill":"brand-design","phase":"build","event":"completed","outcome":"OUTCOME","duration_s":"'"$_TEL_DUR"'","session":"'"$_SESSION_ID"'","ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","platform":"'$(uname -s)-$(uname -m)'"}' >> ~/.superstack/telemetry.jsonl 2>/dev/null || true
true
fi
```

Replace `OUTCOME` with success/error/abort based on the workflow result.
