# Live Data Motion

Animate real-time changing values: rolling number digits, SVG chart morphs, donut reveals, and live data feeds. The key insight is that mount animations and update animations need completely different timing — dramatic for the first appearance, subtle for subsequent changes.

> **Number formatting:** For decimal precision, zero-subscript, abbreviations, and `tabular-nums`, see the `number-formatting` skill. This file covers the animation of numbers, not their formatting.

## When to Use

- Displaying prices, balances, or counts that update in real time
- Charts that morph when data changes or time ranges switch
- Donut/pie charts that reveal on mount and update live

## Rolling Number Digits (Slot Machine)

Each digit is a vertical strip of 0-9 inside `overflow: hidden`. `translateY` scrolls to the target digit. Two phases: dramatic mount reveal, then subtle live updates.

### Config

```tsx
const MOUNT_DURATION = 600;           // ms — first appearance
const MOUNT_STAGGER_BUDGET = 200;     // ms — spread across all digits
const MOUNT_EASING = "cubic-bezier(0.16, 1, 0.3, 1)";

const UPDATE_DURATION = 150;          // ms — live value changes
const UPDATE_EASING = "cubic-bezier(0.33, 1, 0.68, 1)";
```

### Architecture

```
AnimatedNumber (formatter + phase manager)
  RollingDigit x N (one per digit character)
    digit strip [0,1,2,3,4,5,6,7,8,9]
      translateY(-N * 10%) to show digit N
```

### Phase Management

The component goes through three phases: idle (waiting), rolling (mount animation), live (subsequent updates).

```tsx
const [phase, setPhase] = useState<"idle" | "rolling" | "live">("idle");

// Trigger mount roll after delay
useEffect(() => {
  const timer = setTimeout(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setPhase("rolling"));
    });
  }, Math.max(50, delay));
  return () => clearTimeout(timer);
}, [delay]);

// Switch to live mode after mount completes
useEffect(() => {
  if (phase === "rolling") {
    const timer = setTimeout(
      () => setPhase("live"),
      MOUNT_DURATION + MOUNT_STAGGER_BUDGET + 50
    );
    return () => clearTimeout(timer);
  }
}, [phase]);
```

### Critical Implementation Details

- `Math.ceil()` on measured digit height prevents sub-pixel bleeding between digits
- Percentage-based `translateY(-N * 10%)` instead of pixel-based for precision
- `willChange: "transform"` for GPU acceleration
- `fontVariantNumeric: "tabular-nums"` on the parent for consistent digit widths

### Staggering Multiple Instances

When a dashboard has several rolling numbers, stagger their mount animations:

```tsx
<AnimatedNumber value={2896.04} prefix="$" delay={100} />
<AnimatedNumber value={10.12}   prefix="$" delay={300} />
<AnimatedNumber value={14.00}   prefix="$" delay={420} />
```

## SVG Donut Reveal

Colored segments are positioned statically. A white SVG mask circle animates `stroke-dasharray` from 0 to full circumference, creating a sweep reveal.

```tsx
const maskDash = revealed
  ? `${circumference} 0`
  : `0 ${circumference}`;

// Mask: bouncy sweep (1.3s)
style={{ transition: "stroke-dasharray 1.3s cubic-bezier(0.34, 1.3, 0.64, 1)" }}

// Segments: smooth update (0.6s)
style={{ transition: "stroke-dasharray 0.6s ease, stroke-dashoffset 0.6s ease" }}
```

## SVG Chart Morphing

Animate chart data transitions by interpolating point strings:

```tsx
<motion.polyline
  animate={{ points: currentPoints }}
  transition={{ duration: 0.6, ease: [0.33, 1, 0.68, 1] }}
/>
```

## Live Fluctuation Pattern

For simulating realistic live data updates (dashboards, demo screens):

```tsx
useEffect(() => {
  const tick = () => {
    setValue(prev => {
      const delta = (Math.random() - 0.45) * 120;
      return Math.round((prev + delta) * 100) / 100;
    });
    timer = setTimeout(tick, 2000 + Math.random() * 2000);
  };
  let timer = setTimeout(tick, 3500); // initial delay — let mount finish
  return () => clearTimeout(timer);
}, []);
```

Guidelines: 3-5s initial delay (let mount animation finish), 2-4s random interval, small deltas, slight negative bias for realism.

## Mount vs Update Timing

| Phase | Duration | Easing | Purpose |
| --- | --- | --- | --- |
| Mount | 600ms+ | `cubic-bezier(0.16, 1, 0.3, 1)` | Dramatic reveal |
| Update | 150ms | `cubic-bezier(0.33, 1, 0.68, 1)` | Subtle, non-distracting |
| Donut reveal | 1300ms | `cubic-bezier(0.34, 1.3, 0.64, 1)` | Bouncy sweep |
| Segment update | 600ms | `cubic-bezier(0.33, 1, 0.68, 1)` | Smooth resize |
