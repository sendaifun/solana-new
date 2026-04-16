# Page Choreography

Orchestrate full-page entrance sequences where multiple sections cascade in with spring physics, driven by a single `stage` state. This is the primary pattern for fixing "everything appears at once" page loads.

## When to Use

- A page loads and multiple sections should animate in sequentially
- Route transitions where content needs a coordinated entrance
- Dashboard layouts with charts, widgets, and data sections
- Any multi-section layout that should feel alive on mount

**Not for:** animating content the user is reading into view (breaks reading flow — see `animation.md`). Page choreography is for key section reveals, not scroll-triggered animations.

**Critical constraint:** the static shell (nav, sidebar, primary CTA) must never be held blank. Only secondary content sections cascade in. The user's first actionable element must be visible and interactive immediately — choreography adds polish to the rest, it does not delay the first interaction.

## The Pattern

### 1. ASCII Storyboard Comment

Every choreographed page starts with this at the top of the file. Plan the full sequence before writing any code.

```tsx
/* ─────────────────────────────────────────────────────────
 * PAGE CONTENT STORYBOARD
 *
 * Static shell (nav, sidebar) never re-animates.
 * Only page content cascades in on navigation / refresh.
 *
 *    0ms   blank — page content not yet visible
 *  100ms   header fades in + slides down
 *  350ms   main chart fades in from left
 *  500ms   sidebar widget fades in from right
 *  750ms   content section slides up
 * 1000ms   cards stagger in (150ms each)
 * ───────────────────────────────────────────────────────── */
```

Rules:
- Times are absolute from page mount, right-aligned
- Each line describes what happens and the motion direction
- Keep it scannable — anyone should understand the sequence without reading code

### 2. TIMING Object

```tsx
const TIMING = {
  header:   100,   // ms — first element to appear
  chart:    350,   // ms — main content area
  sidebar:  500,   // ms — secondary content
  content:  750,   // ms — below-fold section
  cards:    1000,  // ms — children stagger start
};
```

Rules:
- One entry per animated section
- Values in milliseconds
- Comments describe what appears
- Gaps of 100-250ms between sections create the perception of sequence

### 3. Section Config Objects

Each section gets its own config with offset direction and spring:

```tsx
const HEADER = {
  offsetY: -12,    // slides DOWN into place (negative = from above)
  spring: { type: "spring" as const, stiffness: 350, damping: 28 },
};

const CHART = {
  offsetX: -24,    // slides in from LEFT
  spring: { type: "spring" as const, stiffness: 300, damping: 30 },
};

const SIDEBAR = {
  offsetX: 24,     // slides in from RIGHT
  spring: { type: "spring" as const, stiffness: 300, damping: 30 },
};

const CONTENT = {
  offsetY: 16,     // slides UP into place
  spring: { type: "spring" as const, stiffness: 350, damping: 28 },
};
```

Direction guidelines:
- Top content: slides DOWN (`offsetY: -12`)
- Left content: slides from LEFT (`offsetX: -24`)
- Right content: slides from RIGHT (`offsetX: 24`)
- Below-fold content: slides UP (`offsetY: 16`)
- Use 8-24px offsets — subtle enough to not distract, visible enough to perceive

### 4. Stage State + Timer Cascade

```tsx
const [stage, setStage] = useState(0);

useEffect(() => {
  const timers: ReturnType<typeof setTimeout>[] = [];

  timers.push(setTimeout(() => setStage(1), TIMING.header));
  timers.push(setTimeout(() => setStage(2), TIMING.chart));
  timers.push(setTimeout(() => setStage(3), TIMING.sidebar));
  timers.push(setTimeout(() => setStage(4), TIMING.content));
  timers.push(setTimeout(() => setStage(5), TIMING.cards));

  return () => timers.forEach(clearTimeout);
}, []);
```

Rules:
- Single `stage` integer drives everything
- All timers created in one `useEffect`
- Always clean up on unmount

### 5. JSX Pattern

```tsx
<motion.div
  initial={{ opacity: 0, y: HEADER.offsetY }}
  animate={{
    opacity: stage >= 1 ? 1 : 0,
    y:       stage >= 1 ? 0 : HEADER.offsetY,
  }}
  transition={HEADER.spring}
>
  <HeaderComponent />
</motion.div>
```

Key pattern: `stage >= N` (not `stage === N`) — once a section appears, it stays visible.

### 6. Passing Stage to Children

When a section contains its own staggered children (like a card grid), pass the stage as a prop:

```tsx
<ChildSection loadStage={stage >= 5 ? 1 : 0} />
```

The child component uses `loadStage` to trigger its own stagger sequence. See [list-stagger.md](list-stagger.md) for the stagger pattern.

## Timing Guidelines

| Gap | Feel | Use for |
| --- | --- | --- |
| 50-100ms | Snappy, almost simultaneous | Related elements |
| 150-250ms | Rhythmic cascade | Sequential sections |
| 300-500ms | Dramatic reveal | Hero elements |

Total page entrance should complete within 1-1.5s. Anything longer and the user is waiting instead of interacting.

## Spring Presets for Page Sections

| Use case | Config | Feel |
| --- | --- | --- |
| Header/top content | `stiffness: 350, damping: 28` | Crisp, settles fast |
| Side panels | `stiffness: 300, damping: 30` | Smooth, slightly softer |
| Below-fold content | `stiffness: 350, damping: 28` | Crisp, no over-travel |
| Floating elements | `duration: 0.4, ease: [0.16, 1, 0.3, 1]` | Smooth ease (no spring) |

## Checklist

- [ ] ASCII storyboard comment at top of file?
- [ ] TIMING object with named delays?
- [ ] Config objects for each section?
- [ ] Single `stage` state driving all sections?
- [ ] `stage >= N` pattern (not `===`)?
- [ ] Timer cleanup on unmount?
- [ ] Children receive stage as prop?
- [ ] Total entrance completes within 1-1.5s?
- [ ] `prefers-reduced-motion` respected?
