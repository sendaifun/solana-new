---
name: debug-program
description: Help a developer debug a failing Solana program or transaction. Use when a user says "debug my program", "program error", "transaction failed", "stuck", "help me fix", "why is this failing", "error code", or "instruction failed". Reads build-context.md if available.
---

## Preamble (run first)

```bash
_TEL_TIER=$(cat ~/.superstack/config.json 2>/dev/null | grep -o '"telemetryTier":"[^"]*"' | head -1 | cut -d'"' -f4 || echo "anonymous")
_TEL_TIER="${_TEL_TIER:-anonymous}"
_CONVEX_URL=$(cat ~/.superstack/config.json 2>/dev/null | grep -o '"convexUrl":"[^"]*"' | head -1 | cut -d'"'  -f4 || echo "")
_TEL_PROMPTED=$([ -f ~/.superstack/.telemetry-prompted ] && echo "yes" || echo "no")
_TEL_START=$(date +%s)
_SESSION_ID="$$-$(date +%s)"
mkdir -p ~/.superstack
echo "TELEMETRY: $_TEL_TIER"
echo "TEL_PROMPTED: $_TEL_PROMPTED"
if [ "$_TEL_TIER" != "off" ]; then
_TEL_EVENT='{"skill":"debug-program","phase":"build","event":"started","ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}' 
echo "$_TEL_EVENT" >> ~/.superstack/telemetry.jsonl 2>/dev/null || true
[ -n "$_CONVEX_URL" ] && curl -s -X POST "$_CONVEX_URL/api/mutation" -H "Content-Type: application/json" -d '{"path":"telemetry:track","args":{"skill":"debug-program","phase":"build","status":"success","version":"0.2.0","platform":"'$(uname -s)-$(uname -m)'","timestamp":'$(date +%s)000'}}' >/dev/null 2>&1 &
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

# Debug Program

## Overview

Systematically diagnose and fix Solana program errors and transaction failures. Instead of guessing, follow a structured debugging workflow: read the error, simulate the transaction, inspect program logs, check account state, and trace CPI chains. Covers the top 20 most common Solana dev mistakes and their fixes.

## Workflow

1. Check for `.superstack/build-context.md` for context on what the user is building. If not found, gather context from the user and write `.superstack/build-context.md` so future skills can use it.
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

**Reads**: `.superstack/build-context.md`
**Writes/Updates**: `.superstack/build-context.md` (creates if missing) with:
- `debug.issues_resolved`: array of { error, cause, fix }
- `debug.last_debug_session`: ISO timestamp

When updating, **deep-merge** — don't overwrite existing fields.

See `../../data/specs/phase-handoff.md` for the full JSON contract.

## Quick Start

```bash
# Step 1: Get the error from transaction signature
solana confirm -v <TX_SIGNATURE>

# Step 2: Check program logs for the failing transaction
solana logs <PROGRAM_ID>  # Stream real-time logs (run before reproducing the error)

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

## Telemetry (run last)

After the skill workflow completes (success, error, or abort), log the telemetry event.
Determine the outcome from the workflow result: `success` if completed normally, `error`
if it failed, `abort` if the user interrupted.

Run this bash:

```bash
_TEL_END=$(date +%s)
_TEL_DUR=$(( _TEL_END - _TEL_START ))
if [ "$_TEL_TIER" != "off" ]; then
echo '{"skill":"debug-program","phase":"build","event":"completed","outcome":"OUTCOME","duration_s":"'"$_TEL_DUR"'","session":"'"$_SESSION_ID"'","ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","platform":"'$(uname -s)-$(uname -m)'"}' >> ~/.superstack/telemetry.jsonl 2>/dev/null || true
fi
```

Replace `OUTCOME` with success/error/abort based on the workflow result.
