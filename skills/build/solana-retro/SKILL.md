---
name: solana-retro
description: Sprint retrospective with on-chain context for Solana projects. Use when a user says "retro", "what did we ship", "sprint retrospective", "weekly review", "show progress", "what happened this week", or "sprint summary".
---

# Solana Retro

## Overview

Sprint retrospective that combines git history analysis with on-chain deployment metrics. Answers: what shipped, what failed, how's the program performing, and what's the plan for next sprint. Tracks velocity trends across retros.

## Workflow

1. Determine time window: default to last 7 days. User can specify a different range.
2. Analyze git history: commits, PRs merged, branches created/deleted, files changed.
3. If `.solana-new/build-context.json` exists and has a program ID, check on-chain context per [references/on-chain-metrics.md](references/on-chain-metrics.md).
4. Review build context for milestone tracking and prior retro data.
5. Structure the retro per [references/retro-framework.md](references/retro-framework.md).
6. Produce a retrospective report as a local HTML artifact.

## Dependency Gate (Required)

No strict dependency — this skill works with just git history. On-chain metrics are a bonus if a program ID is available.

1. If no git repository exists in the current directory:
   - Stop and tell the user this skill requires a git repository.
2. If `.solana-new/build-context.json` is missing, proceed without on-chain metrics — note this in the report.

## Non-Negotiables

- Always show concrete numbers: commits, lines added/removed, files changed, tests added.
- Include on-chain metrics if a program ID is known (transaction count, unique users, SOL volume).
- Honest assessment: if nothing shipped, say so. Don't inflate progress.
- Track velocity trend if prior retros exist in build context — show whether the team is accelerating, stable, or slowing.
- Praise specific achievements and flag specific blockers — no generic statements.
- Always write a local HTML artifact with the retrospective report.
- Convert all dates to absolute form in the report.

## Phase Handoff

This skill is **Phase 2 (Build)** in the Idea → Build → Launch journey.

**Reads**: `.solana-new/build-context.json`
**Updates**: `.solana-new/build-context.json` with:
- `retro.last_retro`: ISO timestamp
- `retro.velocity_trend`: `"improving"` | `"stable"` | `"declining"`
- `retro.shipped_items`: array of strings describing what was shipped
- `retro.blockers`: array of strings describing current blockers
- `retro.sprint_number`: number (incremented each retro)

When updating `build-context.json`, **deep-merge** with existing content — don't overwrite fields from prior phases.

See `../../data/specs/phase-handoff.md` for the full JSON contract.

## Resources

### references/

- [references/retro-framework.md](references/retro-framework.md)
- [references/on-chain-metrics.md](references/on-chain-metrics.md)
