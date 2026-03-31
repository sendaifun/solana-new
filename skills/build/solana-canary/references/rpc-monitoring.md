# RPC Monitoring Reference

Comprehensive reference for monitoring Solana RPC endpoint health, detecting issues, and implementing failover strategies.

---

## RPC Health Endpoint

### What to Check

The Solana RPC health endpoint returns whether the node considers itself healthy. A healthy node is caught up with the cluster and able to serve requests.

### Code Example

```typescript
import { Connection } from "@solana/web3.js";

async function checkRpcHealth(rpcUrl: string): Promise<{
  healthy: boolean;
  error?: string;
  latencyMs: number;
}> {
  const connection = new Connection(rpcUrl);
  const start = Date.now();

  try {
    const health = await connection.getHealth();
    const latencyMs = Date.now() - start;

    return {
      healthy: health === "ok",
      latencyMs,
    };
  } catch (error: any) {
    const latencyMs = Date.now() - start;
    return {
      healthy: false,
      error: error.message || "Unknown error",
      latencyMs,
    };
  }
}
```

Key points:
- `getHealth()` returns `"ok"` when the node is healthy.
- If the node is behind or unhealthy, it returns an error with details.
- Check periodically (every 30-60 seconds during active monitoring).
- If unhealthy, switch to a fallback endpoint immediately.

### Alert Threshold

- **CRITICAL**: Health check returns error for 2+ consecutive checks.
- **WARNING**: Health check latency exceeds 2000ms.
- **INFO**: Health check returns `"ok"` within expected latency.

### Mitigation

- Switch to fallback RPC endpoint.
- If all endpoints are unhealthy, alert the user and pause monitoring.
- Log the error details for diagnostics.

---

## Slot Lag Detection

### What to Check

Compare the slot reported by your RPC node against the network's actual slot. If your RPC is behind, reads will return stale data and transactions may fail due to blockhash expiry.

### Code Example

```typescript
async function checkSlotLag(
  primaryConnection: Connection,
  referenceConnection: Connection // a different RPC for comparison
): Promise<{
  primarySlot: number;
  referenceSlot: number;
  lag: number;
  acceptable: boolean;
}> {
  const [primarySlot, referenceSlot] = await Promise.all([
    primaryConnection.getSlot(),
    referenceConnection.getSlot(),
  ]);

  const lag = referenceSlot - primarySlot;

  return {
    primarySlot,
    referenceSlot,
    lag,
    acceptable: lag <= 50,
  };
}

// Alternative: use getSlot with different commitment levels
async function checkInternalLag(
  connection: Connection
): Promise<{
  processedSlot: number;
  confirmedSlot: number;
  finalizedSlot: number;
  processedToConfirmedLag: number;
  confirmedToFinalizedLag: number;
}> {
  const [processed, confirmed, finalized] = await Promise.all([
    connection.getSlot("processed"),
    connection.getSlot("confirmed"),
    connection.getSlot("finalized"),
  ]);

  return {
    processedSlot: processed,
    confirmedSlot: confirmed,
    finalizedSlot: finalized,
    processedToConfirmedLag: processed - confirmed,
    confirmedToFinalizedLag: confirmed - finalized,
  };
}
```

Key points:
- Slot lag >50 indicates the RPC is falling behind the cluster.
- Lag >150 means stale data is very likely and blockhash expiry is probable.
- Use a reference endpoint from a different provider for comparison.
- Internal lag (processed vs. confirmed vs. finalized) helps diagnose whether the issue is the node or the network.
- During network congestion, some lag is normal — context matters.

### Alert Threshold

- **CRITICAL**: Slot lag >150 (high risk of stale reads and failed transactions).
- **WARNING**: Slot lag >50 (reads may be slightly stale).
- **INFO**: Slot lag <=50 (within normal range).

### Mitigation

- Switch to a less-lagged endpoint.
- Increase transaction confirmation level from `processed` to `confirmed` to avoid acting on ephemeral data.
- Add recent blockhash refresh before each transaction send.

---

## Rate Limit Detection

### What to Check

RPC providers impose rate limits. When exceeded, requests return HTTP 429 (Too Many Requests). Sustained rate limiting degrades monitoring quality and can cause missed alerts.

### Code Example

