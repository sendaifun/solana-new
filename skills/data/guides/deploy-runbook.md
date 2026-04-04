# Deploy Runbook — Devnet to Mainnet

Step-by-step deployment commands. Referenced by `deploy-to-mainnet`, `scaffold-project`, and `build-with-claude` skills.

## Pre-requisites Check

```bash
# Verify tools are installed
solana --version       # Needs >= 1.18
anchor --version       # Needs >= 0.30 (if using Anchor)
node --version         # Needs >= 20
cargo --version        # Needs Rust toolchain

# If any are missing:
# Solana: sh -c "$(curl -sSfL https://release.anza.xyz/stable/install)"
# Anchor: cargo install --git https://github.com/coral-xyz/anchor anchor-cli
# Rust: curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

## Phase 1: Deploy to Devnet

### 1.1 Build the program
```bash
anchor build
# Verify build succeeded:
ls -la target/deploy/*.so  # Should show your program binary
```

### 1.2 Check program size
```bash
# Max program size: 10MB (upgradeable) or 10MB (non-upgradeable)
ls -la target/deploy/my_program.so | awk '{print $5/1024/1024 " MB"}'
```

### 1.3 Configure for devnet
```bash
solana config set --url https://api.devnet.solana.com
solana config set --keypair ~/.config/solana/devnet.json

# Fund deploy wallet
solana airdrop 5
solana balance  # Need ~3-5 SOL for most programs
```

### 1.4 Deploy
```bash
anchor deploy --provider.cluster devnet
# Or for native programs:
solana program deploy target/deploy/my_program.so

# Save the program ID!
echo "Program ID: $(solana address -k target/deploy/my_program-keypair.json)"
```

### 1.5 Verify deployment
```bash
# Check program exists and is executable
solana program show <PROGRAM_ID>

# Run a test transaction
anchor test --skip-local-validator --provider.cluster devnet
```

## Phase 2: Pre-Mainnet Checklist

Run through EVERY item before mainnet:

### 2.1 Security
```bash
# Check for exposed secrets
git log --all --full-history -p | grep -i "private\|secret\|key.*=.*[A-Za-z0-9]" | head -20
# If anything found: rotate keys immediately, use git-filter-repo to remove from history

# Check Anchor.toml isn't exposing keys
grep -i "wallet\|keypair" Anchor.toml

# Verify no devnet references in production code
grep -rn "devnet\|api.devnet" src/ app/ --include="*.ts" --include="*.tsx" --include="*.rs" | grep -v "test\|spec\|__test"
```

### 2.2 Program safety
```bash
# Verify all accounts have signer constraints where needed
grep -rn "pub.*AccountInfo" programs/ --include="*.rs" | grep -v "Signer\|#\[account"

# Check for unchecked arithmetic
grep -rn "\.checked_\|overflow\|saturating_" programs/ --include="*.rs" | wc -l
# If 0: you're probably missing overflow protection

# Verify PDA seeds match between code and tests
grep -rn "seeds\s*=" programs/ --include="*.rs"
```

### 2.3 Build verification
```bash
# Clean build to ensure reproducibility
anchor build -- --force
# Or: cargo build-sbf --force

# Get the build hash (save this for post-deploy verification)
sha256sum target/deploy/my_program.so
```

### 2.4 Upgrade authority decision
```bash
# Check current authority
solana program show <PROGRAM_ID> | grep "Authority"

# Options:
# A) Keep authority (can upgrade later)
# B) Transfer to multisig (recommended for >$10k TVL)
solana program set-upgrade-authority <PROGRAM_ID> --new-upgrade-authority <SQUADS_ADDRESS>
# C) Freeze program (immutable, can never upgrade)
solana program set-upgrade-authority <PROGRAM_ID> --final
```

## Phase 3: Deploy to Mainnet

### 3.1 Switch to mainnet
```bash
# Use a PAID RPC — never deploy via public RPC
solana config set --url "https://mainnet.helius-rpc.com/?api-key=YOUR_KEY"
solana config set --keypair ~/.config/solana/mainnet-deploy.json

# Verify you're on mainnet
solana cluster-version
solana balance  # Verify sufficient SOL (need ~5 SOL for most programs)
```

### 3.2 Deploy
```bash
# Deploy with explicit cluster to avoid accidents
anchor deploy --provider.cluster mainnet-beta

# Or for native programs:
solana program deploy target/deploy/my_program.so --url "https://mainnet.helius-rpc.com/?api-key=YOUR_KEY"
```

### 3.3 Post-deploy verification
```bash
# Verify program is live
solana program show <PROGRAM_ID> --url mainnet-beta

# Verify build hash matches
solana program dump <PROGRAM_ID> /tmp/deployed.so --url mainnet-beta
sha256sum /tmp/deployed.so
# Compare with: sha256sum target/deploy/my_program.so
# They MUST match

# Run a canary transaction (small, safe operation)
# Example: if your program has a "ping" or "initialize" instruction, call it
```

### 3.4 Update frontend
```bash
# Update program ID in frontend code
# Search for devnet program ID and replace with mainnet
grep -rn "DEVNET_PROGRAM_ID\|programId" src/ app/ --include="*.ts" --include="*.tsx"

# Update RPC endpoint
# .env.production should point to mainnet RPC
```

## Cost Reference

| Operation | Estimated SOL Cost |
|-----------|-------------------|
| Deploy small program (<100KB) | ~1-2 SOL |
| Deploy medium program (100-500KB) | ~3-5 SOL |
| Deploy large program (500KB-1MB) | ~5-10 SOL |
| Program upgrade | ~0.5-2 SOL |
| Create token mint | ~0.002 SOL |
| Create ATA | ~0.002 SOL |
| Simple transfer | ~0.000005 SOL |

## Rollback

If something goes wrong after mainnet deploy:

```bash
# If program is upgradeable, deploy the previous version:
anchor deploy --provider.cluster mainnet-beta --program-keypair target/deploy/my_program-keypair.json

# If program is frozen: you cannot rollback. This is why we recommend keeping upgrade authority for the first few months.
```
