# Transaction Size Analysis Reference

## Transaction Size Limits

### Description

Every Solana transaction must fit within 1232 bytes (the IPv6 MTU minus headers). Exceeding this limit causes the transaction to be rejected before it reaches the runtime. Understanding the byte-level breakdown is essential for optimizing complex transactions.

### Size Breakdown

| Component | Size | Notes |
|---|---|---|
| Signatures | 64 bytes each | One per signer. Most txs have 1 signer (64 bytes). |
| Compact-u16 signature count | 1-3 bytes | Encodes number of signatures. |
| Message header | 3 bytes | `num_required_signatures`, `num_readonly_signed`, `num_readonly_unsigned`. |
| Compact-u16 account count | 1-3 bytes | Encodes number of account addresses. |
| Account addresses | 32 bytes each | Every unique account in the transaction. |
| Recent blockhash | 32 bytes | Exactly 32 bytes, always present. |
| Compact-u16 instruction count | 1-3 bytes | Encodes number of instructions. |
| Per instruction: program ID index | 1 byte | Index into the account addresses array. |
| Per instruction: compact-u16 account count | 1-3 bytes | Number of accounts for this instruction. |
| Per instruction: account indices | 1 byte each | Index into the account addresses array. |
| Per instruction: compact-u16 data length | 1-3 bytes | Length of instruction data. |
| Per instruction: data | variable | The serialized instruction data. |

### Size Formula

```
total_size =
  compact_u16(num_signatures)           // 1-3 bytes
  + (num_signatures * 64)               // signature data
  + 3                                   // message header
  + compact_u16(num_accounts)           // 1-3 bytes
  + (num_accounts * 32)                 // account addresses
  + 32                                  // recent blockhash
  + compact_u16(num_instructions)       // 1-3 bytes
  + sum_for_each_instruction(
      1                                 // program ID index
      + compact_u16(ix_account_count)   // 1-3 bytes
      + ix_account_count                // account indices
      + compact_u16(ix_data_length)     // 1-3 bytes
      + ix_data_length                  // instruction data
    )
```

### Practical Limits

With 1 signer, 1 instruction:
- Fixed overhead: ~100 bytes (signature + header + blockhash + encoding)
- Remaining for accounts + data: ~1132 bytes
- Max unique accounts (no data): ~35 accounts
- Max instruction data (5 accounts): ~940 bytes

### Optimization Strategy

- Minimize unique account count (each costs 32 bytes).
- Keep instruction data compact (use efficient serialization).
- Use versioned transactions with address lookup tables for account-heavy transactions.

---

## Instruction Data Serialization

### Description

Instruction data is the payload sent to your program. The serialization format determines how many bytes each field consumes. Anchor uses borsh serialization with an 8-byte discriminator prefix.

### Size Impact

| Format | Overhead | Field Encoding |
|---|---|---|
| Anchor/Borsh | 8-byte discriminator | Compact: u8=1B, u16=2B, u32=4B, u64=8B, Pubkey=32B, Vec\<T\>=4B length + items, String=4B length + UTF-8, Option\<T\>=1B tag + T if Some |
| Native/Manual | No discriminator (unless you add one) | You control every byte |
| Zero-copy | 8-byte discriminator (Anchor) | Fixed-size, no length prefixes, repr(C) layout |

### Code Example

```rust
// Borsh-serialized instruction data
// initialize(name: String, amount: u64, recipient: Pubkey)
// Anchor discriminator:    8 bytes
// name (e.g., "hello"):    4 (length) + 5 (utf-8) = 9 bytes
// amount:                  8 bytes
// recipient:               32 bytes
// Total:                   57 bytes

// Manual serialization of the same data
// Custom 1-byte tag:       1 byte
// name length (u8):        1 byte (max 255 chars)
// name data:               5 bytes
// amount:                  8 bytes
// recipient:               32 bytes
// Total:                   47 bytes (saves 10 bytes)
```

### Optimization Strategy

