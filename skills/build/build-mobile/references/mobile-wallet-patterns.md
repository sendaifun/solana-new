# Mobile Wallet Patterns

Wallet connection and transaction signing patterns for Solana mobile apps. Covers Mobile Wallet Adapter (MWA) and Phantom deep link integration.

## Mobile Wallet Adapter (MWA)

The standard protocol for mobile dApp-to-wallet communication on Solana. Works with Phantom, Solflare, and other MWA-compatible wallets.

### How MWA Works

```
1. Your app calls `transact()` — this opens the wallet app
2. Wallet shows the authorization/signing prompt to the user
3. User approves or rejects
4. Control returns to your app with the signed transaction (or error)
```

### React Native Integration

```typescript
import {
  transact,
  Web3MobileWallet,
} from "@solana-mobile/mobile-wallet-adapter-protocol-web3js";

// Authorize (connect wallet)
const authorizeWallet = async () => {
  const authResult = await transact(async (wallet: Web3MobileWallet) => {
    const auth = await wallet.authorize({
      cluster: "mainnet-beta",
      identity: {
        name: "My Solana App",
        uri: "https://myapp.com",
        icon: "favicon.png", // Relative to uri
      },
    });
    return auth;
  });

  // authResult contains:
  // - accounts: [{ address, label }]
  // - auth_token: string (for reauthorization)
  console.log("Connected:", authResult.accounts[0].address);
  return authResult;
};
```

### Sign and Send Transaction

For new React Native apps, prefer a Kit-first transaction-building flow when the chosen sample/template supports it.

Practical guidance:
- if you are following newer samples like `skr-staking`, build transactions using `@solana/kit` and pair them with `@wallet-ui/react-native-kit`
- if you are following the current official Solana Mobile React Native installation path, you may still be on the web3.js stack (`@wallet-ui/react-native-web3js` + `@solana/web3.js`)
- do not mix Kit and web3.js transaction-building patterns casually inside the same mobile app

Recommended default for this skill:
- use the transaction-building and signing pattern from the exact template/sample you scaffolded from
- for Kit-based apps, follow the current `skr-staking` sample as the reference implementation
- for web3.js-based apps, follow the official Solana Mobile docs/examples until the chosen template has moved to Kit

This skill should treat Kit as the preferred direction for new mobile examples, while keeping web3.js as a compatibility path where the current official docs/sample still require it.

### Sign Multiple Transactions

```typescript
// For operations requiring multiple transactions (e.g., create ATA + transfer)
await transact(async (wallet: Web3MobileWallet) => {
  const auth = await wallet.authorize({ /* ... */ });

  // Sign all at once — user sees one approval prompt
  const signedTxs = await wallet.signTransactions({
    transactions: [tx1, tx2, tx3],
  });

  // Send them sequentially
  for (const signed of signedTxs) {
    const sig = await connection.sendRawTransaction(signed.serialize());
    await connection.confirmTransaction(sig);
  }
});
```

## Phantom Mobile SDK / Alternative Mobile Wallet Flows

Phantom can be used in mobile apps, but React Native apps should follow Phantom's mobile-specific SDK or supported mobile flow guidance rather than browser SDK examples.

### React Native Guidance

For React Native:
- do not use `@phantom/browser-sdk` as the default mobile integration example
- prefer Phantom's React Native/mobile-specific guidance when using Phantom directly
- if the app only needs wallet handoff and signing, deep-link flows may be simpler than a full SDK
- if the app needs embedded/social/mobile-specific wallet UX, use the current Phantom mobile SDK path

### Practical Recommendation

Choose one of these based on app needs:
- **MWA / Solana Mobile wallet flow**: best default for Solana-native mobile apps
- **Phantom mobile SDK flow**: when Phantom-specific UX or embedded/social features are required
- **Phantom deep links**: for simpler connect-and-sign flows without a full SDK integration
- **Embedded wallet SDK**: when the product explicitly needs embedded onboarding

### Caution

Do not copy browser-SDK examples into React Native mobile apps. Browser SDK examples are for web/browser contexts and are not the right default reference for React Native mobile implementations.

**Skills:** `phantom-connect-skill` (Phantom Connect SDK — React, React Native, browser, social login, token gating)
**Skills:** `helius-phantom-skill` (Official Helius skill for frontend dApp development with Phantom Connect)

## Phantom Deep Links (Simplest Integration)

For apps that just need basic transaction signing without a full SDK.

### URL Scheme

