# DeFi & Crypto Ideas from Superteam Blog (2024)

Extracted from 5 key blog.superteam.fun posts. Use as deeper context when the normalized JSON (`ideas/yash-defi-2024-ideas.json`) flags a relevant idea.

---

## Source: What to Build for Solana DeFi (2024)

https://blog.superteam.fun/p/what-to-build-for-solana-defi

Written when Solana DeFi TVL was ~$4B and daily DEX volumes hit $4B+. The post identifies 10 themes across DeFi primitives that were missing or underdeveloped on Solana.

### Solana FX Market

**Problem:** $6 trillion daily volume in traditional FX. Fiat-backed stablecoins (USDC, EURC, etc.) now have real liquidity but no native spot FX venue on-chain.

**Opportunity:** Build on-chain spot foreign exchange through order books and AMMs. Enable instant currency conversion for merchants accepting stablecoin payments. Cross-border commerce without bank FX spreads.

**Competitors:** No direct on-chain competitor on Solana. Traditional FX is dominated by bank OTC desks.

### Morpho Optimizer for Solana

**Problem:** Pool-based lending (Kamino, Save/Solend) has utilization gaps — deposited capital earns suboptimal rates because not all of it is borrowed.

**Opportunity:** Peer-to-peer matching layer on top of existing money markets. When matched, lenders receive the full borrower rate at 100% utilization. Unmatched capital falls back to the underlying pool. Morpho on Ethereum has $12B+ AUM proving the model.

**Competitors:** Flexlend, JuicerFi (early), Lulo Finance (routing). None have built the full optimizer model on Solana.

### Fixed-Rate Lending Protocol

**Problem:** TradFi is 98% fixed rate. DeFi is almost entirely floating rate. Institutions and businesses need predictable borrowing costs.

**Competitors (Ethereum):** Yield Protocol, Notional Finance, Exactly Finance, Term Finance. On Solana: Lulo Finance does rate routing but not fixed-rate origination.

**Why it's hard:** Maintaining fixed-rate positions requires active management. Historical DeFi attempts underperformed. But institutional demand is real.

### Composable Leverage Protocol (Gearbox for Solana)

**Problem:** Leveraged yield farming requires manual looping across multiple protocols.

**Opportunity:** One-click composable leverage. Deposit collateral, protocol borrows and deploys across AMMs, LSTs, and incentive programs automatically. Gearbox on Ethereum proved the model.

**Integrations:** Kamino, Jupiter, Drift, Meteora, Sanctum — the leverage protocol connects all of these.

### Corporate On-chain Bonds

**Problem:** On-chain companies (protocols, DAOs) with real revenue have no way to raise debt capital without dilutive token emissions.

**Opportunity:** Transparent blockchain-based bonds backed by on-chain revenue streams. Investors can verify revenue in real-time. No token dilution for issuers.

### Interest Rate Swaps for LSTs

**Problem:** LST staking yields fluctuate. Institutions want predictable returns.

**Opportunity:** Forward contracts exchanging fixed staking rates for floating on JitoSOL, mSOL, etc. LST staking rate becomes the Solana "risk-free rate." Enables a full yield curve.

### Tokenized Vault Standard for Solana (ERC-4626 Equivalent)

**Problem:** No standard interface for yield-bearing vaults on Solana. Every protocol has its own vault implementation, breaking composability.

**Opportunity:** Universal vault standard enabling any yield source to be wrapped and composed. On Ethereum, ERC-4626 has $10B+ TVL and powers the entire vault ecosystem.

### Vertical Perps / Niche Markets

**Problem:** Perps exist for major crypto assets but not for commodities, real estate, events, or sector indices.

**Reference:** Parcl (real estate perps) proved the concept with $100M+ TVL at peak. Space is wide open for other verticals.

### Power Perps

**Problem:** Standard perps offer linear leverage. Some traders want convex/non-linear payoff structures.

**Origin:** Paradigm research paper. Exponents (Berachain) exploring. Nobody on Solana.

### Everlasting Options

**Problem:** Options expire, requiring active management and rollover.

**Opportunity:** Perpetual options that never expire. Combines the perpetual funding mechanism with options payoffs. Originally proposed by SBF in Paradigm research.

### Perp Aggregator

**Opportunity:** Route perp trades across Drift, Jupiter Perps, Flash Trade for best execution. Similar to how Jupiter aggregates spot DEXs. Reference: Rage Trade, MUX Protocol on Ethereum.

### Market-Making Vaults for Order Books

**Problem:** Order book DEXs (Phoenix) need market makers. Passive LPs can't easily provide orderbook liquidity.

**Opportunity:** Decentralized MM vaults that programmatically place and manage orders. Ensures depth isn't dependent on a single market maker.

### Oracle Extractable Value (OEV) Protocol

**Problem:** Arbitrageurs and liquidators capture value from oracle price update timing. Applications lose this value.

