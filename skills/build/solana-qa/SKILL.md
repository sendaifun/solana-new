---
name: solana-qa
description: Systematic QA testing for Solana dApps and programs. Use when a user says "test my dApp", "QA my app", "test wallet flow", "test transaction signing", "verify on devnet", "does my dApp work", "test the frontend", or "run QA".
---

# Solana QA

## Overview

Systematic QA testing for Solana dApps covering wallet connection flows, transaction signing, error states, network switching, and devnet verification. Tests both on-chain program behavior and frontend integration. Produces a structured QA report with pass/fail evidence.

## Workflow

1. Check for `.solana-new/build-context.json` to understand the stack and architecture.
2. Determine test scope based on project structure:
   - **Frontend dApp**: wallet flows, UI interactions, transaction signing
   - **Program-only**: instruction testing, account state verification
   - **Full-stack**: both frontend and program testing
3. For frontend dApps: run wallet flow tests per [references/wallet-flow-tests.md](references/wallet-flow-tests.md).
4. For programs: run program interaction tests per [references/program-test-patterns.md](references/program-test-patterns.md).
5. For all projects: run devnet verification per [references/devnet-verification.md](references/devnet-verification.md).
6. Record results: pass/fail per test case with transaction signatures or screenshots as evidence.
7. Produce a local HTML artifact with the QA report.

## Dependency Gate (Required)

This skill depends on having a built project to test.

1. If `.solana-new/build-context.json` is missing:
   - Tell the user to run `scaffold-project` then `build-with-claude` first.
   - Provide exact order: `solana-new copilot "your idea"` → `scaffold-project` → `build-with-claude` → `solana-qa`.
2. If build context exists but `build_status` shows no code has been written:
   - Redirect to `build-with-claude` or the appropriate domain skill.
3. If the project has no testable code (no frontend, no program), explicitly stop and redirect.

## Non-Negotiables

- Test wallet connect/disconnect with at least Phantom and Solflare adapter patterns.
- Test transaction signing including user rejection handling (user clicks "Cancel" in wallet).
- Test error states: insufficient SOL, account not found, program error codes, RPC timeout.
- Verify on devnet before claiming tests pass — simulation is not enough.
- Never skip network mismatch testing (mainnet wallet connected to devnet dApp).
- Report actual transaction signatures for passing on-chain tests as evidence.
- If tests require SOL, airdrop on devnet first — never ask users to fund test wallets.
- Always write a local HTML artifact with the QA report.
- Do not generate fake test results. If a test cannot be run, mark it as "skipped" with reason.

## Phase Handoff

This skill is **Phase 2 (Build)** in the Idea → Build → Launch journey.

**Reads**: `.solana-new/build-context.json`
**Updates**: `.solana-new/build-context.json` with:
- `qa.test_results`: array of `{ name, category, status, evidence }`
- `qa.pass_rate`: number (0-100)
- `qa.devnet_verified`: boolean
- `qa.last_qa_run`: ISO timestamp

When updating `build-context.json`, **deep-merge** with existing content — don't overwrite fields from prior phases.

See `../../data/specs/phase-handoff.md` for the full JSON contract.

## Resources

### references/

- [references/wallet-flow-tests.md](references/wallet-flow-tests.md)
- [references/program-test-patterns.md](references/program-test-patterns.md)
- [references/devnet-verification.md](references/devnet-verification.md)
