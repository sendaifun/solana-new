# Implementation Guide

TypeScript/React implementation patterns for the number formatting spec. Copy these into your project and adapt to your stack.

## Core Types

```ts
type NumberType =
  | "fiat_value"
  | "stable_value"
  | "token_amount"
  | "token_price"
  | "percent"
  | "ratio";

type NumberContext = "compact" | "detailed";

type SignMode = "auto" | "always" | "never";

interface FormatOptions {
  type: NumberType;
  context: NumberContext;
  /** Required for token_amount to compute dynamic decimals */
  tokenPriceUsd?: number;
  /** "auto" = sign only on negatives; "always" = +/-; "never" = abs */
  sign?: SignMode;
}

interface FormatResult {
  /** Display string (e.g. "$1.2K", "0.0₄58", "<$0.01") */
  display: string;
  /** Raw decimal string for copy/export, full precision */
  raw: string;
  /** Expanded aria-label for accessibility (e.g. "0.00005835" for zero-subscript) */
  ariaLabel: string;
  /** Whether this is a tiny marker ("<$0.01" etc.) */
  isTiny: boolean;
  /** Whether zero-subscript notation was used */
  isSubscript: boolean;
}
```

## Pipeline Implementation

```ts
const PLACEHOLDER = "--";

export function formatNumber(
  value: number | null | undefined,
  options: FormatOptions
): FormatResult {
  // Step 1: null / invalid / infinity / div-by-zero
  if (value == null || !isFinite(value) || isNaN(value)) {
    return { display: PLACEHOLDER, raw: "", ariaLabel: "no data", isTiny: false, isSubscript: false };
  }

  // Step 2: signed zero check
  if (Object.is(value, -0)) value = 0;
  if (Math.abs(value) < Number.EPSILON * 10) value = 0;

  // raw must be a decimal string, never scientific notation
  const raw = toDecimalString(value);
  const abs = Math.abs(value);
  const negative = value < 0;

  // Step 3: exact zero
  if (value === 0) {
    return formatZero(options);
  }

  // Step 4: type-specific formatting
  switch (options.type) {
    case "fiat_value":
    case "stable_value":
      return formatFiat(value, abs, negative, options);
    case "token_amount":
      return formatTokenAmount(value, abs, negative, options);
    case "token_price":
      return formatTokenPrice(value, abs, negative, options);
    case "percent":
      return formatPercent(value, abs, negative, options);
    case "ratio":
      return formatRatio(value, abs, negative, options);
  }
}
```

## Zero-Subscript Helper

```ts
function countLeadingZeros(abs: number): number {
  if (abs >= 1) return 0;
  const str = abs.toFixed(20);
  const afterDot = str.split(".")[1] ?? "";
  let count = 0;
  for (const ch of afterDot) {
    if (ch === "0") count++;
    else break;
  }
  return count;
}

function formatWithSubscript(
  abs: number,
  negative: boolean,
  sigDigits: number
): { display: string; ariaLabel: string } {
  const leadingZeros = countLeadingZeros(abs);

  // Extract significant digits: round at the correct position, then slice
  const totalDecimals = leadingZeros + sigDigits;
  const rounded = parseFloat(abs.toFixed(totalDecimals));
  const fixedStr = rounded.toFixed(totalDecimals);
  // Sig digits start after "0." + leadingZeros zeros
  const afterDot = fixedStr.split(".")[1] ?? "";
  const sigStr = afterDot.slice(leadingZeros, leadingZeros + sigDigits);

  const subscriptDigits: Record<string, string> = {
    "0": "\u2080", "1": "\u2081", "2": "\u2082", "3": "\u2083",
    "4": "\u2084", "5": "\u2085", "6": "\u2086", "7": "\u2087",
    "8": "\u2088", "9": "\u2089",
  };
  const subscript = String(leadingZeros)
    .split("")
    .map((d) => subscriptDigits[d] ?? d)
    .join("");

  const sign = negative ? "-" : "";
  const display = `${sign}0.0${subscript}${sigStr}`;
  // aria-label: full expanded decimal so screen readers can pronounce it
  const ariaLabel = `${sign}${abs.toFixed(totalDecimals)}`;

  return { display, ariaLabel };
}

// Verification:
// abs = 0.00005835, sigDigits = 2 (compact)
//   leadingZeros = 4, totalDecimals = 6
//   fixedStr = "0.000058", afterDot = "000058", sigStr = "58"
//   display = "0.0₄58" ✓
//
// abs = 0.00005835, sigDigits = 4 (detailed)
//   leadingZeros = 4, totalDecimals = 8
//   fixedStr = "0.00005835", afterDot = "00005835", sigStr = "5835"
//   display = "0.0₄5835" ✓
```

