# Indexing Patterns

Methods for ingesting Solana on-chain data. Choose based on latency requirements, data volume, and complexity.

## Method Comparison

| Method | Latency | Complexity | Best For | Cost |
|--------|---------|------------|----------|------|
| Helius Webhooks | ~1-5s | Low | Event-driven, specific programs | Pay per event |
| WebSocket (accountSubscribe) | ~400ms | Medium | Real-time account monitoring | RPC subscription |
| Geyser Plugin (LaserStream) | ~100ms | High | High-throughput, all transactions | Infrastructure |
| RPC Polling | 1-10s | Low | Simple, low-frequency checks | RPC credits |
| DAS API | On-demand | Low | NFT/token metadata queries | Per request |

## Helius Webhooks (Recommended Starting Point)

The easiest way to get real-time Solana data. Helius parses transactions and delivers structured events to your endpoint.

### Setup via MCP

```bash
# Use helius-mcp to create webhooks directly
claude mcp add helius npx helius-mcp@latest
# Then: "Create a webhook that monitors address X for token transfers"
```

### Manual Setup

```typescript
// Create a webhook via Helius API
const webhook = await fetch("https://api.helius.dev/v0/webhooks?api-key=YOUR_KEY", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    webhookURL: "https://your-server.com/api/webhook",
    transactionTypes: ["TRANSFER", "SWAP", "NFT_MINT"],
    accountAddresses: ["ADDRESS_TO_MONITOR"],
    webhookType: "enhanced", // Parsed transaction data
  }),
}).then(r => r.json());
```

### Webhook Handler

```typescript
// Express.js webhook endpoint
app.post("/api/webhook", async (req, res) => {
  const events = req.body; // Array of enhanced transaction objects

  for (const event of events) {
    // Each event is a parsed transaction with:
    // - type: "TRANSFER" | "SWAP" | "NFT_MINT" | etc.
    // - source: "JUPITER" | "RAYDIUM" | "PHANTOM" | etc.
    // - tokenTransfers: [{ mint, from, to, amount }]
    // - nativeTransfers: [{ from, to, amount }]
    // - accountData: [{ account, nativeBalanceChange, tokenBalanceChanges }]

    switch (event.type) {
      case "TRANSFER":
        await processTransfer(event);
        break;
      case "SWAP":
        await processSwap(event);
        break;
    }
  }

  res.status(200).send("OK"); // Always respond 200 quickly
});

// IMPORTANT: Process async, respond fast
// Helius retries on timeout — don't do heavy work in the handler
async function processTransfer(event: any) {
  const { signature, timestamp, tokenTransfers } = event;

  // Idempotent write — use signature as unique key
  await db.query(
    `INSERT INTO transfers (signature, timestamp, mint, from_address, to_address, amount)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (signature) DO NOTHING`,
    [signature, timestamp, tokenTransfers[0]?.mint, /* ... */]
  );
}
```

### Enhanced vs Raw Webhooks

| Type | Data Format | Use When |
|------|-------------|----------|
| `enhanced` | Parsed (type, source, transfers) | You want structured data without parsing |
| `raw` | Raw transaction bytes | You need custom parsing or full instruction data |
| `discord` | Formatted message to Discord | Simple notifications |

**Skills:** `helius-build-skill` (Official — DAS API, WebSockets, webhooks, wallet API)
**Skills:** `helius-skill` (community — DAS API, Enhanced Transactions, webhooks)
**MCPs:** `helius-mcp` (60+ tools — create/manage webhooks, query transactions)

## WebSocket Subscriptions

For real-time account monitoring with lower latency than webhooks.

```typescript
import { Connection, PublicKey } from "@solana/web3.js";

const connection = new Connection(RPC_URL, {
  wsEndpoint: WS_URL, // e.g., wss://atlas-mainnet.helius-rpc.com?api-key=KEY
});

// Subscribe to account changes
const subscriptionId = connection.onAccountChange(
  new PublicKey("ACCOUNT_TO_WATCH"),
  (accountInfo, context) => {
    console.log(`Account changed at slot ${context.slot}`);
    console.log(`New balance: ${accountInfo.lamports}`);
    console.log(`Data: ${accountInfo.data.toString("hex")}`);
    // Parse account data based on your program's schema
  },
  "confirmed"
);

// Subscribe to program account changes (all accounts owned by a program)
const programSubId = connection.onProgramAccountChange(
  new PublicKey("YOUR_PROGRAM_ID"),
  (keyedAccountInfo, context) => {
    const { accountId, accountInfo } = keyedAccountInfo;
    // Process every account change for your program
  },
  "confirmed"
);

// Subscribe to logs (program events)
const logSubId = connection.onLogs(
  new PublicKey("YOUR_PROGRAM_ID"),
  (logs, context) => {
    // Parse Anchor events from logs
    for (const log of logs.logs) {
      if (log.startsWith("Program data:")) {
        const eventData = Buffer.from(log.split("Program data: ")[1], "base64");
        // Decode event...
      }
    }
  },
  "confirmed"
);

// Cleanup
connection.removeAccountChangeListener(subscriptionId);
```

## Geyser Plugin / LaserStream

For high-throughput indexing of all Solana transactions with minimal latency.

```typescript
// LaserStream via Helius — gRPC streaming
// Skills: helius-build-skill (LaserStream gRPC documentation)

// LaserStream provides:
// - All transactions as they're processed (not just confirmed)
// - Account updates in real-time
// - Slot notifications
// - ~100ms latency

// Setup: requires Helius Business plan
// Use helius-mcp to get LaserStream info and configuration
```

**Skills:** `quicknode-blockchain-skills` (Yellowstone gRPC streaming)
**Skills:** `quicknode-skill` (QuickNode infrastructure — gRPC, Priority Fees)

## Transaction Parsing

Raw transactions need parsing to extract meaningful data.

```typescript
// Helius enhanced transaction parsing (easiest)
const parsed = await fetch(
  `https://api.helius.dev/v0/transactions/?api-key=${API_KEY}`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ transactions: [signature] }),
  }
).then(r => r.json());

// Manual parsing for custom programs
import { BorshCoder } from "@coral-xyz/anchor";

const coder = new BorshCoder(idl);
const decoded = coder.instruction.decode(instructionData);
// decoded = { name: "swap", data: { amountIn: 1000000, minimumOut: 950000 } }
```

## Backfill Strategy

You will miss events. Plan for it.

```typescript
// Backfill from Helius transaction history
async function backfill(address: string, beforeSignature?: string) {
  const history = await fetch(
    `https://api.helius.dev/v0/addresses/${address}/transactions?api-key=${API_KEY}&before=${beforeSignature || ""}`
  ).then(r => r.json());

  for (const tx of history) {
    await processTransaction(tx); // Same idempotent handler as webhook
  }

  // Paginate if there are more
  if (history.length === 100) {
    await backfill(address, history[history.length - 1].signature);
  }
}
```

**Repos:** `helius-core-ai` (Official Helius AI tooling — CLI, MCP, skills)
**MCPs:** `solscan-mcp` (transaction forensics and analytics via Solscan Pro API)
