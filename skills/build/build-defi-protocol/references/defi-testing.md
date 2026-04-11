# DeFi Testing

Testing strategies for Solana DeFi programs. DeFi code handles real money — testing must be thorough, realistic, and adversarial.

## Testing Pyramid for DeFi

```
                    ┌─────────────┐
                    │  Mainnet    │  Final smoke test
                    │  Fork Test  │  (Surfpool)
                   ┌┴─────────────┴┐
                   │  Integration   │  Full protocol flow
                   │  Tests         │  (Surfpool + devnet)
                  ┌┴───────────────┴┐
                  │  Property-Based  │  Fuzz with random inputs
                  │  / Fuzz Tests    │  (Trident)
                 ┌┴─────────────────┴┐
                 │  Unit Tests        │  Math, individual ixs
                 │  (LiteSVM)         │  Fast, isolated
                 └────────────────────┘
```

## Unit Tests with LiteSVM

Fast, isolated tests for individual instructions and math functions. Run in milliseconds.

```rust
#[cfg(test)]
mod tests {
    use litesvm::LiteSVM;
    use solana_sdk::{signature::Keypair, transaction::Transaction};

    #[test]
    fn test_swap_constant_product() {
        let mut svm = LiteSVM::new();
        svm.add_program(program_id, "target/deploy/my_amm.so");

        // Setup: create pool with known reserves
        let pool = setup_pool(&mut svm, 1000_000_000, 1000_000_000); // 1000 A, 1000 B

        // Swap 10 A for B
        let tx = build_swap_tx(&pool, 10_000_000, Direction::AtoB);
        let result = svm.send_transaction(tx).unwrap();

        // Verify constant product invariant holds (minus fees)
        let new_reserves = get_reserves(&svm, &pool);
        let k_before = 1000_000_000u128 * 1000_000_000u128;
        let k_after = new_reserves.a as u128 * new_reserves.b as u128;
        assert!(k_after >= k_before, "k must not decrease");
    }

    #[test]
    fn test_swap_zero_amount_fails() {
        let mut svm = LiteSVM::new();
        // Should reject zero-amount swaps
        let result = svm.send_transaction(build_swap_tx(&pool, 0, Direction::AtoB));
        assert!(result.is_err());
    }
}
```

**Skills:** `testing` (official — LiteSVM for fast unit tests, Mollusk for isolated instruction checks)

## Property-Based Fuzzing with Trident

Trident generates random inputs to find invariant violations. Essential for DeFi — humans can't think of every edge case.

```rust
// trident-tests/fuzz_tests/fuzz_0/test_fuzz.rs
use trident_client::fuzzing::*;

#[derive(Arbitrary)]
pub struct SwapData {
    pub amount_in: u64,
    pub minimum_out: u64,
}

impl FuzzInstruction for SwapData {
    fn check_postconditions(&self, pre: &Snapshot, post: &Snapshot) -> Result<()> {
        // Invariant 1: k must not decrease
        let k_pre = pre.reserve_a as u128 * pre.reserve_b as u128;
        let k_post = post.reserve_a as u128 * post.reserve_b as u128;
        assert!(k_post >= k_pre, "Constant product violated!");

        // Invariant 2: user got at least minimum_out
        let user_received = post.user_balance_b - pre.user_balance_b;
        assert!(user_received >= self.minimum_out || self.minimum_out > max_possible);

        // Invariant 3: total supply of tokens is conserved
        let total_a = post.reserve_a + post.user_balance_a + post.fee_balance_a;
        assert_eq!(total_a, pre.total_supply_a, "Token A leaked!");

        Ok(())
    }
}
```

### Key Invariants to Fuzz

| Protocol Type | Invariants to Test |
|--------------|-------------------|
| AMM | k never decreases; total tokens conserved; fees collected correctly |
| Lending | Total deposits >= total borrows; interest accrual monotonic; liquidation threshold respected |
| Vault | shares * price_per_share <= total_underlying; no free shares |
| Staking | Staked amount tracks deposits/withdrawals exactly; rewards proportional |

```bash
# Run Trident fuzzer for at least 1 hour, then stop it manually
trident fuzz run fuzz_0
```

