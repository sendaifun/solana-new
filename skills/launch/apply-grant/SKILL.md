---
name: apply-grant
description: Prepare an Agentic Engineering Grant application by gathering project data, git history, and context files, then presenting all fields needed to fill the Solana Earn grant form. Use when the user says "apply for grant", "agentic engineering grant", "apply-grant", "grant application", "fill grant form", or "200 USDG grant".
---

# Apply for Agentic Engineering Grant

Gather everything the user needs to submit an **Agentic Engineering Grant Application** on Solana Earn. The grant is fixed at 200 USDG. Present the output organized by the form's 3 steps so the user can copy-paste into the form.

## Skill Router

{{SKILL_ROUTER.md}}

---

## Grant Link

**Submit here**: https://superteam.fun/earn/grants/agentic-engineering

Always show this link to the user at the start and end of the skill.

## Workflow

### Phase 0 — Export session transcript

Before anything else, **run the bundled export script** to copy the current AI session transcript to the project root:

```bash
bash ~/.claude/skills/apply-grant/export-session.sh .
```

The script automatically:
- Finds the latest Claude Code session `.jsonl` from `~/.claude/projects/<project-slug>/` → copies as `./claude-session.jsonl`
- Finds the latest Codex session from `~/.codex/sessions/` → copies as `./codex-session.jsonl`

After running, confirm to the user which file(s) were exported and where they are. These files are proof of AI-assisted development for the grant application.

**Fallback**: If the script fails or no session is found, tell the user to manually export:
- **Claude Code**: Run `/export` in the chat — this saves a `.txt` transcript to the working directory. Attach that file instead.
- **Codex**: Session logs are in `~/.codex/sessions/` — find the latest `.jsonl` and copy it to the project root.

### Phase 1 — Collect project context

1. Look for `idea-context.md`, `build-context.md`, `README.md`, `package.json`, `Cargo.toml`, or `Anchor.toml` in the working directory.
2. Read `git log --oneline -20` for recent work history.
3. Read `git remote -v` to get the GitHub repo URL.
4. Check for any prior phase handoff files in `skills/data/specs/`.
5. Ask the user for any missing required fields (TG username, wallet address, X profile) that cannot be inferred.

### Phase 2 — Generate grant application draft

Present the output as a **copy-paste-ready** draft organized by the 3 form steps:

---

#### Step 1: Basics

| Field | Required | What to fill |
|-------|----------|-------------|
| **Project Title** | Yes | Infer from package.json name, Anchor.toml, or README title. Ask if unclear. |
| **One Line Description** | Yes | Generate a concise one-liner from project context. |
| **TG username** | Yes | Ask the user. Format: `t.me/<username>` |
| **Wallet Address** | Yes | Ask the user for their Solana wallet address. |

#### Step 2: Details

| Field | Required | What to fill |
|-------|----------|-------------|
| **Project Details** | Yes | Write a 2-4 paragraph description covering the problem statement and proposed solution. Pull from idea-context.md, build-context.md, and README. |
| **Deadline** | Yes | Ask the user for their target shipping deadline (timezone: Asia/Calcutta). |
| **Proof of Work** | Yes | Compile from: git history, shipped demos, deployed programs, live URLs, prior hackathon submissions, agent demos. Include links. |
| **Personal X Profile** | Yes | Ask the user. Format: `x.com/<handle>` |
| **Personal GitHub Profile** | No | Infer from git config or remote URL. Format: `github.com/<username>` |
| **Colosseum Crowdedness Score** | Yes | Remind the user to visit https://colosseum.com/copilot to get their project's Crowdedness Score, take a screenshot, upload to a publicly accessible Google Drive, and paste the link. |
| **AI Session Transcript** | Yes | Auto-exported in Phase 0. The file is at `./claude-session.jsonl` (Claude Code) or `./codex-session.jsonl` (Codex) in the project root — user should attach this to the form. |

#### Step 3: Milestones

| Field | Required | What to fill |
|-------|----------|-------------|
| **Goals and Milestones** | Yes | Generate 3-5 concrete milestones with dates based on the project scope and deadline. |
| **Primary KPI** | Yes | Suggest a single measurable metric (e.g., "X daily active users", "Y TVL", "Z transactions per day"). Ask user to confirm. |
| **Final tranche checkbox** | Yes | Remind the user: to receive the final tranche, they must submit the Colosseum project link, GitHub repo, and AI subscription receipt. |

---

### Phase 3 — Present the draft

Output the complete application as a structured markdown document with clear section headers matching the form steps. Use blockquotes (`>`) for each field value so the user can easily copy them.

Format example:

```
## Step 1: Basics

**Project Title**
> MyProject

**One Line Description**
> A one-liner describing the project.

**TG username**
> t.me/username

**Wallet Address**
> <user's wallet>
```

### Phase 4 — Iterate

After presenting the draft:
1. Ask the user to review each section.
2. Offer to refine any field.
3. Remind the user about the exported session file(s) in the project root.
4. Show the grant submission link: **https://superteam.fun/earn/grants/agentic-engineering**
5. Summarize what files the user should have ready to submit:
   - Session transcript (`./claude-session.jsonl` or `./codex-session.jsonl`)
   - Colosseum Crowdedness Score screenshot
   - The copy-paste-ready application text above

## Important Notes

- The grant amount is fixed at **200 USDG**.
- Always generate proof of work from actual git history and project artifacts — never fabricate.
- If the project has a Colosseum submission, reference it in proof of work.
- If prior skills have been used (idea validation, scaffold, build), reference those outputs as proof of work.
- Keep the tone professional but concise — grant reviewers read many applications.
