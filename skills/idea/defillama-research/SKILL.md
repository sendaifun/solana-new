---
name: defillama-research
description: Research DeFi protocols and market opportunities using DefiLlama data. Use when a user says "show me TVL data", "which protocols are growing", "DeFi market research", "what should I build in DeFi", "find DeFi opportunities", "analyze protocol TVL", or "which chains are trending". Uses TVL as a trust metric to suggest protocols worth building on or integrating with.
---

## Preamble (run first)

```bash
_TEL_TIER=$(cat ~/.superstack/config.json 2>/dev/null | grep -o '"telemetryTier":"[^"]*"' | head -1 | cut -d'"' -f4 || echo "anonymous")
_TEL_TIER="${_TEL_TIER:-anonymous}"
_CONVEX_URL=$(cat ~/.superstack/config.json 2>/dev/null | grep -o '"convexUrl":"[^"]*"' | head -1 | cut -d'"'  -f4 || echo "")
_TEL_PROMPTED=$([ -f ~/.superstack/.telemetry-prompted ] && echo "yes" || echo "no")
_TEL_START=$(date +%s)
_SESSION_ID="$$-$(date +%s)"
mkdir -p ~/.superstack
echo "TELEMETRY: $_TEL_TIER"
echo "TEL_PROMPTED: $_TEL_PROMPTED"
if [ "$_TEL_TIER" != "off" ]; then
_TEL_EVENT='{"skill":"defillama-research","phase":"idea","event":"started","ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}' 
echo "$_TEL_EVENT" >> ~/.superstack/telemetry.jsonl 2>/dev/null || true
[ -n "$_CONVEX_URL" ] && curl -s -X POST "$_CONVEX_URL/api/mutation" -H "Content-Type: application/json" -d '{"path":"telemetry:track","args":{"skill":"defillama-research","phase":"idea","status":"success","version":"0.2.0","platform":"'$(uname -s)-$(uname -m)'","timestamp":'$(date +%s)000'}}' >/dev/null 2>&1 &
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

# DefiLlama Research

## Overview

Use DefiLlama's API to research the DeFi landscape on Solana and across chains. TVL (Total Value Locked) is the primary trust metric — protocols with real TVL have real users with real money at stake. Use this data to identify what's working, what's growing, and where the gaps are.

## Workflow

1. Understand the user's goal: exploring DeFi broadly, validating a specific niche, or picking protocols to integrate with.
2. Read [references/defillama-api-guide.md](references/defillama-api-guide.md) for the available endpoints and how to query them.
3. Read [references/tvl-as-trust-metric.md](references/tvl-as-trust-metric.md) to understand how to interpret TVL data.
4. Read [references/defi-opportunity-framework.md](references/defi-opportunity-framework.md) for spotting opportunities from the data.
5. Query the DefiLlama API to pull relevant data:
   - `/protocols` for all protocols with TVL
   - `/v2/chains` for chain-level TVL
   - `/overview/dexs` for DEX volume data
   - `/overview/fees` for fee/revenue data
   - `/pools` for yield data (base URL: `https://yields.llama.fi`)
   - `/stablecoins` for stablecoin flow data (base URL: `https://stablecoins.llama.fi`)
6. Analyze and present findings with concrete recommendations.

## Non-Negotiables

- Always use real-time DefiLlama data, not stale numbers. The API is free and fast.
- TVL alone is not enough. Cross-reference with fees/revenue, user count, and growth trends.
- When recommending protocols to build on, check if they have an SDK, open API, or composable contracts.
- Distinguish between "high TVL = trusted" and "high TVL = opportunity". A $10B protocol is trusted but hard to compete with. A $10M protocol growing 50% monthly is the opportunity.
- Always filter for Solana data when the user is building on Solana, unless they ask for cross-chain.
- Flag protocols with declining TVL — they may be losing trust or users.
- Present data in tables with clear rankings.

## Phase Handoff

This skill is **Phase 1 (Idea)** in the Idea → Build → Launch journey.

After research, write/update `.superstack/idea-context.md` (create if missing) with a `defi_research` field containing:
- `top_protocols`: array of { name, tvl, tvl_change_7d, category, chain }
- `opportunities`: array of identified gaps or underserved niches
- `recommended_integrations`: protocols with SDKs/APIs worth building on
- `market_snapshot`: { total_solana_tvl, top_category, fastest_growing_category }

See `../../../data/specs/phase-handoff.md` for the full JSON contract.

## Resources

### references/

- [references/defillama-api-guide.md](references/defillama-api-guide.md)
- [references/tvl-as-trust-metric.md](references/tvl-as-trust-metric.md)
- [references/defi-opportunity-framework.md](references/defi-opportunity-framework.md)

## Quick Start

```bash
# Ask for DeFi data:
#   "Show me DeFi opportunities on Solana"
#   "Which Solana protocols are growing fastest?"
#   "Find underserved DeFi niches on Solana"

# Key DefiLlama API endpoints:
# GET https://api.llama.fi/v2/chains                        — All chains TVL
# GET https://api.llama.fi/protocols                        — All protocols
# GET https://api.llama.fi/overview/dexs/solana             — Solana DEX volume
# GET https://api.llama.fi/overview/fees/solana              — Solana fee revenue
# GET https://yields.llama.fi/pools                         — All yield pools
# GET https://stablecoins.llama.fi/stablecoins              — All stablecoins
# GET https://stablecoins.llama.fi/stablecoincharts/Solana  — Solana stablecoin flows
```

## Decision Points

- **Which DeFi category to build in?** AMM, lending, perps, staking, yield — pick based on TVL gaps and growth trends.
- **TVL growing but revenue flat?** Protocol likely has unsustainable incentives — not a good model to copy.
- **Small TVL + fast growth?** Best opportunity zone. Build the protocol or build tools for it.

### datasets/

- `../../../data/defi/defillama-api.json` — Full OpenAPI 3.1 spec for DefiLlama API (69 endpoints)

## Telemetry (run last)

After the skill workflow completes (success, error, or abort), log the telemetry event.
Determine the outcome from the workflow result: `success` if completed normally, `error`
if it failed, `abort` if the user interrupted.

Run this bash:

```bash
_TEL_END=$(date +%s)
_TEL_DUR=$(( _TEL_END - _TEL_START ))
if [ "$_TEL_TIER" != "off" ]; then
echo '{"skill":"defillama-research","phase":"idea","event":"completed","outcome":"OUTCOME","duration_s":"'"$_TEL_DUR"'","session":"'"$_SESSION_ID"'","ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","platform":"'$(uname -s)-$(uname -m)'"}' >> ~/.superstack/telemetry.jsonl 2>/dev/null || true
fi
```

Replace `OUTCOME` with success/error/abort based on the workflow result.
