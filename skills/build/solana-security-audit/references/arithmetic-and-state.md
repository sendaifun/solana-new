# Arithmetic & State Security

Comprehensive reference for arithmetic vulnerabilities and state management issues in Solana programs.

---

## 1. Checked Arithmetic

### Description

In Rust release builds, integer overflow wraps silently (e.g., `u64::MAX + 1 = 0`). Solana programs compiled with `cargo build-sbf` use release mode by default. Any arithmetic on token amounts, balances, or indices must use checked operations to prevent silent overflow.

### Risk Level: **Critical**

### Vulnerable Code

```rust
// UNSAFE: Wraps on overflow in release mode
pub fn process_deposit(vault: &mut Vault, amount: u64) -> ProgramResult {
    vault.total_deposited += amount;  // Can wrap to a small number
    vault.share_count = vault.total_deposited / vault.share_price;  // Wrong share count
    Ok(())
}
```

### Fixed Code

```rust
// SAFE: Returns error on overflow
pub fn process_deposit(vault: &mut Vault, amount: u64) -> ProgramResult {
    vault.total_deposited = vault.total_deposited
        .checked_add(amount)
        .ok_or(ProgramError::ArithmeticOverflow)?;

    vault.share_count = vault.total_deposited
        .checked_div(vault.share_price)
        .ok_or(ProgramError::ArithmeticOverflow)?;

    Ok(())
}
```

### Anchor Pattern

```rust
// Use require! for explicit bounds checking
require!(
    vault.total_deposited.checked_add(amount).is_some(),
    CustomError::Overflow
);
vault.total_deposited = vault.total_deposited.checked_add(amount).unwrap();
```

### Exploit Scenario

A staking program calculates rewards as `staked_amount * reward_rate`. An attacker stakes `u64::MAX / 2 + 1` tokens and triggers a reward calculation. The multiplication overflows, wrapping to a small value, and the attacker claims a tiny reward instead of the correct one. Alternatively, the overflow could wrap to a very large value, allowing the attacker to drain the reward pool.

### Fix

- Use `checked_add`, `checked_sub`, `checked_mul`, `checked_div` for all arithmetic.
- Alternatively, enable overflow checks in release mode via `Cargo.toml`:
  ```toml
  [profile.release]
  overflow-checks = true
  ```
  This causes panics on overflow (which abort the transaction), but `checked_*` methods give better error messages.

---

## 2. Precision Loss in Fee Calculations

### Description

Integer division truncates toward zero. If a fee calculation divides before multiplying, or uses a type too small for intermediate values, the result can lose precision. In the worst case, fees round to zero and the protocol earns nothing.

### Risk Level: **High**

### Vulnerable Code

```rust
// UNSAFE: Division before multiplication causes precision loss
pub fn calculate_fee(amount: u64, fee_bps: u64) -> u64 {
    // fee_bps = 30 (0.3%)
    // amount = 1000
    // 1000 / 10000 = 0 (truncated), then 0 * 30 = 0 -- ZERO FEE
    (amount / 10_000) * fee_bps
}

// UNSAFE: u64 * u64 can overflow before division
pub fn calculate_fee_v2(amount: u64, fee_bps: u64) -> u64 {
    // If amount is very large, this overflows before the division can reduce it
    amount * fee_bps / 10_000
}
```

### Fixed Code

```rust
// SAFE: Use u128 for intermediate calculations, multiply first
pub fn calculate_fee(amount: u64, fee_bps: u64) -> Result<u64, ProgramError> {
    let fee = (amount as u128)
        .checked_mul(fee_bps as u128)
        .ok_or(ProgramError::ArithmeticOverflow)?
        .checked_div(10_000u128)
        .ok_or(ProgramError::ArithmeticOverflow)?;

    // Safe downcast: fee <= amount (since fee_bps <= 10000)
    u64::try_from(fee).map_err(|_| ProgramError::ArithmeticOverflow)
}
```

### Exploit Scenario

A DEX charges a 0.3% (30 bps) swap fee. Due to division-before-multiplication, swaps under 10,000 base units pay zero fees. An attacker splits a 1,000,000 token swap into 200 swaps of 5,000 tokens each. Each pays zero fee. The protocol earns nothing while processing the full volume.

