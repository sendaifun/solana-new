# RWA & DeFi Ideas from DAS NYC 2026

Extracted from 99 sessions at Digital Asset Summit NYC (March 24-26, 2026). Use as deeper context when the normalized JSON (`../ideas/rwa-defi-2026-ideas.json`) flags a relevant idea.

Full conference memo: compiled from Blockworks YouTube transcripts.

---

## Conference Context

DAS NYC 2026 was the first post-bull, pragmatic DAS. Key macro shifts:

- **DeFi is B2B now.** User growth stalled since 2021 but distribution through Phantom/Kraken/Coinbase/Robinhood is exploding. "DeFi will become a backend for fintechs." — Sun Raghupathi, Veda CEO
- **Vaults are eating asset management.** $20B today vs $20T ETF market = 1,000x gap. Curators (Gauntlet, Veda, Steakhouse) are the new BlackRock.
- **Oct 10, 2025 cascade is the new reference point.** $19B wiped, 1.6M traders liquidated. Everyone redesigning around it.
- **Regulation is shipping.** SEC 5-category token taxonomy. CFTC perp legalization in progress. GENIUS Act signed July 2025.
- **AI agents are real.** Solana 15M agent payments YTD, 65% of x402 volume. But volumes are "spiky, trading-heavy."

---

## DeFi Prime Brokerage

**Source:** Multicoin Mega Thesis 2.0 (Spencer Applebomb, Day 2 Insights)

**Problem:** The Archegos collapse showed that prime brokers had billions in exposure with no visibility into borrower concentration across brokers. Compliance teams found out after the fact.

**Opportunity:** Smart-contract enforced lending that defines per-venue, per-asset, per-maturity constraints in code. If a borrower tries to move capital outside parameters, the transaction fails or they get liquidated. Risk controls are in the code, not in a compliance team.

**Why now:** DeFi lending protocols now facilitate $35B+ in outstanding loans. Institutional adoption post-Oct-10 is driving demand for programmatic risk controls.

**Buyer:** Trading firms, family offices, institutional funds using DeFi for leveraged strategies.

---

## Branded Stablecoin Platform

**Source:** Inside Western Union's Stablecoin-Fueled Future (Devin McGranahan, WU CEO, Day 1 Main Stage)

**Problem:** Western Union keeps "a couple billion dollars" prefunded in the system for instant payouts — negative float economics. Every fintech has the same problem.

**Opportunity:** Build the issuance + compliance + yield management platform for branded stablecoins. WU launched USDPT on Solana: partners hold USDPT, WU earns T-bill yield on reserves. McGranahan: **"If I can free up a couple billion dollars of capital, I can buy back half the company."**

**Why not USDC?** WU wants to: (1) own the float economics, (2) programmatic compliance at partner-pair level, (3) embed rewards for partners settling in USDPT.

**Market size:** Citi forecasts $4T stablecoin market. Every fintech, neobank, and remittance company will want their own coin.

**Who's NOT the customer:** Crypto-native users. This is for MoneyGram, Western Union, Rain, neobanks — companies that move real money for real people.

---

## Emerging Market Currency Stablecoins

**Source:** On the Design Space for Equity, Commodity, and FX Perps (Shyon Sing Gupta, Multicoin, Day 3 Insights)

**Problem:** $7 trillion/day FX market. Longtail emerging market currencies (BRL, MXN, INR, NGN) have no liquid onchain versions despite massive demand for cross-border settlement.

**Opportunity:** Issue onchain versions of EM currencies backed by local reserves. Combine with synthetic FX perps for full hedging. The end state: "liquidity comparable to a bank or OTC desk via synthetic derivatives + native capacity to mint and redeem against non-USD stables."

**Early movers:** Hibachi, Open FX. Both very early stage. Space is wide open.

**Why it matters:** EM corridors are the highest-margin segments of remittance. WU and MoneyGram are both building on stablecoin rails specifically for these corridors.

