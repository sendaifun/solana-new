# On-Chain Metrics Reference

How to gather and interpret on-chain metrics for Solana program retrospectives. Each metric includes what to measure, how to measure it, code examples, and interpretation guidance.

---

## Transaction Volume

### Metric Name

Total transactions involving the program within the sprint time window.

### How to Measure

Use `getSignaturesForAddress` to fetch transaction signatures for the program ID, filtered by the sprint date range.

### Code Example

```typescript
import { Connection, PublicKey } from "@solana/web3.js";

async function getTransactionVolume(
  connection: Connection,
  programId: PublicKey,
  since: Date,
  until: Date
): Promise<{
  total: number;
  successful: number;
  failed: number;
  dailyAverage: number;
}> {
  const sinceTimestamp = Math.floor(since.getTime() / 1000);
  const untilTimestamp = Math.floor(until.getTime() / 1000);

  let allSignatures: any[] = [];
  let lastSignature: string | undefined;

  // Paginate through all signatures in the time window
  while (true) {
    const options: any = { limit: 1000 };
    if (lastSignature) options.before = lastSignature;

    const signatures = await connection.getSignaturesForAddress(programId, options);

    if (signatures.length === 0) break;

    // Filter by timestamp
    const inRange = signatures.filter(
      (sig) =>
        sig.blockTime &&
        sig.blockTime >= sinceTimestamp &&
        sig.blockTime <= untilTimestamp
    );

    // If we've gone past our time window, stop
    const earliest = signatures[signatures.length - 1];
    if (earliest.blockTime && earliest.blockTime < sinceTimestamp) {
      allSignatures.push(...inRange);
      break;
    }

    allSignatures.push(...inRange);
    lastSignature = signatures[signatures.length - 1].signature;
  }

  const successful = allSignatures.filter((sig) => sig.err === null).length;
  const failed = allSignatures.filter((sig) => sig.err !== null).length;
  const days = Math.max(1, (until.getTime() - since.getTime()) / (1000 * 60 * 60 * 24));

  return {
    total: allSignatures.length,
    successful,
    failed,
    dailyAverage: Math.round(allSignatures.length / days),
  };
}
```

### What Good Looks Like

- Steady or growing transaction count sprint-over-sprint.
- Failure rate below 10% (varies by program type — DEXes naturally have higher failure rates due to slippage).
- Daily average is consistent (no sudden drops to zero).

### Red Flags

- Transaction volume dropped to zero mid-sprint (program may be broken or unused).
- Failure rate spiked above 20% (possible bug or attack).
- All transactions in a short burst followed by nothing (one-time use, not sustained adoption).

---

## Unique Users

### Metric Name

Count of unique wallet addresses that interacted with the program during the sprint.

### How to Measure

Extract the first signer (fee payer) from each transaction as a proxy for the user. Count unique pubkeys.

### Code Example

```typescript
async function getUniqueUsers(
  connection: Connection,
  programId: PublicKey,
  since: Date,
  until: Date
): Promise<{
  uniqueUsers: number;
  newUsers: number;
  returningUsers: number;
  topUsers: { pubkey: string; txCount: number }[];
}> {
  const sinceTimestamp = Math.floor(since.getTime() / 1000);
  const untilTimestamp = Math.floor(until.getTime() / 1000);

  // Get signatures in range (use pagination as shown in Transaction Volume)
  const signatures = await getSignaturesInRange(connection, programId, since, until);

  // Fetch transaction details to get signers
  const userCounts = new Map<string, number>();

  // Process in batches to avoid rate limits
  const batchSize = 20;
  for (let i = 0; i < signatures.length; i += batchSize) {
    const batch = signatures.slice(i, i + batchSize);

    const txs = await Promise.all(
      batch.map((sig) =>
        connection.getTransaction(sig.signature, {
          maxSupportedTransactionVersion: 0,
        })
      )
    );

    for (const tx of txs) {
      if (!tx) continue;

      // First signer is the fee payer (user)
      const feePayer = tx.transaction.message.getAccountKeys().get(0);
      if (feePayer) {
        const key = feePayer.toBase58();
        userCounts.set(key, (userCounts.get(key) || 0) + 1);
      }
    }
  }

  const uniqueUsers = userCounts.size;

  // Sort by transaction count for top users
  const topUsers = [...userCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([pubkey, txCount]) => ({ pubkey, txCount }));

  // To determine new vs returning, compare against prior sprint's user set
  // (requires storing prior user sets in build context)
  return {
    uniqueUsers,
    newUsers: uniqueUsers, // Update if prior sprint data is available
    returningUsers: 0,     // Update if prior sprint data is available
    topUsers,
  };
}
```

### What Good Looks Like

- Growing unique user count sprint-over-sprint.
- Mix of new and returning users (indicates both acquisition and retention).
- No single user dominating (unless expected, e.g., a cranker bot).

### Red Flags

