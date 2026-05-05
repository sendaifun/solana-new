# POH Integration Patterns

---

## Pattern 1 — Airdrop Filter (Bulk CSV)

Best for: snapshot-based distributions, retroactive airdrops, token launches.

```typescript
import fs from 'fs';

const POH_BASE = 'https://proofofhuman.ge/devnet';
const API_KEY  = process.env.POH_API_KEY!;
const MIN_CONFIDENCE = 0.7;

async function filterAirdropList(csvPath: string): Promise<string[]> {
  const addresses = fs.readFileSync(csvPath, 'utf-8')
    .split('\n').map(l => l.trim()).filter(Boolean);

  // Check pricing first
  const pricing = await fetch(`${POH_BASE}/checker/pricing?count=${addresses.length}`)
    .then(r => r.json());
  console.log(`Scan cost: ${pricing.total / 1e6} POH for ${addresses.length} addresses`);

  // Submit bulk job
  const { jobId } = await fetch(`${POH_BASE}/checker`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input: addresses, apiKey: API_KEY }),
  }).then(r => r.json());

  // Poll until done
  while (true) {
    const job = await fetch(`${POH_BASE}/checker/job/${jobId}`).then(r => r.json());
    console.log(`${job.percent}% — ${job.done}/${job.total}`);
    if (job.status === 'done') {
      return job.results
        .filter((r: any) =>
          r.verdict === 'HUMAN' && r.confidence >= MIN_CONFIDENCE
        )
        .map((r: any) => r.address);
    }
    await new Promise(res => setTimeout(res, 3000));
  }
}

const eligible = await filterAirdropList('./snapshot.csv');
console.log(`${eligible.length} eligible human wallets`);
```

---

## Pattern 2 — Live DAO Gate (Server-side middleware)

Best for: governance votes, proposal submissions, forum posting.

```typescript
import express from 'express';

const POH_BASE = 'https://proofofhuman.ge/devnet';

async function requireHuman(req: express.Request, res: express.Response, next: express.NextFunction) {
  const wallet = req.body.walletAddress as string;
  if (!wallet) return res.status(400).json({ error: 'walletAddress required' });

  try {
    const scan = await fetch(`${POH_BASE}/checker`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: wallet, apiKey: process.env.POH_API_KEY }),
    }).then(r => r.json());

    // Poll brain verdict (max 10s)
    let verdict = { status: 'pending', verdict: 'UNCERTAIN', confidence: 0 };
    for (let i = 0; i < 5; i++) {
      await new Promise(r => setTimeout(r, 2000));
      verdict = await fetch(`${POH_BASE}/checker/brain/${scan.brainKey}`).then(r => r.json());
      if (verdict.status === 'done') break;
    }

    if (verdict.verdict === 'HUMAN' && verdict.confidence >= 0.7) {
      req.body._pohVerified = true;
      return next();
    }

    if (verdict.verdict === 'UNCERTAIN') {
      // UNCERTAIN = insufficient signal, not "is a bot" — never hard-block, pass with warning flag
      req.body._pohVerified = false;
      req.body._pohUncertain = true;
      return next();
    }

    return res.status(403).json({ error: 'Bot activity detected.', verdict: verdict.verdict });
  } catch {
    // Fail open — never block on POH infrastructure failure
    req.body._pohVerified = false;
    return next();
  }
}

app.post('/vote', requireHuman, submitVote);
```

---

## Pattern 3 — NFT Mint Allowlist (Frontend + Backend)

Best for: NFT mints, presale access, token-gated features.

```typescript
// Frontend — check eligibility before showing mint button
import { useWallet } from '@solana/wallet-adapter-react';

function MintButton() {
  const { publicKey } = useWallet();
  const [eligible, setEligible] = useState<boolean | null>(null);

  useEffect(() => {
    if (!publicKey) return;
    checkEligibility(publicKey.toString()).then(setEligible);
  }, [publicKey]);

  if (eligible === null) return <span>Checking eligibility...</span>;
  if (!eligible) return <span>Not eligible — insufficient on-chain identity.</span>;
  return <button onClick={mint}>Mint</button>;
}

async function checkEligibility(wallet: string): Promise<boolean> {
  const res = await fetch('/api/check-human', {
    method: 'POST',
    body: JSON.stringify({ wallet }),
    headers: { 'Content-Type': 'application/json' },
  });
  const { human } = await res.json();
  return human;
}

// Backend route — /api/check-human
app.post('/api/check-human', async (req, res) => {
  const { wallet } = req.body;
  const { brainKey } = await fetch(`${POH_BASE}/checker`, {
    method: 'POST',
    body: JSON.stringify({ input: wallet, apiKey: process.env.POH_API_KEY }),
    headers: { 'Content-Type': 'application/json' },
  }).then(r => r.json());

  for (let i = 0; i < 8; i++) {
    await new Promise(r => setTimeout(r, 1500));
    const v = await fetch(`${POH_BASE}/checker/brain/${brainKey}`).then(r => r.json());
    if (v.status === 'done') {
      return res.json({ human: v.verdict === 'HUMAN' && v.confidence >= 0.7 });
    }
  }
  res.json({ human: true }); // timeout — fail open (POH infra failure must never block users)
});
```

---

## Pattern 4 — Anchor Program (On-chain POH check via oracle)

Best for: Solana programs that need sybil resistance at the instruction level.

POH does not yet have an on-chain oracle program (mainnet roadmap). For now, implement a **two-step approach**:

1. Off-chain: call POH API server-side and sign the result with your backend keypair
2. On-chain: verify the backend signature in your Anchor instruction before proceeding

```rust
// Anchor instruction — verify backend signature off-chain, validate on-chain
#[derive(Accounts)]
pub struct HumanGatedAction<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    /// CHECK: verified by backend oracle signature
    pub oracle_authority: AccountInfo<'info>,
}

pub fn human_gated_action(
    ctx: Context<HumanGatedAction>,
    poh_verdict: u8,      // 1 = HUMAN, 0 = NOT_HUMAN
    confidence_bps: u16,  // basis points, e.g. 8700 = 0.87
    oracle_sig: [u8; 64],
) -> Result<()> {
    require!(poh_verdict == 1, ErrorCode::NotHuman);
    require!(confidence_bps >= 7000, ErrorCode::LowConfidence);
    // Verify oracle_sig over (user.key, poh_verdict, confidence_bps) here
    // ... instruction logic
    Ok(())
}
```

---

## Caching Strategy

Never re-scan the same address within a session:

```typescript
const pohCache = new Map<string, { verdict: string; confidence: number; ts: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

async function getCachedVerdict(address: string) {
  const cached = pohCache.get(address);
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) return cached;
  const result = await scanAndPoll(address);
  pohCache.set(address, { ...result, ts: Date.now() });
  return result;
}
```

---

## UNCERTAIN Policy Options

| Policy | When to use | Implementation |
|---|---|---|
| **Fail open** | Non-critical features | Allow through, log for review |
| **Prompt to build history** | Community features | Show message: "Scan again after more on-chain activity" |
| **Manual review queue** | High-value distributions | Add to pending list, human review within 24h |
| **Confidence-only gate** | Flexible gates | Use `count` (signals passed) as fallback: require `count >= 3` |
