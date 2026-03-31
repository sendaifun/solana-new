# Program Health Checks Reference

Comprehensive health check procedures for monitoring deployed Solana programs. Each check includes what to verify, how to implement it, when to alert, and what evidence to collect.

---

## Program Account Existence

### Check Description

Verify that the program account exists on-chain and is marked as executable. This is the most fundamental health check — if the program account is gone, nothing else matters.

### How to Implement

```typescript
import { Connection, PublicKey } from "@solana/web3.js";

async function checkProgramExists(
  connection: Connection,
  programId: PublicKey
): Promise<{ exists: boolean; executable: boolean; owner: string }> {
  const accountInfo = await connection.getAccountInfo(programId);

  if (!accountInfo) {
    return { exists: false, executable: false, owner: "" };
  }

  return {
    exists: true,
    executable: accountInfo.executable,
    owner: accountInfo.owner.toBase58(),
  };
}
```

Key points:
- `getAccountInfo(programId)` returns `null` if the account does not exist.
- The `executable` field must be `true` for a valid program.
- The `owner` should be `BPFLoaderUpgradeab1e11111111111111111111111` for upgradeable programs or `BPFLoader2111111111111111111111111111111111` for non-upgradeable.
- If the account exists but `executable` is `false`, the program may have been closed or is in a corrupted state.

### Alert Threshold

- **CRITICAL**: Account not found (program may have been closed or never deployed).
- **CRITICAL**: Account exists but `executable` is `false`.
- **WARNING**: Owner is not a known BPF loader.

### Evidence to Collect

- Program ID queried.
- Account info response (or lack thereof).
- Timestamp of check.
- RPC endpoint used.

---

## Program Data Verification

### Check Description

Hash the on-chain program binary data to detect unauthorized upgrades. For upgradeable programs, the actual bytecode lives in a separate programdata account. Compare the current hash against the known-good hash captured at deployment time.

### How to Implement

```typescript
import { createHash } from "crypto";

async function verifyProgramData(
  connection: Connection,
  programId: PublicKey,
  expectedHash: string
): Promise<{ match: boolean; currentHash: string; dataLength: number }> {
  // For upgradeable programs, derive the programdata address
  const [programDataAddress] = PublicKey.findProgramAddressSync(
    [programId.toBuffer()],
    new PublicKey("BPFLoaderUpgradeab1e11111111111111111111111")
  );

  const programDataAccount = await connection.getAccountInfo(programDataAddress);

  if (!programDataAccount) {
    throw new Error("Program data account not found — program may not be upgradeable");
  }

  // Program data starts at byte offset 45 (after the UpgradeableLoaderState header)
  const programBytes = programDataAccount.data.slice(45);
  const hash = createHash("sha256").update(programBytes).digest("hex");

  return {
    match: hash === expectedHash,
    currentHash: hash,
    dataLength: programBytes.length,
  };
}
```

Key points:
- Upgradeable programs store bytecode in a separate programdata account.
- The programdata address is a PDA derived from the program ID and the BPF Upgradeable Loader.
- The first 45 bytes of the programdata account are the `UpgradeableLoaderState` header (contains the upgrade authority, slot of last deploy, etc.).
- Hash the bytecode portion only (bytes 45 onward).
- Store the "known-good" hash at deployment time in `build-context.json`.

### Alert Threshold

- **CRITICAL**: Hash mismatch — program binary has changed since last known-good deploy.
- **WARNING**: Program data account not found (may indicate program was made immutable or closed).
- **INFO**: Data length changed (may indicate a legitimate upgrade).

### Evidence to Collect

- Expected hash vs. current hash.
- Program data account address.
- Data length.
- Timestamp of check.

---

## Authority Verification

### Check Description

Check the upgrade authority for BPF upgradeable programs. The authority is the pubkey that can upgrade the program. If this changes unexpectedly, someone may have taken control of the program.

### How to Implement