```typescript
class RateLimitTracker {
  private requestCount = 0;
  private windowStart = Date.now();
  private rateLimitHits = 0;

  async makeRequest<T>(
    requestFn: () => Promise<T>,
    maxRetries = 3
  ): Promise<T> {
    this.requestCount++;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await requestFn();
      } catch (error: any) {
        if (error.message?.includes("429") || error.status === 429) {
          this.rateLimitHits++;

          // Exponential backoff: 1s, 2s, 4s
          const backoffMs = Math.pow(2, attempt) * 1000;
          await new Promise((resolve) => setTimeout(resolve, backoffMs));

          if (attempt === maxRetries) {
            throw new Error(
              `Rate limited after ${maxRetries} retries. ` +
              `${this.rateLimitHits} rate limit hits in current window.`
            );
          }
        } else {
          throw error;
        }
      }
    }

    throw new Error("Unreachable");
  }

  getStats(): {
    requestCount: number;
    rateLimitHits: number;
    hitRate: number;
    windowDurationMs: number;
  } {
    const windowDurationMs = Date.now() - this.windowStart;
    return {
      requestCount: this.requestCount,
      rateLimitHits: this.rateLimitHits,
      hitRate:
        this.requestCount > 0
          ? this.rateLimitHits / this.requestCount
          : 0,
      windowDurationMs,
    };
  }

  resetWindow(): void {
    this.requestCount = 0;
    this.rateLimitHits = 0;
    this.windowStart = Date.now();
  }
}
```

Known rate limits by provider:
- **Helius (free)**: 50 requests/second, 500,000 credits/month.
- **Helius (paid)**: 500+ requests/second depending on plan.
- **QuickNode (free)**: 25 requests/second.
- **QuickNode (paid)**: varies by plan, typically 100-500 requests/second.
- **Public RPC (devnet/mainnet)**: Heavily rate limited, no guarantees.
- **Triton**: Enterprise-grade, custom limits.

### Alert Threshold

- **CRITICAL**: Rate limit hit rate >10% of requests (monitoring quality degraded).
- **WARNING**: Any 429 response received.
- **INFO**: No rate limit hits.

### Mitigation

- Implement exponential backoff on 429 responses.
- Batch requests where possible (e.g., `getMultipleAccountsInfo` instead of multiple `getAccountInfo`).
- Reduce monitoring frequency during rate limiting.
- Upgrade to a paid RPC plan if free tier limits are consistently reached.
- Use request queuing to smooth out burst traffic.

---

## RPC Version Verification

### What to Check

Verify the Solana validator version running on the RPC node. Older versions may lack support for features your program depends on (versioned transactions, priority fees, address lookup tables).

### Code Example

```typescript
async function checkRpcVersion(
  connection: Connection,
  requiredFeatures: string[]
): Promise<{
  version: string;
  featureSet: number;
  supportsAllFeatures: boolean;
  missingFeatures: string[];
}> {
  const versionInfo = await connection.getVersion();

  // Known feature support by version (approximate)
  const featureSupport: Record<string, string> = {
    "versioned-transactions": "1.13.0",
    "priority-fees": "1.15.0",
    "address-lookup-tables": "1.13.0",
    "token-2022": "1.16.0",
    "compute-budget": "1.14.0",
  };

  const currentVersion = versionInfo["solana-core"];
  const missingFeatures = requiredFeatures.filter((feature) => {
    const minVersion = featureSupport[feature];
    if (!minVersion) return false; // Unknown feature, assume supported
    return compareVersions(currentVersion, minVersion) < 0;
  });

  return {
    version: currentVersion,
    featureSet: versionInfo["feature-set"] as number,
    supportsAllFeatures: missingFeatures.length === 0,
    missingFeatures,
  };
}

function compareVersions(a: string, b: string): number {
  const partsA = a.split(".").map(Number);
  const partsB = b.split(".").map(Number);

  for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
    const numA = partsA[i] || 0;
    const numB = partsB[i] || 0;
    if (numA !== numB) return numA - numB;
  }
  return 0;
}
```

Key points:
- `getVersion()` returns the solana-core version and feature set identifier.
- Feature set is a numeric hash that uniquely identifies the active feature set.
- If your program uses versioned transactions (v0), the RPC must support them.
- Priority fees require compute budget instruction support.
- Network upgrades happen on a schedule — RPC providers may lag behind.

### Alert Threshold

- **CRITICAL**: RPC version does not support a feature required by your program.
- **WARNING**: RPC version is more than 2 minor versions behind the network majority.
- **INFO**: RPC version is current.

### Mitigation

- Contact the RPC provider if their version is behind.
- Switch to a provider running a current version.
- If using the public RPC, it is typically updated quickly after network upgrades.

---

## Failover Patterns

### What to Check

No single RPC endpoint is 100% reliable. Implement failover to maintain monitoring continuity.

### Code Example

