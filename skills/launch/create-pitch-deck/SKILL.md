---
name: create-pitch-deck
description: Create a structured pitch deck for a crypto project. Use when a user says "create a pitch deck", "help me pitch", "I need slides", "prepare for demo day", "investor presentation", or "grant application". Reads idea-context.md and build-context.md from prior phases if available.
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
_TEL_EVENT='{"skill":"create-pitch-deck","phase":"launch","event":"started","ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}' 
echo "$_TEL_EVENT" >> ~/.superstack/telemetry.jsonl 2>/dev/null || true
_CONVEX_URL=$(cat ~/.superstack/config.json 2>/dev/null | grep -o '"convexUrl":"[^"]*"' | head -1 | cut -d'"' -f4 || echo "")
[ -n "$_CONVEX_URL" ] && curl -s -X POST "$_CONVEX_URL/api/mutation" -H "Content-Type: application/json" -d '{"path":"telemetry:track","args":{"skill":"create-pitch-deck","phase":"launch","status":"success","version":"0.2.0","platform":"'$(uname -s)-$(uname -m)'","timestamp":'$(date +%s)000'}}' >/dev/null 2>&1 &
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

# Create Pitch Deck

## Overview

Generate a compelling, investor-ready pitch deck using proven frameworks from Sequoia, YC, a16z, and Guy Kawasaki — adapted for crypto/Solana projects. Produces a polished HTML artifact with slide content, speaking notes, narrative arc, and audience-specific tailoring.

This skill doesn't just generate slides — it coaches you through building a narrative that lands.

## Core Principles

Hackathon judges review hundreds of submissions quickly and often skim for the essentials. Capture attention in the first 30 seconds with a punchy one-liner using a sharp, relatable analogy that instantly clarifies the idea — "HIP-3 for Solana", "Jupiter for lending", "Uber for compute". Follow immediately with a crisp, high-quality demo that shows the working product in action. Structure the deck as a simple narrative: clearly explain the problem, the innovative solution, and the business model or path to users. Skip stiff slide templates — focus on storytelling. Keep everything short, visually polished, aesthetic, and easy to scan. Draw inspiration from top competitors on design and flow. Clarity and impact win every time.

## Non-Negotiables (Read First)

