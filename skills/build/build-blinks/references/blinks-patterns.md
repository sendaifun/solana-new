# Blinks Patterns

Common patterns for building Solana Blinks (Blockchain Links). Each pattern includes the action type, metadata structure, and implementation notes.

## Pattern 1: Payment / Donation

The simplest blink — send SOL or tokens to a recipient.

```typescript
// GET metadata
{
  type: "action",
  icon: "https://example.com/pay.png",
  title: "Pay for Coffee",
  description: "Send 0.05 SOL for a coffee",
  label: "Pay 0.05 SOL",
  links: {
    actions: [
      { label: "0.05 SOL", href: "/api/actions/pay?amount=0.05" },
      { label: "0.1 SOL", href: "/api/actions/pay?amount=0.1" },
      { label: "Tip More", href: "/api/actions/pay?amount={amount}",
        parameters: [{ name: "amount", label: "Custom SOL amount" }] },
    ],
  },
}

// POST: build a SystemProgram.transfer or SPL token transfer
```

**Use cases:** Tipping, e-commerce, donations, subscriptions.
**Skills:** `payments` (official — Commerce Kit, Solana Pay, checkout flows)

## Pattern 2: NFT Mint

Let users mint an NFT directly from a shared link.

```typescript
// GET metadata
{
  type: "action",
  icon: "https://example.com/nft-preview.png",
  title: "Mint Genesis NFT",
  description: "Mint 1 of 1000 Genesis Collection NFTs. 0.5 SOL each.",
  label: "Mint NFT",
  links: {
    actions: [
      { label: "Mint 1", href: "/api/actions/mint?quantity=1" },
      { label: "Mint 3", href: "/api/actions/mint?quantity=3" },
    ],
  },
}

// POST: Build Metaplex mint transaction
// Use Candy Machine or direct Core NFT mint
```

**Skills:** `metaplex-skill` (official — Core NFTs, Candy Machine, Bubblegum)
**Repos:** `mpl-candy-machine` (NFT collection minting and distribution)
**Repos:** `mpl-bubblegum` (compressed NFTs for cheap large-scale minting)

## Pattern 3: Token Swap

Build a blink that lets users swap tokens via Jupiter.

```typescript
// GET metadata
{
  type: "action",
  icon: "https://example.com/swap.png",
  title: "Swap SOL → USDC",
  description: "Best rate via Jupiter aggregator",
  label: "Swap",
  links: {
    actions: [
      { label: "Swap 0.1 SOL", href: "/api/actions/swap?amount=0.1" },
      { label: "Swap 1 SOL", href: "/api/actions/swap?amount=1" },
      { label: "Custom", href: "/api/actions/swap?amount={amount}",
        parameters: [{ name: "amount", label: "SOL to swap" }] },
    ],
  },
}

// POST: Fetch Jupiter quote, build swap transaction
app.post("/api/actions/swap", async (req, res) => {
  const { account } = req.body;
  const amount = parseFloat(req.query.amount) * LAMPORTS_PER_SOL;

  // Get Jupiter quote
  const quote = await fetch(
    `https://quote-api.jup.ag/v6/quote?inputMint=So11111111111111111111111111111111111111112&outputMint=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&amount=${amount}&slippageBps=50`
  ).then(r => r.json());

  // Get swap transaction
  const swap = await fetch("https://quote-api.jup.ag/v6/swap", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ quoteResponse: quote, userPublicKey: account }),
  }).then(r => r.json());

  res.set(ACTIONS_CORS_HEADERS).json({
    type: "transaction",
    transaction: swap.swapTransaction,
    message: `Swapping ${req.query.amount} SOL for USDC`,
  });
});
```

**Skills:** `jupiter-skill` (Ultra swaps, limit orders, DCA, perpetuals)
**MCPs:** `dcspark-jupiter` (swap quotes and transaction building)

## Pattern 4: Governance Vote

Let DAO members vote directly from a shared link.

```typescript
// GET metadata with vote options
{
  type: "action",
  icon: "https://example.com/dao-logo.png",
  title: "Vote: Treasury Allocation Q2",
  description: "Should we allocate 50k USDC to developer grants?",
  label: "Vote",
  links: {
    actions: [
      { label: "Yes - Approve", href: "/api/actions/vote?proposal=7&choice=yes" },
      { label: "No - Reject", href: "/api/actions/vote?proposal=7&choice=no" },
      { label: "Abstain", href: "/api/actions/vote?proposal=7&choice=abstain" },
    ],
  },
}
```

**Repos:** `squads-v4` (multisig V4 — voting, timelocks)
**Repos:** `spl-governance` (SPL Governance — DAO voting and proposals)

## Pattern 5: Multi-Step Flow (Chained Actions)

For operations that need multiple transactions (e.g., create ATA + transfer).

```typescript
// Step 1 POST response — includes next action
{
  type: "transaction",
  transaction: "base64-create-ata-tx",
  message: "Creating token account...",
  links: {
    next: {
      type: "post",
      href: "/api/actions/airdrop/claim?wallet={account}&txSig={signature}"
    }
  }
}

// Step 2: Server verifies step 1 confirmed, then returns claim transaction
app.post("/api/actions/airdrop/claim", async (req, res) => {
  const { account } = req.body;
  const { txSig } = req.query;

  // Verify step 1 transaction confirmed
  const confirmation = await connection.getSignatureStatus(txSig);
  if (!confirmation.value?.confirmationStatus) {
    return res.status(400).json({ error: "Previous transaction not confirmed" });
  }

  // Build claim transaction
  // ...
});
```

## Hosting Options

### Vercel (Recommended for most)

```
your-nextjs-app/
  app/
    api/
      actions/
        donate/
          route.ts      # GET + POST handlers
    actions.json/
      route.ts          # Return rules
```

### Express.js (Standalone)

Use the `solana-action-express` template as a starting point.

```bash
# Clone and run
git clone https://github.com/SolDapper/solana-action-express.git
cd solana-action-express && npm install && npm start
```

**Repos:** `solana-action-express` (Express.js template for Actions backends)

### Cloudflare Workers (Edge)

Good for low-latency global deployment. Build transaction server-side at the edge.

## Testing Blinks

### 1. Local Testing

```bash
# Run your action server locally
npm run dev  # http://localhost:3000

# Test GET
curl http://localhost:3000/api/actions/donate | jq

# Test POST
curl -X POST http://localhost:3000/api/actions/donate?amount=0.1 \
  -H "Content-Type: application/json" \
  -d '{"account":"YOUR_PUBKEY"}' | jq
```

### 2. Dialect Explorer

The Dialect Blinks Explorer lets you test unfurling:

```
https://dial.to/?action=solana-action:https://your-domain.com/api/actions/donate
```

Paste your action URL and see exactly how it renders in wallets.

### 3. Social Feed Testing

Share your blink URL on X (Twitter) or in a Phantom-compatible context to test real unfurling:

```
https://your-domain.com/api/actions/donate
```

## Security Best Practices

1. **Validate all inputs server-side** — Never trust query parameters or POST body without validation
2. **Rate limit POST endpoints** — Prevent transaction spam
3. **Don't expose private keys** — The server builds transactions but never signs them
4. **Use environment variables** for RPC URLs and recipient addresses
5. **Log action requests** — Track usage and detect abuse patterns
6. **Set reasonable limits** — Cap maximum amounts in payment actions

**Repos:** `solana-actions` (Official @solana/actions SDK)
