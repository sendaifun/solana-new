# Data Storage

Schema design and storage patterns for Solana indexed data. Covers PostgreSQL for structured data, Redis for caching, and time-series patterns for market data.

## PostgreSQL: Primary Storage

PostgreSQL is the standard choice for indexed Solana data. It handles the volume, supports JSON for flexible fields, and has excellent query capabilities.

### Core Schema: Transactions

```sql
CREATE TABLE transactions (
    signature TEXT PRIMARY KEY,
    slot BIGINT NOT NULL,
    block_time TIMESTAMP WITH TIME ZONE,
    success BOOLEAN NOT NULL DEFAULT true,
    fee BIGINT NOT NULL,                    -- in lamports
    source TEXT,                            -- "JUPITER", "RAYDIUM", etc.
    type TEXT,                              -- "TRANSFER", "SWAP", "NFT_MINT"
    raw_data JSONB,                         -- full enhanced transaction
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_transactions_slot ON transactions (slot);
CREATE INDEX idx_transactions_block_time ON transactions (block_time);
CREATE INDEX idx_transactions_type ON transactions (type);
CREATE INDEX idx_transactions_source ON transactions (source);
```

### Token Transfers

```sql
CREATE TABLE token_transfers (
    id BIGSERIAL PRIMARY KEY,
    signature TEXT NOT NULL REFERENCES transactions(signature),
    mint TEXT NOT NULL,
    from_address TEXT NOT NULL,
    to_address TEXT NOT NULL,
    amount NUMERIC(78, 0) NOT NULL,         -- u64 max = 18446744073709551615
    decimals SMALLINT NOT NULL,
    slot BIGINT NOT NULL,
    block_time TIMESTAMP WITH TIME ZONE,

    UNIQUE (signature, mint, from_address, to_address)  -- Idempotency
);

CREATE INDEX idx_transfers_mint ON token_transfers (mint);
CREATE INDEX idx_transfers_from ON token_transfers (from_address);
CREATE INDEX idx_transfers_to ON token_transfers (to_address);
CREATE INDEX idx_transfers_block_time ON token_transfers (block_time);
```

### Account State Snapshots

```sql
CREATE TABLE account_snapshots (
    account_address TEXT NOT NULL,
    slot BIGINT NOT NULL,
    owner_program TEXT NOT NULL,
    lamports BIGINT NOT NULL,
    data BYTEA,                             -- Raw account data
    parsed_data JSONB,                      -- Decoded account data
    updated_at TIMESTAMP DEFAULT NOW(),

    PRIMARY KEY (account_address, slot)
);

-- Latest state view
CREATE VIEW latest_account_state AS
SELECT DISTINCT ON (account_address)
    account_address, slot, owner_program, lamports, parsed_data, updated_at
FROM account_snapshots
ORDER BY account_address, slot DESC;
```

### Swap Events (DeFi-Specific)

```sql
CREATE TABLE swaps (
    signature TEXT PRIMARY KEY,
    slot BIGINT NOT NULL,
    block_time TIMESTAMP WITH TIME ZONE,
    dex TEXT NOT NULL,                      -- "jupiter", "raydium", "orca"
    trader TEXT NOT NULL,
    input_mint TEXT NOT NULL,
    output_mint TEXT NOT NULL,
    input_amount NUMERIC(78, 0) NOT NULL,
    output_amount NUMERIC(78, 0) NOT NULL,
    fee_amount NUMERIC(78, 0),
    price_impact_bps SMALLINT,
    pool_address TEXT
);

CREATE INDEX idx_swaps_trader ON swaps (trader);
CREATE INDEX idx_swaps_dex ON swaps (dex);
CREATE INDEX idx_swaps_input_mint ON swaps (input_mint);
CREATE INDEX idx_swaps_block_time ON swaps (block_time);
```

## Redis: Caching Layer

Use Redis for hot data that changes frequently and needs sub-millisecond reads.

### Common Cache Patterns

```typescript
import Redis from "ioredis";
const redis = new Redis(process.env.REDIS_URL);

// Cache token prices (expires after 30 seconds)
async function cacheTokenPrice(mint: string, price: number) {
  await redis.set(`price:${mint}`, price.toString(), "EX", 30);
}

async function getTokenPrice(mint: string): Promise<number | null> {
  const cached = await redis.get(`price:${mint}`);
  return cached ? parseFloat(cached) : null;
}

// Cache wallet balances (expires after 60 seconds)
async function cacheWalletBalance(wallet: string, balances: any) {
  await redis.set(`balance:${wallet}`, JSON.stringify(balances), "EX", 60);
}

// Rate limiting for API endpoints
async function checkRateLimit(ip: string, limit = 100, windowSeconds = 60): Promise<boolean> {
  const key = `rate:${ip}`;
  const count = await redis.incr(key);
  if (count === 1) await redis.expire(key, windowSeconds);
  return count <= limit;
}
```

### Real-Time Leaderboards / Rankings

