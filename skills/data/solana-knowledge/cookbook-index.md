# Solana Cookbook Index

> Complete index of Solana Cookbook entries with descriptions, code patterns, and direct links. The Cookbook provides practical, copy-paste recipes for common Solana development tasks.

**Base URL:** https://solana.com/developers/cookbook

---

## Development

### Start a Local Validator

Set up a local Solana test validator for development and testing.

- **URL:** https://solana.com/developers/cookbook/development/start-local-validator
- **Command:** `solana-test-validator`
- **Flags:** `--reset` (clean state), `--clone <ADDRESS>` (clone mainnet accounts), `--bpf-program <ADDRESS> <PATH>` (load local programs)

```bash
# Basic
solana-test-validator

# With mainnet account clones
solana-test-validator --clone TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA --url mainnet-beta

# Reset state each time
solana-test-validator --reset
```

---

### Connect to a Solana Environment

Establish RPC connections to devnet, testnet, or mainnet-beta.

- **URL:** https://solana.com/developers/cookbook/development/connect-to-environment

```typescript
import { Connection, clusterApiUrl } from "@solana/web3.js";

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
// Or with custom RPC
const connection = new Connection("https://rpc.helius.xyz/?api-key=KEY", "confirmed");
```

---

### Get Test SOL

Request SOL on devnet or testnet for testing.

- **URL:** https://solana.com/developers/cookbook/development/test-sol
- **Methods:** CLI airdrop, web faucet, programmatic request

```bash
solana airdrop 2 --url devnet
```

```typescript
const signature = await connection.requestAirdrop(publicKey, 2 * LAMPORTS_PER_SOL);
await connection.confirmTransaction(signature);
```

**Web faucet:** https://faucet.solana.com

---

### Subscribe to Events

Listen for real-time account changes, program activity, and log updates via WebSocket.

- **URL:** https://solana.com/developers/cookbook/development/subscribe-to-events

```typescript
// Subscribe to account changes
const subscriptionId = connection.onAccountChange(
  accountPublicKey,
  (accountInfo) => {
    console.log("Account changed:", accountInfo.data);
  },
  "confirmed"
);

// Subscribe to program logs
const logSubId = connection.onLogs(
  programId,
  (logs) => {
    console.log("Program logs:", logs);
  },
  "confirmed"
);

// Unsubscribe
connection.removeAccountChangeListener(subscriptionId);
```

---

### Use Mainnet Accounts in Development

Clone mainnet state to your local validator for realistic testing.

- **URL:** https://solana.com/developers/cookbook/development/using-mainnet-accounts

```bash
# Clone specific accounts
solana-test-validator \
  --clone EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v \
  --clone TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA \
  --url mainnet-beta

# Clone a program
solana-test-validator \
  --bpf-program <PROGRAM_ID> <PROGRAM_SO_FILE> \
  --url mainnet-beta
```

---

## Wallets

### Create a Keypair

Generate a new Solana keypair for development or testing.

- **URL:** https://solana.com/developers/cookbook/wallets/create-keypair

```typescript
import { Keypair } from "@solana/web3.js";

const keypair = Keypair.generate();
console.log("Public key:", keypair.publicKey.toBase58());
console.log("Secret key:", keypair.secretKey);
```

```bash
solana-keygen new --outfile ~/my-keypair.json
```

---

### Restore a Keypair from Secret Key

Recreate a keypair from a saved secret key byte array.

- **URL:** https://solana.com/developers/cookbook/wallets/restore-keypair

```typescript
import { Keypair } from "@solana/web3.js";

const secretKey = Uint8Array.from([/* 64 bytes */]);
const keypair = Keypair.fromSecretKey(secretKey);
```

---

### Verify a Keypair

Check that a keypair is valid and the public key matches the secret key.

- **URL:** https://solana.com/developers/cookbook/wallets/verify-keypair

