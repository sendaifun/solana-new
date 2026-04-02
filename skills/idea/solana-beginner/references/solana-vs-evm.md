# Solana vs EVM: What Every Ethereum Developer Needs to Know

This guide is for developers coming from Ethereum, Polygon, Arbitrum, Base, or any EVM chain. Solana is not an L2 and not EVM-compatible — it's a fundamentally different architecture.

## The Big Mental Shift

On Ethereum, your smart contract **owns its data**. Storage lives inside the contract. On Solana, programs are **stateless** — data lives in separate **accounts** that programs read and write to. Think of it like the difference between a monolithic app (EVM) and a microservices architecture (Solana).

## Core Concepts Comparison

| Concept | Ethereum / EVM | Solana |
|---------|---------------|--------|
| Smart contract | Stateful contract (code + storage) | Stateless program (code only) |
| Data storage | Contract storage slots | Separate account data |
| Deployment | Each contract is a unique deploy | Programs are reusable (e.g., one Token Program for all tokens) |
| State access | `this.balances[msg.sender]` | Pass accounts as instruction arguments |
| Contract address | Deterministic from deployer + nonce | Program ID (public key of deploy keypair) |
| Derived addresses | `CREATE2` | PDAs (Program Derived Addresses) — deterministic, no private key |
| Function calls | ABI-encoded function selector | Instruction data (discriminator + borsh-serialized args) |
| Cross-contract calls | External calls / delegatecall | CPIs (Cross-Program Invocations) |
| Token standard | ERC-20 (one contract per token) | SPL Token Program (one program, many mint accounts) |
| NFTs | ERC-721 / ERC-1155 (one contract per collection) | Metaplex standard (metadata accounts per mint) |
| Gas / fees | Gas units * gas price (variable, $5-50+) | Fixed base fee ~$0.00025 + priority fee |
| Block time | ~12 seconds (Ethereum L1) | ~400 milliseconds |
| Finality | ~12 minutes (L1), varies for L2s | ~400ms (optimistic), ~6s (confirmed) |
| Execution model | Sequential (EVM) | Parallel (Sealevel — non-overlapping accounts run in parallel) |
| Language | Solidity / Vyper | Rust (native) / Anchor (framework) |
| Framework | Hardhat / Foundry | Anchor (the Hardhat of Solana) |
| Testing | Hardhat tests, Foundry fuzz | Bankrun, LiteSVM, Mollusk, Surfpool |
| Composability | All on L1, fragmented across L2s | Single global state, everything composable |

## Account Model Deep Dive

This is the #1 thing that trips up EVM devs.

### On Ethereum
```solidity
contract Token {
    mapping(address => uint256) balances;  // data lives IN the contract
    function transfer(address to, uint256 amount) external {
        balances[msg.sender] -= amount;
        balances[to] += amount;
    }
}
```

### On Solana
```rust
// The program has NO storage. Data is in accounts passed to it.
pub fn transfer(ctx: Context<Transfer>, amount: u64) -> Result<()> {
    let from = &mut ctx.accounts.from;    // account passed in
    let to = &mut ctx.accounts.to;        // account passed in
    from.balance -= amount;
    to.balance += amount;
    Ok(())
}
```

Key differences:
- **Accounts are passed in** — the program doesn't "own" them, it borrows them
- **Account size is fixed at creation** — you can't dynamically grow storage (use `realloc` for resizing)
- **Accounts pay rent** — ~0.00089 SOL per KB per epoch, but most accounts are rent-exempt (2 years prepaid)
- **Programs are upgradeable by default** — use `--immutable` flag to make permanent

## PDAs: The Solana Way to Derive Addresses

PDAs (Program Derived Addresses) replace Ethereum's `CREATE2` and contract-internal mappings:

```rust
// Deterministic address from seeds — no private key exists for this address
let (pda, bump) = Pubkey::find_program_address(
    &[b"user-account", user.key().as_ref()],
    &program_id,
);
```

PDAs are used for:
- Token accounts (associated token accounts)
- User-specific data storage
- Program authority (signing without a private key)
- Any deterministic addressing

## Common Gotchas for EVM Developers

1. **You must specify ALL accounts upfront.** Unlike EVM where the contract reads its own storage, Solana transactions must declare every account they'll touch. This enables parallel execution but requires more planning.

2. **Transaction size limit is 1232 bytes.** You can't send unlimited data in one transaction. Complex operations need multiple transactions or lookup tables.

3. **No `msg.sender` equivalent as a global.** The signer is an account you pass in and verify. Anchor's `Signer` type handles this.

4. **Tokens are not contracts.** There's ONE Token Program. Each token is a "mint" account. User balances are "token accounts" (ATAs). This is more gas-efficient but conceptually different.

5. **No `require` with revert messages.** Use Anchor's `require!()` macro or return custom errors.

6. **Compute units, not gas.** Each transaction gets 200K compute units by default (requestable up to 1.4M). CU pricing is much more predictable than gas.

7. **No constructor pattern.** Programs are deployed once, then you call an `initialize` instruction to set up state accounts.

8. **Rent is real.** Accounts must hold enough SOL to be rent-exempt. This is a small amount (~0.00089 SOL/KB) but you need to account for it.

## Tooling Mapping

| Task | Ethereum | Solana |
|------|----------|--------|
| Project scaffold | `npx hardhat init` | `anchor init` |
| Compile | `npx hardhat compile` | `anchor build` |
| Test | `npx hardhat test` | `anchor test` |
| Deploy | `npx hardhat deploy` | `anchor deploy` |
| Local chain | Hardhat node / Anvil | `solana-test-validator` |
| Explorer | Etherscan | Solscan, Solana Explorer, SolanaFM |
| Client SDK | ethers.js / viem | @solana/web3.js, @solana/kit |
| Wallet connect | wagmi / RainbowKit | @solana/wallet-adapter |

## Next Steps

Once you understand the model differences, you're ready to build. The learning curve is real but shorter than you think — most EVM devs are productive within a week.
