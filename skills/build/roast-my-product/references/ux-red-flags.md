# Web3 UX Red Flags

Web3-specific UX issues that cause users to leave. Check every product against this list.

## 1. Wallet Connection Before Value Preview

**The problem**: User lands on the app and the only thing they can do is connect a wallet. No preview, no explanation, no reason to trust.

**Why users leave**: They don't know what they're connecting to. Trust hasn't been established. There's no reason to give access to their wallet yet.

**The fix**: Show the product working first. Let users browse, explore, simulate. Only require wallet when they want to take an action (swap, deposit, mint).

## 2. No Transaction Simulation / Dry Run Feedback

**The problem**: User clicks "Swap" and gets a wallet popup with raw transaction data. No preview of what will happen.

**Why users leave**: Fear. Uncertainty. "Am I about to lose all my SOL?" Users abort transactions they don't understand.

**The fix**: Show a clear preview before the wallet popup: "You will swap 10 USDC for ~0.05 SOL. Estimated fee: 0.000005 SOL. Price impact: 0.1%."

## 3. Unclear Transaction Approval Dialogs

**The problem**: Wallet popup shows hex data, program IDs, and instruction names that mean nothing to the user. "Invoke: JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4" — what?

**Why users leave**: If they can't understand what they're approving, cautious users won't approve it.

**The fix**: Use transaction memos, clear naming, and pre-confirmation screens that explain in plain language what the transaction does.

## 4. Missing Transaction State Indicators

**The problem**: User signs a transaction and... nothing. No pending indicator. No confirmation. Did it work? Is it processing? Did it fail silently?

**Why users leave**: Uncertainty is worse than a slow transaction. Users will click again, double-spend, or leave.

**The fix**: Three clear states: Pending (submitted, waiting for confirmation), Confirmed (included in block), Finalized (irreversible). Show each with timestamps and explorer links.

## 5. No Error Recovery

**The problem**: "Transaction failed." That's it. No explanation. No suggestion. No retry button. Dead end.

**Why users leave**: They don't know what went wrong or what to do. Most will just close the tab.

**The fix**: Explain WHY it failed (insufficient balance, slippage exceeded, program error). Suggest what to try (increase slippage, add more SOL for fees, try again). Provide a retry button with adjusted parameters.

## 6. Gas/Fee Estimation Not Shown

**The problem**: User doesn't know how much a transaction will cost until the wallet popup appears. Or worse, the transaction fails because they didn't have enough SOL for fees.

**Why users leave**: Surprise costs. Failed transactions that still cost fees.

**The fix**: Show estimated fees before the user initiates the transaction. Warn if SOL balance is too low. Show fees in both SOL and USD.

## 7. Mobile Wallet Flow Broken

**The problem**: App works on desktop but the mobile wallet adapter is broken, missing, or requires copying a URL to a wallet browser.

**Why users leave**: Over 50% of crypto users are mobile-first. If mobile doesn't work, you lose half your users.

**The fix**: Test with Phantom, Solflare, and Backpack mobile wallets. Use Mobile Wallet Adapter. Ensure deep links work. Test the full flow on a real phone.

## 8. No Onboarding for Non-Crypto Users

**The problem**: App assumes everyone knows what a wallet is, what SOL is, what signing means. Zero help for new users.

**Why users leave**: The crypto-curious bounce immediately. Only existing crypto users can figure it out.

**The fix**: Optional onboarding flow for new users. Embedded wallet option (Privy, Dynamic). Explain wallet concepts inline. "What's a wallet?" tooltip.

## 9. Copy-Paste Addresses Without Validation

**The problem**: User must manually copy-paste a Solana address into an input field. No validation, no resolution, no confirmation.

**Why users leave**: Sending to the wrong address means permanent loss of funds. The anxiety alone stops users.

**The fix**: Validate address format in real-time. Support SNS (.sol) domain resolution. Show a confirmation screen with truncated address AND full address expandable. Recently-used addresses list.

## 10. Stale Data After Transaction

**The problem**: User completes a swap but balances don't update. Portfolio shows old numbers. They wonder if the transaction actually worked.

**Why users leave**: Confusion. They'll check the explorer, see the transaction, wonder why the app doesn't reflect it, lose trust.

**The fix**: Optimistic updates immediately after confirmation. WebSocket subscriptions for real-time balance changes. Manual refresh button as fallback. "Last updated: 3 seconds ago" indicator.

## 11. No Deep Links / Shareable States

**The problem**: User can't share a specific swap configuration, pool, or position with someone else. Every link goes to the homepage.

**Why users leave**: They can't share what they found. Growth through word-of-mouth is killed.

**The fix**: URL reflects app state. "swap?inputMint=USDC&outputMint=SOL&amount=100" should work. Support Blinks/Actions for shareable transactions.

## 12. Loading States Without Explanation

**The problem**: Spinner. Just a spinner. For 5 seconds. 10 seconds. Is it loading data? Fetching on-chain state? Simulating a transaction? Broken?

**Why users leave**: After 3 seconds of unexplained loading, users assume the app is broken.

**The fix**: Explain what's loading: "Fetching best route across 5 DEXs..." "Simulating transaction..." "Waiting for block confirmation..." Progress indicators where possible.

## 13. Token Amounts Without USD Equivalent

**The problem**: "Your position is worth 1,234.56 JTO." Cool. Is that $100 or $10,000?

**Why users leave**: Most people think in fiat. Raw token amounts are meaningless without context.

**The fix**: Always show USD equivalent alongside token amounts. Use real-time price feeds. Show both: "1,234.56 JTO (~$2,469.12)".

## 14. No Account State Refreshing

**The problem**: User leaves the tab open, comes back 30 minutes later. Data is stale. Prices are old. Positions may have been liquidated.

**Why users leave**: Acting on stale data can cost real money. Users learn not to trust what they see.

**The fix**: Auto-refresh on tab focus. WebSocket connections for real-time updates. Clear "stale data" warnings if refresh fails. Timestamp on all price/balance displays.
