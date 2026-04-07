# Colosseum Copilot API Guide

Authenticated API for researching 5,400+ Solana hackathon projects, 65+ curated archive sources, and 30 ML-derived clusters. Requires a Personal Access Token (PAT).

- **Base URL**: `https://copilot.colosseum.com/api/v1`
- **Auth**: `Authorization: Bearer $COLOSSEUM_COPILOT_PAT`
- **Token lifespan**: 90 days, regenerate at https://arena.colosseum.org/copilot
- **Full OpenAPI spec**: `../../../data/colosseum/copilot-api.json`
- **Official docs**: https://docs.colosseum.com/copilot/api-reference

## Token Storage

Token is read from (in priority order):
1. `COLOSSEUM_COPILOT_PAT` environment variable
2. `~/.superstack/config.json` → `copilotToken` field

## Rate Limits

| Category | Limit | Endpoints |
|----------|-------|-----------|
| Search | 30 req/min | `/search/projects`, `/search/archives` |
| Analysis | 10 req/min | `/analyze`, `/compare` |
| Concurrency | 2 in-flight | All data endpoints |

Returns `429` with `Retry-After` header when exceeded.

## Key Endpoints

### Authentication

| Endpoint | What It Returns |
|----------|----------------|
| `GET /status` | Token validity, expiry date, scope |

### Discovery

| Endpoint | What It Returns |
|----------|----------------|
| `GET /filters` | All hackathons, tracks, clusters, tag vocabularies, archive sources |
| `GET /clusters/{key}` | Cluster summary, representative projects, top tags |

### Search

| Endpoint | What It Returns |
|----------|----------------|
| `POST /search/projects` | Similar projects by query (vector + text hybrid search) |
| `POST /search/archives` | Research papers, articles, blog posts from 65+ sources |
| `GET /projects/by-slug/{slug}` | Full project details (description, team, links, tags) |
| `GET /archives/{documentId}` | Paged document content |

### Analysis

| Endpoint | What It Returns |
|----------|----------------|
| `POST /analyze` | Tag/track distributions for a cohort (e.g., all winners) |
| `POST /compare` | Side-by-side cohort comparison with lift and delta scores |

### Community

| Endpoint | What It Returns |
|----------|----------------|
| `POST /source-suggestions` | Suggest a new archive source (5/hr) |
| `POST /feedback` | Report issues or suggestions (10/hr) |

## Common Patterns

### Find similar projects to an idea

```bash
curl -s -X POST "$COLOSSEUM_COPILOT_API_BASE/search/projects" \
  -H "Authorization: Bearer $COLOSSEUM_COPILOT_PAT" \
  -H "Content-Type: application/json" \
  -d '{"query": "AI agent payments on Solana", "limit": 8, "diversify": true}'
```

### Find what winners do differently

```bash
curl -s -X POST "$COLOSSEUM_COPILOT_API_BASE/compare" \
  -H "Authorization: Bearer $COLOSSEUM_COPILOT_PAT" \
  -H "Content-Type: application/json" \
  -d '{
    "cohortA": {"winnersOnly": true},
    "cohortB": {},
    "dimensions": ["problemTags", "solutionTags", "primitives", "techStack"],
    "topK": 10
  }'
```

Positive `delta` = winners over-index on this attribute. Negative = they under-index.

### Explore clusters (hot / winning / open)

```bash
# Get all clusters
curl -s -H "Authorization: Bearer $COLOSSEUM_COPILOT_PAT" \
  "$COLOSSEUM_COPILOT_API_BASE/filters" | jq '.clusters'

# Get cluster details
curl -s -H "Authorization: Bearer $COLOSSEUM_COPILOT_PAT" \
  "$COLOSSEUM_COPILOT_API_BASE/clusters/v1-c3"
```

### Search research archives

```bash
curl -s -X POST "$COLOSSEUM_COPILOT_API_BASE/search/archives" \
  -H "Authorization: Bearer $COLOSSEUM_COPILOT_PAT" \
  -H "Content-Type: application/json" \
  -d '{"query": "MEV on Solana", "limit": 5, "intent": "ideation"}'
```

Similarity > 0.4 = strong match. 0.2-0.4 = worth reading but verify.

### Filter projects by hackathon or winners

```bash
curl -s -X POST "$COLOSSEUM_COPILOT_API_BASE/search/projects" \
  -H "Authorization: Bearer $COLOSSEUM_COPILOT_PAT" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "DeFi lending",
    "limit": 10,
    "filters": {"winnersOnly": true},
    "hackathons": ["renaissance"]
  }'
```

