# Analysis — from stacks to a spec

The output of this phase is a written doc (markdown next to the code, or in the
repo's docs/) that doubles as the implementation spec and the verification
baseline. If it isn't written down, it will drift during the port.

## Timeline-choreography checklist

1. **Property set** — exactly which CSS/transform properties change. Look for
   the subtle ones: letter-spacing, blur, clip-path, color temperature.
2. **Direction grammar** — conveyor (exit left, enter left = same direction) vs
   mirror (exit left, enter right). Get this wrong and the port feels off even
   with perfect timing.
3. **Stagger order** — forward index, reverse index, center-out, or random.
   Reverse-index staggers read as "sweeps". Count from the stack rows which unit
   moves first.
4. **Feather** — how many units are mid-transition in a single frame. 1 = strict
   sequence; 3–4 = overlapping cascade. Sets your stagger gap.
5. **Easing, measured** — take per-frame position deltas from the stack and
   sketch the curve. Overshoot rows mean a spring: estimate stiffness/damping
   from overshoot size and settle length.
6. **Asymmetric timing** — exits are usually 2–3× faster than entrances; settles
   are longer than either. Symmetric timing is the most common tell of an
   un-dissected port.
7. **Handoff overlap** — does element B start before A finishes? By how many
   frames?
8. **Transients** — intermediate values that exist only mid-flight (a blur that
   peaks then clears, a scale bounce).
9. **The negative space** — what explicitly does NOT move. Note it; porting
   motion onto stable elements is a common fidelity bug.

## Interaction-driven checklist

1. **Progress domain** — what does 0→1 span (a 24h day? a list length? scroll
   height)? Clamped or rubber-banded at the ends? Does it wrap?
2. **Continuous mappings** — properties that interpolate smoothly with progress:
   background gradients, glow/sun positions, magnification fields around a
   playhead, parallax layers. For each: the keyframe stops and values.
3. **Discrete derivations** — values that step at thresholds (an hourly label, a
   temperature). For each: the threshold function AND the transition style.
   **Check ghost frames at 60fps** — a ~2-frame ghost of both values means a
   ~100–150ms opacity/blur crossfade, not a cut.
4. **Interaction grammar** — enumerate every gesture/button and its exact
   behavior: does reset jump or *rewind through states*? Does release snap to a
   detent, settle with a spring, or stay put? Is there an autoplay mode, and
   what pauses it?
5. **State-dependent chrome** — theme/palette flips driven by progress (day→
   night). Measure where the flip happens relative to the continuous background,
   and whether it crossfades or cuts. If the reference's flip point leaves text
   unreadable mid-transition, deviate — and record the deviation.
6. **Smoothing** — does the driven value track input 1:1 (raw set) or lag
   through a spring? Scrub a slow-motion segment to tell.

## Deviation log

Fidelity is the default, but not the goal when the reference itself has a flaw
(contrast failure, unreachable tap target). Deviate deliberately, and keep a
"deviations from reference" section in the doc: what changed, why, measured
evidence.
