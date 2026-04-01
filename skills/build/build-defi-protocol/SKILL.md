---
name: build-defi-protocol
description: Guide a developer through building a DeFi protocol on Solana. Use when a user says "build a DEX", "AMM", "lending protocol", "vault", "yield", "liquidity pool", "DeFi protocol", "swap program", "build a DeFi app", "perpetual futures", "perps protocol", "leverage trading", or "derivatives". Reads build-context.json from a prior scaffold phase if available.
---

> **Wrong skill?** See [SKILL_ROUTER.md](../../SKILL_ROUTER.md) for all available skills.

# Build DeFi Protocol

## Overview

Guide the user through designing and implementing a DeFi protocol on Solana — AMMs, lending pools, vaults, or yield strategies. Covers program architecture, math primitives, security patterns, and testing against real liquidity state. Emphasizes security-first development since DeFi programs handle real funds.

## Workflow

1. Check for `.superstack/build-context.json`. If found, use stack decisions. If not, ask: what type of DeFi (AMM, lending, vault, yield aggregator)? What's the target scale and composability needs?
2. Read [references/defi-program-patterns.md](references/defi-program-patterns.md) to select architecture and math primitives.
3. Read [references/defi-security.md](references/defi-security.md) before writing any program logic — security must be designed in, not bolted on.
4. Read [references/defi-testing.md](references/defi-testing.md) to set up the testing environment with real liquidity state.
5. Implement in milestones:
   a. Core math library (constant product, interest rate, price calculation)
   b. Account structures and state management
   c. Core instructions (deposit, withdraw, swap, borrow, repay)
   d. Access control, admin functions, emergency pause
   e. Integration tests against forked mainnet state via Surfpool
6. Security review before any deployment — use `solana-fender-mcp` for static analysis.

## Non-Negotiables

- Never deploy a DeFi program without at least one independent security review pass.
- All math must use checked arithmetic — no overflows, no precision loss on division.
- Always validate oracle prices are fresh (staleness check) before using in calculations.
- Test with realistic liquidity state using Surfpool's mainnet forking, not just unit tests.
- Include an emergency pause mechanism — you will need it.
- Validate slippage on every swap or liquidity operation. No unbounded price impact.

## Phase Handoff

This skill is **Phase 2 (Build)** in the Idea → Build → Launch journey.

**Reads**: `.superstack/build-context.json`
**Updates**: `.superstack/build-context.json` with:
- `defi.protocol_type`: "amm" | "lending" | "vault" | "yield" | "custom"
- `defi.program_id`: string (devnet)
- `defi.security_review`: "none" | "self" | "audit-firm"
- `defi.oracle_integration`: string (e.g., "pyth", "switchboard")
- `defi.emergency_pause`: boolean

When updating, **deep-merge** — don't overwrite existing fields.

See `../../data/specs/phase-handoff.md` for the full JSON contract.

## Quick Start

```bash
# DeFi project scaffold with Anchor
anchor init my-defi-protocol
cd my-defi-protocol

# Key dependencies for DeFi:
cargo add anchor-spl          # SPL token integration
cargo add pyth-sdk-solana     # Oracle price feeds

# Test with mainnet fork (real liquidity data)
surfpool --fork mainnet-beta
anchor test --skip-local-validator
```

## Decision Points

- **Which DeFi category?** See `../../data/decisions/defi-protocol.json` — AMM, lending, perps, staking, yield.
- **Which oracle?** Pyth for crypto price feeds (fastest, widest coverage). Switchboard for custom data feeds or non-crypto data.
- **Which token standard?** See `../../data/decisions/token-standard.json` — SPL Token for simple fungible, Token-2022 for transfer fees.
- **Single deployer vs multisig?** Use Squads multisig for any program handling >$10k TVL.
- **Security checklist:** See `../../data/runbooks/security-checklist.md` — mandatory before mainnet.

## Resources

### references/

- [references/defi-program-patterns.md](references/defi-program-patterns.md)
- [references/defi-security.md](references/defi-security.md)
- [references/defi-testing.md](references/defi-testing.md)
