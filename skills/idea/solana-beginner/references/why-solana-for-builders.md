# Why Build on Solana?

If you're a developer evaluating where to build your next project, here's the case for Solana — with real numbers, not buzzwords.

## Speed

- **400ms block times.** Your users don't wait. Transactions confirm before they can blink.
- **Sub-second finality.** Optimistic confirmation in ~400ms, full confirmation in ~6 seconds.
- Compare: Ethereum L1 is ~12 seconds per block, 12+ minutes for finality. Even L2s add latency and bridging delays.

For user experience, this matters enormously. You can build real-time applications — trading interfaces, games, social feeds — that feel like web2.

## Cost

- **~$0.00025 per transaction.** Not $5, not $50, not "depends on gas." A fraction of a cent.
- Priority fees exist for competitive transactions (MEV, arbitrage), but normal usage is essentially free.
- Compressed NFTs can mint for ~$0.00005 each. That's 20,000 NFTs for $1.

This unlocks use cases that are economically impossible on expensive chains: micropayments, high-frequency updates, on-chain gaming, mass airdrops, IoT data logging.

## Scale

- **65,000+ TPS theoretical throughput** via Sealevel parallel execution.
- Real-world sustained throughput of 2,000-4,000 TPS under normal conditions.
- Designed for millions of users, not thousands. You don't need to worry about "will the chain handle it" for 99.9% of applications.
- No L2 fragmentation. No bridging. No "which rollup should I deploy to." One chain, one state.

## Composability

This is Solana's underrated superpower.

- **Single global state.** Every program can interact with every other program in the same transaction.
- No bridges between L2s. No cross-chain messaging delays. No liquidity fragmentation.
- Your DeFi app can atomically swap on Jupiter, deposit into Kamino, and update a user's NFT — all in one transaction.

On Ethereum's L2 ecosystem, composing across Arbitrum + Base + Optimism requires bridges, wait times, and trust assumptions. On Solana, it's one instruction.

## Developer Experience

- **Anchor framework** — the Hardhat of Solana. Project scaffold, IDL generation, client codegen, testing utilities. `anchor init` and you're building.
- **Rust** — yes, it's harder than Solidity. But it catches entire categories of bugs at compile time. And the Anchor macros abstract most of the complexity.
- **Excellent tooling:**
  - `solana-test-validator` for local development
  - Bankrun / LiteSVM / Surfpool for fast testing
  - Helius for enhanced RPCs and webhooks
  - Solana Explorer, Solscan, SolanaFM for debugging
- **@solana/web3.js** and the newer **@solana/kit** for TypeScript client development.

## Ecosystem Maturity

- **$1B+ DeFi TVL** across Jupiter, Kamino, Marinade, Jito, Drift, and dozens of others.
- **Institutional adoption:** Circle (USDC native on Solana), PayPal (PYUSD), Visa, Shopify integrations.
- **59+ open-source repos** you can fork and build on.
- **49+ MCP servers** for AI-native development.
- Battle-tested in production with millions of daily active users.

## Distribution

Building is only half the challenge. You need users. Solana has distribution channels:

- **Colosseum Hackathons** — build, compete, get funded. Multiple per year with $M+ in prizes and follow-on funding.
- **Superteam Bounties** — paid work building for the ecosystem. Earn while learning.
- **Solana Foundation Grants** — funding for public goods and ecosystem projects.
- **Breakpoint Conference** — annual developer conference, 5,000+ attendees.
- **Active community** — Solana Twitter/X, Discord, and Telegram are vibrant and welcoming to builders.

## Mobile

- **Saga / Chapter2 phones** — Android phones with native crypto integration and a dApp Store.
- **Solana Mobile Stack** — SDKs for building mobile-native Solana apps.
- **dApp Store** — distribution without Apple/Google 30% tax.
- React Native + Solana mobile adapter = ship to mobile fast.

## AI

Solana is becoming the default chain for AI agents:

- **Solana Agent Kit (SendAI)** — the leading toolkit for AI agents that transact on-chain. Transfer, swap, stake, mint, deploy — all from an AI agent.
- Sub-second finality means agents can execute strategies in real-time.
- Low fees mean agents can make thousands of transactions without burning through budgets.
- Composability means agents can interact with the entire DeFi ecosystem atomically.

## The Honest Trade-offs

No chain is perfect. Here's what you should know:

1. **Solana has had outages.** The network has gone down several times in its history. Firedancer (a new validator client by Jump Crypto) is designed to dramatically improve reliability.
2. **Rust has a learning curve.** It's steeper than Solidity, especially for beginners. Anchor helps a lot, but you'll still need to understand ownership and borrowing basics.
3. **The account model is confusing at first.** Coming from EVM, the separation of programs and data takes time to internalize. Give it a week — it clicks.
4. **Validator hardware requirements are high.** Running a validator is expensive (~$1,000+/month). This is a decentralization trade-off for performance.
5. **State costs are real.** Accounts pay rent (or are rent-exempt with a deposit). Large on-chain data storage gets expensive.

## Getting Started

1. Install Solana CLI: `sh -c "$(curl -sSfL https://release.anza.xyz/stable/install)"`
2. Install Anchor: `cargo install --git https://github.com/coral-xyz/anchor anchor-cli`
3. Create a project: `anchor init my-project`
4. Or install superstack skills: `curl -fsSL https://solana-new-cli.vercel.app/setup.sh | bash`
