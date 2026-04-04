---
name: create-pitch-deck
description: Create a structured pitch deck for a crypto project. Use when a user says "create a pitch deck", "help me pitch", "I need slides", "prepare for demo day", "investor presentation", or "grant application". Reads idea-context.md and build-context.md from prior phases if available.
---

## Preamble (run first)

```bash
_TEL_TIER=$(cat ~/.superstack/config.json 2>/dev/null | grep -o '"telemetryTier":"[^"]*"' | head -1 | cut -d'"' -f4 || echo "off")
_TEL_TIER="${_TEL_TIER:-off}"
_TEL_PROMPTED=$([ -f ~/.superstack/.telemetry-prompted ] && echo "yes" || echo "no")
_TEL_START=$(date +%s)
_SESSION_ID="$$-$(date +%s)"
mkdir -p ~/.superstack
echo "TELEMETRY: $_TEL_TIER"
echo "TEL_PROMPTED: $_TEL_PROMPTED"
if [ "$_TEL_TIER" != "off" ]; then
echo '{"skill":"create-pitch-deck","phase":"launch","event":"started","ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}' >> ~/.superstack/telemetry.jsonl 2>/dev/null || true
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

# Create Pitch Deck

## Overview

Generate a compelling, investor-ready pitch deck using proven frameworks from Sequoia, YC, a16z, and Guy Kawasaki — adapted for crypto/Solana projects. Produces a polished HTML artifact with slide content, speaking notes, narrative arc, and audience-specific tailoring.

This skill doesn't just generate slides — it coaches you through building a narrative that lands.

## Workflow

### Phase 1: Context Gathering

1. Check for `.superstack/idea-context.md` and `.superstack/build-context.md`. Use available context to pre-populate.
2. If no context, run the **Deep Interview** (see below).
3. Check for output from `competitive-landscape` skill (competition data) and `defillama-research` skill (market data). Use if available.

### Phase 2: Deep Interview

Don't just ask "what did you build?" — extract the narrative. Ask these in sequence, adapting based on answers:

**Round 1 — The Story** (ask all at once):
1. What's the one sentence that explains what you do to a stranger at a bar?
2. What personal experience led you to this problem? (Founder-problem fit story)
3. What's the most surprising thing you've learned from users so far?

**Round 2 — The Evidence** (ask based on Round 1):
4. What's your single strongest traction metric? (Users, TVL, transactions, revenue, waitlist)
5. What changed in the last 12 months that makes this possible NOW? (The "Why Now" catalyst)
6. If you removed the blockchain, would the product still work? Why or why not?

**Round 3 — The Ask** (ask based on Round 2):
7. Who is your audience? (Hackathon judges / VCs / Grant committee / Accelerator / Partners)
8. What specific outcome do you want from this pitch? (Funding amount, partnership, acceptance, prize)
9. What's the hardest question you're afraid someone will ask?

Use their answers to select the right narrative framework and audience template.

### Phase 3: Select Narrative Framework

Based on the interview, choose the strongest storytelling approach. Read [references/storytelling-frameworks.md](references/storytelling-frameworks.md) for full details.

| Framework | Best When | Structure |
|-----------|-----------|-----------|
| **PAS** (Problem-Agitate-Solve) | Strong problem, weak traction | Problem → Amplify stakes → Your solution |
| **6-Part Investor Arc** | Raising funding, strong "why now" | The Shift → The Enemy → The Tool → The Proof → The Future → The Invitation |
| **Before-After-Bridge** | Strong demo, visual transformation | Current pain → Friction-free future → Your product bridges |
| **Hero's Journey** | User-centric product, strong testimonials | User's struggle → Your product as the guide → Transformation |
| **Pixar Framework** | Complex technical product, needs simplification | "Once upon a time... Every day... One day... Because of that... Until finally..." |

**Default:** Use the **6-Part Investor Arc** for VCs/accelerators, **PAS** for hackathons, **Before-After-Bridge** for product-led pitches.

### Phase 4: Build the Deck

Read ALL reference files:
- [references/pitch-structure.md](references/pitch-structure.md) — Slide-by-slide framework (Sequoia + YC + Kawasaki hybrid)
- [references/crypto-pitch-mistakes.md](references/crypto-pitch-mistakes.md) — 12 antipatterns that kill pitches
- [references/investor-audience-guide.md](references/investor-audience-guide.md) — Audience-specific tailoring with scoring rubrics
- [references/storytelling-frameworks.md](references/storytelling-frameworks.md) — Narrative frameworks with examples
- [references/crypto-pitch-examples.md](references/crypto-pitch-examples.md) — Real case studies from Phantom, Jupiter, Uniswap, etc.

For each slide:
1. Write the content following the chosen narrative framework
2. Add speaking notes (what to say, not what's on the slide)
3. Add an "objection prep" note for the 3 hardest slides (Problem, Traction, Ask)
4. Flag any data marked "TBD" or "assumed" so the user knows what to fill

### Phase 5: Score & Strengthen

Before delivering, self-score the deck against the audience rubric from [references/investor-audience-guide.md](references/investor-audience-guide.md). For each dimension:
- 🟢 Strong (8-10): Ready to present
- 🟡 Moderate (5-7): Needs work — suggest specific improvements
- 🔴 Weak (1-4): Critical gap — must fix before presenting

Show the scorecard to the user with actionable suggestions for any 🟡 or 🔴 areas.

### Phase 6: Generate HTML Artifact

Write a polished HTML pitch deck to `pitch-deck.html` in the project root. The HTML must:

- Use a dark theme with Solana brand colors (#9945FF purple, #14F195 green, #000000 black)
- Include slide navigation (arrow keys + click)
- Have a presenter notes view (press 'N' to toggle)
- Use clean typography (Inter or system fonts)
- Include subtle animations (fade-in on slide transition)
- Be self-contained (no external dependencies)
- Include a print-friendly mode for PDF export
- Each slide should have: title, content, and hidden speaker notes

**Design principles:**
- One idea per slide (YC rule)
- 30pt minimum font equivalent (Kawasaki rule)
- Max 6 words per bullet, max 6 bullets per slide
- Visuals > text. Use comparison tables, before/after, metric callouts
- First slide must hook in under 5 seconds

### Phase 7: Objection Prep

After generating the deck, provide a **Q&A Prep Sheet** covering:
1. The user's self-identified "hardest question" from the interview
2. Standard VC objections for their category (DeFi, infrastructure, consumer, etc.)
3. Crypto-specific challenges: "Why not just use [existing protocol]?", "What happens in a bear market?", "Why does this need a token?"

For each objection, provide a 2-sentence response framework.

## Prior Context (Optional — never block on this)

If `.superstack/idea-context.md` or `.superstack/build-context.md` exist, use them to enrich the deck. If they don't exist, **proceed immediately** — interview the user about their project. Do NOT redirect to other commands.

## Non-Negotiables

- **Problem first, always.** No one cares about Solana until they care about the problem. (Sequoia rule #1)
- **One idea per slide.** If you need two slides, use two slides. (YC design rule)
- **Real numbers only.** "Growing fast" is not a metric. Mark unknowns as "TBD".
- **Crypto necessity must be proven.** "Why blockchain?" must have a concrete answer on a dedicated slide.
- **The ask must be specific.** Amount + use + timeline. "We're raising" is not an ask. (Kawasaki rule)
- **Always generate the HTML artifact.** The deck must be viewable, navigable, and presentable.
- **Never fabricate metrics.** If missing, mark clearly and suggest how to get them.
- **Tailor to audience.** VCs ≠ hackathon judges ≠ grant committees.
- **Include objection prep.** A deck without Q&A prep is half a pitch.

## Resources

### references/
- [references/pitch-structure.md](references/pitch-structure.md) — Sequoia/YC/Kawasaki hybrid slide framework
- [references/crypto-pitch-mistakes.md](references/crypto-pitch-mistakes.md) — 12 antipatterns with examples
- [references/investor-audience-guide.md](references/investor-audience-guide.md) — 5 audience types with scoring rubrics
- [references/storytelling-frameworks.md](references/storytelling-frameworks.md) — 6 narrative frameworks (PAS, AIDA, Hero's Journey, Pixar, 6-Part Arc, BAB)
- [references/crypto-pitch-examples.md](references/crypto-pitch-examples.md) — Real case studies (Phantom $1.2B, Uniswap $11M, Filecoin $257M)

### Cross-skill data (use if available)
- `skills/data/ideas/` — 228+ curated ideas from YC, a16z, Alliance, Superteam for market positioning
- `skills/data/solana-knowledge/` — "Why Solana" talking points

## Quick Start

```bash
# Just ask naturally:
#   "Create a pitch deck for my Solana project"
#   "Help me pitch to Colosseum hackathon judges"
#   "I need a VC deck for my DeFi protocol"
#   "Prepare a grant application for Solana Foundation"
#   "Create slides for demo day"