**Opportunity:** Application-owned orderflow auctions that capture OEV before external searchers. Reference: Multicoin Capital research on this topic.

### Risk Management DAO

**Opportunity:** Publish risk dashboards, frameworks, and ratings for Solana DeFi protocols. Offer paid risk assessments to institutional allocators. The Moody's/S&P for DeFi.

### Bribe Aggregator / Marketplace

**Opportunity:** Aggregate bribes from projects for LST staking governance, Jupiter LFG voting, and other protocol participation. Votium model for Solana.

### Instadapp for Solana

**Opportunity:** All-in-one DeFi management — leverage, refinance, migrate positions across protocols in one click. No equivalent on Solana today.

### DeFi Structured Products Vaults

**Opportunity:** Automated DOV strategies — covered calls, put spreads, delta-neutral yield. Friktion reached $500M+ TVL before shutting down. Code is available. Space is open again.

### Solana Perp DEX Appchain

**Opportunity:** Dedicated appchain for perp trading — no mainnet congestion, gas-free trading. Precedent: Zeta/Bullet, dYdX, Hyperliquid all went appchain.

### Continuous Prediction Markets via Memecoins

**Opportunity:** Political/event memecoins as continuous prediction markets. Unlike binary prediction markets, no cap on returns. MetaDAO (governance) is an early example.

### Yield Aggregator

**Opportunity:** Route to optimal yield across Solana lending, staking, and farming. Single interface for discovery.

---

## Source: Layer 1 Wars: It's About AI Agents (2025)

https://blog.superteam.fun/p/layer-1-wars-its-about-ai-agents

Argues that agentic payments don't fit on today's payment infrastructure, creating opportunity for middleware and protocol improvements.

### Agent-Native Payment Middleware

**Three modules:** (1) Stripe-like interface handling agent inputs/outputs to blockchain, (2) policy engine defining automation and spending rules, (3) fraud detection with explainability. Sits between AI labs' APIs and public blockchains.

**Why crypto:** Agents can't use credit cards (KYC, chargebacks, minimum amounts). Stablecoins are cash-like — transfer and it's done. No recourse, no settlement uncertainty.

### Agentic Payment Protocol

Settlement protocol for high-volume machine-to-machine micropayments. Deterministic finality, native programmability, automated dispute resolution. 1-2 cent transactions that card rails can't serve.

### Agent-Aware Compliance Layer

Token-level transfer hooks enforcing KYC/AML at the protocol level. Uses Solana Token Extensions. Prevents rogue probabilistic agents from violating compliance regardless of LLM outputs.

### Machine-to-Machine Dispute Resolution

Smart-contract based with optional LLM-to-LLM communication for dispute context. For micropayments where manual dispute resolution costs exceed the transaction amount.

---

## Source: Stop Building for Crypto Twitter (2022)

https://blog.superteam.fun/p/stop-building-for-crypto-twitter

Argues that crypto builders should target real-world markets, not crypto-native users.

### Open Ride-Sharing Network

Decentralized ride-sharing where profiles are composable, ratings are public, and payments work across multiple interfaces. No single entity controls the network. Reference: Teleport.

### Open Accommodations Marketplace

Airbnb/Booking.com competitor with real-time inventory, property information, and pricing accessible to any app builder through open APIs.

---

## Source: State of Solana DePIN 2024

https://blog.superteam.fun/p/state-of-solana-depin-2024

Comprehensive overview of the DePIN landscape on Solana with forward-looking opportunities.

### DePIN-specific SVM Rollup

SVM-based rollup optimized for DePIN. Greater control over block production, gas, and state while leveraging existing Solana tooling and ecosystem.

### ZK-verifiable GPU Cloud

On-chain GPU computing with zero-knowledge proofs verifying computation. Enables decentralized AI inferencing at scale. Currently expensive but costs are falling rapidly.

### Hardware Financing via RWA

Tokenized funding for physical DePIN infrastructure. Investors buy fractional ownership of hardware (miners, sensors, chargers). Hardware generates revenue that flows to token holders.

---

## Source: Global DeFi Capital — India's Opportunity (2025)

https://blog.superteam.fun/p/global-defi-capital-indias-opportunity

Makes the case for tokenizing regional government securities and bonds for global DeFi access.

### Tokenized Regional Government Securities

Blockchain-based government securities with 24/7 access and T+0 settlement. Offers global investors exposure to higher-yield regional bonds (7-8.5% in INR for Indian G-Secs vs 4-5% US Treasuries).

### Tokenized Regional Green Bonds

Sovereign green bonds on public blockchains. Solves liquidity issues and greenwashing transparency for climate-focused investors.

### Cross-Chain DeFi Capital Connector

Neutral protocol standardizing KYC, AML, and capital control enforcement across multiple blockchains. Enables regional regulated assets to be accessible on global DeFi venues.
