---
name: solana-security-audit
description: Deep Sealevel-specific security audit for Solana programs. Use when a user says "security audit", "audit my program", "check for vulnerabilities", "Solana security review", "signer check audit", "PDA security", or "is my program safe".
---

# Solana Security Audit

## Overview

Deep security audit targeting Sealevel-specific vulnerability classes. Goes beyond basic security checks to perform systematic, framework-aware auditing across Anchor and native Solana programs. Produces structured findings with exploit scenarios, confidence scoring, and concrete fixes.

## Workflow

1. Check for `.solana-new/build-context.json` to understand the stack and architecture.
2. Detect framework: scan for `Anchor.toml` (Anchor) or `solana-program` in `Cargo.toml` (native).
3. Identify all program entry points — instruction handlers, processor functions.
4. Run Phase 1: Account Validation audit using [references/account-validation-checklist.md](references/account-validation-checklist.md).
5. Run Phase 2: Arithmetic & State audit using [references/arithmetic-and-state.md](references/arithmetic-and-state.md).
6. Run Phase 3: CPI & Cross-Program audit using [references/cpi-security.md](references/cpi-security.md).
7. For each finding, document: severity, confidence (1-10), file path, line number, category, exploit scenario, and concrete fix.
8. Only report findings with confidence >= 7. Filter false positives — acknowledge Anchor's built-in checks where applicable.
9. Produce a local HTML artifact with the structured findings report.

## Dependency Gate (Required)

This skill depends on having code to audit.

1. If `.solana-new/build-context.json` is missing:
   - Tell the user to run `scaffold-project` then `build-with-claude` first.
   - Provide exact order: `solana-new copilot "your idea"` → `scaffold-project` → `build-with-claude` → `solana-security-audit`.
2. If there is no Solana program code (no `programs/` directory, no `Cargo.toml` with `solana-program` or `anchor-lang`):
   - Stop and tell the user this skill requires a Solana program to audit.
3. If build context exists but no program code, redirect to `build-with-claude` or the appropriate domain skill.

## Non-Negotiables

- Every finding must include a concrete exploit scenario — not just "this is dangerous", but "an attacker could do X to achieve Y".
- Confidence scoring 1-10. Only report findings with confidence >= 7 to avoid noise.
- Differentiate Anchor vs native program patterns — Anchor's `Account<T>` already validates ownership, don't flag it.
- Check all Sealevel equivalents of OWASP: missing signer checks, PDA seed collisions, CPI reentrancy, unchecked math, account validation failures, rent drain, reinitialization attacks, type cosplay.
- False positive filtering: exclude test code, acknowledge Anchor auto-checks, don't flag `unchecked_math` in test modules.
- Never claim "secure" or "no vulnerabilities found" without evidence of what was checked.
- Always write a local HTML artifact with the audit report.
- If the program handles tokens or SOL transfers, always check for arithmetic overflow and lamport accounting balance.

## Phase Handoff

This skill is **Phase 2 (Build)** in the Idea → Build → Launch journey.

**Reads**: `.solana-new/build-context.json`
**Updates**: `.solana-new/build-context.json` with:
- `security_audit.score`: letter grade A-F
- `security_audit.findings`: array of `{ severity, confidence, path, line, category, summary, fix, exploit_scenario }`
- `security_audit.framework_detected`: `"anchor"` | `"native"` | `"mixed"`
- `security_audit.instructions_audited`: number
- `security_audit.last_audit`: ISO timestamp

When updating `build-context.json`, **deep-merge** with existing content — don't overwrite fields from prior phases.

See `../../data/specs/phase-handoff.md` for the full JSON contract.

## Resources

### references/

- [references/account-validation-checklist.md](references/account-validation-checklist.md)
- [references/arithmetic-and-state.md](references/arithmetic-and-state.md)
- [references/cpi-security.md](references/cpi-security.md)
