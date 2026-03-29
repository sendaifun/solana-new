---
name: scaffold-project
description: Set up a complete Solana project workspace from a validated idea. Use when a user says "scaffold my project", "set up my workspace", "what stack should I use", "create the project structure", or "initialize my project". Reads idea-context.json from a prior idea phase if available. Leverages solana-new's catalogs of 59 repos, 66 skills, and 49 MCPs.
---

# Scaffold Project

## Overview

Take a validated idea and turn it into a ready-to-code workspace with the right starter repo, skills, MCPs, and configuration installed. This is the bridge between planning and building.

## Workflow

1. Check for `.solana-new/idea-context.json`. If found, extract the chosen idea's requirements. If not, interview the user briefly: what are you building, for whom, and what Solana primitives do you need?
2. Read [references/stack-decision-tree.md](references/stack-decision-tree.md) to match the idea to a technology stack.
3. Read [references/catalog-recommendations.md](references/catalog-recommendations.md) to pick specific repos, skills, and MCPs from the solana-new catalogs.
4. Read [references/architecture-patterns.md](references/architecture-patterns.md) for the recommended project structure.
5. Present the scaffold plan to the user for confirmation.
6. Execute the setup:
   - Clone the recommended starter repo(s)
   - Install skills via `npx skills add <url>`
   - Configure MCPs in `.claude/settings.json`
   - Generate `CLAUDE.md` with project context
7. Write `.solana-new/build-context.json` with stack decisions.

## Non-Negotiables

- Always recommend a specific starter repo from the solana-new catalog. Do not suggest building from scratch unless no relevant repo exists.
- Always include at least one skill and one MCP relevant to the idea.
- Present the full plan before executing. The user must confirm.
- Do not install tools the user cannot run (check Node.js version, OS compatibility).
- Write the scaffold plan as a local HTML artifact before executing.
- If the idea-context suggests the idea hasn't been validated, recommend running validate-idea first (but don't block).

## Phase Handoff

This skill is **Phase 2 (Build)** in the Idea → Build → Launch journey.

**Reads**: `.solana-new/idea-context.json` (from Phase 1)
**Writes**: `.solana-new/build-context.json` with:
- `stack`: harness name, skills installed, MCPs configured, repos cloned
- `architecture`: chosen pattern name and key decisions
- `build_status`: { mvp_complete: false, tests_passing: false, devnet_deployed: false }

When done, tell the user to proceed to **build-with-claude** for guided MVP implementation.

When writing `build-context.json`, **deep-merge** with existing content — don't overwrite fields from prior phases.

See `../../data/specs/phase-handoff.md` for the full JSON contract.

## Resources

### references/

- [references/stack-decision-tree.md](references/stack-decision-tree.md)
- [references/architecture-patterns.md](references/architecture-patterns.md)
- [references/catalog-recommendations.md](references/catalog-recommendations.md)
