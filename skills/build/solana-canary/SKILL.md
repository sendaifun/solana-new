---
name: solana-canary
description: Post-deploy monitoring for Solana programs. Use when a user says "monitor my program", "canary check", "post-deploy verify", "check program health", "monitor transactions", "verify deployment", or "is my program healthy".
---

# Solana Canary

## Overview

Post-deployment monitoring for Solana programs. Checks program health, transaction success rates, account state correctness, and RPC endpoint reliability after deploying to devnet or mainnet. Establishes a baseline and alerts on anomalies.

## Workflow

1. Read `.solana-new/build-context.json` for program ID, deployment info, and RPC provider.
2. If no program ID is available, ask the user for one.
3. Capture baseline: current program state, recent transaction stats, account balances.
4. Run health checks per [references/program-health-checks.md](references/program-health-checks.md).
5. Verify RPC endpoint reliability per [references/rpc-monitoring.md](references/rpc-monitoring.md).
6. Compare current state against baseline. Flag anomalies.
7. Produce a health report as a local HTML artifact.

## Dependency Gate (Required)

This skill requires a deployed program.

1. If `.solana-new/build-context.json` is missing or has no deployment info:
   - Tell the user to deploy first.
   - Provide exact order: `build-with-claude` → `deploy-to-mainnet` → `solana-canary`.
2. If `build_status.devnet_deployed` and `build_status.mainnet_deployed` are both missing/false:
   - Redirect to `deploy-to-mainnet`.
3. A program ID is required. If not in build context, ask the user directly.

## Non-Negotiables

- Must have a program ID to monitor. Do not run without one.
- Compare against baseline, not absolute thresholds — every program has different norms.
- Alert on anomalies: transaction failure rate spike (>20% above baseline), unexpected account state changes, program authority modifications, balance drain.
- Include transaction signatures as evidence for every alert.
- Transient tolerance: only flag patterns that persist across 2+ consecutive checks, not one-off failures.
- Never claim "healthy" without checking program account existence, authority, and recent transaction stats.
- Always write a local HTML artifact with the health report.

## Phase Handoff

This skill spans **Phase 2/3 (Build/Launch)** in the Idea → Build → Launch journey.

**Reads**: `.solana-new/build-context.json`
**Updates**: `.solana-new/build-context.json` with:
- `canary.status`: `"healthy"` | `"degraded"` | `"broken"`
- `canary.baseline`: object with initial metrics snapshot
- `canary.alerts`: array of `{ type, severity, description, evidence, timestamp }`
- `canary.last_check`: ISO timestamp

When updating `build-context.json`, **deep-merge** with existing content — don't overwrite fields from prior phases.

See `../../data/specs/phase-handoff.md` for the full JSON contract.

## Resources

### references/

- [references/program-health-checks.md](references/program-health-checks.md)
- [references/rpc-monitoring.md](references/rpc-monitoring.md)
