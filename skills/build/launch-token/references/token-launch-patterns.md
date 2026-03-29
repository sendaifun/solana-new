# Token Launch Patterns

Patterns for launching tokens on Solana. Choose the right path based on your token type and goals.

## Launch Mechanisms

### 1. Pump.fun Bonding Curve

Best for: memecoins, community tokens, rapid launches.

Pump.fun uses a bonding curve where the token price increases as supply is purchased. When the market cap hits the graduation threshold (~$69k), liquidity migrates to Raydium automatically.

```typescript
// Using the PumpFun SDK (via pumpfun-skill)
import { PumpFunSDK } from "pumpdotfun-sdk";

const sdk = new PumpFunSDK(provider);

// Create and buy in one transaction
const createResults = await sdk.createAndBuy(
  creator,            // Keypair
  mintKeypair,        // New mint keypair
  {
    name: "My Token",
    symbol: "MYTKN",
    description: "A cool token",
    file: imageBlob,  // Token image (required)
  },
  buyAmountSol,       // Initial buy in SOL (creates demand)
  slippageBps,        // e.g., 500 = 5%
  { unitLimit: 250000, unitPrice: 250000 }  // Priority fees
);
```

**How the bonding curve works:**
- Virtual reserves start at ~30 SOL / 1B tokens
- Price = virtual_sol_reserves / virtual_token_reserves
- As people buy, price rises along the curve
- At ~$69k market cap, 12k SOL of liquidity migrates to Raydium
- After graduation, the token trades on open DEX markets

**Skills:** `pumpfun-skill` (bonding curve, trading, PumpSwap)
**Skills:** `clawpump-skill` (gasless launches, dev buys)
**MCPs:** `metaplex-genesis-mcp` (bonding curves, swap quotes)

### 2. SPL Token Direct Mint

Best for: utility tokens, governance tokens, project-controlled supply.

```typescript
import { createMint, mintTo, getOrCreateAssociatedTokenAccount } from "@solana/spl-token";

// Create the mint
const mint = await createMint(
  connection,
  payer,
  mintAuthority.publicKey, // Who can mint
  freezeAuthority.publicKey, // Who can freeze (null to disable)
  9 // Decimals (9 is standard for SOL ecosystem)
);

// Create ATA and mint initial supply
const ata = await getOrCreateAssociatedTokenAccount(
  connection, payer, mint, recipient.publicKey
);
await mintTo(connection, payer, mint, ata.address, mintAuthority, 1_000_000_000 * 10**9);
```

### 3. Token-2022 with Extensions

Best for: regulated tokens, RWAs, tokens needing transfer hooks, confidential transfers, or metadata.

```typescript
import {
  ExtensionType, createInitializeMintInstruction,
  createInitializeMetadataPointerInstruction,
  createInitializeTransferHookInstruction,
  TOKEN_2022_PROGRAM_ID, getMintLen,
} from "@solana/spl-token";

// Calculate space needed for extensions
const extensions = [ExtensionType.MetadataPointer, ExtensionType.TransferHook];
const mintLen = getMintLen(extensions);
const lamports = await connection.getMinimumBalanceForRentExemption(mintLen);

// Build transaction with extension initialization
const tx = new Transaction().add(
  SystemProgram.createAccount({
    fromPubkey: payer.publicKey,
    newAccountPubkey: mint.publicKey,
    space: mintLen,
    lamports,
    programId: TOKEN_2022_PROGRAM_ID,
  }),
  createInitializeMetadataPointerInstruction(mint.publicKey, authority, metadataAddress, TOKEN_2022_PROGRAM_ID),
  createInitializeTransferHookInstruction(mint.publicKey, authority, hookProgramId, TOKEN_2022_PROGRAM_ID),
  createInitializeMintInstruction(mint.publicKey, 9, mintAuthority, freezeAuthority, TOKEN_2022_PROGRAM_ID),
);
```

**Repos:** `mosaic` (Token-2022 tokenization engine for stablecoins, RWAs, arcade tokens)
**Skills:** `confidential-transfers` (official — encrypted balances)

### 4. Raydium LP Launch

Best for: tokens that skip bonding curves and launch directly with liquidity on Raydium.

```typescript
// Create a constant product pool on Raydium
// Use raydium-skill for SDK guidance
// Steps:
// 1. Create mint + mint total supply
// 2. Create Raydium CP pool with token + SOL liquidity
// 3. Optionally burn LP tokens to lock liquidity
```

**Skills:** `raydium-skill` (CLMM, CPMM pools, farming, Trade API)
**Repos:** `raydium-cp-swap` (constant product AMM with Token-2022 support)

## Adding Metadata

Tokens without metadata are invisible in wallets and explorers. Two approaches:

### Metaplex Token Metadata (SPL Token)

```typescript
import { createV1 } from "@metaplex-foundation/mpl-token-metadata";
// Upload image to Arweave/IPFS, create JSON metadata, then:
await createV1(umi, { mint, name: "My Token", symbol: "MYTKN", uri: metadataUri }).sendAndConfirm(umi);
```

### Token-2022 On-Chain Metadata (no Metaplex needed)

```typescript
import { createInitializeInstruction } from "@solana/spl-token-metadata";
// Metadata lives directly in the mint account — no separate Metaplex account needed
```

**Skills:** `metaplex-skill` (official — Core NFTs, Token Metadata, Bubblegum, Candy Machine)

## Authority Management

| Authority | What it controls | When to revoke |
|-----------|-----------------|----------------|
| Mint Authority | Creating new tokens | After total supply is minted (prevents inflation) |
| Freeze Authority | Freezing token accounts | If you never need to freeze (builds trust) |
| Update Authority | Changing metadata | After metadata is finalized |

**WARNING:** Revoking authorities is irreversible. Triple-check before executing.

```typescript
import { setAuthority, AuthorityType } from "@solana/spl-token";
await setAuthority(connection, payer, mint, currentAuthority, AuthorityType.MintTokens, null);
```

## Safety Checks Before Launch

Use these MCPs to verify your token doesn't trigger safety warnings:

- `rug-check-mcp` — Detect potential rug-pull risks
- `aethercore-token-rugcheck` — Three-layer safety audit (machine + LLM + on-chain evidence)

**Skills:** `vulnhunter-skill` (security vulnerability detection)
