---
name: build-blinks
description: Guide a developer through building Solana Actions and Blinks. Use when a user says "build a blink", "Solana Action", "shareable transaction", "actions API", "transaction link", or "unfurl a transaction". Reads build-context.md from a prior scaffold phase if available.
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
echo '{"skill":"build-blinks","phase":"build","event":"started","ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}' >> ~/.superstack/telemetry.jsonl 2>/dev/null || true
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

# Build Blinks

## Overview

Walk the user through building Solana Actions (server-side API endpoints that return signable transactions) and Blinks (blockchain links that unfurl into interactive transaction UIs in wallets and social feeds). Covers the Actions protocol spec, common patterns, hosting, and testing.

## Workflow

1. Check for `.superstack/build-context.md`. If found, use stack decisions. If not, ask: what action do you want to share (payment, NFT mint, swap, vote, tip, custom)? Write `.superstack/build-context.md` with the context gathered so future skills can use it.
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

**Reads**: `.superstack/build-context.md`
**Writes/Updates**: `.superstack/build-context.md` (creates if missing) with:
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

- **Which RPC for building transactions?** Helius for production (fast tx confirmation).
- **Blink vs traditional UI?** Use Blinks for: single-action flows (donate, mint, swap). Use traditional UI for: multi-step flows, complex forms.
- **Where to host?** Vercel, Railway, or any Node.js host. Must support HTTPS. Add CORS headers for unfurl clients.

## Resources

### references/

- [references/actions-spec.md](references/actions-spec.md)
- [references/blinks-patterns.md](references/blinks-patterns.md)

## Telemetry (run last)

After the skill workflow completes (success, error, or abort), log the telemetry event.
Determine the outcome from the workflow result: `success` if completed normally, `error`
if it failed, `abort` if the user interrupted.

Run this bash:

```bash
_TEL_END=$(date +%s)
_TEL_DUR=$(( _TEL_END - _TEL_START ))
if [ "$_TEL_TIER" != "off" ]; then
echo '{"skill":"build-blinks","phase":"build","event":"completed","outcome":"OUTCOME","duration_s":"'"$_TEL_DUR"'","session":"'"$_SESSION_ID"'","ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","platform":"'$(uname -s)-$(uname -m)'"}' >> ~/.superstack/telemetry.jsonl 2>/dev/null || true
fi
```

Replace `OUTCOME` with success/error/abort based on the workflow result.