- Unique users dropped significantly from prior sprint.
- Single user accounts for >80% of transactions (may be a bot, not organic usage).
- Zero new users (stalled growth).
- Users interact once and never return (poor retention).

---

## Program Deploy History

### Metric Name

Tracking upgrades and deploys of the program during the sprint.

### How to Measure

Check the programdata account's `last_deploy_slot` to determine when the program was last upgraded.

### Code Example

```typescript
async function getDeployHistory(
  connection: Connection,
  programId: PublicKey
): Promise<{
  lastDeploySlot: number;
  lastDeployTimestamp: number | null;
  isUpgradeable: boolean;
  authority: string | null;
}> {
  const [programDataAddress] = PublicKey.findProgramAddressSync(
    [programId.toBuffer()],
    new PublicKey("BPFLoaderUpgradeab1e11111111111111111111111")
  );

  const programDataAccount = await connection.getAccountInfo(programDataAddress);

  if (!programDataAccount) {
    return {
      lastDeploySlot: 0,
      lastDeployTimestamp: null,
      isUpgradeable: false,
      authority: null,
    };
  }

  // Parse the UpgradeableLoaderState header
  // Bytes 4-12: last deploy slot (u64, little-endian)
  const lastDeploySlot = Number(
    programDataAccount.data.readBigUInt64LE(4)
  );

  // Get block time for the deploy slot
  let lastDeployTimestamp: number | null = null;
  try {
    lastDeployTimestamp = await connection.getBlockTime(lastDeploySlot);
  } catch {
    // Block time may not be available for very old slots
  }

  // Byte 12: has authority flag
  const hasAuthority = programDataAccount.data[12] === 1;
  const authority = hasAuthority
    ? new PublicKey(programDataAccount.data.slice(13, 45)).toBase58()
    : null;

  return {
    lastDeploySlot,
    lastDeployTimestamp,
    isUpgradeable: hasAuthority,
    authority,
  };
}
```

### What Good Looks Like

- Deploys happen during planned release windows.
- Deploy frequency matches the team's release cadence.
- Authority is the expected key (team multisig or deployer wallet).

### Red Flags

- Deploy happened outside the sprint window but program behavior changed (possible unauthorized upgrade).
- Multiple deploys in rapid succession (may indicate deployment issues or hotfixes).
- Authority changed without team awareness.
- Deploy slot is 0 or unparseable (data corruption or non-standard program).

---

## SOL Flow

### Metric Name

Net SOL inflow and outflow through program-owned accounts during the sprint.

### How to Measure

Track lamport balance changes in program-owned accounts. Compare beginning-of-sprint balances with end-of-sprint balances and identify the largest transactions.

### Code Example

```typescript
async function analyzeSOLFlow(
  connection: Connection,
  trackedAccounts: { label: string; address: PublicKey }[],
  since: Date,
  until: Date
): Promise<{
  accounts: {
    label: string;
    address: string;
    startBalance: number;
    endBalance: number;
    netFlow: number;
  }[];
  totalNetFlow: number;
  largestTransaction: { signature: string; lamports: number } | null;
}> {
  // Note: Historical balances require an archive node or indexer.
  // For simplicity, use current balance and estimate flow from transactions.

  const accounts = await Promise.all(
    trackedAccounts.map(async (account) => {
      const currentBalance = await connection.getBalance(account.address);

      // Get transactions for this account in the time window
      const signatures = await getSignaturesInRange(
        connection,
        account.address,
        since,
        until
      );

      // Calculate net flow from transaction pre/post balances
      let netFlow = 0;
      let largestTx: { signature: string; lamports: number } | null = null;

      for (const sig of signatures.slice(0, 50)) {
        const tx = await connection.getTransaction(sig.signature, {
          maxSupportedTransactionVersion: 0,
        });
        if (!tx?.meta) continue;

        const accountIndex = tx.transaction.message
          .getAccountKeys()
          .staticAccountKeys.findIndex((key) =>
            key.equals(account.address)
          );

        if (accountIndex >= 0) {
          const pre = tx.meta.preBalances[accountIndex];
          const post = tx.meta.postBalances[accountIndex];
          const change = post - pre;
          netFlow += change;

          if (Math.abs(change) > Math.abs(largestTx?.lamports || 0)) {
            largestTx = { signature: sig.signature, lamports: change };
          }
        }
      }

      return {
        label: account.label,
        address: account.address.toBase58(),
        startBalance: (currentBalance - netFlow) / 1e9,
        endBalance: currentBalance / 1e9,
        netFlow: netFlow / 1e9,
      };
    })
  );

  const totalNetFlow = accounts.reduce((sum, a) => sum + a.netFlow, 0);

  return {
    accounts,
    totalNetFlow,
    largestTransaction: accounts.reduce(
      (max, _) => max,
      null as { signature: string; lamports: number } | null
    ),
  };
}
```

### What Good Looks Like

- Net inflow is positive or stable (program is collecting fees or holding value).
- No single withdrawal exceeds a reasonable percentage of total balance.
- SOL flow correlates with transaction volume (more users = more flow).