### Fix

- Multiply before dividing. Always.
- Use `u128` for intermediate values to avoid overflow during multiplication.
- Validate that fee_bps is within expected bounds (e.g., 0..=10000).
- Consider rounding up fees: `(amount * fee_bps + 9999) / 10000` to ensure the protocol always collects.

---

## 3. Lamport Accounting Invariants

### Description

The Solana runtime enforces that the sum of lamports across all accounts in an instruction remains constant. However, this is checked per-instruction, not across CPI chains. A program must maintain its own accounting invariants to prevent lamport leaks.

### Risk Level: **High**

### Vulnerable Code

```rust
// UNSAFE: No balance verification after transfers
pub fn process_withdraw(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    amount: u64,
) -> ProgramResult {
    let vault = next_account_info(&mut accounts.iter())?;
    let user = next_account_info(&mut accounts.iter())?;

    // Transfer lamports
    **vault.try_borrow_mut_lamports()? -= amount;
    **user.try_borrow_mut_lamports()? += amount;

    // But what if amount > vault.lamports? The runtime catches this,
    // but what if the vault also has a token balance that should be
    // checked in relation to the lamport balance?
    Ok(())
}
```

### Fixed Code

```rust
// SAFE: Explicit balance validation
pub fn process_withdraw(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    amount: u64,
) -> ProgramResult {
    let vault = next_account_info(&mut accounts.iter())?;
    let user = next_account_info(&mut accounts.iter())?;

    let vault_data = Vault::try_from_slice(&vault.data.borrow())?;

    // Check against program-level accounting, not just lamport balance
    require!(
        amount <= vault_data.available_balance,
        CustomError::InsufficientFunds
    );

    // Check rent-exempt minimum
    let rent = Rent::get()?;
    let min_balance = rent.minimum_balance(vault.data_len());
    let post_balance = vault.lamports()
        .checked_sub(amount)
        .ok_or(ProgramError::InsufficientFunds)?;

    require!(
        post_balance >= min_balance,
        CustomError::BelowRentExempt
    );

    **vault.try_borrow_mut_lamports()? = post_balance;
    **user.try_borrow_mut_lamports()? = user
        .lamports()
        .checked_add(amount)
        .ok_or(ProgramError::ArithmeticOverflow)?;

    // Update program-level accounting
    let mut vault_data = Vault::try_from_slice(&vault.data.borrow())?;
    vault_data.available_balance = vault_data.available_balance
        .checked_sub(amount)
        .ok_or(ProgramError::ArithmeticOverflow)?;
    vault_data.serialize(&mut &mut vault.data.borrow_mut()[..])?;

    Ok(())
}
```

### Exploit Scenario

A protocol's vault holds 10 SOL in lamports but tracks `available_balance = 8 SOL` in its state (2 SOL reserved for rent). A withdrawal function checks only `vault.lamports() >= amount`, not the program's internal accounting. An attacker withdraws 9.5 SOL, leaving the vault below rent-exempt minimum. At the next epoch, the runtime garbage-collects the account, destroying all remaining state.

### Fix

- Maintain internal accounting separate from raw lamport balances.
- Always verify rent-exempt minimum after withdrawals.
- Use `checked_sub` and `checked_add` for all lamport transfers.
- Validate program-level invariants (e.g., sum of user deposits == vault balance).

---

## 4. State Transition Safety

### Description

Programs that implement state machines (e.g., an escrow going through Created -> Funded -> Completed -> Cancelled) must validate that transitions are legal. Without validation, an attacker can skip states or revert to a previous state.

### Risk Level: **High**

### Vulnerable Code

```rust
// UNSAFE: No transition validation
pub fn process_complete(escrow: &mut Escrow) -> ProgramResult {
    // Directly sets state without checking current state
    escrow.state = EscrowState::Completed;
    // ... transfer funds
    Ok(())
}
```

### Fixed Code

