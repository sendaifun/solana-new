# RPC Provider Guide

Choosing and configuring a Solana RPC provider for production.

## Provider Comparison

| Provider | Best For | Pricing | Extras |
|----------|---------|---------|--------|
| Helius | Solana-native full-stack (RPC + DAS + webhooks) | Free tier + paid | DAS API, webhooks, enhanced APIs |
| Alchemy | Multi-chain apps (Solana + EVM), sponsored fees | Free tier + paid | Solana: Node API, Websockets, gRPC (Yellowstone), Webhooks, Prices API, Gas Manager. EVM: full data-API surface. Agentic-gateway with x402/MPP. (Token / NFT / Transfers / Portfolio APIs are EVM-only today.) |
| QuickNode | High-throughput apps | Per-request pricing | Marketplace add-ons |
| Triton | Dedicated infrastructure | Fixed pricing | Dedicated nodes |
| Chainstack | Enterprise | Per-request | Global regions |

## Recommended Setup

Pick a primary based on what your app needs. Both Helius and Alchemy are production-grade — choose by which APIs you'll lean on.

### Option A — Primary: Helius (Solana-only, DAS / cNFT-heavy)
```
HELIUS_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY
HELIUS_API_KEY=YOUR_KEY
```

### Option B — Primary: Alchemy (multi-chain, Prices API, Gas Manager)
```
ALCHEMY_RPC_URL=https://solana-mainnet.g.alchemy.com/v2/YOUR_KEY
ALCHEMY_API_KEY=YOUR_KEY
```

### Fallback: QuickNode, the other primary, or public RPC
```
QUICKNODE_RPC_URL=https://your-quicknode-endpoint.com
FALLBACK_RPC_URL=https://your-public-fallback-endpoint.com
```

### In Code
```typescript
const connection = new Connection(
  process.env.HELIUS_RPC_URL ||
    process.env.ALCHEMY_RPC_URL ||
    process.env.QUICKNODE_RPC_URL ||
    process.env.FALLBACK_RPC_URL,
  { commitment: "confirmed" }
);
```

## Configuration Tips

- **Commitment level**: Use `confirmed` for most reads, `finalized` for critical operations
- **Preflight checks**: Enable for mainnet (`skipPreflight: false`)
- **Retry logic**: Implement exponential backoff for 429 (rate limit) responses
- **Connection pooling**: Reuse Connection objects, don't create per-request
- **WebSockets**: Use separate WS endpoint for subscriptions, HTTP for RPC calls

## Rate Limits

- Free tiers: ~10-50 requests/second
- Paid tiers: 100-1000+ requests/second
- Burst handling: Queue requests, don't fire-and-forget
- Monitor usage: Most providers have dashboards

## Cost Estimation

For a typical dApp with 1,000 daily active users:
- ~50,000 RPC calls/day
- Most free tiers can handle this
- Scale to paid when you hit rate limits consistently
