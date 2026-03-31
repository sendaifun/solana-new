# CPI & Cross-Program Security

Comprehensive reference for Cross-Program Invocation (CPI) vulnerabilities in Solana programs.

---

## 1. CPI Reentrancy

### Description

When program A calls program B via CPI, program B could call back into program A (direct reentrancy) or into program C which calls program A (indirect reentrancy). Solana's runtime **prevents direct reentrancy** — a program cannot be re-entered during its own execution in the same transaction. However, indirect reentrancy through intermediary programs is possible and can be exploited if program A's state is in an inconsistent intermediate condition between CPI calls.

### Risk Level: **High**

### Anchor Pattern

```rust
// VULNERABLE: State is modified after CPI, creating a window for manipulation
pub fn process_reward(ctx: Context<ProcessReward>) -> Result<()> {
    let reward_amount = ctx.accounts.user_state.pending_rewards;

    // CPI: transfer rewards to user
    // If the receiving program is malicious, it executes during this CPI
    let cpi_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        Transfer {
            from: ctx.accounts.vault.to_account_info(),
            to: ctx.accounts.user_token.to_account_info(),
            authority: ctx.accounts.vault_authority.to_account_info(),
        },
        &[&vault_seeds],
    );
    token::transfer(cpi_ctx, reward_amount)?;

    // State update AFTER CPI — too late if intermediate program read stale state
    ctx.accounts.user_state.pending_rewards = 0;

    Ok(())
}

// SAFE: Update state BEFORE CPI (checks-effects-interactions pattern)
pub fn process_reward(ctx: Context<ProcessReward>) -> Result<()> {
    let reward_amount = ctx.accounts.user_state.pending_rewards;

    // Effects: update state BEFORE interactions
    ctx.accounts.user_state.pending_rewards = 0;

    // Interactions: CPI after state is consistent
    let cpi_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        Transfer {
            from: ctx.accounts.vault.to_account_info(),
            to: ctx.accounts.user_token.to_account_info(),
            authority: ctx.accounts.vault_authority.to_account_info(),
        },
        &[&vault_seeds],
    );
    token::transfer(cpi_ctx, reward_amount)?;

    Ok(())
}
```

### Native Pattern

```rust
// SAFE: Checks-effects-interactions
pub fn process_reward(program_id: &Pubkey, accounts: &[AccountInfo]) -> ProgramResult {
    let user_state_info = next_account_info(&mut accounts.iter())?;

    // Checks
    let mut user_state = UserState::try_from_slice(&user_state_info.data.borrow())?;
    let reward_amount = user_state.pending_rewards;
    require!(reward_amount > 0, CustomError::NoRewards);

    // Effects: zero out rewards BEFORE CPI
    user_state.pending_rewards = 0;
    user_state.serialize(&mut &mut user_state_info.data.borrow_mut()[..])?;

    // Interactions: CPI transfer
    invoke_signed(
        &spl_token::instruction::transfer(/* ... */)?,
        &[/* accounts */],
        &[&[/* seeds */]],
    )?;

    Ok(())
}
```

### Exploit Scenario

A reward distribution program checks `pending_rewards`, performs a CPI transfer to a token account, then zeros `pending_rewards`. The transfer goes to a token account owned by a malicious program. During CPI execution, the malicious program reads the user state (still showing non-zero pending_rewards) from another instruction in the same transaction and triggers a second claim. The attacker collects rewards twice.

### Fix

- Follow the **checks-effects-interactions** pattern: validate inputs, update state, then perform CPI.
- Serialize updated state to the account before any CPI call.
- Use reentrancy guards (a boolean flag set before CPI, cleared after) as defense-in-depth.
- Be aware that while Solana prevents same-program direct reentrancy, cross-program indirect paths remain a risk vector.

---

## 2. PDA Authority Minimization

### Description

PDAs can sign CPIs on behalf of the program. If a single PDA has authority over multiple sensitive accounts (e.g., the token vault, the config, and the fee collector), compromising one instruction that uses that PDA gives the attacker broad powers. Following the principle of least privilege, each PDA should have authority over only what it needs.

### Risk Level: **Medium**

### Vulnerable Pattern

