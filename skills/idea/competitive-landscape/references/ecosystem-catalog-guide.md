# Ecosystem Catalog Guide

How to search the solana-new catalogs for competitive intelligence.

## Available Catalogs

| Catalog | Count | Location |
|---------|-------|----------|
| Repos | 59 | `~/.claude/skills/data/catalogs/clonable-repos.json` |
| Skills | 66 | `~/.claude/skills/data/catalogs/solana-skills.json` |
| MCPs | 49 | `~/.claude/skills/data/catalogs/solana-mcps.json` |

These are installed automatically alongside the skills.

## How to Search

### Repos (clonable-repos.json)
- Each repo has: id, category, description, keywords, repo URL
- Categories: DeFi, Agents, Frontend, Programs, Infrastructure, Data, Gaming
- Search by keyword match on description + keywords fields
- A repo in the catalog means someone built something in this space

### Skills (solana-skills.json)
- Official skills (15): Solana Foundation maintained
- Community skills (55+): Protocol-specific (Jupiter, Drift, Orca, etc.)
- A skill existing means there's enough demand for guided development in that area

### MCPs (solana-mcps.json)
- Each MCP has: id, name, category, description, keywords
- An MCP existing means there's infrastructure supporting builders in that space

## What to Look For

1. **Direct hits**: A repo/skill/MCP that does exactly what the user wants to build → strong competition signal
2. **Adjacent tools**: Tools in the same category that solve a different problem → ecosystem health signal
3. **Missing tools**: No repos/skills/MCPs in the target space → either underserved or no demand
4. **Skill + MCP combos**: If both exist for a domain, the space is maturing

## Reporting

Always tell the user:
- How many catalog entries relate to their idea
- Which specific repos/skills/MCPs are most relevant
- Whether the ecosystem tooling supports or competes with their concept