```typescript
import { Linking } from "react-native";

const PHANTOM_DEEP_LINK = "https://phantom.app/ul/v1";

// Connect
const connectDeepLink = () => {
  const params = new URLSearchParams({
    app_url: "https://myapp.com",
    dapp_encryption_public_key: myEncryptionKey,
    redirect_link: "myapp://phantom-connect", // Your app's deep link
    cluster: "mainnet-beta",
  });
  Linking.openURL(`${PHANTOM_DEEP_LINK}/connect?${params}`);
};

// Handle redirect back to your app
// Register deep link handler in your app config
```

### Deep Link Limitations

- Less reliable than MWA (depends on URL scheme handling)
- Only works with Phantom (not Solflare, Backpack, etc.)
- No batch signing — one transaction per deep link round trip
- User experience is clunkier (app switching visible)

**Recommendation:** Use MWA for production apps. Use deep links only for simple, single-transaction flows.

## Wallet Connection State Management

```typescript
import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface WalletState {
  connected: boolean;
  publicKey: string | null;
  authToken: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const useWalletStore = create<WalletState>((set) => ({
  connected: false,
  publicKey: null,
  authToken: null,

  connect: async () => {
    const result = await authorizeWallet();
    const address = result.accounts[0].address;
    await AsyncStorage.setItem("wallet_address", address);
    await AsyncStorage.setItem("auth_token", result.auth_token);
    set({ connected: true, publicKey: address, authToken: result.auth_token });
  },

  disconnect: () => {
    AsyncStorage.multiRemove(["wallet_address", "auth_token"]);
    set({ connected: false, publicKey: null, authToken: null });
  },
}));
```

## Transaction Signing UX Best Practices

### 1. Pre-flight Checks

```typescript
// Always check before opening the wallet app
const preflightCheck = async (tx: Transaction) => {
  // Check network
  const netState = await NetInfo.fetch();
  if (!netState.isConnected) throw new Error("No network connection");

  // Simulate transaction first
  const sim = await connection.simulateTransaction(tx);
  if (sim.value.err) throw new Error(`Simulation failed: ${JSON.stringify(sim.value.err)}`);

  // Check balance covers fees
  const balance = await connection.getBalance(wallet.publicKey);
  if (balance < 5000) throw new Error("Insufficient SOL for transaction fees");
};
```

### 2. Timeout Handling

```typescript
// MWA can hang if user doesn't respond or switches away
const signWithTimeout = async (tx: Transaction, timeoutMs = 120000) => {
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Signing timed out — please try again")), timeoutMs)
  );

  return Promise.race([
    transact(async (wallet) => {
      const auth = await wallet.authorize({ /* ... */ });
      return wallet.signAndSendTransactions({ transactions: [tx] });
    }),
    timeoutPromise,
  ]);
};
```

### 3. Error Messages for Users

```typescript
const userFriendlyError = (error: any): string => {
  const msg = error?.message || "";
  if (msg.includes("User rejected")) return "Transaction cancelled";
  if (msg.includes("Insufficient")) return "Not enough SOL for this transaction";
  if (msg.includes("Blockhash")) return "Transaction expired — please try again";
  if (msg.includes("timeout")) return "Wallet did not respond — please try again";
  if (msg.includes("not installed")) return "Please install a Solana wallet (Phantom, Solflare)";
  return "Something went wrong. Please try again.";
};
```

## Testing Wallet Integration

### Emulator and Device Testing

- Use any Android device or emulator during development
- Use Mock MWA Wallet when testing MWA flows in development environments
- Use devnet for all testing — airdrop SOL via `solana airdrop 2`
- Before release, repeat the critical wallet and signing flow on a physical device with a real wallet installed

### Physical Device Testing Checklist

- [ ] Wallet app installed and set up on device
- [ ] App connects and receives wallet address
- [ ] Single transaction signing works
- [ ] Multi-transaction signing works
- [ ] User rejection handled gracefully
- [ ] Network interruption during signing handled
- [ ] App backgrounding during signing handled
- [ ] Transaction confirmation displayed correctly
- [ ] Error messages are user-friendly (no raw error codes)

**MCPs:** `phantom-mcp-server` (Official Phantom MCP — wallet access, sign/send, swaps)

## Sources

- [Solana Mobile Docs — Installation](https://docs.solanamobile.com/get-started/react-native/installation)
- [Solana Mobile Docs — Test with any Android device](https://docs.solanamobile.com/recipes/general/test-with-any-android-device)
- [solana-mobile/react-native-samples](https://github.com/solana-mobile/react-native-samples)
