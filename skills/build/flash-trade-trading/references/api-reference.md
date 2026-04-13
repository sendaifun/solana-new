# Flash Trade API Reference

REST API for the Flash Trade perpetuals protocol on Solana.

**Base URL:** `https://flashapi.trade`

**Swagger UI:** `https://flashapi.trade/docs/`

**Authentication:** None. The API is public.

**Rate limit:** 10 requests per second.

---

## Endpoints

### Health

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/health` | Service status and cached account counts |

### Raw Accounts (on-chain data)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/raw/perpetuals` | Global config (permissions, fees) |
| GET | `/raw/pools` | All pools |
| GET | `/raw/pools/{pubkey}` | Single pool by pubkey |
| GET | `/raw/custodies` | All custodies |
| GET | `/raw/custodies/{pubkey}` | Single custody by pubkey |
| GET | `/raw/markets` | All markets with pool/custody metadata |
| GET | `/raw/markets/{pubkey}` | Single market by pubkey |
| GET | `/raw/positions/{pubkey}` | Single position by pubkey (raw, no enrichment) |
| GET | `/raw/orders/{pubkey}` | Single order by pubkey (raw) |

### Enriched Data (computed PnL, leverage, liquidation)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/positions/owner/{owner}` | All positions for a wallet (with PnL, leverage, liquidation) |
| GET | `/orders/owner/{owner}` | All orders for a wallet |

### Prices

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/prices` | All current oracle prices |
| GET | `/prices/{symbol}` | Price for one symbol (e.g., "SOL") |

### Pool Data

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/pool-data` | Pool AUM, LP stats, utilization for all pools |
| GET | `/pool-data/{pool_pubkey}` | Pool data for a specific pool |

### Transaction Builder — Trading

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/transaction-builder/open-position` | Open new position (market or limit) |
| POST | `/transaction-builder/close-position` | Close or partial close |
| POST | `/transaction-builder/reverse-position` | Close + open opposite direction |

### Transaction Builder — Collateral

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/transaction-builder/add-collateral` | Add margin to reduce leverage |
| POST | `/transaction-builder/remove-collateral` | Withdraw margin to increase leverage |

### Transaction Builder — Trigger Orders

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/transaction-builder/place-trigger-order` | Place TP or SL |
| POST | `/transaction-builder/edit-trigger-order` | Edit an existing TP/SL |
| POST | `/transaction-builder/cancel-trigger-order` | Cancel a single TP/SL |
| POST | `/transaction-builder/cancel-all-trigger-orders` | Cancel all TP/SL for a market+side |

### Previews (calculations only, no transactions)

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/preview/limit-order-fees` | Estimate fees before placing a limit order |
| POST | `/preview/exit-fee` | Estimate close cost |
| POST | `/preview/tp-sl` | Calculate TP/SL prices and projected PnL |
| POST | `/preview/margin` | Preview add/remove collateral effect |

### WebSocket

| Path | Purpose |
|------|---------|
| `/owner/{owner}/ws` | Live position and order updates for a wallet |

WebSocket limits: 10,000 global connections; 5 per owner wallet.

---

## Open Position — Request

```bash
curl -X POST https://flashapi.trade/transaction-builder/open-position \
  -H "Content-Type: application/json" \
  -d '{
    "inputTokenSymbol": "USDC",
    "outputTokenSymbol": "SOL",
    "inputAmountUi": "100.0",
    "leverage": 5.0,
    "tradeType": "LONG",
    "owner": "<WALLET_PUBKEY>",
    "slippagePercentage": "0.5"
  }'
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `inputTokenSymbol` | string | Yes | Token to pay with: `"USDC"`, `"SOL"`, etc. |
| `outputTokenSymbol` | string | Yes | Market to trade: `"SOL"`, `"BTC"`, `"ETH"`, etc. |
| `inputAmountUi` | string | Yes | Amount in UI format, e.g. `"100.0"` |
| `leverage` | number | Yes | Leverage multiplier, e.g. `5.0` |
| `tradeType` | string | Yes | `"LONG"` or `"SHORT"` |
| `owner` | string | No | Wallet pubkey. Omit for preview-only (no transaction). |
| `orderType` | string | No | `"MARKET"` (default) or `"LIMIT"` |
| `limitPrice` | string | No | Required for LIMIT orders. Trigger price. |
| `slippagePercentage` | string | No | Default `"0.5"` (0.5%). |
| `takeProfit` | string | No | TP trigger price. |
| `stopLoss` | string | No | SL trigger price. |

## Open Position — Response

```json
{
  "newEntryPrice": "148.52",
  "newLeverage": "4.95",
  "newLiquidationPrice": "119.82",
  "entryFee": "0.30",
  "openPositionFeePercent": "0.06",
  "youPayUsdUi": "100.00",
  "youRecieveUsdUi": "495.00",
  "marginFeePercentage": "0.0042",
  "transactionBase64": "AQAAAA...base64...AAAA==",
  "err": null
}
```

Key fields: `transactionBase64` (unsigned transaction to sign and submit), `newLiquidationPrice`, `entryFee`, `err` (null on success, error message on failure).

> **Note:** `youRecieveUsdUi` is intentionally misspelled in the API response (not "Receive"). Use the exact field name as shown.

`transactionBase64` is only present when `owner` is provided in the request.

## Close Position — Request

```json
{
  "positionPubkey": "<POSITION_PUBKEY>",
  "inputUsdUi": "495.00",
  "withdrawTokenSymbol": "USDC"
}
```

Use partial `inputUsdUi` for partial close (calls `decreaseSize` internally).

## Error Format

```json
{ "error": "descriptive error message" }
{ "err": "descriptive error message" }
```

The API uses `"error"` for HTTP-level errors and `"err"` for domain-specific errors in transaction builder responses. Always check both.

See [error-reference.md](error-reference.md) for all error codes.
