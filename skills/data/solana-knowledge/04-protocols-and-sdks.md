# Solana Protocols and SDKs

> Comprehensive reference for every major protocol, SDK, and service a Solana developer would integrate. Organized by category with key URLs, npm packages, and guidance on when to use each.

---

## Integrate First, Build Second

**Default recommendation: integrate an existing protocol before building a custom smart contract.** Default to custom development when the user is clearly building the protocol layer itself or needs novel on-chain logic.

Most apps don't need a new on-chain program. Existing protocols have battle-tested contracts handling billions in TVL, TypeScript SDKs for direct frontend integration, established liquidity, and ongoing security maintenance.

**When to integrate (most cases):**
- Trading UIs, portfolio dashboards, DeFi aggregators
- Adding swap, lending, or perps functionality to an app
- Bots, agents, or automation on top of DeFi
- Stablecoin payments, fintech apps, or payment rails (integrate existing stablecoin infra + Jupiter for conversions)
- Any frontend-only or API-only project

**When to build custom:**
- User wants to own the protocol layer or build novel on-chain logic/state
- Novel mechanism design that doesn't exist yet (new AMM curve, new collateral model)
- Need on-chain composability that existing protocols don't expose
- User explicitly says "build a program", "smart contract", or "on-chain protocol"

When in doubt, integrate. You ship faster, inherit security and liquidity, and can always build custom later if the integrated approach hits a wall.

---

## Protocol Health Verification

**Before recommending any protocol, verify it is alive, liquid, and safe.** Never rely solely on the static recommendations in this document — protocols can decline, get exploited, or shut down.

### How to Check Protocol Health

Use whatever data source is available — DefiLlama MCP tools if installed, DefiLlama API directly, or web search. The key data points to gather:

1. **TVL and trend** — Is the protocol still holding meaningful TVL? Is it growing or declining?
   - DefiLlama API: `GET https://api.llama.fi/protocol/{protocol-slug}`
   - DefiLlama API: `GET https://api.llama.fi/protocols` (list all, filter by chain/category)
   - Or use `mcp__defillama__get_protocol` / `mcp__defillama__search_protocols` if available

2. **Volume** — Is there active trading? Dead volume = dead protocol.
   - DefiLlama API: `GET https://api.llama.fi/overview/dexs/solana` (DEX volumes)
   - Or use `mcp__defillama__get_dex_overview` / `mcp__defillama__get_fees_overview` if available

3. **Hack history** — Has it been exploited? Did it recover?
   - DefiLlama API: `GET https://api.llama.fi/hacks`
   - Or use `mcp__defillama__get_hacks` if available

4. **SDK freshness** — Is the TypeScript SDK still maintained?
   ```bash
   npm view <package-name> time --json | jq 'to_entries | last'
   gh repo view <org>/<repo> --json updatedAt,stargazerCount
   ```

### Health Criteria

| Signal | Healthy | Warning | Avoid |
|--------|---------|---------|-------|
| TVL | >$50M | $5M–$50M | <$5M or declining >50% in 30d |
| 24h Volume | >$10M | $1M–$10M | <$1M |
| SDK last publish | <3 months | 3–6 months | >6 months |
| GitHub activity | Weekly commits | Monthly | No commits in 6+ months |
| Security | Audited, no major exploits | Audited, recovered from incident | Unaudited or unrecovered exploit |
| Documentation | Complete with examples | Exists but sparse | Missing or outdated |

### Defunct or Risky Protocol Signals

Do not auto-recommend any protocol that shows these patterns:
- **TVL near zero or crashed >90%** from peak without recovery
- **SDK abandoned** — no npm publish or GitHub commit in 6+ months, team unresponsive
- **Major unrecovered exploit** — funds lost, users not made whole
- **Officially sunset** — team announced shutdown or migration

If a protocol was exploited but recovered (repaid users, patched, resumed operations), note the history but don't auto-exclude — use judgment based on current health signals.

**Always verify current state before recommending.** This document is a starting point, not the final answer.

---

## DeFi Protocols

