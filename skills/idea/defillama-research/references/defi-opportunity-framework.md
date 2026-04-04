# DeFi Opportunity Framework

How to spot buildable opportunities from DefiLlama data.

## Opportunity Types

### 1. Cross-Chain Gap

**Signal**: A DeFi category has $X billion TVL on Ethereum but < $X/10 on Solana.

**Example**: If Ethereum has $20B in lending TVL and Solana has $800M, there's room for more lending protocols on Solana.

**How to find**: Compare `/overview/fees/Ethereum` vs `/overview/fees/Solana` by category. Large gaps = unmet demand.

**What to build**: Port the concept to Solana, but with Solana-native UX (speed, low fees, mobile-first).

### 2. Aggregation Opportunity

**Signal**: 5+ protocols in the same category, none dominant, fragmented liquidity.

**Example**: Multiple DEXs with $50-200M TVL each but no clear winner for a specific trading pair type.

**How to find**: Filter `/protocols` by category on Solana. Count protocols. Check if any single one has > 50% category share.

**What to build**: Aggregator, router, or meta-protocol that unifies the fragmented space.

### 3. Infrastructure Gap

**Signal**: Protocols exist but lack developer tools, SDKs, or MCP servers.

**Example**: A Tier 2 protocol with $200M TVL but no npm package, no MCP, and poor documentation.

**How to find**: Cross-reference top Solana protocols from `/protocols` with solana-new catalogs (skills, MCPs). If a top protocol has no skill or MCP, that's a gap.

**What to build**: SDK, skill, or MCP server for that protocol. Become the developer layer.

### 4. Yield Vacuum

**Signal**: A pool type or strategy has high APY on one chain but doesn't exist on Solana.

**Example**: Restaking yields are 8-15% on Ethereum but no equivalent on Solana.

**How to find**: Compare `/pools` filtered by chain. Look for pool types present on Ethereum but absent on Solana.

**What to build**: Port the yield strategy to Solana. Users follow yield.

### 5. Stablecoin Flow

**Signal**: Stablecoin supply growing on Solana = new capital entering the ecosystem.

**How to find**: `/stablecoincharts/Solana` shows historical stablecoin supply. Rising = bullish for building.

**What to build**: Anything that helps new capital find yield or utility — on-ramps, yield aggregators, payment rails.

### 6. Fee/Revenue Mismatch

**Signal**: A protocol generates disproportionate fees relative to its TVL = high capital efficiency.

**How to find**: Pull `/overview/fees/Solana` and `/protocols` (filtered to Solana). Calculate fees/TVL ratio. High ratio = protocol is doing something right.

**What to build**: Study what makes them efficient. Build a competing or complementary product using similar patterns.

## Research Workflow

1. **Start broad**: Pull `/v2/chains` to see Solana's position in the ecosystem
2. **Zoom into categories**: Group `/protocols` results by `category` field to see which DeFi categories are growing (the `/api/categories` endpoint may be unavailable)
3. **Find top protocols**: Filter `/protocols` for Solana, sort by TVL and growth
4. **Check revenue health**: Cross-reference with `/overview/fees/Solana`
5. **Spot the gaps**: Compare Solana vs Ethereum data, check for missing tools in solana-new catalogs
6. **Validate with trends**: Use historical endpoints to confirm growth, not just snapshot

## Output

Present findings as:
- **Market snapshot**: Solana DeFi TVL, growth, top categories
- **Top 10 protocols**: Name, TVL, 7d change, category, fee revenue
- **3 opportunities**: Each with data backing, what to build, and risk level
- **Integration targets**: Protocols worth building on (have SDKs, growing, healthy fees)
