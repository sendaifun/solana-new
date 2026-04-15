# Number Formatting Spec v1.0

Display-only. Internal math uses raw precision.

---

## 1. Types

`fiat_value` · `stable_value` · `token_amount` · `token_price` · `percent` · `ratio`

## 2. Contexts

| Context | Where | Char budget (numeric core, excl. `$%x` and token symbol) |
|---|---|---|
| `compact` | Watchlists, cards, tables | Target 8-10, max 12. Sign included. |
| `detailed` | Detail screens, confirmations, order entry | No strict cap, prefer concise. |

## 3. Global Rules

1. **Locale:** `en-US` fixed (v1), pluggable later
2. **Rounding:** half away from zero
3. **Scientific notation:** forbidden
4. **Tabular numerals:** required for all number displays (`font-mono tabular-nums`)
5. **Separators:** commas for non-abbreviated values >= 1,000
6. **Signed zero:** forbidden (`-0.00` -> `0.00`)
7. **Null / missing / invalid / infinity / div-by-zero:** `--`
8. **Copy/export:** raw decimal string, full precision, no formatting
9. **Accessibility:** zero-subscript gets expanded decimal in `aria-label`

## 4. Pipeline

```
null/invalid/inf? -> "--"
  -> exact 0? -> type zero ("$0.00" / "0" / "0.00%" / "0x")
  -> rounds to 0? -> tiny marker ("<$0.01" / "<0.01%" etc.)
  -> >= 3 leading zeros? -> zero-subscript (0.0ₙXYZ)
  -> compact context & magnitude >= 1K & abbrev allowed for type? -> abbreviate (K/M/B/T)
  -> normal format with computed decimals (detailed always uses full value with commas)
  -> exceeds width? reduce decimals -> abbreviate -> tiny marker -> scale font
  -> NEVER overflow. NEVER ellipsis-truncate.
```

## 5. Sign Policy

| Context | `+` | `-` |
|---|---|---|
| Balance / absolute | No | Yes |
| Delta / PnL / change | Yes | Yes |
| Zero | Never | Never |

Tiny signed: `-<$0.01`, `+<0.01%`. Tiny unsigned: `<$0.01` (drop sign).

## 6. Abbreviations (`K` `M` `B` `T`)

- **Mutually exclusive with zero-subscript**
- `fiat/stable`: compact always abbreviates >= 1K; detailed never abbreviates (show full value with commas)
- `token_amount`: compact summary only (never in order entry, confirmations, fills); detailed never abbreviates
- `token_price` / `percent` / `ratio`: never
- Decimals: compact 1 (trim `.0`), detailed 2 (trim trailing zeros)

## 7. Zero-Subscript

**Trigger:** >= 3 consecutive zeros after decimal before first non-zero digit.

**Format:** `0.0ₙXYZ` where `n` = total leading zeros after decimal, `XYZ` = sig digits.
**Negative:** `-0.0₄5835`. **Sig digits:** compact = 2, detailed = 4.

```
0.00005835 -> digits after ".": 0,0,0,0,5,8,3,5 -> n=4
  compact:  0.0₄58
  detailed: 0.0₄5835
```

Applies to: `token_price`, `token_amount`. Not: `fiat/stable`, exact zero, raw views.

## 8. Type Rules

### fiat_value & stable_value

Prefix `$` · 2 decimals always · keep trailing zeros · zero = `$0.00` · tiny = `<$0.01` · abbreviate if needed.
`stable_value` is semantic (dollar value), not token-category. Depeg: quantity -> `token_amount`, value -> `stable_value`.

### token_amount

**Goal:** hidden USD value from rounding stays below threshold.

| Context | Threshold | Decimal clamp | Tiny marker |
|---|---|---|---|
| `compact` | $0.01 | 0-6 | `<0.001` |
| `detailed` | $0.0001 | 0-12 | computed min |

```
decimals = ceil(-log10(threshold / token_price_usd))
clamp to context range -> round -> trim trailing zeros
if rounded == 0 && raw != 0 -> tiny marker
if leading zeros >= 3 -> zero-subscript
```

