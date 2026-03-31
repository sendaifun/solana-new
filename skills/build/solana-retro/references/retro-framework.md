# Retro Framework Reference

Structured sprint retrospective framework for Solana projects. Combines git history analysis with velocity tracking and action item management.

---

## Git History Analysis

### How to Gather Data

```bash
# Commit summary for the sprint window (default: last 7 days)
git log --since="7 days ago" --oneline

# Detailed stats: lines added/removed, files changed
git log --since="7 days ago" --stat

# Just the numbers
git log --since="7 days ago" --shortstat --oneline

# Count of commits per author
git shortlog --since="7 days ago" -sn

# PRs merged (merge commits)
git log --merges --since="7 days ago" --oneline

# Files most frequently changed (hotspots)
git log --since="7 days ago" --name-only --pretty=format: | sort | uniq -c | sort -rn | head -20

# Branch activity
git branch --sort=-committerdate --format='%(refname:short) %(committerdate:relative)'

# Diff stat against main (if on a feature branch)
git diff main...HEAD --stat
```

### What to Extract

- **Total commits**: Raw count of commits in the time window.
- **Lines added / removed**: Net code change. High removal ratio suggests refactoring.
- **Files changed**: Number of unique files touched.
- **Top contributors**: Ranked by commit count.
- **Merge commits**: Indicates PRs merged, a proxy for features completed.
- **Hotspot files**: Files changed most frequently — may need refactoring or are core to current work.
- **Branch activity**: Active branches, stale branches, recently merged branches.

### Presentation Format

```
Sprint: March 24 - March 31, 2026

Commits:       42
Lines added:   1,847
Lines removed:  623
Files changed:  31
PRs merged:      5
Contributors:    3
```

---

## Sprint Metrics

### Commits Per Day Trend

Calculate daily commit counts over the sprint window. Show as a simple bar chart or table.

```
Mon: ████████ 8
Tue: ██████ 6
Wed: ██████████ 10
Thu: ████████████ 12
Fri: ██████ 6
Sat: 0
Sun: 0
```

### Lines Added vs Removed Ratio

- **Ratio > 3:1 (added:removed)**: Feature-heavy sprint. New functionality being built.
- **Ratio 1:1 to 2:1**: Balanced sprint. Mix of features and cleanup.
- **Ratio < 1:1 (more removed than added)**: Refactoring sprint. Simplification and debt reduction.
- **High both**: Large-scale rewrite or migration.

### New Files vs Modified Files

- **Mostly new files**: Greenfield development, new modules being created.
- **Mostly modified files**: Iteration on existing code, bug fixes, enhancements.
- **Mixed**: Normal development cadence.

### Test Coverage Change

If measurable (e.g., from test output or coverage reports):

```bash
# Count test files added/modified
git log --since="7 days ago" --name-only --pretty=format: | grep -E '\.(test|spec)\.(ts|js|rs)$' | sort -u | wc -l

# Count total test assertions added (rough proxy)
git diff HEAD~N -- '*.test.*' '*.spec.*' | grep '^+.*expect\|assert\|it(' | wc -l
```

Track whether test count increased proportionally to feature code.

---

## What Went Well

### Identification Criteria

Look for these signals in the git history:

1. **Large PRs merged**: PRs with significant line counts that landed successfully. These represent substantial completed work.
2. **New feature files**: New modules, components, or programs added to the codebase.
3. **Bug fix commits**: Commits with "fix", "bug", "resolve" in the message — problems solved.
4. **Test additions**: New test files or significant test additions — quality investment.
5. **Performance improvements**: Commits mentioning "optimize", "performance", "speed" — measurable improvements.
6. **Deployment milestones**: Commits related to deployment, especially first-time deploys.

### Presentation Format

Be specific. Link to commits or PRs.

Good:
- "Shipped the token swap instruction — 3 PRs merged, 847 lines of program logic. Commit: abc1234"
- "Added comprehensive test suite for the vault program — 12 new test cases covering all error paths"
- "Deployed to devnet successfully on March 28. Program ID: Abc123..."

Bad (too generic):
- "Made good progress"
- "Things went well"
- "Wrote some code"

---

## What Needs Improvement

### Identification Criteria

1. **Stalled branches**: Branches with no commits in 3+ days.
   ```bash
   git for-each-ref --sort=committerdate --format='%(refname:short) %(committerdate:relative)' refs/heads/ | grep -E '(days|weeks|months) ago'
   ```

