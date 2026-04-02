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
use anchor_spl::token::{self, Token, TokenAccount, Mint};

// Key types
let key: Pubkey = ctx.accounts.signer.key();
let system: Pubkey = anchor_lang::system_program::ID;
let token_program: Pubkey = anchor_spl::token::ID;
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
let cpi_accounts = Transfer {
    from: ctx.accounts.from.to_account_info(),
    to: ctx.accounts.to.to_account_info(),
    authority: ctx.accounts.signer.to_account_info(),
};
let cpi_ctx = CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_accounts);
token::transfer(cpi_ctx, amount)?;
```

### Invoke Signed (PDA as signer)

```rust
let seeds = &[b"vault", user.key().as_ref(), &[bump]];
let signer_seeds = &[&seeds[..]];
let cpi_ctx = CpiContext::new_with_signer(
    ctx.accounts.token_program.to_account_info(),
    cpi_accounts,
    signer_seeds,
);
token::transfer(cpi_ctx, amount)?;
```

## SPL Token Operations

```rust
// Mint tokens
token::mint_to(cpi_ctx, amount)?;

// Transfer tokens
token::transfer(cpi_ctx, amount)?;

// Burn tokens
token::burn(cpi_ctx, amount)?;

// Approve delegate
token::approve(cpi_ctx, amount)?;
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

### Bankrun (Rust)

```rust
#[tokio::test]
async fn test_initialize() {
    let mut context = ProgramTest::new("my_program", id(), None)
        .start_with_context()
        .await;
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