- **Never skip the interview.** Don't auto-generate from context files alone. Every pitch needs a human conversation to find the real story.
- **Stay blunt.** If their "problem" is vague, push back. If their "why now" is weak, say so. If they have no traction, don't hide it — help them frame what they DO have.
- **Problem first, always.** No one cares about Solana until they care about the problem. (Sequoia rule #1)
- **One idea per slide.** If you need two slides, use two slides. (YC rule)
- **Real numbers only.** "Growing fast" is not a metric. Mark unknowns as "TBD".
- **Crypto necessity must be proven.** "Why blockchain?" must have a concrete answer. If removing the blockchain doesn't break the product, the pitch has a fatal flaw — say so.
- **The ask must be specific.** Amount + instrument + use + timeline + milestone. "We're raising" is not an ask.
- **Always generate the HTML artifact.** Using the design system from [references/deck-design-system.md](references/deck-design-system.md) and slide templates from [references/slide-templates.md](references/slide-templates.md).
- **3 questions max per message.** Conversational rounds, not a questionnaire dump.

## Workflow

### Phase 1: Context Gathering (Silent)

Before asking anything, read what exists:
- `.superstack/idea-context.md` — Product concept, audience, value prop
- `.superstack/build-context.md` — Tech stack, features, deployment status
- Output from `competitive-landscape` skill, `defillama-research` skill if available

Also auto-detect project assets:
```bash
# Screenshots, logos, product images
find . -maxdepth 3 -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.svg" \) ! -path "*/node_modules/*" ! -path "*/.git/*" 2>/dev/null | head -15
# Project name/description
cat package.json 2>/dev/null | grep -E '"name"|"description"' | head -5
```

If you find useful context, mention it during the interview: "I see from your idea-context that you're building X for Y — let's start from there."

### Phase 1.5: Live Research (mandatory before deck generation)

Every deck needs real, current numbers. Never use stale data from context files or training data alone. Before generating any slides, run a research pass for the specific idea:

**Market data:**
- Use DefiLlama MCP or web search to pull current TVL, volume, and protocol stats for the relevant category
- Get competitor TVL/volume/user numbers as of today, not from memory
- Pull total market size data (perps volume, lending TVL, stablecoin market cap, etc.)

**Competitor landscape:**
- Identify the 3-5 closest competitors and get their current metrics
- Check what's launched in the last 3 months in this space
- Note any recent funding rounds, partnerships, or shutdowns

**Ecosystem data:**
- Solana-specific stats: total TVL, DEX volume, number of active programs, relevant Pyth feeds
- Any recent ecosystem announcements or regulatory changes that affect the idea

**How to research:**
- Use web search, DefiLlama MCP, CoinGecko MCP, or any available data tools
- If MCP tools are unavailable, use web search as fallback
- Cross-reference at least 2 sources for key numbers
- Mark any numbers you couldn't verify as "~estimate" in the deck

**Every number in the deck must come from this research pass, not from the interview or context files alone.** If a stat is outdated or unverifiable, either update it or mark it clearly.

### Phase 2: Deep Interview

This is a conversation, not a form. Start with anchor questions, pull deeper based on answers. Do NOT move to deck generation until you can clearly articulate: the problem, the solution, the proof, the audience, and the ask.

**Round 1 — The Story (ask all three together):**

1. **"Explain what you do to me like I'm someone you met at a bar — no jargon."**
   *Why:* Forces plain language. If they can't say it simply, they don't understand it yet (YC principle). The bar test is the first line of the title slide.

2. **"What personal experience made you angry enough to build this?"**
   *Why:* Founder-problem fit is the #1 signal VCs look for at pre-seed. (a16z: "We back founders who have lived the problem.") If they didn't live it, ask "then who told you about this problem, and why did you listen?"

3. **"What's the most surprising thing a user has told you?"**
   *Why:* Reveals customer discovery depth. If they haven't talked to users, that's a red flag — but a fixable one. Push: "Have you talked to potential users? What did they say?"

**Round 2 — The Evidence (adapt based on Round 1):**

4. **"What's your single strongest proof that this works?"**
   *Why:* Forces prioritization. Could be: users (DAU), money (revenue/TVL), speed (testnet metrics), demand (waitlist), or conviction (LOIs/pilots).
   *Follow-up if weak:* "If you have nothing yet, what's the cheapest experiment that would prove demand in 2 weeks?"

5. **"What changed in the last 12 months that makes this possible NOW?"**
   *Why:* Sequoia's most overlooked slide. "Why Now" separates ideas from opportunities. Common catalysts: new regulation (MiCA), tech breakthrough (state compression), market shift (institutional on-ramps), behavior change (mobile-first wallets).
   *Push back if generic:* "'Crypto is growing' is not a why-now. What specific event or change created this window?"

6. **"If I ripped out the blockchain from your product, what breaks?"**
   *Why:* The blockchain necessity test. If the answer is "nothing" — the pitch has a fatal flaw. Help them find the real crypto angle or be honest that it's weak.
   *Good answers:* "Composability breaks — other protocols can't build on us." / "Permissionless access breaks — no bank account needed." / "Trustless settlement breaks — agents can pay each other without intermediaries."

**Round 3 — The Audience & Ask (ask based on Round 2):**

7. **"Who exactly will you be presenting this to?"**
   *Why:* Everything changes based on audience. Push for specificity:
   - Hackathon judges → Show working demo, innovation, completeness
   - VCs → TAM/SAM, revenue model, team, defensibility
   - Grant committees → Ecosystem impact, open-source, Solana-specific value
   - Accelerators → Execution speed, coachability, early signals
   - Strategic partners → Integration value, mutual benefit, user overlap

8. **"What's the specific outcome you want? Be precise."**
   *Why:* "Raise money" is not specific. Push for: "$500K SAFE at $5M cap to hire 2 engineers and reach 1K DAU in 6 months." OR: "Win the DeFi track at Colosseum Radar."

9. **"What's the question you're most afraid someone will ask?"**
   *Why:* This reveals the biggest weakness. If they say "I don't know" — probe: "Is it about traction? Team size? Why crypto? Competition?" The answer shapes the objection prep.

**Round 4 — Taste & Positioning (ask if needed):**

10. **"Do you have a preferred writing tone? Some folks want lowercase and casual, others want polished and corporate."**
    *Why:* The tone of slide text, speaking notes, and social copy should match the founder's voice — not sound AI-generated. Read [../tone-guide.md](../tone-guide.md) for defaults if they have no preference.

11. **"Have you seen a pitch or deck you loved? Any industry."**
    *Why:* Reveals their quality bar and communication style. If they name something, use it as a reference. If not, offer: "Clean and minimal like Airbnb's 10-slider? Data-heavy like Coinbase's seed deck? Story-driven like Buffer?"

11. **"Do you have brand colors? If not, what's the vibe — corporate and trustworthy, or bold and consumer?"**
    *Why:* NEVER default to purple or AI-ish gradients. The palette must come from the user's brand or be intentionally chosen. See [references/deck-design-system.md](references/deck-design-system.md) for recommended palettes (Navy+White for DeFi, Teal+Ivory for consumer, Black+White for premium). Ask, don't guess.

12. **"Who are the 2-3 competitors someone will mention? What's your honest take on them?"**
    *Why:* Saying "no competition" kills credibility. Competitors include: direct rivals, indirect alternatives, and "doing nothing." (Peter Thiel: the biggest competitor is always the status quo.)

### Interview Rules

- **Adapt, don't script.** If context files answer a question, skip it. If an answer is rich, dig deeper instead of moving on.
- **Challenge weak answers.** "We're building a DEX" → "Why would anyone use YOUR DEX instead of Jupiter?" Be direct.
- **No false praise.** If their traction is weak, help them frame what they have honestly. Don't invent momentum.
- **Pull for specifics.** "Users like it" → "How many users? What's retention? What do they actually say?"
- **The interview succeeds when you can fill every slide with conviction.** If you can't articulate their "why now" or their "ask" — keep asking until you can.

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

Write a polished HTML pitch deck to `pitch-deck-YYYYMMDD-HHMMSS.html` in the project root.

**How to build the HTML:**

1. **Start with the shell** from [references/deck-design-system.md](references/deck-design-system.md) — this gives you the complete CSS design system (colors, typography, layout, navigation, animations, print support) and the JavaScript for slide navigation + presenter notes.

2. **Pick slides** from [references/slide-templates.md](references/slide-templates.md) based on audience:
   - Hackathon: Title → Problem → Solution → Demo → Why Crypto → Traction → Ask → Contact (8 slides)
   - VC: All 13 slides + optional Tokenomics/Roadmap
   - Grant: Title → Problem → Solution → Why Solana → Demo → Traction → Ecosystem Impact → Ask → Contact
   - Accelerator: Title → Problem → Solution → Demo → Traction → Team → Ask → Contact

3. **Fill every `{{PLACEHOLDER}}`** with content from the interview. Every piece of text comes from what the user told you — never generate generic filler.

4. **Customize the brand palette** — if the user has brand colors, update the CSS variables in `:root`. Otherwise use the Solana defaults.

5. **Add presenter notes** to every slide (hidden by default, press N to show).

**The templates are a design system, not a fixed layout.** Each user gets a unique deck — different slides, different content, different narrative — but all built on the same professional visual foundation. Think of it like a brand kit: consistent quality, infinite variation.

**Design rules (enforced):**
- One idea per slide (YC rule)
- 30pt minimum font equivalent (Kawasaki rule)
- Max 6 words per bullet, max 6 bullets per slide
- Visuals > text. Use metric cards, comparison tables, progress bars, timelines — not paragraphs
- First slide must hook in under 5 seconds
- Whitespace is confidence — don't fill every pixel

### Phase 7: Objection Prep

After generating the deck, provide a **Q&A Prep Sheet** covering:
1. The user's self-identified "hardest question" from the interview
2. Standard VC objections for their category (DeFi, infrastructure, consumer, etc.)
3. Crypto-specific challenges: "Why not just use [existing protocol]?", "What happens in a bear market?", "Why does this need a token?"

For each objection, provide a 2-sentence response framework.

## Prior Context (Optional — never block on this)

If `.superstack/idea-context.md` or `.superstack/build-context.md` exist, use them to enrich the deck. If they don't exist, **proceed immediately** — interview the user about their project. Do NOT redirect to other commands.

## Resources

### Writing Tone
- [../tone-guide.md](../tone-guide.md) — Default writing tone for generated content. **Ask the user's tone preference** during the interview before generating final output. Covers casing, sentence style, what to avoid, and format-specific notes for slides, speaking notes, and social copy.

### references/ — Content & Strategy
- [references/pitch-structure.md](references/pitch-structure.md) — Sequoia/YC/Kawasaki hybrid slide framework
- [references/pitch-reference-sources.md](references/pitch-reference-sources.md) — **Deep pitch wisdom** from Sequoia, YC, a16z, Multicoin, real deck teardowns (Phantom, Uniswap, Jupiter), traction benchmarks by stage, 10-slide litmus test
- [references/storytelling-frameworks.md](references/storytelling-frameworks.md) — 6 narrative frameworks (PAS, AIDA, Hero's Journey, Pixar, 6-Part Arc, BAB)
- [references/crypto-pitch-mistakes.md](references/crypto-pitch-mistakes.md) — 12 antipatterns with examples
- [references/investor-audience-guide.md](references/investor-audience-guide.md) — 5 audience types with scoring rubrics
- [references/crypto-pitch-examples.md](references/crypto-pitch-examples.md) — Real case studies (Phantom $1.2B, Uniswap $11M, Filecoin $257M)

### references/ — Design & Templates
- [references/deck-design-system.md](references/deck-design-system.md) — **Complete HTML/CSS design system**: brand palette, typography scale, layout grid, components (cards, badges, progress bars, comparison tables, timelines, quote blocks), slide navigation, presenter notes, print support, animations
- [references/slide-templates.md](references/slide-templates.md) — **15 production-ready slide templates**: Title, Problem (2 variants), Why Now, Solution, Demo/Product, Why Crypto, Traction, Market (TAM/SAM/SOM), Competition, Business Model, Team, Ask, Contact, Tokenomics, Roadmap — all with `{{PLACEHOLDERS}}`

### Cross-skill data (use if available)
- [skills/data/colosseum/hackathon-winners.md](../../data/colosseum/hackathon-winners.md) — **Complete Colosseum hackathon winner dataset** — 6 grand champions, 40+ track winners, winning patterns by track, track distribution analysis. Use to reference similar winners and position your pitch.
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
_TEL_DUR=$(( _TEL_END - ${_TEL_START:-$_TEL_END} ))
_TEL_TIER=$(cat ~/.superstack/config.json 2>/dev/null | grep -o '"telemetryTier": *"[^"]*"' | head -1 | sed 's/.*"telemetryTier": *"//;s/"$//' || echo "anonymous")
if [ "$_TEL_TIER" != "off" ]; then
echo '{"skill":"create-pitch-deck","phase":"launch","event":"completed","outcome":"OUTCOME","duration_s":"'"$_TEL_DUR"'","session":"'"$_SESSION_ID"'","ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","platform":"'$(uname -s)-$(uname -m)'"}' >> ~/.superstack/telemetry.jsonl 2>/dev/null || true
true
fi
```

Replace `OUTCOME` with success/error/abort based on the workflow result.
