# Solana Security Audit Checklist

Complete checklist with exact commands to run. Referenced by `review-and-iterate`, `solana-security-audit`, and `deploy-to-mainnet` skills.

## P0: Critical (must fix before any deployment)

### 1. Missing Signer Checks
Every instruction that modifies state must verify the signer has authority.

```bash
# Scan for accounts missing Signer constraint
grep -rn 'pub.*Account<' programs/ --include="*.rs" | grep -v 'Signer\|Program\|SystemAccount\|UncheckedAccount'

# In Anchor: every mutable authority account should have:
# #[account(mut, signer)] or Signer<'info>
```

**Fix pattern:**
```rust
// BAD: no signer check
pub authority: AccountInfo<'info>,

// GOOD: enforced signer
pub authority: Signer<'info>,

// GOOD: with additional constraint
#[account(mut, constraint = vault.authority == authority.key())]
pub authority: Signer<'info>,
```

### 2. Missing Owner Checks
Verify accounts are owned by the expected program.

```bash
# Check for raw AccountInfo without owner validation
grep -rn "AccountInfo<'info>" programs/ --include="*.rs" | grep -v "/// \|// \|#\[" | head -20

# Every AccountInfo should have an owner check nearby
```

**Fix pattern:**
```rust
// BAD: accepts any account
pub token_account: AccountInfo<'info>,

// GOOD: Anchor Account<> auto-checks owner
pub token_account: Account<'info, TokenAccount>,

// GOOD: manual check for UncheckedAccount
require!(token_account.owner == &spl_token::ID, ErrorCode::InvalidOwner);
```

### 3. Arithmetic Overflow / Underflow
All math with user-controlled values must use checked operations.

```bash
# Find unchecked arithmetic
grep -rn '\b[a-z_]*\s*[+\-\*/]\s*[a-z_]*\b' programs/ --include="*.rs" | grep -v 'checked_\|saturating_\|wrapping_\|// \|/// \|test\|#\[' | head -20

# Count checked vs unchecked
echo "Checked operations:"
grep -rc 'checked_\|saturating_' programs/ --include="*.rs" | awk -F: '{s+=$2} END {print s}'
echo "Potentially unchecked:"
grep -rc '[a-z_]\s*[+\-\*/]\s*[a-z_]' programs/ --include="*.rs" | awk -F: '{s+=$2} END {print s}'
```

**Fix pattern:**
```rust
// BAD: panics on overflow
let total = amount_a + amount_b;

// GOOD: returns error on overflow
let total = amount_a.checked_add(amount_b).ok_or(ErrorCode::MathOverflow)?;

// GOOD: for intermediate calculations, use u128
let product = (amount as u128).checked_mul(price as u128).ok_or(ErrorCode::MathOverflow)?;
let result = u64::try_from(product / PRECISION).map_err(|_| ErrorCode::MathOverflow)?;
```

### 4. PDA Seed Confusion
PDA seeds must be unique per entity and include all identifying fields.

```bash
# List all PDA seeds in the program
grep -rn 'seeds\s*=' programs/ --include="*.rs"

# Check for PDAs that don't include the user/authority in seeds (potential collision)
grep -A2 'seeds\s*=' programs/ --include="*.rs" | grep -v 'authority\|user\|owner\|signer'
```

**Fix pattern:**
```rust
// BAD: same PDA for all users
#[account(seeds = [b"vault"], bump)]
pub vault: Account<'info, Vault>,

// GOOD: unique PDA per user
#[account(seeds = [b"vault", authority.key().as_ref()], bump)]
pub vault: Account<'info, Vault>,
```

### 5. Reinitialization Attack
Accounts must not be initializable more than once.

```bash
# Check for init without is_initialized guard
grep -rn '#\[account(init' programs/ --include="*.rs"

# Anchor's `init` constraint auto-prevents reinit. But check for manual init:
grep -rn 'is_initialized\|initialized' programs/ --include="*.rs"
```

