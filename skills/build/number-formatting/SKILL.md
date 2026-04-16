---
name: number-formatting
description: Apply consistent number formatting across crypto/Solana UIs. Use when the user says "format numbers", "number display", "token amounts", "price formatting", "zero subscript", "abbreviate numbers", "format currency", "format percent", "how should I display this number", "number formatting spec", or when generating any UI component that displays prices, balances, percentages, ratios, or token amounts. Use proactively whenever writing frontend code that renders numeric values — do not wait to be asked.
---

## Preamble (run first)

```bash
_TEL_TIER=$(cat ~/.superstack/config.json 2>/dev/null | grep -o '"telemetryTier": *"[^"]*"' | head -1 | sed 's/.*"telemetryTier": *"//;s/"$//'  || echo "anonymous")
_TEL_TIER="${_TEL_TIER:-anonymous}"
_TEL_PROMPTED=$([ -f ~/.superstack/.telemetry-prompted ] && echo "yes" || echo "no")
_TEL_START=$(date +%s)
_SESSION_ID="$$-$(date +%s)"
mkdir -p ~/.superstack
echo "TELEMETRY: $_TEL_TIER"
echo "TEL_PROMPTED: $_TEL_PROMPTED"
if [ "$_TEL_TIER" != "off" ]; then
_TEL_EVENT='{"skill":"number-formatting","phase":"build","event":"started","ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}'
echo "$_TEL_EVENT" >> ~/.superstack/telemetry.jsonl 2>/dev/null || true
_CONVEX_URL=$(cat ~/.superstack/config.json 2>/dev/null | grep -o '"convexUrl":"[^"]*"' | head -1 | cut -d'"' -f4 || echo "")
[ -n "$_CONVEX_URL" ] && curl -s -X POST "$_CONVEX_URL/api/mutation" -H "Content-Type: application/json" -d '{"path":"telemetry:track","args":{"skill":"number-formatting","phase":"build","status":"success","version":"0.2.0","platform":"'$(uname -s)-$(uname -m)'","timestamp":'$(date +%s)000'}}' >/dev/null 2>&1 &
true
fi
```

If `TEL_PROMPTED` is `no`: Before starting the skill workflow, ask the user about telemetry.
Use AskUserQuestion:

> Help superstack get better! We track which skills get used and how long they take —
> no code, no file paths, no PII. Change anytime in `~/.superstack/config.json`.

Options:
- A) Sure, help superstack improve (anonymous)
- B) No thanks

If A: run this bash:
```bash
echo '{"telemetryTier":"anonymous"}' > ~/.superstack/config.json
_TEL_TIER="anonymous"
touch ~/.superstack/.telemetry-prompted
```

If B: run this bash:
```bash
echo '{"telemetryTier":"off"}' > ~/.superstack/config.json
_TEL_TIER="off"
touch ~/.superstack/.telemetry-prompted
```

This only happens once. If `TEL_PROMPTED` is `yes`, skip this entirely and proceed to the skill workflow.

> **Wrong skill?** See [SKILL_ROUTER.md](../../SKILL_ROUTER.md) for all available skills.

# Number Formatting

A strict, enforceable standard for displaying numbers in crypto and Solana UIs. This skill exists because number formatting in crypto is uniquely hard — tokens span 18 orders of magnitude ($84,000 BTC to $0.00005835 BONK), users make financial decisions based on displayed values, and inconsistent formatting destroys trust.

This is display-only. Internal math always uses raw precision.

## When to fire this skill

Apply these rules any time you are:

- Writing a React component that displays prices, balances, percentages, PnL, ratios, or token amounts
- Reviewing UI code that renders numeric values
- Building a table, card, watchlist, portfolio view, or any data-dense surface
- A user asks "how should I format this number", "why does this look weird", or "the numbers are jittering"
- Implementing copy/export functionality for displayed numbers

If you are generating frontend code that displays numbers and this skill has *not* been triggered, trigger it yourself. Do not wait for the user to ask. Every number in a crypto UI is a trust signal.

## Non-Negotiables

