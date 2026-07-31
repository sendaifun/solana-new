# Verification — close the loop against the reference

The port isn't done when it runs; it's done when its states match the frame
stacks. This phase catches what the build phase can't see.

## Method

1. **Reproduce the dissected states.** Drive the implementation with browser
   automation (Playwright, Chrome DevTools MCP, or by hand) to the exact states
   you stacked in Phase 3: the same progress values, the same mid-transition
   moments.

```js
// Playwright sketch: scrub a slider to p≈0.19 and screenshot
const box = await page.locator('[role="slider"]').boundingBox();
await page.mouse.move(box.x + 5, box.y + box.height / 2);
await page.mouse.down();
for (let i = 0; i <= 12; i++) {
  await page.mouse.move(box.x + box.width * 0.19 * (i / 12), box.y + box.height / 2);
  await page.waitForTimeout(25);
}
await page.screenshot({ path: 'impl-sunset.png' });
```

2. **Compare side-by-side** with the corresponding reference frames: state
   correctness (right values at right progress), transition style (crossfade vs
   cut), palette, readability, chrome flips.

3. **Iterate on named constants only.** Mismatches should map to one tuning
   constant (a threshold, a duration, a color stop). If a mismatch requires
   restructuring, the Phase 4 analysis missed something — go back one phase, not
   zero phases.

4. **Test every interaction path**, not just the happy scrub: reset from far and
   near, autoplay start/pause, keyboard, release at extremes, rapid back-forth
   scrubbing (this is what exposes crossfade queuing bugs).

## Automation gotchas (field notes)

- Playwright's page context can reset between separate tool calls in
  agent-driven sessions — do navigate + interact + screenshot in ONE script.
- Wait out entrance animations (~1–2s) before measuring geometry.
- Synthesize drags as pointer down → many small moves with 20–30ms waits → up;
  a single jump-move skips the mid-transition states you need to check.
- Screenshot mid-transition on purpose (e.g. 250ms into a rewind) — blended
  frames verify the crossfade machinery, exactly like ghost rows in the stacks.

## Acceptance

Write the checklist from the analysis doc's findings and tick it: each measured
behavior demonstrated, each deviation intentional and logged. Then run the
project's lint/type/format gates.
