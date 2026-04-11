# PDA and CPI Patterns

## PDA Derivation

A Program Derived Address (PDA) is a public key that is deterministically derived from seeds and a program ID, guaranteed to not be on the Ed25519 curve (so no private key exists).

### How It Works

```rust
// Off-chain (TypeScript)
const [pda, bump] = PublicKey.findProgramAddressSync(
    [Buffer.from("vault"), user.toBuffer()],
    programId
);

// On-chain (Rust / Anchor)
// Anchor does this automatically with seeds/bump constraints
#[account(seeds = [b"vault", user.key().as_ref()], bump)]
pub vault: Account<'info, Vault>,
```

`findProgramAddress` iterates bump from 255 down to 0 until it finds a value that produces an off-curve point. The first valid bump is the **canonical bump**.

### Always Use Canonical Bumps

Store the bump in the account data on init. Re-derive using the stored bump on subsequent calls. This avoids wasting compute units re-deriving and prevents bump manipulation attacks.

```rust
#[account]
pub struct Vault {
    pub authority: Pubkey,
    pub bump: u8,
}
```

## When to Use PDAs

| Pattern | Seeds | Purpose |
|---------|-------|---------|
| User vault | `[b"vault", user.key()]` | Per-user state or token storage |
| Global config | `[b"config"]` | Singleton program configuration |
| Token account | `[b"token", mint.key(), user.key()]` | Associated token storage owned by program |
| Order/position | `[b"order", user.key(), &order_id.to_le_bytes()]` | Indexed records per user |
| Pool | `[b"pool", token_a.key(), token_b.key()]` | Deterministic pair addressing |
| Metaplex metadata | `[b"metadata", mpl_token_metadata::ID.as_ref(), mint.key().as_ref()]` | Metadata PDA for a mint under the Metaplex Token Metadata program |
| Authority | `[b"authority"]` | Program-owned signer for CPIs |

Note: This PDA is derived by the Metaplex Token Metadata program, not by your program. In Umi/JS, prefer `findMetadataPda(context, { mint })`. A master edition PDA adds a trailing `b"edition"` seed.

## PDA as Signer

PDAs can sign CPIs using `invoke_signed`. The program provides the seeds and bump, and the runtime verifies the derivation.

```rust
pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
    let seeds = &[
        b"vault",
        ctx.accounts.user.key.as_ref(),
        &[ctx.accounts.vault.bump],
    ];
    let signer_seeds = &[&seeds[..]];

    let cpi_ctx = CpiContext::new_with_signer(
        ctx.accounts.system_program.to_account_info(),
        Transfer {
            from: ctx.accounts.vault.to_account_info(),
            to: ctx.accounts.user.to_account_info(),
        },
        signer_seeds,
    );
    anchor_lang::system_program::transfer(cpi_ctx, amount)?;
    Ok(())
}
```

## Common PDA Patterns in Detail

### User Vault (SOL)

```rust
#[derive(Accounts)]
pub struct CreateVault<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(
        init,
        payer = user,
        space = 8 + 32 + 8 + 1,
        seeds = [b"vault", user.key().as_ref()],
        bump
    )]
    pub vault: Account<'info, Vault>,
    pub system_program: Program<'info, System>,
}
```

### Global Config (Singleton)

```rust
#[derive(Accounts)]
pub struct InitConfig<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,
    #[account(
        init,
        payer = admin,
        space = 8 + 32 + 8 + 1,
        seeds = [b"config"],
        bump
    )]
    pub config: Account<'info, Config>,
    pub system_program: Program<'info, System>,
}
```

### Token Account Owned by PDA

```rust
use anchor_spl::token_interface::{Mint, TokenAccount, TokenInterface};

#[account(
    init,
    payer = user,
    token::mint = mint,
    token::authority = vault_authority,
    token::token_program = token_program,
    seeds = [b"token", mint.key().as_ref(), user.key().as_ref()],
    bump
)]
pub token_account: InterfaceAccount<'info, TokenAccount>;

#[account(seeds = [b"authority"], bump)]
/// CHECK: PDA used only as the token authority signer
pub vault_authority: UncheckedAccount<'info>;

pub mint: InterfaceAccount<'info, Mint>;
pub token_program: Interface<'info, TokenInterface>;
```

## CPI Patterns

### Transfer SOL via System Program

