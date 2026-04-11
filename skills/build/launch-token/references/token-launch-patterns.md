# Token Launch Patterns

Patterns for launching tokens on Solana. Choose the right path based on your token type and goals.

## Launch Mechanisms

### 1. Pump.fun Bonding Curve

Best for: memecoins, community tokens, rapid launches with minimal custom infrastructure.

Pump uses a bonding curve to make newly created SPL coins immediately tradable without pre-seeding external liquidity. When the curve completes and the token reaches Pump’s completion/graduation condition, liquidity can be migrated to PumpSwap. In the current Pump program docs, migration is permissionless via `migrate(user, mint)`.

```typescript
// Current Pump SDK shape
import { PumpSdk, getBuyTokenAmountFromSolAmount } from "@pump-fun/pump-sdk";
import { Connection, PublicKey } from "@solana/web3.js";
import BN from "bn.js";

const connection = new Connection("https://api.devnet.solana.com", "confirmed");
const sdk = new PumpSdk(connection);

const global = await sdk.fetchGlobal();
const solAmount = new BN(0.1 * 10 ** 9);

const instructions = await sdk.createAndBuyInstructions({
  global,
  mint,
  name: "My Token",
  symbol: "MYTKN",
  uri: metadataUri,
  creator,
  user,
  solAmount,
  amount: getBuyTokenAmountFromSolAmount(global, null, solAmount),
});
```

**How it works:**
- The token is created on Pump with a bonding curve
- Buyers move the token along the curve as they buy
- When the curve completes, liquidity can be migrated to PumpSwap
- Migration is permissionless in the current Pump program design
- Current Pump docs also require extra care around creator-fee / reward-sharing configuration: reward distribution can be configured only once, becomes locked after the first configuration, and older authority transfer/revoke flows are no longer supported
- Avoid hardcoding graduation thresholds in user guidance unless you are citing current Pump docs directly

**Skills:** `pumpfun-skill` (bonding curve, trading, PumpSwap)
**Skills:** `clawpump-skill` (gasless launches, dev buys)
**MCPs:** `metaplex-genesis-mcp` (bonding curves, swap quotes)

### 2. Meteora DBC

Best for: teams that want a more configurable launch than Pump.fun, with structured curve design and automatic graduation into Meteora liquidity.

Meteora DBC (Dynamic Bonding Curve) is a permissionless token launch protocol. It uses a configurable multi-segment bonding curve to sell tokens until a migration threshold is hit, then graduates the token into a Meteora DAMM v1 or DAMM v2 liquidity pool.

**What makes DBC different:**
- configurable launch curve instead of a single fixed launch shape
- support for up to 16 price-liquidity points / segments
- graduation into DAMM v1 or DAMM v2 liquidity
- support for SPL Token and Token-2022 launches
- support for both fixed-supply and dynamic-supply launch models
- richer creator / partner configuration around fees, migration, and post-launch liquidity

**How the DBC flow works:**
1. Create a config key that defines the curve, fees, migration parameters, and launch behavior
2. Create the virtual pool and start trading
3. Buyers move the token through the configured curve
4. When the migration threshold is hit, the token graduates to DAMM v1 or DAMM v2
5. Creator / partner liquidity and post-migration distribution rules take effect

**Curve design notes:**
- DBC supports up to 16 segments / price-liquidity points
- steeper segments create faster price movement
- flatter segments require more capital to move price
- use DBC when the launch needs deliberate curve-shaping, not just a default meme-coin launch path

**Supply model choices:**
- **Dynamic supply**: tokens are minted as they are bought
- **Fixed supply**: tokens are pre-minted, and leftover inventory can be handled explicitly after migration

**Migration notes:**
- DBC can graduate automatically when the migration threshold is reached
- Meteora docs also describe manual migration flows and quick-launch tooling
- if you use DBC, document clearly:
  - migration target (DAMM v1 vs DAMM v2)
  - threshold assumptions
  - LP distribution / vesting behavior after migration

**Use DBC when:**
- you want more launch configurability than Pump.fun
- you want Meteora-native post-launch liquidity
- you want fixed-supply or dynamic-supply launch control
- you want a launchpad-style token launch without writing a custom bonding-curve program

### 3. SPL Token Direct Mint

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
await mintTo(connection, payer, mint, ata.address, mintAuthority, 1_000_000_000n * 10n ** 9n);
```

### 4. Token-2022 with Extensions

Best for: regulated tokens, RWAs, and tokens needing advanced extensions such as transfer fees, transfer hooks, metadata pointers, confidential transfers, or other Token-2022 controls.

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

```bash
spl-token --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb create-token \
  --transfer-fee-basis-points 100 \
  --transfer-fee-maximum-fee 1000000
```

**Repos:** `mosaic` (Token-2022 tokenization engine for stablecoins, RWAs, arcade tokens)
**Skills:** `confidential-transfers` (official — encrypted balances)

### 5. Raydium LP Launch

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

## Sources

- [Pump Public Docs — Pump Program README](https://github.com/pump-fun/pump-public-docs)
- [Pump SDK](https://www.npmjs.com/package/@pump-fun/pump-sdk)
- [Meteora DBC — What is DBC?](https://docs.meteora.ag/overview/products/dbc/what-is-dbc)
- [Meteora DBC — DBC Flow](https://docs.meteora.ag/overview/products/dbc/dbc-flow)
- [Meteora DBC — Curve Configuration](https://docs.meteora.ag/overview/products/dbc/curve-configuration)
- [Meteora DBC — Migration](https://docs.meteora.ag/overview/products/dbc/migration)
- [Meteora DBC — DBC Token Launch Pool](https://docs.meteora.ag/developer-guide/quick-launch/dbc-token-launch-pool)
- [Solana Token Extensions](https://solana.com/docs/tokens/extensions)
- [Solana Token Metadata Extension](https://solana.com/docs/tokens/extensions/metadata)
