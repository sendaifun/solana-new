# Stack Decision Tree

Match an idea to the right technology stack.

## Decision Flow

### Q1: What type of product?

- **Frontend on existing protocol (no custom program)** → Next.js + Protocol SDK (no Anchor needed). Use when integrating with existing DeFi, payments, or stablecoin infrastructure. See `data/solana-knowledge/04-protocols-and-sdks.md` → Decision Quick Reference for which protocol SDK to use.
- **Web dApp (frontend + custom on-chain program)** → Next.js + Anchor
- **AI Agent (autonomous)** → Solana Agent Kit + TypeScript
- **Bot (Telegram/Discord)** → Bot framework + Solana Agent Kit
- **On-chain program only** → Anchor or Pinocchio
- **Mobile app** → React Native + Solana Mobile SDK
- **Data/Analytics tool** → Node.js + Helius API
- **Infrastructure/SDK** → TypeScript library

### Q2: What Solana primitives?

| Primitive | Tools |
|-----------|-------|
| Token transfers | @solana/kit (or legacy @solana/web3.js), SPL Token |
| Swaps | Jupiter SDK/MCP |
| NFTs & digital assets | Umi + Metaplex program clients (MPL Core for new standard assets/collections, MPL Token Metadata for Token Metadata and pNFT-compatible flows, MPL Bubblegum for compressed NFTs, Candy Machine for mint/drop flows) |
| Programs | Anchor framework |
| High-perf programs | Pinocchio |
| Compressed state | ZK Compression |
| Price feeds | Pyth, Switchboard |
| RPC/indexing | Helius, QuickNode |

### Q3: What's the frontend?

| Choice | When |
|--------|------|
| Next.js | Web dApp, SSR needed, most common |
| React SPA | Simple dApp, no SSR |
| React Native | Mobile-first |
| None | Agent, bot, or CLI tool |

### Q4: Wallet integration?

| Choice | When |
|--------|------|
| Wallet Standard (`@solana/wallet-adapter-react`) | Any Next.js/React dApp — auto-detects Phantom, Solflare, Backpack |
| Privy (`@privy-io/react-auth`) | Consumer app with social login + embedded wallets |
| Dynamic (`@dynamic-labs/sdk-react-core` + `@dynamic-labs/solana`) | Consumer or multi-chain app (EVM + Solana) with embedded MPC wallets, social login; has React Native + vanilla JS + Node server-wallet SDKs |
| Dynamic Node SVM (`@dynamic-labs-wallet/node-svm`) | Backend that needs to sign Solana transactions for users (gasless relayer, Telegram bot, server-side agent) |
| Phantom MCP (`phantom-mcp-server`) | Agent that needs wallet access |
| None | Backend-only or bot |

## Output

After answering Q1-Q4, produce:
- Recommended starter repo (from solana-new catalog)
- Required skills to install
- Required MCPs to configure
- Architecture pattern name