```rust
// UNSAFE: One PDA controls everything
// seeds = [b"authority"]
// This PDA is the vault authority, config authority, and fee collector authority.
// Any instruction that invokes this PDA has access to ALL resources.
```

### Safe Pattern

```rust
// SAFE: Separate PDAs for separate responsibilities
#[account(
    seeds = [b"vault_authority", pool.key().as_ref()],
    bump = pool.vault_authority_bump,
)]
pub vault_authority: UncheckedAccount<'info>,  // Only signs for vault operations

#[account(
    seeds = [b"config_authority"],
    bump = config.authority_bump,
)]
pub config_authority: UncheckedAccount<'info>,  // Only signs for config updates

#[account(
    seeds = [b"fee_authority", pool.key().as_ref()],
    bump = pool.fee_authority_bump,
)]
pub fee_authority: UncheckedAccount<'info>,  // Only signs for fee collection
```

### Exploit Scenario

A DEX uses a single PDA `[b"authority"]` as the authority for all pool token accounts, the protocol fee account, and the admin config. A vulnerability in the `collect_fees` instruction lets an attacker invoke this PDA. Because the same PDA controls the pool vaults, the attacker can drain all liquidity pools, not just the fee account.

### Fix

- Derive separate PDAs for separate responsibilities: vault authority, config authority, fee authority.
- Include relevant context in seeds (e.g., pool address) to scope PDA authority to specific resources.
- Audit every instruction that uses a PDA signer to ensure it only accesses accounts appropriate for that PDA's role.

---

## 3. CPI Signer Seed Validation

### Description

When using `invoke_signed`, the seeds provided must derive exactly the expected PDA. If any seed component comes from untrusted input (user-provided bump, unsanitized string), an attacker can craft seeds that derive a different PDA — potentially one that is uninitialized or controlled by the attacker.

### Risk Level: **Critical**

### Vulnerable Code

```rust
// UNSAFE: Bump comes from instruction data, not stored state
pub fn withdraw(
    ctx: Context<Withdraw>,
    amount: u64,
    bump: u8,  // User-provided bump — NEVER TRUST THIS
) -> Result<()> {
    let seeds = &[b"vault", ctx.accounts.user.key.as_ref(), &[bump]];

    // If bump != canonical bump, this derives a DIFFERENT address
    invoke_signed(
        &transfer_instruction,
        &[/* accounts */],
        &[seeds],
    )?;
    Ok(())
}
```

### Fixed Code

```rust
// SAFE: Bump is stored on-chain during initialization
pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
    let vault = &ctx.accounts.vault;

    // Use the canonical bump stored at init time
    let seeds = &[
        b"vault",
        vault.owner.as_ref(),
        &[vault.bump],  // Stored on-chain, not from user input
    ];

    // Re-derive to verify (belt and suspenders)
    let (expected_pda, _) = Pubkey::find_program_address(
        &[b"vault", vault.owner.as_ref()],
        ctx.program_id,
    );
    require!(
        expected_pda == vault.key(),
        CustomError::InvalidPDA
    );

    invoke_signed(
        &transfer_instruction,
        &[/* accounts */],
        &[seeds],
    )?;
    Ok(())
}
```

### Anchor Pattern (Automatic)

```rust
// Anchor handles bump validation automatically with seeds + bump constraints
#[account(
    seeds = [b"vault", user.key().as_ref()],
    bump = vault.bump,  // Anchor verifies the PDA matches
)]
pub vault: Account<'info, Vault>,
```

### Exploit Scenario

A program accepts `bump` as an instruction argument for `invoke_signed`. The attacker provides bump = 254 (non-canonical). This derives a PDA at a different address that has never been initialized. The program's checks against the "vault" account pass because the uninitialized account has default/zero values. The attacker then uses the PDA's signing authority to drain the real vault via CPI.

### Fix

- Never accept bump as user input for PDA signing.
- Store the canonical bump in the PDA account during initialization.
- Use `find_program_address` during init to get the canonical bump.
- In subsequent instructions, read the bump from on-chain state.
- Anchor's `seeds` + `bump` constraints automate this entirely.

---

## 4. Cross-Program Account Confusion

### Description