### Jupiter -- Aggregator & Trading Infrastructure

Jupiter is Solana's dominant swap aggregator, routing trades across every major DEX for best pricing.

| Feature | Description |
|---------|-------------|
| Swap Aggregation | Routes across 20+ DEXs for optimal price |
| DCA (Dollar-Cost Averaging) | Automated recurring buys over a time window |
| Limit Orders | On-chain limit orders with no expiry fees |
| Perpetual Futures | Up to 100x leverage on SOL, ETH, BTC |
| Token Launch (LFG) | Community-driven token launch platform |

**When to use:** Any time your app needs token swaps. Jupiter should be the default choice for swap routing -- do not build your own aggregation.

**Key URLs:**
- App: https://jup.ag
- Docs: https://station.jup.ag/docs
- API: https://quote-api.jup.ag/v6 (swap quotes — being sunset), https://api.jup.ag (Ultra API — replacement for v6, also price API)
- GitHub: https://github.com/jup-ag

**npm packages:**
- `@jup-ag/api` -- TypeScript client for the Jupiter API
- `@jup-ag/common` -- shared utilities
- `@jup-ag/unified-wallet-adapter-mui` / `@jup-ag/unified-wallet-adapter-ant-design` -- wallet UI

```typescript
// Example: Get a swap quote
import { createJupiterApiClient } from "@jup-ag/api";

const jupiter = createJupiterApiClient();
const quote = await jupiter.quoteGet({
  inputMint: "So11111111111111111111111111111111111111112", // SOL
  outputMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // USDC
  amount: 1_000_000_000, // 1 SOL in lamports
  slippageBps: 50, // 0.5%
});
```

---

### Orca -- Concentrated Liquidity AMM

Orca provides concentrated liquidity via Whirlpools, allowing LPs to allocate capital within specific price ranges for higher capital efficiency.

| Feature | Description |
|---------|-------------|
| Whirlpools | Concentrated liquidity pools (CLMM) |
| Splash Pools | Full-range pools for simpler LP experience |
| SDK | Open-source TypeScript SDK for integration |

**When to use:** When you need to create a liquidity pool, build a custom DEX UI, or provide LP management tools. Also the best choice for programmatic LP position management.

**Key URLs:**
- App: https://www.orca.so
- Docs: https://orca-so.github.io/whirlpools/
- GitHub: https://github.com/orca-so/whirlpools

**npm packages:**
- `@orca-so/whirlpools` -- core Whirlpools SDK (v2)
- `@orca-so/whirlpools-sdk` -- legacy SDK (v1)
- `@orca-so/common-sdk` -- shared utilities

---

### Raydium -- AMM + Order Book Hybrid

Raydium combines AMM liquidity with OpenBook's central limit order book (CLOB) for deep liquidity.

| Feature | Description |
|---------|-------------|
| Standard AMM | Constant-product AMM pools |
| Concentrated Liquidity (CLMM) | Tick-based concentrated positions |
| AcceleRaytor | Launchpad for new tokens |
| Farming | Yield farming with RAY rewards |

**When to use:** When you need AMM pools that also contribute liquidity to an order book, or for token launches that need immediate deep liquidity.

**Key URLs:**
- App: https://raydium.io
- Docs: https://docs.raydium.io
- GitHub: https://github.com/raydium-io

**npm packages:**
- `@raydium-io/raydium-sdk-v2` -- TypeScript SDK

---

### Drift -- DEFUNCT (Exploited April 2026)

> **DO NOT INTEGRATE.** Drift was exploited for $285M on April 1, 2026 via compromised admin keys (DPRK-linked). The protocol is permanently frozen. TVL collapsed from $550M to <$10M. Use Jupiter Perpetual Exchange instead.

---

### Jupiter Perpetual Exchange -- Perps & Derivatives

Jupiter Perps is now Solana's leading derivatives platform, offering oracle-based perpetual futures with deep liquidity backed by the JLP pool.

