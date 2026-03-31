# Wallet Flow Tests

Comprehensive test cases for Solana wallet integration in frontend dApps. Each test includes steps, expected results, and common failure modes.

---

## 1. Wallet Adapter Connection

Test the `@solana/wallet-adapter-react` connect/disconnect lifecycle.

### Test 1.1: Basic Connect

**Steps:**
1. Load the dApp in browser.
2. Click "Connect Wallet" button.
3. Select Phantom from the wallet list.
4. Approve the connection in the Phantom popup.

**Expected Result:**
- `useWallet()` hook transitions: `disconnected` → `connecting` → `connected`.
- `publicKey` is populated and displayed in the UI.
- Wallet button updates to show truncated address or "Connected" state.
- `wallet.adapter.name` returns `"Phantom"`.

**Common Failures:**
- Wallet popup blocked by browser — ensure popup permissions are allowed.
- `WalletNotReadyError` — wallet extension not installed or not detected.
- Connection hangs in `connecting` state — wallet adapter version mismatch.

### Test 1.2: Basic Disconnect

**Steps:**
1. With wallet connected, click "Disconnect" button.
2. Verify UI updates.

**Expected Result:**
- `useWallet()` hook transitions: `connected` → `disconnecting` → `disconnected`.
- `publicKey` becomes `null`.
- UI reverts to "Connect Wallet" state.
- No console errors.

**Common Failures:**
- Disconnect fires but UI does not update — missing state subscription or stale closure.
- Wallet still shows as connected in the wallet extension — this is expected; the dApp disconnects its session, not the wallet itself.

### Test 1.3: Auto-Connect

**Steps:**
1. Connect wallet successfully.
2. Refresh the page.
3. Observe whether the wallet reconnects automatically.

**Expected Result:**
- If `autoConnect={true}` on `WalletProvider`, wallet should reconnect without user interaction.
- If `autoConnect={false}`, user must click "Connect Wallet" again.
- During auto-connect, a loading state should be visible (not a flash of disconnected UI).

**Common Failures:**
- Auto-connect triggers but fails silently — wallet extension locked or user revoked permissions.
- Race condition: page renders with `publicKey = null` then flickers to connected state.

### Test 1.4: Multiple Wallet Providers

**Steps:**
1. Install Phantom, Solflare, and Backpack extensions.
2. Click "Connect Wallet".
3. Verify all three appear in the wallet selection modal.
4. Connect with each one sequentially (disconnect between each).

**Expected Result:**
- All installed wallets appear in the `WalletMultiButton` or custom modal.
- Each wallet connects successfully and `wallet.adapter.name` reflects the correct wallet.
- `publicKey` is different for each wallet (unless user has same key imported).

**Common Failures:**
- Only one wallet detected — `wallets` array in `WalletProvider` missing adapters.
- Solflare adapter crashes on connect — version incompatibility with `@solana/wallet-adapter-solflare`.
- Backpack not detected — Backpack uses `window.backpack` not `window.solana`.

---

## 2. Network Mismatch Detection

### Test 2.1: Wrong Network Warning

**Steps:**
1. Set dApp to use devnet (`clusterApiUrl('devnet')`).
2. Open Phantom and switch to mainnet-beta.
3. Connect wallet to the dApp.
4. Attempt a transaction.

**Expected Result:**
- dApp detects network mismatch and shows a warning banner or modal.
- Transaction is blocked or fails gracefully with a clear error message.
- User is prompted to switch wallet network to devnet.

**Common Failures:**
- No mismatch detection — dApp blindly sends transaction to its configured RPC, wallet signs for a different network, transaction fails with confusing error.
- Wallet adapter does not expose the wallet's network — must infer from genesis hash or use wallet-standard features.

### Test 2.2: Network Switch Mid-Session

**Steps:**
1. Connect wallet on devnet (both dApp and wallet on devnet).
2. Switch wallet to mainnet-beta while still connected.
3. Attempt a transaction.

**Expected Result:**
- dApp detects the network change (if wallet emits events).
- Warning displayed or transaction blocked.
- No funds lost on wrong network.

