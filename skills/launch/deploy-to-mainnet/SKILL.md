---
name: deploy-to-mainnet
description: Guide a Solana project from devnet to mainnet production deployment. Use when a user says "deploy to mainnet", "go to production", "deployment checklist", "prepare for launch", "mainnet deployment", or "ship it". Reads build-context.json from a prior build phase if available.
---

> **Wrong skill?** See [SKILL_ROUTER.md](../../SKILL_ROUTER.md) for all available skills.

# Deploy to Mainnet

## Overview

Take a devnet-tested Solana project and prepare it for mainnet deployment. Run through a structured pre-flight checklist, configure production infrastructure, and execute the deployment with proper verification.

## Workflow

1. Check for `.superstack/build-context.json`. If found, verify the build status (tests passing, devnet deployed). If not, ask the user about their current state.
2. Run through [references/deployment-checklist.md](references/deployment-checklist.md) item by item.
3. Help configure production RPC using [references/rpc-provider-guide.md](references/rpc-provider-guide.md).
4. If deploying a program, follow [references/program-upgrade-guide.md](references/program-upgrade-guide.md).
5. Write a deployment report HTML artifact.
6. Update `.superstack/build-context.json` with deployment status.

## Prior Context (Optional — never block on this)

If `.superstack/build-context.json` exists, check build status and warn if tests aren't passing or devnet hasn't been tested. If it doesn't exist, **proceed immediately** — ask the user: "Have you tested on devnet?" and go from there.

## Non-Negotiables

- **Never block on missing context files.** Ask the user directly instead.
- Ask "Have you tested on devnet?" — if no, recommend it but don't refuse to proceed.
- Never deploy with a devnet RPC URL. Verify the endpoint.
- Always check that private keys are not committed to git before deployment.
- Always verify the deployment on-chain after it completes.
- If the project has a program, discuss upgrade authority management before deploying.

## Phase Handoff

This skill is **Phase 3 (Launch)** in the Idea → Build → Launch journey.

**Reads**: `.superstack/build-context.json` (from Phase 2)
**Updates**: `.superstack/build-context.json` with:
- `build_status.mainnet_deployed`: true
- `build_status.mainnet_program_id`: string (if applicable)
- `build_status.deployment_date`: ISO timestamp
- `build_status.rpc_provider`: string

See `../../../data/specs/phase-handoff.md` for the full JSON contract.

## Resources

### references/

- [references/deployment-checklist.md](references/deployment-checklist.md)
- [references/rpc-provider-guide.md](references/rpc-provider-guide.md)
- [references/program-upgrade-guide.md](references/program-upgrade-guide.md)

## Quick Start

```bash
# Full deploy runbook: see ../../data/runbooks/deploy-runbook.md

# Quick version:
anchor build
solana config set --url "https://mainnet.helius-rpc.com/?api-key=YOUR_KEY"
solana balance  # Need ~5 SOL

# Pre-flight
grep -rn "devnet" src/ app/ --include="*.ts" --include="*.rs" | grep -v test  # Should be 0 results
sha256sum target/deploy/my_program.so  # Save build hash

# Deploy
anchor deploy --provider.cluster mainnet-beta

# Verify
solana program show <PROGRAM_ID>
```

## Decision Points

- **Which RPC for mainnet?** See `../../data/decisions/rpc-selection.json` — NEVER use public RPC for deployment. Helius paid tier minimum.
- **Upgrade authority:** Keep for first 3 months. Transfer to Squads multisig when stable. Freeze only when fully audited.
- **Full checklist:** See `../../data/runbooks/deploy-runbook.md` for complete pre-flight + post-deploy verification.
- **Wallet strategy:** See `../../data/runbooks/rpc-wallet-guide.md` — dedicated mainnet keypair, never reuse devnet key.