```typescript
class RpcConnectionPool {
  private connections: { url: string; connection: Connection; healthy: boolean }[];
  private primaryIndex: number = 0;

  constructor(endpoints: string[]) {
    this.connections = endpoints.map((url) => ({
      url,
      connection: new Connection(url),
      healthy: true,
    }));
  }

  async getHealthyConnection(): Promise<Connection> {
    // Try primary first
    const primary = this.connections[this.primaryIndex];
    if (primary.healthy) {
      return primary.connection;
    }

    // Failover: find first healthy connection
    for (const conn of this.connections) {
      if (conn.healthy) {
        return conn.connection;
      }
    }

    // All unhealthy: try primary anyway (may have recovered)
    return primary.connection;
  }

  async healthCheckAll(): Promise<void> {
    await Promise.all(
      this.connections.map(async (conn) => {
        try {
          const health = await conn.connection.getHealth();
          conn.healthy = health === "ok";
        } catch {
          conn.healthy = false;
        }
      })
    );
  }

  // Fastest-response-wins strategy
  async racedRequest<T>(requestFn: (conn: Connection) => Promise<T>): Promise<T> {
    const healthyConns = this.connections.filter((c) => c.healthy);
    if (healthyConns.length === 0) {
      return requestFn(this.connections[0].connection);
    }

    return Promise.race(
      healthyConns.map((c) => requestFn(c.connection))
    );
  }
}

// Usage
const pool = new RpcConnectionPool([
  "https://rpc.helius.xyz/?api-key=YOUR_KEY", // Primary: Helius
  "https://api.mainnet-beta.solana.com",       // Fallback: Public RPC
  "https://your-quicknode-endpoint.com",       // Fallback: QuickNode
]);

// Periodic health check
setInterval(() => pool.healthCheckAll(), 30_000);
```

Key points:
- Always configure at least 2 RPC endpoints.
- Run health checks on all endpoints periodically (every 30 seconds).
- Primary/secondary pattern: use the best endpoint, failover to the next.
- Fastest-response-wins: race all healthy endpoints and use the first response. Costs more credits but minimizes latency.
- Health check before failover: do not send real traffic to an endpoint that failed its last health check.
- Re-check failed endpoints periodically — they may recover.

### Alert Threshold

- **CRITICAL**: All endpoints are unhealthy.
- **WARNING**: Primary endpoint is unhealthy (operating on fallback).
- **INFO**: All endpoints healthy.

### Mitigation

- Automatic failover to secondary endpoint.
- Alert user when operating on fallback (fallback may have lower rate limits).
- Implement circuit breaker: if an endpoint fails 3 consecutive health checks, stop trying for 5 minutes.

---

## Endpoint Comparison

### What to Check

Different RPC providers have different characteristics. Choose the right one based on your needs.

### Provider Comparison

| Provider | Devnet URL | Mainnet URL | Rate Limit (free) | WebSocket | Latency | Best For |
|----------|-----------|-------------|-------------------|-----------|---------|----------|
| **Public** | `https://api.devnet.solana.com` | `https://api.mainnet-beta.solana.com` | Heavily limited | Unreliable | Variable | Quick testing only |
| **Helius** | `https://devnet.helius-rpc.com/?api-key=KEY` | `https://mainnet.helius-rpc.com/?api-key=KEY` | 50 req/s | Reliable | Low | General purpose, DAS API |
| **QuickNode** | Custom | Custom | 25 req/s | Reliable | Very low | Low-latency needs |
| **Triton** | Custom | Custom | Enterprise | Reliable | Very low | Validator-grade, high throughput |
| **Alchemy** | Custom | Custom | 100M CU/month | Reliable | Low | Multi-chain teams |

### When to Upgrade

- **Free tier is fine when**: Building on devnet, low transaction volume, non-critical monitoring.
- **Upgrade to paid when**: Deploying to mainnet, monitoring requires >50 req/s, WebSocket reliability matters, you need DAS API (compressed NFTs, token metadata).
- **Upgrade to enterprise when**: >1000 req/s, SLA requirements, dedicated node needed, validator-grade latency.

### Code Example

```typescript
function selectEndpoint(config: {
  network: "devnet" | "mainnet-beta";
  heliusApiKey?: string;
  quicknodeUrl?: string;
}): string[] {
  const endpoints: string[] = [];

  // Priority order: paid providers first, public last
  if (config.heliusApiKey) {
    const base =
      config.network === "devnet"
        ? "https://devnet.helius-rpc.com"
        : "https://mainnet.helius-rpc.com";
    endpoints.push(`${base}/?api-key=${config.heliusApiKey}`);
  }

  if (config.quicknodeUrl) {
    endpoints.push(config.quicknodeUrl);
  }

  // Public RPC as last resort
  const publicUrl =
    config.network === "devnet"
      ? "https://api.devnet.solana.com"
      : "https://api.mainnet-beta.solana.com";
  endpoints.push(publicUrl);

  return endpoints;
}
```

### Alert Threshold

- **WARNING**: Operating on public RPC (rate limiting likely, monitoring quality reduced).
- **INFO**: Operating on paid provider.

### Mitigation

- Always configure at least one paid provider for mainnet monitoring.
- Use the public RPC only as a last-resort fallback or for devnet testing.
- Store API keys in environment variables, never in code or build context.
