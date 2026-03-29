---
name: launch-token
description: Guide a developer through launching a token on Solana. Use when a user says "launch a token", "create a token", "pump.fun", "bonding curve", "token launch", "create a memecoin", or "SPL token". Reads build-context.json from a prior scaffold phase if available.
---

# Launch Token

## Overview

Walk the user through every step of launching a token on Solana — from choosing the right token standard (SPL vs Token-2022) and launch mechanism (Pump.fun bonding curve, Raydium pool, direct mint) to setting up metadata, configuring tokenomics, and going live. Covers both meme-style launches and serious project token design.

## Workflow

1. Check for `.solana-new/build-context.json`. If found, use stack decisions. If not, ask: what kind of token (meme, utility, governance)? What launch mechanism (Pump.fun, custom bonding curve, direct LP)?
2. Read [references/token-launch-patterns.md](references/token-launch-patterns.md) to select the right launch path.
3. Read [references/tokenomics-checklist.md](references/tokenomics-checklist.md) to validate supply design and distribution.
4. Guide the user through implementation:
   a. Create the mint (SPL Token or Token-2022 with extensions)
   b. Set metadata (on-chain via Metaplex or Token-2022 metadata extension)
   c. Configure launch mechanism (bonding curve, LP creation, or Pump.fun)
   d. Test the full flow on devnet
   e. Execute mainnet launch
5. Verify the token appears on explorers and DEX aggregators.

## Non-Negotiables

- Always test the full token creation and launch flow on devnet before mainnet.
- Never skip metadata — tokens without metadata are invisible to wallets and explorers.
- Warn about irrevocable actions: revoking mint authority, freeze authority, or update authority is permanent.
- If using Pump.fun, explain the bonding curve mechanics and graduation threshold before launching.
- Validate tokenomics before launch — flag unreasonable supply, missing vesting, or rug-pull patterns.
- Use `rug-check-mcp` or `aethercore-token-rugcheck` to verify the token doesn't trigger safety warnings.

## Phase Handoff

This skill is **Phase 2 (Build)** in the Idea → Build → Launch journey.

**Reads**: `.solana-new/build-context.json`
**Updates**: `.solana-new/build-context.json` with:
- `token.mint_address`: string (devnet and mainnet)
- `token.standard`: "spl-token" | "token-2022"
- `token.launch_mechanism`: "pumpfun" | "raydium" | "custom" | "direct"
- `token.metadata_uploaded`: boolean
- `token.authorities_revoked`: boolean

When updating, **deep-merge** — don't overwrite existing fields.

See `../../data/specs/phase-handoff.md` for the full JSON contract.

## Resources

### references/

- [references/token-launch-patterns.md](references/token-launch-patterns.md)
- [references/tokenomics-checklist.md](references/tokenomics-checklist.md)
