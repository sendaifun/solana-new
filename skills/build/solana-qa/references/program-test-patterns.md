# Program Test Patterns

Comprehensive patterns for testing Solana programs, covering unit tests, integration tests, and advanced scenarios.

---

## 1. Test Framework Setup

### When to Use Each Framework

| Framework | Use Case | Speed | Fidelity |
|-----------|----------|-------|----------|
| **bankrun (LiteSVM)** | Unit tests, fast iteration | Fastest | Simulated runtime |
| **solana-test-validator** | Integration tests, full runtime | Slow (real validator) | Full fidelity |
| **Surfpool** | Fork testing, mainnet state | Medium | Real state, simulated execution |

### bankrun (LiteSVM) Setup

```typescript
import { start } from "solana-bankrun";
import { PublicKey, Transaction, SystemProgram } from "@solana/web3.js";

// Start a lightweight Solana runtime
const context = await start(
  [
    // Load your program
    {
      name: "my_program",
      programId: new PublicKey("MyProgram11111111111111111111111111111111"),
    },
  ],
  []
);

const client = context.banksClient;
const payer = context.payer;
```

**Pros:** Sub-second test execution, no validator startup, deterministic.
**Cons:** Some syscalls not supported, no full RPC API.

### solana-test-validator Setup

```bash
# Start local validator with program loaded
solana-test-validator \
  --bpf-program MyProgram11111111111111111111111111111111 target/deploy/my_program.so \
  --reset
```

```typescript
import { Connection, Keypair } from "@solana/web3.js";

const connection = new Connection("http://localhost:8899", "confirmed");

// Airdrop to test payer
const payer = Keypair.generate();
const sig = await connection.requestAirdrop(payer.publicKey, 2e9);
await connection.confirmTransaction(sig);
```

**Pros:** Full Solana runtime, all RPC methods available, closest to production.
**Cons:** Slow startup (2-5 seconds), must manage validator lifecycle.

### Surfpool Fork Testing Setup

```bash
# Start Surfpool pointing at devnet
surfpool start --rpc-url https://api.devnet.solana.com
```

```typescript
const connection = new Connection("http://localhost:8899", "confirmed");
// Existing devnet accounts are available locally
// New transactions execute locally but read from forked state
```

**Pros:** Test against real program state, no deployment needed for existing programs.
**Cons:** Forked state may be stale, requires Surfpool installation.

---

## 2. Instruction Testing Pattern

The core pattern for testing any Solana program instruction.

### Anchor Pattern

```typescript
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { MyProgram } from "../target/types/my_program";
import { expect } from "chai";

describe("my_program", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.MyProgram as Program<MyProgram>;

  it("initializes an account", async () => {
    // 1. Create accounts
    const myAccount = anchor.web3.Keypair.generate();

    // 2. Build and send instruction
    const tx = await program.methods
      .initialize(new anchor.BN(42))
      .accounts({
        myAccount: myAccount.publicKey,
        user: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([myAccount])
      .rpc();

    console.log("Transaction signature:", tx);

    // 3. Assert account state
    const account = await program.account.myAccount.fetch(myAccount.publicKey);
    expect(account.value.toNumber()).to.equal(42);
    expect(account.authority.toString()).to.equal(
      provider.wallet.publicKey.toString()
    );
  });
});
```

### Native Program Pattern

```typescript
import {
  Connection,
  Keypair,
  Transaction,
  TransactionInstruction,
  SystemProgram,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import * as borsh from "borsh";

// Define instruction data layout
class InitializeArgs {
  value: number;
  constructor(fields: { value: number }) {
    this.value = fields.value;
  }
}

const InitializeSchema = new Map([
  [InitializeArgs, { kind: "struct", fields: [["value", "u64"]] }],
]);

it("initializes via native program", async () => {
  const myAccount = Keypair.generate();

  // Serialize instruction data
  const args = new InitializeArgs({ value: 42 });
  const data = Buffer.from(borsh.serialize(InitializeSchema, args));

  // Build instruction
  const ix = new TransactionInstruction({
    keys: [
      { pubkey: myAccount.publicKey, isSigner: true, isWritable: true },
      { pubkey: payer.publicKey, isSigner: true, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    programId: PROGRAM_ID,
    data: Buffer.concat([Buffer.from([0]), data]), // 0 = initialize discriminator
  });

  // Send
  const tx = new Transaction().add(ix);
  const sig = await sendAndConfirmTransaction(connection, tx, [
    payer,
    myAccount,
  ]);

  // Fetch and deserialize account
  const accountInfo = await connection.getAccountInfo(myAccount.publicKey);
  // Deserialize accountInfo.data based on your data layout
});
```