| Feature | Description |
|---------|-------------|
| Perpetual Futures | Up to 100x leverage on SOL, ETH, BTC and more |
| JLP Pool | Liquidity provider pool earning trading fees |
| Oracle-based | Chaos primary oracle, Pyth + Chainlink fallback |
| Part of Jupiter | Integrated with Jupiter's swap, DCA, limit orders |

**When to use:** When building perps trading frontends, trading bots, or any derivatives integration on Solana. Jupiter Perps is the default choice after the Drift shutdown.

**Key URLs:**
- App: https://jup.ag/perps
- Docs: https://station.jup.ag/docs
- GitHub: https://github.com/jup-ag

**npm packages:**
- `@jup-ag/api` -- TypeScript client for Jupiter APIs (swaps, perps, DCA)

---

### Kamino -- Automated Liquidity & Lending

Kamino automates concentrated liquidity management and provides lending/borrowing with leverage strategies.

| Feature | Description |
|---------|-------------|
| Kamino Lend | Lending/borrowing protocol |
| Kamino Liquidity | Automated CLMM position management |
| Multiply | Leveraged yield strategies |
| Long/Short | Leveraged directional exposure |

**When to use:** When building yield aggregation tools, lending integrations, or when users need automated LP management without manual rebalancing.

**Key URLs:**
- App: https://app.kamino.finance
- Docs: https://docs.kamino.finance
- GitHub: https://github.com/Kamino-Finance

**npm packages:**
- `@kamino-finance/klend-sdk` -- lending SDK
- `@kamino-finance/kliquidity-sdk` -- liquidity SDK

---

### Marinade -- Liquid Staking (mSOL)

Marinade is Solana's largest liquid staking protocol. Stake SOL, receive mSOL which appreciates in value.

| Feature | Description |
|---------|-------------|
| Liquid Staking | Stake SOL -> receive mSOL |
| Native Staking | Delegate to top validators via Marinade |
| Directed Stake | Choose which validators receive your stake |

**When to use:** When your app needs staking yield while maintaining liquidity, or when building staking dashboards.

**Key URLs:**
- App: https://marinade.finance
- Docs: https://docs.marinade.finance
- GitHub: https://github.com/marinade-finance

**npm packages:**
- `@marinade.finance/marinade-ts-sdk` -- TypeScript SDK

---

### Jito -- MEV & Liquid Staking

Jito provides MEV infrastructure (bundles, tips) and liquid staking (jitoSOL).

| Feature | Description |
|---------|-------------|
| jitoSOL | Liquid staking token with MEV rewards |
| Bundles | Atomic transaction bundles for MEV |
| Tips | Priority landing via Jito tips |
| Block Engine | MEV-aware block building |

**When to use:** When you need guaranteed transaction ordering (arbitrage, liquidations), or when building staking products that want MEV-enhanced yields.

**Key URLs:**
- App: https://www.jito.network
- Docs: https://jito-labs.gitbook.io/mev
- GitHub: https://github.com/jito-foundation

**npm packages:**
- `jito-ts` -- TypeScript SDK for bundles and tips

```typescript
// Example: Send a Jito bundle
import { SearcherClient } from "jito-ts/dist/sdk/block-engine/searcher";

const client = SearcherClient.connect("https://mainnet.block-engine.jito.wtf");
const bundle = await client.sendBundle(transactions, tipLamports);
```

---

### Marginfi -- Lending/Borrowing

Marginfi is a decentralized lending protocol on Solana with risk-isolated pools.

**When to use:** When integrating lending/borrowing, building liquidation bots, or providing yield to users via supply-side deposits.

**Key URLs:**
- App: https://app.marginfi.com
- Docs: https://docs.marginfi.com
- GitHub: https://github.com/mrgnlabs

**npm packages:**
- `@mrgnlabs/marginfi-client-v2` -- TypeScript SDK
- `@mrgnlabs/mrgn-common` -- shared utilities

---

### Metaplex -- NFT Standard & Tools

Metaplex defines the NFT standards on Solana and provides tools for creation and management.