### Red Flags

- Large unexpected outflow (>10% of total balance) without corresponding user action.
- All SOL drained from a vault or treasury account.
- Inflow dropped to zero (users stopped depositing).
- Large flow to an unknown or unrecognized address.

---

## Account Creation Rate

### Metric Name

Rate of new accounts created by the program (PDAs, user accounts, etc.).

### How to Measure

Count accounts owned by the program and track growth over time. For programs that create user-specific accounts (e.g., token accounts, game profiles), this indicates adoption.

### Code Example

```typescript
async function getAccountCreationRate(
  connection: Connection,
  programId: PublicKey,
  priorAccountCount?: number
): Promise<{
  totalAccounts: number;
  newAccounts: number | null;
  growthRate: number | null;
}> {
  // Get all accounts owned by the program
  // WARNING: This can be slow/expensive for programs with many accounts
  const accounts = await connection.getProgramAccounts(programId, {
    dataSlice: { offset: 0, length: 0 }, // Don't fetch data, just count
  });

  const totalAccounts = accounts.length;

  let newAccounts: number | null = null;
  let growthRate: number | null = null;

  if (priorAccountCount !== undefined && priorAccountCount > 0) {
    newAccounts = totalAccounts - priorAccountCount;
    growthRate = (newAccounts / priorAccountCount) * 100;
  }

  return { totalAccounts, newAccounts, growthRate };
}
```

Key points:
- `getProgramAccounts` can be expensive — use `dataSlice: { offset: 0, length: 0 }` to avoid fetching account data.
- Some RPC providers limit `getProgramAccounts` results or charge extra for it.
- Store the account count in build context after each retro for comparison.
- For programs with many accounts (>10,000), consider using a Geyser plugin or indexer instead.

### What Good Looks Like

- Steady account creation growth (indicates new users onboarding).
- Growth rate proportional to transaction volume.
- No mass account closures.

### Red Flags

- Account count decreased (accounts were closed, possibly by the program or an attacker).
- Spike in account creation followed by no activity (bot/spam accounts).
- Zero new accounts (no new users).
- Account count growing but transaction volume flat (accounts created but not used).

---

## Error Analysis

### Metric Name

Breakdown of errors from failed transactions involving the program.

### How to Measure

From failed transaction signatures, fetch the transaction details and extract error codes. Group by error type to identify patterns.

### Code Example

```typescript
async function analyzeErrors(
  connection: Connection,
  programId: PublicKey,
  since: Date,
  until: Date
): Promise<{
  totalErrors: number;
  errorBreakdown: { errorType: string; count: number; percentage: number }[];
  mostCommonError: string;
  errorRateTrend: string;
}> {
  const signatures = await getSignaturesInRange(
    connection,
    programId,
    since,
    until
  );

  const failedSignatures = signatures.filter((sig) => sig.err !== null);
  const errorCounts = new Map<string, number>();

  for (const sig of failedSignatures) {
    // Extract error type from the err object
    const errorType = JSON.stringify(sig.err);
    errorCounts.set(errorType, (errorCounts.get(errorType) || 0) + 1);
  }

  const totalErrors = failedSignatures.length;

  const errorBreakdown = [...errorCounts.entries()]
    .map(([errorType, count]) => ({
      errorType,
      count,
      percentage: totalErrors > 0 ? (count / totalErrors) * 100 : 0,
    }))
    .sort((a, b) => b.count - a.count);

  // For more detail, fetch individual transactions
  // and parse the program-specific error from logs
  const detailedErrors: string[] = [];
  for (const sig of failedSignatures.slice(0, 10)) {
    try {
      const tx = await connection.getTransaction(sig.signature, {
        maxSupportedTransactionVersion: 0,
      });
      if (tx?.meta?.logMessages) {
        const errorLog = tx.meta.logMessages.find(
          (log) =>
            log.includes("Error") ||
            log.includes("failed") ||
            log.includes("panicked")
        );
        if (errorLog) detailedErrors.push(errorLog);
      }
    } catch {
      // Transaction details may not be available
    }
  }

  return {
    totalErrors,
    errorBreakdown,
    mostCommonError: errorBreakdown[0]?.errorType || "None",
    errorRateTrend: "stable", // Compare against prior sprint for actual trend
  };
}
```

### What Good Looks Like

- Low overall error rate (<10% of transactions).
- Errors are expected types (e.g., slippage exceeded, insufficient funds) — not program bugs.
- Error rate is stable or declining sprint-over-sprint.
- No new error types introduced this sprint.

### Red Flags

- New error type appeared that was not present in prior sprints (possible regression from upgrade).
- Single error type dominates (>50% of all errors) — likely a systematic issue.
- Error rate increased significantly from prior sprint.
- Errors include "panicked" or "access violation" — indicates a program bug, not a user error.
- Custom program error codes that do not match the IDL error enum (possible unauthorized upgrade).
