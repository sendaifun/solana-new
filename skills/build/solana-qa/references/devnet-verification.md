# Devnet Verification

End-to-end verification procedures for confirming Solana dApps and programs work correctly on devnet. Simulation is not enough — these steps verify real on-chain behavior.

---

## 1. Devnet Airdrop

### Standard Airdrop

```typescript
import {
  Connection,
  clusterApiUrl,
  PublicKey,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

async function airdropSol(pubkey: PublicKey, amount: number = 1): Promise<void> {
  const sig = await connection.requestAirdrop(
    pubkey,
    amount * LAMPORTS_PER_SOL
  );
  const latestBlockhash = await connection.getLatestBlockhash();
  await connection.confirmTransaction(
    { signature: sig, ...latestBlockhash },
    "confirmed"
  );
  console.log(`Airdropped ${amount} SOL to ${pubkey.toBase58()}`);
}
```

**Steps:**
1. Generate or load a test keypair.
2. Request airdrop of 1-2 SOL.
3. Confirm the airdrop transaction before proceeding.
4. Verify balance is sufficient for planned tests.

**Rate Limits:**
- Maximum 2 SOL per airdrop request.
- Approximately 10 requests per minute per IP.
- If rate-limited, wait 60 seconds and retry.
- For larger amounts, make multiple requests sequentially.

**Fallback Options:**
- Devnet faucet web UI: `https://faucet.solana.com/`
- SOL Faucet: `https://solfaucet.com/`
- Pre-fund a devnet wallet and reuse across tests.

**Success Criteria:**
- Airdrop transaction confirmed.
- `connection.getBalance(pubkey)` returns expected amount.

**Failure Handling:**
- `Error: airdrop request failed` — rate limited or devnet faucet drained. Wait and retry.
- `TransactionExpiredBlockheightExceededError` — devnet congestion. Retry with fresh blockhash.
- Airdrop confirmed but balance is 0 — account may have been garbage collected (below rent-exempt minimum). This should not happen with 1+ SOL.

---

## 2. Program Deployment Verification

### Check Program Exists

```typescript
async function verifyProgramDeployed(programId: PublicKey): Promise<boolean> {
  const accountInfo = await connection.getAccountInfo(programId);

  if (!accountInfo) {
    console.error("Program account does not exist on devnet");
    return false;
  }

  if (!accountInfo.executable) {
    console.error("Account exists but is not executable (not a program)");
    return false;
  }

  console.log(`Program ${programId.toBase58()} is deployed and executable`);
  console.log(`  Owner: ${accountInfo.owner.toBase58()}`);
  console.log(`  Data length: ${accountInfo.data.length} bytes`);
  console.log(`  Lamports: ${accountInfo.lamports}`);

  return true;
}
```

**Steps:**
1. Call `getAccountInfo(programId)` on devnet.
2. Verify `accountInfo` is not null (program exists).
3. Verify `accountInfo.executable` is true.
4. Verify `accountInfo.owner` is `BPFLoaderUpgradeab1e11111111111111111111111`.

**Check Upgrade Authority:**

```typescript
import { PublicKey } from "@solana/web3.js";

async function checkUpgradeAuthority(programId: PublicKey): Promise<void> {
  // The program data account is a PDA of the program account
  const [programDataAddress] = PublicKey.findProgramAddressSync(
    [programId.toBuffer()],
    new PublicKey("BPFLoaderUpgradeab1e11111111111111111111111")
  );

  const programData = await connection.getAccountInfo(programDataAddress);
  if (programData) {
    // Upgrade authority is at offset 13, 32 bytes (Option<Pubkey>)
    const hasAuthority = programData.data[12] === 1;
    if (hasAuthority) {
      const authority = new PublicKey(programData.data.slice(13, 45));
      console.log(`Upgrade authority: ${authority.toBase58()}`);
    } else {
      console.log("Program is immutable (no upgrade authority)");
    }
  }
}
```