| Program | Description |
|---------|-------------|
| Token Metadata | The NFT metadata standard (attributes, images, royalties) |
| Bubblegum | Compressed NFTs (cNFTs) -- 1000x cheaper minting |
| Candy Machine | Generative NFT launch tool |
| Core | Next-gen NFT standard (simpler, cheaper) |
| Fusion | Combine/transform NFTs |

**When to use:** Any NFT project on Solana. Token Metadata is the universal standard. Use Bubblegum for large-scale minting (millions of NFTs). Use Core for new projects that want the latest standard.

**Key URLs:**
- Docs: https://developers.metaplex.com
- GitHub: https://github.com/metaplex-foundation

**npm packages:**
- `@metaplex-foundation/mpl-token-metadata` -- metadata program client
- `@metaplex-foundation/mpl-bubblegum` -- compressed NFTs
- `@metaplex-foundation/mpl-candy-machine` -- candy machine
- `@metaplex-foundation/mpl-core` -- Core NFT standard
- `@metaplex-foundation/umi` -- framework for Solana program clients

---

## Infrastructure

### Helius -- RPC, Webhooks & DAS API

Helius is the most developer-friendly RPC provider on Solana, offering enhanced APIs beyond standard RPC.

| Feature | Description |
|---------|-------------|
| RPC Nodes | Standard + enhanced Solana RPC |
| DAS API | Digital Asset Standard API for NFTs (recommended way to query NFTs) |
| Webhooks | Real-time transaction/account notifications |
| Transaction Parsing | Human-readable transaction history |
| Priority Fee API | Real-time priority fee estimates |

**When to use:** Default choice for RPC in production. DAS API is the standard way to query NFTs/cNFTs. Webhooks replace polling for real-time updates.

**Key URLs:**
- Dashboard: https://dev.helius.xyz
- Docs: https://docs.helius.dev
- GitHub: https://github.com/helius-labs

**npm packages:**
- `helius-sdk` -- TypeScript SDK

```typescript
// Example: Get NFTs owned by a wallet
import { Helius } from "helius-sdk";
const helius = new Helius("YOUR_API_KEY");
const nfts = await helius.rpc.getAssetsByOwner({
  ownerAddress: "wallet_address",
  page: 1,
});
```

---

### QuickNode -- RPC & Data Streams

QuickNode provides high-performance RPC endpoints with add-on services.

| Feature | Description |
|---------|-------------|
| RPC Endpoints | Dedicated Solana nodes |
| Streams | Real-time blockchain data streaming |
| Functions | Serverless functions triggered by on-chain events |
| Marketplace | Add-on services from partners |

**When to use:** When you need dedicated infrastructure with SLA guarantees, or when building data pipelines with Streams.

**Key URLs:**
- Dashboard: https://www.quicknode.com
- Docs: https://www.quicknode.com/docs/solana

---

### Triton -- Dedicated RPC & Yellowstone gRPC

Triton provides dedicated RPC infrastructure and Yellowstone gRPC for high-throughput data streaming.

| Feature | Description |
|---------|-------------|
| Dedicated RPC | Bare-metal Solana nodes |
| Yellowstone gRPC | High-performance gRPC streaming (account updates, transactions) |
| Shredstream | Low-latency shred streaming |

**When to use:** When you need the lowest latency possible (trading, MEV) or high-throughput data streaming via gRPC.

**Key URLs:**
- Site: https://triton.one
- Docs: https://docs.triton.one

---

### Ironforge -- RPC + Developer Toolkit

**Key URLs:** https://www.ironforge.cloud

**When to use:** Alternative RPC with integrated developer tools and explorer.

---

### Solscan -- Explorer & API

**Key URLs:** https://solscan.io

**When to use:** Transaction exploration, token analytics, and account data. The most popular Solana explorer.

---

### Birdeye -- Price & Market Data

Birdeye provides real-time and historical price data, charts, and market analytics.

**When to use:** When your app needs token prices, charts, OHLCV data, or market cap information.

**Key URLs:**
- App: https://birdeye.so
- Docs: https://docs.birdeye.so

---

### Shyft -- RPC & Data API

**Key URLs:** https://shyft.to

