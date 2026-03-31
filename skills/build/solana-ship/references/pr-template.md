# PR Template Reference

Structured PR body template for Solana projects. Fields marked with `{placeholder}` are auto-filled by the `solana-ship` skill based on test results, security audit, QA, and build context.

---

## Template

```markdown
## Summary
<!-- 1-3 bullet points: what this PR does and why -->

## Changes
<!-- List of key changes grouped by area (program, frontend, tests, config) -->

### Program
<!-- Changes to on-chain program code -->

### Frontend
<!-- Changes to the frontend/dApp -->

### Tests
<!-- New or modified tests -->

### Config / Infra
<!-- Changes to configuration, CI, deployment scripts -->

## Test Results
<!-- Auto-filled by solana-ship -->
- Test suites run: {count}
- Tests passed: {passed}/{total}
- Tests failed: {failed}
- Test frameworks: {frameworks}
- Skipped tests: {skipped_count} ({skipped_justification})

## Security Audit
<!-- Auto-filled if solana-security-audit was run -->
- Audit score: {grade}
- Critical findings: {critical_count} (0 unresolved required)
- High findings: {high_count}
- Medium findings: {medium_count}
- Low findings: {low_count}
- Last audit: {audit_timestamp}
- Audit status: {pass/fail/not_run}

## QA Results
<!-- Auto-filled if solana-qa was run -->
- Pass rate: {rate}%
- Wallet connect: {pass/fail/not_tested}
- Transaction signing: {pass/fail/not_tested}
- Devnet verified: {yes/no}
- Last QA run: {qa_timestamp}
- QA status: {pass/fail/not_run}

## Deployment Status
<!-- For program changes -->
- Devnet deployed: {yes/no}
- Program ID: `{program_id}`
- Upgrade authority: `{authority_pubkey}`
- Last deploy: {deploy_timestamp}
- IDL updated: {yes/no/not_applicable}

## Checklist
- [ ] Tests pass locally
- [ ] Security audit clean (no unresolved CRITICAL)
- [ ] QA verified on devnet (if applicable)
- [ ] No secrets in diff
- [ ] Commit history is clean
- [ ] Program ID is consistent across all config files
- [ ] IDL is up to date (if Anchor program)
- [ ] Upgrade authority is documented
```

---

## Usage Notes

### Filling the Template

The `solana-ship` skill auto-fills placeholders based on:

1. **Test Results**: Parsed from test runner stdout/stderr. Supports:
   - `anchor test` output (Mocha-style: "N passing, M failing")
   - `cargo test-sbf` output ("test result: ok. N passed; M failed")
   - `jest` / `vitest` output ("Tests: N passed, M failed, O total")
   - `npm test` (delegates to the underlying runner)

2. **Security Audit**: Read from `.solana-new/build-context.json` → `security_audit` field.

3. **QA Results**: Read from `.solana-new/build-context.json` → `qa` field.

4. **Deployment Status**: Read from `.solana-new/build-context.json` → `build_status` field and on-chain verification.

### Sections to Remove

- Remove **Security Audit** section if no Solana program exists in the project.
- Remove **QA Results** section if no frontend exists.
- Remove **Deployment Status** section if no program changes are in the PR.
- Never remove **Test Results** or **Checklist**.

### Draft PRs

When creating as draft:
- Add `[DRAFT]` prefix to PR title.
- Add a note at the top of the body: "This PR is a draft. Do not merge until all checks pass."
- Uncheck all checklist items.

### Linking Context

If build context has an idea ID or project name, include it:
```markdown
**Project**: {project_name}
**Idea**: {idea_id}
**Sprint**: {sprint_number}
```

### Example Filled Template

```markdown
## Summary
- Add token swap instruction to the exchange program
- Support SOL/USDC swaps with configurable slippage tolerance
- Include price oracle integration via Pyth

## Changes

### Program
- `programs/exchange/src/instructions/swap.rs` — new swap instruction
- `programs/exchange/src/state/pool.rs` — pool account state
- `programs/exchange/src/errors.rs` — new error codes for slippage/oracle

### Frontend
- `app/components/SwapForm.tsx` — swap UI component
- `app/hooks/useSwap.ts` — swap transaction hook

### Tests
- `tests/swap.test.ts` — 12 test cases covering happy path, slippage, oracle failure
- `tests/fixtures/pool.ts` — test fixtures for pool setup

### Config / Infra
- `Anchor.toml` — added Pyth program ID to test validator config

## Test Results
- Test suites run: 3
- Tests passed: 47/47
- Tests failed: 0
- Test frameworks: anchor test, jest
- Skipped tests: 0

## Security Audit
- Audit score: B+
- Critical findings: 0 (0 unresolved required)
- High findings: 1 (reviewed and accepted — oracle staleness window)
- Medium findings: 2
- Low findings: 3
- Last audit: 2026-03-30T14:22:00Z
- Audit status: pass

## QA Results
- Pass rate: 95%
- Wallet connect: pass
- Transaction signing: pass
- Devnet verified: yes
- Last QA run: 2026-03-30T16:00:00Z
- QA status: pass

## Deployment Status
- Devnet deployed: yes
- Program ID: `ExCh4Ng3PRogRAm1111111111111111111111111111`
- Upgrade authority: `DevK3y111111111111111111111111111111111111`
- Last deploy: 2026-03-30T12:00:00Z
- IDL updated: yes

## Checklist
- [x] Tests pass locally
- [x] Security audit clean (no unresolved CRITICAL)
- [x] QA verified on devnet
- [x] No secrets in diff
- [x] Commit history is clean
- [x] Program ID is consistent across all config files
- [x] IDL is up to date
- [x] Upgrade authority is documented
```
