# DeFi Security

Security patterns and attack vectors for Solana DeFi programs. Every pattern here addresses a real exploit that has happened on Solana or EVM chains.

## Critical Attack Vectors

### 1. Oracle Manipulation

**Attack**: Attacker manipulates the oracle price feed to borrow more than their collateral is worth, or liquidate positions at artificial prices.

**Prevention**:
```rust
// Always check oracle staleness
let price = oracle.get_price_no_older_than(&clock, MAX_STALENESS_SECONDS, &feed_id)?;

// Use confidence intervals — reject prices with wide confidence
require!(price.conf < price.price.unsigned_abs() / 20, ErrorCode::PriceUncertain);

// Use TWAP (time-weighted average price) for liquidation decisions
// Never use spot price alone for high-value operations
```

**Skills:** `pyth-skill` (price feeds with confidence intervals — use the confidence!)
**Skills:** `switchboard-skill` (permissionless feeds, VRF randomness)

### 2. Flash Loan Attacks

**Attack**: Attacker borrows a large amount in a flash loan, manipulates pool reserves or oracle prices, extracts value, repays in the same transaction.

**Prevention**:
```rust
// Option 1: Prevent same-slot operations
#[account]
pub struct Pool {
    pub last_interaction_slot: u64,
    // ...
}

pub fn swap(ctx: Context<Swap>) -> Result<()> {
    let clock = Clock::get()?;
    require!(
        ctx.accounts.pool.last_interaction_slot < clock.slot,
        ErrorCode::SameSlotInteraction
    );
    ctx.accounts.pool.last_interaction_slot = clock.slot;
    // ...
}

// Option 2: Use TWAP prices for any calculation that can be exploited
// Option 3: Rate-limit large operations relative to pool size
```

### 3. Reentrancy via CPI

**Attack**: A malicious program called via CPI calls back into your program before state is updated, exploiting stale state.

**Prevention**:
```rust
// Always follow checks-effects-interactions pattern:
// 1. CHECKS: Validate all inputs and conditions
// 2. EFFECTS: Update all state
// 3. INTERACTIONS: Make CPI calls last

pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
    // CHECK
    require!(ctx.accounts.user_balance.amount >= amount, ErrorCode::InsufficientBalance);

    // EFFECT (update state BEFORE transfer)
    ctx.accounts.user_balance.amount -= amount;

    // INTERACTION (CPI transfer last)
    token::transfer(cpi_ctx, amount)?;
    Ok(())
}
```

### 4. MEV / Sandwich Attacks

**Attack**: A searcher front-runs a large swap with a buy, then back-runs with a sell, profiting from the price impact.

**Prevention**:
```rust
// Enforce minimum output (slippage protection)
pub fn swap(ctx: Context<Swap>, amount_in: u64, minimum_out: u64) -> Result<()> {
    let amount_out = calculate_output(amount_in, reserves)?;
    require!(amount_out >= minimum_out, ErrorCode::SlippageExceeded);
    // ...
}

// Additionally:
// - Use Jito bundles for atomic transaction submission
// - Add deadline parameter (reject if block timestamp > deadline)
// - Consider price impact limits per transaction
```

### 5. Price Impact Manipulation

**Attack**: Attacker drains a pool by executing many small swaps that individually pass slippage checks but collectively move the price dramatically.

**Prevention**:
```rust
// Track cumulative price impact per epoch/slot window
#[account]
pub struct PoolState {
    pub cumulative_impact_bps: u64,
    pub impact_window_start: u64,
    pub max_impact_per_window_bps: u16, // e.g., 500 = 5%
}

// Reset window periodically, reject if cumulative impact exceeds limit
```

## Account Security Checklist

```rust
// 1. Always verify account ownership
#[account(
    constraint = pool.authority == authority.key() @ ErrorCode::Unauthorized
)]

// 2. Always check program ownership of accounts
#[account(
    owner = crate::ID @ ErrorCode::WrongProgramOwner
)]

// 3. Always verify mint matches expected token
#[account(
    constraint = vault.mint == pool.token_a_mint @ ErrorCode::WrongMint
)]

// 4. Close accounts properly — zero data, transfer lamports
#[account(
    mut,
    close = authority,
    constraint = position.liquidity == 0 @ ErrorCode::PositionNotEmpty
)]
```

## Math Safety

```rust
// NEVER use unchecked math in DeFi
// Bad:  let result = a * b / c;
// Good: let result = a.checked_mul(b)?.checked_div(c)?;

// For high-precision math, use u128 intermediates
pub fn mul_div(a: u64, b: u64, c: u64) -> Option<u64> {
    (a as u128)
        .checked_mul(b as u128)?
        .checked_div(c as u128)?
        .try_into()
        .ok()
}

// Round against the user for protocol safety
// Deposits: round down (user gets fewer shares)
// Withdrawals: round down (user gets less underlying)
// Fees: round up (protocol collects more)
```

## Emergency Controls

Every DeFi program should have:

```rust
#[account]
pub struct GlobalConfig {
    pub admin: Pubkey,
    pub paused: bool,
    pub emergency_admin: Pubkey, // Separate key for emergencies
}

// Check pause state on every user-facing instruction
pub fn check_not_paused(config: &GlobalConfig) -> Result<()> {
    require!(!config.paused, ErrorCode::ProtocolPaused);
    Ok(())
}
```

- **Pause mechanism**: Stop all user operations immediately
- **Emergency withdrawal**: Let users withdraw even when paused (no new deposits/swaps)
- **Admin timelock**: Sensitive parameter changes should have a delay (use Squads V4)

**Skills:** `squads-skill` (multisig for admin operations — timelocks, spending limits)

## Pre-Deploy Security Checklist

- [ ] All math uses checked arithmetic
- [ ] Oracle prices validated for staleness and confidence
- [ ] Slippage protection on every swap/trade operation
- [ ] Checks-effects-interactions pattern for all CPI calls
- [ ] Account ownership verified on every instruction
- [ ] Emergency pause mechanism implemented
- [ ] Admin keys behind multisig (not a single wallet)
- [ ] Fuzz tested with Trident
- [ ] Static analysis passed with `solana-fender-mcp`

**MCPs:** `solana-fender-mcp` (static analysis for Anchor programs — vulnerability pattern detection)
**Skills:** `vulnhunter-skill` (security vulnerability detection across codebases)
**Skills:** `code-recon-skill` (deep architectural analysis mapping trust boundaries)
**Skills:** `security` (official — program and client security checklist)