**When to use:** Combined RPC and parsed data APIs, good for rapid prototyping.

---

## Wallet SDKs

### Solana Wallet Adapter -- Standard Multi-Wallet Integration

The official wallet integration library for Solana dApps. Supports 20+ wallets out of the box.

**When to use:** Default choice for any React-based Solana dApp. Provides a standard interface across all major wallets.

**npm packages:**
- `@solana/wallet-adapter-base` -- core interfaces
- `@solana/wallet-adapter-react` -- React hooks (useWallet, useConnection)
- `@solana/wallet-adapter-react-ui` -- pre-built UI components (WalletMultiButton)
- `@solana/wallet-adapter-wallets` -- wallet adapters

**Key URLs:**
- Docs: https://solana.com/developers/guides/wallets/add-solana-wallet-adapter-to-nextjs
- GitHub: https://github.com/anza-xyz/wallet-adapter

```typescript
// Example: Basic wallet adapter setup
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider, WalletMultiButton } from "@solana/wallet-adapter-react-ui";

function App() {
  return (
    <ConnectionProvider endpoint={rpcUrl}>
      <WalletProvider wallets={[]} autoConnect>
        <WalletModalProvider>
          <WalletMultiButton />
          {/* Your app */}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
```

---

### Privy -- Embedded Wallets & Social Login

Privy provides embedded wallets with social login (email, Google, Twitter), eliminating the need for users to have a wallet extension.

**When to use:** Consumer apps targeting non-crypto-native users. Best for onboarding flows where wallet friction would lose users.

**Key URLs:**
- Docs: https://docs.privy.io
- GitHub: https://github.com/privy-io

**npm packages:**
- `@privy-io/react-auth` -- React SDK
- `@privy-io/server-auth` -- server-side verification

---

### Dynamic -- Embedded Wallets, Social Login, Server Wallets

Dynamic provides embedded MPC wallets, social login, and multi-chain auth (Solana + EVM + Bitcoin) with a drop-in React widget, Expo/React Native support, a framework-agnostic JS client, and a Node SDK for backend/server-wallet flows (gas sponsorship, programmatic signing).

**When to use:**
- Consumer or prosumer apps that need email/SMS/social sign-in with zero-extension wallets on Solana
- Multi-chain products that need a single auth + wallet layer across EVM and Solana
- Backends or Telegram bots that need server-side Solana signing via MPC
- Agent use-cases where each user/agent gets a programmatically-controlled wallet

**Key URLs:**
- Docs: https://www.dynamic.xyz/docs
- Solana React quickstart: https://www.dynamic.xyz/docs/react/wallets/using-wallets/solana/solana-wallets
- Node SVM overview: https://www.dynamic.xyz/docs/node/svm/overview
- React Native Solana: https://www.dynamic.xyz/docs/react-native/wallets/using-wallets/solana/solana-wallets
- JS SDK Solana: https://www.dynamic.xyz/docs/javascript/reference/solana/adding-solana-extensions
- Anchor recipe: https://www.dynamic.xyz/docs/recipes/frameworks/anchor
- Dashboard (get Environment ID): https://app.dynamic.xyz/dashboard/developer
- MCP: `claude mcp add dynamic --transport http https://www.dynamic.xyz/docs/mcp`
- GitHub (templates + examples): https://github.com/dynamic-labs-oss
- llms.txt: https://www.dynamic.xyz/docs/llms.txt

**npm packages (Solana-relevant):**
- `@dynamic-labs/sdk-react-core` -- core React / Next.js SDK (UI widget, providers, hooks)
- `@dynamic-labs/solana` -- Solana connector for the React SDK (SVM wallets, signing, RPC)
- `@dynamic-labs/react-native-extension` -- Expo / React Native extension
- `@dynamic-labs/client` -- framework-agnostic vanilla JS client
- `@dynamic-labs/solana-extension` -- Solana extension for the JS client
- `@dynamic-labs/react-hooks` -- React hooks layer over the client SDK
- `@dynamic-labs-wallet/node` -- Node.js core server SDK
- `@dynamic-labs-wallet/node-svm` -- Node.js Solana server-wallet SDK (signing, gas sponsorship)
- `@dynamic-labs/wallet-connect` -- WalletConnect connector
- `@dynamic-labs/multi-wallet` -- multi-wallet signing / verification utilities