---

## Equity Perps on Solana

**Source:** On the Design Space for Equity, Commodity, and FX Perps (Multicoin, Day 3) + Hyperliquid sessions

**Problem:** Hyperliquid does $5B/day in equity perps. Solana has zero. Traders worldwide want 24/7 leveraged equity exposure without brokerage accounts.

**Validation:** During the US-Iran conflict, traders traded oil exposure on Hyperliquid over a weekend — no other venue on the planet offered this. Equity perps are finding PMF among cohorts that have never held a wallet before — purely because of 24/7 access.

**Design:** Synthetic perpetual futures tracking equity prices via oracles. Settle in stablecoins. No actual equity custody needed (Model 1 in Multicoin's framework).

**Why Solana:** 400ms blocks, $0.001 txs, 600+ Pyth feeds. But no one has built equity perps on Solana yet.

---

## Commodity Perps on Solana

**Source:** Hyperliquid: The Architecture of Onchain Markets (Day 2 Insights) + Blockworks Research data

**Validation data:**
- HL silver median spread: **2.4 bps** (tighter than CME micro silver at 3bps)
- Mark-oracle dislocation during silver 17% crash: recovered in 19 minutes
- Crude oil reacted 16 minutes BEFORE the US-Iran strike announcement on HL (6:14pm vs 6:30pm)
- HIP-3 RWA OI: >$1.5B
- HIP-3 share of total HL volume on peak days: 40%+

**Opportunity:** Gold, silver, oil perps on Solana. For consumable commodities (oil/gas) — must be synthetic. For precious metals — wrapped model also viable (Pax Gold, XAUt).

---

## FX Perps DEX

**Source:** Multicoin perps talk (Day 3 Insights)

**Problem:** Most onchain FX today is through synthetics, but no dedicated venue exists. Trading FX risk 24/7 without bank accounts is a massive unlock for EM businesses.

**Opportunity:** Synthetic FX perpetuals + non-USD stablecoin swaps on a single venue. Combine with EM stablecoin issuance for full-stack on-chain FX.

---

## Direct Indexing Platform

**Source:** Tokenization's Next Unlock: Direct Indexing for All (Day 3 Investor) — dedicated session

**Speakers:** S&P Digital Markets, Dinari, VanEk

**Opportunity:** Tokenized index funds where users own the underlying tokenized equities, not a fund wrapper. Tax-loss harvesting, custom exclusions, fractional ownership — all on-chain.

**Validation:** S&P Digital Markets 50 index token launched through Dinari's network. VanEk product team actively building tokenized index offerings.

---

## Tokenized Private Credit Marketplace

**Source:** Multicoin Mega Thesis 2.0 (Day 2 Insights)

**Why this asset class leapfrogs:** "Private credit maps well to onchain models because debt markets are a lot less regulated and a lot more fragmented than securities. Because there's no centralized infrastructure to fight against — these are just bilateral credit agreements — you can very easily take that stuff and put it on chain."

**Current traction:** 2nd fastest growing RWA category after treasuries. Centrifuge, Credits, Goldfinch doing securitized pools. Sky Spark Vaults and Plural Energy doing collateralized borrowing.

**Evolution:** Model 3 (collateralized borrowing against offchain assets) → Model 4 (loans directly originated on-chain).

---

## Defined-Loss Structured Products

**Source:** Avoiding Another 10/10: The Market Structure We Need (Day 1 Investor) + multiple market structure panels

**Context:** Oct 10, 2025: $19B wiped, 1.6M traders liquidated, $3.21B in 60 seconds after Trump-China tariff post.

**Shift:** FalconX and STS Digital both confirmed: clients are structurally moving from linear perps to **defined-loss structures** (call spreads, put spreads). This isn't a temporary flight — it's a permanent allocation change.

**Opportunity:** Build on-chain structured products with defined maximum loss. No Solana venue offers this natively.

---

## ADL Replacement Protocol

**Source:** Avoiding Another 10/10 panel + DRW's Chris Long

**Problem:** Auto-deleveraging (ADL) is a BitMEX legacy mechanism that forcibly closes profitable positions during liquidation cascades. Chris Long (DRW): **"It's just not institutional."**

**Dilemma:** CME uses T+1 margin calls — crypto hasn't decided between 24/7 ADL or institutional T+1. No venue has proposed a replacement.

**Opportunity:** Design and ship a new liquidation backstop mechanism that institutions will accept. First mover wins the institutional perps market.

---

## Cross-Margined Prediction Markets

**Source:** Hyperliquid's Institutional Opportunity (Day 3 Main) + Blockworks Research

**Opportunity:** Prediction markets cross-margined with perps on a single venue. Hold a BTC perp position and a prediction market bet using the same collateral.

**Validation:** HIP-4 bringing this to Hyperliquid in 2026. No other venue globally offers cross-margined perps + prediction markets. CFTC filed friend-of-court brief defending prediction market operators.

**Why Solana:** Build it before HIP-4 ships. Solana's speed and cost advantage over HL's L1.

---

## DeFi Middleware API Layer

**Source:** Multicoin Mega Thesis 2.0 — the "DeFi Mullet" thesis (Day 2 Insights)

**Framework:** Three layers — frontends (Phantom, Kraken) → middleware → backend protocols (Kamino, Drift, Aave).

**Problem:** Fintechs want to offer DeFi yields but can't deal with the complexity. Backend protocols are consolidating into 2-3 winners per vertical. The missing layer is middleware that connects them.

**Examples cited:** yield.xyz (yield routing API), Lei (interchain trading API for neobanks), fun.xyz (deposit flow + gas abstraction).

**Validation:** Kraken DeFi Earn: $150M AUM in 2 months with zero incentives — via Morpho integration. Proof that the DeFi Mullet model works.

---

## Agent Policy Engine

**Source:** Agentic Commerce: What's Real & What's Sci-Fi (Day 2 Institutional)

**Speakers:** Privy/Stripe (Henry Stern), EigenCloud, Big Wallet

**Problem:** "You don't want to give a credit card to an agent and tell it to go buy something for you without a lot of control." Agents need operational controls: spending limits, per-vendor rules, velocity checks, human-in-the-loop approvals.

**Different from compliance:** Agent compliance layer (KYC/AML) is about WHO can transact. Policy engine is about WHAT and HOW MUCH the agent can spend at runtime.

**Validation:** Privy: 120M deployed wallets, tens of billions in monthly volume. ~35% of incoming self-serve devs are building agentic products. Demand is real and growing.

---

## Physical Collectibles Marketplace

**Source:** Multicoin Mega Thesis 2.0 — "BECKOM" thesis (Day 2 Insights)

**Problem:** Fine wine, watches, trading cards, art — $300B+ industry. Trading happens across eBay, Facebook, private dealers, auction houses. Records fragmented. Authenticity checked by hand. Settlement slow.

**Opportunity:** Blockchain-enabled collectibles marketplaces (BECKOMs) fix custody, ownership records, and settlement. Assets trade more often. Collections can be used as collateral (Multicoin portfolio company Baxis already doing this).

**Why now:** The infrastructure for custody and tokenization is mature enough. What's missing is the marketplace with real inventory and real collectors.

---

## Collateral Haircut Engine

**Source:** Avoiding Another 10/10 panel — referenced in nearly every market-structure session

**Problem:** During Oct 10, LSTs (stETH, mSOL) were valued at thin orderbook marks, not underlying asset value. This amplified liquidation cascades reflexively — a collateral de-peg feedback loop.

**Fix:** Haircut LSTs and stablecoins based on actual liquidity depth and underlying-asset price feeds, not orderbook marks.

**Opportunity:** Build this as infrastructure that any lending protocol or perps venue can plug into. Universal collateral valuation layer.
