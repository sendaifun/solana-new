# Solana App Layer and Consumer Development

> Complete reference for building Solana frontends, mobile apps, Actions/Blinks, payments, and client-side patterns. Everything a developer needs to ship a consumer-facing Solana application.

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

const rpc = createSolanaRpc("https://api.mainnet-beta.solana.com");
const rpcSubscriptions = createSolanaRpcSubscriptions("wss://api.mainnet-beta.solana.com");
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

## Solana Actions and Blinks

### What Are Solana Actions?

Solana Actions are HTTP API endpoints that return signable Solana transactions. Any client can fetch an Action, present it to a user, and submit the signed transaction.

**Spec:** https://solana.com/docs/advanced/actions

### What Are Blinks?

Blinks (Blockchain Links) are URLs that unfurl into interactive transaction UIs on supported platforms (Twitter/X, Discord, websites). They are the client-side rendering of Solana Actions.

### How It Works

```
1. User sees a Blink URL (e.g., on Twitter)
2. Client fetches the Action endpoint
3. Server returns: icon, title, description, and action buttons
4. User clicks a button
5. Client POSTs to the action endpoint
6. Server returns a serialized transaction
7. User signs with their wallet
8. Client submits to the network
```

### Building an Action

```typescript
// Example: Solana Action endpoint (Next.js API route)
import { ActionGetResponse, ActionPostRequest, ActionPostResponse } from "@solana/actions";

// GET -- return metadata
export async function GET(request: Request) {
  const response: ActionGetResponse = {
    icon: "https://myapp.com/icon.png",
    title: "Donate SOL",
    description: "Support this creator with a SOL donation",
    label: "Donate",
    links: {
      actions: [
        { label: "0.1 SOL", href: "/api/donate?amount=0.1" },
        { label: "0.5 SOL", href: "/api/donate?amount=0.5" },
        { label: "1 SOL", href: "/api/donate?amount=1" },
        {
          label: "Custom",
          href: "/api/donate?amount={amount}",
          parameters: [{ name: "amount", label: "SOL amount" }],
        },
      ],
    },
  };
  return Response.json(response);
}

// POST -- return transaction
export async function POST(request: Request) {
  const body: ActionPostRequest = await request.json();
  const account = new PublicKey(body.account);
  // Build and serialize the transaction...
  const response: ActionPostResponse = { transaction: base64Transaction };
  return Response.json(response);
}
```

### actions.json

Register your Action by placing an `actions.json` at your domain root:

```json
// https://myapp.com/actions.json
{
  "rules": [
    {
      "pathPattern": "/api/donate/**",
      "apiPath": "/api/donate/**"
    }
  ]
}
```

### Testing

- **dial.to:** https://dial.to -- test and preview your Actions
- **Blink Inspector:** Chrome extension for debugging

### Use Cases

- Tipping creators from any URL
- Donations and fundraising
- NFT minting from social media
- Token swaps without visiting a DEX
- Governance voting from Twitter
- Event ticket purchasing

### Developer Workshop

- Video: https://youtu.be/kCht01Ycif0

**npm packages:**
- `@solana/actions` -- Action types and helpers

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

## Solana Pay

### Overview

Solana Pay enables payments via QR codes and URLs, supporting both simple transfers and complex transactions.

**npm package:** `@solana/pay`

### Transfer Requests

Simple SOL or SPL token transfers encoded as URLs:

```typescript
import { encodeURL, createQR } from "@solana/pay";
import { PublicKey } from "@solana/web3.js";
import BigNumber from "bignumber.js";

const url = encodeURL({
  recipient: new PublicKey("merchant_address"),
  amount: new BigNumber(1.5),           // 1.5 SOL
  splToken: USDC_MINT,                  // optional: pay in USDC
  reference: new Keypair().publicKey,   // unique reference for tracking
  label: "Coffee Shop",
  message: "Order #1234",
  memo: "order-1234",
});

const qr = createQR(url);
qr.append(document.getElementById("qr-container"));
```

### Transaction Requests

Arbitrary transactions returned by your API endpoint (same pattern as Actions):

```typescript
const url = encodeURL({
  link: new URL("https://myshop.com/api/checkout?order=1234"),
});
```

The wallet fetches the URL, gets a serialized transaction, signs it, and submits it.

### Verifying Payment

```typescript
import { findReference, validateTransfer } from "@solana/pay";

// Poll for the transaction
const signatureInfo = await findReference(connection, reference, { finality: "confirmed" });

// Validate the transfer
await validateTransfer(connection, signatureInfo.signature, {
  recipient: merchantAddress,
  amount: expectedAmount,
  splToken: USDC_MINT,
});
```

**Docs:** https://docs.solanapay.com

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
| 2 | Install Solana deps | `@solana/web3.js @solana/wallet-adapter-react @solana/wallet-adapter-react-ui` |
| 3 | Set up providers | `ConnectionProvider > WalletProvider > WalletModalProvider` |
| 4 | Add wallet button | `<WalletMultiButton />` |
| 5 | Use RPC | `useConnection()` hook |
| 6 | Read wallet | `useWallet()` hook |
| 7 | Send transactions | `sendTransaction(tx, connection)` |
| 8 | Confirm | `connection.confirmTransaction(sig, "confirmed")` |

**Starter templates:**
- Solana dApp Scaffold: https://github.com/solana-labs/dapp-scaffold
- Create Solana dApp: `npx create-solana-dapp@latest`
- Next.js + Anchor: https://github.com/solana-developers/anchor-starter