**Scaffold:** `npx create-dynamic-app@latest`

**Minimal React + Solana:**
```tsx
// app/providers.tsx
import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";
import { SolanaWalletConnectors } from "@dynamic-labs/solana";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <DynamicContextProvider
      settings={{
        environmentId: process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID!,
        walletConnectors: [SolanaWalletConnectors],
      }}
    >
      {children}
    </DynamicContextProvider>
  );
}
```

**Server wallet (Node SVM):**
```ts
import { createDynamicWalletClient } from "@dynamic-labs-wallet/node";
import { solana } from "@dynamic-labs-wallet/node-svm";

const client = createDynamicWalletClient({
  environmentId: process.env.DYNAMIC_ENVIRONMENT_ID!,
  apiToken: process.env.DYNAMIC_API_TOKEN!,
  extensions: [solana()],
});
// Use client.solana.signTransaction(...) from your backend
```

**Templates (community/):** `solana-nextjs-dynamic`, `solana-react-dynamic`, `solana-react-native-dynamic`, `solana-node-dynamic`.

---

### Phantom SDK -- Direct Phantom Integration

Direct integration with Phantom, the most popular Solana wallet.

**When to use:** When you only need Phantom support or want Phantom-specific features (in-app browser, deeplinks).

**Key URLs:** https://docs.phantom.app

---

### Unified Wallet Kit (Jupiter) -- Opinionated Wallet Modal

Jupiter's wallet adapter wrapper with an opinionated, polished UI.

**When to use:** When you want a beautiful wallet modal with minimal configuration. Drop-in replacement for wallet-adapter-react-ui.

**Key URLs:** https://unified.jup.ag

**npm packages:**
- `@jup-ag/wallet-adapter` -- unified wallet adapter

---

## Developer Tools

### Anchor -- Rust Framework for Solana Programs

Anchor is the standard framework for writing Solana programs in Rust. Provides account serialization, instruction dispatch, and security macros.

**When to use:** Every Solana program should use Anchor unless you have a specific reason for raw Solana SDK (e.g., extreme CU optimization).

**Key URLs:**
- Docs: https://www.anchor-lang.com
- Book: https://book.anchor-lang.com
- GitHub: https://github.com/solana-foundation/anchor

**Install:** `cargo install avm --git https://github.com/solana-foundation/anchor --locked && avm update`

**npm packages:**
- `@coral-xyz/anchor` -- TypeScript client for Anchor programs

```rust
// Example: Anchor program
use anchor_lang::prelude::*;

#[program]
pub mod my_program {
    use super::*;
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        ctx.accounts.my_account.data = 0;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = signer, space = 8 + 8)]
    pub my_account: Account<'info, MyAccount>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct MyAccount {
    pub data: u64,
}
```

---

### Solana Agent Kit (SendAI) -- AI Agent Toolkit

A toolkit that enables AI agents to perform on-chain Solana actions (swap, transfer, deploy tokens, etc.).

**When to use:** When building AI agents, chatbots, or autonomous systems that need to interact with Solana.

**Key URLs:**
- GitHub: https://github.com/sendaifun/solana-agent-kit
- Docs: https://docs.sendai.fun

**npm packages:**
- `solana-agent-kit` -- core toolkit

---

### On-Chain Automation (Evolving Space)

