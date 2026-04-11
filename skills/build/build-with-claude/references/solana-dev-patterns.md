# Solana Dev Patterns

Common patterns for building on Solana. References point to skills and repos from the solana-new catalogs.

> **Key skill**: Install the official Solana dev skill for comprehensive reference:
> `npx skills add https://github.com/solana-foundation/solana-dev-skill`

## Connection & RPC

### @solana/kit (current standard)

```typescript
import { createSolanaRpc, address, lamports } from "@solana/kit";

const rpc = createSolanaRpc(process.env.HELIUS_RPC_URL || "https://api.devnet.solana.com");
const balance = await rpc.getBalance(address("your-pubkey")).send();
```

### Legacy @solana/web3.js v1 (existing codebases only)

```typescript
import { Connection, clusterApiUrl, PublicKey } from "@solana/web3.js";
const connection = new Connection(process.env.HELIUS_RPC_URL || clusterApiUrl("devnet"));
```

**Skills:** `kit` (official), `kit-web3-interop` (official), `solana-kit-skill` (community)
**MCPs:** `helius-mcp` (60+ tools including RPC)

- Use Helius RPC for production (rate limits, reliability, DAS API)
- Always default to devnet during development
- Store RPC URLs in `.env`, never hardcode

## Anchor Program Patterns

### Program setup

```rust
use anchor_lang::prelude::*;

declare_id!("your-program-id");

#[program]
pub mod my_program {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, data: u64) -> Result<()> {
        let account = &mut ctx.accounts.my_account;
        account.data = data;
        account.authority = ctx.accounts.authority.key();
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = authority, space = 8 + 8 + 32)]
    pub my_account: Account<'info, MyAccount>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct MyAccount {
    pub data: u64,
    pub authority: Pubkey,
}
```

### Client-side interaction

```typescript
import { Program, AnchorProvider } from "@coral-xyz/anchor";
import { IDL, MyProgram } from "./idl/my_program";

const provider = AnchorProvider.env();
const program = new Program<MyProgram>(IDL, provider);

// Call an instruction
await program.methods
  .initialize(new BN(42))
  .accounts({ myAccount: myAccountKeypair.publicKey })
  .signers([myAccountKeypair])
  .rpc();

// Fetch account data
const account = await program.account.myAccount.fetch(myAccountKeypair.publicKey);
```

**Skills:** `programs-anchor` (official), `solana-anchor-claude-skill` (community)
**Repos:** `anchor-by-example`, `program-examples`

## PDA Patterns

### Client-side derivation

```typescript
const [pda, bump] = PublicKey.findProgramAddressSync(
  [Buffer.from("user-profile"), userPubkey.toBuffer()],
  programId
);
```

### Program-side (Anchor)

```rust
#[derive(Accounts)]
pub struct CreateProfile<'info> {
    #[account(
        init,
        payer = user,
        space = 8 + 32 + 64,
        seeds = [b"user-profile", user.key().as_ref()],
        bump,
    )]
    pub profile: Account<'info, UserProfile>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}
```

### Design rules
- Include enough entropy in seeds to avoid collisions (user pubkey, mint address, etc.)
- Always save the bump in the account for later use: `seeds = [...], bump = profile.bump`
- Re-derive PDAs in every instruction — never trust the client
- For multi-tenant designs, include a unique identifier per tenant in seeds

## CPI Patterns (Cross-Program Invocation)

```rust
// Transfer SOL via CPI
let cpi_accounts = system_program::Transfer {
    from: ctx.accounts.user.to_account_info(),
    to: ctx.accounts.vault.to_account_info(),
};
let cpi_ctx = CpiContext::new(ctx.accounts.system_program.to_account_info(), cpi_accounts);
system_program::transfer(cpi_ctx, amount)?;

// CPI with PDA signer
let seeds = &[b"vault", &[ctx.accounts.vault.bump]];
let signer_seeds = &[&seeds[..]];
let cpi_ctx = CpiContext::new_with_signer(program, accounts, signer_seeds);
```

- Minimize PDA authority scope — don't give CPIs more power than needed
- Always verify the target program ID before invoking
- Use Anchor's `CpiContext` for type-safe cross-program calls

