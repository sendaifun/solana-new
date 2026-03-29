# Error Recovery Guide

Common Solana development errors, organized by category. When stuck, use the `common-errors` official skill for deeper diagnosis.

## Transaction Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `BlockhashNotFound` | Transaction expired (~60s) | Get fresh blockhash with `getLatestBlockhash()`, retry |
| `InsufficientFundsForRent` | Account below rent-exempt minimum | Calculate: `getMinimumBalanceForRentExemption(dataSize)` |
| `AccountNotFound` | Reading account that doesn't exist | Check initialization before reading. Use `getAccountInfo()` |
| `ProgramFailedToComplete` | Exceeded compute budget | Add `ComputeBudgetProgram.setComputeUnitLimit({ units: 400_000 })` |
| `TransactionTooLarge` | Exceeds 1232 bytes | Use address lookup tables or split into multiple txs |
| `InsufficientFunds` (0x1) | Not enough SOL for transaction | Check balance, airdrop on devnet: `solana airdrop 2` |
| `SendTransactionPreflightFailure` | Simulation failed before sending | Read the inner error — it contains the actual cause |
| `TransactionExpiredBlockheightExceeded` | Blockhash expired during confirmation | Use `lastValidBlockHeight` from `getLatestBlockhash()` for retry logic |
| `429 Too Many Requests` | RPC rate limited | Use Helius RPC (higher limits), add retry with backoff |
| `NodeIsBehind` | RPC node not synced | Switch to a different RPC endpoint |

## Anchor Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `AccountNotInitialized` | Using `init` on existing account | Use `init_if_needed` or check account existence first |
| `ConstraintSeeds` | PDA seeds don't match | Verify seeds match exactly between client and program |
| `ConstraintOwner` | Wrong program owns the account | Check account ownership — may be passing wrong account |
| `ConstraintMut` | Account not marked mutable | Add `#[account(mut)]` to the account in the Accounts struct |
| `ConstraintHasOne` | Linked account doesn't match | Verify the `has_one` relationship (e.g., `has_one = authority`) |
| `DeclaredProgramIdMismatch` | Program ID mismatch | Run `anchor keys sync` then rebuild |
| `AccountDiscriminatorMismatch` | Wrong account type passed | Check you're passing the right account struct type |
| `AccountOwnedByWrongProgram` | Account belongs to different program | Verify account was created by your program |
| `InstructionFallbackNotFound` | Unknown instruction called | Check IDL is up-to-date: `anchor build` regenerates it |

## Token Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `TokenAccountNotFound` | ATA doesn't exist yet | Use `getOrCreateAssociatedTokenAccount()` |
| `InsufficientTokenBalance` | Not enough tokens to transfer | Check balance with `getTokenAccountBalance()` |
| `MintDecimalsMismatch` | Wrong decimal handling | Always read `mint.decimals` — don't hardcode |
| `OwnerMismatch` | Token account owned by wrong wallet | Verify the ATA derivation matches the expected owner |
| `TokenExtensionError` | Token-2022 extension misconfigured | Check transfer hooks, metadata extensions are properly initialized |

## CPI Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `PrivilegeEscalation` | CPI trying to sign without authority | Use `invoke_signed` with correct PDA seeds |
| `MissingRequiredSignature` | Signer not provided in CPI | Include signer account in CPI instruction accounts |
| `ExternalAccountLamportSpend` | CPI modifying account it doesn't own | Only modify accounts your program owns |

## Build Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `anchor build` fails with BPF error | Version mismatch | Check `compatibility-matrix` skill. Usually: `solana-install update` |
| `pnpm install` hangs | Node version too old | Use Node 18+ (`nvm use 18`) |
| IDL type mismatch | Stale IDL after program change | Rebuild: `anchor build` then copy IDL from `target/idl/` |
| `cargo build-sbf` fails | Missing Solana SDK | Run `solana-install update` |
| Rust compiler errors in dependencies | Version conflict | Check `Cargo.lock`, run `cargo update` |

## Debug Strategy

1. **Read the full error message** — Solana errors are usually descriptive
2. **Check the transaction** on Solana Explorer (devnet): `https://explorer.solana.com/tx/SIGNATURE?cluster=devnet`
3. **Simulate first**: `connection.simulateTransaction(tx)` returns detailed logs
4. **Add program logs**: `msg!("value: {}", my_value)` in Rust, then `solana logs` in terminal
5. **Use Surfpool**: Built-in transaction inspector shows full execution trace
6. **Check Helius**: `helius-mcp` can parse enhanced transaction details

**Skills:** `common-errors` (official), `surfpool` (official)
**MCPs:** `helius-mcp`, `solscan-mcp` (transaction forensics)