**Success Criteria:**
- Program account exists and is executable.
- Program data size matches expected compiled binary size (approximately).
- Upgrade authority is as expected (deployer's key or null for immutable).

**Failure Handling:**
- Program not found — not deployed to devnet yet. Run `solana program deploy`.
- Account exists but not executable — wrong account or deployment failed midway. Redeploy.
- Wrong upgrade authority — security concern. Verify deployment wallet.

---

## 3. Transaction Confirmation Levels

### Understanding Confirmation Levels

| Level | Meaning | Speed | Safety |
|-------|---------|-------|--------|
| `processed` | Seen by connected RPC node | Fastest (~400ms) | May be rolled back |
| `confirmed` | Voted on by supermajority | Medium (~1-2s) | Very unlikely to roll back |
| `finalized` | Rooted (31+ confirmations) | Slowest (~15-30s) | Permanent |

### Recommended Usage

```typescript
// For testing: use "confirmed" (fast enough, safe enough)
const sig = await sendAndConfirmTransaction(connection, tx, [payer], {
  commitment: "confirmed",
});

// Wait for specific confirmation level
async function waitForConfirmation(
  sig: string,
  level: "processed" | "confirmed" | "finalized" = "confirmed"
): Promise<boolean> {
  const latestBlockhash = await connection.getLatestBlockhash();

  const result = await connection.confirmTransaction(
    {
      signature: sig,
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
    },
    level
  );

  if (result.value.err) {
    console.error("Transaction confirmed but failed:", result.value.err);
    return false;
  }

  console.log(`Transaction ${sig} confirmed at "${level}" level`);
  return true;
}
```

**Steps:**
1. Send transaction and receive signature.
2. Call `confirmTransaction` with desired commitment level.
3. Check `result.value.err` — a confirmed transaction can still have failed.
4. Only assert account state after confirmation.

**Success Criteria:**
- `confirmTransaction` resolves without timeout.
- `result.value.err` is null.
- Account state reflects the transaction's effects.

**Failure Handling:**
- `TransactionExpiredBlockheightExceededError` — transaction dropped. Rebuild with fresh blockhash and retry.
- Confirmation timeout — devnet may be slow. Increase timeout or switch to a faster RPC.
- Transaction confirmed with error — check logs for the specific failure reason.

---

## 4. Explorer Verification

### Build Explorer URLs

```typescript
function getExplorerUrl(
  signature: string,
  cluster: string = "devnet"
): string {
  return `https://explorer.solana.com/tx/${signature}?cluster=${cluster}`;
}

function getAccountExplorerUrl(
  address: string,
  cluster: string = "devnet"
): string {
  return `https://explorer.solana.com/address/${address}?cluster=${cluster}`;
}

// After each test, log the explorer link
console.log("Verify on Explorer:", getExplorerUrl(txSignature));
```

### What to Verify on Explorer

**Steps:**
1. Open the transaction URL in a browser.
2. Verify the transaction shows "Success" status.
3. Check the "Instructions" tab — verify the correct program was invoked.
4. Check the "Account Inputs" — verify the right accounts were passed.
5. Check the "Program Logs" — verify expected log messages appear.
6. Check the "SOL Balance Changes" — verify correct amounts transferred.
7. Check the "Token Balance Changes" — if applicable, verify token movements.

**Success Criteria:**
- Transaction status is "Success".
- All expected instructions are present.
- Log messages match expected output.
- Balance changes are correct.

**Failure Handling:**
- Transaction not found — may not have been sent, or explorer has not indexed it yet. Wait a few seconds and refresh.
- Transaction shows "Failed" — expand the error section to see the exact failure reason and program logs.

---

## 5. Account State Verification

### Fetch and Verify Account Data

```typescript
async function verifyAccountState(
  address: PublicKey,
  expectedOwner: PublicKey,
  expectedDataSize: number
): Promise<void> {
  const accountInfo = await connection.getAccountInfo(address);

  // Account exists
  if (!accountInfo) {
    throw new Error(`Account ${address.toBase58()} does not exist`);
  }

  // Owner matches
  if (!accountInfo.owner.equals(expectedOwner)) {
    throw new Error(
      `Owner mismatch: expected ${expectedOwner.toBase58()}, got ${accountInfo.owner.toBase58()}`
    );
  }

  // Data size matches
  if (accountInfo.data.length !== expectedDataSize) {
    throw new Error(
      `Data size mismatch: expected ${expectedDataSize}, got ${accountInfo.data.length}`
    );
  }

  // Rent-exempt
  const rentExempt = await connection.getMinimumBalanceForRentExemption(
    accountInfo.data.length
  );
  if (accountInfo.lamports < rentExempt) {
    console.warn(
      `Account is NOT rent-exempt: has ${accountInfo.lamports}, needs ${rentExempt}`
    );
  }

  console.log(`Account ${address.toBase58()} verified:`);
  console.log(`  Owner: ${accountInfo.owner.toBase58()}`);
  console.log(`  Data: ${accountInfo.data.length} bytes`);
  console.log(`  Lamports: ${accountInfo.lamports}`);
  console.log(`  Rent-exempt: ${accountInfo.lamports >= rentExempt}`);
}
```

### Anchor Account Deserialization

```typescript
// Anchor automatically handles deserialization
const account = await program.account.myAccount.fetch(address);

