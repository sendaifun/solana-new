# Solana App Layer and Consumer Development

> Complete reference for building Solana frontends, mobile apps, and client-side patterns. Everything a developer needs to ship a consumer-facing Solana application.

---

## Client SDKs

### @solana/kit (Recommended -- New TypeScript SDK)

The next-generation Solana TypeScript SDK. Functional API, tree-shakeable, type-safe, and significantly smaller bundle size than the legacy SDK.

**Status:** Recommended for all new projects.

**npm package:** `@solana/kit`

**Key characteristics:**
- Functional API (no classes) -- better tree-shaking
- Codecs for all serialization (no Borsh dependency)
- Native `bigint` for lamports (no BN.js)
- Built-in RPC type safety
- Composable transaction builders

```typescript
// Example: Send SOL with @solana/kit
import {
  createSolanaRpc,
  createSolanaRpcSubscriptions,
  pipe,
  createTransactionMessage,
  setTransactionMessageFeePayer,
  setTransactionMessageLifetimeUsingBlockhash,
  appendTransactionMessageInstruction,
  signTransactionMessageWithSigners,
  sendAndConfirmTransactionFactory,
  getTransferSolInstruction,
  lamports,
  address,
} from "@solana/kit";

// Use a dedicated RPC (Helius, QuickNode) for production
const rpc = createSolanaRpc(process.env.RPC_URL || "https://api.mainnet-beta.solana.com");
const rpcSubscriptions = createSolanaRpcSubscriptions(process.env.RPC_WS_URL || "wss://api.mainnet-beta.solana.com");
const sendAndConfirm = sendAndConfirmTransactionFactory({ rpc, rpcSubscriptions });

const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();

const message = pipe(
  createTransactionMessage({ version: 0 }),
  (msg) => setTransactionMessageFeePayer(feePayer.address, msg),
  (msg) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, msg),
  (msg) =>
    appendTransactionMessageInstruction(
      getTransferSolInstruction({
        source: feePayer,
        destination: address("recipient_address"),
        amount: lamports(1_000_000_000n), // 1 SOL
      }),
      msg
    )
);

const signedTx = await signTransactionMessageWithSigners(message);
await sendAndConfirm(signedTx, { commitment: "confirmed" });
```

**Docs:** https://solana.com/docs/clients/javascript

---

### @solana/web3.js (Legacy v1)

The original Solana TypeScript SDK. Class-based, widely used in tutorials and existing codebases.

**Status:** Being deprecated. Existing code works fine but new projects should use `@solana/kit`.

**npm package:** `@solana/web3.js` (v1.x)

```typescript
// Example: Send SOL with legacy web3.js
import { Connection, Keypair, SystemProgram, Transaction, sendAndConfirmTransaction, LAMPORTS_PER_SOL } from "@solana/web3.js";

const connection = new Connection("https://api.mainnet-beta.solana.com", "confirmed");
const transaction = new Transaction().add(
  SystemProgram.transfer({
    fromPubkey: sender.publicKey,
    toPubkey: recipient,
    lamports: 1 * LAMPORTS_PER_SOL,
  })
);
await sendAndConfirmTransaction(connection, transaction, [sender]);
```

**Docs:** https://solana-labs.github.io/solana-web3.js/

---

### solana-sdk (Rust)

The official Rust SDK for Solana client-side code (not programs -- programs use `solana-program`).

**When to use:** Rust CLI tools, backend services, high-performance trading bots.

**Crate:** `solana-sdk`

**Docs:** https://docs.rs/solana-sdk

---

### solders (Python)

A high-performance Python SDK built on Rust bindings.

**When to use:** Python scripts, data analysis, ML pipelines, Jupyter notebooks.

**pip package:** `solders`

**Docs:** https://kevinheavey.github.io/solders/

---

## React Integration

### Setting Up the Provider Stack

Every React Solana dApp needs three nested providers:

```
ConnectionProvider        -- RPC connection
  WalletProvider          -- wallet state management
    WalletModalProvider   -- wallet selection UI
```

### Full Setup Example

```typescript
// app/providers.tsx
"use client";

import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { useMemo } from "react";

// Import wallet adapter CSS
import "@solana/wallet-adapter-react-ui/styles.css";

export function SolanaProviders({ children }: { children: React.ReactNode }) {
  const endpoint = useMemo(() => process.env.NEXT_PUBLIC_RPC_URL!, []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={[]} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
```

### Key Hooks

