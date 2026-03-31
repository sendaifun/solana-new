# Compute Unit Profiling Reference

## Measuring CU with simulateTransaction

### Description

The most accurate way to measure compute unit consumption is to use `connection.simulateTransaction()`. This sends the transaction to a validator for simulation without submitting it on-chain, returning the exact number of compute units consumed.

Build transactions with each instruction individually to isolate CU per instruction. Always include a compute budget instruction to set the limit high enough that your instruction does not fail due to CU exhaustion during simulation.

### Code Example

```typescript
import {
  Connection,
  Transaction,
  PublicKey,
  ComputeBudgetProgram,
  TransactionInstruction,
} from "@solana/web3.js";

async function measureCU(
  connection: Connection,
  instruction: TransactionInstruction,
  payer: PublicKey,
  signers: any[] = []
): Promise<number> {
  const tx = new Transaction();

  // Set CU limit high to avoid exhaustion during measurement
  tx.add(
    ComputeBudgetProgram.setComputeUnitLimit({ units: 1_400_000 })
  );
  tx.add(instruction);

  tx.feePayer = payer;
  tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

  const simulation = await connection.simulateTransaction(tx);

  if (simulation.value.err) {
    console.error("Simulation error:", simulation.value.err);
    console.error("Logs:", simulation.value.logs);
    throw new Error(`Simulation failed: ${JSON.stringify(simulation.value.err)}`);
  }

  const unitsConsumed = simulation.value.unitsConsumed ?? 0;
  console.log(`CU consumed: ${unitsConsumed}`);
  console.log("Logs:", simulation.value.logs);

  return unitsConsumed;
}
```

### Expected CU Impact

This is a measurement tool, not an optimization. Use it to establish baselines and verify that optimizations reduce CU.

### When to Apply

- Before any optimization work to establish a baseline.
- After each optimization to verify CU savings.
- During CI/CD to detect CU regressions.
- When comparing different implementation strategies.

---

## sol_log_compute_units! Macro

### Description

Insert `solana_program::log::sol_log_compute_units()` at key points in your on-chain program code. Each call logs the remaining compute units to program logs. By placing two calls around a code block, you can calculate the exact CU consumed by that block.

This works in both Anchor and native programs. The macro itself costs approximately 50 CU per call.

### Code Example

**Native program:**

```rust
use solana_program::log::sol_log_compute_units;

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    sol_log_compute_units(); // Log remaining CU — checkpoint A

    // ... deserialization logic ...

    sol_log_compute_units(); // Log remaining CU — checkpoint B
    // CU consumed by deserialization = checkpoint A - checkpoint B

    // ... business logic ...

    sol_log_compute_units(); // Log remaining CU — checkpoint C
    // CU consumed by business logic = checkpoint B - checkpoint C

    Ok(())
}
```

**Anchor program:**

```rust
use solana_program::log::sol_log_compute_units;

pub fn initialize(ctx: Context<Initialize>, data: u64) -> Result<()> {
    sol_log_compute_units(); // After Anchor deserialization

    ctx.accounts.my_account.data = data;
    ctx.accounts.my_account.authority = ctx.accounts.authority.key();

    sol_log_compute_units(); // After state mutation

    Ok(())
}
```

### Expected CU Impact

~50 CU per `sol_log_compute_units()` call. Remove all calls before production deployment.

### When to Apply

- During development to identify which code sections consume the most CU.
- When optimizing a specific instruction and you need granular breakdown.
- To verify that a refactor did not increase CU in a specific code path.

---

## Anchor Compute Budget Patterns

### Description

Anchor adds overhead on top of raw Solana instructions. Understanding where CU is spent helps target optimizations. Key cost centers in Anchor programs:

| Operation | Approximate CU Cost |
|---|---|
| Discriminator check | ~200 CU |
| Account deserialization (small, <100 bytes) | 500-1,500 CU |
| Account deserialization (medium, 100-1000 bytes) | 1,500-5,000 CU |
| Account deserialization (large, >1000 bytes) | 5,000-20,000 CU |
| `init` constraint (creates account) | 5,000-15,000 CU (includes system program CPI + allocation) |
| `has_one` constraint | ~200 CU |
| `constraint` (custom) | depends on expression, ~100-500 CU |
| `#[instruction]` attribute parsing | ~100-300 CU per field |
| CPI call overhead | ~1,000-3,000 CU per invocation |
| `close` constraint | ~2,000 CU |

