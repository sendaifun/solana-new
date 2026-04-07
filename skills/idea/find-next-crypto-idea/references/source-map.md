# Source Map

Use the local datasets as pattern libraries, not as proof that a market still matters today.

## Read Order

1. Start with `../../../data/ideas/web3-ideas-combined.json`
2. Then inspect `../../../data/ideas/superteam-ideas.json`
3. Open per-source files only when you need finer-grained context

## Primary Files

- `../../../data/ideas/web3-ideas-combined.json`
  - Combined external dataset assembled from Alliance, YC, and a16z sources
  - Best first pass for idea archetypes, recurring wedges, and adjacent spaces
- `../../../data/ideas/superteam-ideas.json`
  - Superteam-style approved ideas
  - Best for Solana-native patterns, problem framing, and example idea structure

## Blog Ideas

- `../../../data/ideas/superteam-blog-ideas.json`
  - 43 concrete buildable ideas extracted from Superteam blog posts
  - Sources: "What to Build for Solana DeFi", "State of Solana DePIN 2024", "Layer 1 Wars: It's About AI Agents", "Top 7 Cross-Chain Themes", "Stop Building for Crypto Twitter", "Global DeFi Capital: India's Opportunity"
  - Strongest for DeFi primitives (perps, LSTs, lending), AI agent payments, cross-chain, DePIN, and India-specific RWA opportunities
  - Each idea has a `source` field linking back to the original blog post

## Secondary Files

- `../../../data/ideas/alliance-ideas.json`
  - AI x crypto and consumer/app-layer prompts
- `../../../data/ideas/yc-crypto-companies.json`
  - Company landscape snapshots from the YC crypto/web3 directory
  - Use to spot crowded sectors, buyer categories, and product shapes
- `../../../data/ideas/yc-requests-for-startups.json`
  - YC Requests for Startups normalized into the same schema
  - Use to understand sharp venture-style prompts and market asks
- `../../../data/ideas/a16z-state-of-crypto-2025.json`
  - Trend and macro sections normalized from the State of Crypto report
- `../../../data/ideas/a16z-big-ideas-2025.json`
  - Higher-level theses and directional ideas from a16z crypto

## Raw Sources

Only open raw markdown when the normalized JSON clearly lost context:

- `../../../data/guides/alliance-ideas.md`
- `../../../data/guides/yc-crypto-companies.md`
- `../../../data/guides/yc-crypto-companies-p2.md`
- `../../../data/guides/yc-requests-for-startups.md`
- `../../../data/guides/a16z-state-of-crypto-2025.md`
- `../../../data/guides/a16z-big-ideas-2025.md`

## Live Sources

When doing fresh research, fetch these for up-to-date Solana ecosystem context:

- **Helius Blog** — `https://www.helius.dev/blog`
  - Deep technical posts on Solana internals, DAS API, compression, priority fees, token extensions
  - Ecosystem trend analysis and builder guides
  - Use to identify infrastructure gaps, emerging primitives, and what infra builders care about
  - Fetch the blog index page and scan recent post titles for relevant trends

- **Twitter/X Trends via bird.fast** — `npx bird`
  - CLI that uses your browser session to search X/Twitter
  - Search for crypto/Solana trending topics to validate demand signals
  - Commands: `bird search "solana defi"`, `bird search "crypto AI"`, `bird trending`
  - Compare your idea against what builders and users are talking about right now
  - Install: `npm i -g bird.fast` or use `npx bird` one-shot
  - Requires browser session cookies (Safari/Chrome/Firefox) — run `bird whoami` to verify

### How to Use bird.fast for Idea Validation

1. **Trend scan**: `bird search "solana <your-niche>"` — see what people are building/requesting
2. **Demand signals**: `bird search "<problem your idea solves>"` — look for complaints, wishlists
3. **Competitor buzz**: `bird search "<competitor name> solana"` — gauge traction
4. **Compare**: Cross-reference trending topics with your idea shortlist to prioritize ideas with real-time buzz

## Usage Rules

- Do not blindly copy ideas from the datasets.
- Use them to identify recurring patterns:
  - stablecoin rails
  - agent payments
  - DeFi middleware
  - identity / proof systems
  - marketplaces
  - distribution wedges
- Cross-check all serious candidates with fresh research before recommending them.