## Abbreviation Helper

```ts
const SUFFIXES = [
  { threshold: 1e12, suffix: "T" },
  { threshold: 1e9, suffix: "B" },
  { threshold: 1e6, suffix: "M" },
  { threshold: 1e3, suffix: "K" },
];

function abbreviate(
  abs: number,
  context: NumberContext
): { abbreviated: string; suffix: string } | null {
  for (const { threshold, suffix } of SUFFIXES) {
    if (abs >= threshold) {
      const divided = abs / threshold;
      const decimals = context === "compact" ? 1 : 2;
      let formatted = divided.toFixed(decimals);
      // Trim ".0" in compact, trailing zeros in detailed
      if (context === "compact") {
        formatted = formatted.replace(/\.0$/, "");
      } else {
        formatted = formatted.replace(/\.?0+$/, "");
      }
      return { abbreviated: formatted, suffix };
    }
  }
  return null;
}
```

## Sign Helper

```ts
function applySign(
  formatted: string,
  negative: boolean,
  options: FormatOptions
): string {
  const sign = options.sign ?? "auto";
  if (sign === "never") return formatted;
  if (negative) return `-${formatted}`;
  if (sign === "always") return `+${formatted}`;
  return formatted;
}
```

## Decimal String Helper

`Number.toString()` can emit scientific notation for very small/large numbers. This helper is only a best-effort conversion for JavaScript `number` values: it may round because `number` is IEEE-754, and `toFixed(20)` can still fall back to scientific notation for values with `abs >= 1e21`. If you need exact, non-scientific decimal export, preserve the original input as a string or use a decimal library instead.

```ts
function toDecimalString(value: number): string {
  if (value === 0) return "0";
  const str = value.toString();
  if (!str.includes("e") && !str.includes("E")) return str;
  // Best-effort for JS numbers only; may round and may still use scientific notation for very large values.
  return value.toFixed(20).replace(/\.?0+$/, "");
}
```

## Formatter Stubs

The `formatNumber` pipeline dispatches to per-type formatters. Implement each following the type rules in the spec. These stubs show the expected signatures — fill in the logic for your project:

```ts
function formatZero(options: FormatOptions): FormatResult {
  // Return type-specific zero: "$0.00" / "0" / "0.00%" / "0x"
  const zeroMap: Record<NumberType, string> = {
    fiat_value: "$0.00", stable_value: "$0.00", token_amount: "0",
    token_price: "$0.00", percent: "0.00%", ratio: "0x",
  };
  const display = zeroMap[options.type];
  return { display, raw: "0", ariaLabel: display, isTiny: false, isSubscript: false };
}

function formatFiat(value: number, abs: number, negative: boolean, options: FormatOptions): FormatResult {
  // $-prefix, 2 decimals always, abbreviate in compact only, tiny = "<$0.01"
  // ... implement per spec section 8: fiat_value & stable_value
}

function formatTokenAmount(value: number, abs: number, negative: boolean, options: FormatOptions): FormatResult {
  // Dynamic decimals from tokenPriceUsd, zero-subscript, compact abbreviation only
  // ... implement per spec section 8: token_amount
}

function formatTokenPrice(value: number, abs: number, negative: boolean, options: FormatOptions): FormatResult {
  // $-prefix, never abbreviate, zero-subscript for micro-cap, sig-digit rules per range
  // ... implement per spec section 8: token_price
}

function formatPercent(value: number, abs: number, negative: boolean, options: FormatOptions): FormatResult {
  // %-suffix, 2 decimals default, 1 decimal >= 100, 0 decimals >= 1000, tiny = "<0.01%"
  // ... implement per spec section 8: percent
}

function formatRatio(value: number, abs: number, negative: boolean, options: FormatOptions): FormatResult {
  // x-suffix, up to 2 decimals trimmed, tiny = "<0.01x"
  // ... implement per spec section 8: ratio
}
```

