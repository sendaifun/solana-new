# MCP Integration

## What is the MCP Server

`flash-trade-mcp` is a Model Context Protocol server that wraps the Flash Trade REST API as typed MCP tools for AI agents. Published on NPM as [`flash-trade-mcp`](https://www.npmjs.com/package/flash-trade-mcp) (v0.4.1).

The server adds Zod input validation, AI-readable output formatting, error normalization, and transaction signing via local Solana keypair. It does not contain trading logic — all execution flows through the Flash Trade REST API.

## Setup

### Install and Run

```bash
npx flash-trade-mcp
# or
bunx flash-trade-mcp
```

### Environment Variables

| Variable | Required | Default | Purpose |
|----------|----------|---------|---------|
| `FLASH_API_URL` | Yes | — | Flash Trade API base URL (`https://flashapi.trade`) |
| `FLASH_API_TIMEOUT` | No | `30000` | HTTP timeout in milliseconds |
| `WALLET_PUBKEY` | No | — | Default wallet pubkey for transaction building |
| `KEYPAIR_PATH` | No | `~/.config/solana/id.json` | Local keypair for `sign_and_send` |
| `SOLANA_RPC_URL` | No | `https://api.mainnet-beta.solana.com` | RPC for `sign_and_send` |

### Claude Code (`.mcp.json`)

```json
{
  "mcpServers": {
    "flash-trade": {
      "command": "npx",
      "args": ["-y", "flash-trade-mcp"],
      "env": {
        "FLASH_API_URL": "https://flashapi.trade",
        "WALLET_PUBKEY": "<your-solana-pubkey>"
      }
    }
  }
}
```

### Claude Desktop (`claude_desktop_config.json`)

Same JSON block as above — add to the `mcpServers` section.

### Cursor / Windsurf

Add the same JSON block to your MCP settings. Use `npx` as the command.

## Tool Catalog (30 tools)

### Read Tools

| Tool | Purpose |
|------|---------|
| `health_check` | Verify API connectivity |
| `get_markets` / `get_market` | List all perp markets or get one by pubkey |
| `get_pools` / `get_pool` | List liquidity pools or get one by pubkey |
| `get_custodies` / `get_custody` | List custody accounts or get one by pubkey |
| `get_prices` / `get_price` | All oracle prices or one by symbol |
| `get_positions` / `get_position` | Positions (optionally by owner) or one by pubkey |
| `get_orders` / `get_order` | Orders (optionally by owner) or one by pubkey |
| `get_pool_data` | Pool AUM, LP stats, utilization |
| `get_account_summary` | Complete wallet overview: positions + orders + prices |
| `get_trading_overview` | Markets + prices + pool utilization snapshot |

### Preview Tools

| Tool | Purpose |
|------|---------|
| `preview_limit_order_fees` | Estimate fees before placing a limit order |
| `preview_exit_fee` | Estimate close cost |
| `preview_tp_sl` | Calculate TP/SL prices and projected PnL |
| `preview_margin` | Preview add/remove collateral effect |

### Transaction Tools

| Tool | Purpose |
|------|---------|
| `open_position` | Open a new perpetual position |
| `close_position` | Close or partially close a position |
| `reverse_position` | Close + open opposite direction |
| `add_collateral` | Add collateral to reduce leverage |
| `remove_collateral` | Remove collateral to increase leverage |

### Trigger Order Tools

| Tool | Purpose |
|------|---------|
| `place_trigger_order` | Place TP or SL on an existing position |
| `edit_trigger_order` | Edit price/size on an existing TP/SL |
| `cancel_trigger_order` | Cancel a single TP or SL order |
| `cancel_all_trigger_orders` | Cancel all TP/SL for a market + side |

### Signing Tool

| Tool | Purpose |
|------|---------|
| `sign_and_send` | Sign a base64 transaction with local keypair and submit to Solana |

## Typical AI Agent Workflow

```
1. health_check                          → Verify API is reachable
2. get_trading_overview                  → Markets, prices, pool utilization
3. get_account_summary(owner=<wallet>)   → Check existing positions and orders
4. open_position(input_amount="12.0")    → Build trade ($12+ for TP/SL support)
   → Show preview (fees, leverage, liquidation) to user
   → User approves
5. sign_and_send(transaction_base64)     → Sign and submit IMMEDIATELY
6. get_account_summary(owner=<wallet>)   → Verify position opened
7. preview_tp_sl                         → Calculate TP/SL levels
8. place_trigger_order                   → Add TP/SL
   → sign_and_send(transaction_base64)
9. close_position                        → When ready to exit
   → sign_and_send(transaction_base64)
```

**Critical timing**: Solana blockhashes expire in ~60 seconds. Call `sign_and_send` immediately after user approval.

## Common Gotchas for AI Agents

1. **$10 minimum**: Don't open $10 positions if you plan to set TP/SL — fees eat into collateral. Use $11-12 minimum.
2. **Always preview first**: Show entry price, fees, leverage, and liquidation price before signing.
3. **Sign immediately**: After user approves, call `sign_and_send` right away. Re-call the transaction tool if blockhash expires.
4. **Position key**: You need the position's on-chain pubkey (from `get_positions`) to close, add/remove collateral, or set TP/SL.
5. **Mainnet only**: Devnet returns stale or zero prices from Pyth oracles.
6. **API cache lag**: Data cached ~15 seconds. After closing a position, it may still show briefly.

## Platform Compatibility

| Platform | Supported | Notes |
|----------|-----------|-------|
| Claude Code (CLI) | Yes | Add to `.mcp.json` |
| Claude Desktop (app) | Yes | Add to `claude_desktop_config.json` |
| Cursor | Yes | Add via MCP settings |
| Windsurf | Yes | Add via MCP configuration |
| Claude.ai (website) | No | Requires remote HTTP transport |