```typescript
// Sorted set for top traders by volume
await redis.zadd("leaderboard:volume:24h", volume, traderAddress);

// Get top 10
const top10 = await redis.zrevrange("leaderboard:volume:24h", 0, 9, "WITHSCORES");

// Clean up daily
await redis.del("leaderboard:volume:24h");
```

### Pub/Sub for Real-Time Updates

```typescript
// Publisher (in webhook handler)
await redis.publish("events:swaps", JSON.stringify(swapEvent));

// Subscriber (in WebSocket server for frontend)
const sub = new Redis(process.env.REDIS_URL);
sub.subscribe("events:swaps");
sub.on("message", (channel, message) => {
  const event = JSON.parse(message);
  // Push to connected WebSocket clients
  wss.clients.forEach(client => client.send(message));
});
```

## Time-Series Patterns

For price, volume, and TVL data that needs aggregation over time windows.

### OHLCV Candles

```sql
CREATE TABLE ohlcv (
    mint TEXT NOT NULL,
    interval TEXT NOT NULL,                 -- "1m", "5m", "1h", "1d"
    open_time TIMESTAMP WITH TIME ZONE NOT NULL,
    open NUMERIC NOT NULL,
    high NUMERIC NOT NULL,
    low NUMERIC NOT NULL,
    close NUMERIC NOT NULL,
    volume NUMERIC NOT NULL,
    trade_count INTEGER NOT NULL,

    PRIMARY KEY (mint, interval, open_time)
);

-- Query: get 1-hour candles for last 24 hours
SELECT * FROM ohlcv
WHERE mint = 'TOKEN_MINT' AND interval = '1h'
AND open_time > NOW() - INTERVAL '24 hours'
ORDER BY open_time;
```

### Building Candles from Swap Events

```typescript
// Aggregate swaps into OHLCV candles
async function updateCandle(swap: SwapEvent, interval: string) {
  const bucketTime = truncateToInterval(swap.blockTime, interval);

  await db.query(`
    INSERT INTO ohlcv (mint, interval, open_time, open, high, low, close, volume, trade_count)
    VALUES ($1, $2, $3, $4, $4, $4, $4, $5, 1)
    ON CONFLICT (mint, interval, open_time) DO UPDATE SET
      high = GREATEST(ohlcv.high, EXCLUDED.high),
      low = LEAST(ohlcv.low, EXCLUDED.low),
      close = $4,
      volume = ohlcv.volume + EXCLUDED.volume,
      trade_count = ohlcv.trade_count + 1
  `, [swap.outputMint, interval, bucketTime, swap.price, swap.volume]);
}

function truncateToInterval(time: Date, interval: string): Date {
  const ms = { "1m": 60000, "5m": 300000, "1h": 3600000, "1d": 86400000 }[interval]!;
  return new Date(Math.floor(time.getTime() / ms) * ms);
}
```

## Idempotent Write Pattern

The most important pattern for data pipelines. Webhooks, WebSockets, and backfills can all deliver duplicates.

```typescript
// Use transaction signature as natural deduplication key
async function processEvent(event: any) {
  const result = await db.query(
    `INSERT INTO events (signature, slot, data)
     VALUES ($1, $2, $3)
     ON CONFLICT (signature) DO NOTHING
     RETURNING id`,
    [event.signature, event.slot, event]
  );

  if (result.rowCount === 0) {
    // Already processed — skip
    return;
  }

  // First time seeing this event — process downstream effects
  await updateBalances(event);
  await updateCandles(event);
}
```

## Schema Design Principles

1. **Always store slot number** — It's the source of truth for ordering on Solana
2. **Use NUMERIC for token amounts** — u64 overflows BIGINT (max 9.2e18 vs 1.8e19)
3. **Store raw data in JSONB** — You'll want to reprocess later
4. **Separate hot and cold data** — Recent data (last 7 days) in primary tables, older data in partitioned archive
5. **Index by access pattern** — If you query by wallet, index by wallet. Don't over-index.
6. **Partition large tables by time** — `PARTITION BY RANGE (block_time)` for tables > 100M rows

```sql
-- Example: partition transfers by month
CREATE TABLE token_transfers (
    -- ... columns ...
) PARTITION BY RANGE (block_time);

CREATE TABLE token_transfers_2024_01 PARTITION OF token_transfers
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
```

## Monitoring Your Pipeline

```sql
-- Check ingestion lag
SELECT NOW() - MAX(block_time) AS lag FROM transactions;

-- Check for gaps (missing slots)
SELECT slot + 1 AS gap_start,
       next_slot - 1 AS gap_end
FROM (
  SELECT slot, LEAD(slot) OVER (ORDER BY slot) AS next_slot
  FROM transactions
) t
WHERE next_slot - slot > 1
LIMIT 10;
```

**MCPs:** `spice-mcp` (Flipside Analytics — query Solana data via Flipside API)
**MCPs:** `opensvm-dexscreener-mcp` (real-time DEX pair data across chains)
**MCPs:** `defi-analytics-mcp` (wallet analytics, transaction monitoring)
