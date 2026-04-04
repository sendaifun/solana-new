# What Is Solana and Why Build on It

> Reference document for superstack skills. Last updated: April 2026.

---

## What Is Solana

Solana is a high-performance Layer 1 blockchain designed for mass adoption. It processes transactions in ~400ms block times at a fraction of a cent per transaction, making it practical for applications that need real-time speed and low cost -- payments, trading, gaming, social, and more.

Unlike blockchains that rely on Layer 2 rollups or sharding to scale, Solana runs on a single global state machine. Every validator sees the same state, every program can compose with every other program, and every transaction settles on the base layer. This architectural choice means developers get composability by default -- no bridging, no cross-shard communication, no fragmented liquidity.

Solana launched on mainnet-beta in March 2020. The native token is **SOL**, used for transaction fees, staking, and governance.

**Key links:**
- Main site: [solana.com](https://solana.com)
- Developer docs: [solana.com/docs](https://solana.com/docs)
- Ecosystem directory: [solana.com/ecosystem](https://solana.com/ecosystem)
- GitHub: [github.com/solana-labs](https://github.com/solana-labs) and [github.com/anza-xyz](https://github.com/anza-xyz)

---

## Why Build on Solana

### Performance Numbers

| Metric | Value |
|--------|-------|
| Block time | ~400ms |
| Transaction cost | ~$0.00025 |
| Theoretical TPS | 65,000+ |
| Observed peak TPS | 10,000+ sustained (excluding vote txs) |
| Finality | ~400ms (optimistic), ~12s (rooted) |
| Validator count | 1,500+ |

These are not testnet numbers. This is mainnet, processing billions of dollars in volume daily.

### Cost Comparison

| Chain | Avg Transaction Cost |
|-------|---------------------|
| Solana | ~$0.00025 |
| Ethereum L1 | $1-50+ (varies with congestion) |
| Arbitrum / Optimism | $0.01-0.50 |
| Polygon PoS | $0.01-0.05 |
| Avalanche C-Chain | $0.01-0.10 |

Solana's fee model makes it viable to build applications that require thousands or millions of transactions -- high-frequency trading, micropayments, on-chain gaming, real-time social feeds.

---

## Institutional Adoption

Solana has become the chain of choice for institutional deployments. Major enterprises building on or integrating with Solana include:

### Payments and Finance

| Company | What They Built |
|---------|----------------|
| **Visa** | Stablecoin settlement pilot on Solana; expanded USDC settlement capabilities |
| **PayPal (PYUSD)** | Launched PYUSD stablecoin natively on Solana (in addition to Ethereum) |
| **Circle (USDC)** | Native USDC on Solana -- one of the largest stablecoin deployments |
| **Stripe** | Integrated Solana for crypto payouts and USDC transfers |
| **Western Union** | Exploring Solana-based cross-border payment rails |
| **Fiserv** | Payment infrastructure partnership with Solana ecosystem |
| **Worldpay** | Enterprise payment processing integration |

### Asset Management and TradFi

| Company | What They Built |
|---------|----------------|
| **BlackRock** | BUIDL tokenized fund exploring multi-chain including Solana |
| **Franklin Templeton** | On-chain fund record-keeping on Solana |
| **Hamilton Lane** | Tokenized fund shares on Solana |
| **Libre** | Tokenized alternative assets on Solana |

### Infrastructure

| Company | What They Built |
|---------|----------------|
| **Google Cloud** | Solana validator and RPC infrastructure; BigQuery dataset |
| **Amazon AWS** | One-click Solana node deployment |
| **Render Network** | Migrated GPU rendering network to Solana |

---

## Network Metrics

Solana consistently ranks among the most active blockchains by on-chain activity:

- **Daily DEX volume**: Routinely $1-5B+ daily across Jupiter, Raydium, Orca, and other venues
- **Active addresses**: Millions of unique active addresses per month
- **Total value locked (TVL)**: Billions in DeFi protocols
- **NFT volume**: Leading NFT ecosystem with major collections and marketplaces
- **Stablecoin supply**: Billions in native USDC, PYUSD, and other stablecoins

Source: [DeFiLlama](https://defillama.com/chain/Solana), [Solana Explorer](https://explorer.solana.com)

---

## Ecosystem Categories

Solana has the broadest application ecosystem of any non-EVM chain:

### DeFi
- **DEX aggregation**: Jupiter (dominant aggregator)
- **AMMs**: Orca, Raydium, Meteora
- **Lending**: Kamino, MarginFi, Save
- **Derivatives**: Drift Protocol, Zeta Markets, Phoenix
- **Liquid staking**: Marinade, Jito, BlazeStake

### Consumer
- **Mobile**: Solana Mobile (Saga phone, dApp Store)
- **Social**: Dialect (messaging), Bonk (community token)
- **Payments**: Sphere, Helio
- **NFTs/Digital collectibles**: Magic Eden, Metaplex

### Infrastructure
- **RPC providers**: Helius, Triton, QuickNode
- **Indexers**: Helius DAS, The Graph (Solana support), Ironforge
- **Oracles**: Pyth Network (Solana-native), Switchboard
- **Wallets**: Phantom, Solflare, Backpack

### Payments
- **Stablecoins**: USDC (Circle), PYUSD (PayPal), USDT (Tether)
- **Merchant tools**: Sphere, Helio, Decaf
- **Cross-border**: Bridge integrations for fiat on/off ramps

### Gaming
- **Game engines**: Solana Unity SDK, MagicBlock (on-chain gaming engine)
- **Games**: Star Atlas, Aurory, Genopets
- **Infrastructure**: Honeycomb Protocol

### AI
- **Compute**: Render Network, Nosana
- **AI agents**: SendAI, ELIZA framework, Solana Agent Kit
- **Data**: The Graph, Flipside Crypto

---

## Key Events and Community

### Breakpoint Conference
Solana's flagship annual conference. Thousands of developers, founders, and investors. Major announcements, product launches, and ecosystem updates. Held annually since 2021.

Site: [solana.com/breakpoint](https://solana.com/breakpoint)

### Colosseum Hackathons
The primary Solana hackathon platform. Multiple hackathons per year with significant prize pools. Past hackathons have launched major protocols including Marinade Finance, Phantom wallet concepts, and dozens of production dApps.

Site: [colosseum.org](https://www.colosseum.org)

### Solana Accelerate
Developer-focused conference and accelerator event. Hands-on workshops, builder sessions, and demo days.

### Superteam
Global network of Solana contributor communities across 15+ countries. Provides grants, bounties, and community support for builders.

Site: [superteam.fun](https://superteam.fun)

---

## Why Solana Over Other L1s

### Single Global State
Unlike sharded chains (Ethereum 2.0 danksharding, NEAR, Elrond), Solana maintains a single global state. This means:
- Any program can call any other program in the same transaction
- No cross-shard communication delays
- No liquidity fragmentation
- Atomic composability by default

### No Layer 2 Required
Ethereum's scaling strategy relies on L2 rollups (Arbitrum, Optimism, Base, etc.). This introduces:
- Bridging risk and UX friction
- Liquidity fragmentation across L2s
- Higher costs for L1 settlement
- Complex developer experience (which L2? which bridge?)

Solana scales at L1. One chain, one state, one developer experience.

### Composability
Because everything runs on one state machine, Solana programs can compose freely:
- A single transaction can swap tokens on Jupiter, deposit into Kamino, and stake LP tokens -- atomically
- Flash loans, arbitrage, and complex DeFi strategies are first-class citizens
- No bridge risk, no cross-chain MEV extraction

### Low Latency
~400ms block times mean applications feel instant:
- Trading interfaces update in real time
- Games can run on-chain logic without perceptible delay
- Payment confirmations are near-instant

### Comparison Table

| Feature | Solana | Ethereum | Avalanche | Sui |
|---------|--------|----------|-----------|-----|
| Block time | ~400ms | ~12s | ~2s | ~400ms |
| Tx cost | ~$0.00025 | $1-50+ | $0.01-0.10 | ~$0.001 |
| State model | Single global | Sharded (planned) | Subnets | Object-based |
| Smart contract lang | Rust | Solidity | Solidity | Move |
| Composability | Full (single state) | Within L2 silo | Within subnet | Full |
| DeFi TVL | Top 3 | #1 | Top 10 | Growing |
| Validator count | 1,500+ | 900k+ | 1,200+ | ~100 |

---

## Solana Foundation and Grants

The **Solana Foundation** is a non-profit organization dedicated to the decentralization, growth, and security of the Solana network.

### Grants Program
The Foundation runs an active grants program funding:
- **Developer tooling** -- IDEs, SDKs, testing frameworks
- **Infrastructure** -- RPC nodes, validators, indexers
- **Education** -- courses, tutorials, bootcamps
- **Research** -- academic papers, security audits
- **Community** -- events, meetups, content creation

**Apply at**: [solana.org/grants](https://solana.org/grants)

### What Gets Funded
- Open-source developer tools and libraries
- Protocol research and development
- Security audits and formal verification
- Educational content and developer onboarding
- Community building and events

### Other Funding Sources
- **Colosseum Accelerator** -- venture-style funding for hackathon winners
- **Superteam Earn** -- bounties and grants for specific tasks
- **Ecosystem funds** -- Jump Crypto, Multicoin Capital, and other VCs actively fund Solana projects

---

## Getting Started

If you are ready to start building, install superstack skills and ask Claude:

```bash
curl -fsSL https://solana-new-cli.vercel.app/setup.sh | bash
claude "/find-next-crypto-idea What should I build?"
```

For deeper technical details, see:
- [02-what-makes-solana-unique.md](./02-what-makes-solana-unique.md) -- The 8 innovations that make Solana fast
- [03-contract-level.md](./03-contract-level.md) -- Everything you need to write Solana programs

---

## Sources

- [solana.com](https://solana.com)
- [solana.com/ecosystem](https://solana.com/ecosystem)
- [solana.org/grants](https://solana.org/grants)
- [solana.com/docs](https://solana.com/docs)
- [DeFiLlama - Solana](https://defillama.com/chain/Solana)
- [Messari - Solana](https://messari.io/project/solana)
- [Electric Capital Developer Report](https://www.developerreport.com/)