---

## 3. Account State Assertions

### Anchor Account Fetch

```typescript
// Fetch single account
const account = await program.account.myAccount.fetch(address);
expect(account.value.toNumber()).to.equal(42);
expect(account.isInitialized).to.be.true;

// Fetch multiple accounts
const accounts = await program.account.myAccount.all();
expect(accounts.length).to.be.greaterThan(0);

// Fetch with filter
const filtered = await program.account.myAccount.all([
  {
    memcmp: {
      offset: 8, // after discriminator
      bytes: authority.toBase58(),
    },
  },
]);
```

### Native Account Deserialization

```typescript
const accountInfo = await connection.getAccountInfo(address);

// Verify account exists
expect(accountInfo).to.not.be.null;

// Verify owner
expect(accountInfo.owner.toString()).to.equal(PROGRAM_ID.toString());

// Verify data length
expect(accountInfo.data.length).to.equal(EXPECTED_DATA_SIZE);

// Deserialize and verify fields
const decoded = borsh.deserialize(MyAccountSchema, MyAccount, accountInfo.data);
expect(decoded.value).to.equal(42);
```

### Balance Assertions

```typescript
// SOL balance
const balance = await connection.getBalance(address);
expect(balance).to.be.greaterThanOrEqual(rentExemptMinimum);

// Token balance
const tokenBalance = await connection.getTokenAccountBalance(tokenAccount);
expect(Number(tokenBalance.value.amount)).to.equal(expectedAmount);
expect(tokenBalance.value.decimals).to.equal(expectedDecimals);
```

---

## 4. Error Code Verification

### Anchor Error Testing

```typescript
it("fails with invalid authority", async () => {
  const wrongAuthority = Keypair.generate();

  try {
    await program.methods
      .update(new anchor.BN(99))
      .accounts({
        myAccount: myAccount.publicKey,
        authority: wrongAuthority.publicKey,
      })
      .signers([wrongAuthority])
      .rpc();

    // Should not reach here
    expect.fail("Expected an error");
  } catch (err) {
    expect(err).to.be.instanceOf(anchor.AnchorError);
    expect(err.error.errorCode.code).to.equal("ConstraintHasOne");
    // Or for custom errors:
    expect(err.error.errorCode.code).to.equal("Unauthorized");
    expect(err.error.errorCode.number).to.equal(6000);
  }
});
```

### Native Error Testing

```typescript
it("fails with expected program error", async () => {
  try {
    await sendAndConfirmTransaction(connection, badTx, [payer]);
    expect.fail("Expected transaction to fail");
  } catch (err) {
    // Check for specific InstructionError
    const logs = err.logs || [];
    expect(logs.some((log) => log.includes("Error: unauthorized"))).to.be.true;
  }
});
```

### Simulation for Error Checking

```typescript
// Simulate without sending — faster for error verification
const result = await connection.simulateTransaction(tx);

if (result.value.err) {
  console.log("Simulation error:", result.value.err);
  console.log("Logs:", result.value.logs);
  // Parse the error code from logs
}
```

---

## 5. CPI Chain Testing

### Testing Cross-Program Invocations

```typescript
it("CPI to token program works", async () => {
  // Your program calls Token Program internally
  const tx = await program.methods
    .transferTokens(new anchor.BN(1000))
    .accounts({
      from: sourceTokenAccount,
      to: destTokenAccount,
      authority: provider.wallet.publicKey,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .rpc();

  // Verify the CPI succeeded by checking token balances
  const sourceBalance = await connection.getTokenAccountBalance(
    sourceTokenAccount
  );
  const destBalance = await connection.getTokenAccountBalance(
    destTokenAccount
  );

  expect(Number(sourceBalance.value.amount)).to.equal(
    initialSourceAmount - 1000
  );
  expect(Number(destBalance.value.amount)).to.equal(initialDestAmount + 1000);
});
```