- For simple instructions, consider manual serialization to avoid borsh overhead.
- Use fixed-size fields where possible to avoid length prefixes.
- If you have optional fields, consider using bitflags instead of `Option<T>` (saves the 1-byte tag when you have many optional fields packed into a single byte).
- Anchor discriminator is mandatory in Anchor programs but can be made smaller in native programs (or use a 1-byte instruction tag).

---

## Account Meta Compression with Address Lookup Tables

### Description

Legacy transactions include the full 32-byte public key for every unique account. Versioned transactions (v0) support address lookup tables (ALTs) that reduce each looked-up account to a 1-byte index. This is critical for transactions with many accounts.

### Size Impact

| Approach | Per Account Cost | When Useful |
|---|---|---|
| Legacy transaction | 32 bytes per account | Fewer than 5 accounts |
| Versioned tx + ALT | 1 byte per lookup + 32 bytes for the ALT address | 5+ accounts that appear in the ALT |

An ALT entry costs 32 bytes for the ALT address itself, plus 1 byte per looked-up account. Break-even is at approximately 2 looked-up accounts (saves 32 bytes per additional account beyond the first).

### Code Example

```typescript
import {
  Connection,
  PublicKey,
  AddressLookupTableProgram,
  TransactionMessage,
  VersionedTransaction,
  SystemProgram,
} from "@solana/web3.js";

// Step 1: Create an Address Lookup Table
async function createALT(
  connection: Connection,
  payer: Keypair
): Promise<PublicKey> {
  const slot = await connection.getSlot();

  const [createIx, altAddress] = AddressLookupTableProgram.createLookupTable({
    authority: payer.publicKey,
    payer: payer.publicKey,
    recentSlot: slot,
  });

  // Send and confirm the create transaction...
  return altAddress;
}

// Step 2: Extend the ALT with addresses
async function extendALT(
  connection: Connection,
  payer: Keypair,
  altAddress: PublicKey,
  addresses: PublicKey[]
) {
  const extendIx = AddressLookupTableProgram.extendLookupTable({
    payer: payer.publicKey,
    authority: payer.publicKey,
    lookupTable: altAddress,
    addresses,
  });

  // Send and confirm...
}

// Step 3: Use the ALT in a versioned transaction
async function sendWithALT(
  connection: Connection,
  payer: Keypair,
  altAddress: PublicKey,
  instructions: TransactionInstruction[]
) {
  const altAccount = await connection.getAddressLookupTable(altAddress);
  if (!altAccount.value) throw new Error("ALT not found");

  const messageV0 = new TransactionMessage({
    payerKey: payer.publicKey,
    recentBlockhash: (await connection.getLatestBlockhash()).blockhash,
    instructions,
  }).compileToV0Message([altAccount.value]);

  const tx = new VersionedTransaction(messageV0);
  tx.sign([payer]);

  const sig = await connection.sendTransaction(tx);
  return sig;
}
```

### Optimization Strategy

- Create one ALT per program containing all commonly used accounts (program IDs, PDAs, token mints, etc.).
- ALTs need 1-2 slots to activate after creation or extension. Plan ahead.
- An ALT can hold up to 256 addresses.
- Multiple ALTs can be used in a single transaction.
- ALTs are persistent and reusable across transactions.

---

## Versioned Transactions

### Description

Versioned transactions (MessageV0) are the modern Solana transaction format that supports address lookup tables. They are backward-compatible and supported by all current validators and wallets.

### Size Impact

The MessageV0 format adds a 1-byte version prefix and the ALT reference section but saves 31 bytes per looked-up account (32 bytes full address replaced by 1 byte index).

**Size savings formula:**
```
savings = (num_lookup_accounts * 31) - (num_ALTs * 32) - encoding_overhead
```

For a transaction using 10 looked-up accounts from 1 ALT:
```
savings = (10 * 31) - (1 * 32) - ~5 = 273 bytes saved
```

### Code Example

