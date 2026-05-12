# RPC & Wallet Setup Guide

Shared reference for all superstack skills.

## RPC Setup (do this first)

### Development (devnet)
```bash
# Option A: Free public devnet (no signup)
solana config set --url https://api.devnet.solana.com

# Option B: Helius devnet (faster, more reliable)
# Sign up at helius.dev → get API key → use:
solana config set --url "https://devnet.helius-rpc.com/?api-key=YOUR_KEY"

# Option C: Alchemy devnet (multi-chain, Prices API, Gas Manager, Webhooks, gRPC)
# Sign up at dashboard.alchemy.com → create app → copy API key → use:
solana config set --url "https://solana-devnet.g.alchemy.com/v2/YOUR_KEY"

# Add to .env
echo 'SOLANA_RPC_URL=https://api.devnet.solana.com' >> .env
echo 'HELIUS_API_KEY=your-key-here' >> .env
echo 'ALCHEMY_API_KEY=your-key-here' >> .env
```

### Production (mainnet)
```bash
# NEVER use public RPC for production. Pick a provider:

# Option A: Helius
# 1. Go to helius.dev → create account (free tier: 100k credits/day)
# 2. Copy your API key
solana config set --url "https://mainnet.helius-rpc.com/?api-key=YOUR_KEY"

# Option B: Alchemy
# 1. Go to dashboard.alchemy.com → create app on Solana Mainnet
# 2. Copy your API key
solana config set --url "https://solana-mainnet.g.alchemy.com/v2/YOUR_KEY"

# Add to .env (NEVER commit this file)
echo 'HELIUS_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY' >> .env
echo 'ALCHEMY_RPC_URL=https://solana-mainnet.g.alchemy.com/v2/YOUR_KEY' >> .env
echo '.env' >> .gitignore
```

### Verify RPC is working
```bash
solana cluster-version          # Should show version
solana balance                  # Should show SOL balance
solana slot                     # Should show current slot number
```

## Wallet Setup

### For development (devnet)
```bash
# Create a dev keypair (if you don't have one)
solana-keygen new --outfile ~/.config/solana/devnet.json --no-bip39-passphrase
solana config set --keypair ~/.config/solana/devnet.json

# Fund it with devnet SOL
solana airdrop 5
solana balance  # Should show 5 SOL
```

### For production (mainnet)
```bash
# Create a dedicated deploy keypair (DO NOT reuse your dev keypair)
solana-keygen new --outfile ~/.config/solana/mainnet-deploy.json
solana config set --keypair ~/.config/solana/mainnet-deploy.json

# Fund from your wallet (Phantom, etc.)
# Copy the pubkey: solana address
# Send SOL to that address from your wallet

# Verify balance (need ~5 SOL for most program deployments)
solana balance
```

### For multisig (high-value programs)
```bash
# Use Squads for multisig authority
# 1. Go to app.squads.so
# 2. Create a new multisig with your team members
# 3. Set the multisig as program upgrade authority:
solana program set-upgrade-authority <PROGRAM_ID> --new-upgrade-authority <SQUADS_MULTISIG_ADDRESS>
```

## Environment Variables Pattern

Every project should have a `.env` file (never committed):
```bash
# .env — copy from .env.example and fill in values
SOLANA_RPC_URL=https://api.devnet.solana.com
HELIUS_RPC_URL=https://devnet.helius-rpc.com/?api-key=YOUR_KEY
HELIUS_API_KEY=your-key-here
ALCHEMY_RPC_URL=https://solana-devnet.g.alchemy.com/v2/YOUR_KEY
ALCHEMY_API_KEY=your-key-here

# Wallet (for scripts/bots only — never store mainnet keys in .env for production)
WALLET_PRIVATE_KEY=[]  # Only for devnet testing scripts
```

Create `.env.example` (committed to git):
```bash
# .env.example
SOLANA_RPC_URL=https://api.devnet.solana.com
HELIUS_RPC_URL=
HELIUS_API_KEY=
ALCHEMY_RPC_URL=
ALCHEMY_API_KEY=
```

## Quick Reference: Which RPC for What

| Use case | RPC | Why |
|----------|-----|-----|
| Dev/testing | `api.devnet.solana.com` | Free, no signup |
| Production app | Helius or Alchemy | Both reliable; pick by which extras you need |
| Compressed NFTs / DAS | Helius (any tier) | Only provider with public DAS API |
| Real-time webhooks | Helius webhooks or Alchemy Webhooks | Both supported on Solana |
| Geyser / gRPC streaming | Helius LaserStream or Alchemy gRPC (Yellowstone) | Both supported on Solana |
| Token prices | Alchemy Prices API | Live on Solana (Token / NFT / Transfers / Portfolio APIs are EVM-only today) |
| Sponsored / abstracted fees | Alchemy Gas Manager | Live on Solana |
| Multi-chain app (Solana + EVM) | Alchemy | Single provider across 100+ chains |
| High-volume trading | Triton ($500+/mo) | Dedicated nodes, lowest latency |

## Quick Reference: Which Wallet for What

| Use case | SDK | Install |
|----------|-----|---------|
| Web dApp, crypto users | `@solana/wallet-adapter-react` | `npm i @solana/wallet-adapter-react @solana/wallet-adapter-react-ui @solana/wallet-adapter-wallets` |
| Web dApp, social login | `@privy-io/react-auth` | `npm i @privy-io/react-auth` |
| Phantom only | `@phantom/browser-sdk` | `npm i @phantom/browser-sdk` |
| AI Agent / Bot | `@solana/kit` Keypair | `npm i @solana/kit` |
| Agent + persistence | Privy server wallet | `npm i @privy-io/server-auth` |
| Mobile (React Native) | Mobile Wallet Adapter | `npm i @solana-mobile/mobile-wallet-adapter-protocol` |