**Common Failures:**
- Phantom does not emit a network change event — dApp must check before each transaction.
- Silent failure: transaction sent to devnet RPC, signed for mainnet, rejected by validator.

---

## 3. Transaction Signing Flow

### Test 3.1: sendTransaction (Recommended Path)

**Steps:**
1. Connect wallet.
2. Trigger a transaction (e.g., transfer SOL, interact with program).
3. Approve in wallet popup.
4. Wait for confirmation.

**Expected Result:**
- Wallet popup appears showing transaction details.
- After approval, `sendTransaction` returns a transaction signature.
- dApp shows pending state while waiting for confirmation.
- On confirmation, UI updates with success message and signature link.

**Common Failures:**
- `WalletSendTransactionError` — transaction malformed or blockhash expired.
- Transaction confirms but UI does not update — missing confirmation polling or WebSocket subscription.
- `Transaction too large` — too many instructions in a single transaction.

### Test 3.2: User Rejects Transaction

**Steps:**
1. Connect wallet.
2. Trigger a transaction.
3. Click "Cancel" or "Reject" in the wallet popup.

**Expected Result:**
- `WalletSignTransactionError` thrown with message indicating user rejection.
- dApp catches the error gracefully.
- UI shows "Transaction cancelled" or similar — not a generic error screen.
- dApp remains functional — user can retry or navigate away.

**Common Failures:**
- Unhandled promise rejection crashes the page.
- Error message shows raw error object instead of user-friendly text.
- dApp enters a broken state after rejection (buttons disabled, spinner stuck).

### Test 3.3: signTransaction (Offline Signing)

**Steps:**
1. Connect wallet.
2. Call `signTransaction(transaction)` without sending.
3. Verify the returned transaction has a valid signature.

**Expected Result:**
- Wallet popup asks user to sign.
- Returned transaction object has `transaction.signatures[0]` populated.
- Transaction is not broadcast — calling code must send it separately.

**Common Failures:**
- Confusion between `signTransaction` and `sendTransaction` — using `signTransaction` then wondering why nothing happened on-chain.
- Signed transaction used after blockhash expires — must send promptly.

### Test 3.4: signAllTransactions (Batch)

**Steps:**
1. Connect wallet.
2. Create an array of 3-5 transactions.
3. Call `signAllTransactions(transactions)`.
4. Approve all in wallet.

**Expected Result:**
- Single wallet popup showing all transactions (or sequential approval depending on wallet).
- All returned transactions have valid signatures.
- Transactions can be sent individually or in batch.

**Common Failures:**
- Wallet shows confusing UI for multiple transactions.
- One transaction fails to sign but others succeed — must handle partial failure.
- `signAllTransactions` not supported by all wallets — check `wallet.adapter.supportedTransactionVersions`.

### Test 3.5: Versioned Transactions (v0)

**Steps:**
1. Create a versioned transaction (v0) with `VersionedTransaction` and `MessageV0`.
2. If using address lookup tables, include the lookup table accounts.
3. Send via `sendTransaction`.

**Expected Result:**
- Wallet correctly identifies and signs the versioned transaction.
- Transaction executes successfully on-chain.
- Address lookup tables reduce transaction size as expected.

**Common Failures:**
- Wallet does not support versioned transactions — check `supportedTransactionVersions` includes `0`.
- Address lookup table not found — table must be activated and warmed up before use.
- Serialization error — ensure `VersionedTransaction` is used, not legacy `Transaction`.

---

## 4. Priority Fee Handling

### Test 4.1: Compute Budget Instructions

**Steps:**
1. Build a transaction with `ComputeBudgetProgram.setComputeUnitLimit()` and `ComputeBudgetProgram.setComputeUnitPrice()`.
2. Send the transaction.
3. Verify the fee paid.

**Expected Result:**
- Transaction includes compute budget instructions as the first instructions.
- Explorer shows the priority fee was applied.
- Total fee = base fee (5000 lamports) + priority fee.

**Common Failures:**
- Priority fee instructions placed after other instructions — must be first.
- Compute unit price set too low — transaction may be dropped during congestion.
- Compute unit limit set too low — transaction fails with `ComputeExceeded`.

