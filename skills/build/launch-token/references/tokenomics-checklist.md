# Tokenomics Checklist

Design a credible, sustainable token economy. This checklist covers what judges, investors, and experienced traders look for — and what red flags trigger automatic rejection.

## Supply Design

### Total Supply

| Token Type | Typical Supply | Decimals | Rationale |
|-----------|---------------|----------|-----------|
| Memecoin | 1B | 6-9 | Large supply = low unit price = psychological appeal |
| Utility | 100M-1B | 6-9 | Enough for ecosystem use without feeling "scarce" |
| Governance | 10M-100M | 6 | Lower supply for voting weight clarity |
| Stablecoin | Dynamic | 6 | Mint/burn based on demand |

### Fixed vs Inflationary

- **Fixed supply**: Mint total, then revoke mint authority. Creates deflationary pressure. Good for memecoins and governance.
- **Inflationary**: Keep mint authority. Use for rewards, staking emissions, ecosystem grants. Requires clear emission schedule.
- **Hybrid**: Fixed base supply + capped inflation for staking rewards (e.g., 2-5% annually).

## Distribution Framework

### Allocation Categories

```
Team / Founders:     10-20%  (with vesting)
Treasury / Ops:      15-25%  (DAO-governed or multisig)
Community / Airdrop: 20-40%  (largest portion = strongest signal)
Liquidity:           10-20%  (LP pool seeding)
Investors / Sale:     5-15%  (if applicable)
Ecosystem Grants:     5-15%  (developer incentives)
```

### Anti-Rug Patterns

These patterns build trust. Skipping them is a red flag.

1. **Lock team tokens**: Use a vesting contract, not promises. 12-month cliff + 24-month linear vest is standard.

```typescript
// Use Squads multisig for team treasury
// Skills: squads-skill (multisig wallets, timelocks, spending limits)
// Repos: squads-v4 (multisig V4 — timelocks, roles, sub-accounts)
```

2. **Lock liquidity**: Burn LP tokens or lock them in a time-locked vault. Minimum 6 months.

3. **Transparent supply**: Publish all wallet addresses holding allocations. Let anyone verify on-chain.

4. **Multisig treasury**: Never let one wallet control the treasury. Use Squads V4 with 3/5 or 4/7 signers.

5. **Revoke mint authority**: After minting total supply, revoke. If you keep it, document why publicly.

## Vesting Implementation

### On-chain vesting with a PDA vault

```rust
#[account]
pub struct VestingSchedule {
    pub beneficiary: Pubkey,
    pub mint: Pubkey,
    pub total_amount: u64,
    pub released_amount: u64,
    pub start_time: i64,
    pub cliff_duration: i64,     // e.g., 365 * 24 * 60 * 60 (1 year)
    pub total_duration: i64,      // e.g., 3 * 365 * 24 * 60 * 60 (3 years)
    pub bump: u8,
}

// Claimable amount calculation
pub fn claimable(schedule: &VestingSchedule, now: i64) -> u64 {
    if now < schedule.start_time + schedule.cliff_duration {
        return 0; // Still in cliff period
    }
    let elapsed = now - schedule.start_time;
    let vested = if elapsed >= schedule.total_duration {
        schedule.total_amount
    } else {
        schedule.total_amount * elapsed as u64 / schedule.total_duration as u64
    };
    vested - schedule.released_amount
}
```

## Red Flags That Kill Credibility

| Red Flag | Why It's Bad | Fix |
|----------|-------------|-----|
| No locked liquidity | Devs can pull LP at any time | Burn LP tokens or use a timelock |
| Mint authority not revoked | Unlimited inflation possible | Revoke after final mint (or document why you keep it) |
| Single-wallet treasury | One key compromise = total loss | Use Squads multisig (3/5 minimum) |
| No vesting for team | Team can dump immediately | On-chain vesting with 12mo cliff |
| >50% team allocation | Community gets screwed | Keep team <20%, community >30% |
| Hidden wallets | Unaccounted supply = trust killer | Publish all allocation addresses |
| No documentation | "Trust me bro" tokenomics | Write a clear tokenomics page |

## Token Launch Readiness Checklist

Before going live, verify all items:

- [ ] Total supply decided and documented
- [ ] Distribution allocations add up to 100%
- [ ] Team tokens in vesting contract (not just a wallet)
- [ ] Treasury behind multisig (Squads V4 recommended)
- [ ] Liquidity amount decided and source funded
- [ ] LP tokens will be burned or locked
- [ ] Metadata uploaded and verified (name, symbol, image, description)
- [ ] Token passes `rug-check-mcp` safety scan
- [ ] Mint authority plan documented (revoke or justify keeping)
- [ ] Freeze authority plan documented
- [ ] Tokenomics page/document published publicly
- [ ] All allocation wallet addresses published

## Useful Catalog References

**Skills:**
- `pumpfun-skill` — Bonding curve launches, PumpSwap
- `meteora-skill` — Liquidity pools, bonding curves, token launches
- `raydium-skill` — CLMM/CPMM pools for LP creation
- `squads-skill` — Multisig for treasury management

**MCPs:**
- `rug-check-mcp` — Pre-launch safety verification
- `aethercore-token-rugcheck` — Three-layer token audit
- `metaplex-genesis-mcp` — Bonding curve interactions

**Repos:**
- `mosaic` — Token-2022 tokenization engine
- `squads-v4` — Multisig program for treasury
