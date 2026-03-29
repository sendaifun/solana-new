# Testing Checklist

Solana testing pyramid — use the right tool at each level.

## Testing Pyramid

### Level 1: Unit Tests (LiteSVM) — fastest

Test individual program instructions in isolation. No validator needed.

- Runs in-process, hundreds of tests per second
- Best for: instruction logic, math, state transitions
- **Skill:** `testing` (official), `solana-anchor-claude-skill`

### Level 2: Instruction Tests (Mollusk) — isolated

Test single instructions with controlled account state.

- Inject specific account data and test behavior
- Best for: edge cases, error paths, boundary conditions

### Level 3: Integration Tests (Surfpool) — realistic

Test against real account state cloned from mainnet.

- Clones mainnet accounts on demand (just-in-time)
- Sub-second startup vs minutes for `solana-test-validator`
- Best for: CPI interactions, DeFi composability, real-world scenarios
- **Skills:** `surfpool` (official), `surfpool-cheatcodes` (official)

### Level 4: Fuzz Tests (Trident) — security

Property-based testing that generates random inputs to find bugs.

- Thousands of transactions per second via TridentSVM
- Best for: security-critical programs before mainnet
- **Repo:** `trident` (Ackee Blockchain fuzzing framework)

## Pre-MVP Checklist

### Functionality
- [ ] All instructions execute without errors on devnet
- [ ] State transitions produce correct account data
- [ ] Error cases return appropriate error codes (not panics)
- [ ] Multi-step workflows complete end-to-end

### Security
- [ ] Every privileged instruction checks signers
- [ ] PDA seeds are deterministic and collision-resistant
- [ ] Arithmetic uses `checked_*` operations
- [ ] Accounts can't be reinitialized
- [ ] Run `vulnhunter-skill` or `solana-fender-mcp` scan

### Client / UX
- [ ] Wallet connection works with Phantom, Solflare, Backpack
- [ ] Transaction errors show user-friendly messages
- [ ] Loading states while transactions confirm
- [ ] Retry logic for failed transactions

### DevOps
- [ ] `.env.example` has all required variables documented
- [ ] Devnet deployment works: `anchor deploy --provider.cluster devnet`
- [ ] Program upgradeable (Anchor default) or immutable (if intended)

## When to Move On

All unit tests pass + integration test works + no critical security findings → proceed to **review-and-iterate**.
