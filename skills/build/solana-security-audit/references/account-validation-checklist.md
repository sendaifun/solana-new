# Account Validation Checklist

Comprehensive reference for account validation vulnerabilities in Solana programs. Covers both Anchor and native patterns.

---

## 1. Signer Verification

### Description

Every instruction that modifies state or transfers value must verify that the authorizing account has actually signed the transaction. Without this check, anyone can submit an instruction claiming to act on behalf of another user.

### Risk Level: **Critical**

### Anchor Pattern

```rust
#[derive(Accounts)]
pub struct UpdateConfig<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,  // Anchor enforces is_signer = true
    #[account(
        mut,
        has_one = authority,       // Verifies config.authority == authority.key()
    )]
    pub config: Account<'info, Config>,
}
```

The `Signer<'info>` type automatically rejects transactions where the account has not signed. The `has_one` constraint links the signer to on-chain state.

### Native Pattern

```rust
pub fn process_update_config(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
) -> ProgramResult {
    let account_iter = &mut accounts.iter();
    let authority = next_account_info(account_iter)?;
    let config_account = next_account_info(account_iter)?;

    // CRITICAL: Must check is_signer
    if !authority.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }

    let config = Config::try_from_slice(&config_account.data.borrow())?;
    if config.authority != *authority.key {
        return Err(ProgramError::InvalidAccountData);
    }

    // ... proceed with update
    Ok(())
}
```

### Exploit Scenario

An attacker calls `update_config` passing their own account as the authority but without signing. If `is_signer` is not checked, the attacker can change the config authority to their own pubkey, then drain the protocol treasury.

### Fix

- **Anchor**: Use `Signer<'info>` for every account that must authorize the action. Pair with `has_one` or `constraint` to link the signer to on-chain state.
- **Native**: Always check `account_info.is_signer` before trusting an authority account. Return `MissingRequiredSignature` on failure.

---

## 2. Account Ownership Validation

### Description

Solana accounts are owned by programs. When an instruction expects an account of a specific type (e.g., a token account owned by the Token Program), it must verify the account's `owner` field. Without this check, an attacker can pass an account owned by a different program that happens to have the right data layout.

### Risk Level: **Critical**

### Anchor Pattern

```rust
#[derive(Accounts)]
pub struct Deposit<'info> {
    // Account<T> automatically checks:
    //   1. account.owner == T::owner() (the program that owns this account type)
    //   2. Deserializes and validates the discriminator
    #[account(mut)]
    pub vault: Account<'info, Vault>,

    // For token accounts, use the token constraint types
    #[account(
        mut,
        token::mint = mint,
        token::authority = depositor,
    )]
    pub token_account: Account<'info, TokenAccount>,
}
```

Anchor's `Account<'info, T>` wrapper checks `account.owner == T::owner()` during deserialization. Do **not** flag this as missing an ownership check.

### Native Pattern

```rust
pub fn process_deposit(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
) -> ProgramResult {
    let account_iter = &mut accounts.iter();
    let vault_account = next_account_info(account_iter)?;

    // CRITICAL: Must verify ownership
    if vault_account.owner != program_id {
        return Err(ProgramError::IncorrectProgramId);
    }

    let token_account_info = next_account_info(account_iter)?;

    // Must verify token accounts are owned by the Token Program
    if token_account_info.owner != &spl_token::id() {
        return Err(ProgramError::IncorrectProgramId);
    }

    // ... proceed with deposit
    Ok(())
}
```

### Exploit Scenario

A lending protocol expects a `Vault` account owned by its program. The attacker creates an account with the same data layout but owned by their own program (with `is_initialized = true` and inflated `total_deposits`). Without ownership validation, the protocol reads fake data and issues the attacker a massive loan against non-existent collateral.

### Fix

- **Anchor**: `Account<'info, T>` handles this. No additional code needed.
- **Native**: Check `account_info.owner == expected_program_id` for every account your program reads. Check `account_info.owner == spl_token::id()` for all token accounts.

---

## 3. PDA Seed Safety

### Description

Program Derived Addresses (PDAs) are deterministic addresses derived from seeds and a program ID. If seeds are not carefully chosen, two different logical entities can map to the same PDA (seed collision), or an attacker can manipulate seed inputs to access unintended PDAs.

