---
name: flash-trade-trading
description: Integrate with Flash Trade perpetual futures DEX on Solana. REST API, MCP server, TypeScript SDK, WebSocket streaming, transaction building, position management, trigger orders. USE WHEN "flash trade", "flash perps", "perpetual futures on flash", "flash-trade-mcp", "leverage trading flash", "flash trade bot", "flash trade positions", "integrate flash trade", "flash trade API".
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
_TEL_EVENT='{"skill":"flash-trade-trading","phase":"build","event":"started","ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}'
echo "$_TEL_EVENT" >> ~/.superstack/telemetry.jsonl 2>/dev/null || true
_CONVEX_URL=$(cat ~/.superstack/config.json 2>/dev/null | grep -o '"convexUrl":"[^"]*"' | head -1 | cut -d'"' -f4 || echo "")
[ -n "$_CONVEX_URL" ] && curl -s -X POST "$_CONVEX_URL/api/mutation" -H "Content-Type: application/json" -d '{"path":"telemetry:track","args":{"skill":"flash-trade-trading","phase":"build","status":"success","version":"0.2.0","platform":"'$(uname -s)-$(uname -m)'","timestamp":'$(date +%s)000'}}' >/dev/null 2>&1 &
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

# Flash Trade Integration

## Overview

Guide the user through integrating with Flash Trade — a pool-to-peer perpetual futures DEX on Solana. Supports up to 100x leverage (500x Degen Mode) on crypto, forex, commodities, and equities via Pyth oracle pricing.

This skill covers building applications on top of Flash Trade using the REST API, MCP server, or TypeScript SDK. It does NOT cover building a new perpetual futures protocol from scratch — for that, use `build-defi-protocol`.

**Integration surfaces:**

| Surface | Best For | Complexity |
|---------|----------|------------|
| REST API | Apps, bots, dashboards, any language | Low |
| MCP Server | AI agent integrations | Low |
| WebSocket | Real-time position/order/price feeds | Low |
| TypeScript SDK | Direct on-chain control, custom programs | High |

## Workflow

1. Check for `.superstack/build-context.md`. If found, use existing decisions. If not, ask the user: What are you building? (trading bot, dashboard, AI agent, frontend, etc.) What language/stack? Write `.superstack/build-context.md` with context so future skills can use it.

