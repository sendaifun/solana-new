---
name: create-pitch-deck
description: Create a structured pitch deck for a crypto project. Use when a user says "create a pitch deck", "help me pitch", "I need slides", "prepare for demo day", "investor presentation", or "grant application". Reads idea-context.json and build-context.json from prior phases if available.
---

> **Wrong skill?** See [SKILL_ROUTER.md](../../SKILL_ROUTER.md) for all available skills.

# Create Pitch Deck

## Overview

Generate a structured pitch deck tailored to the audience (VCs, hackathon judges, grant committees, or ecosystem partners). Produce slide-by-slide content with speaking notes and a visual structure guide.

## Workflow

1. Check for `.superstack/idea-context.json` and `.superstack/build-context.json`. Use available context to pre-populate.
2. If no context, interview the user: What did you build? Who's it for? What traction do you have?
3. Identify the audience using the interview or user's explicit request.
4. Read [references/pitch-structure.md](references/pitch-structure.md) for the slide framework.
5. Read [references/crypto-pitch-mistakes.md](references/crypto-pitch-mistakes.md) to avoid common antipatterns.
6. Adapt the deck using [references/investor-audience-guide.md](references/investor-audience-guide.md).
7. Write a pitch deck HTML artifact with all slide content and speaking notes.

## Prior Context (Optional — never block on this)

If `.superstack/idea-context.json` or `.superstack/build-context.json` exist, use them to enrich the deck. If they don't exist, **proceed immediately** — interview the user about their project. Do NOT redirect to other commands.

## Non-Negotiables

- Lead with the problem, not the technology. No one cares about Solana until they care about the problem.
- Include a live demo link or screenshots. No deck without evidence of a working product.
- Traction slides must have real numbers. "Growing fast" is not a metric.
- Every deck must answer: "Why now?" and "Why you?"
- Token slides (if applicable) must be honest about utility vs. speculation.
- Tailor language to the audience — VCs want different things than hackathon judges.
- Always write a local HTML artifact.
- Never pretend metrics/context exist. If missing, mark as "assumed" or "TBD".

## Resources

### references/

- [references/pitch-structure.md](references/pitch-structure.md)
- [references/crypto-pitch-mistakes.md](references/crypto-pitch-mistakes.md)
- [references/investor-audience-guide.md](references/investor-audience-guide.md)

## Quick Start

```bash
# This skill generates a pitch deck as an HTML artifact.
# Just ask:
#   "Create a pitch deck for my Solana project"
#   "Help me pitch to Colosseum hackathon judges"
#   "I need slides for a grant application"

# The skill will interview you about:
# 1. Problem you're solving
# 2. Your solution and why crypto/Solana
# 3. Traction metrics
# 4. Team background
# 5. Token utility (if applicable)
```

## Decision Points

- **Audience type matters:** VCs want TAM/SAM/SOM + revenue model. Hackathon judges want working demo + innovation. Grant committees want ecosystem impact.
- **Token slide:** Only include if token is integral to product. Never lead with tokenomics.
- **Demo link:** Must be live and working. Devnet is fine for hackathons. Mainnet required for VCs.
