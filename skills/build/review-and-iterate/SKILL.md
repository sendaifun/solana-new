---
name: review-and-iterate
description: Review Solana project code for quality, security, and production readiness. Use when a user says "review my code", "is this production ready", "audit my program", "what should I fix", "code review", or "check for security issues".
---

# Review and Iterate

## Overview

Perform a structured code review of a Solana project. Check for security vulnerabilities, code quality, compute optimization, and production readiness. Produce an actionable report with specific fixes.

## Workflow

1. Check for `.solana-new/build-context.json` to understand the stack and architecture.
2. Scan the project structure and identify all Solana-related code.
3. Apply [references/code-review-rubric.md](references/code-review-rubric.md) for quality scoring.
4. Check against [references/security-basics.md](references/security-basics.md) for vulnerability patterns.
5. Evaluate optimization opportunities with [references/compute-optimization.md](references/compute-optimization.md).
6. Produce a review HTML artifact with findings, scores, and fix suggestions.

## Dependency Gate (Required)

This skill depends on build context from scaffold/build.

1. If `.solana-new/build-context.json` is missing:
   - Tell the user to run `scaffold-project` then `build-with-claude` first.
   - Provide exact order: `solana-new copilot start "your idea"` → `scaffold-project` → `build-with-claude` → `review-and-iterate`.
2. If build context exists but `build_status` is missing, repair it before review.
3. If there is no code to review yet, explicitly stop and redirect to `build-with-claude`.

## Non-Negotiables

- Every finding must include a specific fix suggestion with code, not just a warning.
- Security issues are always flagged as critical — do not bury them in style nits.
- Do not generate false positives to look thorough. If the code is clean, say so.
- Score honestly. A "B" is fine — not everything needs to be "A".
- Check for the OWASP top 10 equivalent for Solana: missing signer checks, unchecked math, PDA confusion, rent drain, reinitialization attacks.
- Always write a local HTML artifact with the review report.
- Never report "ready for launch" without verifying dependency context and existing implementation scope.

## Phase Handoff

This skill is **Phase 2 (Build)** in the Idea → Build → Launch journey.

**Updates**: `.solana-new/build-context.json` with:
- `review.security_score`: letter grade A-F
- `review.quality_score`: letter grade A-F
- `review.findings`: array of { severity, category, description, fix }
- `review.ready_for_mainnet`: boolean

When the review is clean, tell the user they can proceed to **Phase 3 (Launch)**:
- `deploy-to-mainnet` — production deployment checklist
- `create-pitch-deck` — structured pitch deck
- `submit-to-hackathon` — hackathon submission builder

When updating `build-context.json`, **deep-merge** with existing content — don't overwrite fields from prior phases.

See `../../data/specs/phase-handoff.md` for the full JSON contract.

## Resources

### references/

- [references/code-review-rubric.md](references/code-review-rubric.md)
- [references/security-basics.md](references/security-basics.md)
- [references/compute-optimization.md](references/compute-optimization.md)
