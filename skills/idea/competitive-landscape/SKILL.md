---
name: competitive-landscape
description: Map the competitive landscape for a crypto product idea. Use when a user says "who are my competitors", "map the competitive landscape", "what exists in this space", "show me similar projects", or "competitive analysis". Leverages solana-new's catalogs of 59 repos, 66 skills, and 49 MCPs.
---

> **Wrong skill?** See [SKILL_ROUTER.md](../../SKILL_ROUTER.md) for all available skills.

# Competitive Landscape

## Overview

Map every relevant competitor, substitute, and adjacent project for a given crypto product idea. Produce a landscape matrix showing where the opportunities and dangers are.

## Workflow

1. Check for `.superstack/idea-context.json` in the workspace. If found, use the chosen idea's domain. If not, ask the user what space to analyze.
2. Read [references/landscape-mapping.md](references/landscape-mapping.md) for the mapping methodology.
3. Search the solana-new ecosystem catalogs as described in [references/ecosystem-catalog-guide.md](references/ecosystem-catalog-guide.md).
4. Assess defensibility using [references/moat-analysis.md](references/moat-analysis.md).
5. Do fresh web research: crypto Twitter, GitHub, DeFiLlama, app directories.
6. Produce a landscape HTML artifact with the full competitive matrix.

## Non-Negotiables

- Always search the solana-new catalogs first — if a tool already exists, the user needs to know.
- Include dead/failed projects, not just live ones. Failures reveal landmines.
- Distinguish between "competitors" (same problem, same user) and "substitutes" (same problem, different approach).
- Include at least one non-crypto substitute if applicable.
- Do not declare "no competition" unless you've exhausted all search paths.
- Rate crowdedness honestly: empty / sparse / moderate / crowded / saturated.
- Always write a local HTML artifact.

## Phase Handoff

This skill is **Phase 1 (Idea)** in the Idea → Build → Launch journey. After mapping the landscape:

1. Update `.superstack/idea-context.json` with a `landscape` field containing:
   - `direct_competitors`: array of { name, url, status, strength, weakness }
   - `substitutes`: array of { name, approach, why_users_stay }
   - `dead_projects`: array of { name, why_failed }
   - `crowdedness`: "empty" | "sparse" | "moderate" | "crowded" | "saturated"
   - `moat_type`: identified moat category
   - `differentiation`: recommended angle
2. See `../../../data/specs/phase-handoff.md` for the full JSON contract.

## Quick Start

```bash
# Ask about competitors for your specific idea:
#   "Who are my competitors for agent payments on Solana?"
#   "Map the competitive landscape for DeFi lending"
#   "What exists in the Solana staking space?"

# The skill will search:
# - 59 repos in cli/data/clonable-repos.json
# - 71 skills in cli/data/solana-skills.json
# - 49 MCPs in cli/data/solana-mcps.json
# - DefiLlama, GitHub, and crypto Twitter
```

## Decision Points

- **Saturated market?** If crowdedness = "saturated" (>5 direct competitors), look for underserved angle or niche.
- **Which data sources?** Use DefiLlama for TVL/protocol data. Use GitHub for development activity. Use Twitter/X for community sentiment.
- **Dead project found?** Check WHY it died — technical failure, market timing, or team issues. The idea might still be valid.

## Resources

### references/

- [references/landscape-mapping.md](references/landscape-mapping.md)
- [references/moat-analysis.md](references/moat-analysis.md)
- [references/ecosystem-catalog-guide.md](references/ecosystem-catalog-guide.md)