An account that is valid in one program's context may have entirely different semantics when passed to another program via CPI. For example, a data account in program A might look like a valid token account to program B if the data layout happens to overlap.

### Risk Level: **High**

### Vulnerable Code

```rust
// UNSAFE: Passing accounts to CPI without verifying they match the target program's expectations
pub fn process_with_cpi(accounts: &[AccountInfo]) -> ProgramResult {
    let mysterious_account = next_account_info(&mut accounts.iter())?;
    let target_program = next_account_info(&mut accounts.iter())?;

    // No validation that mysterious_account is the right type for target_program
    invoke(
        &Instruction {
            program_id: *target_program.key,
            accounts: vec![AccountMeta::new(*mysterious_account.key, false)],
            data: vec![/* instruction data */],
        },
        &[mysterious_account.clone()],
    )?;
    Ok(())
}
```

### Fixed Code

```rust
// SAFE: Validate account properties before CPI
pub fn process_with_cpi(accounts: &[AccountInfo]) -> ProgramResult {
    let token_account_info = next_account_info(&mut accounts.iter())?;
    let token_program = next_account_info(&mut accounts.iter())?;

    // Verify the program we're calling
    require!(
        *token_program.key == spl_token::id(),
        ProgramError::IncorrectProgramId
    );

    // Verify the account is owned by the expected program
    require!(
        *token_account_info.owner == spl_token::id(),
        ProgramError::IncorrectProgramId
    );

    // Deserialize to confirm it's actually a token account
    let token_account = TokenAccount::unpack(&token_account_info.data.borrow())?;

    // Validate relevant fields
    require!(
        token_account.mint == expected_mint,
        CustomError::WrongMint
    );

    invoke(
        &spl_token::instruction::transfer(/* validated params */),
        &[/* validated accounts */],
    )?;
    Ok(())
}
```

### Exploit Scenario

A bridge program takes a "destination account" and performs a CPI transfer into it. The attacker passes a PDA that their malicious program owns, formatted to look like a token account. The bridge's CPI to the token program fails, but a different CPI path succeeds using the attacker's program. The bridge marks the transfer as complete, and the attacker claims funds on the other chain without a valid deposit.

### Fix

- Verify `account.owner` matches the expected program before every CPI.
- Deserialize accounts to confirm their type before passing them to CPI.
- Validate all semantically relevant fields (mint, authority, state).
- In Anchor, use typed account wrappers that enforce ownership and deserialization.

---

## 5. Program ID Validation in CPI

### Description

When performing a CPI, the program being invoked must be validated. If an attacker can substitute a malicious program in place of the expected one (e.g., a fake Token Program), they can execute arbitrary logic while the calling program believes a legitimate operation occurred.

### Risk Level: **Critical**

### Anchor Pattern

```rust
#[derive(Accounts)]
pub struct SwapTokens<'info> {
    // Program<'info, Token> validates that this is the real Token Program
    pub token_program: Program<'info, Token>,

    // For system program
    pub system_program: Program<'info, System>,

    // For a specific third-party program
    /// CHECK: Validated by constraint
    #[account(constraint = amm_program.key() == amm::ID)]
    pub amm_program: UncheckedAccount<'info>,
}
```

### Native Pattern

```rust
pub fn process_swap(accounts: &[AccountInfo]) -> ProgramResult {
    let token_program = next_account_info(&mut accounts.iter())?;

    // CRITICAL: Verify program ID before CPI
    if *token_program.key != spl_token::id() {
        return Err(ProgramError::IncorrectProgramId);
    }

    // Now safe to invoke
    invoke(
        &spl_token::instruction::transfer(/* ... */)?,
        &[/* ... */],
    )?;

    Ok(())
}
```

### Vulnerable Code

```rust
// UNSAFE: No program ID check — uses whatever program the caller passes
pub fn process_swap(accounts: &[AccountInfo]) -> ProgramResult {
    let token_program = next_account_info(&mut accounts.iter())?;

    // Attacker passes their own program here
    invoke(
        &Instruction {
            program_id: *token_program.key,  // Could be anything!
            accounts: vec![/* ... */],
            data: vec![/* ... */],
        },
        &[/* ... */],
    )?;

    Ok(())
}
```

### Exploit Scenario