2. Determine the integration surface:
   - **AI agent** → MCP server. Read [references/mcp-integration.md](references/mcp-integration.md).
   - **Trading bot or backend** → REST API. Read [references/api-reference.md](references/api-reference.md) and [references/transaction-flow.md](references/transaction-flow.md).
   - **Frontend app** → REST API + WebSocket. Read [references/api-reference.md](references/api-reference.md) and [references/transaction-flow.md](references/transaction-flow.md).
   - **Advanced / on-chain** → TypeScript SDK (`flash-sdk` on [NPM](https://www.npmjs.com/package/flash-sdk)). Refer to the [flash-trade-MCP repository](https://github.com/flash-trade/flash-trade-MCP) for CLI and SDK usage examples.

3. Read [references/protocol-concepts.md](references/protocol-concepts.md) to understand the domain model (pools, custodies, markets, positions, orders, collateral rules, fees).

4. Implement in milestones:
   a. **Connect** — API connectivity, environment setup, health check
   b. **Read** — Fetch markets, prices, positions, orders
   c. **Trade** — Build, sign, and submit transactions
   d. **Manage** — Add/remove collateral, set TP/SL, monitor positions
   e. **Harden** — Error handling, blockhash retry, rate limiting

5. For error handling, read [references/error-reference.md](references/error-reference.md).

## Non-Negotiables

- **Minimum collateral >$10 after fees** for positions needing limit orders, TP, or SL. Entry fees reduce collateral — use $11-12+ minimum. This is the #1 integration mistake.
- **Blockhash expiry ~60 seconds.** Sign and submit transactions immediately after building them. If delayed, re-call the transaction builder for a fresh transaction.
- **Always show trade previews to the user before signing.** Transaction tools return fees, entry price, leverage, and liquidation price — display all of these.
- **Do NOT replace the blockhash** in returned transactions. The API may include pre-signed additional signers (e.g., ephemeral WSOL keypairs) that would be invalidated.
- **Pyth prices are mainnet only.** Devnet returns stale or zero prices.
- **One position per market per side per wallet.** Opening a second trade on the same market+side merges into the existing position.
- **Max 5 trigger orders** (TP or SL) per market position.
- **SOL positions use JitoSOL** as underlying collateral on-chain.

## Phase Handoff

This skill is **Phase 2 (Build)** in the Idea -> Build -> Launch journey.

**Reads**: `.superstack/build-context.md`
**Writes/Updates**: `.superstack/build-context.md` (creates if missing) with:
- `flash_trade.integration_surface`: "rest_api" | "mcp" | "websocket" | "sdk"
- `flash_trade.use_case`: string (e.g., "trading bot", "dashboard", "ai agent")
- `flash_trade.markets`: string[] (e.g., ["SOL", "BTC", "ETH"])

When updating, **deep-merge** — don't overwrite existing fields.

See `../../data/specs/phase-handoff.md` for the full JSON contract.

## Quick Start

```bash
# REST API — get all markets
curl https://flashapi.trade/raw/markets

# REST API — get current prices
curl https://flashapi.trade/prices

# REST API — preview a trade (no wallet needed)
curl -X POST https://flashapi.trade/transaction-builder/open-position \
  -H "Content-Type: application/json" \
  -d '{"inputTokenSymbol":"USDC","outputTokenSymbol":"SOL","inputAmountUi":"100.0","leverage":5.0,"tradeType":"LONG"}'

# MCP Server — add to your .mcp.json
# { "mcpServers": { "flash-trade": { "command": "npx", "args": ["-y", "flash-trade-mcp"], "env": { "FLASH_API_URL": "https://flashapi.trade" } } } }
```

## Decision Points

- **Which integration surface?** REST API for custom apps, MCP for AI agents, WebSocket for real-time data, SDK for advanced on-chain control.
- **Which markets?** SOL, BTC, ETH (crypto), XAU/XAG/CRUDEOIL (commodities via virtual tokens), EUR/GBP (forex), TSLAr/NVDAr (equities via RWA).
- **Signing method?** Local keypair (`sign_and_send` MCP tool or server-side), browser wallet adapter (frontend), or Privy embedded wallet.
- **Real-time vs polling?** WebSocket for live position/order updates, REST polling (5-15s) for simpler implementations.

## Resources

### references/

- [references/protocol-concepts.md](references/protocol-concepts.md) — Domain model, collateral rules, fees, leverage, order types
- [references/api-reference.md](references/api-reference.md) — REST API endpoints, request/response formats
- [references/transaction-flow.md](references/transaction-flow.md) — Build, sign, submit transaction lifecycle
- [references/mcp-integration.md](references/mcp-integration.md) — MCP server setup and AI agent workflow
- [references/error-reference.md](references/error-reference.md) — Common error codes with solutions

### External

- [Flash Trade MCP repo](https://github.com/flash-trade/flash-trade-MCP) — Source code, CLI tool, full documentation
- [Flash Trade API docs](https://flashapi.trade/docs/) — Interactive Swagger UI
- [flash-trade-mcp on NPM](https://www.npmjs.com/package/flash-trade-mcp) — MCP server package (v0.4.1)

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
echo '{"skill":"flash-trade-trading","phase":"build","event":"completed","outcome":"OUTCOME","duration_s":"'"$_TEL_DUR"'","session":"'"$_SESSION_ID"'","ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","platform":"'$(uname -s)-$(uname -m)'"}' >> ~/.superstack/telemetry.jsonl 2>/dev/null || true
true
fi
```

Replace `OUTCOME` with success/error/abort based on the workflow result.
