---
name: build-blinks
description: Guide a developer through building Solana Actions and Blinks. Use when a user says "build a blink", "Solana Action", "shareable transaction", "actions API", "transaction link", or "unfurl a transaction". Reads build-context.json from a prior scaffold phase if available.
---

> **Wrong skill?** See [SKILL_ROUTER.md](../../SKILL_ROUTER.md) for all available skills.

# Build Blinks

## Overview

Walk the user through building Solana Actions (server-side API endpoints that return signable transactions) and Blinks (blockchain links that unfurl into interactive transaction UIs in wallets and social feeds). Covers the Actions protocol spec, common patterns, hosting, and testing.

## Workflow

1. Check for `.superstack/build-context.json`. If found, use stack decisions. If not, ask: what action do you want to share (payment, NFT mint, swap, vote, tip, custom)?
2. Read [references/actions-spec.md](references/actions-spec.md) to understand the protocol requirements.
3. Read [references/blinks-patterns.md](references/blinks-patterns.md) to select the right pattern for the use case.
4. Implement the Action endpoint:
   a. GET handler returning action metadata (icon, title, description, links)
   b. POST handler building and returning the unsigned transaction
   c. CORS headers and `actions.json` route configuration
   d. Optional: action chaining for multi-step flows
5. Test locally, then deploy and verify unfurling works in Dialect explorer.
6. Share the blink URL and confirm it renders correctly in wallets/social feeds.

## Non-Negotiables

- Always return proper CORS headers — Actions will silently fail without them.
- The `actions.json` file must be at the root of the domain (e.g., `https://example.com/actions.json`).
- Never hardcode wallet addresses in the POST handler — use the `account` field from the request body.
- Always include an icon URL that returns a valid image — blinks without icons look broken.
- Test action chaining carefully — each step must be independently valid.
- Validate all user inputs server-side before building transactions.

## Phase Handoff

This skill is **Phase 2 (Build)** in the Idea → Build → Launch journey.

**Reads**: `.superstack/build-context.json`
**Updates**: `.superstack/build-context.json` with:
- `blinks.action_url`: string (deployed endpoint)
- `blinks.action_type`: "payment" | "mint" | "swap" | "vote" | "custom"
- `blinks.chained`: boolean
- `blinks.deployed`: boolean

When updating, **deep-merge** — don't overwrite existing fields.

See `../../data/specs/phase-handoff.md` for the full JSON contract.

## Quick Start

```bash
# Scaffold a Blinks/Actions server
npx create-solana-dapp my-blink --template actions
# Or manual:
mkdir my-blink && cd my-blink
npm init -y
npm install @solana/actions express @solana/web3.js

# Required files:
# GET  /actions.json          — Action metadata
# GET  /api/action            — Action definition (icon, label, links)
# POST /api/action            — Build and return transaction

# Test locally:
npm start  # Server on port 3000
# Visit: https://dial.to/?action=solana-action:http://localhost:3000/api/action
```

## Decision Points

- **Which RPC for building transactions?** See `../../data/decisions/rpc-selection.json` — Helius for production (fast tx confirmation).
- **Blink vs traditional UI?** Use Blinks for: single-action flows (donate, mint, swap). Use traditional UI for: multi-step flows, complex forms.
- **Where to host?** Vercel, Railway, or any Node.js host. Must support HTTPS. Add CORS headers for unfurl clients.

## Resources

### references/

- [references/actions-spec.md](references/actions-spec.md)
- [references/blinks-patterns.md](references/blinks-patterns.md)