Each formatter should return a `FormatResult` with `display`, `raw` (from `toDecimalString`), `ariaLabel`, `isTiny`, and `isSubscript` fields.

## React Component Pattern

```tsx
import { cn } from "@/lib/utils";

interface FormattedNumberProps {
  value: number | null | undefined;
  type: NumberType;
  context?: NumberContext;
  tokenPriceUsd?: number;
  sign?: SignMode;
  className?: string;
}

export function FormattedNumber({
  value,
  type,
  context = "compact",
  tokenPriceUsd,
  sign,
  className,
}: FormattedNumberProps) {
  const result = formatNumber(value, { type, context, tokenPriceUsd, sign });

  return (
    <span
      className={cn("font-mono tabular-nums", className)}
      aria-label={result.ariaLabel}
      title={result.raw || undefined}
    >
      {result.display}
    </span>
  );
}
```

## Usage Examples

```tsx
{/* Fiat balance */}
<FormattedNumber value={1234.5} type="fiat_value" context="compact" />
{/* -> "$1.2K" */}

{/* Token amount with dynamic decimals */}
<FormattedNumber
  value={1.23456789}
  type="token_amount"
  context="compact"
  tokenPriceUsd={84000}
/>
{/* -> "1.2346" */}

{/* Micro-cap token price with zero-subscript */}
<FormattedNumber value={0.00005835} type="token_price" context="compact" />
{/* -> "$0.0₄58" */}

{/* PnL with forced sign */}
<FormattedNumber value={-0.004} type="fiat_value" context="compact" sign="always" />
{/* -> "-<$0.01" */}

{/* Percent change */}
<FormattedNumber value={12.345} type="percent" context="compact" sign="always" />
{/* -> "+12.35%" */}

{/* Null / loading */}
<FormattedNumber value={null} type="fiat_value" context="compact" />
{/* -> "--" */}
```

## CSS Requirements

```css
/* Tabular numerals prevent jitter on live-updating numbers */
.tabular-nums {
  font-variant-numeric: tabular-nums;
}

/* Zero-subscript uses Unicode subscript digits — no special CSS needed.
   Ensure your font supports: ₀₁₂₃₄₅₆₇₈₉ */
```

Tailwind shorthand: `font-mono tabular-nums` on any element displaying formatted numbers.

## Copy-to-Clipboard

When the user copies a formatted number, always copy the raw value, not the display string:

```tsx
function handleCopy(result: FormatResult) {
  navigator.clipboard.writeText(result.raw);
}
```

This ensures `$1.2K` copies as `1234.5` and `0.0₄58` copies as `0.00005835`.

## Testing Strategy

Test each type x context combination against the examples table in the spec. Key edge cases:

1. **Signed zero:** `-0` must render as `0.00` / `$0.00`, never `-0.00`
2. **Boundary:** values right at abbreviation thresholds (999.99 vs 1000)
3. **Zero-subscript trigger:** 2 leading zeros must NOT trigger (e.g. `0.001` stays normal); 3+ leading zeros MUST trigger (e.g. `0.0001` -> zero-subscript)
4. **Tiny markers:** values that round to zero but aren't zero
5. **Null/undefined/NaN/Infinity:** all must produce `--`
6. **Expensive tokens:** BTC at $84K with 6-decimal clamp — verify accepted tradeoff
7. **Large percents:** 10,250.4% must use separators and 0 decimals in compact
8. **Scientific notation in raw:** verify `toDecimalString(0.00005835)` returns `"0.00005835"`, never `"5.835e-5"`
9. **Missing tokenPriceUsd:** when unavailable for `token_amount`, fall back to 4 decimals and flag as approximate