### Code Example

```rust
// HIGH CU: deserializes all accounts even if not all are needed
#[derive(Accounts)]
pub struct ExpensiveInstruction<'info> {
    #[account(
        init,                    // ~10,000 CU for account creation
        payer = authority,
        space = 8 + LargeStruct::INIT_SPACE,
    )]
    pub large_account: Account<'info, LargeStruct>,  // ~5,000 CU deserialization
    #[account(mut)]
    pub another_account: Account<'info, AnotherStruct>, // ~2,000 CU
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

// LOWER CU: use UncheckedAccount where safe, zero_copy for large accounts
#[derive(Accounts)]
pub struct OptimizedInstruction<'info> {
    #[account(zero_copy)]       // Zero-copy avoids deserialization
    pub large_account: AccountLoader<'info, LargeStruct>,
    #[account(mut)]
    pub authority: Signer<'info>,
}
```

### Expected CU Impact

Anchor overhead typically adds 3,000-20,000 CU compared to a native program performing the same operation, depending on the number and size of accounts.

### When to Apply

- When your Anchor instruction approaches the 200,000 CU default limit.
- When you have large accounts (>500 bytes) that could benefit from zero-copy.
- When `init` constraints are used and you need to reduce creation costs.

---

## CU Optimization Techniques

### Zero-Copy Deserialization

**Description:** Use `#[account(zero_copy)]` in Anchor or `bytemuck` in native programs to avoid borsh deserialization overhead. Instead of copying account data into a new struct, zero-copy maps the struct directly onto the account's data buffer.

**Code Example:**

```rust
// Anchor zero-copy
#[account(zero_copy)]
#[repr(C)]
pub struct LargeState {
    pub authority: Pubkey,       // 32 bytes
    pub values: [u64; 128],      // 1024 bytes
    pub counter: u64,            // 8 bytes
}

#[derive(Accounts)]
pub struct UseZeroCopy<'info> {
    #[account(mut)]
    pub state: AccountLoader<'info, LargeState>,
}

pub fn update(ctx: Context<UseZeroCopy>, index: u8, value: u64) -> Result<()> {
    let mut state = ctx.accounts.state.load_mut()?;
    state.values[index as usize] = value;
    state.counter += 1;
    Ok(())
}
```

```rust
// Native zero-copy with bytemuck
use bytemuck::{Pod, Zeroable};

#[derive(Clone, Copy, Pod, Zeroable)]
#[repr(C)]
pub struct LargeState {
    pub authority: [u8; 32],
    pub values: [u64; 128],
    pub counter: u64,
}

let state: &mut LargeState = bytemuck::from_bytes_mut(
    &mut account.data.borrow_mut()[8..] // skip discriminator
);
state.counter += 1;
```

**Expected CU Impact:** Saves 1,000-10,000 CU depending on account size. Largest savings on accounts >500 bytes.

**When to Apply:** Accounts with >500 bytes of data. Accounts accessed frequently. Accounts with arrays or large fixed-size fields.

### Minimize Logging

**Description:** Each `msg!` macro call costs approximately 100 CU. Debug logs add up quickly in loops or complex logic.

**Code Example:**

```rust
// BAD: logging in a loop
for i in 0..items.len() {
    msg!("Processing item {}", i);  // ~100 CU x N iterations
    process_item(&items[i])?;
}

// GOOD: single summary log or no log
for i in 0..items.len() {
    process_item(&items[i])?;
}
msg!("Processed {} items", items.len());  // ~100 CU total
```

**Expected CU Impact:** ~100 CU per `msg!` call removed.

**When to Apply:** Always remove debug logs before production. Keep only essential logs for off-chain indexing.

### Reduce Account Count

**Description:** Each additional account in a transaction adds approximately 200 CU for validation (signature checks, owner checks, rent checks). Combine related data into fewer accounts where possible.

**Code Example:**

```rust
// BAD: separate accounts for related data
#[derive(Accounts)]
pub struct BadDesign<'info> {
    pub user_profile: Account<'info, UserProfile>,      // +200 CU
    pub user_stats: Account<'info, UserStats>,           // +200 CU
    pub user_preferences: Account<'info, UserPreferences>, // +200 CU
}

// GOOD: combine into single account
#[derive(Accounts)]
pub struct GoodDesign<'info> {
    pub user_data: Account<'info, UserData>,  // +200 CU (contains all three)
}
```