### Risk Level: **Critical**

### Safe Seed Derivation

```rust
// SAFE: Seeds include unique identifiers (user pubkey + mint)
#[account(
    init,
    payer = user,
    space = 8 + UserPosition::LEN,
    seeds = [b"position", user.key().as_ref(), mint.key().as_ref()],
    bump,
)]
pub position: Account<'info, UserPosition>,
```

### Unsafe Seed Derivation

```rust
// UNSAFE: Seeds lack user-specific identifier — all users share one PDA
#[account(
    seeds = [b"position"],
    bump,
)]
pub position: Account<'info, UserPosition>,

// UNSAFE: Using user-controlled string as seed without length prefix
// Attacker: seeds = [b"AB", b"C"] collides with seeds = [b"A", b"BC"]
#[account(
    seeds = [b"vault", name.as_bytes()],
    bump,
)]
pub vault: Account<'info, Vault>,
```

### Canonical Bump Storage

```rust
// SAFE: Store and reuse the canonical bump
#[account(
    seeds = [b"config", authority.key().as_ref()],
    bump = config.bump,  // Use stored bump, don't re-derive
)]
pub config: Account<'info, Config>,
```

```rust
#[account]
pub struct Config {
    pub authority: Pubkey,
    pub bump: u8,  // Stored during init
}
```

### `find_program_address` vs `create_program_address`

- `find_program_address`: Iterates from bump 255 down to find the first valid PDA (canonical bump). Use during initialization.
- `create_program_address`: Uses a specific bump. Use in subsequent calls with the stored canonical bump. If you accept bump from client input without storing/verifying it, an attacker can use a non-canonical bump to derive a different address.

### Exploit Scenario — Seed Collision

A staking program derives user stake accounts with seeds `[b"stake", pool_id]` but omits the user's pubkey. All users share the same PDA. The first user deposits 100 SOL, the second user calls withdraw and receives the first user's stake.

### Exploit Scenario — Bump Grinding

A program accepts `bump` as an instruction argument and uses `create_program_address` without verifying it is the canonical bump. The attacker provides a non-canonical bump, deriving a different (uninitialized) PDA, bypassing state checks on the real PDA.

### Fix

- Always include unique identifiers in seeds (user pubkey, mint address, unique ID).
- Store the canonical bump at initialization and verify it in subsequent instructions.
- Use length-prefixed or fixed-size seeds to prevent concatenation collisions.
- Prefer `find_program_address` during init, `create_program_address` with stored bump thereafter.

---

## 4. Type Cosplay / Discriminator Validation

### Description

Without a discriminator (a unique prefix identifying the account type), an attacker can pass an account of type A where the instruction expects type B, as long as the data layout overlaps. Anchor automatically prepends an 8-byte discriminator (SHA-256 of `"account:<StructName>"`). Native programs must implement this manually.

### Risk Level: **High**

### Anchor Pattern

```rust
// Anchor handles this automatically via the 8-byte discriminator.
// Account<'info, Vault> will reject any account whose first 8 bytes
// don't match SHA-256("account:Vault")[:8].
#[account]
pub struct Vault {
    pub authority: Pubkey,
    pub balance: u64,
}

#[account]
pub struct UserProfile {
    pub authority: Pubkey,  // Same offset as Vault.authority
    pub name: String,
}
// Even though both start with a Pubkey, Anchor distinguishes them by discriminator.
```

### Native Pattern

```rust
// Manual discriminator implementation
#[repr(u8)]
pub enum AccountType {
    Uninitialized = 0,
    Vault = 1,
    UserProfile = 2,
    StakeRecord = 3,
}

pub struct Vault {
    pub account_type: AccountType,  // First byte = discriminator
    pub authority: Pubkey,
    pub balance: u64,
}

pub fn process_withdraw(accounts: &[AccountInfo]) -> ProgramResult {
    let vault_info = next_account_info(&mut accounts.iter())?;
    let data = vault_info.data.borrow();

    // CRITICAL: Validate account type before deserialization
    if data[0] != AccountType::Vault as u8 {
        return Err(ProgramError::InvalidAccountData);
    }

    let vault = Vault::try_from_slice(&data)?;
    // ... proceed
    Ok(())
}
```