```typescript
import { Keypair } from "@solana/web3.js";
import nacl from "tweetnacl";

const keypair = Keypair.fromSecretKey(secretKey);
const isValid = nacl.sign.detached.verify(
  keypair.publicKey.toBytes(),
  nacl.sign.detached(keypair.publicKey.toBytes(), keypair.secretKey),
  keypair.publicKey.toBytes()
);
```

---

### Check if a Public Key is Valid

Validate that a string is a valid Solana public key.

- **URL:** https://solana.com/developers/cookbook/wallets/check-publickey

```typescript
import { PublicKey } from "@solana/web3.js";

function isValidPublicKey(address: string): boolean {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}
```

---

### Generate Mnemonics

Create BIP39 mnemonic seed phrases for HD wallet derivation.

- **URL:** https://solana.com/developers/cookbook/wallets/generate-mnemonic

```typescript
import * as bip39 from "bip39";

const mnemonic = bip39.generateMnemonic(128); // 12 words
// or
const mnemonic24 = bip39.generateMnemonic(256); // 24 words
```

---

### Restore Keypair from Mnemonic

Derive a Solana keypair from a BIP39 seed phrase.

- **URL:** https://solana.com/developers/cookbook/wallets/restore-from-mnemonic

```typescript
import * as bip39 from "bip39";
import { Keypair } from "@solana/web3.js";
import { derivePath } from "ed25519-hd-key";

const seed = bip39.mnemonicToSeedSync(mnemonic);
const derivedSeed = derivePath("m/44'/501'/0'/0'", seed.toString("hex")).key;
const keypair = Keypair.fromSeed(derivedSeed);
```

---

### Generate Vanity Address

Create a keypair with a specific prefix in the public key.

- **URL:** https://solana.com/developers/cookbook/wallets/generate-vanity-address

```bash
solana-keygen grind --starts-with ABC:1
# Generates a keypair where public key starts with "ABC"
```

---

### Sign a Message

Sign an arbitrary message off-chain for verification.

- **URL:** https://solana.com/developers/cookbook/wallets/sign-message

```typescript
import nacl from "tweetnacl";

const message = new TextEncoder().encode("Hello, Solana!");
const signature = nacl.sign.detached(message, keypair.secretKey);

// Verify
const isValid = nacl.sign.detached.verify(message, signature, keypair.publicKey.toBytes());
```

---

### Connect a Wallet in React

Integrate wallet connection using Solana Wallet Adapter.

- **URL:** https://solana.com/developers/cookbook/wallets/connect-wallet-react

```typescript
import { useWallet } from "@solana/wallet-adapter-react";

function ConnectButton() {
  const { publicKey, connect, disconnect, connected } = useWallet();

  return connected ? (
    <div>
      <p>Connected: {publicKey?.toBase58()}</p>
      <button onClick={disconnect}>Disconnect</button>
    </div>
  ) : (
    <button onClick={connect}>Connect Wallet</button>
  );
}
```

---

## Transactions

### Send SOL

Transfer SOL from one account to another.

- **URL:** https://solana.com/developers/cookbook/transactions/send-sol

```typescript
import { SystemProgram, Transaction, sendAndConfirmTransaction, LAMPORTS_PER_SOL } from "@solana/web3.js";

const transaction = new Transaction().add(
  SystemProgram.transfer({
    fromPubkey: sender.publicKey,
    toPubkey: recipientPublicKey,
    lamports: 0.5 * LAMPORTS_PER_SOL,
  })
);

const signature = await sendAndConfirmTransaction(connection, transaction, [sender]);
```

---

### Send SPL Tokens

Transfer SPL tokens between associated token accounts.

- **URL:** https://solana.com/developers/cookbook/transactions/send-tokens

