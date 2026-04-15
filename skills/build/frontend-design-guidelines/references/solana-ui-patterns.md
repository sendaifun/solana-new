# Solana UI Patterns

Crypto-specific UI patterns that most Solana frontends get wrong. These are the ones that matter for trust and clarity when money is involved.

## Wallet connect button

Rules:

1. **Show connection state clearly.** Three visible states: disconnected, connecting, connected.
2. **When connected, show a truncated address + a small indicator** (green dot, icon). Click opens a menu with copy address, view on explorer, disconnect.
3. **Use the standard wallet adapter UI** if the project has `@solana/wallet-adapter-react-ui` installed — don't reinvent it.
4. **Persist the selected wallet across refreshes** via `autoConnect`.
5. **Handle "wallet installed but locked"** — show "Unlock wallet" not "Connect wallet".
6. **Handle "wallet not installed"** — link to the wallet's install page instead of failing silently.

### Shape

```tsx
{!connected && <Button onClick={connect}>Connect wallet</Button>}
{connecting && <Button disabled loading>Connecting...</Button>}
{connected && (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="secondary" className="gap-2 font-mono tabular-nums">
        <span className="h-2 w-2 rounded-full bg-green-500" aria-hidden />
        {truncateAddress(publicKey)}
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem onClick={copyAddress}>Copy address</DropdownMenuItem>
      <DropdownMenuItem onClick={openExplorer}>View on explorer</DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={disconnect}>Disconnect</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
)}
```

## Address formatting

1. **Truncate addresses as `FirstN...LastN`.** Default 4 and 4: `7xKX...p2aB`. For very tight UIs, 3 and 3. Never show the raw full address unless the user explicitly reveals it.
2. **Use monospace for addresses.** `font-mono` — proportional fonts make addresses unreadable.
3. **Always provide a copy button next to a displayed address.** Clicking an address should copy it. Show a transient "Copied" confirmation.
4. **Link to the explorer**, but in a separate icon/button — not on the address text itself (so clicking to copy still works).
5. **`select-all` on click** of a full address is a nice touch: `onClick={(e) => window.getSelection()?.selectAllChildren(e.currentTarget)}`.

```ts
export function truncateAddress(address: string | PublicKey, chars = 4) {
  const str = typeof address === "string" ? address : address.toBase58();
  if (str.length <= chars * 2 + 3) return str;
  return `${str.slice(0, chars)}...${str.slice(-chars)}`;
}
```

## Token amounts

> **Full spec:** The `number-formatting` skill (`skills/build/number-formatting/`) is the authoritative source for all number display rules — dynamic decimals, zero-subscript, abbreviations, sign policy, tiny markers, and copy behavior. The rules below are a quick summary. When in doubt, defer to `number-formatting`.

1. **Use `font-mono tabular-nums`** so digits align vertically and don't jitter when they update.
2. **Use dynamic decimals based on token price**, not hardcoded precision. The number-formatting spec computes decimals as `ceil(-log10(threshold / tokenPriceUsd))` and clamps to context-appropriate ranges. See `number-formatting` references/formatting-spec.md for the full algorithm.
3. **Show a human-readable unit**, not raw lamports. Use `amount / 10 ** decimals`.
4. **Use zero-subscript notation** for very small values (>= 3 leading zeros after decimal): `0.0₄58` instead of `0.00005835`. Include an `aria-label` with the expanded decimal.
5. **Always show the token symbol** next to the amount. "12.34" is not a balance; "12.34 SOL" is.
6. **USD values are secondary.** Show them smaller, in `text-muted-foreground`, below or next to the token amount.
7. **Show the source of the price** on hover or in a footnote. "Est. via Pyth" or "Est. via Jupiter". Users should not have to guess.
8. **Copy gives raw precision.** When a user copies a formatted amount, clipboard gets the raw decimal string, never the display format.

```tsx
<div className="flex items-baseline gap-1">
  <span className="font-mono tabular-nums text-2xl font-semibold">
    <FormattedNumber value={amount} type="token_amount" context="compact" tokenPriceUsd={priceUsd} />
  </span>
  <span className="text-sm text-muted-foreground">SOL</span>
</div>
<p className="text-xs text-muted-foreground tabular-nums">
  ≈ <FormattedNumber value={usdValue} type="fiat_value" context="compact" />
</p>
```

## Transaction confirmation dialogs

Transactions move money. Treat the confirm flow as high-stakes.

1. **Show the full breakdown before signing.** What's being sent, to whom, network fee estimate, priority fee (if any), total.
2. **Show addresses truncated but with copy access**, and on hover show the full address.
3. **Name the counterparty if possible.** "Sending to Kamino Lending" is clearer than "Sending to 7xK...p2aB".
4. **Include the program being called** when the action is a contract interaction. "This will call Jupiter's swap program."
5. **Simulate the transaction first** and show the expected outcome ("You'll receive ~12.34 USDC"). Don't send a transaction the user hasn't seen the result of.
6. **Two-step confirm for high-value actions.** Above a threshold, add a typed confirmation ("Type SEND to confirm"). Threshold should be user-configurable.
7. **Never auto-sign.** Every signature is an explicit click.
8. **After signing, show the transaction status**: submitting → confirming → confirmed, with a link to the explorer at each step.
9. **If the tx fails**, show the decoded error where possible, not the raw hex. Give a retry action.

## Explorer links

1. **Open in a new tab** (`target="_blank" rel="noreferrer"`).
2. **Respect the network.** Devnet link → devnet explorer. Don't ship mainnet links on a devnet build.
3. **Icon it.** Small external-link icon (`lucide-react`'s `ExternalLink`) next to the link text.
4. **Prefer Solscan or Solana Explorer** — consistent per-project, don't mix them on the same screen.

## Network indicator

1. **If your app targets more than one cluster (devnet, testnet, mainnet), show the current cluster prominently** in the header.
2. **Color it**: mainnet neutral, devnet yellow/orange, testnet gray. Users should not have to guess which network they're on.
3. **Make the switcher visible** if the user can change it, but behind a click — not a hover — so they don't switch accidentally.

## Loading during RPC calls

1. **Assume Solana RPC can be slow or flaky.** Set timeouts on every call, show the user what you're waiting for, and offer a retry.
2. **Use skeletons for balance displays** — a spinner in the middle of a balance card looks broken.
3. **For live-updating data** (like a price feed or tx status), show a subtle "updating" indicator, not a full reload state.

## Errors specific to Solana

- **"Insufficient funds for rent"** — explain rent to the user. "Your account needs a minimum balance to exist on Solana."
- **"Blockhash not found"** — transient, retry automatically once, then surface.
- **"Transaction simulation failed"** — show the simulated logs if possible, but translate the common ones into human sentences.
- **"Wallet rejected"** — not an error, just a state change. Don't show an error toast for user cancellations. Clear the flow and return to idle.
- **"Slippage exceeded"** — this is high-signal. Suggest raising slippage or retrying.

## Numbers that move

1. **Use `tabular-nums`.** Required for any number that updates in place.
2. **Don't animate number changes more than ~300 ms.** A rapid counter that tweens takes attention; a snap change with a brief flash is usually better.
3. **For price changes**, color the direction (green up, red down) briefly, then return to default text color. Don't leave the whole price green forever.
4. **Respect color-blind users.** Pair color with direction arrows or + / - signs.
