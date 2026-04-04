# DefiLlama API Guide

Free, no-auth API for DeFi data. Multiple base URLs by category:

- **TVL / protocols / volume / fees**: `https://api.llama.fi`
- **Yields / pools**: `https://yields.llama.fi`
- **Stablecoins**: `https://stablecoins.llama.fi`

Full OpenAPI spec: `../../../data/defi/defillama-api.json`

## Key Endpoints

### TVL Data

| Endpoint | What It Returns |
|----------|----------------|
| `GET /protocols` | All protocols with TVL, category, chain, change metrics |
| `GET /protocol/{name}` | Detailed TVL history for one protocol |
| `GET /tvl/{name}` | Current TVL number for one protocol |
| `GET /v2/chains` | TVL per chain (Solana, Ethereum, etc.) |
| `GET /v2/historicalChainTvl/{chain}` | Historical TVL for a chain |

### Volume & Fees

| Endpoint | What It Returns |
|----------|----------------|
| `GET /overview/dexs` | DEX volume overview (all chains) |
| `GET /overview/dexs/{chain}` | DEX volume for one chain |
| `GET /overview/fees` | Fee/revenue overview |
| `GET /overview/fees/{chain}` | Fee/revenue for one chain |
| `GET /summary/fees/{protocol}` | Fee/revenue for one protocol |

### Yields (base URL: `https://yields.llama.fi`)

| Endpoint | What It Returns |
|----------|----------------|
| `GET /pools` | All yield pools with APY, TVL, chain |
| `GET /chart/{pool}` | Historical yield for one pool |

### Stablecoins (base URL: `https://stablecoins.llama.fi`)

| Endpoint | What It Returns |
|----------|----------------|
| `GET /stablecoins` | All stablecoins with market cap, chain breakdown |
| `GET /stablecoincharts/{chain}` | Stablecoin flows for a chain |
| `GET /stablecoins/stablecoindominance/{chain}` | Stablecoin market share per chain | **Paid tier only** |

### Market Intelligence

| Endpoint | What It Returns | Notes |
|----------|----------------|-------|
| `GET /api/categories` | Protocol categories with aggregate TVL | May be unavailable — use `/protocols` and group by `category` field as fallback |
| `GET /api/raises` | Funding rounds for crypto projects | **Paid tier only** ($300/mo) |
| `GET /api/hacks` | Historical hacks and exploits | **Paid tier only** ($300/mo) |
| `GET /api/treasuries` | Protocol treasury holdings | **Paid tier only** ($300/mo) |

## Filtering for Solana

The `/protocols` endpoint returns a `chain` field. Filter with:
- `chain === "Solana"` for Solana-only protocols
- `chains` array includes `"Solana"` for multi-chain protocols with Solana presence

The chain-specific endpoints (`/overview/dexs/Solana`, `/overview/fees/Solana`) return Solana-only data directly.

## SDKs

```bash
# JavaScript
npm install @defillama/api

# Python
pip install defillama-sdk
```

```typescript
import { DefiLlama } from '@defillama/api'
const client = new DefiLlama()
const protocols = await client.tvl.getProtocols()
const solanaProtocols = protocols.filter(p => p.chain === 'Solana' || p.chains?.includes('Solana'))
```

## Rate Limits

- Free tier: reasonable rate limits (undocumented exact numbers)
- No API key required
- Premium: $300/mo for higher limits
- For research queries, the free tier is more than enough