```typescript
async function checkAuthority(
  connection: Connection,
  programId: PublicKey,
  expectedAuthority: PublicKey | null // null means immutable
): Promise<{ authorityMatch: boolean; currentAuthority: string | null }> {
  const [programDataAddress] = PublicKey.findProgramAddressSync(
    [programId.toBuffer()],
    new PublicKey("BPFLoaderUpgradeab1e11111111111111111111111")
  );

  const programDataAccount = await connection.getAccountInfo(programDataAddress);

  if (!programDataAccount) {
    throw new Error("Program data account not found");
  }

  // Authority is stored at bytes 13-44 of the programdata account
  // Byte 12 is the "has authority" flag: 1 = has authority, 0 = immutable
  const hasAuthority = programDataAccount.data[12] === 1;

  let currentAuthority: string | null = null;
  if (hasAuthority) {
    currentAuthority = new PublicKey(
      programDataAccount.data.slice(13, 45)
    ).toBase58();
  }

  const expectedStr = expectedAuthority ? expectedAuthority.toBase58() : null;
  const authorityMatch = currentAuthority === expectedStr;

  return { authorityMatch, currentAuthority };
}
```

Key points:
- The upgrade authority is embedded in the programdata account header.
- A `null` authority means the program is immutable (cannot be upgraded).
- If the expected authority is a multisig, verify the multisig address, not individual signers.
- Authority changes are extremely rare in normal operation — any change warrants investigation.

### Alert Threshold

- **CRITICAL**: Authority changed to an unknown pubkey.
- **CRITICAL**: Authority was set (program was mutable) but is now null (program made immutable without notice).
- **WARNING**: Authority changed from single key to multisig or vice versa.
- **INFO**: Authority matches expected value.

### Evidence to Collect

- Expected authority pubkey.
- Current authority pubkey.
- Program data account address.
- Timestamp of change detection.
- Transaction signature that changed the authority (if discoverable).

---

## Transaction Success Rate

### Check Description

Monitor the success/failure ratio of recent transactions involving the program. A sudden spike in failures may indicate a bug, an attack, or an environmental issue (e.g., RPC problems, congestion).

### How to Implement

```typescript
async function checkTransactionSuccessRate(
  connection: Connection,
  programId: PublicKey,
  baselineFailureRate: number // e.g., 0.05 for 5%
): Promise<{
  total: number;
  successful: number;
  failed: number;
  failureRate: number;
  anomaly: boolean;
}> {
  const signatures = await connection.getSignaturesForAddress(programId, {
    limit: 100,
  });

  const successful = signatures.filter((sig) => sig.err === null).length;
  const failed = signatures.filter((sig) => sig.err !== null).length;
  const total = signatures.length;
  const failureRate = total > 0 ? failed / total : 0;

  // Anomaly if failure rate exceeds baseline by more than 20 percentage points
  const anomaly = failureRate > baselineFailureRate + 0.2;

  return { total, successful, failed, failureRate, anomaly };
}
```

Key points:
- `getSignaturesForAddress` returns the most recent transactions involving the program.
- The `err` field is `null` for successful transactions and an error object for failed ones.
- Use `limit: 100` for a recent snapshot. For deeper analysis, paginate with the `before` parameter.
- Baseline failure rate should be captured during initial deployment monitoring and stored in `build-context.json`.
- Some programs naturally have higher failure rates (e.g., DEXes with slippage failures).

### Alert Threshold

- **CRITICAL**: Failure rate exceeds baseline by >20 percentage points AND persists across 2+ consecutive checks.
- **WARNING**: Failure rate exceeds baseline by >10 percentage points.
- **INFO**: Failure rate within normal range.

### Evidence to Collect

- Total transactions checked.
- Success and failure counts.
- Current failure rate vs. baseline.
- Signatures of failed transactions (up to 10).
- Error codes from failed transactions.
- Time window covered by the 100 transactions.

---

## Account Balance Monitoring

### Check Description

Track SOL balances of program-owned PDAs, vault accounts, and any SPL token accounts controlled by the program. Unexpected balance changes may indicate a drain attack or unauthorized withdrawals.

### How to Implement