Clamp is authoritative. Expensive tokens (BTC@$84K) may hide >$0.01 in compact after clamping to 6 decimals — accepted tradeoff for readability.

### token_price

Prefix `$` · never abbreviate.

| Price range | Compact | Detailed |
|---|---|---|
| >= $1,000 | 2 decimals (e.g. `$84,000.00`) | 2 decimals (e.g. `$84,000.00`) |
| >= $100, < $1,000 | 0 decimals, 3 sig digits (e.g. `$142`) | 2 decimals (e.g. `$142.12`) |
| >= $1, < $100 | 1 decimal, 3 sig digits (e.g. `$12.3`) | 3 decimals, 5 sig digits (e.g. `$12.346`) |
| < $1, leading zeros < 3 | 3 sig digits, cap 8 decimals (e.g. `$0.124`) | 5 sig digits, cap 8 decimals (e.g. `$0.12350`) |
| < $1, leading zeros >= 3 | Zero-subscript, 2 sig digits | Zero-subscript, 4 sig digits |

Sig digits: compact = 3, detailed = 5. For compact prices >= $100, the sig-digit target is satisfied by the integer digits alone — no extra decimals needed.

### percent

Suffix `%` · default 2 decimals · tiny = `<0.01%` · abs >= 100: 1 decimal · abs >= 1,000: 0 decimals + separators · never abbreviate.

### ratio

Suffix `x` · up to 2 decimals, trim zeros · tiny = `<0.01x` · separators >= 1,000 · never abbreviate.

## 9. Examples

**Prices:** BTC=$84,000 · SOL=$142 · BONK=$0.00005835

| Type | Raw | Compact | Detailed |
|---|---:|---|---|
| fiat | `0` | `$0.00` | `$0.00` |
| fiat | `0.004` | `<$0.01` | `<$0.01` |
| fiat (PnL) | `-0.004` | `-<$0.01` | `-<$0.01` |
| fiat | `1234.5` | `$1.2K` | `$1,234.50` |
| fiat | `1.52e12` | `$1.5T` | `$1,520,000,000,000.00` |
| stable | `1212.5` | `$1.2K` | `$1,212.50` |
| amt BTC | `0` | `0` | `0` |
| amt BTC | `1.23456789` | `1.2346` | `1.23456789` |
| amt BTC | `0.00123456` | `0.001235` | `0.00123456` |
| amt BONK | `25.62` | `25.6` | `25.62` |
| amt BONK | `125234.62` | `125.2K` | `125,234.62` |
| amt | `0.00005835` | `0.0₄58` | `0.0₄5835` |
| amt | `-0.00005835` | `-0.0₄58` | `-0.0₄5835` |
| amt (tiny) | `~0 non-zero` | `<0.001` | computed min |
| price | `$84,000` | `$84,000.00` | `$84,000.00` |
| price | `$142.1234` | `$142` | `$142.12` |
| price | `$12.3456` | `$12.3` | `$12.346` |
| price | `$0.1235` | `$0.124` | `$0.12350` |
| price | `$0.00005835` | `$0.0₄58` | `$0.0₄5835` |
| price | `-$0.00005835` | `-$0.0₄58` | `-$0.0₄5835` |
| percent | `0` | `0.00%` | `0.00%` |
| percent | `0.004` | `<0.01%` | `<0.01%` |
| percent (signed) | `-0.004` | `-<0.01%` | `-<0.01%` |
| percent | `12.345` | `12.35%` | `12.35%` |
| percent | `123.456` | `123.5%` | `123.5%` |
| percent | `10250.4` | `10,250%` | `10,250.4%` |
| ratio | `0` | `0x` | `0x` |
| ratio | `0.004` | `<0.01x` | `<0.01x` |
| ratio | `2.567` | `2.57x` | `2.57x` |
| ratio | `1250` | `1,250x` | `1,250x` |
| null/NaN/Inf | - | `--` | `--` |
