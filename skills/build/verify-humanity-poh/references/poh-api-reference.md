# POH API Reference

Base URL: `https://proofofhuman.ge/devnet`

---

## POST /checker

Scan one or more wallet addresses. Runs 120+ detection methods in parallel across 32 EVM chains and Solana.

### Request

```json
{
  "input": "string | string[]",
  "walletAddress": "string",
  "apiKey": "string",
  "txHash": "string",
  "chainIds": "string"
}
```

| Field | Required | Description |
|---|---|---|
| `input` | yes | EVM address, Solana base58, ENS/ZNS domain, or array of addresses |
| `walletAddress` | free tier | Your Solana wallet — counts against 100 free scans |
| `apiKey` | paid | API key from profile — required for >100 scans |
| `txHash` | paid | POH token burn tx hash — required for paid bulk scans |
| `chainIds` | no | Comma-separated EVM chain IDs to filter (e.g. `"1,56"`) |

### Response — Single Address (synchronous)

```json
{
  "result": [
    {
      "id": "method-id",
      "description": "ETH Balance > 0.01",
      "type": "evm",
      "passed": true,
      "weight": 1.2
    }
  ],
  "count": 4,
  "brainKey": "abc123",
  "freeScansLeft": 96
}
```

### Response — Multiple Addresses (async job)

```json
{
  "jobId": "job-uuid",
  "status": "queued",
  "total": 500,
  "pollUrl": "/checker/job/job-uuid"
}
```

---

## GET /checker/job/:jobId

Poll bulk scan job status. Retained 2 hours after completion.

```json
{
  "jobId": "...",
  "status": "queued | running | done",
  "total": 500,
  "done": 312,
  "percent": 62,
  "results": [...],
  "errors": [...]
}
```

---

## GET /checker/brain/:key

Poll for the async AI verdict. `brainKey` returned by POST /checker.

```json
{
  "status": "pending | done | error",
  "verdict": "HUMAN | AI | UNCERTAIN",
  "confidence": 0.87,
  "reasoning": "Strong on-chain activity across 4 independent signals. ENS name, Galxe identity, and RWA holdings are rare for automated accounts.",
  "signal_contributions": {
    "ETH Balance": 0.3,
    "ENS Name": 0.25,
    "Galxe Identity": 0.2,
    "PAXG Holder": 0.12
  },
  "conflicts": []
}
```

### Verdict Interpretation

| Verdict | Confidence | Meaning |
|---|---|---|
| `HUMAN` | ≥ 0.8 | Strong evidence of human activity |
| `HUMAN` | 0.6–0.79 | Moderate evidence — consider threshold |
| `HUMAN` | < 0.6 | Weak evidence — treat as UNCERTAIN |
| `UNCERTAIN` | any | Insufficient signal — not enough on-chain history |
| `AI` | any | Bot/automated patterns detected |

**Recommended threshold:** Require `verdict === "HUMAN" && confidence >= 0.7` to pass.

---

## GET /checker/pricing?count=N

Pre-flight cost check before bulk scan.

```json
{
  "count": 100,
  "perAddress": 0.55,
  "total": 55000000,
  "tiers": [
    { "min": 1, "max": 99, "price": 0.70 },
    { "min": 100, "max": 499, "price": 0.55 },
    { "min": 500, "max": null, "price": 0.40 }
  ]
}
```

Prices in POH token micro-units (6 decimals). 1 POH = 1 000 000 units.

---

## Profile & API Keys

### POST /profile/signup

Create profile and get API key.

```json
{
  "address": "YourSolanaWallet",
  "signature": "base58-ed25519-sig",
  "message": "poh-profile-v1:{address}:{timestamp}"
}
```

Message must be signed with `signMessage` (ed25519). Valid for 5 minutes.

Response: `{ "profile": { "apiKey": "uuid", "freeScansLeft": 100, ... } }`

### GET /profile/:address

Get API key, balance, and scan stats.

### POST /profile/faucet

**Devnet only.** Get 10 000 POH test tokens. 24-hour cooldown.

```json
{ "address": "YourSolanaWallet" }
```

---

## Error Codes

| Status | Meaning |
|---|---|
| 400 | Bad request — missing fields or invalid address format |
| 401 | Invalid signature |
| 402 | Payment required — burn tx not verified |
| 403 | Faucet not available on mainnet |
| 404 | Profile / job not found |
| 429 | Faucet cooldown active — try again in Xh Ym |
| 503 | Backend wallet not configured (claim/faucet only) |

---

## Detection Method Types

| Type | Source | Examples |
|---|---|---|
| `evm` | EVM contract call | ETH balance, ENS, PAXG, Ondo, staking |
| `solana` | Solana program | SPL balance, Parcl, Helium, Artrade |
| `rest` | HTTP identity API | Galxe, web3.bio, Farcaster, GitHub, Lens |