```typescript
import {
  TransactionMessage,
  VersionedTransaction,
  TransactionInstruction,
  PublicKey,
  Connection,
  Keypair,
} from "@solana/web3.js";

async function buildVersionedTx(
  connection: Connection,
  payer: Keypair,
  instructions: TransactionInstruction[],
  lookupTableAccounts: AddressLookupTableAccount[]
): Promise<VersionedTransaction> {
  const { blockhash } = await connection.getLatestBlockhash();

  const messageV0 = new TransactionMessage({
    payerKey: payer.publicKey,
    recentBlockhash: blockhash,
    instructions,
  }).compileToV0Message(lookupTableAccounts);

  const tx = new VersionedTransaction(messageV0);
  tx.sign([payer]);
  return tx;
}
```

### Optimization Strategy

- Use versioned transactions by default for all new development.
- Migrate legacy transactions when they involve 5+ accounts.
- Ensure wallet compatibility (most modern wallets support v0).
- Some older programs or SDKs may not support versioned transactions, so test thoroughly.

---

## Transaction Packing Strategies

### Description

Solana allows multiple instructions in a single transaction. Packing related instructions together reduces overhead and enables atomic execution. When a single transaction exceeds 1232 bytes, you must split across multiple transactions or use Jito bundles for atomicity.

### Size Impact

**Packing saves:** Each additional transaction adds ~100 bytes of fixed overhead (signature, header, blockhash) plus a separate recent blockhash fetch and confirmation. Combining N instructions into 1 transaction saves `(N-1) * ~100` bytes of overhead.

**Splitting costs:** When splitting is necessary, you lose atomicity unless you use:
- Jito bundles (atomic multi-transaction execution, MEV-protected)
- Session keys or temporary state accounts (application-level atomicity)

### Code Example

```typescript
// Packing: multiple instructions in one transaction
const tx = new Transaction();
tx.add(computeBudgetIx);          // ~50 bytes
tx.add(priorityFeeIx);            // ~50 bytes
tx.add(initializeIx);             // variable
tx.add(configureIx);              // variable
// Total must be < 1232 bytes

// Splitting: check size before sending
function estimateTxSize(tx: Transaction, numSigners: number): number {
  // Rough estimate
  const signaturesSize = numSigners * 64 + 1;
  const headerSize = 3;
  const accountsSize = tx.instructions
    .flatMap((ix) => [ix.programId, ...ix.keys.map((k) => k.pubkey)])
    .filter((v, i, a) => a.findIndex((x) => x.equals(v)) === i).length * 32 + 1;
  const blockhashSize = 32;
  const instructionsSize = tx.instructions.reduce((sum, ix) => {
    return sum + 1 + 1 + ix.keys.length + 1 + ix.data.length;
  }, 1);
  return signaturesSize + headerSize + accountsSize + blockhashSize + instructionsSize;
}

// If estimated size > 1200 (leave margin), split into multiple txs
const MAX_SIZE = 1200;
```

### Optimization Strategy

- Always pack related instructions into a single transaction when they fit.
- Add compute budget and priority fee instructions first (they are small, ~50 bytes each).
- Estimate transaction size before adding instructions to avoid last-minute splitting.
- For atomic multi-transaction flows, use Jito bundles or implement application-level rollback.

---

## Priority Fee Calculation

### Description

Priority fees incentivize validators to include your transaction. The fee is calculated based on the requested CU limit (not the consumed amount), so over-requesting CU directly wastes lamports.

### Size Impact

Priority fee instructions add ~50 bytes to the transaction but do not affect CU measurement.

### Fee Formula

```
priority_fee_lamports = (cu_limit * cu_price_micro_lamports) / 1_000_000
```

Example: 200,000 CU limit at 50,000 micro-lamports/CU = 10,000 lamports = 0.00001 SOL.

### Code Example

