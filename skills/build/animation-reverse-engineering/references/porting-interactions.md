# Porting — interaction-driven motion (one-MotionValue architecture)

For scrubbers, sliders, drag-driven scenes, scroll narratives. The architecture:
**one `MotionValue` progress (0→1) is the single source of truth; everything
else is a transform of it or state derived from it.** No animation timelines —
the "easing" is the user's finger.

## The five layers

```
input (pointer/keys/scroll)
  └─ progress: MotionValue<number>          // raw set on drag; animate() for rewind/autoplay
       ├─ continuous transforms             // useTransform stops → colors, positions
       ├─ per-element function transforms   // proximity fields (tick magnification)
       ├─ derived discrete state            // useMotionValueEvent → React state (index, flags)
       └─ mode state machine                // idle | scrubbing | playing | rewinding
```

## Patterns (all production-tested)

**Continuous color/gradient interpolation** — `useTransform` accepts color
arrays and mixes them; compose with `useMotionTemplate`:

```tsx
const top = useTransform(progress, STOP_POSITIONS, TOP_COLORS);   // '#3d7ecb' → …
const background = useMotionTemplate`linear-gradient(180deg, ${top} 0%, ${mid} 55%, ${bot} 100%)`;
```

Keyframe stops must be strictly increasing — if your domain wraps (hours of a
day), express stops in unwrapped units (absolute hours from start) and only
wrap when converting for display.

**Per-element proximity fields** (tick magnification, red feather around a
playhead) — a function transform per element is cheap at ~50 elements:

```tsx
const scaleY = useTransform(progress, (p) => {
  const d = Math.abs(myPosition - p);
  return d < RADIUS ? 1 + BOOST * (1 - d / RADIUS) : 1;
});
```

**Derived discrete state without render churn** — mirror only the stepping
values into React state, and only when they actually change:

```tsx
useMotionValueEvent(progress, 'change', (p) => {
  const idx = Math.round(p * STEPS);
  setIndex((prev) => (prev === idx ? prev : idx));
});
```

Continuous visuals stay on MotionValues (zero re-renders); crossfading text
re-renders only on step boundaries.

**Discrete crossfade under rapid scrubbing** — `AnimatePresence
mode="popLayout"` keyed by the value, ~150ms opacity+blur, in a `grid-area:1/1`
overlay so exiting/entering values overlap without layout shift. `mode="wait"`
queues and lags during fast scrubs; popLayout doesn't.

**Rewind, don't jump** — reset animates the same progress value home, so every
mapping replays in reverse for free:

```tsx
animate(progress, 0, { duration: 0.35 + from * 0.55, ease: [0.3, 0, 0.15, 1] });
```

Distance-scaled duration; store the controls and `stop()` on any new pointer
down. Autoplay is the same trick toward 1 with linear easing; the mode machine
decides what the left button means (play at rest, pause while playing, rewind
otherwise).

**Input handling** — `setPointerCapture` on the track; set progress from
`(clientX - rect.left) / rect.width` clamped; `touch-none` to kill scroll
hijack; give the track `role="slider"` + arrow-key handling for accessibility.

**Scene theme vs app theme** — a progress-driven palette flip (day→night) is
part of the scene; keep it independent of the app's light/dark theme. Implement
as a boolean derived from progress driving `transition-colors duration-700`
class swaps — the CSS transition supplies the crossfade the reference shows.
If the reference's flip threshold leaves text unreadable against the continuous
background mid-transition, lead the flip slightly and log the deviation.

**Idle-state effects** (typing text, pulsing prompts) — key the component on the
idle flag so returning to rest re-triggers it; clean up timers on unmount.

## Other targets

The analysis spec is framework-neutral. Equivalents: CSS scroll-driven
animations / WAAPI `animation.currentTime`; Reanimated `useSharedValue` +
`interpolate`/`interpolateColor`; SwiftUI `gesture` state + `interpolate`.
