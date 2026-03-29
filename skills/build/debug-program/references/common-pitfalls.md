# Common Pitfalls

The top 20 Solana development mistakes. Each with: symptom you see, root cause, and exact fix.

## 1. Wrong PDA Seeds

**Symptom:** `ConstraintSeeds` (error 2003) or `AccountNotInitialized`
**Cause:** Client-side PDA derivation uses different seeds than the program expects.
**Fix:**
```typescript
// Client must match EXACTLY:
// Program: seeds = [b"user-profile", user.key().as_ref()], bump
const [pda] = PublicKey.findProgramAddressSync(
  [Buffer.from("user-profile"), userPubkey.toBuffer()], // Same seeds, same order
  programId
);
```

## 2. Missing Signer

**Symptom:** `MissingRequiredSignature` or `ConstraintSigner`
**Cause:** A required signer account wasn't included in the transaction's signers list.
**Fix:**
```typescript
await program.methods.myInstruction()
  .accounts({ authority: wallet.publicKey })
  .signers([wallet]) // Don't forget this for non-fee-payer signers
  .rpc();
```

## 3. Stale Blockhash

**Symptom:** `BlockhashNotFound` or `TransactionExpiredBlockheightExceeded`
**Cause:** Recent blockhash expires after ~60 seconds. If your transaction takes too long to build/sign, it expires.
**Fix:**
```typescript
// Get fresh blockhash right before sending
const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
tx.recentBlockhash = blockhash;
// Use lastValidBlockHeight for retry logic
```

## 4. Account Not Initialized

**Symptom:** `AccountNotInitialized` (error 3012) or `AccountOwnedByWrongProgram`
**Cause:** Trying to read/use an account that hasn't been created yet.
**Fix:** Initialize the account first, or use `init_if_needed` in Anchor:
```rust
#[account(init_if_needed, payer = user, space = 8 + MyAccount::INIT_SPACE)]
pub my_account: Account<'info, MyAccount>,
```

## 5. Wrong Program ID

**Symptom:** `DeclaredProgramIdMismatch` or `AccountOwnedByWrongProgram`
**Cause:** Program ID in code doesn't match deployed program.
**Fix:**
```bash
anchor keys sync  # Updates declare_id! to match keypair
anchor build      # Rebuild with correct ID
```

## 6. ATA Not Created

**Symptom:** `TokenAccountNotFound` or transaction fails on token transfer
**Cause:** Sending tokens to a wallet that doesn't have an Associated Token Account for that mint.
**Fix:**
```typescript
import { getOrCreateAssociatedTokenAccount } from "@solana/spl-token";
// This creates the ATA if it doesn't exist (costs ~0.002 SOL)
const ata = await getOrCreateAssociatedTokenAccount(connection, payer, mint, recipient);
```

## 7. Insufficient Compute Units

**Symptom:** `ProgramFailedToComplete` or `ComputationalBudgetExceeded`
**Cause:** Default CU limit (200k per instruction) isn't enough for complex operations.
**Fix:**
```typescript
import { ComputeBudgetProgram } from "@solana/web3.js";
tx.add(ComputeBudgetProgram.setComputeUnitLimit({ units: 400_000 }));
// Also set priority fee for mainnet:
tx.add(ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 50_000 }));
```

## 8. Rent Exemption

**Symptom:** `InsufficientFundsForRent` (error 0x4)
**Cause:** Account balance below minimum rent-exempt threshold.
**Fix:**
```typescript
const minBalance = await connection.getMinimumBalanceForRentExemption(accountDataSize);
// Include enough lamports when creating the account
```

## 9. Token Decimal Mismatch

**Symptom:** Sending 1000x too much or too little of a token
**Cause:** Hardcoding decimals instead of reading from the mint.
**Fix:**
```typescript
const mintInfo = await getMint(connection, mintAddress);
const amount = userInputAmount * (10 ** mintInfo.decimals);
// SOL has 9 decimals, USDC has 6, some tokens have 0
```

## 10. Account Data Too Small

**Symptom:** `AccountDataTooSmall` or borsh serialization error
**Cause:** Account was created with insufficient space for the data being written.
**Fix:**
```rust
// Calculate space correctly: discriminator (8) + each field
#[account(init, payer = user, space = 8 + 32 + 8 + 1 + 4 + 256)]
// Or use Anchor's INIT_SPACE derive macro:
#[derive(InitSpace)]
pub struct MyAccount {
    pub authority: Pubkey,     // 32
    pub balance: u64,          // 8
    pub is_active: bool,       // 1
    #[max_len(256)]
    pub name: String,          // 4 + 256
}
```

