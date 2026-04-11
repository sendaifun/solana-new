# Solana Ecosystem Map

A categorized guide to the major projects, protocols, and tools in the Solana ecosystem. This is not exhaustive — Solana has thousands of projects — but covers the most important ones a new developer should know about.

## DeFi (Decentralized Finance)

| Project | What It Does | URL |
|---------|-------------|-----|
| **Jupiter** | Leading DEX aggregator — routes trades across all Solana DEXs for best price. Also offers limit orders, DCA, and perps. | https://jup.ag |
| **Orca** | Concentrated liquidity AMM (like Uniswap v3). Clean UX, developer-friendly SDK. | https://orca.so |
| **Raydium** | AMM and liquidity provider. Concentrated liquidity (CLMM) + constant product pools. Integrated with OpenBook orderbook. | https://raydium.io |
| **Jupiter Perps** | Oracle-based perpetual futures. Up to 100x leverage, backed by JLP pool. Part of the Jupiter ecosystem. | https://jup.ag/perps |
| **Kamino** | Automated liquidity management and lending. Vaults that auto-rebalance concentrated liquidity positions. | https://kamino.finance |
| **Marinade** | Liquid staking protocol. Stake SOL, receive mSOL (liquid staking token). | https://marinade.finance |
| **Jito** | MEV-aware liquid staking. JitoSOL staking token + MEV rewards. Also runs the Jito block engine. | https://jito.network |
| **Marginfi** | Lending and borrowing protocol. Deposit assets, borrow against them. | https://marginfi.com |

## NFTs & Digital Assets

| Project | What It Does | URL |
|---------|-------------|-----|
| **Metaplex** | The NFT standard on Solana. Token Metadata, Bubblegum (compressed NFTs), Candy Machine (minting). | https://metaplex.com |
| **Magic Eden** | Multi-chain NFT marketplace. Largest by volume on Solana. Also supports Bitcoin, Ethereum, Polygon. | https://magiceden.io |

## Infrastructure & RPCs

| Project | What It Does | URL |
|---------|-------------|-----|
| **Helius** | RPC provider + developer platform. Enhanced APIs (DAS for NFTs, webhooks, transaction parsing). Recommended for most projects. | https://helius.dev |
| **QuickNode** | Multi-chain RPC provider. Solana support with add-ons (Jupiter pricing, Priority Fee API). | https://quicknode.com |
| **Triton** | High-performance RPC. Specializes in DeFi-grade infrastructure. Operates the public RPC. | https://triton.one |
| **Ironforge** | RPC and developer tools. Transaction simulation, debugging, analytics. Now part of Sanctum ecosystem. | https://ironforge.sanctum.so |
| **Birdeye** | Token data aggregator. Real-time prices, charts, trading data across all Solana DEXs. | https://birdeye.so |

## Wallets

| Project | What It Does | URL |
|---------|-------------|-----|
| **Phantom** | Most popular Solana wallet. Browser extension + mobile. Clean UX, swap built in. | https://phantom.app |
| **Solflare** | Full-featured Solana wallet. Staking, swaps, NFT gallery. Strong mobile app. | https://solflare.com |
| **Backpack** | All-in-one crypto app with exchange, futures, spot trading, and lending. | https://backpack.app |

## Payments

| Project | What It Does | URL |
|---------|-------------|-----|
| **Circle (USDC)** | USDC stablecoin on Solana. Native issuance, fast transfers, widely integrated. | https://circle.com |
| **PayPal (PYUSD)** | PayPal's stablecoin, available on Solana. Institutional-grade stablecoin with PayPal backing. | https://paypal.com/pyusd |

## Developer Tools

| Project | What It Does | URL |
|---------|-------------|-----|
| **Anchor** | The framework for Solana program development. IDL generation, client codegen, testing utilities. Like Hardhat for Solana. | https://anchor-lang.com |
| **Solana CLI** | Official command-line tools. Key management, deploys, validator interaction. | https://docs.anza.xyz/cli/ |
| **Solana Agent Kit** | SendAI's toolkit for building AI agents that interact with Solana. Transfer, swap, stake, mint — all via agent actions. | https://github.com/sendaifun/solana-agent-kit |
| **Tuk Tuk** | On-chain automation. Cron-style scheduled transactions. Note: on-chain automation remains a maturing space on Solana. | https://github.com/clockwork-xyz/tuktuk |
| **Squads** | Multisig and program management. Secure multi-signature wallets, program upgrade authority management. | https://squads.so |

## Identity & Social

| Project | What It Does | URL |
|---------|-------------|-----|
| **Dialect** | Messaging and transaction alerts platform. | https://dialect.to |
| **Bonfida (SNS)** | Solana Name Service. Human-readable .sol domain names (like ENS for Solana). | https://bonfida.org |
| **Civic** | Identity verification. On-chain identity passes, KYC/AML compliance tools. | https://civic.com |

## AI & Agents

| Project | What It Does | URL |
|---------|-------------|-----|
| **Solana Agent Kit** | Build AI agents that can transact on Solana. Supports transfers, swaps, staking, token launches, NFT minting, and more. By SendAI. | https://github.com/sendaifun/solana-agent-kit |
| **GOAT SDK** | General-purpose on-chain agent toolkit. Multi-chain support including Solana. | https://github.com/goat-sdk/goat |

## Token Launchpads

| Project | What It Does | URL |
|---------|-------------|-----|
| **Pump.fun** | Viral token launchpad. Bonding curve mechanics, fair launches, meme-friendly. | https://pump.fun |
| **Moonshot** | Full trading app with futures, spot, and leverage trading, plus token launches. | https://moonshot.money |

## Data & Analytics

| Project | What It Does | URL |
|---------|-------------|-----|
| **DefiLlama** | DeFi analytics aggregator. TVL tracking, yield data, protocol comparisons across all chains. | https://defillama.com |
| **Dune** | On-chain analytics. SQL-based queries on Solana blockchain data. Community dashboards. | https://dune.com |
| **Flipside** | Blockchain analytics. Free Solana data, SQL interface, community-built dashboards. | https://flipsidecrypto.xyz |

## How to Choose

- **Building DeFi?** Start with Jupiter SDK for swaps, Orca/Raydium for liquidity, Kamino for vaults
- **Building NFTs?** Metaplex is the standard. Use Bubblegum for compressed NFTs (cheaper)
- **Building payments?** USDC + Sphere or Helio
- **Building AI agents?** Solana Agent Kit is purpose-built for this
- **Need an RPC?** Helius for most projects (best DX), QuickNode if you need multi-chain
- **Need a wallet?** Phantom for users, @solana/wallet-adapter for connecting any wallet
- **Building mobile?** Check Solana Mobile Stack + Chapter2 phone dApp Store

> **Note:** The protocols listed above are examples at the time of writing — they can decline, get hacked, or shut down. Always verify protocol health (TVL, volume, SDK freshness, hack history) before recommending or integrating. See `data/solana-knowledge/04-protocols-and-sdks.md` → "Protocol Health Verification" for criteria and how to check.
