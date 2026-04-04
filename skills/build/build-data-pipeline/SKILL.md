---
name: build-data-pipeline
description: Guide a developer through building a Solana data pipeline or indexer. Use when a user says "build an indexer", "data pipeline", "analytics", "track transactions", "monitor wallets", "webhook", "index accounts", or "real-time data". Reads build-context.md from a prior scaffold phase if available.
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
echo '{"skill":"build-data-pipeline","phase":"build","event":"started","ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}' >> ~/.superstack/telemetry.jsonl 2>/dev/null || true
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

# Build Data Pipeline

## Overview

Guide the user through building a data pipeline that ingests, transforms, and stores Solana on-chain data. Covers real-time event streaming via webhooks and WebSockets, historical backfilling, account state indexing, and building query-friendly storage. Uses Helius infrastructure for production-grade data ingestion.

## Workflow

1. Check for `.superstack/build-context.md`. If found, use stack decisions. If not, ask: what data do you need (transactions, account state, token transfers, program events)? Real-time, historical, or both? Write `.superstack/build-context.md` with the context gathered so future skills can use it.
2. Read [references/indexing-patterns.md](references/indexing-patterns.md) to select the right ingestion method.
3. Read [references/data-storage.md](references/data-storage.md) to design the storage schema.
4. Implement in milestones:
   a. Set up data ingestion (Helius webhook, WebSocket subscription, or geyser plugin)
   b. Build the parser/transformer for your specific data format
   c. Design and create the database schema
   d. Implement write path (ingestion → parse → store)
   e. Build query API or dashboard on top of stored data
5. Test with live devnet data, then switch to mainnet when ready.
6. Monitor ingestion lag and handle missed events with backfill logic.

## Non-Negotiables

- Always implement idempotent writes — webhooks and WebSockets can deliver duplicates.
- Include a backfill mechanism — you will miss events during deploys, restarts, and outages.
- Never store raw transaction blobs without parsing — they are expensive to query later.
- Use Helius enhanced transactions for parsed data instead of raw RPC when possible.
- Monitor ingestion lag — if your pipeline falls behind, you need alerts, not silent data loss.
- Store the slot number with every record for ordering and deduplication.

## Phase Handoff

This skill is **Phase 2 (Build)** in the Idea → Build → Launch journey.

**Reads**: `.superstack/build-context.md`
**Writes/Updates**: `.superstack/build-context.md` (creates if missing) with:
- `pipeline.ingestion_method`: "webhook" | "websocket" | "geyser" | "rpc-polling"
- `pipeline.data_types`: string[] (e.g., ["transactions", "account-state", "token-transfers"])
- `pipeline.storage`: "postgresql" | "redis" | "custom"
- `pipeline.backfill_implemented`: boolean

When updating, **deep-merge** — don't overwrite existing fields.

See `../../data/specs/phase-handoff.md` for the full JSON contract.

## Quick Start

```bash
# Fastest: Helius webhooks (no infrastructure needed)
# 1. Get Helius API key from helius.dev
# 2. Create webhook:
curl -X POST https://api.helius.xyz/v0/webhooks?api-key=YOUR_KEY \
  -H 'Content-Type: application/json' \
  -d '{
    "webhookURL": "https://your-app.com/webhook",
    "transactionTypes": ["TRANSFER"],
    "accountAddresses": ["YOUR_PROGRAM_ID"]
  }'

# For WebSocket (real-time, more control):
# Use: solana logs <PROGRAM_ID> --url mainnet-beta
# Or: @solana/web3.js Connection.onLogs()
```

## Decision Points

- **Which ingestion method?** Webhooks (simplest, Helius) → WebSocket (real-time) → Geyser (highest throughput) → Polling (last resort).
- **Which RPC?** Helius required for webhooks and DAS API.
- **Database?** PostgreSQL for relational data + transactions. Redis for caching + real-time state. SQLite for small/local indexers.
- **Hosting?** Railway or Fly.io for webhook receivers. AWS/GCP for Geyser plugins.

## Resources

### references/

- [references/indexing-patterns.md](references/indexing-patterns.md)
- [references/data-storage.md](references/data-storage.md)

## Telemetry (run last)

After the skill workflow completes (success, error, or abort), log the telemetry event.
Determine the outcome from the workflow result: `success` if completed normally, `error`
if it failed, `abort` if the user interrupted.

Run this bash:

```bash
_TEL_END=$(date +%s)
_TEL_DUR=$(( _TEL_END - _TEL_START ))
if [ "$_TEL_TIER" != "off" ]; then
echo '{"skill":"build-data-pipeline","phase":"build","event":"completed","outcome":"OUTCOME","duration_s":"'"$_TEL_DUR"'","session":"'"$_SESSION_ID"'","ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","platform":"'$(uname -s)-$(uname -m)'"}' >> ~/.superstack/telemetry.jsonl 2>/dev/null || true
fi
```

Replace `OUTCOME` with success/error/abort based on the workflow result.