### Analyze winner tech stack

```bash
curl -s -X POST "$COLOSSEUM_COPILOT_API_BASE/analyze" \
  -H "Authorization: Bearer $COLOSSEUM_COPILOT_PAT" \
  -H "Content-Type: application/json" \
  -d '{
    "cohort": {"winnersOnly": true},
    "dimensions": ["techStack", "primitives"],
    "topK": 15,
    "samplePerBucket": 2
  }'
```

### Get full project details

```bash
curl -s -H "Authorization: Bearer $COLOSSEUM_COPILOT_PAT" \
  "$COLOSSEUM_COPILOT_API_BASE/projects/by-slug/project-slug-here"
```

Returns description, team members (with GitHub/Twitter handles), links (GitHub, demo, presentation), and full tag set.

## Search Parameters Reference

### `/search/projects` filters

| Filter | Type | Description |
|--------|------|-------------|
| `winnersOnly` | boolean | Only prize-winning projects |
| `acceleratorOnly` | boolean | Only accelerator companies |
| `techStack` | string[] | Filter by tech (e.g., `["anchor", "web3.js"]`) |
| `primitives` | string[] | Filter by Solana primitives (e.g., `["pda", "cpi"]`) |
| `problemTags` | string[] | Filter by problem category |
| `solutionTags` | string[] | Filter by solution approach |
| `targetUsers` | string[] | Filter by target user segment |
| `clusterKeys` | string[] | Filter by ML cluster |
| `isUniversityProject` | boolean | University submissions only |
| `isSolanaMobile` | boolean | Mobile-focused projects only |

### Cohort definition (for `/analyze` and `/compare`)

All fields optional. Empty `{}` = all projects.

| Field | Type | Description |
|-------|------|-------------|
| `hackathons` | string[] | Limit to specific hackathons |
| `trackKeys` | string[] | Limit to specific tracks |
| `winnersOnly` | boolean | Winners only |
| `acceleratorOnly` | boolean | Accelerator companies only |
| `clusterKeys` | string[] | Limit to specific clusters |

### Compare dimensions

Available dimensions for `/analyze` and `/compare`:
- `tracks` — hackathon tracks
- `problemTags` — problem categories
- `solutionTags` — solution approaches
- `primitives` — Solana primitives (PDA, CPI, etc.)
- `techStack` — technologies used
- `targetUsers` — user segments
- `clusters` — ML-derived project clusters

## Archive Corpus (65+ Sources, 84,000+ Documents)

| Category | Coverage |
|----------|----------|
| Foundational | Cryptography mailing lists, Satoshi's posts/emails, Nick Szabo essays, prediction market theory |
| Solana Core | Protocol docs (SIMD), validator docs, developer forums, community calls, SPL references |
| Conference | Breakpoint 2022-2025 transcripts |
| Protocols | Jupiter, Orca, Raydium, Marinade, Tensor, Jito docs |
| Infrastructure | Helius RPC/DAS, Jito MEV research, Firedancer, Triton, gaming/DAO tooling |
| Security | Sec3, OtterSec, Neodyme audit and vulnerability research |
| Investment | Paradigm, a16z crypto, Multicoin, Pantera, Electric Capital, Galaxy Research, Coin Metrics |
| Essays | Paul Graham, Sam Altman, Colosseum blog, Superteam ecosystem analysis |

## Error Handling

| Status | Code | Retryable | Action |
|--------|------|-----------|--------|
| 400 | `INVALID_JSON` | No | Fix request syntax |
| 401 | `UNAUTHORIZED` | No | Token expired/invalid — regenerate at arena.colosseum.org/copilot |
| 429 | `RATE_LIMITED` | Yes | Wait for `Retry-After` header duration |
| 500 | `INTERNAL_ERROR` | Yes | Retry after brief delay |
| 503 | `SERVICE_UNAVAILABLE` | Yes | Infrastructure issue, retry later |

## Example Prompts

These are the kinds of questions users can answer with Copilot:

- "I'm a mobile developer. What consumer apps are people building on Solana?"
- "Has anyone tried agent payments on Solana? What happened?"
- "Compare gaming track submissions between Radar and Renaissance"
- "Is a privacy-preserving stablecoin technically feasible on Solana?"
- "What do hackathon winners build that losers don't?"
- "Show me the least crowded clusters with decent win rates"