```typescript
import { getOrCreateAssociatedTokenAccount, transfer } from "@solana/spl-token";

const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
  connection, payer, mint, sender.publicKey
);
const toTokenAccount = await getOrCreateAssociatedTokenAccount(
  connection, payer, mint, recipientPublicKey
);

const signature = await transfer(
  connection,
  payer,
  fromTokenAccount.address,
  toTokenAccount.address,
  sender,
  1_000_000 // amount in smallest unit
);
```

---

### Calculate Transaction Cost

Estimate the fee for a transaction before sending.

- **URL:** https://solana.com/developers/cookbook/transactions/calculate-cost

```typescript
const transaction = new Transaction().add(/* instructions */);
transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
transaction.feePayer = payer.publicKey;

const fee = await transaction.getEstimatedFee(connection);
console.log("Estimated fee:", fee, "lamports");
```

---

### Add a Memo to a Transaction

Attach human-readable text to a transaction using the Memo program.

- **URL:** https://solana.com/developers/cookbook/transactions/add-memo

```typescript
import { TransactionInstruction } from "@solana/web3.js";

const MEMO_PROGRAM_ID = new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");

const memoInstruction = new TransactionInstruction({
  keys: [{ pubkey: signer.publicKey, isSigner: true, isWritable: false }],
  programId: MEMO_PROGRAM_ID,
  data: Buffer.from("Hello from my dApp!"),
});

transaction.add(memoInstruction);
```

---

### Add Priority Fees

Set compute unit price to prioritize transaction inclusion.

- **URL:** https://solana.com/developers/cookbook/transactions/add-priority-fees

```typescript
import { ComputeBudgetProgram } from "@solana/web3.js";

transaction.add(
  ComputeBudgetProgram.setComputeUnitPrice({
    microLamports: 50_000, // priority fee in micro-lamports per CU
  })
);
```

---

### Optimize Compute Units

Request only the compute units your transaction needs.

- **URL:** https://solana.com/developers/cookbook/transactions/optimize-compute

```typescript
import { ComputeBudgetProgram } from "@solana/web3.js";

// First simulate to find actual CU usage
const simulation = await connection.simulateTransaction(transaction);
const unitsConsumed = simulation.value.unitsConsumed;

// Then set exact limit with buffer
transaction.add(
  ComputeBudgetProgram.setComputeUnitLimit({
    units: Math.ceil(unitsConsumed * 1.1), // 10% buffer
  })
);
```

---

### Sign Transactions Offline

Create and sign transactions without network access, then submit later.

- **URL:** https://solana.com/developers/cookbook/transactions/offline-transactions

```typescript
// Offline: create and sign
const transaction = new Transaction().add(/* instructions */);
transaction.recentBlockhash = knownBlockhash; // must know a recent blockhash
transaction.feePayer = payer.publicKey;
transaction.sign(payer);

const serialized = transaction.serialize();

// Online: submit
const signature = await connection.sendRawTransaction(serialized);
```

---

## Accounts

### Create a System Account

Create a new account owned by the System Program.

- **URL:** https://solana.com/developers/cookbook/accounts/create-account

```typescript
import { SystemProgram, Keypair, Transaction, sendAndConfirmTransaction } from "@solana/web3.js";

const newAccount = Keypair.generate();
const space = 100; // bytes
const lamports = await connection.getMinimumBalanceForRentExemption(space);

const transaction = new Transaction().add(
  SystemProgram.createAccount({
    fromPubkey: payer.publicKey,
    newAccountPubkey: newAccount.publicKey,
    lamports,
    space,
    programId: ownerProgramId,
  })
);

await sendAndConfirmTransaction(connection, transaction, [payer, newAccount]);
```

---

### Calculate Rent Exemption

Determine the minimum SOL balance required for an account to be rent-exempt.

- **URL:** https://solana.com/developers/cookbook/accounts/calculate-rent

```typescript
const space = 165; // bytes (e.g., token account size)
const rentExemption = await connection.getMinimumBalanceForRentExemption(space);
console.log("Rent exemption:", rentExemption / LAMPORTS_PER_SOL, "SOL");
```