**Expected CU Impact:** ~200 CU saved per account removed from the instruction.

**When to Apply:** When multiple accounts always appear together. When account data is small enough to combine without hitting the 10MB account size limit.

### Stack vs Heap Allocation

**Description:** Prefer stack allocation for data under 4KB. Use `Box::new()` to move larger allocations to the heap and avoid stack overflow.

**Code Example:**

```rust
// Stack allocation — fast, no CU overhead for allocation
let data: [u8; 256] = [0u8; 256];

// Heap allocation — necessary for large data, ~500-1000 CU overhead
let data: Box<[u8; 8192]> = Box::new([0u8; 8192]);
```

**Expected CU Impact:** Heap allocation costs ~500-1,000 CU. Stack is free but limited to ~4KB per frame.

**When to Apply:** Use heap when data exceeds 4KB or when you get stack overflow errors. Otherwise prefer stack.

### Precomputed Values

**Description:** Store computed values on-chain instead of recalculating every instruction. Trade storage cost (rent) for compute savings.

**Code Example:**

```rust
// BAD: recalculate every time
pub fn get_discount(ctx: Context<GetDiscount>) -> Result<()> {
    let holdings = calculate_token_holdings(&ctx.accounts.user)?;  // ~5,000 CU
    let tier = determine_tier(holdings)?;                            // ~1,000 CU
    let discount = compute_discount(tier)?;                          // ~500 CU
    // use discount...
    Ok(())
}

// GOOD: precompute and store
pub fn update_tier(ctx: Context<UpdateTier>) -> Result<()> {
    let holdings = calculate_token_holdings(&ctx.accounts.user)?;
    let tier = determine_tier(holdings)?;
    ctx.accounts.user_data.cached_tier = tier;
    ctx.accounts.user_data.cached_discount = compute_discount(tier)?;
    Ok(())
}

pub fn get_discount(ctx: Context<GetDiscount>) -> Result<()> {
    let discount = ctx.accounts.user_data.cached_discount;  // ~0 CU
    // use discount...
    Ok(())
}
```

**Expected CU Impact:** Saves the full cost of the computation on every read. Most impactful for expensive calculations accessed frequently.

**When to Apply:** When the same computation runs on most transactions. When the inputs change infrequently relative to reads.

### Account Reuse

**Description:** When multiple instructions in a transaction need the same account data, deserialize once and pass the reference. Avoid re-fetching or re-deserializing the same account.

**Code Example:**

```rust
// In a CPI chain, pass already-deserialized data through context
// rather than re-loading from account info in the callee.
```

**Expected CU Impact:** Saves the full deserialization cost per reuse (500-20,000 CU depending on account size).

**When to Apply:** When composing multiple CPIs that share accounts. When the same account appears in multiple instructions within one transaction.

---

## Compute Budget Program

### Description

The Compute Budget Program allows you to configure the CU limit and priority fees for a transaction. Use it to:

1. Set a specific CU limit (avoiding the 200,000 default or requesting up to 1,400,000).
2. Request additional heap memory (default 32KB, max 256KB).
3. Set a priority fee in micro-lamports per CU.

### Code Example

```typescript
import { ComputeBudgetProgram, Transaction } from "@solana/web3.js";

const tx = new Transaction();

// Set compute unit limit
tx.add(
  ComputeBudgetProgram.setComputeUnitLimit({
    units: 300_000,  // Request 300k CU
  })
);

// Set priority fee (micro-lamports per CU)
tx.add(
  ComputeBudgetProgram.setComputeUnitPrice({
    microLamports: 50_000,  // 50,000 micro-lamports per CU
  })
);

// Request additional heap memory (optional)
tx.add(
  ComputeBudgetProgram.requestHeapFrame({
    bytes: 65_536,  // 64KB heap
  })
);

// Add your program instruction
tx.add(yourProgramInstruction);
```

### Key Limits

| Parameter | Default | Maximum |
|---|---|---|
| Compute units per instruction | 200,000 | 1,400,000 |
| Heap size | 32 KB | 256 KB |
| Stack frame size | 4 KB | 4 KB |
| Call depth | 4 | 4 |
| CPI depth | 4 | 4 |

### Expected CU Impact

The `setComputeUnitLimit` instruction itself costs ~150 CU. The `setComputeUnitPrice` instruction costs ~150 CU. Over-requesting CU wastes priority fees because validators charge based on the requested limit, not the consumed amount.

