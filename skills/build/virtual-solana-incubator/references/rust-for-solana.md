# Rust Patterns for Solana Program Development

## Program Module Structure

Every Anchor program follows this structure:

```rust
use anchor_lang::prelude::*;

declare_id!("YourProgramID11111111111111111111111111111");

#[program]
pub mod my_program {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, param: u64) -> Result<()> {
        let account = &mut ctx.accounts.my_account;
        account.value = param;
        account.authority = ctx.accounts.signer.key();
        Ok(())
    }
}
```

The `#[program]` macro generates the instruction dispatcher. Each public function becomes an instruction.

## Account Serialization

### Borsh (default)

```rust
#[account]
pub struct MyAccount {
    pub authority: Pubkey,   // 32 bytes
    pub value: u64,          // 8 bytes
    pub bump: u8,            // 1 byte
}
// Space: 8 (discriminator) + 32 + 8 + 1 = 49 bytes
```

The `#[account]` macro derives `BorshSerialize`, `BorshDeserialize`, and adds an 8-byte discriminator.

### Zero-Copy (for large accounts)

```rust
#[account(zero_copy)]
#[repr(C)]
pub struct LargeAccount {
    pub data: [u64; 1000],
}
```

Zero-copy avoids serialization overhead — the account data is accessed directly as a memory-mapped struct. Use when accounts exceed ~1KB.

## Error Handling

```rust
#[error_code]
pub enum MyError {
    #[msg("Value exceeds maximum allowed")]
    ValueTooLarge,
    #[msg("Unauthorized access attempt")]
    Unauthorized,
    #[msg("Account already initialized")]
    AlreadyInitialized,
}
```

Return errors with: `return err!(MyError::ValueTooLarge);` or `require!(value <= MAX, MyError::ValueTooLarge);`

Anchor errors encode as `6000 + variant_index`. Custom `ProgramError` codes start at offset `0`.

## Common Types

```rust
use anchor_lang::prelude::*;
use anchor_spl::token_interface::{self, Mint, TokenAccount, TokenInterface};

// Key types
let key: Pubkey = ctx.accounts.signer.key();
let system: Pubkey = anchor_lang::system_program::ID;

// Works with either the classic SPL Token program or Token-2022
let token_program: Pubkey = ctx.accounts.token_program.key();
```

## Derive Accounts

The `#[derive(Accounts)]` struct defines what accounts an instruction expects:

```rust
#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
        init,
        payer = signer,
        space = 8 + 32 + 8 + 1,
        seeds = [b"vault", signer.key().as_ref()],
        bump
    )]
    pub vault: Account<'info, VaultAccount>,

    pub system_program: Program<'info, System>,
}
```

## Constraint Macros

### Init and Space

```rust
#[account(init, payer = signer, space = 8 + std::mem::size_of::<MyAccount>())]
```

### Mutable

```rust
#[account(mut)]  // Account will be modified
```

### Seeds and Bump (PDA)

```rust
#[account(seeds = [b"config"], bump)]             // Verification only
#[account(seeds = [b"vault", user.key().as_ref()], bump = vault.bump)]  // With stored bump
```

### Has One (ownership check)

```rust
#[account(has_one = authority)]  // vault.authority == authority.key()
```

### Constraint (custom validation)

```rust
#[account(constraint = clock.slot > vault.unlock_slot @ MyError::TooEarly)]
```

### Close (reclaim rent)

```rust
#[account(mut, close = recipient)]  // Close account, send lamports to recipient
```

## Cross-Program Invocation (CPI)

### Direct Invoke

```rust
let decimals = ctx.accounts.mint.decimals;

let cpi_accounts = token_interface::TransferChecked {
    mint: ctx.accounts.mint.to_account_info(),
    from: ctx.accounts.from.to_account_info(),
    to: ctx.accounts.to.to_account_info(),
    authority: ctx.accounts.signer.to_account_info(),
};

let cpi_ctx = CpiContext::new(
    ctx.accounts.token_program.to_account_info(),
    cpi_accounts,
);

token_interface::transfer_checked(cpi_ctx, amount, decimals)?;
```

