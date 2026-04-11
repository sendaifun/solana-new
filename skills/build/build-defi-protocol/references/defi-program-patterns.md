# DeFi Program Patterns

Core patterns for building DeFi protocols on Solana. Each pattern includes the math, account structure, and relevant catalog references.

## AMM: Constant Product (x * y = k)

The simplest and most battle-tested AMM formula. Used by Raydium CP-Swap and Uniswap V2.

### Math

```
x * y = k (invariant)
output_amount = (y * input_amount) / (x + input_amount)
price_impact = 1 - (output_amount / (input_amount * y / x))
fee = input_amount * fee_bps / 10000
```

### Account Structure (Anchor)

```rust
#[account]
pub struct Pool {
    pub token_a_mint: Pubkey,
    pub token_b_mint: Pubkey,
    pub token_a_vault: Pubkey,    // PDA-owned token account
    pub token_b_vault: Pubkey,    // PDA-owned token account
    pub lp_mint: Pubkey,          // Liquidity provider token
    pub fee_bps: u16,             // Trading fee (e.g., 30 = 0.3%)
    pub protocol_fee_bps: u16,   // Protocol share of fees
    pub authority_bump: u8,       // PDA signer bump
}
```

### Swap Instruction Pattern

```rust
pub fn swap(ctx: Context<Swap>, amount_in: u64, minimum_amount_out: u64) -> Result<()> {
    let pool = &ctx.accounts.pool;
    let reserve_a = ctx.accounts.vault_a.amount;
    let reserve_b = ctx.accounts.vault_b.amount;

    // Calculate fee
    let fee = amount_in.checked_mul(pool.fee_bps as u64).unwrap()
        .checked_div(10000).unwrap();
    let amount_in_after_fee = amount_in.checked_sub(fee).unwrap();

    // Constant product: output = (reserve_b * amount_in) / (reserve_a + amount_in)
    let amount_out = reserve_b.checked_mul(amount_in_after_fee).unwrap()
        .checked_div(reserve_a.checked_add(amount_in_after_fee).unwrap()).unwrap();

    // Slippage check
    require!(amount_out >= minimum_amount_out, ErrorCode::SlippageExceeded);

    // Execute transfers via CPI...
    Ok(())
}
```

**Repos:** `raydium-cp-swap` (Raydium constant product AMM with Token-2022 support)
**Skills:** `raydium-skill` (CLMM, CPMM, AMM pools, farming, Trade API)

## AMM: Concentrated Liquidity

Liquidity is allocated within specific price ranges for better capital efficiency. Used by Orca Whirlpools and Raydium CLMM.

### Key Concepts

- **Tick**: Discrete price point. Price at tick `i` = 1.0001^i
- **Position**: Liquidity between a lower tick and upper tick
- **Active liquidity**: Only liquidity in the range containing current price earns fees
- **Capital efficiency**: 100-4000x better than constant product for tight ranges

### Position Structure

```rust
#[account]
pub struct Position {
    pub pool: Pubkey,
    pub owner: Pubkey,
    pub tick_lower: i32,
    pub tick_upper: i32,
    pub liquidity: u128,
    pub fee_growth_inside_a: u128,
    pub fee_growth_inside_b: u128,
    pub tokens_owed_a: u64,
    pub tokens_owed_b: u64,
}
```

**Repos:** `whirlpools` (Orca concentrated liquidity AMM programs + TS/Rust SDKs)
**Skills:** `orca-skill` (Whirlpools concentrated liquidity — swaps and position management)

## Lending Pool

### Interest Rate Model

```rust
// Utilization rate = total_borrows / (total_deposits)
// Below optimal utilization: low slope (encourage borrowing)
// Above optimal utilization: steep slope (discourage borrowing, attract deposits)

pub fn calculate_borrow_rate(
    utilization: u64,       // scaled by 1e18
    base_rate: u64,         // e.g., 2% = 2e16
    slope1: u64,            // gentle slope below optimal
    slope2: u64,            // steep slope above optimal
    optimal_utilization: u64 // e.g., 80% = 8e17
) -> u64 {
    if utilization <= optimal_utilization {
        base_rate + (utilization * slope1 / optimal_utilization)
    } else {
        let excess = utilization - optimal_utilization;
        let max_excess = 1e18 as u64 - optimal_utilization;
        base_rate + slope1 + (excess * slope2 / max_excess)
    }
}
```

### Lending Account Structure

```rust
#[account]
pub struct LendingPool {
    pub mint: Pubkey,
    pub vault: Pubkey,
    pub total_deposits: u64,
    pub total_borrows: u64,
    pub cumulative_borrow_rate: u128,  // Accumulates interest over time
    pub last_update_slot: u64,
    pub oracle: Pubkey,                // Price oracle for collateral valuation
    pub ltv_bps: u16,                  // Loan-to-value ratio (e.g., 7500 = 75%)
    pub liquidation_threshold_bps: u16,
    pub liquidation_bonus_bps: u16,
}
```

**Skills:** `kamino-skill` (lending, borrowing, liquidity management, leverage)
**Skills:** `marginfi-skill` (lending, borrowing, leveraged positions, flash loans)
**Skills:** `lulo-skill` (lending aggregator — routes to highest yield)

## Vault Pattern

Vaults accept deposits, execute a strategy, and distribute yield.

