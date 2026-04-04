# Solana Contract-Level Developer Reference

> Reference document for superstack skills. Last updated: April 2026.

---

## Overview

This document covers everything a developer needs to understand to write, deploy, and test Solana programs. It assumes familiarity with programming but not with Solana or blockchain development.

---

## Accounts: Everything Is an Account

On Solana, **everything is an account**. Programs, token balances, NFT metadata, user data -- all stored in accounts. This is the most fundamental concept.

### Account Structure

Every account has the same structure:

| Field | Type | Description |
|-------|------|-------------|
| `lamports` | u64 | Balance in lamports (1 SOL = 1,000,000,000 lamports) |
| `data` | byte array | Arbitrary data (empty for wallet accounts, program state for data accounts) |
| `owner` | Pubkey | The program that owns this account (controls who can modify `data`) |
| `executable` | bool | Whether this account contains executable program code |
| `rent_epoch` | u64 | The epoch at which rent is next due |

### Account Types

```
Wallet Account (System Program owned)
├── owner: System Program (11111111111111111111111111111111)
├── lamports: user's SOL balance
├── data: empty (0 bytes)
└── executable: false

Data Account (owned by a custom program)
├── owner: YourProgram's ID
├── lamports: enough for rent exemption
├── data: serialized struct (your program's state)
└── executable: false

Program Account (executable)
├── owner: BPF Loader (BPFLoaderUpgradeab1e11111111111111111111111)
├── lamports: rent-exempt amount
├── data: compiled BPF/SBF bytecode
└── executable: true
```

### Key Rules

1. **Only the owner can modify an account's `data` field** -- a program can only write to accounts it owns
2. **Anyone can credit lamports** to an account (send SOL to it)
3. **Only the owner can debit lamports** from an account
4. **The System Program owns all new accounts** by default
5. **Ownership is transferred** when a program initializes an account (the System Program assigns ownership)

### Rent and Rent-Exemption

Accounts must pay rent for the space they occupy on-chain. In practice, all accounts are **rent-exempt** by depositing a minimum balance:

```
Rent-exempt minimum = ~0.00089088 SOL per byte of data per epoch (approximately)
```

Formula: `rent_exempt_minimum = data_size * rent_rate * exemption_threshold`

For a typical account:
- **0 bytes** (wallet): ~0.00089 SOL
- **165 bytes** (token account): ~0.00204 SOL
- **8 bytes** (small counter): ~0.00095 SOL

If an account's lamport balance drops below the rent-exempt minimum, it will be garbage collected. In modern Solana development, all accounts should be rent-exempt.

```typescript
// Get rent-exempt minimum in TypeScript
const rentExempt = await connection.getMinimumBalanceForRentExemption(dataSize);
```