### Exploit Scenario

A native program has `Vault { authority, balance }` and `StakeRecord { authority, amount }`. Both start with a `Pubkey` followed by a `u64`. Without a discriminator, an attacker creates a `StakeRecord` with `amount = 1_000_000_000` and passes it as a `Vault`. The program reads `balance = 1_000_000_000` and allows a massive withdrawal.

### Fix

- **Anchor**: No action needed — discriminator is automatic.
- **Native**: Add a type discriminator as the first field of every account struct. Validate it before deserialization. Use an enum to prevent collisions.

---

## 5. Reinitialization Protection

### Description

If an account can be initialized more than once, an attacker can reset its state. This can change the authority, zero out balances, or revert the account to a clean state that enables further exploits.

### Risk Level: **High**

### Anchor Pattern

```rust
#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,           // Anchor checks: account must have zero lamports or be non-existent
        payer = user,   // Allocates space and assigns owner atomically
        space = 8 + Config::LEN,
        seeds = [b"config"],
        bump,
    )]
    pub config: Account<'info, Config>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}
// Calling this instruction again will fail because the account already exists.
```

### Native Pattern

```rust
pub fn process_initialize(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
) -> ProgramResult {
    let config_info = next_account_info(&mut accounts.iter())?;
    let data = config_info.data.borrow();

    // CRITICAL: Check if already initialized
    if data[0] != AccountType::Uninitialized as u8 {
        return Err(ProgramError::AccountAlreadyInitialized);
    }

    // ... set fields
    // Set discriminator to mark as initialized
    let mut data = config_info.data.borrow_mut();
    data[0] = AccountType::Config as u8;

    Ok(())
}
```

### Exploit Scenario

A vault program's `initialize` instruction sets `authority` and `is_initialized = true` but doesn't check if already initialized. The attacker calls `initialize` again with their own pubkey as authority. The vault now belongs to the attacker, who withdraws all funds.

### Fix

- **Anchor**: Use `init` constraint (not `init_if_needed` unless you explicitly handle the re-init case).
- **Native**: Check `is_initialized` (or discriminator != Uninitialized) before writing any state.
- Be cautious with `init_if_needed` — it intentionally allows re-entry. If used, add constraints that prevent authority changes.

---

## 6. Close Account Safety

### Description

When closing an account (transferring its lamports to a recipient and marking it as defunct), the account data must be zeroed. If data is not zeroed, the account can be "revived" within the same transaction by re-funding it with lamports, and the stale data will still be present.

### Risk Level: **High**

### Anchor Pattern

```rust
#[derive(Accounts)]
pub struct ClosePosition<'info> {
    #[account(
        mut,
        close = user,   // Anchor: transfers lamports to user, zeros data, assigns to system program
        has_one = user,
    )]
    pub position: Account<'info, Position>,
    #[account(mut)]
    pub user: Signer<'info>,
}
```

Anchor's `close` constraint handles everything: zeros data, transfers lamports, reassigns owner to system program.

### Native Pattern

```rust
pub fn process_close(accounts: &[AccountInfo]) -> ProgramResult {
    let account_info = next_account_info(&mut accounts.iter())?;
    let recipient = next_account_info(&mut accounts.iter())?;

    // Transfer all lamports
    let lamports = account_info.lamports();
    **account_info.try_borrow_mut_lamports()? = 0;
    **recipient.try_borrow_mut_lamports()? = recipient
        .lamports()
        .checked_add(lamports)
        .ok_or(ProgramError::ArithmeticOverflow)?;

    // CRITICAL: Zero the data to prevent revival attacks
    let mut data = account_info.data.borrow_mut();
    data.fill(0);

    // Reassign owner to system program
    account_info.assign(&solana_program::system_program::id());

    Ok(())
}
```

### Exploit Scenario

A program closes a reward account by transferring lamports but doesn't zero the data. In the same transaction, the attacker re-funds the account with rent-exempt lamports. The account revives with its original data intact — including `rewards_claimed = false`. The attacker claims rewards again.

### Fix

- **Anchor**: Use the `close` constraint.
- **Native**: Zero all data bytes with `data.fill(0)`, transfer all lamports, and reassign the owner to the system program. Do all three.