> **Note:** On-chain automation on Solana is an evolving space. [Tuk Tuk](https://github.com/clockwork-xyz/tuktuk) provides cron-style scheduled transactions. Other alternatives include custom keeper networks and Jito bundles for MEV-driven automation. Evaluate current options carefully before committing to an approach.

---

### Squads -- Multisig

Squads provides multi-signature wallets for program upgrade authority, treasury management, and team operations.

**When to use:** Every production program should use Squads for upgrade authority. Required for security-conscious deployments.

**Key URLs:**
- App: https://squads.so
- Docs: https://docs.squads.so
- GitHub: https://github.com/Squads-Protocol

**npm packages:**
- `@sqds/multisig` -- TypeScript SDK

---

### Switchboard -- Oracles

Switchboard provides oracle services for bringing off-chain data on-chain (price feeds, randomness, custom data).

**When to use:** When your program needs external data (asset prices, sports scores, randomness for gaming).

**Key URLs:**
- Docs: https://docs.switchboard.xyz
- GitHub: https://github.com/switchboard-xyz

**npm packages:**
- `@switchboard-xyz/on-demand` -- Solana SDK (v3)

---

### Doppler -- Ultra-Optimized Oracle (Blueshift)

An oracle program achieving just 21 Compute Units per update — the most efficient oracle on Solana. Supports generic payloads, sequence-based replay protection, and zero external dependencies.

**When to use:** High-frequency price feeds, custom data oracles, or any use case where oracle CU cost matters.

**Key URLs:**
- GitHub: https://github.com/blueshift-gg/doppler

**Rust crate:**
- `doppler-sdk` — Oracle SDK for building and submitting updates

---

### SBPF -- sBPF Assembly Toolchain (Blueshift)

CLI tool to scaffold, build, debug, and deploy sBPF assembly programs. Includes a disassembler (ELF → assembly), interactive REPL debugger, and test framework integration (Mollusk or TypeScript).

**When to use:** Writing hand-optimized sBPF assembly programs for maximum performance. Also useful for inspecting compiled program binaries.

**Key URLs:**
- GitHub: https://github.com/blueshift-gg/sbpf
- Linker: https://github.com/blueshift-gg/sbpf-linker

**Install:**
- `cargo install sbpf` — CLI tool
- `cargo install sbpf-linker` — Relinks BPF binaries into SBPF V0 format

---

### Kora -- Gasless Transactions (Solana Foundation)

Kora is a production-ready signing infrastructure that enables gasless transactions on Solana. Users can pay fees in any token (USDC, BONK, or custom tokens) instead of requiring SOL. Provides a JSON-RPC API, TypeScript SDK, and Rust library with secure key management, rate limiting, and validation rules.

**When to use:** Consumer apps where users shouldn't need SOL for gas. Any app that wants to abstract away transaction fees.

**Key URLs:**
- GitHub: https://github.com/solana-foundation/kora

**npm packages:**
- `@solana-foundation/kora` -- TypeScript SDK

---

### MPP SDK -- Machine Payments Protocol (Solana Foundation)

The MPP SDK implements the Machine Payments Protocol, enabling HTTP APIs to accept payments through the `402 Payment Required` flow. Supports native SOL and SPL token transfers with fee sponsorship, split payments, and transaction simulation.

**When to use:** Building paid APIs, metered services, or any HTTP endpoint that accepts crypto payments.

**Key URLs:**
- GitHub: https://github.com/solana-foundation/mpp-sdk

**npm packages:**
- `@solana-foundation/mpp-sdk` -- TypeScript SDK

---

### Commerce Kit -- E-Commerce SDK (Solana Foundation)

A comprehensive TypeScript SDK for building e-commerce on Solana. Provides payment primitives, React components, and checkout flows built on `@solana/kit` and Wallet Standard.

**When to use:** Any app that needs payment flows — tips, purchases, cart checkout, merchant integration.

**Key URLs:**
- GitHub: https://github.com/solana-foundation/commerce-kit

**npm packages:**
- `@solana-commerce/kit` -- all-in-one SDK
- `@solana-commerce/react` -- React UI components (payment buttons, checkout)
- `@solana-commerce/headless` -- framework-agnostic commerce logic
- `@solana-commerce/connector` -- wallet connection

---

### Token Helpers (Solana Foundation)

Utility library that simplifies token account creation across SPL Token, Token-2022, and Token-ACL. Auto-detects mint types and handles program-specific logic.

**When to use:** Any time you need to create associated token accounts. Replaces manual instruction building with one-liners.

**Key URLs:**
- GitHub: https://github.com/solana-foundation/token-helpers

**npm packages:**
- `@solana/token-helpers`

---

## Token Standards

### SPL Token -- Original Token Standard

The original Solana token standard. Simple, battle-tested, and universally supported.

| Feature | Support |
|---------|---------|
| Mint/Burn | Yes |
| Transfer | Yes |
| Freeze | Yes |
| Decimals | 0-9 |
| Multisig authority | Yes |

**When to use:** Simple fungible tokens, basic NFTs (via Metaplex on top), any token that does not need Token-2022 extensions.

**Program ID:** `TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA`

**npm packages:**
- `@solana/spl-token` -- TypeScript client

---

### Token-2022 -- Extended Token Standard

Token-2022 (Token Extensions) adds powerful new features to the SPL Token standard.

| Extension | Description |
|-----------|-------------|
| Transfer Fees | Automatic fee on every transfer (royalties, protocol fees) |
| Confidential Transfers | Zero-knowledge encrypted transfer amounts |
| Transfer Hooks | Custom CPI on every transfer (compliance, custom logic) |
| Permanent Delegate | Authority that can always transfer/burn (regulatory compliance) |
| Interest-Bearing | Display balance with accrued interest |
| Non-Transferable | Soulbound tokens |
| Default Account State | New token accounts start frozen |
| CPI Guard | Prevent CPI-initiated approvals |
| Metadata | On-chain metadata without Metaplex |
| Group / Member | Token groups for collections |

**When to use:** When you need any of the above extensions. Transfer fees are popular for protocol revenue. Transfer hooks enable programmable compliance. Confidential transfers for privacy.

**Program ID:** `TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb`

**npm packages:**
- `@solana/spl-token` -- same package, different program ID

```typescript
// Example: Create a Token-2022 mint with transfer fee
import { createInitializeTransferFeeConfigInstruction, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";

const transferFeeConfigAuthority = payer.publicKey;
const withdrawWithheldAuthority = payer.publicKey;
const feeBasisPoints = 100; // 1%
const maxFee = BigInt(1_000_000); // max fee cap

const ix = createInitializeTransferFeeConfigInstruction(
  mint,
  transferFeeConfigAuthority,
  withdrawWithheldAuthority,
  feeBasisPoints,
  maxFee,
  TOKEN_2022_PROGRAM_ID
);
```

---

## Decision Quick Reference

| Need | Use |
|------|-----|
| Swap tokens | Jupiter |
| Create liquidity pool | Orca Whirlpools or Raydium |
| Perps / derivatives | Jupiter Perpetual Exchange (Drift is defunct — exploited April 2026) |
| Lending / borrowing | Kamino or Marginfi |
| Liquid staking | Marinade (mSOL) or Jito (jitoSOL) |
| NFT minting | Metaplex (Bubblegum for scale, Core for new projects) |
| NFT trading | Magic Eden |
| RPC (default) | Helius |
| RPC (lowest latency) | Triton |
| Data streaming | Triton Yellowstone gRPC or QuickNode Streams |
| Wallet (React) | Solana Wallet Adapter |
| Wallet (consumer app) | Privy or Dynamic |
| Wallet (multi-chain auth, EVM + Solana) | Dynamic |
| Wallet (Expo / React Native embedded) | Dynamic (`@dynamic-labs/react-native-extension`) |
| Server wallet / gasless on Solana (Node) | Dynamic (`@dynamic-labs-wallet/node-svm`) |
| Program framework | Anchor |
| Program authority | Squads multisig |
| Oracle data | Switchboard or Doppler (21 CU) |
| sBPF assembly tooling | sbpf (Blueshift) |
| AI agents | Solana Agent Kit |
| Gasless transactions | Kora (Solana Foundation) |
| Paid API / 402 flow | MPP SDK (Solana Foundation) |
| E-commerce / payments | Commerce Kit (Solana Foundation) |
| Token account creation | @solana/token-helpers |
| Token (simple) | SPL Token |
| Token (advanced) | Token-2022 |