2. **Repeated fix attempts**: Multiple commits on the same issue (e.g., "fix X", "fix X again", "actually fix X"). Indicates unclear root cause or insufficient debugging.
   ```bash
   git log --since="7 days ago" --oneline | grep -i 'fix'
   ```

3. **Missing tests for new code**: New source files without corresponding test files.
   ```bash
   # Compare new source files vs new test files
   git log --since="7 days ago" --name-only --diff-filter=A --pretty=format: | sort -u
   ```

4. **Large uncommitted changes**: Working tree has significant uncommitted changes — risk of lost work.
   ```bash
   git status --short | wc -l
   ```

5. **No deployments**: If the goal was to deploy and it did not happen, note why.

6. **CI failures**: If CI is configured, check for failing builds in the sprint window.

### Presentation Format

Be specific and constructive. Include actionable next steps.

Good:
- "Branch `feature/oracle-integration` has been open for 9 days with no activity since March 22. Either merge, close, or document the blocker."
- "The `process_swap` instruction was fixed 4 times this sprint (commits abc1234, def5678, ...). Consider writing a regression test before the next attempt."

Bad:
- "Some things could be better"
- "We had some issues"

---

## Action Items

### Structure

Each action item must be:
- **Specific**: What exactly needs to be done.
- **Assignable**: Who should do it (or mark as unassigned if solo developer).
- **Time-bound**: When it should be done by (default: next sprint).
- **Prioritized**: High / Medium / Low based on impact.

### Maximum Count

Keep to 3-5 action items per retro. More than 5 dilutes focus.

### Carry-Forward

If prior retros exist in build context (`retro.action_items`), check which items were completed and which need to carry forward. Carrying forward the same item for 3+ sprints is a red flag — either do it, descope it, or acknowledge it is not a priority.

### Presentation Format

```
Action Items:
1. [HIGH] Write regression tests for process_swap instruction — due next sprint
2. [HIGH] Close or merge stale feature/oracle-integration branch — due this week
3. [MEDIUM] Set up CI pipeline for automated test runs — due next sprint
4. [LOW] Refactor token account helper functions into shared module — backlog

Carried forward from last sprint:
- [MEDIUM] Set up CI pipeline — carried for 2 sprints (originally Sprint 3)
```

---

## Velocity Calculation

### Metrics to Track

Track these across sprints for trend analysis:

1. **Commits per sprint**: Raw activity measure.
2. **PRs merged per sprint**: Proxy for completed features/fixes.
3. **Lines of code changed per sprint**: Effort measure (add + remove).
4. **Features completed per sprint**: Based on commit messages and PR titles (requires tagging or naming conventions).

### Trend Calculation

Compare against the prior 3 sprints (or as many as are available).

```typescript
function calculateTrend(
  currentValue: number,
  priorValues: number[]
): "improving" | "stable" | "declining" {
  if (priorValues.length === 0) return "stable"; // No history

  const priorAvg = priorValues.reduce((a, b) => a + b, 0) / priorValues.length;

  if (priorAvg === 0) return currentValue > 0 ? "improving" : "stable";

  const changePercent = ((currentValue - priorAvg) / priorAvg) * 100;

  if (changePercent > 10) return "improving";
  if (changePercent < -10) return "declining";
  return "stable";
}
```

### Trend Categories

- **Improving** (>10% increase): Team is shipping more than usual. Possible causes: unblocked work, reduced meetings, easier tasks, added contributors.
- **Stable** (within +-10%): Consistent output. This is healthy for sustained development.
- **Declining** (>10% decrease): Output is dropping. Investigate: blockers, burnout, increased complexity, context switching.

### Presentation Format

```
Velocity Trend: IMPROVING (+23% vs prior 3-sprint average)

Sprint 5 (current): 42 commits, 5 PRs, 2,470 lines changed
Sprint 4:           38 commits, 4 PRs, 1,890 lines changed
Sprint 3:           31 commits, 3 PRs, 1,560 lines changed
Sprint 2:           35 commits, 4 PRs, 1,720 lines changed

3-sprint average:   34.7 commits, 3.7 PRs, 1,723 lines changed
```

Always show the raw numbers alongside the trend label so the user can draw their own conclusions.
