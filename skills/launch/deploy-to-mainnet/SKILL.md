---
name: deploy-to-mainnet
description: Guide a Solana project from devnet to mainnet production deployment. Use when a user says "deploy to mainnet", "go to production", "deployment checklist", "prepare for launch", "mainnet deployment", or "ship it". Reads build-context.md from a prior build phase if available.
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
echo '{"skill":"deploy-to-mainnet","phase":"launch","event":"started","ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}' >> ~/.superstack/telemetry.jsonl 2>/dev/null || true
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

# Deploy to Mainnet

## Overview

Take a devnet-tested Solana project and prepare it for mainnet deployment. Run through a structured pre-flight checklist, configure production infrastructure, and execute the deployment with proper verification.

## Workflow

1. Check for `.superstack/build-context.md`. If found, verify the build status (tests passing, devnet deployed). If not, ask the user about their current state.
2. Run through [references/deployment-checklist.md](references/deployment-checklist.md) item by item.
3. Help configure production RPC using [references/rpc-provider-guide.md](references/rpc-provider-guide.md).
4. If deploying a program, follow [references/program-upgrade-guide.md](references/program-upgrade-guide.md).
5. Write a deployment report HTML artifact.
6. Update `.superstack/build-context.md` with deployment status.

## Prior Context (Optional — never block on this)

If `.superstack/build-context.md` exists, check build status and warn if tests aren't passing or devnet hasn't been tested. If it doesn't exist, **proceed immediately** — ask the user: "Have you tested on devnet?" and go from there.

## Non-Negotiables

- **Never block on missing context files.** Ask the user directly instead.
- Ask "Have you tested on devnet?" — if no, recommend it but don't refuse to proceed.
- Never deploy with a devnet RPC URL. Verify the endpoint.
- Always check that private keys are not committed to git before deployment.
- Always verify the deployment on-chain after it completes.
- If the project has a program, discuss upgrade authority management before deploying.

## Phase Handoff

This skill is **Phase 3 (Launch)** in the Idea → Build → Launch journey.

**Reads**: `.superstack/build-context.md` (from Phase 2)
**Writes/Updates**: `.superstack/build-context.md` (creates if missing) with:
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
# Full deploy runbook: see ../../data/guides/deploy-runbook.md

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

- **Which RPC for mainnet?** NEVER use public RPC for deployment. Helius paid tier minimum.
- **Upgrade authority:** Keep for first 3 months. Transfer to Squads multisig when stable. Freeze only when fully audited.
- **Full checklist:** See `../../data/guides/deploy-runbook.md` for complete pre-flight + post-deploy verification.
- **Wallet strategy:** See `../../data/guides/rpc-wallet-guide.md` — dedicated mainnet keypair, never reuse devnet key.

## Telemetry (run last)

After the skill workflow completes (success, error, or abort), log the telemetry event.
Determine the outcome from the workflow result: `success` if completed normally, `error`
if it failed, `abort` if the user interrupted.

Run this bash:

```bash
_TEL_END=$(date +%s)
_TEL_DUR=$(( _TEL_END - _TEL_START ))
if [ "$_TEL_TIER" != "off" ]; then
echo '{"skill":"deploy-to-mainnet","phase":"launch","event":"completed","outcome":"OUTCOME","duration_s":"'"$_TEL_DUR"'","session":"'"$_SESSION_ID"'","ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","platform":"'$(uname -s)-$(uname -m)'"}' >> ~/.superstack/telemetry.jsonl 2>/dev/null || true
fi
```

Replace `OUTCOME` with success/error/abort based on the workflow result.