```rust
#[derive(Clone, Copy, PartialEq)]
pub enum EscrowState {
    Created = 0,
    Funded = 1,
    Completed = 2,
    Cancelled = 3,
    Disputed = 4,
}

impl EscrowState {
    pub fn can_transition_to(&self, next: EscrowState) -> bool {
        match (self, next) {
            (EscrowState::Created, EscrowState::Funded) => true,
            (EscrowState::Created, EscrowState::Cancelled) => true,
            (EscrowState::Funded, EscrowState::Completed) => true,
            (EscrowState::Funded, EscrowState::Disputed) => true,
            (EscrowState::Disputed, EscrowState::Completed) => true,
            (EscrowState::Disputed, EscrowState::Cancelled) => true,
            _ => false,  // All other transitions are invalid
        }
    }
}

pub fn process_complete(escrow: &mut Escrow) -> ProgramResult {
    if !escrow.state.can_transition_to(EscrowState::Completed) {
        return Err(CustomError::InvalidStateTransition.into());
    }
    escrow.state = EscrowState::Completed;
    // ... transfer funds
    Ok(())
}
```

### Exploit Scenario

An escrow program allows completing from any state. An attacker creates an escrow (state: Created), skips the Funded state (never depositing), and directly calls `complete`. The program transfers the counterparty's funds to the attacker without any deposit.

### Fix

- Define all valid transitions explicitly in a `can_transition_to` method.
- Check current state before every state change.
- Use exhaustive `match` statements that deny unknown transitions by default.
- Consider adding timestamp or slot requirements for time-locked transitions.

---

## 5. Rent Drain

### Description

Accounts on Solana must maintain a rent-exempt minimum balance. Operations that reduce an account's lamport balance below this threshold will eventually cause the account to be garbage-collected, destroying its state. Attackers can use small, repeated withdrawals ("dust operations") to drain an account below the threshold.

### Risk Level: **Medium**

### Vulnerable Code

```rust
// UNSAFE: No rent-exempt check after withdrawal
pub fn withdraw_small(vault: &AccountInfo, amount: u64) -> ProgramResult {
    **vault.try_borrow_mut_lamports()? -= amount;
    // ... no check on remaining balance
    Ok(())
}
```

### Fixed Code

```rust
pub fn withdraw_small(vault: &AccountInfo, amount: u64) -> ProgramResult {
    let rent = Rent::get()?;
    let min_balance = rent.minimum_balance(vault.data_len());
    let remaining = vault.lamports()
        .checked_sub(amount)
        .ok_or(ProgramError::InsufficientFunds)?;

    if remaining < min_balance && remaining != 0 {
        // Either leave enough for rent or close the account entirely
        return Err(CustomError::BelowRentExempt.into());
    }

    **vault.try_borrow_mut_lamports()? = remaining;
    Ok(())
}
```

### Exploit Scenario

A tip jar program lets anyone withdraw small tips. An attacker calls withdraw with 1 lamport repeatedly across many transactions. Each call succeeds because `amount <= balance`. Eventually, the account drops below the rent-exempt minimum. At the end of the epoch, the runtime deletes the account. All remaining lamports and stored state are lost.

### Fix

- After every operation that reduces lamports, check `remaining >= rent.minimum_balance(data_len)`.
- If the balance would go below the minimum, either reject the operation or close the account entirely (zero balance + zero data).
- The only valid non-rent-exempt balance is zero (fully closed).

---

## 6. Integer Truncation in Timestamps

### Description

Solana provides two time sources: `Clock::get()?.unix_timestamp` (i64, seconds since Unix epoch) and `Clock::get()?.slot` (u64, current slot number). Confusing these or truncating timestamps causes time-lock bypasses.

### Risk Level: **Medium**

### Vulnerable Code

```rust
// UNSAFE: Storing i64 timestamp in u32 field
pub struct Lockup {
    pub unlock_time: u32,  // Truncates after year 2106, wraps in 2038 if treated as signed
}

// UNSAFE: Comparing slot with timestamp
pub fn check_expired(lockup: &Lockup, clock: &Clock) -> bool {
    // clock.slot is not a unix timestamp!
    (clock.slot as i64) > lockup.unlock_time as i64
}
```

### Fixed Code

```rust
pub struct Lockup {
    pub unlock_time: i64,  // Match Clock::unix_timestamp type
}

pub fn check_expired(lockup: &Lockup, clock: &Clock) -> bool {
    clock.unix_timestamp > lockup.unlock_time
}

// If using slots, be explicit
pub struct SlotLockup {
    pub unlock_slot: u64,  // Match Clock::slot type
}
```