### Test 4.2: Fee Estimation UI

**Steps:**
1. Trigger a transaction.
2. Verify the wallet or dApp UI shows estimated fees.
3. Compare displayed fees with actual fees charged.

**Expected Result:**
- Fee estimate is within 10% of actual fee.
- UI clearly distinguishes base fee from priority fee.
- If fee estimation fails, a reasonable default is used.

**Common Failures:**
- Fee estimate is zero (not accounting for priority fees).
- `getRecentPrioritizationFees` returns empty array — fallback to default fee.

---

## 5. Mobile Wallet Adapter

### Test 5.1: Deep Link Flow

**Steps:**
1. Open dApp in mobile browser.
2. Tap "Connect Wallet".
3. Verify redirect to wallet app (Phantom mobile, Solflare mobile).
4. Approve connection in wallet app.
5. Verify redirect back to dApp.

**Expected Result:**
- dApp detects mobile environment and uses `@solana-mobile/wallet-adapter-mobile`.
- Deep link opens wallet app.
- After approval, browser returns to dApp with wallet connected.
- `publicKey` is available.

**Common Failures:**
- Deep link opens App Store instead of wallet app — wallet not installed.
- Return redirect fails — incorrect deep link configuration.
- Session lost on return — dApp reloads and loses connection state.

### Test 5.2: Timeout Handling

**Steps:**
1. Trigger mobile wallet connection.
2. Switch to wallet app but do not approve — wait 60 seconds.
3. Return to dApp.

**Expected Result:**
- dApp shows timeout message after a reasonable period (30-60 seconds).
- User can retry the connection.
- No hanging promises or stuck state.

**Common Failures:**
- dApp waits indefinitely with no timeout.
- Timeout fires but error is not caught — unhandled rejection.

---

## 6. Multi-Signature Flows

### Test 6.1: Partial Signing

**Steps:**
1. Create a transaction requiring 2+ signers.
2. First signer signs with `signTransaction`.
3. Pass partially-signed transaction to second signer.
4. Second signer signs and sends.

**Expected Result:**
- First signature is preserved when second signer signs.
- Transaction includes all required signatures.
- Transaction executes successfully.

**Common Failures:**
- Second `signTransaction` call overwrites first signature — must use `partialSign` or serialize/deserialize correctly.
- Signers sign different versions of the transaction — blockhash mismatch.

---

## 7. Session and Reconnect

### Test 7.1: Page Refresh Persistence

**Steps:**
1. Connect wallet.
2. Refresh the page (F5 or Cmd+R).
3. Observe wallet state.

**Expected Result:**
- With `autoConnect={true}`: wallet reconnects automatically.
- With `autoConnect={false}`: wallet state resets to disconnected.
- No error flashes or broken UI during page load.

**Common Failures:**
- Brief flash of "Connect Wallet" button before auto-connect completes.
- Auto-connect fails silently because wallet is locked.

### Test 7.2: Wallet-Side Disconnect

**Steps:**
1. Connect wallet to dApp.
2. Open wallet extension and disconnect the dApp from the wallet's connected sites.
3. Return to dApp and attempt a transaction.

**Expected Result:**
- dApp detects the disconnection (may require attempting a transaction).
- Graceful error shown prompting user to reconnect.
- No unhandled errors.

**Common Failures:**
- dApp still shows "Connected" because it cached the state — wallet adapter events not firing.
- Transaction attempt throws cryptic error instead of "wallet disconnected" message.

### Test 7.3: Switching Wallets Mid-Session

**Steps:**
1. Connect with Phantom.
2. Without disconnecting, click "Connect Wallet" and select Solflare.
3. Verify wallet switch.

**Expected Result:**
- Previous wallet disconnects cleanly.
- New wallet connects.
- `publicKey` updates to the new wallet's address.
- Any cached account data refreshes for the new wallet.

**Common Failures:**
- Both wallets appear connected — state not cleaned up.
- Transaction signs with old wallet — stale `wallet` reference in closure.
- Account balances show old wallet's data.