Source: [solana.com/docs/core/accounts](https://solana.com/docs/core/accounts)

---

## Programs: On-Chain Code

Programs are Solana's smart contracts. They are fundamentally different from EVM contracts.

### Key Characteristics

- **Stateless**: Programs contain only code, no data. All state is in separate accounts.
- **Deterministic**: Same inputs always produce the same outputs.
- **Compiled to SBF**: Solana Bytecode Format (evolved from eBPF).
- **Invoked via instructions**: Clients send instructions specifying which program to call, which accounts to pass, and what data to include.

### Important System Programs

| Program | Address | Purpose |
|---------|---------|---------|
| **System Program** | `11111111111111111111111111111111` | Create accounts, transfer SOL, assign ownership |
| **Token Program** | `TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA` | SPL Token operations (mint, transfer, burn) |
| **Token-2022 Program** | `TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb` | Extended token features (transfer fees, confidential transfers, etc.) |
| **Associated Token Account Program** | `ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL` | Deterministic token account addresses |
| **Compute Budget Program** | `ComputeBudget111111111111111111111111111111` | Set compute limits and priority fees |
| **BPF Loader** | `BPFLoaderUpgradeab1e11111111111111111111111` | Deploys and upgrades programs |

### Program Entrypoint

Every Solana program has a single entrypoint:

```rust
// Native Solana program entrypoint
use solana_program::{
    account_info::AccountInfo,
    entrypoint,
    entrypoint::ProgramResult,
    pubkey::Pubkey,
};

entrypoint!(process_instruction);

fn process_instruction(
    program_id: &Pubkey,          // This program's ID
    accounts: &[AccountInfo],      // All accounts passed to the instruction
    instruction_data: &[u8],       // Serialized instruction arguments
) -> ProgramResult {
    // Parse instruction_data to determine which operation to perform
    // Validate accounts
    // Execute logic
    // Modify account data
    Ok(())
}
```

Source: [solana.com/docs/core/programs](https://solana.com/docs/core/programs)

---

## PDAs: Program Derived Addresses

PDAs are deterministic addresses that only a specific program can sign for. They are one of Solana's most powerful primitives.

### What Is a PDA

A PDA is a public key that:
- Is **derived** from a program ID and a set of seeds
- Falls **off the Ed25519 curve** (no corresponding private key exists)
- Can only be **"signed" by the program** that derived it (via `invoke_signed`)

### How PDAs Are Created

```rust
// Finding a PDA
let (pda, bump) = Pubkey::find_program_address(
    &[
        b"user-stats",                    // static seed
        user_wallet.key.as_ref(),          // dynamic seed (user's wallet)
    ],
    program_id,
);
```

The `find_program_address` function:
1. Hashes `seeds + [bump] + program_id` using SHA-256
2. Checks if the result is on the Ed25519 curve
3. If on the curve, decrements bump (starting from 255) and tries again
4. Returns the first off-curve result and its bump

The **bump** (also called bump seed) is the value that pushes the address off the curve. The canonical bump is the highest valid value (found first).

### PDA Use Cases

| Use Case | Seeds | Purpose |
|----------|-------|---------|
| User state | `["user", user_pubkey]` | One state account per user |
| Token vault | `["vault", pool_pubkey]` | Program-controlled token account |
| Config | `["config"]` | Singleton configuration |
| Counter | `["counter", user_pubkey]` | Per-user counter |
| Order book entry | `["order", market_pubkey, order_id]` | Unique order accounts |

### PDA Signing

Programs sign for their PDAs using `invoke_signed`, passing the seeds and bump:

```rust
invoke_signed(
    &transfer_instruction,
    &[vault_account.clone(), destination.clone()],
    &[&[
        b"vault",
        pool_key.as_ref(),
        &[bump],  // the bump seed
    ]],
)?;
```

The runtime verifies that the seeds + bump + program_id produce the expected PDA. No private key is needed.

Source: [solana.com/docs/core/pda](https://solana.com/docs/core/pda)

---

## CPIs: Cross-Program Invocations

CPIs allow programs to call other programs within a single transaction. This is how composability works on Solana.

### invoke vs invoke_signed

```rust
use solana_program::program::invoke;
use solana_program::program::invoke_signed;

// invoke: call another program, passing through existing signers
invoke(
    &instruction,           // the instruction to execute
    &[account1, account2],  // accounts required by the instruction
)?;

// invoke_signed: call another program, signing with a PDA
invoke_signed(
    &instruction,
    &[pda_account, account2],
    &[&[b"seed", &[bump]]],  // PDA signer seeds
)?;
```

### Key Rules

1. **Signer privileges propagate**: If account A signed the original transaction, it is still a signer in CPIs
2. **Write privileges propagate**: If account A is writable in the outer instruction, it can be writable in CPIs
3. **PDA signing**: `invoke_signed` lets a program sign as its own PDA
4. **Depth limit**: CPI depth is limited to **4 levels**
5. **Compute budget is shared**: CPIs consume compute from the same transaction budget

### Common CPI Patterns

```rust
// Transfer SOL via System Program CPI
invoke(
    &system_instruction::transfer(from.key, to.key, lamports),
    &[from.clone(), to.clone(), system_program.clone()],
)?;

// Transfer SPL tokens via Token Program CPI
invoke(
    &spl_token::instruction::transfer(
        token_program.key,
        source_token_account.key,
        destination_token_account.key,
        authority.key,
        &[],
        amount,
    )?,
    &[source_token_account.clone(), destination_token_account.clone(), authority.clone()],
)?;

// Transfer from PDA-owned vault
invoke_signed(
    &spl_token::instruction::transfer(
        token_program.key,
        vault.key,
        destination.key,
        vault_authority.key,
        &[],
        amount,
    )?,
    &[vault.clone(), destination.clone(), vault_authority.clone()],
    &[&[b"vault-authority", &[bump]]],
)?;
```

Source: [solana.com/docs/core/cpi](https://solana.com/docs/core/cpi)

---

## Transactions

### Structure

A transaction contains one or more instructions, all of which execute atomically:

```typescript
import {
  Transaction,
  TransactionInstruction,
  SystemProgram,
  sendAndConfirmTransaction,
} from "@solana/web3.js";

const instruction = new TransactionInstruction({
  programId: myProgramId,
  keys: [
    { pubkey: userAccount, isSigner: true, isWritable: true },
    { pubkey: dataAccount, isSigner: false, isWritable: true },
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
  ],
  data: Buffer.from(serializedArgs),
});

const tx = new Transaction().add(instruction);
const sig = await sendAndConfirmTransaction(connection, tx, [wallet]);
```

### Versioned Transactions

Versioned transactions (v0) support Address Lookup Tables for referencing more accounts:

```typescript
import {
  TransactionMessage,
  VersionedTransaction,
  AddressLookupTableAccount,
} from "@solana/web3.js";

const lookupTableAccount = await connection.getAddressLookupTable(lookupTableAddress);

const messageV0 = new TransactionMessage({
  payerKey: wallet.publicKey,
  recentBlockhash: blockhash,
  instructions: [instruction1, instruction2],
}).compileToV0Message([lookupTableAccount.value]);

const tx = new VersionedTransaction(messageV0);
tx.sign([wallet]);
const sig = await connection.sendTransaction(tx);
```

### Transaction Limits

| Constraint | Limit |
|-----------|-------|
| Max size | 1,232 bytes |
| Max accounts (legacy) | 32 |
| Max accounts (v0 with ALT) | 256 |
| Blockhash expiry | ~60 seconds (~150 slots) |
| Max compute units | 1,400,000 |

Source: [solana.com/docs/core/transactions](https://solana.com/docs/core/transactions)

---

## Fees and Compute Units

### Fee Structure

```
Total fee = base fee + priority fee

base fee     = 5,000 lamports per signature (~$0.00025)
priority fee = compute_unit_price (micro-lamports) * compute_units_requested
```

### Compute Budget Program

Set compute limits and priority fees using the Compute Budget Program:

```typescript
import { ComputeBudgetProgram } from "@solana/web3.js";

// Set the compute unit limit for the transaction
const setComputeLimit = ComputeBudgetProgram.setComputeUnitLimit({
  units: 300_000,  // request 300k CU (default is 200k per instruction)
});

// Set the priority fee (micro-lamports per compute unit)
const setPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({
  microLamports: 50_000,  // 0.00005 lamports per CU
});

// Add both to your transaction BEFORE other instructions
const tx = new Transaction()
  .add(setComputeLimit)
  .add(setPriorityFee)
  .add(yourInstruction);
```

### Compute Unit Reference

| Operation | Approximate CU Cost |
|-----------|-------------------|
| Default per instruction | 200,000 |
| Max per transaction | 1,400,000 |
| SHA-256 hash | ~100 |
| Ed25519 sig verify | ~800 |
| Logging (per byte) | ~5 |
| CPI overhead | ~1,000 |
| Account creation | ~3,000-5,000 |
| SPL token transfer | ~3,000-5,000 |
| Complex DeFi swap | 100,000-400,000 |

### Optimization Tips

1. **Set compute limits accurately** -- do not leave the default if you use less. Lower CU limits mean lower priority fees.
2. **Minimize logging in production** -- `msg!()` and `sol_log` consume CU.
3. **Use `checked_` math sparingly** -- overflow checks cost CU; use them where needed for safety.
4. **Minimize account reallocations** -- resizing accounts is expensive.
5. **Batch operations** -- multiple operations in one instruction are cheaper than multiple instructions.

Source: [solana.com/docs/core/fees](https://solana.com/docs/core/fees)

---

## Anchor Framework

**Anchor** is the dominant framework for Solana development. It provides a higher-level abstraction over native Solana programming, similar to what Hardhat/Foundry provides for Ethereum.

### Why Most Devs Use Anchor

- **Automatic account validation** -- constraints declared, not hand-coded
- **Serialization/deserialization** -- Borsh serialization handled automatically
- **IDL generation** -- auto-generated Interface Description Language for client code
- **Error handling** -- typed error codes instead of raw program errors
- **Testing** -- built-in test framework with TypeScript client generation
- **Security defaults** -- owner checks, signer checks, and rent-exemption checks built in

### Core Macros

#### `#[program]` -- Define Instructions

```rust
use anchor_lang::prelude::*;

declare_id!("YourProgramId11111111111111111111111111111");

#[program]
pub mod my_program {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, name: String) -> Result<()> {
        let user_account = &mut ctx.accounts.user_account;
        user_account.name = name;
        user_account.authority = ctx.accounts.authority.key();
        user_account.bump = ctx.bumps.user_account;
        Ok(())
    }

    pub fn update(ctx: Context<Update>, new_name: String) -> Result<()> {
        let user_account = &mut ctx.accounts.user_account;
        user_account.name = new_name;
        Ok(())
    }
}
```

#### `#[derive(Accounts)]` -- Define Account Validation

```rust
#[derive(Accounts)]
#[instruction(name: String)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + UserAccount::INIT_SPACE,
        seeds = [b"user", authority.key().as_ref()],
        bump,
    )]
    pub user_account: Account<'info, UserAccount>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Update<'info> {
    #[account(
        mut,
        seeds = [b"user", authority.key().as_ref()],
        bump = user_account.bump,
        has_one = authority,
    )]
    pub user_account: Account<'info, UserAccount>,

    pub authority: Signer<'info>,
}
```

#### `#[account]` -- Define Account Data

```rust
#[account]
#[derive(InitSpace)]
pub struct UserAccount {
    pub authority: Pubkey,     // 32 bytes
    #[max_len(50)]
    pub name: String,          // 4 + 50 bytes (prefix + max content)
    pub bump: u8,              // 1 byte
}
```

### Common Anchor Constraints

| Constraint | Purpose | Example |
|-----------|---------|---------|
| `init` | Create and initialize account | `#[account(init, payer = user, space = 8 + 32)]` |
| `mut` | Mark account as writable | `#[account(mut)]` |
| `seeds` | Derive PDA | `#[account(seeds = [b"seed", user.key().as_ref()], bump)]` |
| `bump` | Store/verify PDA bump | `bump = account.bump` |
| `has_one` | Verify account field matches | `#[account(has_one = authority)]` |
| `constraint` | Custom boolean check | `#[account(constraint = amount > 0)]` |
| `close` | Close account, reclaim rent | `#[account(mut, close = recipient)]` |
| `realloc` | Resize account data | `#[account(mut, realloc = new_size, realloc::payer = user, realloc::zero = false)]` |
| `token::mint` | Validate token account mint | `#[account(token::mint = mint, token::authority = user)]` |
| `associated_token::mint` | Validate ATA | `#[account(associated_token::mint = mint, associated_token::authority = user)]` |

### Anchor Error Codes

```rust
#[error_code]
pub enum MyError {
    #[msg("Name too long")]
    NameTooLong,
    #[msg("Unauthorized")]
    Unauthorized,
    #[msg("Insufficient funds")]
    InsufficientFunds,
}

// Usage in instruction
require!(name.len() <= 50, MyError::NameTooLong);
```

Source: [anchor-lang.com](https://anchor-lang.com), [Anchor Book](https://book.anchor-lang.com)

---

## Native vs Anchor

### When to Use Anchor

- **Most projects** -- Anchor is the default choice for new Solana programs
- When you want fast development and built-in safety checks
- When you need auto-generated IDL and TypeScript clients
- When working with a team (constraints are self-documenting)

### When to Use Native

- **Maximum performance** -- Anchor adds a small overhead (~1-3k CU per instruction)
- **Minimal programs** -- very simple programs where Anchor's boilerplate exceeds the logic
- **Learning** -- understanding native helps you debug Anchor programs
- **Highly optimized DeFi** -- where every compute unit matters

### Tradeoffs

| Aspect | Anchor | Native |
|--------|--------|--------|
| Development speed | Fast | Slow |
| Account validation | Declarative (constraints) | Manual (if-else checks) |
| Serialization | Automatic (Borsh) | Manual |
| IDL generation | Automatic | Manual or none |
| CU overhead | ~1-3k extra per instruction | Minimal |
| Error messages | Typed with codes | Raw program error |
| Learning curve | Moderate | Steep |
| Ecosystem support | Most tutorials/examples | Fewer resources |

---

## Program Deployment

### Deploy a Program

```bash
# Build the program
anchor build
# or for native:
cargo build-sbf

# Deploy to devnet
solana program deploy target/deploy/my_program.so --url devnet

# Deploy to mainnet
solana program deploy target/deploy/my_program.so --url mainnet-beta
```

### Upgradeable Programs

By default, Solana programs are **upgradeable**. The deploy creates three accounts:

1. **Program Account** -- the executable, points to the program data account
2. **Program Data Account** -- stores the actual bytecode, holds the upgrade authority
3. **Buffer Account** -- temporary, used during deployment, closed after

### Upgrade Authority

```bash
# Show current upgrade authority
solana program show <PROGRAM_ID>

# Upgrade a deployed program
solana program deploy target/deploy/my_program.so \
  --program-id <PROGRAM_ID> \
  --url devnet

# Transfer upgrade authority
solana program set-upgrade-authority <PROGRAM_ID> \
  --new-upgrade-authority <NEW_AUTHORITY>

# Make program immutable (IRREVERSIBLE)
solana program set-upgrade-authority <PROGRAM_ID> --final
```

### Deployment Checklist

1. Run all tests on localnet and devnet
2. Audit the program (or at minimum, run security checklist)
3. Deploy to devnet and test with real transactions
4. Deploy to mainnet-beta
5. Verify the program source (via verified builds)
6. Consider making the program immutable after stabilization

---

## Testing

Solana has multiple testing approaches, each suited to different stages:

### anchor test (Integration Tests)

The default testing approach for Anchor programs. Spins up a local validator, deploys your program, and runs TypeScript tests.

```typescript
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { MyProgram } from "../target/types/my_program";

describe("my-program", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.MyProgram as Program<MyProgram>;

  it("initializes", async () => {
    const [userPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("user"), provider.wallet.publicKey.toBuffer()],
      program.programId
    );

    await program.methods
      .initialize("Alice")
      .accounts({ authority: provider.wallet.publicKey })
      .rpc();

    const account = await program.account.userAccount.fetch(userPda);
    assert.equal(account.name, "Alice");
  });
});
```

```bash
anchor test                    # run tests with local validator
anchor test --skip-local-validator  # use existing validator
```

### LiteSVM (Fast Unit Tests — Rust & TypeScript)

[LiteSVM](https://github.com/LiteSVM/litesvm) is a fast, lightweight SVM simulator for both Rust and TypeScript tests. Replaces the deprecated `solana-bankrun` package.

```typescript
// TypeScript — npm install litesvm
import { LiteSVM } from "litesvm";

const svm = new LiteSVM();
svm.addProgramFromFile(MY_PROGRAM_ID, "target/deploy/my_program.so");

const payer = svm.generateKeypair();
svm.airdrop(payer.publicKey, 1_000_000_000n);
```

### LiteSVM (Rust)

```rust
use litesvm::LiteSVM;
use solana_sdk::{signature::Keypair, transaction::Transaction};

#[test]
fn test_initialize() {
    let mut svm = LiteSVM::new();
    svm.add_program_from_file(program_id, "target/deploy/my_program.so");

    let user = Keypair::new();
    svm.airdrop(&user.pubkey(), 1_000_000_000).unwrap();

    // Build and send transaction
    let tx = Transaction::new_signed_with_payer(
        &[instruction],
        Some(&user.pubkey()),
        &[&user],
        svm.latest_blockhash(),
    );
    svm.send_transaction(tx).unwrap();
}
```

### Mollusk (Instruction-Level Testing)

[Mollusk](https://github.com/buffalojoec/mollusk) tests individual instructions in isolation without a validator or SVM instance.

```rust
use mollusk_svm::Mollusk;

let mollusk = Mollusk::new(&program_id, "target/deploy/my_program");

let result = mollusk.process_instruction(
    &instruction,
    &[(key, account)],
);
assert!(!result.program_result.is_err());
```

### Surfpool (Real-Time Testing)

[Surfpool](https://github.com/solana-foundation/surfpool) proxies mainnet state locally, so you can test against real data without deploying.

### Testing Strategy

| Stage | Tool | Speed | Fidelity |
|-------|------|-------|----------|
| Unit (Rust) | LiteSVM or Mollusk | Very fast | Program-level |
| Unit (TS) | LiteSVM | Fast | Transaction-level |
| Integration | anchor test | Moderate | Full validator |
| Staging | Devnet | Slow | Real network |
| Real-time | Surfpool | Moderate | Mainnet state |

Recommended approach:
1. **LiteSVM / Mollusk** for rapid iteration on program logic
2. **LiteSVM** for TypeScript client testing
3. **anchor test** for full integration tests
4. **Devnet** for final validation before mainnet

---

## Quick Reference: Account Space Calculation

When creating accounts, you need to calculate the space. Anchor's `InitSpace` derive macro handles this, but here is the manual calculation:

| Type | Size (bytes) |
|------|-------------|
| bool | 1 |
| u8 / i8 | 1 |
| u16 / i16 | 2 |
| u32 / i32 | 4 |
| u64 / i64 | 8 |
| u128 / i128 | 16 |
| f32 | 4 |
| f64 | 8 |
| Pubkey | 32 |
| Option\<T\> | 1 + sizeof(T) |
| Vec\<T\> | 4 + (sizeof(T) * length) |
| String | 4 + length |
| Enum | 1 + sizeof(largest variant) |

Anchor adds an **8-byte discriminator** at the start of every account. Always include this:

```rust
space = 8 + // Anchor discriminator
        32 + // Pubkey
        4 + 50 + // String (max 50 chars)
        1 // u8 (bump)
```

---

## Sources

- [solana.com/docs/core/accounts](https://solana.com/docs/core/accounts)
- [solana.com/docs/core/programs](https://solana.com/docs/core/programs)
- [solana.com/docs/core/pda](https://solana.com/docs/core/pda)
- [solana.com/docs/core/cpi](https://solana.com/docs/core/cpi)
- [solana.com/docs/core/transactions](https://solana.com/docs/core/transactions)
- [solana.com/docs/core/fees](https://solana.com/docs/core/fees)
- [anchor-lang.com](https://anchor-lang.com)
- [Anchor Book](https://book.anchor-lang.com)
- [Solana Cookbook](https://solanacookbook.com)
- [Solana Stack Exchange](https://solana.stackexchange.com)
- [Helius Blog](https://www.helius.dev/blog)