```typescript
async function monitorBalances(
  connection: Connection,
  accounts: { label: string; address: PublicKey; expectedMinBalance: number }[]
): Promise<{
  results: { label: string; address: string; balance: number; belowMin: boolean }[];
  drainDetected: boolean;
}> {
  const results = await Promise.all(
    accounts.map(async (account) => {
      const balance = await connection.getBalance(account.address);
      const balanceSol = balance / 1e9;
      return {
        label: account.label,
        address: account.address.toBase58(),
        balance: balanceSol,
        belowMin: balanceSol < account.expectedMinBalance,
      };
    })
  );

  // Drain detected if any tracked account drops more than 10% below prior reading
  const drainDetected = results.some((r) => r.belowMin);

  return { results, drainDetected };
}

// For SPL token accounts
async function monitorTokenBalances(
  connection: Connection,
  tokenAccounts: { label: string; address: PublicKey; mint: PublicKey }[]
): Promise<{ label: string; address: string; amount: string; decimals: number }[]> {
  const { TOKEN_PROGRAM_ID } = await import("@solana/spl-token");

  return Promise.all(
    tokenAccounts.map(async (account) => {
      const info = await connection.getTokenAccountBalance(account.address);
      return {
        label: account.label,
        address: account.address.toBase58(),
        amount: info.value.amount,
        decimals: info.value.decimals,
      };
    })
  );
}
```

Key points:
- Track both SOL and SPL token balances.
- Store baseline balances at first check in `build-context.json`.
- Compare current balances against baseline, not absolute thresholds (a DeFi vault might legitimately hold 0 SOL at times).
- For SOL: use `getBalance(address)` (returns lamports, divide by 1e9 for SOL).
- For SPL tokens: use `getTokenAccountBalance(address)`.
- Monitor rent-exempt minimum — accounts dropping below this will be garbage collected.

### Alert Threshold

- **CRITICAL**: Balance decreased by >10% without a corresponding user-initiated transaction.
- **CRITICAL**: Account balance dropped below rent-exempt minimum.
- **WARNING**: Unexpected balance increase (possible deposit to wrong account).
- **INFO**: Balance within expected range.

### Evidence to Collect

- Account address and label.
- Previous balance vs. current balance.
- Percentage change.
- Recent transactions that affected the balance.
- Timestamp of check.

---

## PDA State Verification

### Check Description

Fetch and deserialize key Program Derived Address (PDA) accounts owned by the program. Compare their state against expected invariants. Alert on impossible or unexpected states.

### How to Implement

```typescript
async function verifyPDAState(
  connection: Connection,
  programId: PublicKey,
  pdaConfigs: {
    label: string;
    seeds: Buffer[];
    expectedState: Record<string, unknown>;
    invariants: ((data: Record<string, unknown>) => boolean)[];
  }[]
): Promise<{
  results: {
    label: string;
    address: string;
    exists: boolean;
    invariantViolations: string[];
  }[];
}> {
  const results = await Promise.all(
    pdaConfigs.map(async (config) => {
      const [pdaAddress] = PublicKey.findProgramAddressSync(
        config.seeds,
        programId
      );

      const accountInfo = await connection.getAccountInfo(pdaAddress);

      if (!accountInfo) {
        return {
          label: config.label,
          address: pdaAddress.toBase58(),
          exists: false,
          invariantViolations: ["Account does not exist"],
        };
      }

      // Deserialize based on your program's schema
      // For Anchor programs, use the IDL to deserialize
      // For native programs, use borsh or custom deserialization
      const data = deserializeAccount(accountInfo.data, config.label);

      const violations = config.invariants
        .map((check, i) => {
          try {
            return check(data) ? null : `Invariant ${i} violated`;
          } catch (e) {
            return `Invariant ${i} threw error: ${e}`;
          }
        })
        .filter(Boolean) as string[];

      return {
        label: config.label,
        address: pdaAddress.toBase58(),
        exists: true,
        invariantViolations: violations,
      };
    })
  );

  return { results };
}
```

Key points:
- PDAs are deterministic — derive the address from the seeds and program ID.
- Invariants are program-specific. Examples:
  - A vault's `total_deposited` should always be >= `total_withdrawn`.
  - A governance proposal's `votes_for + votes_against` should equal `total_votes`.
  - An escrow's state should not be `Completed` if the token account still holds funds.
