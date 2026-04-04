# Dev Environment Setup

Get your local environment ready before writing code.

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | 18+ | `nvm install 18` |
| Rust | latest stable | `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs \| sh` |
| Solana CLI | 2.x+ | `sh -c "$(curl -sSfL https://release.anza.xyz/stable/install)"` |
| Anchor | 0.30+ (1.0.0-rc available) | `cargo install --git https://github.com/solana-foundation/anchor avm --force && avm install latest && avm use latest` |

**Skill:** `compatibility-matrix` (official) — check exact version requirements for your stack

## Local Testing Environment

### Option A: Surfpool (recommended)

Drop-in replacement for `solana-test-validator` with sub-second startup and mainnet state cloning.

```bash
# macOS
brew install txtx/taps/surfpool

# Start local network
surfpool start
```

**Skills:** `surfpool` (official), `surfpool-cheatcodes` (official)

### Option B: solana-test-validator (standard)

```bash
solana-test-validator
# In another terminal:
solana config set --url localhost
```

## Devnet SOL

```bash
solana airdrop 5 --url devnet
# Or use the faucet: https://faucet.solana.com
```

## Environment Variables

Create `.env` in your project root:

```bash
# RPC (use Helius for production, devnet for development)
SOLANA_RPC_URL=https://api.devnet.solana.com
# HELIUS_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY

# Wallet (for backend/agent projects)
# PRIVATE_KEY=your-base58-private-key

# Colosseum Copilot (for competitive research)
# COLOSSEUM_COPILOT_PAT=your-copilot-token
```

## Verify Setup

```bash
solana --version          # Should show 2.x+
anchor --version          # Should show 0.30+
node --version            # Should show 18+
solana config get         # Check RPC URL
solana balance            # Check devnet balance
```

## MCPs for Development

Configure in `.claude/settings.json`:

```json
{
  "mcpServers": {
    "helius": { "command": "npx", "args": ["helius-mcp@latest"] },
    "solana-fender": { "command": "cargo", "args": ["run", "--release"] }
  }
}
```

**MCPs:** `helius-mcp` (wallet data, transactions), `solana-fender-mcp` (program analysis)
