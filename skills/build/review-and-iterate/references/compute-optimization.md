# Compute Optimization

Reducing compute units (CU) and transaction costs on Solana.

> Solana does NOT have "gas". The correct term is **compute units (CU)**.

## CU Budget

- Default: 200,000 CU per instruction
- Max: 1,400,000 CU per transaction (sum of all instructions)
- Base fee: flat **5,000 lamports per signature** (not per CU)
- Priority fees: priced in **micro-lamports per CU** — vary by network congestion
- Set CU limit: `ComputeBudgetProgram.setComputeUnitLimit({ units: 400_000 })`
- Set priority: `ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 1_000 })`

## Quick Wins

### 1. Minimize account reads
- Each account deserialization costs CU
- Only include accounts that are actually used
- Use `AccountInfo` instead of full deserialization when you only need lamports/owner

### 2. Remove debug logging
- `msg!()` in programs costs significant CU
- Remove all debug logs in production builds
- Use `#[cfg(feature = "debug")]` for conditional logging

### 3. Efficient data structures
- Use fixed-size arrays instead of vectors where possible
- Pack related fields to minimize account size (rent is proportional)
- Use bitflags for boolean fields
- Align fields to avoid padding waste

### 4. CPI optimization
- Each CPI has a small fixed invocation overhead that varies by Solana/Agave runtime version, plus account-data transfer cost and the callee program's own execution
- Batch operations instead of multiple CPIs where possible
- Cache PDA bump in account state when a hot path would otherwise call `find_program_address` repeatedly; on-chain bump search has variable compute cost

### 5. Account layout
- Only allocate what you need — `space = 8 + actual_data_size`
- Use `realloc` if account size changes over time
- Consider zero-copy deserialization for accounts >1KB

## Pinocchio: 88-95% CU Savings

For compute-intensive programs, consider Pinocchio instead of Anchor:

- Zero-copy, zero-allocation, zero-dependency framework
- Programs use 88-95% fewer CU than equivalent Anchor programs
- Trade-off: more manual code, no derive macros, steeper learning curve
- Best for: high-frequency programs (DEX, AMM, orderbook), programs near CU limits

**Skills:** `programs-pinocchio` (official), `pinocchio-skill` (community)
**Repos:** `pinocchio` (framework source + examples)

## When to Optimize

| Phase | Strategy |
|-------|----------|
| **During MVP** | Don't optimize. Default CU limits are fine. Ship fast. |
| **Before mainnet** | Profile CU usage per instruction. Optimize hot paths only. |
| **After launch** | Optimize based on actual usage patterns and user complaints. |
| **CU limit issues** | Consider Pinocchio for the specific instructions hitting limits. |

## Tools

| Tool | What it does |
|------|-------------|
| `solana logs` | See CU usage per instruction in real-time |
| Surfpool | Local testing with CU profiling and mainnet state |
| `helius-mcp` | Enhanced transaction parsing with CU breakdown |
| `solana-fender-mcp` | Static analysis of Anchor programs for optimization opportunities |
| `simulateTransaction()` | Get CU usage without sending (dry run) |

**Skills:** `surfpool` (official), `surfpool-cheatcodes` (official)
