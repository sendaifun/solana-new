# Ship Checklist Reference

Pre-ship verification checklist for Solana projects. Every item must be checked before creating a PR. Items are categorized by severity: **Block** (must pass), **Warn** (should pass, document if not), **Info** (nice to have).

---

## Pre-Flight

### Branch is not main/master

- **Severity**: Block
- **Check**: `git branch --show-current` should not return `main` or `master`.
- **How to Verify**:
  ```bash
  current_branch=$(git branch --show-current)
  if [ "$current_branch" = "main" ] || [ "$current_branch" = "master" ]; then
    echo "BLOCK: On protected branch $current_branch"
  fi
  ```
- **If Failed**: Create a feature branch from current HEAD: `git checkout -b feature/<descriptive-name>`.

### Working tree is clean (or changes are intentional)

- **Severity**: Warn
- **Check**: `git status --short` should be empty, or all changes should be staged and intentional.
- **How to Verify**:
  ```bash
  if [ -n "$(git status --short)" ]; then
    echo "WARN: Uncommitted changes detected"
    git status --short
  fi
  ```
- **If Failed**: Ask user whether to commit, stash, or discard changes. Never auto-discard.

### Build context exists and is current

- **Severity**: Info
- **Check**: `.solana-new/build-context.json` exists and was updated within the current sprint.
- **How to Verify**:
  ```bash
  if [ -f ".solana-new/build-context.json" ]; then
    echo "Build context found"
  else
    echo "INFO: No build context — proceeding without project metadata"
  fi
  ```
- **If Failed**: Proceed without build context. Note in PR that project metadata is not tracked.

### Remote is configured and accessible

- **Severity**: Block
- **Check**: `git remote -v` shows at least one remote. `git ls-remote` succeeds.
- **How to Verify**:
  ```bash
  if ! git remote -v | grep -q origin; then
    echo "BLOCK: No remote configured"
  fi
  ```
- **If Failed**: Ask user to add a remote: `git remote add origin <url>`.

---

## Tests

### All test suites detected and run

- **Severity**: Block
- **Check**: Detect available test frameworks and run all of them.
- **How to Verify**:
  ```bash
  # Detect test frameworks
  [ -f "Anchor.toml" ] && echo "Anchor tests available: anchor test"
  [ -f "Cargo.toml" ] && grep -q "test" Cargo.toml && echo "Cargo tests available: cargo test-sbf"
  [ -f "package.json" ] && grep -q '"test"' package.json && echo "npm tests available: npm test"
  [ -d "__tests__" ] || [ -d "tests" ] && echo "Test directory found"
  ```
- **If Failed**: If no tests exist, warn the user but do not block (some early-stage projects may not have tests yet). Document in PR.

### Pass rate is 100% (or known failures are documented)

- **Severity**: Block
- **Check**: All test suites exit with code 0.
- **How to Verify**: Run each test suite and check exit code.
- **If Failed**: Stop the ship workflow. Report which tests failed and their error output. Do not proceed until tests pass.

### No skipped tests without justification

- **Severity**: Warn
- **Check**: Look for `skip`, `xit`, `xdescribe`, `#[ignore]` in test files.
- **How to Verify**:
  ```bash
  grep -rn "\.skip\|xit\|xdescribe\|#\[ignore\]" tests/ __tests__/ --include="*.ts" --include="*.js" --include="*.rs" 2>/dev/null
  ```
- **If Failed**: List skipped tests in PR body. Ask user if they should be re-enabled.

### Test coverage did not decrease

- **Severity**: Info
- **Check**: If coverage reporting is configured, compare current coverage against prior run.
- **How to Verify**: Run coverage tool and compare percentages.
- **If Failed**: Note coverage change in PR body.

---

## Security

### solana-security-audit has been run

- **Severity**: Block (for program changes), Info (for frontend-only changes)
- **Check**: `security_audit` field exists in `.solana-new/build-context.json` and was run within the current sprint.
- **How to Verify**:
  ```bash
  if [ -f ".solana-new/build-context.json" ]; then
    # Check for security_audit field
    cat .solana-new/build-context.json | grep -q "security_audit"
  fi
  ```
- **If Failed**: Run `solana-security-audit` before proceeding. Block if program changes are in the PR.

### No unresolved CRITICAL findings

- **Severity**: Block
- **Check**: `security_audit.findings` contains no items with `severity: "critical"` and `status: "open"`.
- **How to Verify**: Parse the security audit findings from build context.
- **If Failed**: Stop. List critical findings. Require resolution before shipping.

### HIGH findings have been reviewed and accepted or fixed

- **Severity**: Warn
- **Check**: All HIGH findings are either `status: "fixed"` or `status: "accepted"` with a justification.
- **How to Verify**: Parse the security audit findings from build context.
- **If Failed**: List unreviewed HIGH findings in PR body. Ask user to review.

### Audit timestamp is within current sprint

