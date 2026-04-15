# Flash Trade Error Reference

Common error codes from the Flash Trade perpetuals program, plus REST API HTTP errors. The full program defines codes 6000-6068; the most frequently encountered are documented below.

## HTTP Errors (REST API Layer)

| Code | Meaning | Common Cause |
|------|---------|--------------|
| 400 | Bad Request | Invalid pubkey format, missing required field, invalid enum value |
| 404 | Not Found | Account/position/order doesn't exist; price symbol unavailable |
| 429 | Too Many Requests | Per-owner WebSocket connection limit (5) exceeded |
| 500 | Internal Server Error | Computation failure, unexpected blockchain state |
| 503 | Service Unavailable | Price data missing (market closed); global WebSocket limit reached |

**Error response formats:**
```json
{ "error": "descriptive error message" }
{ "err": "descriptive error message" }
```

The API uses `"error"` for HTTP-level errors and `"err"` for domain-specific computation errors (in transaction builder responses). Always check both.

## On-Chain Error Codes (6000-6068)

### Trading Errors (Most Common)

| Code | Name | Solution |
|------|------|----------|
| **6020** | **MaxPriceSlippage** | Price moved beyond tolerance. Widen slippage (1-3%) or retry with fresh price. |
| **6021** | **MaxLeverage** | Post-modification leverage exceeds limit. Reduce size or add collateral. |
| **6022** | **MaxInitLeverage** | New position leverage too high. Reduce size or increase collateral. |
| **6023** | **MinLeverage** | Leverage below minimum. Increase size or reduce collateral. |
| **6024** | **CustodyAmountLimit** | Pool capacity reached. Try smaller position or wait. |
| **6025** | **PositionAmountLimit** | Single position exceeds max size. Split into smaller positions. |
| **6031** | **InstructionNotAllowed** | Trading paused by protocol. Wait and retry. |
| **6032** | **MaxUtilization** | Pool utilization at capacity. Try smaller position or wait. |
| **6033** | **CloseOnlyMode** | Market in close-only mode. Only close/decrease allowed. |
| **6034** | **MinCollateral** | Below min collateral. Use $11-12+ for TP/SL positions. |

### Order Errors

| Code | Name | Solution |
|------|------|----------|
| **6049** | **InvalidStopLossPrice** | SL price invalid for position direction. |
| **6050** | **InvalidTakeProfitPrice** | TP price invalid for position direction. |
| **6051** | **ExposureLimitExceeded** | Degen Mode exposure cap hit. Reduce size. |
| **6052** | **MaxStopLossOrders** | Max 5 SL orders. Cancel one first. |
| **6053** | **MaxTakeProfitOrders** | Max 5 TP orders. Cancel one first. |
| **6054** | **MaxOpenOrder** | Max 5 limit orders. Cancel one first. |
| 6055 | InvalidOrder | Order doesn't exist at specified index (0-4). |
| 6056 | InvalidLimitPrice | Limit price invalid for position direction. |

### Oracle Errors

| Code | Name | Solution |
|------|------|----------|
| **6007** | **StaleOraclePrice** | Oracle price too old. Retry after a few slots. |
| 6004 | UnsupportedOracle | Custody oracle misconfigured. |
| 6005 | InvalidOracleAccount | Wrong oracle account passed. |
| 6006 | InvalidOracleState | Oracle feed offline or corrupted. Wait and retry. |
| 6008 | InvalidOraclePrice | Oracle returned 0 or negative. Wait and retry. |

### State Validation Errors

| Code | Name | Solution |
|------|------|----------|
| 6010 | InvalidPoolState | Pool account issue. Verify pool address. |
| 6011 | InvalidCustodyState | Custody account issue. Re-fetch config. |
| 6012 | InvalidMarketState | Market account issue. Verify market exists. |
| 6014 | InvalidPositionState | Position doesn't exist or is already closed. |
| 6030 | UnsupportedMarket | Market doesn't exist for this target/collateral/side. |
| 6046 | InvalidAccess | Pool requires NFT or referral for access. |

### Arithmetic

| Code | Name | Solution |
|------|------|----------|
| 6003 | MathOverflow | Reduce position size. Rare. |

## Common Recovery Scenarios

### "Blockhash not found" / "Blockhash expired"
Solana blockhashes expire in ~60 seconds. Re-call the transaction builder to get a fresh transaction, then sign and submit immediately.

### Position not found after closing
The API caches data ~15 seconds. After closing, `get_positions` may briefly still show it. This is normal cache lag.

### Trigger orders not executing
1. Verify oracle price has crossed the trigger level
2. Check the position still exists (not liquidated)
3. Keepers may have latency during high-volatility periods

### "Account not found" on position operations
Position PDA doesn't exist — either never opened or already closed/liquidated. Verify via `GET /positions/owner/{owner}` first.
