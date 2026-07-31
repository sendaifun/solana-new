# Dissection — contact sheets and crop-band stacks

## 1. Overview contact sheet

```bash
ffmpeg -i ref.mp4 -vf "fps=2,scale=270:270,tile=7x5" overview.png
```

- Pick `fps` so the whole video fits one grid: `fps ≈ rows*cols / duration`.
- **Tile → time math**: at `fps=2` in a 7-wide grid, tile index `i` (row-major,
  0-based) covers `t = i/2` seconds. Write this mapping down — you'll use it to
  choose every later frame window.
- From the sheet, list: distinct states, transition windows (start/end tile),
  and the screen regions that change.

## 2. Derive crop bands — never eyeball

Measure the region on the contact sheet (or a full extracted frame), then scale:

```
scale = original_width / displayed_width
crop_x = displayed_x * scale     (same for y, w, h)
```

When a frame is viewed at a different size than the source (image viewers often
downscale), **multiply measured coordinates by the scale factor** before using
them in `crop=W:H:X:Y`. Verify with one test frame before extracting a full
stack — a band that's 40px off wastes the whole extraction.

Band selection tips:
- One band per concern: the value that changes (a number, a label), the control
  (a slider/button), the background. Don't try to read three concerns from one
  wide band.
- Include a little context above/below the target (e.g. the meta line above a
  scrubber) — adjacent elements often participate in the same transition.

## 3. Dense stacks

```bash
# fixed-rate stack across a window (coarse: is anything happening?)
ffmpeg -i ref.mp4 -vf "crop=W:H:X:Y,fps=4,tile=1x14" -frames:v 1 stack_coarse.png

# native-fps stack of an exact frame window (fine: how does it happen?)
ffmpeg -i ref.mp4 \
  -vf "crop=W:H:X:Y,select='between(n,START,END)*not(mod(n,K))',tile=1xROWS" \
  -frames:v 1 -vsync 0 stack_fine.png
```

Hard-won rules:
- **`-vsync 0` is mandatory with `select=`** — without it ffmpeg duplicates
  frames to maintain CFR and your stack rows lie about timing.
- 14–17 rows per stack is the readability ceiling; pick `K` (sampling divisor)
  to fit: `K ≈ (END-START) / ROWS`.
- **Start ~0.3s before visible motion** — the exit phase of the old state is
  half the animation and the easiest half to miss.
- Extract 2–3 full-res single frames of key states too (`select='eq(n,N)'`)
  for reading exact colors, spacing, and typography.

## 4. What to look for in a stack

- **Ghost/blend rows** — two values overlapping at low opacity = crossfade, and
  the number of ghost rows × frame time = crossfade duration. No ghosts = hard
  cut or transform-based swap.
- **Per-row displacement deltas** — the easing curve, measured. Constant deltas
  = linear; large-then-small = ease-out; small overshoot rows = spring.
- **Which elements move in the same rows** — overlap and handoff timing.
- **Reverse animations** (reset buttons, back gestures): stack them too. Whether
  a reset *jumps* or *rewinds through intermediate states* is a one-stack answer
  and completely changes the implementation.
