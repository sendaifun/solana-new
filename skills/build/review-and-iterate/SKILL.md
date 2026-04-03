---
name: review-and-iterate
description: Review Solana project code for quality, security, and production readiness. Use when a user says "review my code", "is this production ready", "audit my program", "what should I fix", "code review", or "check for security issues".
---

## Preamble (run first)

```bash
_TEL_TIER=$(cat ~/.superstack/config.json 2>/dev/null | grep -o '"telemetryTier":"[^"]*"' | head -1 | cut -d'"' -f4 || echo "off")
_TEL_TIER="${_TEL_TIER:-off}"
_TEL_START=$(date +%s)
_SESSION_ID="$$-$(date +%s)"
mkdir -p ~/.superstack
if [ "$_TEL_TIER" != "off" ]; then
echo '{"skill":"review-and-iterate","phase":"build","event":"started","ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}' >> ~/.superstack/telemetry.jsonl 2>/dev/null || true
fi
```

> **Wrong skill?** See [SKILL_ROUTER.md](../../SKILL_ROUTER.md) for all available skills.

# Review and Iterate

## Overview

Perform a structured code review of a Solana project. Check for security vulnerabilities, code quality, compute optimization, and production readiness. Produce an actionable report with specific fixes.

## Workflow

1. Check for `.superstack/build-context.json` to understand the stack and architecture.
2. Scan the project structure and identify all Solana-related code.
3. Apply [references/code-review-rubric.md](references/code-review-rubric.md) for quality scoring.
4. Check against [references/security-basics.md](references/security-basics.md) for vulnerability patterns.
5. Evaluate optimization opportunities with [references/compute-optimization.md](references/compute-optimization.md).
6. Produce a review HTML artifact with findings, scores, and fix suggestions.

## Prior Context (Optional — never block on this)

If `.superstack/build-context.json` exists, use it for context. If not, **proceed immediately** — just review whatever code is in the current directory.

## Non-Negotiables

- **Never block on missing context files.** Review whatever code exists.
- Every finding must include a specific fix suggestion with code, not just a warning.
- Security issues are always flagged as critical — do not bury them in style nits.
- Do not generate false positives to look thorough. If the code is clean, say so.
- Score honestly. A "B" is fine — not everything needs to be "A".
- Check for the OWASP top 10 equivalent for Solana: missing signer checks, unchecked math, PDA confusion, rent drain, reinitialization attacks.

## Phase Handoff

This skill is **Phase 2 (Build)** in the Idea → Build → Launch journey.

**Updates**: `.superstack/build-context.json` with:
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

## Quick Start

```bash
# Run the full security checklist:
# See ../../data/runbooks/security-checklist.md for exact commands

# Quick checks:
grep -rn '\.unwrap()' programs/ --include="*.rs" | grep -v test  # Potential panics
grep -rn 'AccountInfo' programs/ --include="*.rs" | grep -v 'Signer\|Account<'  # Missing type safety
grep -rn 'checked_' programs/ --include="*.rs" | wc -l  # Should be > 0
```

## Decision Points

- **Security audit depth:** See `../../data/runbooks/security-checklist.md` — P0 (must fix), P1 (fix before mainnet), P2 (fix before TVL), P3 (best practice).
- **Formal verification needed?** Use QEDGen for programs handling >$1M TVL. See `../../data/decisions/testing-framework.json`.
- **Which test framework?** See `../../data/decisions/testing-framework.json` — Trident for fuzz testing before mainnet.

## Resources

### references/

- [references/code-review-rubric.md](references/code-review-rubric.md)
- [references/security-basics.md](references/security-basics.md)
- [references/compute-optimization.md](references/compute-optimization.md)

## Telemetry (run last)

After the skill workflow completes (success, error, or abort), log the telemetry event.
Determine the outcome from the workflow result: `success` if completed normally, `error`
if it failed, `abort` if the user interrupted.

Run this bash:

```bash
_TEL_END=$(date +%s)
_TEL_DUR=$(( _TEL_END - _TEL_START ))
if [ "$_TEL_TIER" != "off" ]; then
echo '{"skill":"review-and-iterate","phase":"build","event":"completed","outcome":"OUTCOME","duration_s":"'"$_TEL_DUR"'","session":"'"$_SESSION_ID"'","ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","platform":"'$(uname -s)-$(uname -m)'"}' >> ~/.superstack/telemetry.jsonl 2>/dev/null || true
fi
```

Replace `OUTCOME` with success/error/abort based on the workflow result.
