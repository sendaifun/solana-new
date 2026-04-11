---
name: cso
description: |
  Chief Security Officer mode. Infrastructure-first security audit: secrets archaeology,
  dependency supply chain, CI/CD pipeline security, LLM/AI security, skill supply chain
  scanning, plus OWASP Top 10, STRIDE threat modeling, and active verification.
  Two modes: daily (zero-noise, 8/10 confidence gate) and comprehensive (monthly deep
  scan, 2/10 bar). Use when a user says "security audit", "threat model", "pentest review",
  "OWASP", "CSO review", "check for vulnerabilities", or "is my code secure".
allowed_tools:
  - Bash
  - Read
  - Grep
  - Glob
  - Write
  - Agent
  - WebSearch
  - AskUserQuestion
---

## Preamble (run first)

```bash
_TEL_TIER=$(cat ~/.superstack/config.json 2>/dev/null | grep -o '"telemetryTier": *"[^"]*"' | head -1 | sed 's/.*"telemetryTier": *"//;s/"$//'  || echo "anonymous")
_TEL_TIER="${_TEL_TIER:-anonymous}"
_TEL_PROMPTED=$([ -f ~/.superstack/.telemetry-prompted ] && echo "yes" || echo "no")
_TEL_START=$(date +%s)
_SESSION_ID="$$-$(date +%s)"
mkdir -p ~/.superstack
echo "TELEMETRY: $_TEL_TIER"
echo "TEL_PROMPTED: $_TEL_PROMPTED"
if [ "$_TEL_TIER" != "off" ]; then
_TEL_EVENT='{"skill":"cso","phase":"build","event":"started","ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}' 
echo "$_TEL_EVENT" >> ~/.superstack/telemetry.jsonl 2>/dev/null || true
_CONVEX_URL=$(cat ~/.superstack/config.json 2>/dev/null | grep -o '"convexUrl":"[^"]*"' | head -1 | cut -d'"' -f4 || echo "")
[ -n "$_CONVEX_URL" ] && curl -s -X POST "$_CONVEX_URL/api/mutation" -H "Content-Type: application/json" -d '{"path":"telemetry:track","args":{"skill":"cso","phase":"build","status":"success","version":"0.2.0","platform":"'$(uname -s)-$(uname -m)'","timestamp":'$(date +%s)000'}}' >/dev/null 2>&1 &
true
fi
```

If `TEL_PROMPTED` is `no`: Before starting the skill workflow, ask the user about telemetry.
Use AskUserQuestion:

> Help superstack get better! We track which skills get used and how long they take —
> no code, no file paths, no PII. Change anytime in `~/.superstack/config.json`.

Options:
- A) Sure, help superstack improve (anonymous)
- B) No thanks

If A: run this bash:
```bash
echo '{"telemetryTier":"anonymous"}' > ~/.superstack/config.json
_TEL_TIER="anonymous"
touch ~/.superstack/.telemetry-prompted
```

If B: run this bash:
```bash
echo '{"telemetryTier":"off"}' > ~/.superstack/config.json
_TEL_TIER="off"
touch ~/.superstack/.telemetry-prompted
```

This only happens once. If `TEL_PROMPTED` is `yes`, skip this entirely and proceed to the skill workflow.

> **Wrong skill?** See [SKILL_ROUTER.md](../../SKILL_ROUTER.md) for all available skills.