A vault program performs a token transfer via CPI, but doesn't verify the token program ID. The attacker passes a malicious program that has the same instruction interface as SPL Token. The malicious program's `transfer` instruction is a no-op — it doesn't actually move tokens. The vault program believes the transfer succeeded, credits the attacker's balance, and the attacker withdraws real tokens from the other side.

### Fix

- **Anchor**: Use `Program<'info, Token>` for all standard program accounts. For custom programs, use `constraint` to verify the key.
- **Native**: Compare `*program_info.key == expected_program_id` before every `invoke` / `invoke_signed`.
- Hardcode expected program IDs as constants. Never derive them from user input.

---

## 6. Privilege Escalation via CPI

### Description

When a PDA in program A signs a CPI to program B, program B gains the PDA's signing authority for that instruction. If program B is not validated (see section 5), an attacker can deploy a malicious program B that abuses the PDA's authority — for example, using it to sign transfers from accounts the PDA controls.

### Risk Level: **Critical**

### Vulnerable Pattern

```rust
// UNSAFE: PDA signs CPI to an unvalidated program
pub fn process_action(accounts: &[AccountInfo]) -> ProgramResult {
    let pda_authority = next_account_info(&mut accounts.iter())?;
    let target_program = next_account_info(&mut accounts.iter())?;
    // target_program is NOT validated!

    let seeds = &[b"authority", &[bump]];

    // The PDA signs whatever the target_program wants to do
    invoke_signed(
        &Instruction {
            program_id: *target_program.key,  // Attacker's program
            accounts: vec![
                AccountMeta::new(*pda_authority.key, true),  // PDA as signer
                // ... other accounts the attacker controls
            ],
            data: vec![/* attacker-controlled data */],
        },
        &[pda_authority.clone()],
        &[seeds],
    )?;

    Ok(())
}
```

### Safe Pattern

```rust
// SAFE: Validate target program before PDA-signed CPI
pub fn process_action(accounts: &[AccountInfo]) -> ProgramResult {
    let pda_authority = next_account_info(&mut accounts.iter())?;
    let target_program = next_account_info(&mut accounts.iter())?;

    // Whitelist of allowed CPI targets
    const ALLOWED_PROGRAMS: &[Pubkey] = &[
        spl_token::id(),
        spl_associated_token_account::id(),
    ];

    if !ALLOWED_PROGRAMS.contains(target_program.key) {
        return Err(ProgramError::IncorrectProgramId);
    }

    let seeds = &[b"authority", &[bump]];

    invoke_signed(
        &spl_token::instruction::transfer(/* ... */)?,
        &[/* ... */],
        &[seeds],
    )?;

    Ok(())
}
```

### Exploit Scenario

Program A has a "compose" instruction that lets users specify a target program for a CPI. Program A's PDA signs the CPI. An attacker deploys program B whose "transfer" instruction takes the PDA signer and uses it to sign a token transfer from the PDA's token account to the attacker's wallet. The attacker calls program A's compose instruction targeting program B, and the PDA unwittingly signs away its tokens.

### Fix

- Validate every CPI target program ID against a hardcoded whitelist.
- Never allow user-specified program IDs for PDA-signed CPIs.
- Scope PDA authority — use separate PDAs with separate seeds for different CPI targets.
- In Anchor, use typed `Program<'info, T>` accounts for all CPI targets.

---

## 7. Anchor CpiContext Patterns

### Description

Anchor provides `CpiContext` for safe CPI construction. However, common mistakes in setting up the context can introduce vulnerabilities: wrong accounts, missing signer seeds, or mishandled remaining accounts.

### Risk Level: **High** (when misused)

### Standard CPI with CpiContext

```rust
// Token transfer from a user-owned account (user signs)
pub fn transfer_from_user(ctx: Context<UserTransfer>, amount: u64) -> Result<()> {
    let cpi_ctx = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        Transfer {
            from: ctx.accounts.user_token.to_account_info(),
            to: ctx.accounts.vault_token.to_account_info(),
            authority: ctx.accounts.user.to_account_info(),  // User is the signer
        },
    );
    token::transfer(cpi_ctx, amount)?;
    Ok(())
}
```

### PDA-Signed CPI with CpiContext

