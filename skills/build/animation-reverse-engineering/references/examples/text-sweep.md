# Worked example — timeline species: reverse-index text sweep

Reference: the "X Money" onboarding text sweep (words exit upward with blur
while the next line sweeps in, last word leading).

## What dissection found (that eyeballing missed)

- **Reverse-index stagger** — the LAST word moves first. At 1× the sweep reads
  left-to-right; the stacks show the opposite. This is the animation's
  signature.
- **Feather of ~3** — three words mid-transition per frame → tight stagger gap
  (~40ms), not sequential.
- **Asymmetric timing** — exit ~120ms fast ease-in; entrance ~180ms; settle
  ~400ms spring with one small overshoot row.
- **Blur transient** — peaks mid-flight (~6px) and fully clears on settle; blur
  is a transition property, not a state.
- **Static frame** — container, backdrop, and progress chrome never move.

## Port skeleton

```tsx
const EXIT_MS = 0.12, ENTER_MS = 0.18, GAP = 0.04;

{words.map((w, i) => {
  const delay = base + (words.length - 1 - i) * GAP;   // reverse index
  return (
    <motion.span
      key={`${lineId}-${i}`}
      initial={{ y: 16, opacity: 0, filter: 'blur(6px)' }}
      animate={{
        y: 0, opacity: 1, filter: 'blur(0px)',
        transition: {
          y: { duration: ENTER_MS, delay },
          opacity: { duration: ENTER_MS, delay },
          filter: { duration: ENTER_MS, delay },   // delay repeated per property!
        },
      }}
      exit={{ y: -14, opacity: 0, filter: 'blur(5px)', transition: { duration: EXIT_MS } }}
    >
      {w}&nbsp;
    </motion.span>
  );
})}
```

Wrapped in `AnimatePresence mode="wait"` keyed by line; backdrop lives outside
the keyed element.

## Traps hit during this port (now in the pitfall table)

- Top-level `delay` silently ignored once per-property transitions were added —
  repeat it in each property object.
- `filter: blur()` on the container made a `position: fixed` overlay jump —
  cleared filter on settle.
- A self-animating counter nested inside a fading stagger item double-faded.
- Progress bar driven by `timeupdate` was chunky — switched to rAF reading
  `currentTime / duration`.