```typescript
import { Connection, ComputeBudgetProgram } from "@solana/web3.js";

async function getOptimalPriorityFee(
  connection: Connection,
  accountKeys: PublicKey[]
): Promise<number> {
  const fees = await connection.getRecentPrioritizationFees({
    lockedWritableAccounts: accountKeys,
  });

  if (fees.length === 0) return 0;

  // Sort by fee, take the median for a reasonable estimate
  const sorted = fees
    .map((f) => f.prioritizationFee)
    .sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];

  return median;
}

// Usage
const cuLimit = 150_000;  // Set based on benchmark results
const cuPrice = await getOptimalPriorityFee(connection, writableAccounts);

const tx = new Transaction();
tx.add(ComputeBudgetProgram.setComputeUnitLimit({ units: cuLimit }));
tx.add(ComputeBudgetProgram.setComputeUnitPrice({ microLamports: cuPrice }));
tx.add(yourInstruction);
```

### Key Insight: CU Limit Directly Affects Cost

```
// BAD: default 200k limit when you only use 50k CU
// Fee = 200,000 * 50,000 / 1,000,000 = 10,000 lamports
tx.add(ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 50_000 }));
tx.add(yourInstruction);  // Uses 50,000 CU but pays for 200,000

// GOOD: set limit to actual usage + 20% buffer
// Fee = 60,000 * 50,000 / 1,000,000 = 3,000 lamports (70% savings!)
tx.add(ComputeBudgetProgram.setComputeUnitLimit({ units: 60_000 }));
tx.add(ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 50_000 }));
tx.add(yourInstruction);  // Uses 50,000 CU, pays for 60,000
```

### Optimization Strategy

- Always set an explicit CU limit based on benchmark data. Never rely on the 200,000 default.
- Use `getRecentPrioritizationFees` to estimate appropriate fee levels.
- Set CU limit to measured consumption + 10-20% buffer.
- Monitor fee trends: during congestion, higher fees may be needed.
- Over-requesting CU is the most common source of wasted priority fees.

---

## Size Audit Template

### Description

A reusable TypeScript script that breaks down a Solana transaction into its component sizes and identifies the largest contributors. Use this to find optimization targets when transactions are close to the 1232-byte limit.

### Code Example

