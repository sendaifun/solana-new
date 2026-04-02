# SVM Architecture Deep Dive

## What is the SVM?

The Solana Virtual Machine (SVM) is the runtime that executes programs (smart contracts) on Solana. Unlike the EVM which processes transactions sequentially, the SVM is designed for parallel execution from the ground up.

## Transaction Processing Unit (TPU) Pipeline

Every transaction flows through the TPU pipeline in stages:

1. **Fetch** — Validators receive transactions via QUIC (UDP-based protocol with TLS)
2. **SigVerify** — Ed25519 signature verification, parallelized across GPU cores
3. **Banking** — The core execution stage. Transactions are sorted, scheduled, and executed
4. **Proof of History** — Executed transactions are recorded in the PoH stream
5. **Broadcast** — Results are shared with the cluster via Turbine (block propagation)

The banking stage is where the SVM actually runs your program code.

## Accounts: The Core Abstraction

Everything on Solana is an account. Programs are accounts. Data is stored in accounts. SOL balances are accounts.

Each account has:
- **Address** (Pubkey) — 32-byte Ed25519 public key
- **Lamports** — balance in lamports (1 SOL = 1 billion lamports)
- **Data** — arbitrary byte array (up to 10MB, but practically limited)
- **Owner** — the program that controls this account
- **Executable** — boolean flag, true for program accounts
- **Rent Epoch** — tracks rent exemption status

Programs receive accounts as inputs, read/modify them, and return them as outputs. A program can only modify accounts it owns.

## BPF Bytecode

Solana programs compile to Berkeley Packet Filter (BPF) bytecode, specifically the sBPF variant:

- Rust programs → compiled via `cargo build-sbf` → `.so` shared object files
- The SVM includes a BPF virtual machine (rbpf) that interprets this bytecode
- JIT compilation is available for improved performance
- Programs have a fixed instruction set: arithmetic, memory access, branching, function calls, syscalls

The BPF model was chosen because it is simple, sandboxed, and easy to verify for safety.

## Sealevel: Parallel Execution

Sealevel is Solana's parallel transaction execution engine. Here is how it works:

### Why Parallelism is Possible

Every Solana transaction must declare upfront which accounts it will read and write. This lets the scheduler identify independent transactions that can run simultaneously.

### Account Locks

- **Write lock** — exclusive access. Only one transaction can write to an account at a time.
- **Read lock** — shared access. Multiple transactions can read the same account concurrently.

The scheduler groups transactions into batches:
- Transactions with non-overlapping write sets run in parallel
- Transactions that conflict on a write lock are serialized

### Practical Impact

This is why you declare all accounts in your instruction's `Accounts` struct. It is not just for safety — it enables the runtime to parallelize execution across cores.

## Compute Units (CU)

Every operation in the SVM costs compute units. Each transaction has a compute budget.

### Defaults and Limits

- Default budget: **200,000 CU** per instruction
- Maximum budget: **1,400,000 CU** per transaction (with `SetComputeUnitLimit`)
- You can request a specific budget with the `ComputeBudgetProgram`

### Operation Costs (Approximate)

| Operation | CU Cost |
|-----------|---------|
| 64-bit add/sub/mul | 1 |
| SHA256 hash (per byte) | ~1 |
| `sol_log` (per call) | ~100 |
| Account data access | ~100 |
| CPI (per invocation) | ~1,000 |
| `create_account` | ~2,500 |
| Signature verification | ~2,000 |
| Borsh serialize/deserialize | varies with data size |

### Optimization Tips

- Minimize CPI depth (each CPI has overhead)
- Use zero-copy deserialization for large accounts
- Avoid unnecessary logging in production
- Pack data tightly to reduce serialization cost
- Pre-compute values off-chain when possible

## Syscalls

Programs interact with the runtime through syscalls:

| Syscall | Purpose |
|---------|---------|
| `sol_log` | Log a message (visible in transaction logs) |
| `sol_log_data` | Log structured data (base64 encoded) |
| `sol_invoke_signed` | Cross-program invocation with PDA signing |
| `sol_invoke` | Cross-program invocation (no PDA signing) |
| `sol_get_clock` | Get current slot, epoch, timestamp |
| `sol_get_rent` | Get rent parameters |
| `sol_create_program_address` | Derive a PDA (off-curve point) |
| `sol_memcpy` / `sol_memset` / `sol_memmove` | Memory operations |
| `sol_sha256` / `sol_keccak256` | Hash functions |
| `sol_secp256k1_recover` | Recover Ethereum-style signatures |

## Recent Innovations

### QUIC Transport
Replaced UDP for transaction ingestion. Provides congestion control and TLS encryption. Prevents spam attacks that previously caused network congestion.

### Stake-Weighted QoS
Transaction priority is now weighted by the stake of the validator forwarding it. Staked validators get proportional bandwidth, reducing spam from unstaked actors.

### Local Fee Markets
Fees are localized to the accounts being contended. If many transactions compete for the same account (e.g., a popular AMM pool), fees rise for that account — but unrelated transactions remain cheap.

### Compute Budget Prioritization
Transactions can include a priority fee (price per CU). Higher priority transactions are scheduled first within the banking stage. This creates a market for block space.

## Mental Model

Think of the SVM as a function:

```
execute(program_id, accounts[], instruction_data) → Result<(), ProgramError>
```

- The program is identified by `program_id`
- It receives a set of `accounts` (some readable, some writable)
- It receives `instruction_data` (arbitrary bytes — your function args)
- It returns success or an error
- Any modifications to accounts are committed on success, rolled back on failure