- For Anchor programs, use the IDL to deserialize account data.
- For native programs, use borsh deserialization with the program's data layout.
- Check that the account owner matches the expected program ID.

### Alert Threshold

- **CRITICAL**: Invariant violation detected (impossible state).
- **CRITICAL**: Key PDA account no longer exists (may have been closed).
- **WARNING**: State value outside expected range but not technically impossible.
- **INFO**: All invariants pass.

### Evidence to Collect

- PDA address and seeds used to derive it.
- Current deserialized state.
- Which invariants passed/failed.
- Account data (hex-encoded) for forensic analysis.
- Timestamp of check.

---

## IDL Comparison

### Check Description

For Anchor programs, fetch the on-chain IDL and compare it against the local IDL file. Differences may indicate an unauthorized upgrade that changed the program's interface.

### How to Implement

```typescript
import { Program, AnchorProvider } from "@coral-xyz/anchor";

async function compareIDL(
  connection: Connection,
  programId: PublicKey,
  localIdlPath: string
): Promise<{
  match: boolean;
  addedInstructions: string[];
  removedInstructions: string[];
  changedInstructions: string[];
}> {
  // Fetch on-chain IDL
  const provider = new AnchorProvider(connection, {} as any, {});
  const onChainIdl = await Program.fetchIdl(programId, provider);

  if (!onChainIdl) {
    return {
      match: false,
      addedInstructions: [],
      removedInstructions: [],
      changedInstructions: ["No on-chain IDL found"],
    };
  }

  // Load local IDL
  const localIdl = JSON.parse(
    require("fs").readFileSync(localIdlPath, "utf-8")
  );

  // Compare instructions
  const onChainIxNames = new Set(onChainIdl.instructions.map((ix: any) => ix.name));
  const localIxNames = new Set(localIdl.instructions.map((ix: any) => ix.name));

  const addedInstructions = [...onChainIxNames].filter(
    (name) => !localIxNames.has(name)
  );
  const removedInstructions = [...localIxNames].filter(
    (name) => !onChainIxNames.has(name)
  );

  // Check for argument/account changes in shared instructions
  const changedInstructions: string[] = [];
  for (const ix of onChainIdl.instructions) {
    const localIx = localIdl.instructions.find(
      (lix: any) => lix.name === ix.name
    );
    if (localIx) {
      const onChainArgs = JSON.stringify(ix.args);
      const localArgs = JSON.stringify(localIx.args);
      if (onChainArgs !== localArgs) {
        changedInstructions.push(`${ix.name}: arguments changed`);
      }

      const onChainAccounts = JSON.stringify(ix.accounts);
      const localAccounts = JSON.stringify(localIx.accounts);
      if (onChainAccounts !== localAccounts) {
        changedInstructions.push(`${ix.name}: accounts changed`);
      }
    }
  }

  const match =
    addedInstructions.length === 0 &&
    removedInstructions.length === 0 &&
    changedInstructions.length === 0;

  return { match, addedInstructions, removedInstructions, changedInstructions };
}
```

Key points:
- On-chain IDLs are stored at a deterministic PDA derived from the program ID.
- `Program.fetchIdl()` handles the PDA derivation and deserialization.
- Compare instruction names, argument types, and account lists.
- Also compare account types and events if present.
- A mismatch does not always mean malice — it could be a legitimate upgrade that the local IDL was not updated for.
- If no on-chain IDL exists, the program may be native (not Anchor) or the IDL was never published.

### Alert Threshold

- **CRITICAL**: Instructions removed or arguments changed (breaking change deployed without notice).
- **WARNING**: New instructions added (non-breaking but unexpected).
- **WARNING**: No on-chain IDL found for a program expected to have one.
- **INFO**: IDL matches local version exactly.

### Evidence to Collect

- List of added, removed, and changed instructions.
- Full diff of IDL changes.
- On-chain IDL account address.
- Local IDL file path and hash.
- Timestamp of comparison.
