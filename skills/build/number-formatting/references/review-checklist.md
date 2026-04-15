# Number Formatting Review Checklist

Use this checklist when reviewing any UI code that displays numbers. Every item must pass before marking the task complete.

## Pipeline Compliance

- [ ] Null / undefined / NaN / Infinity renders `--`, never crashes or shows `NaN`
- [ ] Exact zero uses the correct type zero (`$0.00` / `0` / `0.00%` / `0x`)
- [ ] Signed zero (`-0`, `-0.00`) is forbidden — always shows unsigned zero
- [ ] No scientific notation anywhere in the UI (`1.52e12` must show `$1.52T`)
- [ ] Values that round to zero but aren't zero show tiny markers (`<$0.01`, `<0.01%`)

## Type Correctness

- [ ] Fiat/stable values always have `$` prefix and exactly 2 decimal places
- [ ] Token amounts use dynamic decimals based on token price, not hardcoded precision
- [ ] Token prices never use abbreviations (no `$84K` for BTC price)
- [ ] Percents use `%` suffix with correct decimal rules per magnitude
- [ ] Ratios use `x` suffix with up to 2 decimals, trimmed

## Zero-Subscript

- [ ] Triggers only when >= 3 consecutive leading zeros after decimal
- [ ] Does NOT trigger on fiat/stable values
- [ ] Uses correct sig digits (compact = 2, detailed = 4)
- [ ] Has `aria-label` with expanded decimal for screen readers
- [ ] Copy/export gives raw decimal, not the subscript display

## Abbreviations

- [ ] K/M/B/T only used where allowed by type (never on token_price, percent, ratio)
- [ ] Token amounts only abbreviated in compact summary views, never in order entry / confirmations
- [ ] Compact: 1 decimal (trim `.0`), Detailed: 2 decimals (trim trailing zeros)
- [ ] Abbreviations and zero-subscript are mutually exclusive

## Sign Policy

- [ ] Balances and absolute values: no `+` sign, only `-` for negatives
- [ ] Deltas / PnL / changes: both `+` and `-` shown
- [ ] Zero: never signed (no `+0.00%`, no `-$0.00`)
- [ ] Tiny signed values preserve sign: `-<$0.01`, `+<0.01%`
- [ ] Tiny unsigned values drop sign: `<$0.01` (not `+<$0.01`)

## Display Quality

- [ ] `font-mono tabular-nums` on all number elements (prevents jitter on updates)
- [ ] Commas used as thousands separators for non-abbreviated values >= 1,000
- [ ] No overflow — numbers never get truncated with ellipsis
- [ ] If number exceeds width: reduce decimals -> abbreviate -> tiny marker -> scale font
- [ ] Locale is `en-US` (commas for thousands, period for decimal)

## Accessibility

- [ ] Zero-subscript numbers have `aria-label` with expanded decimal
- [ ] `--` placeholder has `aria-label="no data"` or equivalent
- [ ] Color is not the only indicator of positive/negative — sign or arrow accompanies color

## Copy / Export

- [ ] Copying a formatted number produces the raw decimal string
- [ ] Full precision, no formatting (no commas, no abbreviations, no subscript)
- [ ] Raw value never degrades to scientific notation (`5.835e-5` must be `0.00005835`)
- [ ] `$1.2K` copies as `1234.5`, `0.0₄58` copies as `0.00005835`

## Edge Cases

- [ ] `token_amount` without `tokenPriceUsd` falls back to 4 decimals and flags as approximate
- [ ] Abbreviation boundaries: 999.99 stays un-abbreviated, 1000 abbreviates (in compact, for allowed types)
- [ ] Detailed context never abbreviates — always shows full value with commas
