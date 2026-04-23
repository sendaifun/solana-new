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

# Add to .env
echo 'SOLANA_RPC_URL=https://api.devnet.solana.com' >> .env
echo 'HELIUS_API_KEY=your-key-here' >> .env
```

### Production (mainnet)
```bash
# NEVER use public RPC for production. Get a Helius key:
# 1. Go to helius.dev
# 2. Create account (free tier: 100k credits/day)
# 3. Copy your API key

solana config set --url "https://mainnet.helius-rpc.com/?api-key=YOUR_KEY"

# Add to .env (NEVER commit this file)
echo 'HELIUS_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY' >> .env
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

# Wallet (for scripts/bots only — never store mainnet keys in .env for production)
WALLET_PRIVATE_KEY=[]  # Only for devnet testing scripts
```

Create `.env.example` (committed to git):
```bash
# .env.example
SOLANA_RPC_URL=https://api.devnet.solana.com
HELIUS_RPC_URL=
HELIUS_API_KEY=
```

## Quick Reference: Which RPC for What

| Use case | RPC | Why |
|----------|-----|-----|
| Dev/testing | `api.devnet.solana.com` | Free, no signup |
| Production app | Helius ($49/mo) | Reliable, DAS API, webhooks |
| Compressed NFTs | Helius (any tier) | Only provider with DAS API |
| Real-time data | Helius webhooks | Native webhook support |
| High-volume trading | Triton ($500+/mo) | Dedicated nodes, lowest latency |

## Quick Reference: Which Wallet for What

| Use case | SDK | Install |
|----------|-----|---------|
| Web dApp, crypto users | `@solana/wallet-adapter-react` | `npm i @solana/wallet-adapter-react @solana/wallet-adapter-react-ui @solana/wallet-adapter-wallets` |
| Web dApp, social login | `@privy-io/react-auth` _or_ `@dynamic-labs/sdk-react-core` | `npm i @privy-io/react-auth` _or_ `npm i @dynamic-labs/sdk-react-core @dynamic-labs/solana` |
| Multi-chain auth (EVM + Solana) | `@dynamic-labs/sdk-react-core` + `@dynamic-labs/solana` | `npm i @dynamic-labs/sdk-react-core @dynamic-labs/solana` |
| Vanilla JS / non-React web | `@dynamic-labs/client` + `@dynamic-labs/solana-extension` | `npm i @dynamic-labs/client @dynamic-labs/solana-extension` |
| Phantom only | `@phantom/browser-sdk` | `npm i @phantom/browser-sdk` |
| AI Agent / Bot | `@solana/kit` Keypair | `npm i @solana/kit` |
| Agent + persistence | Privy server wallet _or_ Dynamic Node SVM | `npm i @privy-io/server-auth` _or_ `npm i @dynamic-labs-wallet/node @dynamic-labs-wallet/node-svm` |
| Server-side Solana signing / gasless relayer | `@dynamic-labs-wallet/node-svm` | `npm i @dynamic-labs-wallet/node @dynamic-labs-wallet/node-svm` |
| Mobile (React Native) | Mobile Wallet Adapter _or_ Dynamic RN | `npm i @solana-mobile/mobile-wallet-adapter-protocol` _or_ `npm i @dynamic-labs/sdk-react-core @dynamic-labs/solana @dynamic-labs/react-native-extension` |
| Embedded mobile wallet (Expo) | `@dynamic-labs/react-native-extension` | `npm i @dynamic-labs/sdk-react-core @dynamic-labs/solana @dynamic-labs/react-native-extension` |
