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

Only open raw HTML when the normalized JSON clearly lost context:

- `../../../data/raw-html/alliance-ideas.html`
- `../../../data/raw-html/yc-crypto-companies.html`
- `../../../data/raw-html/yc-crypto-companies-p2.html`
- `../../../data/raw-html/yc-requests-for-startups.html`
- `../../../data/raw-html/a16z-state-of-crypto-2025.html`
- `../../../data/raw-html/a16z-big-ideas-2025.html`

## Live Sources

When doing fresh research, fetch these for up-to-date Solana ecosystem context:

- **Helius Blog** — `https://www.helius.dev/blog`
  - Deep technical posts on Solana internals, DAS API, compression, priority fees, token extensions
  - Ecosystem trend analysis and builder guides
  - Use to identify infrastructure gaps, emerging primitives, and what infra builders care about
  - Fetch the blog index page and scan recent post titles for relevant trends

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
