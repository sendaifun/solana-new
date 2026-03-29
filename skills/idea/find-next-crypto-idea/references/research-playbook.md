# Research Playbook

Fresh research is mandatory before finalizing the shortlist.

## Script Usage

When you already have candidate ideas, use `../scripts/live_research.py` to generate:

- `research-pack.json`
- browser-first X search URLs
- GitHub and broader-web search URLs
- an optional worksheet HTML with clickable links

Typical flow:

1. produce or narrow candidate ideas
2. write a small JSON payload with `user_context` and `ideas`
3. run `live_research.py`
4. inspect the normalized pack
5. browse the highest-signal queries
6. finalize the ranking

Example:

```bash
python3 scripts/live_research.py shortlist.json \
  --output research-pack.json \
  --worksheet research-worksheet.html \
  --open x \
  --browser frontmost
```

## Research Order

1. `X`
2. `GitHub`
3. official docs, company sites, protocol docs
4. broader web search

If browser-based X search is available, prefer it over generic web search. If X cannot be accessed reliably, say so and fall back to web search plus official sources.

## What To Look For

### X

Look for:

- user complaints
- "why is there no..."
- founder launch threads
- evidence of active communities
- signs that the problem is sharp but underserved

Good signals:

- repeated frustration from credible operators
- real buyers using ugly workarounds
- launch threads with substantive replies from target users

## GitHub

Look for:

- active repos with recent commits
- abandoned repos in the same space
- OSS substitutes
- SDKs or infra layers that reduce MVP time

Capture:

- repo name
- star count if relevant
- last meaningful activity
- what the repo proves or fails to prove

## Official Sources

Use official docs or sites to answer:

- what incumbents actually ship
- whether a protocol or company already covers the wedge
- whether the technical thesis is plausible

## Helius Blog

Fetch `https://www.helius.dev/blog` for Solana-specific ecosystem intelligence:

- infrastructure trends (compression, priority fees, token extensions, DAS API)
- builder pain points and what the ecosystem is investing in
- technical deep-dives that reveal gaps or emerging primitives
- use recent posts to validate whether a technical thesis is timely

## Broader Web

Use broader search to find:

- direct competitors
- adjacent substitutes
- pricing pages
- product announcements
- customer evidence

## Competitor Mapping

For every serious candidate, identify:

- direct competitors
- adjacent substitutes
- open-source alternatives
- obvious Web2 incumbents

Always ask:

`Why hasn't the incumbent won already?`

## Research Discipline

- Kill weak ideas quickly. Do not over-research to justify them.
- Do not confuse "no direct crypto competitor" with novelty.
- A Web2 substitute can be a much stronger competitive threat than another crypto startup.
- Prefer opening only the highest-signal X queries. Do not explode into dozens of tabs without a reason.
