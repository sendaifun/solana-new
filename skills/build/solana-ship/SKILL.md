---
name: solana-ship
description: Full release engineering workflow for Solana projects. Use when a user says "ship it", "release my project", "create a PR", "prepare for release", "run tests and ship", "full ship workflow", or "ready to merge".
---

# Solana Ship

## Overview

End-to-end release engineering workflow: run tests, security check, QA verification, git flow, and PR creation with structured body. Adapted for Solana-specific projects with program deployment awareness and security gating.

## Workflow

1. **Pre-flight checks**:
   - Verify not on main/master branch. If so, create a feature branch.
   - Check for uncommitted changes. If found, ask user to commit or stash.
   - Read `.solana-new/build-context.json` for project context.
2. **Run tests**:
   - Detect test framework: `anchor test`, `cargo test-sbf`, `npm test`, `jest`, `vitest`.
   - Run all detected test suites. Record pass/fail counts.
   - If tests fail, stop and report failures. Do not proceed.
3. **Security gate** (if Solana program exists):
   - Check if `solana-security-audit` has been run (look for `security_audit` in build context).
   - If no prior audit, run the security audit skill.
   - Block on any unresolved CRITICAL findings.
4. **QA gate** (if frontend dApp exists):
   - Check if `solana-qa` has been run (look for `qa` in build context).
   - If no prior QA and frontend exists, recommend running `solana-qa` first.
5. **Scope validation**:
   - Run `git diff main...HEAD --stat` to review what will be in the PR.
   - Verify changes match the intended scope (ask user to confirm).
   - Flag any unexpected files (e.g., `.env`, `target/`, `node_modules/`).
6. **Git flow**:
   - Commit any remaining staged changes.
   - Push branch to remote with `-u` flag.
7. **PR creation**:
   - Create PR using [references/pr-template.md](references/pr-template.md) format.
   - Include test results, security audit summary, and QA results in PR body.
   - Create as draft if user prefers.
8. Update build context with ship status.

## Dependency Gate (Required)

This skill requires code to ship.

1. If `.solana-new/build-context.json` is missing:
   - Tell the user to build something first.
   - Provide exact order: `scaffold-project` → `build-with-claude` → `solana-ship`.
2. Must not be on main/master branch — redirect to create a feature branch.
3. Must have at least one commit to ship.

## Non-Negotiables

- Never skip tests. If tests fail, stop. No exceptions.
- Security audit must pass (no unresolved CRITICAL findings) before creating PR for programs.
- Include test results and security summary in PR body — reviewers need this context.
- Scope validation: verify PR changes match intended scope. Flag drift.
- Never force push. Never push to main/master directly.
- If program changes exist, note devnet deployment status in PR body.
- Always ask for explicit user confirmation before creating the PR.
- Always use [references/ship-checklist.md](references/ship-checklist.md) to verify readiness.

## Phase Handoff

This skill is **Phase 2 (Build)** in the Idea → Build → Launch journey.

**Reads**: `.solana-new/build-context.json`
**Updates**: `.solana-new/build-context.json` with:
- `ship.last_ship`: ISO timestamp
- `ship.pr_url`: string
- `ship.pr_number`: number
- `ship.tests_passing`: boolean
- `ship.security_clear`: boolean
- `ship.scope_files`: array of changed file paths

When updating `build-context.json`, **deep-merge** with existing content — don't overwrite fields from prior phases.

See `../../data/specs/phase-handoff.md` for the full JSON contract.

## Resources

### references/

- [references/ship-checklist.md](references/ship-checklist.md)
- [references/pr-template.md](references/pr-template.md)