```rust
let cpi_ctx = CpiContext::new(
    ctx.accounts.system_program.to_account_info(),
    anchor_lang::system_program::Transfer {
        from: ctx.accounts.payer.to_account_info(),
        to: ctx.accounts.recipient.to_account_info(),
    },
);
anchor_lang::system_program::transfer(cpi_ctx, lamports)?;
```

### Transfer Tokens via Token Program

```rust
let decimals = ctx.accounts.mint.decimals;

let cpi_accounts = token_interface::TransferChecked {
    mint: ctx.accounts.mint.to_account_info(),
    from: ctx.accounts.source.to_account_info(),
    to: ctx.accounts.destination.to_account_info(),
    authority: ctx.accounts.owner.to_account_info(),
};

let cpi_ctx = CpiContext::new(
    ctx.accounts.token_program.to_account_info(),
    cpi_accounts,
);

token_interface::transfer_checked(cpi_ctx, amount, decimals)?;
```

### Mint Tokens with PDA Authority

```rust
let seeds = &[b"mint_authority", &[bump]];
let signer_seeds = &[&seeds[..]];

let cpi_accounts = token_interface::MintTo {
    mint: ctx.accounts.mint.to_account_info(),
    to: ctx.accounts.destination.to_account_info(),
    authority: ctx.accounts.mint_authority.to_account_info(),
};

let cpi_ctx = CpiContext::new_with_signer(
    ctx.accounts.token_program.to_account_info(),
    cpi_accounts,
    signer_seeds,
);

token_interface::mint_to(cpi_ctx, amount)?;
```

### Close Account and Reclaim Rent

```rust
// Using Anchor's close constraint:
#[account(mut, close = recipient, has_one = authority)]
pub account_to_close: Account<'info, MyAccount>,

// Or manually via CPI:
let dest_starting_lamports = recipient.lamports();
**recipient.lamports.borrow_mut() = dest_starting_lamports
    .checked_add(account_to_close.to_account_info().lamports())
    .unwrap();
**account_to_close.to_account_info().lamports.borrow_mut() = 0;
account_to_close.to_account_info().data.borrow_mut().fill(0);
```

## Security Considerations

### PDA Collision Avoidance
Always include enough seeds to make PDAs unique. Using just `[b"vault"]` means there is only one vault globally. Add user keys, mint keys, or counters to seeds.

### Canonical Bumps
Always store and reuse the canonical bump (the first bump found by `findProgramAddress`). Never accept a user-provided bump without verification.

### Account Ownership Checks
Anchor's `Account<'info, T>` type automatically checks that the account is owned by the expected program and has the correct discriminator. Raw accounts (`UncheckedAccount`) do not have these checks — use `/// CHECK:` comments to document why.

### Signer Checks
Always verify that the correct party signed the transaction. Anchor's `Signer<'info>` type enforces this. For PDAs, `has_one` constraints verify that the account's stored authority matches the provided signer.

### Re-entrancy in CPIs
Solana's runtime prevents direct re-entrancy (a program cannot CPI back into itself). However, indirect re-entrancy through intermediate programs is possible. Be cautious with state changes after CPIs.

## Real-World Examples

- **Jupiter**: Uses PDAs for route caching, user-specific limit orders, and DCA positions. Seeds include user key + position index for multiple positions per user.
- **Orca Whirlpool**: Pool PDAs derived from token pair mints. Tick array PDAs derived from pool + tick index. Position PDAs from pool + lower/upper tick.
- **Drift**: Uses PDAs for user accounts and sub-accounts; for example, user account addresses are derived from seeds including `"user"`, the authority pubkey, and a sub-account index. Useful as an architectural example of multi-account-per-user design. Drift was exploited in April 2026 via a social-engineering incident and is currently paused; that status note is operational, not a comment on the PDA design pattern itself. Treat it as a design reference only and revalidate current protocol status before any integration work.

## Sources

- [Anchor Docs — Transfer Tokens](https://www.anchor-lang.com/docs/tokens/basics/transfer-tokens)
- [Metaplex Token Metadata source — PDA helpers](https://github.com/metaplex-foundation/mpl-token-metadata/blob/main/programs/token-metadata/program/src/pda.rs)
- [Metaplex JS client — findMetadataPda](https://github.com/metaplex-foundation/mpl-token-metadata/blob/main/clients/js/src/generated/accounts/metadata.ts)
- [Drift Protocol Docs](https://docs.drift.trade)
- [Drift protocol-v2 repo](https://github.com/drift-labs/protocol-v2)