## 11. Using `init` on Existing Account

**Symptom:** `0x0` error or "already in use" during account creation
**Cause:** Trying to `init` an account that already exists.
**Fix:** Use `init_if_needed` or check existence before creating.

## 12. Forgetting to Mark Account Mutable

**Symptom:** `ConstraintMut` (error 2000)
**Cause:** Modifying an account not marked `#[account(mut)]`.
**Fix:**
```rust
#[account(mut)]
pub my_account: Account<'info, MyAccount>,
```

## 13. Wrong Token Program

**Symptom:** `AccountOwnedByWrongProgram` when working with tokens
**Cause:** Using SPL Token program for Token-2022 tokens or vice versa.
**Fix:**
```typescript
// Check which program owns the mint
const mintInfo = await connection.getAccountInfo(mintAddress);
const isToken2022 = mintInfo.owner.equals(TOKEN_2022_PROGRAM_ID);
// Use the correct program for all operations
```

## 14. Transaction Too Large

**Symptom:** `TransactionTooLarge` (>1232 bytes)
**Cause:** Too many accounts or instructions in one transaction.
**Fix:**
```typescript
// Option 1: Use Address Lookup Tables
const lookupTable = await createLookupTable(connection, payer, recentSlot);
await addAddressesToTable(connection, payer, lookupTable, addresses);
// Use VersionedTransaction with the lookup table

// Option 2: Split into multiple transactions
const tx1 = new Transaction().add(instruction1, instruction2);
const tx2 = new Transaction().add(instruction3, instruction4);
```

## 15. Not Handling Wrapped SOL

**Symptom:** DeFi operations fail with SOL — "wrong mint" errors
**Cause:** DeFi programs use Wrapped SOL (WSOL), not native SOL.
**Fix:**
```typescript
import { NATIVE_MINT, createSyncNativeInstruction } from "@solana/spl-token";
// Wrap: create WSOL account, transfer SOL, sync
// Unwrap: close WSOL account (SOL returns to owner)
```

## 16. Priority Fee Too Low (Mainnet)

**Symptom:** Transaction sits in "processing" forever on mainnet, then expires
**Cause:** No priority fee set, or fee too low during congestion.
**Fix:**
```typescript
// Get recommended priority fee
const fees = await connection.getRecentPrioritizationFees();
const medianFee = fees.sort((a, b) => a.prioritizationFee - b.prioritizationFee)[Math.floor(fees.length / 2)];

tx.add(ComputeBudgetProgram.setComputeUnitPrice({
  microLamports: Math.max(medianFee.prioritizationFee, 1000),
}));
```

## 17. Commitment Level Mismatch

**Symptom:** Account reads return stale data, or "account not found" right after creation
**Cause:** Reading at `processed` before `confirmed`, or confirming at wrong level.
**Fix:**
```typescript
// After creating an account, wait for confirmation:
await connection.confirmTransaction(sig, "confirmed");
// Then read with same or lower commitment:
const info = await connection.getAccountInfo(address, "confirmed");
```

## 18. IDL Out of Date

**Symptom:** `InstructionFallbackNotFound` or unexpected deserialization errors
**Cause:** Client is using an old IDL that doesn't match the deployed program.
**Fix:**
```bash
anchor build  # Regenerates IDL in target/idl/
# Copy the new IDL to your frontend project
cp target/idl/my_program.json app/src/idl/
```

## 19. Closing Accounts Incorrectly

**Symptom:** "Account still has data" or lamports leak
**Cause:** Not properly zeroing account data before closing.
**Fix:**
```rust
#[account(mut, close = authority)]  // Anchor handles it correctly
pub my_account: Account<'info, MyAccount>,
```

## 20. CPI Depth Exceeded

**Symptom:** `CallDepthExceeded` error
**Cause:** CPI chain goes deeper than 4 levels (A calls B calls C calls D calls E = too deep).
**Fix:** Restructure to reduce CPI depth. Combine operations or use a different architecture.

---

**Skills:** `common-errors` (official — comprehensive error diagnosis and fixes)
**Skills:** `compatibility-matrix` (official — version matching to avoid toolchain conflicts)
**Skills:** `programs-anchor` (official — Anchor framework patterns and best practices)
**MCPs:** `helius-mcp` (troubleshootError tool — error diagnosis)