### Testing CPI Failure Propagation

```typescript
it("CPI failure propagates correctly", async () => {
  // Attempt CPI that should fail (e.g., insufficient balance)
  try {
    await program.methods
      .transferTokens(new anchor.BN(999999999))
      .accounts({
        from: sourceTokenAccount,
        to: destTokenAccount,
        authority: provider.wallet.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();
    expect.fail("Should have failed");
  } catch (err) {
    // Verify the CPI error surfaces through your program
    expect(err.logs.some((l) => l.includes("insufficient funds"))).to.be.true;
  }
});
```

---

## 6. PDA Derivation Testing

### Verify PDA Addresses

```typescript
it("derives correct PDA", async () => {
  const [pda, bump] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("my_seed"),
      authority.publicKey.toBuffer(),
    ],
    program.programId
  );

  // Initialize using the PDA
  await program.methods
    .initializeWithPda()
    .accounts({
      pdaAccount: pda,
      authority: authority.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .signers([authority])
    .rpc();

  // Verify PDA was created
  const account = await program.account.pdaAccount.fetch(pda);
  expect(account.bump).to.equal(bump);
  expect(account.authority.toString()).to.equal(authority.publicKey.toString());
});
```

### Test Different Seed Combinations

```typescript
it("different seeds produce different PDAs", async () => {
  const [pda1] = PublicKey.findProgramAddressSync(
    [Buffer.from("seed_a"), user.publicKey.toBuffer()],
    program.programId
  );

  const [pda2] = PublicKey.findProgramAddressSync(
    [Buffer.from("seed_b"), user.publicKey.toBuffer()],
    program.programId
  );

  expect(pda1.toString()).to.not.equal(pda2.toString());
});
```

### Verify Bump Consistency

```typescript
it("bump is consistent across derivations", async () => {
  const [pda1, bump1] = PublicKey.findProgramAddressSync(seeds, programId);
  const [pda2, bump2] = PublicKey.findProgramAddressSync(seeds, programId);

  expect(pda1.toString()).to.equal(pda2.toString());
  expect(bump1).to.equal(bump2);

  // Verify stored bump matches derived bump
  const account = await program.account.pdaAccount.fetch(pda1);
  expect(account.bump).to.equal(bump1);
});
```

---

## 7. Token Operations Testing

### Mint Tokens

```typescript
it("mints tokens correctly", async () => {
  await program.methods
    .mintTokens(new anchor.BN(1_000_000)) // 1 token with 6 decimals
    .accounts({
      mint: mintAddress,
      tokenAccount: recipientTokenAccount,
      mintAuthority: authority.publicKey,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .signers([authority])
    .rpc();

  const balance = await connection.getTokenAccountBalance(
    recipientTokenAccount
  );
  expect(Number(balance.value.amount)).to.equal(1_000_000);
  expect(balance.value.uiAmount).to.equal(1.0);
});
```

### Transfer Tokens

```typescript
it("transfers tokens between accounts", async () => {
  const amount = 500_000; // 0.5 tokens with 6 decimals

  await program.methods
    .transfer(new anchor.BN(amount))
    .accounts({
      from: senderTokenAccount,
      to: receiverTokenAccount,
      authority: sender.publicKey,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .signers([sender])
    .rpc();

  const senderBalance = await connection.getTokenAccountBalance(
    senderTokenAccount
  );
  const receiverBalance = await connection.getTokenAccountBalance(
    receiverTokenAccount
  );

  expect(Number(senderBalance.value.amount)).to.equal(
    initialSenderAmount - amount
  );
  expect(Number(receiverBalance.value.amount)).to.equal(
    initialReceiverAmount + amount
  );
});
```

### Burn and Freeze