### When to Apply

- Always set an explicit CU limit in production to avoid overpaying priority fees.
- Request only 10-20% above your measured CU consumption as a buffer.
- Use `requestHeapFrame` only if your program needs more than 32KB of heap.

---

## Benchmark Script Template

### Description

A reusable TypeScript script that simulates each instruction in a Solana program, collects CU data, and outputs a comparison table. Adapt this to your specific program instructions.

### Code Example

```typescript
import {
  Connection,
  PublicKey,
  Transaction,
  Keypair,
  ComputeBudgetProgram,
  TransactionInstruction,
} from "@solana/web3.js";
import * as fs from "fs";

// Configuration
const RPC_URL = "https://api.devnet.solana.com";
const PROGRAM_ID = new PublicKey("YOUR_PROGRAM_ID");

interface BenchmarkResult {
  instruction: string;
  cuConsumed: number;
  cuLimit: number;
  percentOfDefault: string;   // % of 200,000
  percentOfMax: string;       // % of 1,400,000
  logs: string[];
}

async function benchmarkInstruction(
  connection: Connection,
  name: string,
  instruction: TransactionInstruction,
  payer: PublicKey
): Promise<BenchmarkResult> {
  const tx = new Transaction();
  tx.add(ComputeBudgetProgram.setComputeUnitLimit({ units: 1_400_000 }));
  tx.add(instruction);
  tx.feePayer = payer;
  tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

  const sim = await connection.simulateTransaction(tx);

  const cuConsumed = sim.value.unitsConsumed ?? 0;

  return {
    instruction: name,
    cuConsumed,
    cuLimit: 1_400_000,
    percentOfDefault: ((cuConsumed / 200_000) * 100).toFixed(1) + "%",
    percentOfMax: ((cuConsumed / 1_400_000) * 100).toFixed(1) + "%",
    logs: sim.value.logs ?? [],
  };
}

async function runBenchmarks() {
  const connection = new Connection(RPC_URL, "confirmed");

  // TODO: Replace with your actual payer keypair
  const payer = Keypair.generate();

  // TODO: Define your program instructions here
  const instructions: { name: string; ix: TransactionInstruction }[] = [
    // Example:
    // { name: "initialize", ix: createInitializeInstruction(...) },
    // { name: "transfer", ix: createTransferInstruction(...) },
    // { name: "close", ix: createCloseInstruction(...) },
  ];

  const results: BenchmarkResult[] = [];

  for (const { name, ix } of instructions) {
    try {
      const result = await benchmarkInstruction(connection, name, ix, payer.publicKey);
      results.push(result);
      console.log(`${name}: ${result.cuConsumed} CU (${result.percentOfDefault} of default)`);
    } catch (e) {
      console.error(`Failed to benchmark ${name}:`, e);
    }
  }

  // Print results table
  console.log("\n--- Benchmark Results ---");
  console.log(
    "Instruction".padEnd(30) +
    "CU Consumed".padEnd(15) +
    "% of 200k".padEnd(15) +
    "% of 1.4M".padEnd(15)
  );
  console.log("-".repeat(75));

  for (const r of results) {
    console.log(
      r.instruction.padEnd(30) +
      r.cuConsumed.toString().padEnd(15) +
      r.percentOfDefault.padEnd(15) +
      r.percentOfMax.padEnd(15)
    );
  }

  // Total
  const totalCU = results.reduce((sum, r) => sum + r.cuConsumed, 0);
  console.log("-".repeat(75));
  console.log(
    "TOTAL".padEnd(30) +
    totalCU.toString().padEnd(15) +
    ((totalCU / 200_000) * 100).toFixed(1).padEnd(15) + "%" +
    ((totalCU / 1_400_000) * 100).toFixed(1) + "%"
  );

  // Save results
  const output = {
    timestamp: new Date().toISOString(),
    program_id: PROGRAM_ID.toBase58(),
    results,
    total_cu: totalCU,
  };

  fs.writeFileSync("benchmark-results.json", JSON.stringify(output, null, 2));
  console.log("\nResults saved to benchmark-results.json");
}

runBenchmarks().catch(console.error);
```

### Expected CU Impact

This script itself has no CU impact on-chain. It uses simulation only.

### When to Apply

- Run this script after every significant code change to track CU trends.
- Use it as part of CI to catch CU regressions.
- Run before and after applying each optimization to verify savings.
