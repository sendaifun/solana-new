# Security Basics

Solana-specific security checklist. Every program review must check these.

> **Tools:** `security` skill (official), `vulnhunter-skill`, `code-recon-skill`, `solana-fender-mcp`, `trident` repo (fuzzing)

## Critical Checks (P0)

### 1. Signer Verification
Every privileged instruction must check that the correct account signed.

```rust
// Anchor: use Signer type
#[account(mut)]
pub authority: Signer<'info>,

// Native: check manually
if !authority.is_signer { return Err(ProgramError::MissingRequiredSignature); }
```
Missing signer checks = anyone can call your admin functions.

### 2. Account Ownership
Verify accounts are owned by the expected program.

```rust
// Anchor: Account<'info, T> checks ownership automatically
pub my_account: Account<'info, MyData>,

// For cross-program accounts:
#[account(owner = other_program::ID)]
pub external_account: AccountInfo<'info>,
```
Without this, attackers can pass fake accounts with crafted data.

### 3. PDA Validation
PDA seeds must be deterministic and include enough entropy.

```rust
#[account(
    seeds = [b"vault", user.key().as_ref()],
    bump = vault.bump,  // Optional optimization when you want cheap repeated validation
)]
pub vault: Account<'info, Vault>,
```
- Always re-derive the PDA in the instruction — never trust the client
- Optionally save the canonical bump in account state if this PDA is validated often or reused for signer seeds on a hot path
- Include unique identifiers in seeds (user pubkey, mint address) to prevent collisions

### 4. Arithmetic Safety
Use checked math — overflow/underflow in token calculations = loss of funds.

```rust
// Good
let result = amount_a.checked_add(amount_b).ok_or(ErrorCode::MathOverflow)?;

// Bad
let result = amount_a + amount_b; // Can overflow silently
```
Do not rely on release builds for overflow protection: Rust release profiles disable overflow checks by default unless you explicitly set `overflow-checks = true`. Always use `checked_*` or `try_*` math for value-sensitive logic.

### 5. Reinitialization Protection
Accounts that should be initialized once must not be reinitializable.

```rust
// Anchor: init constraint handles this
#[account(init, payer = user, space = 8 + DataSize)]
pub data: Account<'info, MyData>,

// Custom programs: check an is_initialized flag
if account.is_initialized { return Err(ErrorCode::AlreadyInitialized); }
```

### 6. Type Cosplay Prevention
Ensure accounts are the expected type — attackers can pass account structs of different types with matching layouts.

```rust
// Anchor: handled automatically via 8-byte discriminator
// Custom programs: add a type discriminator field and check it
if account.discriminator != EXPECTED_DISCRIMINATOR {
    return Err(ErrorCode::InvalidAccountType);
}
```

### 7. Bump Seed Canonicalization
Always use the canonical bump. In Anchor, bare `bump` is a valid default that re-derives the canonical bump automatically; storing the bump in account state is an optimization when you want cheaper repeated validation or signer-seed reuse.

```rust
// Good: save bump on init, reuse on subsequent calls
#[account(
    seeds = [b"config"],
    bump = config.bump, // Saved during initialization
)]

// Valid default: Anchor computes the canonical bump automatically
#[account(seeds = [b"config"], bump)]
```

## Important Checks (P1)

### 8. Closing Account Attacks
Accounts can be resurrected after closing if not properly zeroed.

```rust
// Anchor: use close constraint
#[account(mut, close = recipient)]
pub account_to_close: Account<'info, MyData>,
```
The `close` constraint zeros the data, reclaims rent, and assigns to system program.

### 9. Token Account Validation
Verify token accounts match the expected mint and owner.

```rust
#[account(
    mut,
    token::mint = expected_mint,
    token::authority = user,
)]
pub user_token_account: Account<'info, TokenAccount>,
```

### 10. Rent Drain
Don't allow closing accounts without reclaiming rent to the right recipient.
Check that `close` targets are validated — attacker shouldn't redirect rent.

### 11. Duplicate Account Aliasing
If an instruction takes multiple accounts, verify they're not the same account.
Same-account aliasing can break invariants (e.g., transfer from A to A).

### 12. CPI Authority
When doing cross-program invocations, ensure the signing PDA has minimal authority.
Don't give CPI callers more power than needed.

### 13. Front-running
Consider if transaction ordering matters for your logic.
Use commit-reveal patterns or time locks for sensitive operations (e.g., auctions, oracle updates).

## DeFi-Specific Security

### Oracle Manipulation
- Never use a single oracle source — use Pyth confidence intervals
- Check oracle staleness (last update timestamp)
- Use TWAP for price-sensitive operations

### Flash Loan Attacks
- Don't rely on balances checked in the same transaction for pricing
- Verify state across multiple transactions when possible

### Slippage
- Always enforce slippage limits in swap operations
- Never hardcode slippage — let users configure it

### MEV / Sandwich Attacks
- Consider Jito bundles for MEV protection
- Use commit-reveal for sensitive operations
- Add minimum output amounts to all swaps

## Client-Side Security

- Never expose private keys in frontend code
- Never commit `.env` files with real keys
- Use environment variables for all secrets
- Validate user input before building transactions
- Simulate transactions before sending on mainnet