## Token Operations

### Create token mint + mint tokens

```typescript
import { createMint, mintTo, getOrCreateAssociatedTokenAccount } from "@solana/spl-token";

const mint = await createMint(connection, payer, mintAuthority, freezeAuthority, 9);
const ata = await getOrCreateAssociatedTokenAccount(connection, payer, mint, owner);
await mintTo(connection, payer, mint, ata.address, mintAuthority, 1_000_000_000);
```

### Transfer tokens

```typescript
import { transfer } from "@solana/spl-token";
await transfer(connection, payer, sourceATA, destATA, owner, amount);
```

- Always check token decimals before displaying amounts
- Create Associated Token Accounts (ATAs) — never raw token accounts
- For Token-2022 extensions: see `confidential-transfers` skill (official) and `mosaic` repo

**Skills:** `confidential-transfers` (official)
**Repos:** `mosaic` (Token-2022 engine)

## Jupiter Swap Integration

> **Note:** `quote-api.jup.ag/v6` is legacy. Current Jupiter docs center on the Swap API at `api.jup.ag/swap/v2`. New integrations should use `GET /swap/v2/order` and `POST /swap/v2/execute`, and include an `x-api-key` header. `swap/v1` may still respond, but it is no longer the primary docs path.

```typescript
const params = new URLSearchParams({
  inputMint,
  outputMint,
  amount: amount.toString(),
  taker: wallet.publicKey.toString(),
  slippageBps: "50",
});

const order = await fetch(`https://api.jup.ag/swap/v2/order?${params}`, {
  headers: {
    "x-api-key": process.env.JUP_API_KEY!,
  },
}).then((r) => r.json());

// Sign the returned base64 transaction, then POST the signed transaction
// plus `requestId` from /order to `https://api.jup.ag/swap/v2/execute`.
```

**Skills:** `jupiter-skill` (community)
**MCPs:** `dcspark-jupiter` (swap quotes + execution)
**Repos:** `jupiter-nextjs-example`

## Sources

- Jupiter developer docs: https://dev.jup.ag/docs/swap
- Jupiter API reference: https://dev.jup.ag/docs/api-reference/swap/order
- Jupiter API reference: https://dev.jup.ag/docs/api-reference/swap/execute

## Wallet Connection (Frontend)

```tsx
import { WalletProvider, ConnectionProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";

function App() {
  return (
    <ConnectionProvider endpoint={rpcUrl}>
      <WalletProvider wallets={[]} autoConnect>
        <WalletModalProvider>
          {/* Your app */}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
```

- Use Wallet Standard — pass `wallets={[]}` to auto-detect installed wallets
- Don't hardcode wallet adapters — the standard handles Phantom, Solflare, Backpack, etc.

**Skills:** `frontend-framework-kit` (official), `phantom-connect-skill` (community)

## Transaction Patterns

- **Versioned transactions**: Always use v0 for new code
- **Priority fees**: Add `ComputeBudgetProgram.setComputeUnitPrice()` for mainnet
- **Retry logic**: Transactions can fail silently — confirm with `confirmTransaction`
- **Simulation**: Always `simulateTransaction()` before sending on mainnet
- **Lookup tables**: Use for transactions with many accounts (>20)

## Common Gotchas

1. **Rent**: New accounts need minimum rent-exempt balance (~0.00089 SOL for 100 bytes)
2. **Account size**: Must be declared at creation, can't resize without `realloc`
3. **PDA derivation**: Seeds must match exactly between client and program
4. **Compute limits**: Default 200k CU per instruction — request more with `setComputeUnitLimit()`
5. **Blockhash expiry**: Recent blockhash expires after ~60 seconds — get fresh for retries
6. **ATA creation**: The first token transfer to an address requires creating the ATA (costs ~0.002 SOL)
7. **SOL wrapping**: DeFi protocols use wrapped SOL (WSOL) — wrap/unwrap for native SOL interactions
8. **Transaction size**: Max 1232 bytes — use lookup tables or split into multiple txs
9. **Commitment levels**: `confirmed` for speed, `finalized` for certainty — know which you need