### Invoke Signed (PDA as signer)

```rust
let decimals = ctx.accounts.mint.decimals;
let seeds = &[b"vault", user.key().as_ref(), &[bump]];
let signer_seeds = &[&seeds[..]];

let cpi_accounts = token_interface::TransferChecked {
    mint: ctx.accounts.mint.to_account_info(),
    from: ctx.accounts.from.to_account_info(),
    to: ctx.accounts.to.to_account_info(),
    authority: ctx.accounts.vault_authority.to_account_info(),
};

let cpi_ctx = CpiContext::new_with_signer(
    ctx.accounts.token_program.to_account_info(),
    cpi_accounts,
    signer_seeds,
);

token_interface::transfer_checked(cpi_ctx, amount, decimals)?;
```

## SPL Token Operations

Prefer `anchor_spl::token_interface` in new teaching material. It supports both the classic SPL Token program and Token-2022, and `transfer_checked` is the current default teaching pattern for transfers.

```rust
// Mint tokens
token_interface::mint_to(cpi_ctx, amount)?;

// Transfer tokens (preferred teaching pattern)
token_interface::transfer_checked(cpi_ctx, amount, decimals)?;

// Burn tokens
token_interface::burn(cpi_ctx, amount)?;

// Approve delegate
token_interface::approve(cpi_ctx, amount)?;
```

## Testing Patterns

### Anchor Test (TypeScript)

```typescript
import * as anchor from "@coral-xyz/anchor";

describe("my-program", () => {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    const program = anchor.workspace.MyProgram;

    it("initializes", async () => {
        const tx = await program.methods
            .initialize(new anchor.BN(42))
            .accounts({ signer: provider.wallet.publicKey })
            .rpc();
    });
});
```

### LiteSVM (Rust)

```rust
use litesvm::LiteSVM;

#[test]
fn test_initialize() {
    let mut svm = LiteSVM::new();
    svm.add_program_from_file(program_id, "target/deploy/my_program.so");

    let user = Keypair::new();
    svm.airdrop(&user.pubkey(), 1_000_000_000).unwrap();
    // ... build and send transaction
}
```

## Common Rust Gotchas in Solana

### Ownership in Account Contexts
Account references are borrowed from the `Context`. You cannot move them out. Always use references or `.to_account_info()` for copies.

### Mutable Borrows
You cannot have two mutable references to the same account. If you need to modify two accounts, use separate scopes or destructure.

### Stack Size
The BPF stack is limited to 4KB. Large structs on the stack will cause "access violation" errors. Use `Box<Account<'info, T>>` for large accounts in your Accounts struct.

### Integer Overflow
Rust panics on overflow in debug mode but wraps in release. Use `checked_add`, `checked_sub`, `checked_mul` for arithmetic that could overflow. This is a common security issue.

### String and Vec in Accounts
Strings and Vecs are dynamically sized. You must pre-allocate space: `4 + (max_length * item_size)`. The 4 bytes store the length prefix.

## Sources

- [Anchor Docs — Transfer Tokens](https://www.anchor-lang.com/docs/tokens/basics/transfer-tokens)
- [Anchor Docs — Create Token Account](https://www.anchor-lang.com/docs/tokens/basics/create-token-account)
- [Anchor Docs — Mint Tokens](https://www.anchor-lang.com/docs/tokens/basics/mint-tokens)
- [Anchor Docs — Account Types](https://www.anchor-lang.com/docs/references/account-types)
- [Anchor SPL source — token_interface.rs](https://github.com/solana-foundation/anchor/blob/master/spl/src/token_interface.rs)
- [Anchor source — InterfaceAccount](https://github.com/solana-foundation/anchor/blob/master/lang/src/accounts/interface_account.rs)