```rust
#[account]
pub struct Vault {
    pub underlying_mint: Pubkey,
    pub share_mint: Pubkey,          // Vault receipt token
    pub underlying_vault: Pubkey,
    pub total_underlying: u64,
    pub total_shares: u64,
    pub strategy: Pubkey,            // Program handling the yield strategy
    pub performance_fee_bps: u16,
    pub management_fee_bps: u16,
    pub authority_bump: u8,
}

// Deposit: shares_to_mint = deposit_amount * total_shares / total_underlying
// Withdraw: underlying_to_return = shares_to_burn * total_underlying / total_shares
```

**Skills:** `glam` (vault management via GLAM Protocol — DeFi integrations across Jupiter, Kamino, etc.)

> **Note:** Protocol-specific skills (e.g., `drift-skill`) may reference defunct protocols. Always verify protocol health before using — see `data/solana-knowledge/04-protocols-and-sdks.md` → "Protocol Health Verification".

## Perpetuals / Derivatives Pattern

Perps protocols maintain positions with leverage using oracle prices for mark price and funding.

```rust
#[account]
pub struct PerpMarket {
    pub base_mint: Pubkey,              // e.g., SOL
    pub quote_mint: Pubkey,             // e.g., USDC
    pub oracle: Pubkey,                 // Pyth price feed
    pub total_long_size: u64,           // Total open long positions
    pub total_short_size: u64,          // Total open short positions
    pub funding_rate: i64,              // Current funding rate (per hour, scaled)
    pub last_funding_time: i64,
    pub max_leverage: u8,               // e.g., 20 = 20x
    pub maintenance_margin_bps: u16,    // e.g., 500 = 5%
    pub insurance_fund: Pubkey,
}

#[account]
pub struct Position {
    pub owner: Pubkey,
    pub market: Pubkey,
    pub size: i64,                      // Positive = long, negative = short
    pub entry_price: u64,              // Scaled by decimals
    pub collateral: u64,               // USDC deposited
    pub unrealized_pnl: i64,
    pub last_funding_payment: i64,
    pub liquidation_price: u64,
}

// Open position:
//   leverage = size * entry_price / collateral
//   liquidation_price = entry_price * (1 - 1/leverage) for longs
//   liquidation_price = entry_price * (1 + 1/leverage) for shorts

// Funding rate (keeps perp price anchored to spot):
//   funding = (perp_mark_price - spot_price) / spot_price * rate_scalar
//   Longs pay shorts when funding > 0, shorts pay longs when funding < 0
```

### Key implementation considerations:
- **Oracle dependency**: Perps REQUIRE reliable oracles. Use Pyth with confidence intervals. Never use a single source.
- **Liquidation engine**: Must run automatically when margin < maintenance. Consider keeper bots or on-chain cranks.
- **Insurance fund**: Collects from liquidation profits to cover underwater positions.
- **Funding rate**: Calculate at regular intervals (hourly/8-hourly). Store last calculation timestamp.
- **Position limits**: Cap maximum open interest per market to manage risk.
- **Price impact**: Large orders should move the mark price (virtual AMM or orderbook).

**MCPs:** `flash-trade-mcp` (leveraged perps with Pyth Lazer prices)
**MCPs:** `perp-cli-mcp` (Pacifica + Hyperliquid perps CLI)

> **Note:** Protocol-specific skills may reference defunct protocols. Always verify protocol health before using — see `data/solana-knowledge/04-protocols-and-sdks.md` → "Protocol Health Verification".

### Integrating with existing protocols (instead of building from scratch):

If the user wants to BUILD ON TOP of existing protocols (not build a new one), route them to `build-with-claude` instead. Building from scratch is extremely complex (oracle integration, liquidation, funding, risk management).

**Recommendation:** Check `data/solana-knowledge/04-protocols-and-sdks.md` → Decision Quick Reference for the current healthy protocol in each category. Verify its health, then use its SDK. This applies to all DeFi categories — swaps, lending, derivatives, yield, etc.

## Oracle Integration

Always use an oracle for price data in DeFi. Never trust client-provided prices.

```rust
// Pyth oracle price feed
use pyth_solana_receiver_sdk::price_update::PriceUpdateV2;

pub fn get_price(price_update: &AccountInfo) -> Result<(i64, u32)> {
    let price_data = PriceUpdateV2::try_deserialize(&mut &**price_update.data.borrow())?;
    let price = price_data.get_price_no_older_than(
        &Clock::get()?,
        60,  // Maximum staleness in seconds
        &feed_id,
    )?;
    Ok((price.price, price.exponent.unsigned_abs()))
}
```

**Skills:** `pyth-skill` (real-time price feeds with confidence intervals)
**Skills:** `switchboard-skill` (permissionless price feeds, VRF, custom data)
**Repos:** `pyth-sdk` (Rust SDK for on-chain price feeds)
**Repos:** `switchboard-solana` (Switchboard oracle integration)

## Liquidity Staking

```rust
// Exchange rate: sol_per_share = total_sol_staked / total_shares
// Deposit: shares = sol_amount * total_shares / total_sol_staked
// Withdraw: sol = shares * total_sol_staked / total_shares
// Yield: total_sol_staked increases from staking rewards, shares stay constant
```

**Repos:** `marinade-liquid-staking` (Anchor-based liquid staking — mSOL)
**Skills:** `sanctum-skill` (liquid staking, LST swaps, Infinity pool)
**MCPs:** `marinade-finance-mcp-server` (stake/unstake, mSOL balance, protocol state)