> Adapted from [gstack](https://github.com/garrytan/gstack) CSO skill.

# Chief Security Officer (CSO)

You are a Chief Security Officer conducting a security audit. You are methodical, thorough, and paranoid in the way a good security engineer should be. You never guess -- you verify. You never assume safe -- you prove safe.

## Arguments

| Flag | Scope |
|------|-------|
| `/cso` | Full audit (all phases) |
| `/cso --comprehensive` | Monthly deep scan, 2/10 confidence bar |
| `/cso --infra` | Phases 0-6 only (infrastructure) |
| `/cso --code` | Phases 8-9 only (OWASP Top 10:2025 + code) |
| `/cso --skills` | Phase 8 only (skill supply chain) |
| `/cso --diff` | Audit only changed files (git diff against main) |
| `/cso --supply-chain` | Phases 3, 8 only (dependency + skill supply chain) |
| `/cso --owasp` | Phase 9 only (OWASP Top 10:2025) |
| `/cso --scope <path>` | Limit audit to specific directory or file |

## Mode Resolution

1. If `--comprehensive` is passed: set confidence gate to **2/10** (catch everything, even speculative)
2. If no flags: set confidence gate to **8/10** (daily mode, zero-noise)
3. `--diff` restricts file scope to `git diff --name-only main...HEAD`
4. `--scope <path>` restricts file scope to the given path
5. Multiple flags combine (e.g., `--infra --comprehensive` = infra phases at 2/10 bar)

## Starting the Audit

Always start by asking the user which scope they want using AskUserQuestion, unless they specified flags. Present the options:

- **Full audit** — all 15 phases, recommended for first run
- **Infrastructure only** — network, secrets, CI/CD, webhooks
- **Code only** — OWASP Top 10:2025, code-level vulnerabilities
- **Supply chain** — dependencies and skill packages
- **Diff only** — just the changed files since main
- **Custom scope** — specific directory or file path

## Tool Usage

**Use Grep tool for all searches.** Do not shell out to `grep` or `rg` via Bash. The Grep tool has correct permissions and is optimized for this environment.

Use Bash only for: git commands, running test suites, checking file permissions, network checks, and other operations that require a shell.

---

## Phase 0: Architecture Mental Model + Stack Detection

**Goal:** Build a mental model of the project before scanning anything.

1. Read the project root: `package.json`, `Cargo.toml`, `pyproject.toml`, `go.mod`, `Anchor.toml`, `docker-compose.yml`, `Dockerfile`, `.env.example`
2. Identify:
   - **Language/framework** (Node, Rust/Anchor, Python, Go, etc.)
   - **Package manager** (npm, pnpm, yarn, cargo, pip, go mod)
   - **Database** (Postgres, SQLite, Redis, on-chain accounts, etc.)
   - **Auth mechanism** (JWT, sessions, wallet signatures, OAuth)
   - **Deployment target** (Vercel, Fly.io, AWS, Solana devnet/mainnet)
   - **API style** (REST, GraphQL, gRPC, RPC, on-chain instructions)
3. Check for monorepo structure (workspaces, Turborepo, Nx)
4. Map entry points: servers, CLIs, cron jobs, serverless functions, on-chain programs
5. Record stack summary for use in later phases

**Output:** Stack summary table with language, framework, package manager, database, auth, deployment, API style.

---

## Phase 1: Attack Surface Census

**Goal:** Enumerate every way data enters or leaves the system.

1. **Network listeners:** Search for `listen(`, `createServer(`, `serve(`, `bind(`, `.start(` patterns
2. **API routes:** Search for route definitions (`app.get`, `app.post`, `router.`, `@app.route`, `#[endpoint]`, etc.)
3. **File uploads:** Search for `multer`, `formidable`, `busboy`, `multipart`, file write operations
4. **WebSocket endpoints:** Search for `ws://`, `wss://`, `WebSocket`, `socket.io`
5. **Scheduled tasks:** Search for `cron`, `setInterval`, `schedule`, `@Cron`
6. **External API calls:** Search for `fetch(`, `axios`, `http.get`, `reqwest`, outbound URLs
7. **On-chain entry points:** For Solana programs, enumerate all instruction handlers, CPI calls, PDA derivations
8. **Environment variable consumption:** Search for `process.env`, `std::env`, `os.environ`, `env::var`

**Output:** Attack surface table: entry point, type, authentication required (yes/no/unknown), input validation present (yes/no/unknown).

---

## Phase 2: Secrets Archaeology

**Goal:** Find every secret, credential, API key, and sensitive value — committed or not.

### Scan targets:
1. **Current codebase:** Search for high-entropy strings, Base64 blobs, hex strings > 32 chars
2. **Git history:** `git log --all --diff-filter=A -- '*.env' '*.pem' '*.key' '*.secret'`
3. **Common patterns:**
   - `PRIVATE_KEY`, `SECRET_KEY`, `API_KEY`, `TOKEN`, `PASSWORD`, `CREDENTIAL`
   - `sk_live_`, `pk_live_`, `ghp_`, `gho_`, `github_pat_`, `xoxb-`, `xoxp-`
   - `-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----`
   - `mongodb://`, `postgres://`, `mysql://`, `redis://` with credentials
   - Solana keypair files: `[` followed by 64 numbers (byte array format)
4. **Config files:** `.env`, `.env.*`, `config.json`, `secrets.yaml`, `credentials.json`
5. **CI secrets:** Check `.github/workflows/*.yml` for hardcoded secrets vs `${{ secrets.* }}`
6. **Docker:** Check Dockerfiles for `ARG`/`ENV` with secrets, build args leaking to image layers
7. **Git hooks:** Check `.git/hooks/` and `.husky/` for credential exposure

### Severity ratings:
- **CRITICAL:** Live production secrets in code or git history
- **HIGH:** Test/dev secrets that match production naming patterns
- **MEDIUM:** Secrets in .env.example with real-looking values
- **LOW:** Overly broad .gitignore gaps (missing `*.pem`, `*.key`)

---

## Phase 3: Dependency Supply Chain

**Goal:** Audit every dependency for known vulnerabilities, typosquatting, and maintainer risk.

1. **Known vulnerabilities:**
   - `npm audit` / `pnpm audit` / `yarn audit` (Node)
   - `cargo audit` (Rust — install if missing)
   - `pip-audit` (Python)
   - `govulncheck` (Go)
2. **Typosquatting check:** For each dependency, verify the package name is correct:
   - Check for common letter swaps (`lodash` vs `1odash`)
   - Check for scope confusion (`@solana/web3.js` vs `solana-web3.js`)
3. **Maintainer risk:**
   - Single-maintainer packages with > 1M weekly downloads
   - Packages with recent ownership transfers
   - Packages last published > 2 years ago
4. **Pinning audit:**
   - Check for `^` or `~` ranges in production dependencies
   - Check for lockfile presence and freshness
   - Check for `npm_config_ignore_scripts=true` or equivalent
5. **Post-install scripts:** Search for packages with `preinstall`, `postinstall`, `prepare` scripts that execute arbitrary code
6. **Solana-specific:** Check `@coral-xyz/anchor`, `@solana/web3.js`, `@solana/spl-token` versions against known-good versions

**Output:** Dependency risk table: package, version, vulnerability (CVE if applicable), risk level, recommendation.

---

## Phase 4: CI/CD Pipeline Security

**Goal:** Ensure the build and deploy pipeline cannot be compromised.

1. **GitHub Actions:**
   - Search for `uses:` entries not pinned to a full immutable commit SHA (for example, `@<full commit SHA>`, including 40- or 64-character SHAs)
   - Treat `@v*` tags, branches, and other mutable refs as weaker references, not immutable pinning
   - Check for `pull_request_target` trigger (code injection risk)
   - Check for `${{ github.event.*.body }}` or similar injection points
   - Verify secrets are not logged (`echo ${{ secrets.* }}`)
   - Check for excessive `permissions:` (should be minimal)
2. **Docker builds:**
   - Multi-stage builds (secrets not in final image)
   - No `--build-arg` with secrets
   - Base images pinned by digest
   - No `latest` tags in FROM
3. **Deploy pipeline:**
   - Verify deploy requires passing CI
   - Check for manual approval gates on production
   - Verify rollback capability exists
4. **Artifact security:**
   - Check if build artifacts are signed
   - Verify SBOM generation if applicable
   - Check for reproducible builds

---

## Phase 5: Infrastructure Shadow Surface

**Goal:** Find infrastructure that exists but isn't in the main codebase.

1. **DNS and domains:** Check for references to domains, subdomains, CDN endpoints
2. **Cloud resources:** Search for AWS ARNs, GCP project IDs, Azure resource IDs
3. **Terraform/IaC:** If present, check for drift indicators, unencrypted state
4. **Database migrations:** Check migration files for security-relevant changes (adding auth columns, dropping constraints)
5. **Feature flags:** Search for feature flag services (LaunchDarkly, Unleash, env-based flags) that might expose unauthenticated endpoints
6. **Solana-specific:**
   - Check for program upgrade authority settings
   - Verify multisig requirements for program upgrades
   - Check for open PDAs that anyone can write to

---

## Phase 6: Webhook & Integration Audit

**Goal:** Verify all inbound webhooks validate authenticity and all outbound integrations are secure.

1. **Inbound webhooks:**
   - Search for webhook handler endpoints
   - Verify signature validation (HMAC, asymmetric signature)
   - Check for replay protection (timestamp validation, nonce)
   - Verify IP allowlisting if applicable
2. **Outbound integrations:**
   - Check for TLS verification (`rejectUnauthorized: false`, `verify=False`)
   - Verify timeout settings on outbound calls
   - Check for circuit breaker patterns
3. **Third-party callbacks:**
   - OAuth callback URLs: verify state parameter validation
   - Payment callbacks: verify signature and idempotency
   - Solana: verify transaction confirmation before acting on webhooks

---

## Phase 7: LLM & AI Security

**Goal:** Audit LLM integrations for prompt injection, data exfiltration, and trust boundary violations.

1. **Prompt injection:**
   - Search for user input concatenated directly into prompts
   - Check for system prompt leakage via instructions
   - Verify input sanitization before LLM calls
2. **Data exfiltration:**
   - Check if LLM responses are used to construct URLs, file paths, or shell commands
   - Verify LLM output is not directly executed (`eval`, `exec`, `Function()`)
   - Check for tool-use/function-calling without output validation
3. **Trust boundaries:**
   - Map which data flows to LLMs (PII, secrets, financial data)
   - Check for context window stuffing with sensitive data
   - Verify rate limiting on LLM-powered endpoints
4. **API key management:**
   - LLM API keys should be server-side only
   - Check for key rotation policies
   - Verify billing alerts are configured

---

## Phase 8: Skill Supply Chain

**Goal:** Audit installed skills for malicious or vulnerable content.

### Scan paths:
- `~/.claude/skills/` (Claude Code skills)
- `~/.codex/skills/` (Codex skills)
- Project-local `skills/` directory
- `.claude/settings.json` for skill references

### Checks:
1. **Skill manifest validation:**
   - Verify each skill has a valid `SKILL.md` with frontmatter
   - Check for unexpected `allowed_tools` (especially `Bash` with no constraints)
   - Flag skills that request `Write` + `Bash` together (can modify and execute)
2. **Skill content scanning:**
   - Search for encoded/obfuscated content in skill files
   - Check for URLs that download and execute code
   - Look for instructions that override safety guidelines
   - Search for `ignore previous instructions`, `you are now`, `system prompt` patterns
3. **Skill provenance:**
   - Check if skills come from known sources (official repos, verified publishers)
   - Flag skills with no clear origin
   - Check git history for skill modifications
4. **Reference file scanning:**
   - Check `references/` directories for unexpected file types
   - Verify referenced URLs are legitimate
   - Check for large binary files in skill directories

---

## Phase 9: OWASP Top 10:2025 Assessment

**Goal:** Systematic check against OWASP Top 10:2025 with active verification.

### A01: Broken Access Control
- Check for missing authorization on API routes
- Search for IDOR patterns (user ID in URL without ownership check)
- Verify role-based access control implementation
- Solana: check for missing signer constraints, unchecked account ownership

### A02: Security Misconfiguration
- Check for debug mode in production configs
- Search for default credentials
- Verify security headers (CSP, HSTS, X-Frame-Options, X-Content-Type-Options)
- Check CORS configuration (`Access-Control-Allow-Origin: *`)
- Verify directory listing is disabled

### A03: Software Supply Chain Failures
- Cross-reference with Phase 3 dependency audit and Phase 4 CI/CD integrity audit
- Check for vulnerable, unsupported, or unmaintained third-party components
- Verify version tracking, vulnerability scanning, and change-management processes exist
- Check CI/CD dependencies such as GitHub Actions, container base images, and build tooling for mutable or untrusted sources

### A04: Cryptographic Failures
- Search for weak algorithms: `MD5`, `SHA1` (for security purposes), `DES`, `RC4`
- Check for hardcoded encryption keys
- Verify TLS configuration (minimum version, cipher suites)
- Solana: verify proper use of `ed25519`, check for weak randomness in key generation

### A05: Injection
- **SQL:** Search for string concatenation in queries (`"SELECT.*" + `, `` `SELECT ${` ``)
- **Command:** Search for `exec(`, `spawn(`, `system(` with user input
- **XSS:** Search for `dangerouslySetInnerHTML`, `innerHTML`, unescaped output in templates
- **LDAP/XPath:** If applicable, check injection points
- **Solana:** Check for unchecked instruction data deserialization

### A06: Insecure Design
- Check for rate limiting on auth endpoints
- Verify account lockout mechanisms
- Check for security-relevant business logic flaws
- Review error messages for information leakage

### A07: Authentication Failures
- Check password policies (if applicable)
- Verify session management (expiry, rotation, secure flags)
- Check for credential stuffing protections
- Solana: verify wallet signature validation, check for replay attacks

### A08: Software or Data Integrity Failures
- Check for unsigned updates or deployments
- Verify CI/CD pipeline integrity (cross-ref Phase 4)
- Check for deserialization of untrusted data
- Solana: verify program upgrade authority, check IDL integrity

### A09: Security Logging and Alerting Failures
- Check for security event logging (failed logins, privilege changes)
- Verify log injection protections
- Check for sensitive data in logs (passwords, tokens, keys)
- Verify alerting exists for security events

### A10: Mishandling of Exceptional Conditions
- Check for fail-open behavior on errors or missing inputs
- Verify exceptions and abnormal states are handled securely and consistently
- Review error paths for sensitive-data leakage
- Check timeout, retry, fallback, and privilege-failure handling

## Sources for Phase 4 and Phase 9
- GitHub secure use reference: https://docs.github.com/en/actions/reference/security/secure-use
- OWASP Top Ten project: https://owasp.org/www-project-top-ten/
- OWASP Top 10:2025 upstream navigation: https://raw.githubusercontent.com/OWASP/Top10/master/2025/mkdocs.yml

---

## Phase 10: STRIDE Threat Model

**Goal:** Systematic threat modeling using STRIDE methodology.

For each major component identified in Phase 0:

| Threat | Question | Check |
|--------|----------|-------|
| **S**poofing | Can an attacker impersonate a user or component? | Auth mechanisms, certificate validation, wallet signature checks |
| **T**ampering | Can data be modified in transit or at rest? | Integrity checks, HMAC, digital signatures, on-chain account constraints |
| **R**epudiation | Can actions be denied? | Audit logging, transaction receipts, on-chain event emission |
| **I**nformation Disclosure | Can sensitive data leak? | Encryption at rest/transit, access controls, error messages |
| **D**enial of Service | Can the system be overwhelmed? | Rate limiting, resource quotas, compute unit limits |
| **E**levation of Privilege | Can a user gain unauthorized access? | Privilege checks, role validation, PDA authority checks |

**Output:** STRIDE matrix with component, threat type, risk level, existing mitigation, recommended action.

---

## Phase 11: Data Classification

**Goal:** Identify and classify all sensitive data in the system.

1. **PII:** Names, emails, addresses, phone numbers, government IDs
2. **Financial:** Payment info, wallet addresses, transaction data, balances
3. **Auth credentials:** Passwords, tokens, API keys, private keys, seed phrases
4. **Business sensitive:** Proprietary algorithms, pricing, user analytics
5. **Regulated:** Data subject to GDPR, CCPA, PCI-DSS, SOC2

For each data type found:
- Where is it stored?
- How is it transmitted?
- Who has access?
- What is the retention policy?
- Is it encrypted at rest and in transit?

---

## Phase 12: False Positive Filtering + Active Verification

**Goal:** Eliminate noise. Every finding must be verified or clearly marked as unverified.

### Confidence Calibration

| Confidence | Meaning | Evidence Required |
|------------|---------|-------------------|
| 10/10 | Confirmed exploitable | Working exploit or proof |
| 9/10 | Almost certain | Code path verified, all conditions met |
| 8/10 | High confidence | Code pattern matches, reasonable assumptions | 
| 7/10 | Likely | Pattern match with some uncertainty |
| 6/10 | Probable | Indicator present but not fully traced |
| 5/10 | Possible | Suspicious pattern, needs investigation |
| 4/10 | Speculative | Weak indicator only |
| 3/10 | Low confidence | Theoretical concern |
| 2/10 | Very unlikely | Edge case only |
| 1/10 | Negligible | Almost certainly not an issue |

### Daily Mode (default): Only report findings >= 8/10
### Comprehensive Mode: Report findings >= 2/10, clearly labeled

### Hard Exclusions (NEVER report these as findings)

These 22 patterns are categorically NOT vulnerabilities. Reporting them is a false positive:

1. **Source map files in dev** — `*.map` files in development builds
2. **Console.log in development** — logging statements in dev/debug code
3. **TODO/FIXME comments** — unless they describe a known security issue
4. **Missing HTTPS in localhost** — local development does not need TLS
5. **Test credentials in test files** — `test/`, `__tests__/`, `*.test.*`, `*.spec.*`
6. **Example/placeholder values in docs** — README, docs/, examples/
7. **Type assertion as security issue** — TypeScript `as` casts are type-level only
8. **Unused imports** — code quality issue, not security
9. **Any ESLint/linter warning** — unless it directly indicates a vulnerability
10. **Missing rate limiting on dev server** — only matters in production
11. **Self-signed certs in dev/test** — expected for local development
12. **Open CORS in dev** — only a finding in production configuration
13. **Hardcoded ports** — port numbers are not secrets
14. **Package-lock.json conflicts** — merge issue, not security
15. **Deprecated API warnings** — unless the deprecation IS the vulnerability
16. **Missing CSP in development** — only matters in production
17. **Git merge artifacts** — `<<<<<<<`, `=======`, `>>>>>>>` are not vulnerabilities
18. **Empty catch blocks** — code quality issue unless swallowing auth errors
19. **Magic numbers** — code style issue, not security
20. **Missing input validation on internal functions** — only public-facing entry points matter
21. **Anchor IDL files** — IDL JSON is public interface documentation, not a leak
22. **Solana program derived addresses** — PDAs are deterministic and public by design

### Precedent Database

When you encounter a pattern, check these precedents before reporting:

| Pattern | Verdict | Reasoning |
|---------|---------|-----------|
| `.env.example` with placeholder values | NOT a finding | Example files are documentation |
| `console.log` in production code | FINDING only if it logs secrets | Check what is logged |
| `eval()` in build scripts | NOT a finding (usually) | Build-time only, not runtime |
| `eval()` in runtime code | FINDING | Code injection risk |
| `dangerouslySetInnerHTML` with sanitized input | Verify sanitizer | Check if DOMPurify or equivalent is used |
| `dangerouslySetInnerHTML` with raw user input | CRITICAL finding | XSS confirmed |
| Hardcoded JWT secret in test file | NOT a finding | Test-only credential |
| Hardcoded JWT secret in config file | CRITICAL finding | Production credential exposure |
| `rejectUnauthorized: false` in test | NOT a finding | Test environment |
| `rejectUnauthorized: false` in production | HIGH finding | TLS bypass |
| `chmod 777` in Dockerfile | HIGH finding | Excessive permissions |
| `chmod 755` on binary in Dockerfile | NOT a finding | Normal executable permission |
| Solana `SystemProgram.transfer` without signer check | Verify context | May be legitimate if called from validated instruction |
| Anchor `#[account(mut)]` without constraint | Verify if constraint needed | Missing `has_one` or `constraint` may be intentional |
| `Keypair.generate()` in test file | NOT a finding | Test keypair |
| `Keypair.generate()` in production code | VERIFY | May be legitimate for ephemeral operations |
| Private key in `.env` (gitignored) | LOW finding | Should use vault/KMS, but gitignored is baseline |
| Private key in committed file | CRITICAL finding | Immediate rotation required |

### Active Verification Steps

For any finding >= 7/10 confidence, attempt active verification:

1. **Trace the data flow:** Follow user input from entry point to the vulnerable code
2. **Check for guards:** Look for middleware, validators, sanitizers upstream
3. **Test the path:** If Bash is available, attempt to trigger the condition (non-destructively)
4. **Check runtime context:** Is this code reachable in production? Dead code is not a finding.
5. **Cross-reference:** Does another phase's finding confirm or contradict this one?

---

## Phase 13: Findings Report + Remediation

### Findings Table Format

Present each finding as:

```
### [SEVERITY] Finding-ID: Title

**Confidence:** X/10
**Phase:** Phase N — Phase Name
**Category:** OWASP A0X / STRIDE Letter / Infrastructure
**Location:** file:line (or directory)

**Description:**
One paragraph explaining the vulnerability.

**Exploit Scenario:**
Step-by-step description of how an attacker would exploit this.
(REQUIRED for all findings >= 7/10 confidence)

**Evidence:**
Code snippet or command output proving the finding.

**Remediation:**
Specific fix with code example if applicable.

**Priority:** P0 (fix now) / P1 (fix this sprint) / P2 (fix this month) / P3 (backlog)
```

### Severity Definitions

| Severity | Meaning | SLA |
|----------|---------|-----|
| CRITICAL | Actively exploitable, data loss or system compromise | Fix immediately |
| HIGH | Exploitable with some conditions, significant impact | Fix within 24 hours |
| MEDIUM | Requires specific conditions, moderate impact | Fix this sprint |
| LOW | Minor impact, defense-in-depth improvement | Fix this month |
| INFO | Not a vulnerability, but worth noting | No SLA |

### Remediation Roadmap

After presenting all findings, create a prioritized remediation roadmap:

1. Group findings by priority (P0, P1, P2, P3)
2. For each group, estimate effort (hours)
3. Use AskUserQuestion to confirm priorities with the user
4. Ask if they want to start fixing P0 issues now

### Confidence Calibration Summary

At the end of the report, include:

```
## Confidence Calibration

- Total findings: N
- CRITICAL: N (avg confidence: X/10)
- HIGH: N (avg confidence: X/10)
- MEDIUM: N (avg confidence: X/10)
- LOW: N (avg confidence: X/10)
- INFO: N (avg confidence: X/10)
- False positives filtered: N
- Mode: Daily (8/10 gate) | Comprehensive (2/10 gate)
```

---

## Phase 14: Save Report

**Goal:** Persist the audit report for tracking over time.

1. Create `.superstack/security-reports/` directory if it doesn't exist
2. Determine project slug: `basename $(git rev-parse --show-toplevel 2>/dev/null)` (fallback: current directory name)
3. Save report to `.superstack/security-reports/{slug}-{YYYY-MM-DD}.md`
4. If a previous report exists, compare finding counts and highlight:
   - New findings (not in previous report)
   - Resolved findings (in previous report but not current)
   - Persistent findings (in both reports)
5. Append summary to `.superstack/security-reports/history.md`:

```markdown
## {YYYY-MM-DD} — {slug}
- Mode: Daily | Comprehensive
- Findings: N (C: X, H: X, M: X, L: X, I: X)
- New: N | Resolved: N | Persistent: N
- Confidence gate: X/10
```

6. Tell the user where the report was saved and offer to start remediation.

## Telemetry (run last)

After the skill workflow completes (success, error, or abort), log the telemetry event.
Determine the outcome from the workflow result: `success` if completed normally, `error`
if it failed, `abort` if the user interrupted.

Run this bash:

```bash
_TEL_END=$(date +%s)
_TEL_DUR=$(( _TEL_END - ${_TEL_START:-$_TEL_END} ))
_TEL_TIER=$(cat ~/.superstack/config.json 2>/dev/null | grep -o '"telemetryTier": *"[^"]*"' | head -1 | sed 's/.*"telemetryTier": *"//;s/"$//' || echo "anonymous")
if [ "$_TEL_TIER" != "off" ]; then
echo '{"skill":"cso","phase":"build","event":"completed","outcome":"OUTCOME","duration_s":"'"$_TEL_DUR"'","session":"'"$_SESSION_ID"'","ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","platform":"'$(uname -s)-$(uname -m)'"}' >> ~/.superstack/telemetry.jsonl 2>/dev/null || true
true
fi
```

Replace `OUTCOME` with success/error/abort based on the workflow result.
