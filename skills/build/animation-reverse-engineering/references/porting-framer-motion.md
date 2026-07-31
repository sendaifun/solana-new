# Porting — framer-motion (timeline choreography)

Patterns and traps for the timeline species. (Interaction-driven ports:
`porting-interactions.md`.)

## Core patterns

- **Per-unit stagger with reverse index** (the "sweep" signature):

```tsx
{units.map((u, i) => (
  <motion.span
    key={u.id}
    initial={{ y: 14, opacity: 0, filter: 'blur(6px)' }}
    animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
    transition={{ delay: base + (units.length - 1 - i) * gap }}
  />
))}
```

- **Asymmetric exit/enter**: separate `exit` transitions (fast) from `animate`
  (slower settle) — never share one duration.
- **Step transitions**: `AnimatePresence mode="wait"` for sequential steps,
  `mode="popLayout"` for rapid-fire value swaps; keep persistent backdrops
  OUTSIDE the keyed element so they don't re-mount.
- **Spring settles**: when the stack shows overshoot, use a spring, not a longer
  duration. In CSS prototypes, approximate with `linear()` easing.

## Pitfall table

| Trap | Symptom | Fix |
| --- | --- | --- |
| `filter` containing-block | `position: fixed` descendants jump when a parent animates `filter: blur()` | Clear the filter on settle (`filter: 'none'`), or move fixed elements outside the filtered subtree |
| Per-property transitions override top-level `delay` | Stagger works for opacity but not blur | Repeat `delay` inside EVERY per-property transition object |
| Double animation | Muddy compounded opacity/blur | Never nest a self-animating component inside a stagger item that also fades — one owner per property |
| Invalid HTML nesting | Hydration errors, broken exits | `motion.span` inside `p`, not `motion.div` |
| Progress bars via `timeupdate` | Chunky 4Hz fill | `requestAnimationFrame` reading `currentTime / duration` |
| Symmetric timings | Port feels floaty/robotic vs reference | Re-read the measured exit vs settle durations; they are almost never equal |

## Structure conventions

- Name every measured constant and comment it with what it encodes:
  `const EXIT_MS = 120; // 7 frames @60fps, rows 3–9 of stack_temp`
- Keep the tuning constants in one block at the top of the file — the verify
  loop (see `verification.md`) iterates on them.
