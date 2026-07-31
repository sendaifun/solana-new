# Worked example — interaction species: weather timelapse scrubber

Reference: 60fpsdesign weather-app concept
(x.com/60fpsdesign/status/2067243351112565080) — 2160×2160, 60fps, 14.1s. A tick
scrubber drags a 24h forecast: sky interpolates through day/sunset/night/dawn,
values change hourly, the scene inverts at night.

## Dissection

- Contact sheet (`fps=2,tile=7x5`) mapped the arc: drag → full day cycle →
  release → reset → autoplay → sunset wiggle.
- Crop-band stacks: slider band during the first drag (4fps × 14 rows), the
  temperature digits at native fps around a change, and the reset moment.

## What the stacks proved (each finding → an implementation decision)

| Finding (evidence) | Decision |
| --- | --- |
| Temp 28→26 shows ~2 ghost frames of both values | ~150ms opacity+blur crossfade, `AnimatePresence mode="popLayout"` keyed by value |
| Reset stack shows 8PM→7PM→4PM→2PM→Now with pill ghosts | Reset REWINDS the progress value (~0.35–0.9s distance-scaled), never jumps |
| Whole-UI blended frames at dusk | Night flip is a ~700ms color crossfade → `transition-colors duration-700` class swap |
| Pill label swaps per hour, x tracks playhead continuously | Discrete label (derived index state) + continuous x (transform of progress) |
| At "Now": ↺ becomes ▶, summary types in char-by-char | Mode state machine (idle/scrubbing/playing/rewinding); typing keyed on idle |
| Ticks: passed strong, future faint, red feather + height boost near playhead | Per-tick function transforms of the one progress value |

## Architecture (one MotionValue)

`progress` (0→1 over 24h) drives: `useTransform` color arrays → sky gradient via
`useMotionTemplate`; sun position function transform; ~50 per-tick proximity
transforms; `useMotionValueEvent` → hour index + night flag as React state.
Drag sets progress raw (pointer capture); reset/autoplay use `animate()` on the
same value, so all mappings replay automatically.

## Verification loop (caught a real bug)

Playwright-drove the slider to the dissected states and screenshotted:
- **Bug found**: at ~6:30 PM the sky was already deep sunset but the night flip
  (measured threshold 18.7h) hadn't fired — dark text on dark sky. Fix: lead
  the flip to 18.45h. Logged as a deliberate deviation (readability > fidelity).
- Also verified: rewind mid-flight blend, typing retrigger after reset,
  autoplay pause, both app themes around the scene.

## Deviations log

- Night flip 18.45h vs reference ~18.7h (readability).
- 49 ticks vs reference ~60 (track width at target size).
