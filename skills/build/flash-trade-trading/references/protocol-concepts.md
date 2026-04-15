# Flash Trade Protocol Concepts

Core domain knowledge for developers integrating with Flash Trade.

## Pool-to-Peer Model

All trades execute against shared liquidity pools — no orderbook, no counterparty matching. Traders open leveraged positions against pool liquidity, and LPs earn fees from trading activity.

```
Pool (e.g., Crypto.1)
├── Custody: USDC    (collateral, stable)
├── Custody: SOL     (target, volatile)
├── Custody: BTC     (target, volatile)
├── Custody: ETH     (target, volatile)
├── Market: SOL-Long   (target=SOL, collateral=USDC)
├── Market: SOL-Short  (target=SOL, collateral=USDC)
├── Market: BTC-Long   ...
└── ...
```

## Key Entities

### Pool
A liquidity container holding multiple token custodies and defining tradable markets. Each pool has its own FLP token for liquidity providers.

| Category | Example | Assets |
|----------|---------|--------|
| Crypto | `Crypto.1` | USDC, SOL, BTC, ETH, JitoSOL |
| Virtual | `Virtual.1` | USDC, XAU, XAG, EUR, GBP, CRUDEOIL |
| Governance | `Governance.1` | USDC, JUP, PYTH, JTO, RAY |
| Community | `Community.1`, `Community.2` | USDC, BONK, PENGU, WIF |
| RWA | `Remora.1` | USDC, TSLAr, NVDAr, SPYr |

### Custody
A token's configuration within a pool — fees, oracle setup, pricing limits, borrow rates.

### Market
A tradable pair within a pool. Defined by: target custody + collateral custody + side (Long/Short).

### Position
A leveraged trade. Key fields: owner, market, entry price, size (in target token), collateral (in collateral token), PnL, liquidation price.

- **PDA derivation:** `["position", owner, pool, custody, side_byte]` where side_byte: Long=1, Short=2
- **One position per market per side per wallet.** Multiple trades for the same market+side merge into a single position.

### Order Account
Stores trigger orders (TP/SL) and limit orders per market per owner. Max 5 of each type per market.

## Collateral & Leverage

**Leverage** = position size USD / collateral USD. A $100 collateral at 5x leverage = $500 position size.

**Collateral rules:**
- **Minimum >$10 after fees** for positions that need limit orders, TP, or SL. Use $11-12+ minimum.
- Long positions use the **target token** as collateral (SOL/SOL, ETH/ETH). USDC deposits are auto-swapped.
- Short positions use **USDC** as collateral.
- SOL positions use **JitoSOL** as underlying collateral on-chain.

**Leverage limits:**
- Standard: 1x to ~100x
- Degen Mode: up to 500x (select assets only, not available for limit/trigger orders)

## Fee Structure

| Fee Type | Typical Range | Notes |
|----------|--------------|-------|
| Open position | 4-8 BPS | Deducted from collateral at entry |
| Close position | 4-8 BPS | Deducted from proceeds at exit |
| Hourly borrow rate | Variable | Increases with pool utilization |
| Swap | 10-30 BPS | Ratio-dependent |
| LP deposit/withdrawal | 0-30 BPS | Incentivizes balanced pool composition |

## Order Types

| Type | Execution | Collateral Requirement | Notes |
|------|-----------|----------------------|-------|
| Market | Immediate at oracle price + slippage | Any amount | Default order type |
| Limit | When price hits target (keeper-executed) | >$10 after fees | Max 5 per market |
| Take-Profit (TP) | When price hits profit target | >$10 after fees | Max 5 per market |
| Stop-Loss (SL) | When price hits loss limit | >$10 after fees | Max 5 per market |

Trigger orders (TP/SL) and limit orders are executed by off-chain keepers. Keeper latency may occur during high-volatility periods.

## Virtual Tokens

Synthetic exposure to assets without actual token custody (forex, commodities, equities). The pool holds only USDC — PnL settles in USDC based on Pyth oracle price movement.

Examples: XAU (gold), XAG (silver), EUR, GBP, CRUDEOIL, USDJPY, TSLAr, NVDAr, SPYr

## Oracle Pricing

Flash Trade uses **Pyth Network** oracles:
- **Pyth Lazer:** Low-latency price feed (200ms updates) — used for trade execution
- **Pyth Hermes:** REST fallback for closed-market hours

**Important:** Pyth prices are **mainnet only**. Devnet returns stale/zero prices.

## Program IDs

| Program | Mainnet | Devnet |
|---------|---------|--------|
| Perpetuals | `FLASH6Lo6h3iasJKWDs2F8TkW2UKf3s15C8PMGuVfgBn` | `FTPP4jEWW1n8s2FEccwVfS9KCPjpndaswg7Nkkuz4ER4` |
| Composability | `FSWAPViR8ny5K96hezav8jynVubP2dJ2L7SbKzds2hwm` | `SWAP4AE4N1if9qKD7dgfQgmRBRv1CtWG8xDs4HP14ST` |
