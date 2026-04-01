---
name: debug-program
description: Help a developer debug a failing Solana program or transaction. Use when a user says "debug my program", "program error", "transaction failed", "stuck", "help me fix", "why is this failing", "error code", or "instruction failed". Reads build-context.json if available.
---

> **Wrong skill?** See [SKILL_ROUTER.md](../../SKILL_ROUTER.md) for all available skills.

# Debug Program

## Overview

Systematically diagnose and fix Solana program errors and transaction failures. Instead of guessing, follow a structured debugging workflow: read the error, simulate the transaction, inspect program logs, check account state, and trace CPI chains. Covers the top 20 most common Solana dev mistakes and their fixes.

## Workflow

1. Check for `.superstack/build-context.json` for context on what the user is building.
2. Get the error: ask for the exact error message, transaction signature, or program logs.
3. Read [references/debug-workflow.md](references/debug-workflow.md) and follow the systematic debugging process.
4. If the error matches a known pattern, check [references/common-pitfalls.md](references/common-pitfalls.md) for the exact cause and fix.
5. Debug steps:
   a. Parse the error message — identify error code, program, instruction index
   b. Simulate the transaction to get full logs: `connection.simulateTransaction(tx)`
   c. Inspect account state: check existence, ownership, balance, data
   d. If CPI involved, trace the call chain to find which program failed
   e. Apply the fix, test on devnet, confirm resolution
6. If stuck after 3 attempts, suggest a different approach or escalate to a community resource.

## Non-Negotiables

- Always get the exact error message or transaction signature first. Do not guess without data.
- Simulate transactions before sending — the simulation logs contain the actual error.
- Check the basics first: is the account initialized? Is the signer correct? Is there enough SOL?
- Never suggest "just retry" without understanding why the transaction failed.
- When debugging CPI errors, identify which program in the chain actually failed.
- Use Surfpool for reproducible debugging — fork the state, replay the transaction, inspect.

## Phase Handoff

This skill is **Phase 2 (Build)** in the Idea → Build → Launch journey.

**Reads**: `.superstack/build-context.json`
**Updates**: `.superstack/build-context.json` with:
- `debug.issues_resolved`: array of { error, cause, fix }
- `debug.last_debug_session`: ISO timestamp

When updating, **deep-merge** — don't overwrite existing fields.

See `../../data/specs/phase-handoff.md` for the full JSON contract.

## Quick Start

```bash
# Step 1: Get the error from transaction signature
solana confirm -v <TX_SIGNATURE>

# Step 2: Simulate the failing transaction
solana transaction-simulate <TX_SIGNATURE>  # Or use Anchor's simulate

# Step 3: Check account state
solana account <ACCOUNT_ADDRESS> --output json

# Step 4: Read program logs
solana logs <PROGRAM_ID>  # Live stream

# Step 5: Check common issues
anchor idl fetch <PROGRAM_ID>  # Verify IDL matches
```

## Decision Points

- **Which RPC for debugging?** Use Surfpool with `--fork mainnet-beta` to replay mainnet transactions locally.
- **Can't read error code?** Check Anchor error codes: 6000+ are custom program errors. 0x1 = insufficient funds. 0x0 = success.
- **CPI error from another program?** Check the inner instructions in transaction logs. The error comes from the CPI'd program, not yours.

## Resources

### references/

- [references/debug-workflow.md](references/debug-workflow.md)
- [references/common-pitfalls.md](references/common-pitfalls.md)