// Verify each field
expect(account.authority.toBase58()).to.equal(expectedAuthority);
expect(account.value.toNumber()).to.equal(expectedValue);
expect(account.isActive).to.be.true;
expect(account.lastUpdated.toNumber()).to.be.greaterThan(0);
```

### Verify Rent-Exempt Balance

```typescript
async function checkRentExempt(address: PublicKey): Promise<boolean> {
  const accountInfo = await connection.getAccountInfo(address);
  if (!accountInfo) return false;

  const rentExempt = await connection.getMinimumBalanceForRentExemption(
    accountInfo.data.length
  );

  return accountInfo.lamports >= rentExempt;
}
```

**Success Criteria:**
- Account exists with correct owner program.
- Data size matches expected layout.
- Deserialized fields match expected values.
- Account is rent-exempt.

**Failure Handling:**
- Account not found — transaction creating it may have failed, or wrong address computed.
- Owner mismatch — account was created by a different program. Check PDA derivation.
- Data size mismatch — program's account struct changed since deployment. Redeploy.
- Not rent-exempt — insufficient lamports allocated during account creation. May be garbage collected.

---

## 6. RPC Health Checks

### Check RPC Status

```typescript
async function checkRpcHealth(): Promise<void> {
  // Basic health check
  try {
    const health = await fetch(connection.rpcEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "getHealth",
      }),
    });
    const result = await health.json();
    console.log("RPC health:", result.result); // Should be "ok"
  } catch (err) {
    console.error("RPC unreachable:", err.message);
  }

  // Check slot lag
  const slot = await connection.getSlot();
  const epochInfo = await connection.getEpochInfo();
  console.log(`Current slot: ${slot}`);
  console.log(`Epoch: ${epochInfo.epoch}, slot in epoch: ${epochInfo.slotIndex}`);

  // Check version
  const version = await connection.getVersion();
  console.log(`Solana version: ${version["solana-core"]}`);
}
```

### Test Alternative RPC Endpoints

```typescript
const RPC_ENDPOINTS = {
  default: clusterApiUrl("devnet"),
  helius: "https://devnet.helius-rpc.com/?api-key=YOUR_KEY",
  quicknode: "https://YOUR_ENDPOINT.solana-devnet.quiknode.pro/YOUR_TOKEN",
};