- **Severity**: Warn
- **Check**: `security_audit.timestamp` is within the last 7 days.
- **How to Verify**: Compare timestamp against current date.
- **If Failed**: Recommend re-running the audit if significant code changes have been made since the last audit.

---

## QA (if applicable)

### solana-qa has been run for frontend dApps

- **Severity**: Warn (only applicable if frontend exists)
- **Check**: `qa` field exists in `.solana-new/build-context.json`.
- **How to Verify**:
  ```bash
  # Check if frontend exists
  [ -f "package.json" ] && grep -q "react\|next\|vue\|svelte" package.json && echo "Frontend detected"
  ```
- **If Failed**: Recommend running `solana-qa` but do not block.

### Wallet flow tests pass

- **Severity**: Warn
- **Check**: QA results show wallet connect, sign, and disconnect flows pass.
- **How to Verify**: Check `qa.wallet_tests` in build context.
- **If Failed**: Note in PR body that wallet flows were not verified.

### Devnet verification complete

- **Severity**: Warn
- **Check**: QA was run against devnet (not just local).
- **How to Verify**: Check `qa.environment` in build context.
- **If Failed**: Note that QA was local-only.

### No blocking QA failures

- **Severity**: Warn
- **Check**: QA results have no failures marked as blocking.
- **How to Verify**: Check `qa.blocking_failures` in build context.
- **If Failed**: List blocking failures in PR body.

---

## Scope

### git diff main...HEAD --stat reviewed

- **Severity**: Block
- **Check**: The diff has been shown to the user and they confirmed the scope.
- **How to Verify**:
  ```bash
  git diff main...HEAD --stat
  ```
- **If Failed**: Show the diff and ask for confirmation before proceeding.

### No unintended files (.env, secrets, build artifacts)

- **Severity**: Block
- **Check**: No sensitive or build files in the diff.
- **How to Verify**:
  ```bash
  git diff main...HEAD --name-only | grep -E '\.(env|pem|key|secret)|node_modules/|target/|dist/|\.DS_Store'
  ```
- **If Failed**: Stop. Ask user to remove the files from the commit (use `.gitignore` or `git rm --cached`).

### Changes match the intended feature/fix scope

- **Severity**: Warn
- **Check**: User confirms that all changes in the diff are intentional and related to the feature/fix.
- **How to Verify**: Show the diff summary and ask.
- **If Failed**: Help user split changes into separate branches/PRs if needed.

### No unrelated refactoring bundled in

- **Severity**: Info
- **Check**: Changes are focused. No large rename/refactor mixed with feature work.
- **How to Verify**: Review the diff for unrelated file changes.
- **If Failed**: Suggest separating refactoring into its own PR.

---

## Commit Quality

### Commits are bisectable (each passes tests independently)

- **Severity**: Info
- **Check**: Each commit in the branch builds and passes tests on its own.
- **How to Verify**: This is expensive to verify — note as a recommendation rather than a gate.
- **If Failed**: Suggest interactive rebase to clean up history before merging.

### Commit messages are descriptive

- **Severity**: Info
- **Check**: Commit messages describe what and why, not just "fix" or "update".
- **How to Verify**:
  ```bash
  git log main...HEAD --oneline
  ```
- **If Failed**: Suggest amending commit messages or using squash merge.

### No WIP or fixup commits in the PR

- **Severity**: Warn
- **Check**: No commit messages containing "WIP", "fixup", "squash", "temp", "TODO".
- **How to Verify**:
  ```bash
  git log main...HEAD --oneline | grep -iE 'wip|fixup|squash|temp|todo'
  ```
- **If Failed**: Suggest squashing or rebasing to clean up history.

---

## Program-Specific

### If program changes: devnet deployment status noted

- **Severity**: Warn
- **Check**: If Solana program files changed, note whether the program is deployed to devnet.
- **How to Verify**:
  ```bash
  git diff main...HEAD --name-only | grep -E 'programs/|src/lib\.rs|src/processor'
  ```
- **If Failed**: Note in PR body that program changes have not been deployed to devnet.

### IDL is up to date

- **Severity**: Warn
- **Check**: If Anchor program, the IDL file in the repo matches the built IDL.
- **How to Verify**:
  ```bash
  anchor build 2>/dev/null && diff target/idl/*.json idl/*.json 2>/dev/null
  ```
- **If Failed**: Run `anchor build` and commit the updated IDL.

### Program ID is consistent

- **Severity**: Block
- **Check**: Program ID in `declare_id!()`, `Anchor.toml`, and build context all match.
- **How to Verify**:
  ```bash
  grep -r "declare_id" programs/ --include="*.rs"
  grep "program_id" Anchor.toml 2>/dev/null
  ```
- **If Failed**: Stop. Inconsistent program IDs will cause deployment issues.

### Upgrade authority is documented

- **Severity**: Info
- **Check**: PR body or build context documents who holds the upgrade authority.
- **How to Verify**: Check build context for `upgrade_authority` field.
- **If Failed**: Add upgrade authority info to PR body.