```rust
// Token transfer from a PDA-owned account (PDA signs)
pub fn transfer_from_vault(ctx: Context<VaultTransfer>, amount: u64) -> Result<()> {
    let pool_key = ctx.accounts.pool.key();
    let seeds = &[
        b"vault_authority",
        pool_key.as_ref(),
        &[ctx.accounts.pool.vault_bump],
    ];

    let cpi_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        Transfer {
            from: ctx.accounts.vault_token.to_account_info(),
            to: ctx.accounts.user_token.to_account_info(),
            authority: ctx.accounts.vault_authority.to_account_info(),
        },
        &[seeds],  // PDA signer seeds
    );
    token::transfer(cpi_ctx, amount)?;
    Ok(())
}
```

### Common Mistake: Wrong Authority

```rust
// BUG: authority should be vault_authority PDA, not user
let cpi_ctx = CpiContext::new_with_signer(
    ctx.accounts.token_program.to_account_info(),
    Transfer {
        from: ctx.accounts.vault_token.to_account_info(),
        to: ctx.accounts.user_token.to_account_info(),
        authority: ctx.accounts.user.to_account_info(),  // WRONG: user can't sign for vault
    },
    &[seeds],
);
// This will fail at runtime, but if the vault token account's authority
// is mistakenly set to the user, it becomes a vulnerability.
```

### Common Mistake: Missing Seeds

```rust
// BUG: Using CpiContext::new instead of new_with_signer for PDA
let cpi_ctx = CpiContext::new(  // Should be new_with_signer!
    ctx.accounts.token_program.to_account_info(),
    Transfer {
        from: ctx.accounts.vault_token.to_account_info(),
        to: ctx.accounts.user_token.to_account_info(),
        authority: ctx.accounts.vault_authority.to_account_info(),
    },
);
// Runtime error: vault_authority is a PDA and hasn't signed the transaction
```

### Common Mistake: Stale Seeds After State Change

```rust
// BUG: Seeds reference state that was modified before CPI
pub fn update_and_transfer(ctx: Context<UpdateTransfer>, new_bump: u8, amount: u64) -> Result<()> {
    // State modified
    ctx.accounts.pool.vault_bump = new_bump;

    // Seeds use the NEW bump, but the PDA was derived with the OLD bump
    let seeds = &[
        b"vault",
        ctx.accounts.pool.key().as_ref(),
        &[ctx.accounts.pool.vault_bump],  // Uses new_bump — wrong PDA!
    ];

    let cpi_ctx = CpiContext::new_with_signer(/* ... */);
    token::transfer(cpi_ctx, amount)?;
    Ok(())
}
```

### Remaining Accounts in CPI

```rust
// When you need to pass additional accounts through CPI
pub fn compound_action(ctx: Context<Compound>) -> Result<()> {
    let cpi_ctx = CpiContext::new(
        ctx.accounts.target_program.to_account_info(),
        TargetInstruction {
            // standard accounts
        },
    )
    // Append remaining_accounts for programs that need dynamic account lists
    .with_remaining_accounts(ctx.remaining_accounts.to_vec());

    target_program::compound(cpi_ctx)?;
    Ok(())
}
```

**Warning**: `remaining_accounts` are untyped and unvalidated by Anchor. Any account in `remaining_accounts` must be manually validated before use. Treat them as untrusted input.

### Exploit Scenario

A protocol uses `CpiContext::new` (no signer) for a transfer from a PDA vault, but the vault's token authority was accidentally set to a user-provided account during initialization (instead of the PDA). The user calls withdraw, and since they are the token authority, the transfer succeeds without PDA signing. Any user who was set as authority can drain the vault.

### Fix

- Use `CpiContext::new` for user-signed CPIs, `CpiContext::new_with_signer` for PDA-signed CPIs. Never confuse them.
- Double-check that the `authority` in the CPI context matches the actual authority of the account being operated on.
- Store PDA bumps at init time and reference them from on-chain state — never compute them inline.
- Validate all `remaining_accounts` manually — check ownership, type, and expected keys.
- When building CPI instructions manually (not using Anchor's typed CPI), verify that the `program_id` in the `Instruction` struct matches the expected program.
