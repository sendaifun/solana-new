# Debug Workflow

A systematic approach to debugging Solana program errors and transaction failures. Follow these steps in order — don't skip ahead.

## Step 1: Read the Error

Before anything else, get the exact error. There are three sources:

### From a Transaction Signature

```typescript
// Get transaction details with logs
const tx = await connection.getTransaction(signature, {
  maxSupportedTransactionVersion: 0,
});

if (tx?.meta?.err) {
  console.log("Error:", JSON.stringify(tx.meta.err));
  console.log("Logs:", tx.meta.logMessages);
}
```

### From Simulation

```typescript
// Simulate before sending — this is the best debugging tool
const sim = await connection.simulateTransaction(transaction, {
  sigVerify: false,
  replaceRecentBlockhash: true,
});

if (sim.value.err) {
  console.log("Simulation error:", JSON.stringify(sim.value.err));
  console.log("Logs:");
  sim.value.logs?.forEach(log => console.log("  ", log));
  console.log("Units consumed:", sim.value.unitsConsumed);
}
```

### From Anchor Client

```typescript
try {
  await program.methods.myInstruction(args).accounts({...}).rpc();
} catch (err) {
  if (err instanceof AnchorError) {
    console.log("Error code:", err.error.errorCode.code);
    console.log("Error message:", err.error.errorMessage);
    console.log("Program logs:", err.logs);
  }
}
```

## Step 2: Identify the Error Type

### Anchor Error Codes (6xxx range)

```
6000 = Custom program error 0 (your first custom error)
6001 = Custom program error 1
...
```

Map these to your program's `#[error_code]` enum:

```rust
#[error_code]
pub enum ErrorCode {
    #[msg("Insufficient balance")]
    InsufficientBalance,        // 6000
    #[msg("Unauthorized")]
    Unauthorized,               // 6001
    #[msg("Invalid amount")]
    InvalidAmount,              // 6002
}
```

### System Error Codes

| Code | Name | Meaning |
|------|------|---------|
| `0x0` | Success | Not an error |
| `0x1` | InsufficientFunds | Not enough SOL |
| `0x2` | InvalidAccountData | Account data malformed |
| `0x3` | AccountDataTooSmall | Account too small for data |
| `0x4` | InsufficientFundsForRent | Below rent-exempt minimum |

### Anchor Constraint Errors (2xxx range)

| Code | Name | Common Cause |
|------|------|-------------|
| 2000 | ConstraintMut | Account not marked `#[account(mut)]` |
| 2001 | ConstraintHasOne | `has_one` relationship broken |
| 2003 | ConstraintSeeds | PDA seeds don't match |
| 2006 | ConstraintOwner | Wrong program owns the account |
| 2012 | AccountNotInitialized | Account doesn't exist yet |

## Step 3: Simulate the Transaction

Simulation gives you full program logs without spending SOL or changing state.

```typescript
// Enhanced simulation with Surfpool
// Surfpool shows execution trace, CU usage per instruction, and account state changes

// Start Surfpool with the relevant state
// surfpool start --network mainnet
// Or point Surfpool at a specific upstream RPC:
// surfpool start --rpc-url https://api.mainnet-beta.solana.com

const simResult = await connection.simulateTransaction(tx, {
  sigVerify: false,
  replaceRecentBlockhash: true,
  accounts: {
    encoding: "base64",
    addresses: [accountToInspect.toString()],
  },
});

// simResult.value.accounts shows post-simulation account state
// Useful for checking what the transaction WOULD have done
```

**Skills:** `surfpool` (official — transaction profiling, execution traces)
**Skills:** `surfpool-skill` (community — mainnet forking, cheatcodes)

## Step 4: Inspect Account State

Most Solana errors come from account state mismatches.

```typescript
// Check if account exists
const info = await connection.getAccountInfo(address);
if (!info) {
  console.log("Account does not exist — needs initialization");
  return;
}

console.log("Owner:", info.owner.toString());
console.log("Lamports:", info.lamports);
console.log("Data length:", info.data.length);
console.log("Executable:", info.executable);

// Decode Anchor account data
const decoded = program.coder.accounts.decode("MyAccount", info.data);
console.log("Decoded:", decoded);
```

### Common State Issues

```typescript
// Is this the right PDA?
const [expectedPda] = PublicKey.findProgramAddressSync(
  [Buffer.from("my-seed"), userPubkey.toBuffer()],
  programId
);
console.log("Expected PDA:", expectedPda.toString());
console.log("Passed account:", passedAccount.toString());
console.log("Match:", expectedPda.equals(passedAccount));

// Does the ATA exist for this mint + owner?
import { getAssociatedTokenAddress } from "@solana/spl-token";
const ata = await getAssociatedTokenAddress(mint, owner);
const ataInfo = await connection.getAccountInfo(ata);
console.log("ATA exists:", ataInfo !== null);
```

**MCPs:** `helius-mcp` (getAccountInfo, getTokenAccounts, parseTransactions)

## Step 5: Trace CPI Chains

When your program calls other programs (CPI), the error might be in the called program.

```
Program YOUR_PROGRAM_ID invoke [1]
Program log: Instruction: Swap
Program TOKEN_PROGRAM invoke [2]      ← CPI into Token Program
Program log: Error: insufficient funds
Program TOKEN_PROGRAM consumed 3000 of 200000 compute units
Program TOKEN_PROGRAM failed: insufficient funds
Program YOUR_PROGRAM consumed 45000 of 200000 compute units
Program YOUR_PROGRAM failed: ...
```

**Reading CPI logs:**
- `invoke [1]` = top-level instruction (your program)
- `invoke [2]` = CPI call from your program
- `invoke [3]` = CPI from the CPI (nested)
- The deepest failing invoke is usually the root cause

## Step 6: Apply the Fix

After identifying the cause, apply the minimal fix:

1. Fix the code
2. `anchor build` (rebuilds IDL too)
3. Run the failing test again
4. If it passes, run the full test suite
5. Deploy to devnet and test the exact same transaction

## When to Use Which Tool

| Situation | Tool | Why |
|-----------|------|-----|
| Quick error lookup | `common-errors` skill | Instant known-error matching |
| Transaction forensics | `helius-mcp` (parseTransactions) | Enhanced parsed data |
| Reproduce a mainnet failure | Surfpool (mainnet fork) | Exact state replay |
| Account inspection | `helius-mcp` (getAccountInfo) | Full account details |
| Static analysis | `solana-fender-mcp` | Find bugs before they happen |
| Full execution trace | Surfpool Studio | Visual instruction trace |

**Skills:** `common-errors` (official — diagnose and fix common Solana errors)
**Skills:** `surfpool-cheatcodes` (official — surfnet_* RPC methods for state manipulation)
**MCPs:** `solscan-mcp` (transaction forensics via Solscan Pro API)

## Sources

- Surfpool README: https://github.com/solana-foundation/surfpool
- Surfpool CLI source: https://github.com/solana-foundation/surfpool/blob/main/crates/cli/src/cli/mod.rs
- Surfpool docs: https://docs.surfpool.run