### Exploit Scenario

A vesting contract stores `unlock_time` as `u32`. The admin sets a vesting schedule that unlocks in 2040. Due to `u32` truncation, the stored value wraps, and `unlock_time` evaluates to a timestamp in the past. All tokens unlock immediately.

### Fix

- Use `i64` for unix timestamps (matches `Clock::unix_timestamp`).
- Use `u64` for slot numbers (matches `Clock::slot`).
- Never truncate timestamps to smaller types.
- Never compare slots with timestamps — they are different units.
- Validate timestamp inputs: reject values in the past, reject unreasonably far future dates.

---

## 7. DeFi-Specific Arithmetic

### Description

DeFi protocols have unique arithmetic requirements around price oracles, flash loan resistance, and slippage protection. These are not general Solana issues but are critical for any program that interacts with external pricing data or performs swaps.

### Risk Level: **Critical** (for DeFi programs)

### Oracle Staleness (Pyth)

```rust
// UNSAFE: No staleness check
let price_feed = load_price_feed_from_account_info(&price_account)?;
let price = price_feed.get_price_unchecked();  // Could be hours old
let value = amount * price.price as u64;

// SAFE: Check staleness and confidence
let price_feed = load_price_feed_from_account_info(&price_account)?;
let current_time = Clock::get()?.unix_timestamp;
let price = price_feed.get_price_no_older_than(current_time, 30)  // Max 30 seconds old
    .ok_or(CustomError::StalePriceFeed)?;

// Validate confidence interval
let confidence_pct = (price.conf as u128)
    .checked_mul(100)
    .unwrap()
    .checked_div(price.price.unsigned_abs() as u128)
    .unwrap();
require!(confidence_pct < 5, CustomError::PriceTooUncertain);  // Max 5% confidence band
```

### Flash Loan Detection

```rust
// UNSAFE: Using current balance for pricing (vulnerable to flash loan manipulation)
let pool_balance = token_account.amount;
let price = pool_balance / total_shares;  // Attacker flash-loans to inflate balance

// SAFE: Use TWAP or oracle price, not spot balance
let oracle_price = get_oracle_price(&price_feed)?;
let value = amount.checked_mul(oracle_price).ok_or(CustomError::Overflow)?;

// Also: Check that balance hasn't changed within the same transaction
// by comparing against a stored last-known-balance
require!(
    pool_token_account.amount == pool_state.last_recorded_balance,
    CustomError::BalanceManipulated
);
```

### Slippage Protection

```rust
// UNSAFE: No minimum output check
pub fn swap(ctx: Context<Swap>, amount_in: u64) -> Result<()> {
    let amount_out = calculate_output(amount_in, &ctx.accounts.pool)?;
    transfer_tokens(amount_out, &ctx.accounts)?;  // User gets whatever the pool gives
    Ok(())
}

// SAFE: Require minimum output
pub fn swap(ctx: Context<Swap>, amount_in: u64, minimum_amount_out: u64) -> Result<()> {
    let amount_out = calculate_output(amount_in, &ctx.accounts.pool)?;

    require!(
        amount_out >= minimum_amount_out,
        CustomError::SlippageExceeded
    );

    transfer_tokens(amount_out, &ctx.accounts)?;
    Ok(())
}
```

### Exploit Scenario — Oracle Manipulation

An attacker takes a flash loan, manipulates the price of an asset on a low-liquidity DEX, then uses a lending protocol that reads the manipulated price as an oracle. The protocol sees inflated collateral value and issues a massive loan. The attacker repays the flash loan and keeps the borrowed funds.

### Exploit Scenario — Missing Slippage Protection

A user submits a swap transaction. A MEV bot sees the pending transaction, front-runs it with a large trade that moves the price, then back-runs with the reverse trade. The user's swap executes at a much worse price, and the bot captures the difference.

### Fix

- Always check oracle staleness (max age 30-60 seconds for most use cases).
- Validate oracle confidence intervals — reject prices with wide bands.
- Never use spot pool balances as price oracles — use TWAPs or external oracles.
- Require `minimum_amount_out` (or `maximum_amount_in`) on every swap instruction.
- Store and validate last-known balances to detect same-transaction manipulation.