---

### Create a PDA Account

Derive and create a Program Derived Address account.

- **URL:** https://solana.com/developers/cookbook/accounts/create-pda-account

```typescript
import { PublicKey } from "@solana/web3.js";

// Derive PDA
const [pda, bump] = PublicKey.findProgramAddressSync(
  [Buffer.from("my-seed"), userPublicKey.toBuffer()],
  programId
);

// In Anchor:
// #[account(
//     init,
//     seeds = [b"my-seed", user.key().as_ref()],
//     bump,
//     payer = user,
//     space = 8 + MyAccount::INIT_SPACE
// )]
// pub my_account: Account<'info, MyAccount>,
```

---

### Sign with a PDA

Use a PDA as a signer in cross-program invocations (CPIs).

- **URL:** https://solana.com/developers/cookbook/accounts/sign-with-pda

```rust
// In a Solana program -- PDA signing via invoke_signed
let seeds = &[b"my-seed", user_key.as_ref(), &[bump]];
let signer_seeds = &[&seeds[..]];

invoke_signed(
    &transfer_instruction,
    &[pda_account.clone(), recipient.clone(), system_program.clone()],
    signer_seeds,
)?;
```

---

### Close an Account

Close an account and reclaim its rent-exempt SOL.

- **URL:** https://solana.com/developers/cookbook/accounts/close-account

```typescript
import { closeAccount } from "@solana/spl-token";

// Close a token account (returns SOL to destination)
await closeAccount(
  connection,
  payer,           // fee payer
  tokenAccount,    // account to close
  destination,     // where to send remaining SOL
  owner            // account owner
);
```

```rust
// In Anchor: #[account(close = user)]
// Automatically closes account and sends lamports to `user`
```

---

### Get Account Balance

Check the SOL balance of any account.

- **URL:** https://solana.com/developers/cookbook/accounts/get-account-balance

```typescript
const balance = await connection.getBalance(publicKey);
console.log("Balance:", balance / LAMPORTS_PER_SOL, "SOL");
```

---

## Tokens

### Create a Token Mint

Create a new SPL token mint.

- **URL:** https://solana.com/developers/cookbook/tokens/create-mint-account

```typescript
import { createMint } from "@solana/spl-token";

const mint = await createMint(
  connection,
  payer,          // fee payer
  mintAuthority,  // who can mint
  freezeAuthority, // who can freeze (null for no freeze)
  9               // decimals
);
```

---

### Get Token Accounts by Owner

Fetch all token accounts owned by a wallet.

- **URL:** https://solana.com/developers/cookbook/tokens/get-all-token-accounts

```typescript
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

const tokenAccounts = await connection.getTokenAccountsByOwner(walletPublicKey, {
  programId: TOKEN_PROGRAM_ID,
});

for (const { pubkey, account } of tokenAccounts.value) {
  console.log("Token account:", pubkey.toBase58());
}
```

---

### Mint Tokens

Mint new tokens to a token account.

- **URL:** https://solana.com/developers/cookbook/tokens/mint-tokens

```typescript
import { mintTo, getOrCreateAssociatedTokenAccount } from "@solana/spl-token";

const tokenAccount = await getOrCreateAssociatedTokenAccount(
  connection, payer, mint, recipientPublicKey
);

await mintTo(
  connection,
  payer,
  mint,
  tokenAccount.address,
  mintAuthority,
  1_000_000_000 // amount (with decimals)
);
```

---

### Get Token Balance

Check the token balance of a specific token account.

- **URL:** https://solana.com/developers/cookbook/tokens/get-token-balance

```typescript
const balance = await connection.getTokenAccountBalance(tokenAccountAddress);
console.log("Token balance:", balance.value.uiAmount);
console.log("Raw amount:", balance.value.amount);
```

---

## Programs (On-Chain)

### Transfer SOL in a Program

Move SOL between accounts within a Solana program.

