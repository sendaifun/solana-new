# Code Review Rubric

Scoring dimensions for Solana project quality. Weighted by importance.

## Dimensions (A-F scale, weighted)

### 1. Security (weight: 3x) — most critical
Any critical security finding drops the overall grade to C or below.

| Grade | Criteria |
|-------|----------|
| A | All P0+P1 checks from security-basics.md pass. Fuzz tested. |
| B | All P0 checks pass, P1 mostly covered. No exploitable issues. |
| C | Missing 1-2 P0 checks but no actively exploitable vulnerability. |
| F | Missing signer checks, unchecked math, or exploitable PDA confusion. |

**Tools:** `security` (official), `vulnhunter-skill`, `solana-fender-mcp`

### 2. Correctness (weight: 2x)
| Grade | Criteria |
|-------|----------|
| A | All paths tested. Edge cases handled. Token decimals correct. Transactions confirmed. |
| B | Happy paths work. Most edge cases covered. Minor decimal display issues. |
| C | Core logic works but edge cases cause unexpected behavior. |
| F | Fundamental logic errors. Transactions fail silently. |

### 3. Error Handling (weight: 2x)
| Grade | Criteria |
|-------|----------|
| A | Custom error types. User-friendly messages. No swallowed errors. Retry logic. |
| B | Meaningful errors for common cases. Some generic catch blocks. |
| C | Mix of good and empty catch blocks. Some errors reach the user as raw codes. |
| F | Panics, unwrap() on fallible operations, silent failures. |

### 4. Testing (weight: 1.5x)
| Grade | Criteria |
|-------|----------|
| A | Unit tests (LiteSVM), integration tests (Surfpool), security scan clean. |
| B | Core instruction tests pass. At least one E2E test. |
| C | Some tests exist but don't cover critical paths. |
| F | No tests, or tests that always pass regardless of code changes. |

**Tools:** `testing` (official), `surfpool` (official), `trident` repo

### 5. Code Organization (weight: 1x)
| Grade | Criteria |
|-------|----------|
| A | Clear module separation. Single-responsibility functions. No dead code. |
| B | Mostly organized. Some large functions that could be split. |
| C | Inconsistent structure. Dead code present. Mixed concerns. |

### 6. Documentation (weight: 0.5x)
| Grade | Criteria |
|-------|----------|
| A | README with setup/usage. .env.example. Complex logic commented. Program IDL documented. |
| B | README exists. Most env vars documented. Key functions commented. |
| C | Minimal docs. Setup requires reading the code. |

## Overall Grade Calculation

Weighted average: `(Security×3 + Correctness×2 + ErrorHandling×2 + Testing×1.5 + CodeOrg×1 + Docs×0.5) / 10`

Map to letter: A (90+), B (75-89), C (60-74), D (40-59), F (<40)

**Override rule:** Any critical security finding = max grade C regardless of other scores.

## Review Output

For each finding, include:
1. **Severity**: Critical / High / Medium / Low
2. **Category**: Which dimension (Security, Correctness, etc.)
3. **Description**: What's wrong and why it matters
4. **Fix**: Specific code change (not just a warning)

Write the review as a local HTML artifact.
