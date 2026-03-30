---
name: build-with-claude
description: Guide a developer through building their Solana MVP step by step using Claude Code. Use when a user says "help me build this", "start the MVP", "guide me through implementation", "what should I build first", or "walk me through the code". Reads build-context.json from a prior scaffold phase if available.
---

# Build with Claude

## Overview

Guide the user through implementing their Solana MVP feature by feature. Break the work into small, testable increments. Use installed skills and MCPs to accelerate development. Keep the user shipping, not stuck.

## Workflow

1. Check for `.solana-new/build-context.json`. If found, use the stack and architecture decisions. If not, ask what they've set up and what they want to build.
2. Read [references/skill-mcp-usage-guide.md](references/skill-mcp-usage-guide.md) to understand what tools are available BEFORE building.
3. Read [references/dev-environment-setup.md](references/dev-environment-setup.md) to ensure the dev environment is ready.
4. Read [references/solana-dev-patterns.md](references/solana-dev-patterns.md) for implementation patterns.
5. Break the MVP into 3-5 milestones, each shippable in 1-2 hours.
6. For each milestone:
   a. Explain what we're building and why
   b. Write the code (use installed skills for domain guidance)
   c. Test it (devnet first, always)
   d. Verify it works before moving on
7. When stuck, consult [references/error-recovery-guide.md](references/error-recovery-guide.md).
8. After MVP is complete, run through [references/testing-checklist.md](references/testing-checklist.md).

## Dependency Gate (Required)

This skill depends on scaffold output.

1. If `.solana-new/build-context.json` is missing:
   - Tell the user: "Run `scaffold-project` first (or `solana-new copilot start \"your idea\"` → `scaffold-project`)."
   - Explain that `build-with-claude` needs stack/repo/MCP decisions from scaffold.
2. If `build-context.json` exists but `stack` is missing, redirect to `scaffold-project`.
3. Only proceed without scaffold context if the user explicitly asks to continue anyway.
4. If proceeding, create/repair `.solana-new/build-context.json` with minimum required `stack` and `build_status` fields before coding.

## Non-Negotiables

- Never write more than 1 milestone of code before testing. Ship small, verify often.
- Always test on devnet before suggesting mainnet.
- If the user is stuck for more than 2 attempts at the same problem, step back and try a different approach.
- Use the installed skills and MCPs — they exist to help. Don't reinvent what a skill already provides.
- Keep explanations short. The user is here to build, not read essays.
- Update `.solana-new/build-context.json` as milestones are completed.
- Never silently continue when dependency context is missing. Redirect with exact next-skill order.

## Phase Handoff

This skill is **Phase 2 (Build)** in the Idea → Build → Launch journey.

**Reads**: `.solana-new/build-context.json` (from scaffold-project)
**Updates**: `.solana-new/build-context.json` with:
- `build_status.milestones`: array of completed milestones
- `build_status.mvp_complete`: boolean
- `build_status.tests_passing`: boolean
- `build_status.devnet_deployed`: boolean
- `build_status.program_id`: string (if applicable)

When MVP is complete and tests pass, tell the user to proceed to **review-and-iterate** for security audit and production readiness check.

When updating `build-context.json`, **deep-merge** with existing content — don't overwrite fields from prior phases.

See `../../data/specs/phase-handoff.md` for the full JSON contract.

## Resources

### references/

- [references/dev-environment-setup.md](references/dev-environment-setup.md)
- [references/skill-mcp-usage-guide.md](references/skill-mcp-usage-guide.md)
- [references/solana-dev-patterns.md](references/solana-dev-patterns.md)
- [references/error-recovery-guide.md](references/error-recovery-guide.md)
- [references/testing-checklist.md](references/testing-checklist.md)
