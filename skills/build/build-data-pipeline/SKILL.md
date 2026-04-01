---
name: build-data-pipeline
description: Guide a developer through building a Solana data pipeline or indexer. Use when a user says "build an indexer", "data pipeline", "analytics", "track transactions", "monitor wallets", "webhook", "index accounts", or "real-time data". Reads build-context.json from a prior scaffold phase if available.
---

> **Wrong skill?** See [SKILL_ROUTER.md](../../SKILL_ROUTER.md) for all available skills.

# Build Data Pipeline

## Overview

Guide the user through building a data pipeline that ingests, transforms, and stores Solana on-chain data. Covers real-time event streaming via webhooks and WebSockets, historical backfilling, account state indexing, and building query-friendly storage. Uses Helius infrastructure for production-grade data ingestion.

## Workflow

1. Check for `.superstack/build-context.json`. If found, use stack decisions. If not, ask: what data do you need (transactions, account state, token transfers, program events)? Real-time, historical, or both?
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

**Reads**: `.superstack/build-context.json`
**Updates**: `.superstack/build-context.json` with:
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
- **Which RPC?** See `../../data/decisions/rpc-selection.json` — Helius required for webhooks and DAS API.
- **Database?** PostgreSQL for relational data + transactions. Redis for caching + real-time state. SQLite for small/local indexers.
- **Hosting?** Railway or Fly.io for webhook receivers. AWS/GCP for Geyser plugins.

## Resources

### references/

- [references/indexing-patterns.md](references/indexing-patterns.md)
- [references/data-storage.md](references/data-storage.md)
