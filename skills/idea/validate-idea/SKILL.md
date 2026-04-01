---
name: validate-idea
description: Run a structured validation sprint on a crypto startup idea. Use when a user says "validate this idea", "is this worth building", "run a validation sprint", "help me test demand", or "should I build this". Reads idea-context.json from a prior idea phase if available.
---

> **Wrong skill?** See [SKILL_ROUTER.md](../../SKILL_ROUTER.md) for all available skills.

# Validate Idea

## Overview

Take an idea (from a prior find-next-crypto-idea session or fresh from the user) and stress-test it with a structured validation sprint. Produce a go/no-go recommendation backed by demand signals, risk analysis, and a concrete next-steps plan.

## Workflow

1. Check for `.superstack/idea-context.json` in the workspace. If found, load the chosen idea. If not, ask the user to describe their idea.
2. Read [references/validation-framework.md](references/validation-framework.md) for the sprint structure.
3. Evaluate demand signals using [references/customer-signal-rubric.md](references/customer-signal-rubric.md).
4. Run the crypto necessity gut-check: "What breaks if you remove the blockchain?"
5. Map risks: technical, market, regulatory, team.
6. Apply [references/pivot-or-persist.md](references/pivot-or-persist.md) to reach a go/no-go decision.
7. Write a local HTML artifact with the validation report.

## Non-Negotiables

- Do not rubber-stamp. If the idea is weak, say so with specifics.
- Every "go" recommendation must cite at least 2 concrete demand signals (not vibes).
- Every "no-go" must include a pivot suggestion, not just rejection.
- If the user has no evidence of demand, the answer is "go validate" with a specific sprint plan, not "go build".
- Always check if there is already a live product doing the same thing on Solana.
- Always write a local HTML artifact. Do not leave results only in chat.

## Phase Handoff

This skill is **Phase 1 (Idea)** in the Idea → Build → Launch journey. After completing validation:

1. Update `.superstack/idea-context.json` with a `validation` field containing:
   - `demand_signals`: array of evidence items
   - `risks`: array of { category, description, severity }
   - `go_no_go`: "go" | "no-go" | "pivot"
   - `confidence`: 0.0 - 1.0
   - `next_steps`: array of concrete actions
2. Tell the user they can proceed to the **Build** phase if the verdict is "go".
3. See `../../../data/specs/phase-handoff.md` for the full JSON contract.

## Quick Start

```bash
# Just describe your idea and ask for validation:
#   "Validate this idea: a Solana protocol for agent-to-agent payments"
#   "Is this worth building? [describe idea]"
#   "Run a validation sprint on my idea"
```

## Decision Points

- **No idea yet?** Redirect to `find-next-crypto-idea` first.
- **Which RPC for testing demand?** See `../../data/decisions/rpc-selection.json` — use Helius free tier for any on-chain research.
- **Go vs. no-go threshold:** Score ≥ 8/15 across founder-fit + MVP-speed + distribution + market-pull + revenue = Go. Below 6 = strong No-go.

## Resources

### references/

- [references/validation-framework.md](references/validation-framework.md)
- [references/customer-signal-rubric.md](references/customer-signal-rubric.md)
- [references/pivot-or-persist.md](references/pivot-or-persist.md)