```typescript
import {
  Connection,
  PublicKey,
  Transaction,
  VersionedTransaction,
  TransactionMessage,
} from "@solana/web3.js";

interface SizeBreakdown {
  total: number;
  remaining: number;
  signatures: { count: number; bytes: number };
  header: { bytes: number };
  accountKeys: { count: number; bytes: number; addresses: string[] };
  recentBlockhash: { bytes: number };
  instructions: {
    index: number;
    programId: string;
    accountCount: number;
    dataBytes: number;
    totalBytes: number;
  }[];
}

function analyzeTransactionSize(tx: Transaction, numSigners: number = 1): SizeBreakdown {
  // Collect all unique accounts
  const allAccounts = new Set<string>();
  for (const ix of tx.instructions) {
    allAccounts.add(ix.programId.toBase58());
    for (const key of ix.keys) {
      allAccounts.add(key.pubkey.toBase58());
    }
  }
  // Add fee payer if set
  if (tx.feePayer) {
    allAccounts.add(tx.feePayer.toBase58());
  }

  const accountCount = allAccounts.size;

  // Signature section
  const sigCountBytes = 1;  // compact-u16 for small counts
  const sigBytes = sigCountBytes + numSigners * 64;

  // Header
  const headerBytes = 3;

  // Account keys
  const accountCountBytes = 1;  // compact-u16
  const accountKeysBytes = accountCountBytes + accountCount * 32;

  // Blockhash
  const blockhashBytes = 32;

  // Instructions
  const ixCountBytes = 1;  // compact-u16
  let totalIxBytes = ixCountBytes;
  const ixDetails = tx.instructions.map((ix, i) => {
    const programIdIndex = 1;
    const ixAccountCount = 1 + ix.keys.length;  // compact-u16 + indices
    const ixDataLen = 1 + ix.data.length;        // compact-u16 + data
    const ixTotal = programIdIndex + ixAccountCount + ixDataLen;
    totalIxBytes += ixTotal;

    return {
      index: i,
      programId: ix.programId.toBase58().substring(0, 12) + "...",
      accountCount: ix.keys.length,
      dataBytes: ix.data.length,
      totalBytes: ixTotal,
    };
  });

  const total = sigBytes + headerBytes + accountKeysBytes + blockhashBytes + totalIxBytes;

  return {
    total,
    remaining: 1232 - total,
    signatures: { count: numSigners, bytes: sigBytes },
    header: { bytes: headerBytes },
    accountKeys: {
      count: accountCount,
      bytes: accountKeysBytes,
      addresses: [...allAccounts],
    },
    recentBlockhash: { bytes: blockhashBytes },
    instructions: ixDetails,
  };
}

function printSizeReport(breakdown: SizeBreakdown): void {
  console.log("=== Transaction Size Audit ===\n");
  console.log(`Total size:     ${breakdown.total} / 1232 bytes`);
  console.log(`Remaining:      ${breakdown.remaining} bytes`);
  console.log(`Utilization:    ${((breakdown.total / 1232) * 100).toFixed(1)}%\n`);

  console.log("--- Component Breakdown ---");
  console.log(`Signatures:     ${breakdown.signatures.bytes} bytes (${breakdown.signatures.count} signers)`);
  console.log(`Header:         ${breakdown.header.bytes} bytes`);
  console.log(`Account keys:   ${breakdown.accountKeys.bytes} bytes (${breakdown.accountKeys.count} accounts)`);
  console.log(`Blockhash:      ${breakdown.recentBlockhash.bytes} bytes`);

  console.log("\n--- Per-Instruction Breakdown ---");
  for (const ix of breakdown.instructions) {
    console.log(`  IX #${ix.index}: ${ix.totalBytes} bytes`);
    console.log(`    Program:  ${ix.programId}`);
    console.log(`    Accounts: ${ix.accountCount}`);
    console.log(`    Data:     ${ix.dataBytes} bytes`);
  }

  // Identify largest contributor
  const components = [
    { name: "Signatures", bytes: breakdown.signatures.bytes },
    { name: "Account keys", bytes: breakdown.accountKeys.bytes },
    ...breakdown.instructions.map((ix) => ({
      name: `Instruction #${ix.index} data`,
      bytes: ix.dataBytes,
    })),
  ];
  components.sort((a, b) => b.bytes - a.bytes);

  console.log("\n--- Optimization Targets (largest first) ---");
  for (const c of components.slice(0, 3)) {
    console.log(`  ${c.name}: ${c.bytes} bytes (${((c.bytes / breakdown.total) * 100).toFixed(1)}%)`);
  }

  if (breakdown.accountKeys.count > 4) {
    console.log(
      `\n[TIP] ${breakdown.accountKeys.count} accounts detected. ` +
      `Consider using Address Lookup Tables to save ~${(breakdown.accountKeys.count - 2) * 31} bytes.`
    );
  }

  if (breakdown.remaining < 100) {
    console.log(
      `\n[WARNING] Only ${breakdown.remaining} bytes remaining. ` +
      `Transaction is close to the 1232-byte limit.`
    );
  }
}

// Usage:
// const tx = new Transaction();
// tx.add(...instructions);
// const breakdown = analyzeTransactionSize(tx, 1);
// printSizeReport(breakdown);
```

### Optimization Strategy

Run this audit on every transaction in your application to identify:

1. **Account-heavy transactions** (>5 accounts): Migrate to versioned transactions with ALTs.
2. **Data-heavy instructions** (>200 bytes data): Optimize serialization or split into multiple instructions.
3. **Multi-signer transactions** (>2 signers): Each additional signer costs 64 bytes. Consider session keys or delegated authority patterns.
4. **Transactions near the limit** (<100 bytes remaining): Proactively optimize before adding new features that increase size.
