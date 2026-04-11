---
name: competitive-landscape
description: Map the competitive landscape for a crypto product idea. Use when a user says "who are my competitors", "map the competitive landscape", "what exists in this space", "show me similar projects", or "competitive analysis". Leverages solana-new's catalogs of 81 repos, 73 skills, and 53 MCPs.
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
_TEL_EVENT='{"skill":"competitive-landscape","phase":"idea","event":"started","ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}' 
echo "$_TEL_EVENT" >> ~/.superstack/telemetry.jsonl 2>/dev/null || true
_CONVEX_URL=$(cat ~/.superstack/config.json 2>/dev/null | grep -o '"convexUrl":"[^"]*"' | head -1 | cut -d'"' -f4 || echo "")
[ -n "$_CONVEX_URL" ] && curl -s -X POST "$_CONVEX_URL/api/mutation" -H "Content-Type: application/json" -d '{"path":"telemetry:track","args":{"skill":"competitive-landscape","phase":"idea","status":"success","version":"0.2.0","platform":"'$(uname -s)-$(uname -m)'","timestamp":'$(date +%s)000'}}' >/dev/null 2>&1 &
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

# Competitive Landscape

## Overview

Map every relevant competitor, substitute, and adjacent project for a given crypto product idea. Produce a landscape matrix showing where the opportunities and dangers are.

## Workflow

1. Check for `.superstack/idea-context.md` in the workspace. If found, use the chosen idea's domain. If not, ask the user what space to analyze.
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

1. Write/update `.superstack/idea-context.md` (create if missing) with a `landscape` field containing:
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
# - 81 repos in cli/data/clonable-repos.json
# - 73 skills in cli/data/solana-skills.json
# - 53 MCPs in cli/data/solana-mcps.json
# - DefiLlama, GitHub, and crypto Twitter
```

## Decision Points

- **Saturated market?** If crowdedness = "saturated" (>5 direct competitors), look for underserved angle or niche.
- **Which data sources?** Use DefiLlama for TVL/protocol data. Use GitHub for development activity. Use Twitter/X for community sentiment.
- **Dead project found?** Check WHY it died — technical failure, market timing, or team issues. The idea might still be valid.
- **Hackathon projects?** If the user wants to search 6,000+ Solana hackathon submissions for similar projects or winner patterns, suggest `/colosseum-copilot`. Requires a free PAT — only mention if the user asks or opts in.

## Resources

### references/

- [references/landscape-mapping.md](references/landscape-mapping.md)
- [references/moat-analysis.md](references/moat-analysis.md)
- [references/ecosystem-catalog-guide.md](references/ecosystem-catalog-guide.md)

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
echo '{"skill":"competitive-landscape","phase":"idea","event":"completed","outcome":"OUTCOME","duration_s":"'"$_TEL_DUR"'","session":"'"$_SESSION_ID"'","ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","platform":"'$(uname -s)-$(uname -m)'"}' >> ~/.superstack/telemetry.jsonl 2>/dev/null || true
true
fi
```

Replace `OUTCOME` with success/error/abort based on the workflow result.
