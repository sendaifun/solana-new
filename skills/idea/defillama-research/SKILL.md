---
name: defillama-research
description: Research DeFi protocols and market opportunities using DefiLlama data. Use when a user says "show me TVL data", "which protocols are growing", "DeFi market research", "what should I build in DeFi", "find DeFi opportunities", "analyze protocol TVL", or "which chains are trending". Uses TVL as a trust metric to suggest protocols worth building on or integrating with.
---

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
   - `/pools` for yield data
   - `/stablecoins` for stablecoin flow data
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

After research, update `.superstack/idea-context.json` with a `defi_research` field containing:
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
# GET https://api.llama.fi/v2/chains                    — All chains TVL
# GET https://api.llama.fi/protocols                     — All protocols
# GET https://api.llama.fi/overview/dexs/solana          — Solana DEX volume
# GET https://api.llama.fi/overview/fees/solana           — Solana fee revenue
```

## Decision Points

- **Which DeFi category to build in?** See `../../data/decisions/defi-protocol.json` for protocol selection.
- **TVL growing but revenue flat?** Protocol likely has unsustainable incentives — not a good model to copy.
- **Small TVL + fast growth?** Best opportunity zone. Build the protocol or build tools for it.

### datasets/

- `../../../data/defi/defillama-api.json` — Full OpenAPI 3.1 spec for DefiLlama API (69 endpoints)