---

## 7. Duplicate Account Aliasing

### Description

When an instruction accepts multiple accounts of the same type (e.g., two token accounts for a transfer), an attacker can pass the same account address for both. This can cause self-referential operations with unexpected results.

### Risk Level: **High**

### Anchor Pattern

```rust
#[derive(Accounts)]
pub struct Transfer<'info> {
    #[account(
        mut,
        constraint = source.key() != destination.key() @ CustomError::DuplicateAccounts,
    )]
    pub source: Account<'info, TokenAccount>,
    #[account(mut)]
    pub destination: Account<'info, TokenAccount>,
    pub authority: Signer<'info>,
}
```

### Native Pattern

```rust
pub fn process_transfer(accounts: &[AccountInfo]) -> ProgramResult {
    let account_iter = &mut accounts.iter();
    let source = next_account_info(account_iter)?;
    let destination = next_account_info(account_iter)?;

    // CRITICAL: Check for duplicate accounts
    if source.key == destination.key {
        return Err(ProgramError::InvalidArgument);
    }

    // ... proceed with transfer
    Ok(())
}
```

### Exploit Scenario

A swap program takes `user_token_a` and `user_token_b` as inputs. The attacker passes the same token account for both. The program debits 100 from source (balance: 900) then credits 100 to destination (same account, balance: 1000). Net effect: balance unchanged, but the pool sent real tokens. The attacker repeats to drain the pool.

### Fix

- Explicitly compare keys of all same-type account pairs.
- In Anchor, use `constraint` with a custom error for clarity.
- Consider writing a helper macro for instructions with many accounts.

---

## 8. Token Account Validation

### Description

When an instruction operates on SPL token accounts, it must verify the mint, authority, and token program. Passing a token account with the wrong mint allows cross-asset exploits. Passing a token account the user doesn't control allows theft.

### Risk Level: **Critical**

### Anchor Pattern

```rust
#[derive(Accounts)]
pub struct Swap<'info> {
    #[account(
        mut,
        token::mint = token_mint,          // Verify correct mint
        token::authority = user,           // Verify user controls this account
    )]
    pub user_token_account: Account<'info, TokenAccount>,

    pub token_mint: Account<'info, Mint>,

    #[account(mut)]
    pub user: Signer<'info>,

    // Verify it's the real token program, not a fake one
    pub token_program: Program<'info, Token>,
}
```

### Native Pattern

```rust
pub fn process_swap(accounts: &[AccountInfo]) -> ProgramResult {
    let token_account_info = next_account_info(&mut accounts.iter())?;
    let mint_info = next_account_info(&mut accounts.iter())?;
    let user_info = next_account_info(&mut accounts.iter())?;
    let token_program = next_account_info(&mut accounts.iter())?;

    // Verify token program ID
    if *token_program.key != spl_token::id() {
        return Err(ProgramError::IncorrectProgramId);
    }

    // Verify token account is owned by token program
    if *token_account_info.owner != spl_token::id() {
        return Err(ProgramError::IncorrectProgramId);
    }

    // Deserialize and validate
    let token_account = TokenAccount::unpack(&token_account_info.data.borrow())?;

    // Verify mint
    if token_account.mint != *mint_info.key {
        return Err(ProgramError::InvalidAccountData);
    }

    // Verify authority
    if token_account.owner != *user_info.key {
        return Err(ProgramError::InvalidAccountData);
    }

    Ok(())
}
```

### Exploit Scenario

A lending protocol accepts collateral deposits but doesn't verify the token account's mint. The attacker creates a worthless token with the same decimal precision, deposits it as "USDC collateral," and borrows real SOL against the fake collateral. The protocol's TVL appears intact but holds worthless tokens.

### Fix

- **Anchor**: Use `token::mint` and `token::authority` constraints on every token account. Use `Program<'info, Token>` for the token program.
- **Native**: Deserialize the token account and check `mint`, `owner` (authority), and the account's `owner` field (should be `spl_token::id()`).
- For Token-2022 / Token Extensions: also verify which token program variant is expected. Use `spl_token_2022::check_spl_token_program_account` if supporting both.