**Repos:** `trident` (Rust-based fuzzing framework for Solana program security testing)

## Integration Tests with Surfpool

Test against real mainnet state — real token mints, real pool reserves, real oracle prices.

For regression coverage, pin a small set of known pools, feeds, and market accounts so the same high-value scenarios stay reproducible across test runs. Include at least one degraded-liquidity scenario and one stale/wide-oracle scenario in the suite.

```bash
# Start Surfpool with mainnet forking
surfpool start --network mainnet

# Surfpool auto-clones accounts as needed
# Your tests interact with real Raydium/Orca/Jupiter state
```

### Testing with Real Liquidity

```typescript
// Test your AMM against real Raydium pool reserves
const realRaydiumPool = await program.account.pool.fetch(KNOWN_RAYDIUM_POOL);
console.log(`Testing against real reserves: ${realRaydiumPool.reserveA} / ${realRaydiumPool.reserveB}`);

// Fork the state, execute your swap, verify results match expected
const simResult = await connection.simulateTransaction(swapTx);
assert(simResult.value.err === null, `Swap failed: ${JSON.stringify(simResult.value.err)}`);
```

### Surfpool Cheatcodes for DeFi Testing

```typescript
// Warp time forward (test interest accrual)
await rpc.surfnet_timeTravel({ absoluteSlot: currentSlot + 216_000 }).send(); // ~1 day forward

// Set account balance (test liquidation scenarios)
await rpc.surfnet_setAccount(userAccount, { lamports: lowBalance }).send();

// Surfpool clones external mainnet accounts on demand when your test touches them
const pythFeedAccount = await connection.getAccountInfo(PYTH_SOL_USD_FEED);
```

**Skills:** `surfpool` (official — mainnet forking, sub-second startup, transaction profiling)
**Skills:** `surfpool-skill` (community — development environment, mainnet forking, cheatcodes)
**Skills:** `surfpool-cheatcodes` (official — full reference for surfnet_* RPC methods)

## Adversarial Testing

Think like an attacker. Test these scenarios explicitly:

### Sandwich Attack Simulation

```typescript
// Simulate: attacker front-runs → victim swaps → attacker back-runs
const frontRun = buildSwap(attacker, largeBuyAmount);
const victimSwap = buildSwap(victim, normalAmount);
const backRun = buildSwap(attacker, largeSellAmount);

// Execute in order, check: did the victim get less than minimum_out?
// If yes, your slippage protection works. If no, it doesn't.
```

### Overflow / Extreme Values

```typescript
// Test with maximum u64 values
const maxU64 = BigInt("18446744073709551615");
await expect(swap(maxU64)).rejects.toThrow(); // Should fail, not overflow

// Test with zero
await expect(swap(0n)).rejects.toThrow();

// Test with 1 (minimum)
const result = await swap(1n); // Should succeed or fail gracefully
```

### Oracle Failure

```typescript
// Test behavior when oracle returns stale price
await rpc.surfnet_timeTravel({ absoluteSlot: currentSlot + 1_000_000 }).send(); // Far future
// Now oracle price is stale — does your program reject it?
```

## Pre-Mainnet Checklist

- [ ] All unit tests pass (LiteSVM)
- [ ] Fuzz tests ran for >1 hour with no invariant violations (Trident)
- [ ] Integration tests pass against forked mainnet state (Surfpool)
- [ ] Sandwich attack simulation confirms slippage protection works
- [ ] Overflow/underflow tests with extreme values pass
- [ ] Oracle staleness handling tested
- [ ] Emergency pause tested (can pause, users can withdraw while paused)
- [ ] Static analysis clean with `solana-fender-mcp`
- [ ] At least one external security review completed

**MCPs:** `solana-fender-mcp` (static analysis for Anchor programs)

## Sources

- Surfpool README and CLI/RPC source: https://github.com/solana-foundation/surfpool
- Trident commands docs: https://ackee.xyz/trident/docs/latest/basics/commands/
- Trident fuzz execution docs: https://ackee.xyz/trident/docs/latest/start-fuzzing/executing-fuzz-test/
