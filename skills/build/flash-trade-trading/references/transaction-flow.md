# Transaction Flow

How to build, sign, and submit transactions using the Flash Trade REST API.

## Five-Step Flow

```
 1. BUILD     POST /transaction-builder/{action}
              Send trade parameters, receive preview + unsigned tx
                         |
 2. DECODE    Base64 decode -> deserialize VersionedTransaction (v0)
                         |
 3. SIGN      Sign with wallet keypair (the tx is UNSIGNED)
                         |
 4. SUBMIT    sendRawTransaction to Solana RPC
                         |
 5. CONFIRM   Poll or subscribe for transaction confirmation
```

> **CRITICAL: Blockhash expiry.** The returned transaction contains a recent blockhash that expires in ~60 seconds. Sign and submit promptly. If delayed, re-call the transaction builder for a fresh transaction.

## Step 1: Build Transaction

POST to `/transaction-builder/{action}` with trade parameters. The API returns preview data (fees, prices, leverage, liquidation) and a base64-encoded unsigned `VersionedTransaction`.

| Endpoint | Purpose |
|----------|---------|
| `/transaction-builder/open-position` | Open a new position (market or limit) |
| `/transaction-builder/close-position` | Close or partially close |
| `/transaction-builder/reverse-position` | Close + open opposite direction |
| `/transaction-builder/add-collateral` | Add margin to reduce leverage |
| `/transaction-builder/remove-collateral` | Withdraw margin to increase leverage |
| `/transaction-builder/place-trigger-order` | Place take-profit or stop-loss |
| `/transaction-builder/edit-trigger-order` | Modify an existing TP/SL |
| `/transaction-builder/cancel-trigger-order` | Cancel a single TP/SL |
| `/transaction-builder/cancel-all-trigger-orders` | Cancel all TP/SL for a market+side |

## Step 2-3: Decode and Sign

> **Do NOT replace the blockhash.** The API may include pre-signed additional signers (e.g., ephemeral WSOL keypairs). Replacing the blockhash would invalidate those signatures.

### TypeScript (Server-side)

```typescript
import { Connection, Keypair, VersionedTransaction } from "@solana/web3.js";

const txBytes = Buffer.from(response.transactionBase64, "base64");
const transaction = VersionedTransaction.deserialize(txBytes);
const keypair = Keypair.fromSecretKey(/* your secret key bytes */);
transaction.sign([keypair]);
```

### TypeScript (Browser Wallet)

```typescript
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { VersionedTransaction } from "@solana/web3.js";

const { signTransaction } = useWallet();
const { connection } = useConnection();

const txBytes = Uint8Array.from(atob(response.transactionBase64), c => c.charCodeAt(0));
const transaction = VersionedTransaction.deserialize(txBytes);
const signedTx = await signTransaction!(transaction);
```

### Python

```python
import base64
from solders.transaction import VersionedTransaction
from solders.keypair import Keypair

tx_bytes = base64.b64decode(response["transactionBase64"])
transaction = VersionedTransaction.from_bytes(tx_bytes)
keypair = Keypair.from_bytes(secret_key_bytes)
transaction.sign([keypair])
```

## Step 4-5: Submit and Confirm

### TypeScript

```typescript
const signature = await connection.sendRawTransaction(signedTx.serialize(), {
  skipPreflight: false,
  maxRetries: 3,
});
await connection.confirmTransaction(signature, "confirmed");
```

### Python

```python
from solana.rpc.api import Client

client = Client("https://api.mainnet-beta.solana.com")
result = client.send_raw_transaction(bytes(transaction))
client.confirm_transaction(result.value, commitment="confirmed")
```

## Blockhash Expiry Recovery

If you get "Blockhash not found" or the transaction fails due to an expired blockhash:

1. Re-call the transaction builder endpoint with the same parameters
2. You get a fresh transaction with a new blockhash
3. Sign and submit immediately

Do not cache transactions. Build -> Sign -> Submit should happen within seconds.

## Implicit Operations

Some operations don't have dedicated endpoints:

- **Increase size:** Call `open-position` on a market where you already have a position — the API detects it and calls `increaseSize` internally.
- **Decrease size:** Call `close-position` with a partial `inputUsdUi` amount — the API calls `decreaseSize` internally.
- **Place limit order:** Call `open-position` with `orderType: "LIMIT"` and `limitPrice`.