1. **Never show scientific notation.** `1.52e12` must display as `$1.52T`. No exceptions.
2. **Never truncate with ellipsis.** Numbers are not text. If a number doesn't fit, reduce decimals -> abbreviate -> tiny marker -> scale font. Never `123,456...`.
3. **Never show `-0.00` or `-$0.00`.** Signed zero is forbidden. Catch it explicitly.
4. **Never show `NaN`, `undefined`, `Infinity`, or crash on null.** All render as `--`.
5. **Never hardcode decimal places.** Token amounts use dynamic decimals based on token price. `formatTokenAmount(amount, 2)` is almost always wrong.
6. **Always use `font-mono tabular-nums`.** Numbers that don't use tabular numerals jitter on live updates and misalign in tables. This is non-negotiable.
7. **Copy gives raw precision.** When a user copies `$1.2K`, their clipboard gets `1234.5`. When they copy `0.0₄58`, they get `0.00005835`.
8. **Zero-subscript gets an `aria-label`.** Screen readers can't parse `0.0₄58` — provide the expanded decimal.

## Workflow

### Mode 1: Building new components

1. Read [references/formatting-spec.md](references/formatting-spec.md) — the complete spec with all type rules, pipeline, and examples.
2. Read [references/implementation-guide.md](references/implementation-guide.md) — TypeScript types, helper functions, and the `<FormattedNumber>` React component pattern.
3. Identify every number rendered in the component. Classify each by type (`fiat_value`, `stable_value`, `token_amount`, `token_price`, `percent`, `ratio`) and context (`compact` or `detailed`).
4. Implement formatting using the pipeline from the spec. Use the implementation guide as a starting point — adapt to the project's existing patterns.
5. Verify against the examples table in the spec. Spot-check at least: one zero, one tiny value, one zero-subscript case, one abbreviation, and one null.
6. Run the review checklist in [references/review-checklist.md](references/review-checklist.md) before reporting complete.

### Mode 2: Reviewing existing code

1. Read [references/formatting-spec.md](references/formatting-spec.md) to load the rules.
2. Read [references/review-checklist.md](references/review-checklist.md) for the full checklist.
3. Scan the codebase for number formatting patterns:
   ```bash
   # Find formatting functions
   grep -rn "format\|toFixed\|toLocaleString\|Intl.NumberFormat\|decimals\|precision" --include="*.ts" --include="*.tsx" | head -30
   # Find hardcoded decimal places
   grep -rn "\.toFixed(" --include="*.ts" --include="*.tsx" | head -20
   # Find number display components
   grep -rn "tabular-nums\|font-mono.*num\|formatNumber\|formatPrice\|formatAmount\|formatPercent" --include="*.ts" --include="*.tsx" | head -20
   ```
4. For each number display found, verify against the spec. Common violations:
   - Hardcoded `.toFixed(2)` on token amounts (should be dynamic)
   - Missing null/NaN handling (crashes or shows `NaN`)
   - No `tabular-nums` on live-updating values (causes jitter)
   - Abbreviations used on token prices (never allowed)
   - Missing zero-subscript for micro-cap tokens ($0.00005835 showing as `$0.00`)
   - No `aria-label` on zero-subscript displays
   - Copy pastes the formatted string instead of raw value
5. Report findings as a table: location, current behavior, expected behavior, severity.
6. Fix violations or provide exact code patches.

### Mode 3: Quick lookup

If the user asks "how should I format X", answer directly from the spec without running a full workflow. Reference the type rules and examples table. Show both compact and detailed output.

## The Six Types

| Type | Prefix/Suffix | Abbreviate? | Zero-subscript? | Zero display |
|------|--------------|-------------|-----------------|-------------|
| `fiat_value` | `$` prefix | Yes (K/M/B/T) | No | `$0.00` |
| `stable_value` | `$` prefix | Yes (K/M/B/T) | No | `$0.00` |
| `token_amount` | none | Compact only | Yes | `0` |
| `token_price` | `$` prefix | Never | Yes | `$0.00` |
| `percent` | `%` suffix | Never | No | `0.00%` |
| `ratio` | `x` suffix | Never | No | `0x` |

## The Pipeline (decision order)

```
null/invalid/inf? -> "--"
  -> exact 0? -> type zero
  -> rounds to 0? -> tiny marker ("<$0.01" etc.)
  -> >= 3 leading zeros? -> zero-subscript (0.0ₙXYZ)
  -> compact context & magnitude >= 1K & abbrev allowed for type? -> abbreviate (K/M/B/T)
  -> normal format with computed decimals (detailed always uses full value with commas)
  -> exceeds width? reduce decimals -> abbreviate -> tiny marker -> scale font
  -> NEVER overflow. NEVER ellipsis-truncate.
```

## Integration with Other Skills

This skill is a dependency for any UI work. It pairs with:

- **`frontend-design-guidelines`** — the design guidelines skill references `font-mono tabular-nums` and token amounts but defers the full number formatting logic to this skill. When both fire, this skill is authoritative for number display rules.
- **`solana-ui-patterns`** (reference in frontend-design-guidelines) — covers wallet connect, transaction dialogs, and balance displays. This skill supersedes the basic "token amounts" section in that reference with the full spec.
- **`brand-design`** — brand colors may affect positive/negative number coloring. This skill defines the sign/direction rules; brand-design provides the palette.

## Quick Reference

**Zero-subscript** (>= 3 leading zeros after decimal):
```
0.00005835 -> compact: 0.0₄58    detailed: 0.0₄5835
```

**Abbreviations** (fiat/stable, compact token_amount):
```
1,234.50   -> compact: $1.2K     detailed: $1,234.50
1.52T      -> compact: $1.5T     detailed: $1.52T
```

**Tiny markers** (rounds to zero but isn't zero):
```
fiat 0.004     -> <$0.01
percent 0.004  -> <0.01%
ratio 0.004    -> <0.01x
```

**Dynamic token decimals:**
```
decimals = ceil(-log10(threshold / token_price_usd))
compact threshold: $0.01, clamp 0-6
detailed threshold: $0.0001, clamp 0-12
```

## Resources

### references/

- [references/formatting-spec.md](references/formatting-spec.md) — The complete number formatting spec v1.0. All type rules, pipeline, sign policy, abbreviations, zero-subscript, and the full examples table. This is the source of truth.
- [references/implementation-guide.md](references/implementation-guide.md) — TypeScript types, pipeline implementation, zero-subscript helper, abbreviation helper, sign helper, `<FormattedNumber>` React component, usage examples, CSS requirements, copy-to-clipboard pattern, and testing strategy.
- [references/review-checklist.md](references/review-checklist.md) — Point-by-point review checklist covering pipeline compliance, type correctness, zero-subscript, abbreviations, sign policy, display quality, accessibility, and copy/export. Use before marking any number-formatting work as complete.

### Cross-skill references

- `frontend-design-guidelines` references/solana-ui-patterns.md — basic token amount patterns (this skill provides the authoritative, complete version)
- `frontend-design-guidelines` references/stack-defaults.md — `font-mono tabular-nums` as part of the default typography system

## Quick Start

```bash
# Triggers:
#   "format numbers in my UI"
#   "how should I display token prices?"
#   "review number formatting in my app"
#   "the numbers look wrong / are jittering"
#   "implement the number formatting spec"
#   Automatically fires when writing any component that displays numeric values
```

## Decision Points

- **Which type?** If it has a `$` prefix and represents USD value -> `fiat_value`. If it's a stablecoin balance shown as dollar value -> `stable_value`. If it's a raw token quantity -> `token_amount`. If it's the price of 1 token -> `token_price`. If it ends with `%` -> `percent`. If it ends with `x` -> `ratio`.
- **Compact or detailed?** Compact for tables, cards, watchlists, and anywhere space is tight. Detailed for confirmation screens, order entry, and detail views where precision matters.
- **Dynamic decimals for token_amount:** always needs `tokenPriceUsd`. If you don't have the price, you can't compute the right number of decimals — fetch it or fall back to a sensible default (4 decimals) and flag it as approximate.
- **Zero-subscript rendering:** uses Unicode subscript digits (₀₁₂₃₄₅₆₇₈₉). Verify your font renders them — most modern system fonts and Google Fonts do. If your font doesn't, fall back to `<sub>` tags.

## Telemetry (run last)

After the skill workflow completes (success, error, or abort), log the telemetry event.
Determine the outcome from the workflow result: `success` if completed normally, `error`
if it failed, `abort` if the user interrupted.

Run this bash:

```bash
_TEL_END=$(date +%s)
_TEL_DUR=$(( _TEL_END - ${_TEL_START:-$_TEL_END} ))
_TEL_TIER=$(cat ~/.superstack/config.json 2>/dev/null | grep -o '"telemetryTier": *"[^"]*"' | head -1 | sed 's/.*"telemetryTier": *"//;s/"$//' || echo "anonymous")
if [ "$_TEL_TIER" != "off" ]; then
echo '{"skill":"number-formatting","phase":"build","event":"completed","outcome":"OUTCOME","duration_s":"'"$_TEL_DUR"'","session":"'"$_SESSION_ID"'","ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","platform":"'$(uname -s)-$(uname -m)'"}' >> ~/.superstack/telemetry.jsonl 2>/dev/null || true
true
fi
```

Replace `OUTCOME` with success/error/abort based on the workflow result.
