---
name: deploy-to-mainnet
description: Guide a Solana project from devnet to mainnet production deployment. Use when a user says "deploy to mainnet", "go to production", "deployment checklist", "prepare for launch", "mainnet deployment", or "ship it". Reads build-context.json from a prior build phase if available.
---

# Deploy to Mainnet

## Overview

Take a devnet-tested Solana project and prepare it for mainnet deployment. Run through a structured pre-flight checklist, configure production infrastructure, and execute the deployment with proper verification.

## Workflow

1. Check for `.solana-new/build-context.json`. If found, verify the build status (tests passing, devnet deployed). If not, ask the user about their current state.
2. Run through [references/deployment-checklist.md](references/deployment-checklist.md) item by item.
3. Help configure production RPC using [references/rpc-provider-guide.md](references/rpc-provider-guide.md).
4. If deploying a program, follow [references/program-upgrade-guide.md](references/program-upgrade-guide.md).
5. Write a deployment report HTML artifact.
6. Update `.solana-new/build-context.json` with deployment status.

## Dependency Gate (Required)

This skill should not run as the first launch action.

1. Require `.solana-new/build-context.json`.
2. Require `build_status.tests_passing = true` and `build_status.devnet_deployed = true`.
3. If either is missing/false, stop and redirect with exact order:
   - `solana-new copilot start "your idea"`
   - `scaffold-project`
   - `build-with-claude`
   - `review-and-iterate`
   - then `deploy-to-mainnet`
4. Only continue without this context if the user explicitly insists and accepts deployment risk.

## Non-Negotiables

- Never deploy a program that hasn't been tested on devnet first. Block and redirect.
- Never deploy with a devnet RPC URL. Verify the endpoint.
- Always check that private keys are not committed to git before deployment.
- Always verify the deployment on-chain after it completes (check program data, test a transaction).
- If the project has a program, discuss upgrade authority management before deploying.
- Environment variables must be production-ready (real API keys, mainnet RPC, etc.).
- Always write a local HTML artifact with the deployment checklist and results.
- Never treat missing dependency context as a soft warning; block and redirect by default.

## Phase Handoff

This skill is **Phase 3 (Launch)** in the Idea → Build → Launch journey.

**Reads**: `.solana-new/build-context.json` (from Phase 2)
**Updates**: `.solana-new/build-context.json` with:
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