async function findHealthyRpc(): Promise<string> {
  for (const [name, url] of Object.entries(RPC_ENDPOINTS)) {
    try {
      const conn = new Connection(url, "confirmed");
      const slot = await conn.getSlot();
      console.log(`${name}: healthy, slot ${slot}`);
      return url;
    } catch {
      console.log(`${name}: unreachable`);
    }
  }
  throw new Error("No healthy RPC endpoint found");
}
```

**Steps:**
1. Call `getHealth()` — expect `"ok"`.
2. Check current slot to verify the node is synced.
3. Compare slot across multiple RPC providers to detect lag.
4. Verify the RPC version supports features you need (e.g., versioned transactions require 1.10+).

**Success Criteria:**
- Health returns `"ok"`.
- Slot is within a few slots of other providers.
- RPC version supports all required features.

**Failure Handling:**
- Health returns `"behind"` — RPC node is catching up. Switch to another provider.
- Connection refused — endpoint is down. Fall back to default devnet RPC.
- Slot lag > 100 slots — RPC is significantly behind. Use a different provider for testing.

---

## 7. End-to-End Flow

### Full User Journey Test

```typescript
async function runEndToEndTest(): Promise<{
  success: boolean;
  signatures: string[];
  errors: string[];
}> {
  const signatures: string[] = [];
  const errors: string[] = [];

  try {
    // Step 1: Airdrop
    console.log("Step 1: Airdrop SOL...");
    const airdropSig = await connection.requestAirdrop(
      payer.publicKey,
      2 * LAMPORTS_PER_SOL
    );
    const latestBlockhash = await connection.getLatestBlockhash();
    await connection.confirmTransaction(
      { signature: airdropSig, ...latestBlockhash },
      "confirmed"
    );
    signatures.push(airdropSig);
    console.log("  Airdrop confirmed:", airdropSig);

    // Step 2: Create accounts
    console.log("Step 2: Initialize accounts...");
    const initSig = await program.methods
      .initialize(new anchor.BN(100))
      .accounts({
        myAccount: myAccount.publicKey,
        user: payer.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([myAccount, payer])
      .rpc();
    signatures.push(initSig);
    console.log("  Initialize confirmed:", initSig);

    // Step 3: Execute core instructions
    console.log("Step 3: Execute instructions...");
    const execSig = await program.methods
      .doSomething(new anchor.BN(42))
      .accounts({
        myAccount: myAccount.publicKey,
        authority: payer.publicKey,
      })
      .signers([payer])
      .rpc();
    signatures.push(execSig);
    console.log("  Instruction confirmed:", execSig);

    // Step 4: Verify state
    console.log("Step 4: Verify account state...");
    const account = await program.account.myAccount.fetch(myAccount.publicKey);
    if (account.value.toNumber() !== 42) {
      errors.push(
        `Expected value 42, got ${account.value.toNumber()}`
      );
    }

    // Step 5: Clean up (optional — devnet accounts persist but cost nothing)
    console.log("Step 5: Close accounts (optional)...");
    try {
      const closeSig = await program.methods
        .close()
        .accounts({
          myAccount: myAccount.publicKey,
          authority: payer.publicKey,
        })
        .signers([payer])
        .rpc();
      signatures.push(closeSig);
      console.log("  Close confirmed:", closeSig);
    } catch {
      console.log("  Close skipped (no close instruction)");
    }

    // Generate explorer links
    console.log("\nExplorer links:");
    for (const sig of signatures) {
      console.log(`  https://explorer.solana.com/tx/${sig}?cluster=devnet`);
    }

    return {
      success: errors.length === 0,
      signatures,
      errors,
    };
  } catch (err) {
    errors.push(err.message);
    return { success: false, signatures, errors };
  }
}
```

### Recording Results for QA Report

```typescript
interface TestResult {
  name: string;
  category: string;
  status: "pass" | "fail" | "skipped";
  evidence: string; // transaction signature, error message, or skip reason
  duration_ms: number;
}

async function recordTestResult(
  name: string,
  category: string,
  testFn: () => Promise<string> // returns evidence (e.g., tx signature)
): Promise<TestResult> {
  const start = Date.now();
  try {
    const evidence = await testFn();
    return {
      name,
      category,
      status: "pass",
      evidence,
      duration_ms: Date.now() - start,
    };
  } catch (err) {
    return {
      name,
      category,
      status: "fail",
      evidence: err.message,
      duration_ms: Date.now() - start,
    };
  }
}

// Usage
const results: TestResult[] = [];

results.push(
  await recordTestResult("Airdrop SOL", "devnet", async () => {
    const sig = await connection.requestAirdrop(pubkey, LAMPORTS_PER_SOL);
    await connection.confirmTransaction(sig, "confirmed");
    return sig;
  })
);

results.push(
  await recordTestResult("Initialize account", "program", async () => {
    const sig = await program.methods.initialize(new BN(1)).accounts({...}).rpc();
    return sig;
  })
);

// Calculate pass rate
const passRate =
  (results.filter((r) => r.status === "pass").length / results.length) * 100;
console.log(`Pass rate: ${passRate}%`);
```

### Generating the QA Report

After all tests complete, the QA report should be written as a local HTML file containing:
- Test run metadata (timestamp, project, network, RPC endpoint).
- Summary: total tests, passed, failed, skipped, pass rate percentage.
- Table of all test results with name, category, status, evidence (clickable explorer links for passing on-chain tests), and duration.
- Failing tests highlighted in red with full error details.
- Skipped tests in yellow with skip reason.

The report file should be saved to the project root as `qa-report.html` and the path logged to the console.