# The skill will:
# 1. Interview you deeply (story, evidence, ask)
# 2. Choose the right narrative framework
# 3. Generate a polished HTML deck with speaking notes
# 4. Score the deck and suggest improvements
# 5. Prepare you for Q&A with objection handling
```

## Decision Points

- **Audience type drives everything:** VCs want TAM/SAM/SOM + revenue model + team. Hackathon judges want working demo + innovation. Grant committees want ecosystem impact. See the full rubrics in the audience guide.
- **Narrative framework:** PAS for hackathons, 6-Part Arc for VCs, Before-After-Bridge for product demos. Always select before generating slides.
- **Token slide:** Only include if token is integral. If included, must cover: utility (not speculation), distribution, vesting, bear-market resilience. Reference [crypto-pitch-mistakes.md](references/crypto-pitch-mistakes.md) Mistake #4.
- **Demo:** Must be live and working. Devnet is fine for hackathons. Mainnet required for VCs. If no demo exists, the deck must acknowledge this honestly.
- **Traction:** On-chain metrics (active users, retention, TVL, tx count) beat vanity metrics (Discord size, Twitter followers). See Phantom case study for what "good traction slides" look like.

## Framework Credits

This skill synthesizes proven frameworks from:
- **Sequoia Capital** — The 12-slide standard ([pitchbuilder.io](https://pitchbuilder.io))
- **Y Combinator** — Radical simplicity, one idea per slide ([ycombinator.com/library](https://www.ycombinator.com/library))
- **Guy Kawasaki** — 10/20/30 rule: 10 slides, 20 minutes, 30pt font ([guykawasaki.com](https://guykawasaki.com))
- **a16z Crypto** — Crypto-specific pitch guidance, CSX program ([a16zcrypto.com](https://a16zcrypto.com))
- **Pixar** — Narrative structure for complex products
- Real fundraise analysis: Phantom ($1.2B), Uniswap ($11M), Filecoin ($257M), Axie Infinity ($7.5M)

## Telemetry (run last)

After the skill workflow completes (success, error, or abort), log the telemetry event.
Determine the outcome from the workflow result: `success` if completed normally, `error`
if it failed, `abort` if the user interrupted.

Run this bash:

```bash
_TEL_END=$(date +%s)
_TEL_DUR=$(( _TEL_END - _TEL_START ))
if [ "$_TEL_TIER" != "off" ]; then
echo '{"skill":"create-pitch-deck","phase":"launch","event":"completed","outcome":"OUTCOME","duration_s":"'"$_TEL_DUR"'","session":"'"$_SESSION_ID"'","ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","platform":"'$(uname -s)-$(uname -m)'"}' >> ~/.superstack/telemetry.jsonl 2>/dev/null || true
fi
```

Replace `OUTCOME` with success/error/abort based on the workflow result.
