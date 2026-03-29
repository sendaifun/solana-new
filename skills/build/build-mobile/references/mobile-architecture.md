# Mobile Architecture

Patterns for building Solana mobile applications. Covers framework selection, SDK integration, and the unique challenges of mobile crypto.

## Framework Decision

| Framework | Best For | Wallet Connection | Catalog Reference |
|-----------|---------|-------------------|-------------------|
| React Native | Cross-platform, JS devs | MWA + Phantom deep links | `solana-mobile-dapp-scaffold` |
| Kotlin + Compose | Native Android | MWA (first-class) | `solana-kotlin-compose` |
| Solana App Kit | Rapid prototyping | Built-in modules | `solana-app-kit` |

### React Native (Recommended for most)

```bash
# Clone the official scaffold
git clone https://github.com/solana-mobile/solana-mobile-dapp-scaffold.git
cd solana-mobile-dapp-scaffold && yarn install
```

The scaffold includes:
- Mobile Wallet Adapter integration
- `@solana/web3.js` pre-configured with polyfills
- Example transaction signing flow
- Android and iOS support

**Repos:** `solana-mobile-dapp-scaffold` (React Native mobile dApp scaffold with MWA)

### Kotlin + Jetpack Compose (Native Android)

```bash
git clone https://github.com/solana-mobile/solana-kotlin-compose-scaffold.git
```

Native Android with first-class MWA support. Best for:
- Performance-critical apps
- Apps that need deep Android integration
- Teams with Kotlin experience

**Repos:** `solana-kotlin-compose` (Native Android scaffold with Kotlin + Jetpack Compose)

### Solana App Kit (Fastest to ship)

Pre-built modules for common Solana mobile patterns. Build an app in under 15 minutes.

```bash
git clone https://github.com/sendaifun/solana-app-kit.git
```

**Repos:** `solana-app-kit` (pre-built modules for rapid Solana app development)

## Required Polyfills (React Native)

React Native doesn't include Node.js built-ins. You need polyfills for Solana libraries to work.

```javascript
// Install polyfills
// yarn add react-native-get-random-values react-native-url-polyfill buffer @craftzdog/react-native-buffer

// In your entry file (index.js or App.tsx), BEFORE any Solana imports:
import "react-native-get-random-values";
import "react-native-url-polyfill/auto";
import { Buffer } from "buffer";
global.Buffer = Buffer;

// Now you can safely import Solana libraries
import { Connection, PublicKey } from "@solana/web3.js";
```

### Common Polyfill Issues

| Error | Missing Polyfill | Fix |
|-------|-----------------|-----|
| `crypto.getRandomValues is not a function` | `react-native-get-random-values` | Import at top of entry file |
| `Buffer is not defined` | `buffer` | `global.Buffer = Buffer` |
| `URL is not a constructor` | `react-native-url-polyfill` | Import before RPC connection |
| `TextEncoder is not defined` | `text-encoding-polyfill` | `import 'text-encoding-polyfill'` |

## Mobile App Structure

```
src/
  App.tsx                    # Entry point, providers
  providers/
    WalletProvider.tsx       # MWA or Phantom Connect
    ConnectionProvider.tsx   # RPC connection
  screens/
    HomeScreen.tsx           # Main app screen
    WalletScreen.tsx         # Balance, tokens, history
  hooks/
    useWallet.ts             # Wallet connection state
    useTransaction.ts        # Transaction building + sending
    useBalance.ts            # SOL + token balances
  utils/
    transaction.ts           # Transaction helpers
    constants.ts             # Program IDs, RPC URLs
```

## RPC Connection on Mobile

```typescript
import { Connection } from "@solana/web3.js";

// Use a reliable RPC provider — mobile networks are flaky
const connection = new Connection(
  process.env.HELIUS_RPC_URL || "https://api.mainnet-beta.solana.com",
  {
    commitment: "confirmed",
    // Add WebSocket endpoint for subscriptions
    wsEndpoint: process.env.HELIUS_WS_URL,
    // HTTP timeout — mobile networks are slow
    httpHeaders: { "X-Request-Timeout": "30000" },
  }
);

// Implement retry logic for mobile
async function sendWithRetry(tx: Transaction, maxRetries = 3): Promise<string> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const sig = await connection.sendRawTransaction(tx.serialize());
      await connection.confirmTransaction(sig, "confirmed");
      return sig;
    } catch (e) {
      if (i === maxRetries - 1) throw e;
      // Get fresh blockhash on retry
      tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    }
  }
  throw new Error("Transaction failed after retries");
}
```

**MCPs:** `helius-mcp` (60+ tools for RPC, DAS API, webhooks — use for production RPC)

## Handling Mobile-Specific Challenges

### Network Interruptions

```typescript
import NetInfo from "@react-native-community/netinfo";

// Monitor connectivity
const unsubscribe = NetInfo.addEventListener(state => {
  if (!state.isConnected) {
    // Queue transactions for retry when connection returns
    showOfflineIndicator();
  }
});

// Always check connectivity before sending transactions
const netState = await NetInfo.fetch();
if (!netState.isConnected) {
  Alert.alert("No Connection", "Please check your network and try again.");
  return;
}
```

### App Backgrounding

```typescript
import { AppState } from "react-native";

// Handle app going to background during transaction
useEffect(() => {
  const subscription = AppState.addEventListener("change", (nextState) => {
    if (nextState === "active") {
      // App came back to foreground — check pending transaction status
      checkPendingTransactions();
    }
  });
  return () => subscription.remove();
}, []);
```

### Transaction Loading States

```typescript
// Mobile users expect visual feedback at every step
const [txState, setTxState] = useState<
  "idle" | "building" | "signing" | "sending" | "confirming" | "success" | "error"
>("idle");

async function executeTransaction() {
  setTxState("building");
  const tx = await buildTransaction();

  setTxState("signing");
  const signed = await wallet.signTransaction(tx); // Opens wallet app

  setTxState("sending");
  const sig = await connection.sendRawTransaction(signed.serialize());

  setTxState("confirming");
  await connection.confirmTransaction(sig);

  setTxState("success");
}
```

## Privy Mobile Agent (Alternative)

For apps that need embedded wallets with social login (no external wallet app required):

```bash
git clone https://github.com/sendaifun/solana-agent-kit.git
cd solana-agent-kit/examples/embedded-wallets/privy-sak-react-native
```

**Repos:** `sak-privy-mobile` (React Native chat agent with Privy auth)