| Hook | Purpose |
|------|---------|
| `useWallet()` | Access wallet state: `publicKey`, `connected`, `signTransaction`, `signMessage`, `sendTransaction` |
| `useConnection()` | Access the `Connection` object for RPC calls |
| `useAnchorWallet()` | Get an Anchor-compatible wallet (for `AnchorProvider`) |

```typescript
// Example: Using wallet hooks
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

function MyComponent() {
  const { publicKey, sendTransaction, connected } = useWallet();
  const { connection } = useConnection();

  const handleSend = async () => {
    if (!publicKey) return;
    const tx = new Transaction().add(/* ... */);
    const signature = await sendTransaction(tx, connection);
    await connection.confirmTransaction(signature, "confirmed");
  };

  return (
    <div>
      <WalletMultiButton />
      {connected && <button onClick={handleSend}>Send</button>}
    </div>
  );
}
```

### npm packages

- `@solana/wallet-adapter-react` -- provider and hooks
- `@solana/wallet-adapter-react-ui` -- `WalletMultiButton`, `WalletDisconnectButton`, `WalletModalProvider`
- `@solana/wallet-adapter-base` -- base interfaces

**Note:** As of 2024+, passing an empty `wallets={[]}` array auto-detects installed Standard Wallets (Phantom, Solflare, Backpack, etc.) via the Wallet Standard. You no longer need to manually import wallet adapters.

---

## Mobile Development

### React Native + Mobile Wallet Adapter

Build native Solana mobile apps with React Native and the Mobile Wallet Adapter (MWA) protocol.

**Architecture:**
```
React Native App
  -> @solana-mobile/mobile-wallet-adapter-protocol
    -> MWA (communicates with installed wallets)
      -> Phantom / Solflare / other mobile wallets
```

### Mobile Wallet Adapter (MWA)

MWA is the standard protocol for mobile dApp-to-wallet communication on Solana. It uses a local socket connection instead of browser extensions.

**npm packages:**
- `@solana-mobile/mobile-wallet-adapter-protocol` -- core protocol
- `@solana-mobile/mobile-wallet-adapter-protocol-web3js` -- web3.js integration
- `@solana-mobile/wallet-adapter-mobile` -- wallet-adapter compatible wrapper

```typescript
// Example: Mobile wallet adapter usage
import { transact } from "@solana-mobile/mobile-wallet-adapter-protocol-web3js";

const signature = await transact(async (wallet) => {
  // Authorize the dApp
  const auth = await wallet.authorize({
    cluster: "mainnet-beta",
    identity: { name: "My dApp", uri: "https://mydapp.com", icon: "favicon.ico" },
  });

  // Sign and send a transaction
  const { signatures } = await wallet.signAndSendTransactions({
    transactions: [serializedTransaction],
  });

  return signatures[0];
});
```

### Saga / Chapter 2

Solana Mobile's hardware devices with built-in crypto features:
- **Saga:** First generation (2023)
- **Chapter 2:** Second generation, wider distribution
- Pre-installed Solana dApp Store
- Seed Vault for secure key storage

### Solana dApp Store

An alternative app distribution channel free from Apple/Google 30% fees:
- Submit at: https://github.com/solana-mobile/dapp-publishing
- No crypto-specific restrictions
- Free to publish

**Key URLs:**
- Docs: https://docs.solanamobile.com
- GitHub: https://github.com/solana-mobile

---

## Frontend Patterns

### Transaction Confirmation UX

Solana has three commitment levels. Your UI should reflect the current state:

| Level | Meaning | Time | Use For |
|-------|---------|------|---------|
| `processed` | Seen by connected node | ~400ms | Optimistic UI updates |
| `confirmed` | 66%+ stake voted | ~1-2s | Default for most operations |
| `finalized` | 31+ confirmed slots | ~12-15s | High-value operations (payouts) |

**Recommended UX pattern:**
```
[Submit] -> "Sending..." -> "Confirming..." (processed) -> "Confirmed!" (confirmed)
```

```typescript
// Confirmation with timeout
const signature = await sendTransaction(tx, connection);

const confirmation = await connection.confirmTransaction(
  {
    signature,
    blockhash: latestBlockhash.blockhash,
    lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
  },
  "confirmed"
);

if (confirmation.value.err) {
  throw new Error("Transaction failed");
}
```

### Error Handling

Common Solana transaction errors and how to handle them:

| Error | Cause | Fix |
|-------|-------|-----|
| `BlockhashNotFound` | Blockhash expired (>150 slots / ~1 min) | Refetch blockhash and retry |
| `InsufficientFundsForRent` | Account would fall below rent-exempt minimum | Ensure enough SOL for rent |
| `InstructionError` | Program returned an error | Parse the error code from program IDL |
| `TransactionTooLarge` | Transaction exceeds 1232 bytes | Use address lookup tables or split |
| `SlippageToleranceExceeded` | Swap price moved beyond tolerance | Increase slippage or use DCA |

```typescript
// Error handling pattern
try {
  const signature = await sendTransaction(tx, connection);
  await connection.confirmTransaction(/* ... */);
} catch (error) {
  if (error instanceof SendTransactionError) {
    // Simulation failed -- get logs
    const logs = error.logs;
    console.error("Simulation logs:", logs);
  }
  if (error.message.includes("Blockhash not found")) {
    // Retry with fresh blockhash
  }
}
```

### Preflight Checks

Always simulate transactions before sending to catch errors early:

```typescript
// Simulate first
const simulation = await connection.simulateTransaction(transaction);
if (simulation.value.err) {
  console.error("Simulation failed:", simulation.value.err);
  console.error("Logs:", simulation.value.logs);
  return; // Don't send
}

// Then send with skipPreflight: false (default)
const signature = await sendTransaction(tx, connection, {
  skipPreflight: false, // default -- runs simulation on RPC node
});
```

### Priority Fee Estimation

Priority fees ensure your transaction lands in congested conditions:

```typescript
// Get recent priority fees
const recentFees = await connection.getRecentPrioritizationFees();

// Calculate median
const fees = recentFees
  .map((f) => f.prioritizationFee)
  .sort((a, b) => a - b);
const medianFee = fees[Math.floor(fees.length / 2)];

// Add to transaction
import { ComputeBudgetProgram } from "@solana/web3.js";

transaction.add(
  ComputeBudgetProgram.setComputeUnitPrice({
    microLamports: medianFee,
  }),
  ComputeBudgetProgram.setComputeUnitLimit({
    units: 200_000, // request exact units needed
  })
);
```

**Better approach:** Use Helius Priority Fee API for more accurate estimates:
```typescript
const response = await fetch("https://mainnet.helius-rpc.com/?api-key=KEY", {
  method: "POST",
  body: JSON.stringify({
    jsonrpc: "2.0",
    id: 1,
    method: "getPriorityFeeEstimate",
    params: [{ accountKeys: ["JUP6..."], options: { priorityLevel: "High" } }],
  }),
});
```

### Versioned Transactions and Address Lookup Tables

Versioned transactions (v0) support address lookup tables (ALTs), which compress account addresses from 32 bytes to 1 byte each -- critical for complex transactions.

```typescript
import { TransactionMessage, VersionedTransaction, AddressLookupTableProgram } from "@solana/web3.js";

// Fetch a lookup table
const lookupTableAccount = (
  await connection.getAddressLookupTable(lookupTableAddress)
).value;

// Create v0 transaction with lookup table
const messageV0 = new TransactionMessage({
  payerKey: payer.publicKey,
  recentBlockhash: (await connection.getLatestBlockhash()).blockhash,
  instructions: [/* your instructions */],
}).compileToV0Message([lookupTableAccount]);

const transaction = new VersionedTransaction(messageV0);
transaction.sign([payer]);
await connection.sendTransaction(transaction);
```

**When to use ALTs:** When your transaction has more than ~10 unique accounts, or when you hit the 1232-byte transaction size limit.

---

## Quick Reference: Building a New Solana Frontend

| Step | What | Package |
|------|------|---------|
| 1 | Create Next.js app | `npx create-next-app@latest` |
| 2 | Install Solana deps | `@solana/web3.js @solana/wallet-adapter-react @solana/wallet-adapter-react-ui` (or `@solana/kit` for new projects without wallet-adapter) |
| 3 | Set up providers | `ConnectionProvider > WalletProvider > WalletModalProvider` |
| 4 | Add wallet button | `<WalletMultiButton />` |
| 5 | Use RPC | `useConnection()` hook |
| 6 | Read wallet | `useWallet()` hook |
| 7 | Send transactions | `sendTransaction(tx, connection)` |
| 8 | Confirm | `connection.confirmTransaction(sig, "confirmed")` |

**Starter templates:**
- Browse all official templates: https://solana.com/developers/templates
- Create Solana dApp: `npx create-solana-dapp@latest` (official, maintained by Solana Foundation)
- Next.js + Anchor + Kit: `npx create-solana-dapp@latest -t solana-foundation/templates/kit/nextjs-anchor`