- **URL:** https://solana.com/developers/cookbook/programs/transfer-sol

```rust
// System program transfer (from signer)
invoke(
    &system_instruction::transfer(from.key, to.key, lamports),
    &[from.clone(), to.clone(), system_program.clone()],
)?;

// Direct lamport manipulation (from program-owned account)
**from.try_borrow_mut_lamports()? -= lamports;
**to.try_borrow_mut_lamports()? += lamports;
```

---

### Cross-Program Invocation (CPI)

Call one program from another.

- **URL:** https://solana.com/developers/cookbook/programs/cross-program-invocation

```rust
// Basic CPI
invoke(
    &instruction,
    &[account1.clone(), account2.clone()],
)?;

// CPI with PDA signer
invoke_signed(
    &instruction,
    &[pda_account.clone(), other_account.clone()],
    &[&[b"seed", &[bump]]],
)?;
```

---

### Read Accounts in a Program

Deserialize and read account data within a program.

- **URL:** https://solana.com/developers/cookbook/programs/read-accounts

```rust
// With Anchor
let my_account = &ctx.accounts.my_account;
let data = my_account.data; // typed access

// Without Anchor
let data = account.try_borrow_data()?;
let my_struct = MyStruct::try_from_slice(&data)?;
```

---

### Read Multiple Accounts (Client)

Batch-fetch multiple accounts in a single RPC call.

- **URL:** https://solana.com/developers/cookbook/accounts/read-multiple-accounts

```typescript
const accounts = await connection.getMultipleAccountsInfo([
  publicKey1,
  publicKey2,
  publicKey3,
]);

for (const account of accounts) {
  if (account) {
    console.log("Data length:", account.data.length);
    console.log("Owner:", account.owner.toBase58());
  }
}
```

---

## Quick Lookup Table

| Task | Cookbook Section | Direct URL |
|------|----------------|------------|
| Start local validator | Development | https://solana.com/developers/cookbook/development/start-local-validator |
| Connect to cluster | Development | https://solana.com/developers/cookbook/development/connect-to-environment |
| Get test SOL | Development | https://solana.com/developers/cookbook/development/test-sol |
| Create keypair | Wallets | https://solana.com/developers/cookbook/wallets/create-keypair |
| Restore from mnemonic | Wallets | https://solana.com/developers/cookbook/wallets/restore-from-mnemonic |
| Sign message | Wallets | https://solana.com/developers/cookbook/wallets/sign-message |
| Connect wallet (React) | Wallets | https://solana.com/developers/cookbook/wallets/connect-wallet-react |
| Send SOL | Transactions | https://solana.com/developers/cookbook/transactions/send-sol |
| Send tokens | Transactions | https://solana.com/developers/cookbook/transactions/send-tokens |
| Priority fees | Transactions | https://solana.com/developers/cookbook/transactions/add-priority-fees |
| Optimize compute | Transactions | https://solana.com/developers/cookbook/transactions/optimize-compute |
| Create account | Accounts | https://solana.com/developers/cookbook/accounts/create-account |
| Calculate rent | Accounts | https://solana.com/developers/cookbook/accounts/calculate-rent |
| Create PDA | Accounts | https://solana.com/developers/cookbook/accounts/create-pda-account |
| Close account | Accounts | https://solana.com/developers/cookbook/accounts/close-account |
| Get balance | Accounts | https://solana.com/developers/cookbook/accounts/get-account-balance |
| Create token mint | Tokens | https://solana.com/developers/cookbook/tokens/create-mint-account |
| Mint tokens | Tokens | https://solana.com/developers/cookbook/tokens/mint-tokens |
| Get token balance | Tokens | https://solana.com/developers/cookbook/tokens/get-token-balance |
| CPI | Programs | https://solana.com/developers/cookbook/programs/cross-program-invocation |
| Transfer SOL (program) | Programs | https://solana.com/developers/cookbook/programs/transfer-sol |
