# Actions Protocol Spec

Technical reference for the Solana Actions protocol. Actions are API endpoints that return signable transactions. Blinks are URLs that unfurl Actions into interactive UI in wallets and social feeds.

## Protocol Flow

```
1. Client discovers action URL (from blink, QR code, or direct link)
2. Client sends GET request → receives action metadata (icon, title, buttons)
3. User clicks a button → client sends POST with user's account
4. Server builds transaction → returns serialized unsigned transaction
5. Client prompts user to sign → sends signed transaction to Solana
6. Optional: action chaining — server returns next action URL after completion
```

## GET Request: Action Metadata

```
GET https://your-domain.com/api/actions/donate
```

Response:

```json
{
  "type": "action",
  "icon": "https://your-domain.com/icon.png",
  "title": "Donate to Project",
  "description": "Send SOL to support this project",
  "label": "Donate",
  "links": {
    "actions": [
      {
        "label": "Send 0.1 SOL",
        "href": "/api/actions/donate?amount=0.1"
      },
      {
        "label": "Send 1 SOL",
        "href": "/api/actions/donate?amount=1"
      },
      {
        "label": "Custom Amount",
        "href": "/api/actions/donate?amount={amount}",
        "parameters": [
          {
            "name": "amount",
            "label": "Enter SOL amount",
            "required": true
          }
        ]
      }
    ]
  }
}
```

### Metadata Fields

| Field | Required | Description |
|-------|----------|-------------|
| `type` | Yes | Always `"action"` |
| `icon` | Yes | URL to image (PNG/SVG, square, min 200x200) |
| `title` | Yes | Short title (shown as heading) |
| `description` | Yes | Longer description (1-2 sentences) |
| `label` | Yes | Default button text (if no `links.actions`) |
| `links.actions` | No | Array of action buttons with custom labels |
| `disabled` | No | If `true`, buttons are grayed out |
| `error` | No | `{ message: string }` shown to user |

## POST Request: Build Transaction

```
POST https://your-domain.com/api/actions/donate?amount=1
Content-Type: application/json

{
  "account": "UserWalletPublicKeyBase58"
}
```

Response:

```json
{
  "type": "transaction",
  "transaction": "base64-encoded-serialized-transaction",
  "message": "Sending 1 SOL donation"
}
```

### Implementation Example (Express.js)

```typescript
import express from "express";
import {
  Connection, PublicKey, SystemProgram,
  Transaction, LAMPORTS_PER_SOL,
} from "@solana/web3.js";

const app = express();
app.use(express.json());

// Required: actions.json at domain root
app.get("/actions.json", (req, res) => {
  res.json({
    rules: [
      { pathPattern: "/api/actions/**", apiPath: "/api/actions/**" }
    ]
  });
});

// Required: CORS headers for all action routes
const ACTIONS_CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type,Authorization,Accept,Accept-Encoding,X-Action-Version,X-Blockchain-Ids",
  "Access-Control-Expose-Headers": "X-Action-Version,X-Blockchain-Ids",
  "Content-Type": "application/json",
};

app.options("/api/actions/*", (req, res) => {
  res.set(ACTIONS_CORS_HEADERS).status(200).end();
});

// GET: Return action metadata
app.get("/api/actions/donate", (req, res) => {
  res.set(ACTIONS_CORS_HEADERS).json({
    type: "action",
    icon: "https://your-domain.com/donate-icon.png",
    title: "Donate SOL",
    description: "Support this project with a SOL donation",
    label: "Donate",
    links: {
      actions: [
        { label: "0.1 SOL", href: "/api/actions/donate?amount=0.1" },
        { label: "1 SOL", href: "/api/actions/donate?amount=1" },
        {
          label: "Custom",
          href: "/api/actions/donate?amount={amount}",
          parameters: [{ name: "amount", label: "SOL amount", required: true }],
        },
      ],
    },
  });
});

// POST: Build and return unsigned transaction
app.post("/api/actions/donate", async (req, res) => {
  const { account } = req.body;
  const amount = parseFloat(req.query.amount as string);

  if (!account || !amount || amount <= 0) {
    return res.set(ACTIONS_CORS_HEADERS).status(400).json({ error: "Invalid parameters" });
  }

  const connection = new Connection(process.env.RPC_URL || "https://api.mainnet-beta.solana.com");
  const sender = new PublicKey(account);
  const recipient = new PublicKey("YOUR_RECIPIENT_PUBKEY");

  const tx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: sender,
      toPubkey: recipient,
      lamports: Math.floor(amount * LAMPORTS_PER_SOL),
    })
  );

  tx.feePayer = sender;
  tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

  const serialized = tx.serialize({ requireAllSignatures: false }).toString("base64");

  res.set(ACTIONS_CORS_HEADERS).json({
    type: "transaction",
    transaction: serialized,
    message: `Donating ${amount} SOL`,
  });
});
```

## Action Chaining

For multi-step flows, return a `links.next` in the POST response:

```json
{
  "type": "transaction",
  "transaction": "base64...",
  "links": {
    "next": {
      "type": "post",
      "href": "/api/actions/donate/confirm?txSig={signature}"
    }
  }
}
```

The client will call the next action after the transaction confirms, passing the signature.

## actions.json Configuration

Must be at the root of your domain: `https://your-domain.com/actions.json`

```json
{
  "rules": [
    {
      "pathPattern": "/api/actions/**",
      "apiPath": "/api/actions/**"
    }
  ]
}
```

For proxied actions (your blink points to a different domain's action):

```json
{
  "rules": [
    {
      "pathPattern": "/donate",
      "apiPath": "https://other-domain.com/api/actions/donate"
    }
  ]
}
```

## Common Mistakes

1. **Missing CORS headers** — Actions fail silently without proper CORS. Include ALL headers listed above.
2. **No `actions.json`** — Wallets can't discover your action without this file at domain root.
3. **Hardcoded sender** — Always use the `account` from the POST body, never hardcode.
4. **Missing `feePayer`** — Set `tx.feePayer = new PublicKey(account)` before serializing.
5. **Stale blockhash** — Get a fresh blockhash for every POST request.
6. **Wrong serialization** — Use `{ requireAllSignatures: false }` since the user hasn't signed yet.

**Repos:** `solana-actions` (@solana/actions SDK for building Blinks and Actions API endpoints)
**Repos:** `solana-action-express` (Express.js server template for Actions backends)