```typescript
it("burns tokens", async () => {
  await program.methods
    .burnTokens(new anchor.BN(100_000))
    .accounts({
      tokenAccount: holderTokenAccount,
      mint: mintAddress,
      authority: holder.publicKey,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .signers([holder])
    .rpc();

  // Verify supply decreased
  const mintInfo = await getMint(connection, mintAddress);
  expect(Number(mintInfo.supply)).to.equal(previousSupply - 100_000n);
});

it("freezes token account", async () => {
  await program.methods
    .freezeAccount()
    .accounts({
      tokenAccount: targetTokenAccount,
      mint: mintAddress,
      freezeAuthority: authority.publicKey,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .signers([authority])
    .rpc();

  // Verify account is frozen
  const accountInfo = await getAccount(connection, targetTokenAccount);
  expect(accountInfo.isFrozen).to.be.true;

  // Verify transfers from frozen account fail
  try {
    await transfer(connection, payer, targetTokenAccount, dest, holder, 100);
    expect.fail("Should have failed");
  } catch (err) {
    expect(err.message).to.include("frozen");
  }
});
```

### Different Decimal Configurations

```typescript
it("handles different decimal configurations", async () => {
  // Test with 0 decimals (NFT-like)
  const mint0 = await createMint(connection, payer, authority.publicKey, null, 0);
  // 1 token = 1 raw unit

  // Test with 9 decimals (SOL-like)
  const mint9 = await createMint(connection, payer, authority.publicKey, null, 9);
  // 1 token = 1_000_000_000 raw units

  // Verify UI amounts are correct
  const balance0 = await connection.getTokenAccountBalance(account0);
  expect(balance0.value.uiAmount).to.equal(1); // 1 raw = 1.0 with 0 decimals

  const balance9 = await connection.getTokenAccountBalance(account9);
  expect(balance9.value.uiAmount).to.equal(0.000000001); // 1 raw = 0.000000001 with 9 decimals
});
```

---

## 8. Concurrency Testing

### Parallel Transactions on Same Account

```typescript
it("handles concurrent access to same account", async () => {
  // Send multiple transactions that touch the same account simultaneously
  const promises = Array.from({ length: 5 }, (_, i) =>
    program.methods
      .increment()
      .accounts({ counter: counterAddress, authority: authority.publicKey })
      .signers([authority])
      .rpc()
  );

  const results = await Promise.allSettled(promises);

  // Some may fail due to account contention — this is expected
  const succeeded = results.filter((r) => r.status === "fulfilled");
  const failed = results.filter((r) => r.status === "rejected");

  console.log(`${succeeded.length} succeeded, ${failed.length} failed`);

  // Verify final state is consistent
  const counter = await program.account.counter.fetch(counterAddress);
  expect(counter.value.toNumber()).to.equal(succeeded.length);
});
```

### Verify No Race Conditions

```typescript
it("sequential transactions maintain consistency", async () => {
  // Execute transactions sequentially to establish baseline
  for (let i = 0; i < 10; i++) {
    await program.methods
      .increment()
      .accounts({ counter: counterAddress, authority: authority.publicKey })
      .signers([authority])
      .rpc();
  }

  const counter = await program.account.counter.fetch(counterAddress);
  expect(counter.value.toNumber()).to.equal(10);
});
```

### skipPreflight Testing

```typescript
it("preflight catches errors before sending", async () => {
  // With preflight (default) — error caught locally
  try {
    await program.methods
      .badInstruction()
      .accounts({ ... })
      .rpc({ skipPreflight: false }); // explicit default
  } catch (err) {
    // Error caught in simulation, transaction never sent to validator
    expect(err.simulationResponse).to.exist;
  }

  // Without preflight — transaction sent and fails on-chain
  try {
    await program.methods
      .badInstruction()
      .accounts({ ... })
      .rpc({ skipPreflight: true });
  } catch (err) {
    // Transaction was sent but failed on validator
    // This costs compute and may affect rate limits
    expect(err.signature).to.exist;
  }
});
```

---

## Common Mistakes to Avoid

1. **Not waiting for confirmation**: Always `await confirmTransaction` before asserting state.
2. **Hardcoded blockhash**: Use `getLatestBlockhash()` for each transaction.
3. **Forgetting rent**: Accounts need minimum rent-exempt balance or they get garbage collected.
4. **Wrong account order**: Instruction account order must match program's expected order exactly.
5. **Missing signers**: All accounts marked `isSigner: true` must have corresponding signers in the transaction.
6. **Stale account data**: Fetch account data after each transaction, not before.
7. **Ignoring compute limits**: Complex operations may exceed default 200k compute units — add `setComputeUnitLimit`.
8. **Testing only happy path**: Always test error cases, boundary conditions, and access control violations.
