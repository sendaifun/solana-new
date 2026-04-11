---
name: launch-token
description: Guide a developer through launching a token on Solana. Use when a user says "launch a token", "create a token", "pump.fun", "bonding curve", "token launch", "create a memecoin", or "SPL token". Reads build-context.md from a prior scaffold phase if available.
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
_TEL_EVENT='{"skill":"launch-token","phase":"build","event":"started","ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}' 
echo "$_TEL_EVENT" >> ~/.superstack/telemetry.jsonl 2>/dev/null || true
_CONVEX_URL=$(cat ~/.superstack/config.json 2>/dev/null | grep -o '"convexUrl":"[^"]*"' | head -1 | cut -d'"' -f4 || echo "")
[ -n "$_CONVEX_URL" ] && curl -s -X POST "$_CONVEX_URL/api/mutation" -H "Content-Type: application/json" -d '{"path":"telemetry:track","args":{"skill":"launch-token","phase":"build","status":"success","version":"0.2.0","platform":"'$(uname -s)-$(uname -m)'","timestamp":'$(date +%s)000'}}' >/dev/null 2>&1 &
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

# Launch Token

## Overview

Walk the user through every step of launching a token on Solana — from choosing the right token standard (SPL vs Token-2022) and launch mechanism (Pump.fun bonding curve, Raydium pool, direct mint) to setting up metadata, configuring tokenomics, and going live. Covers both meme-style launches and serious project token design.

## Workflow

1. Check for `.superstack/build-context.md`. If found, use stack decisions. If not, ask: what kind of token (meme, utility, governance)? What launch mechanism (Pump.fun, Meteora DBC, custom bonding curve, direct LP)? Write `.superstack/build-context.md` with the context gathered so future skills can use it.
2. Read [references/token-launch-patterns.md](references/token-launch-patterns.md) to select the right launch path.
3. Read [references/tokenomics-checklist.md](references/tokenomics-checklist.md) to validate supply design and distribution.
4. Guide the user through implementation:
   a. Create the mint (SPL Token or Token-2022 with extensions)
   b. Set metadata (on-chain via Metaplex or Token-2022 metadata extension)
   c. Configure launch mechanism (Pump.fun, Meteora DBC, direct LP, or custom bonding curve)
   d. Test the full flow on devnet
   e. Execute mainnet launch
5. Verify the token appears on explorers and DEX aggregators.

## Non-Negotiables

- Always test the full token creation and launch flow on devnet before mainnet.
- Never skip metadata — tokens without metadata are invisible to wallets and explorers.
- Warn about irrevocable actions: revoking mint authority, freeze authority, or update authority is permanent.
- If using Pump.fun, explain the bonding-curve mechanics, that migration to PumpSwap happens when the curve completes, and that current creator-fee / reward-sharing settings should be treated as a one-time configuration decision. Avoid hardcoding market-cap or liquidity thresholds unless you are citing current Pump docs.
- If using Meteora DBC, explain that it is a configurable multi-segment bonding curve that graduates into DAMM v1 or DAMM v2 after its migration threshold is reached.
- Validate tokenomics before launch — flag unreasonable supply, missing vesting, or rug-pull patterns.
- Use `rug-check-mcp` or `aethercore-token-rugcheck` to verify the token doesn't trigger safety warnings.

## Phase Handoff

This skill is **Phase 2 (Build)** in the Idea → Build → Launch journey.

**Reads**: `.superstack/build-context.md`
**Writes/Updates**: `.superstack/build-context.md` (creates if missing) with:
- `token.mint_address`: string (devnet and mainnet)
- `token.standard`: "spl-token" | "token-2022"
- `token.launch_mechanism`: "pumpfun" | "meteora-dbc" | "raydium" | "custom" | "direct"
- `token.metadata_uploaded`: boolean
- `token.authorities_revoked`: boolean

When updating, **deep-merge** — don't overwrite existing fields.

See `../../data/specs/phase-handoff.md` for the full JSON contract.

## Quick Start

```bash
# Standard SPL Token (most compatible):
spl-token create-token
spl-token create-account <MINT>
spl-token mint <MINT> 1000000

# Add metadata (Metaplex Token Metadata / Umi-based flow):
npm install @metaplex-foundation/mpl-token-metadata @metaplex-foundation/umi

# Token-2022 with transfer fees:
spl-token --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb create-token \
  --transfer-fee-basis-points 100 \
  --transfer-fee-maximum-fee 1000000

# Pump.fun launch:
# Use the current Pump SDK / Pump docs — see references/token-launch-patterns.md

# Meteora DBC launch:
# Use Meteora DBC docs / SDK guidance — see references/token-launch-patterns.md
```

## Decision Points

- **Which token standard?** SPL Token (default) vs Token-2022 (extensions such as transfer fees, transfer hooks, metadata pointers, confidential transfers, and other advanced token controls).
- **Which launch mechanism?** Pump.fun (simple community launch), Meteora DBC (configurable multi-segment bonding curve with DAMM graduation), direct LP on Raydium or other AMMs (project-controlled market), or custom bonding curve (only if you truly need custom on-chain logic).
- **Freeze authority?** Revoke for community trust. Keep for regulated or controlled tokens. Use Squads multisig for compromise.
- **Security:** Run `../../data/guides/security-checklist.md` checks before launch. Use rug-check MCP to verify your own token.

## Resources

### references/

- [references/token-launch-patterns.md](references/token-launch-patterns.md)
- [references/tokenomics-checklist.md](references/tokenomics-checklist.md)

### current external references

- [Pump Public Docs — Pump Program README](https://github.com/pump-fun/pump-public-docs)
- [Pump SDK](https://www.npmjs.com/package/@pump-fun/pump-sdk)
- [Meteora DBC — What is DBC?](https://docs.meteora.ag/overview/products/dbc/what-is-dbc)
- [Meteora DBC — DBC Flow](https://docs.meteora.ag/overview/products/dbc/dbc-flow)
- [Meteora DBC — Curve Configuration](https://docs.meteora.ag/overview/products/dbc/curve-configuration)
- [Meteora DBC — Migration](https://docs.meteora.ag/overview/products/dbc/migration)

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
echo '{"skill":"launch-token","phase":"build","event":"completed","outcome":"OUTCOME","duration_s":"'"$_TEL_DUR"'","session":"'"$_SESSION_ID"'","ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","platform":"'$(uname -s)-$(uname -m)'"}' >> ~/.superstack/telemetry.jsonl 2>/dev/null || true
true
fi
```

Replace `OUTCOME` with success/error/abort based on the workflow result.