**Fix pattern:**
```rust
// Anchor's init is safe (checks discriminator)
#[account(init, payer = user, space = 8 + Vault::LEN)]
pub vault: Account<'info, Vault>,

// For manual init: always check
require!(!account.is_initialized, ErrorCode::AlreadyInitialized);
```

### 6. Type Cosplay
Verify account discriminators to prevent wrong account types.

```bash
# Anchor handles this automatically with Account<'info, T>
# But check for raw deserialization:
grep -rn 'try_from_slice\|deserialize\|borsh' programs/ --include="*.rs" | grep -v 'test\|mod test'
```

### 7. Bump Seed Canonicalization
Always store and reuse the canonical bump, never recalculate.

```bash
# Check if bumps are stored in account data
grep -rn 'bump' programs/ --include="*.rs" | grep 'pub\|field'

# Check for find_program_address (expensive, should use stored bump)
grep -rn 'find_program_address' programs/ --include="*.rs" | grep -v 'test\|// '
```

## P1: High (fix before mainnet)

### 8. Missing Rent Exemption Check
```bash
# Anchor handles this for `init`. Check manual account creation:
grep -rn 'create_account\|transfer.*lamports' programs/ --include="*.rs" | grep -v test
```

### 9. Closing Account Drain
When closing accounts, lamports must go to the right place and data must be zeroed.

```bash
# Check close patterns
grep -rn '#\[account.*close' programs/ --include="*.rs"
grep -rn 'close_account\|lamports.*=.*0' programs/ --include="*.rs"
```

### 10. CPI Safety
Cross-program invocations must validate the target program ID.

```bash
# Find all CPI calls
grep -rn 'invoke\|invoke_signed\|CpiContext' programs/ --include="*.rs" | grep -v test

# Verify each CPI target is validated (not passed as an unchecked account)
```

### 11. Flash Loan Protection
For DeFi: prevent same-slot price manipulation.

```bash
# Check for slot-based guards
grep -rn 'Clock\|slot\|timestamp' programs/ --include="*.rs" | grep -v test
```

## P2: Medium (fix before significant TVL)

### 12. Excessive Privileges
```bash
# Check if freeze authority is set (should be revoked for most tokens)
spl-token display <MINT_ADDRESS> | grep -i "freeze\|mint.*authority"

# Check program upgrade authority
solana program show <PROGRAM_ID> | grep "Authority"
```

### 13. Error Handling Quality
```bash
# Check for unwrap() calls (potential panics)
grep -rn '\.unwrap()' programs/ --include="*.rs" | grep -v test | wc -l
# Ideal: 0 in production code
```

### 14. Event Emission
```bash
# Check for emit! calls (needed for indexing and monitoring)
grep -rn 'emit!\|msg!' programs/ --include="*.rs" | grep -v test | wc -l
```

## P3: Low (best practices)

### 15. Compute Budget
```bash
# Check for compute budget requests
grep -rn 'ComputeBudget\|set_compute_unit' programs/ --include="*.rs" tests/ --include="*.ts"
```

### 16. IDL Accuracy
```bash
# Verify IDL matches program
anchor build
diff target/idl/my_program.json published_idl.json  # If you have a published IDL
```

## Automated Tools

### Using Solana Fender MCP (if configured)
```
Ask: "Run solana-fender security scan on my program"
The MCP will analyze Anchor source and produce findings.
```

### Using VulnHunter Skill
```
Ask: "Hunt for vulnerabilities in my Anchor program"
The skill walks through pattern-based detection.
```

### Using QEDGen for Formal Verification
```
npx skills add qedgen/solana-skills
$QEDGEN spec --idl target/idl/my_program.json
$QEDGEN fill-sorry --file formal_verification/
```

## Scoring Guide

| Grade | Criteria |
|-------|----------|
| **A** | All P0-P2 clean. P3 mostly addressed. Fuzz tested. |
| **B** | All P0 clean. Most P1 clean. Some P2 remaining. |
| **C** | P0 clean but P1 has issues. Needs work before mainnet. |
| **D** | P0 issues found. Do NOT deploy. |
| **F** | Multiple P0 issues. Critical rewrite needed. |
