# Product Demo Patterns

Remotion-ready patterns for presenting product UI in video. Device frames, cursor choreography, zoom effects, screenshot preparation, and annotation timing.

## Device Frames

NEVER show raw floating screenshots. Always wrap in a device frame or styled container.

### Laptop Frame
- Screenshot resolution: 1440x900 minimum (2880x1800 at 2x preferred)
- Frame chrome: 40px title bar with 3 colored dots (12px circles, 8px gap), 8px border-radius on content area
- Frame color: `#1C1C1E` (dark) or `#F5F5F5` (light), matching video aesthetic
- Shadow beneath: `0 20px 60px rgba(0,0,0,0.3)` — soft, diffused
- Optional 3D perspective: `rotateY(2deg) rotateX(1deg)` via CSS transform for visual interest
- Canvas placement: centered or offset 60% right for split compositions

### Phone Frame
- Screenshot resolution: 390x844 (iPhone 14 viewport, 2x = 780x1688)
- Frame: rounded rectangle, 40px corner radius, 4px bezel
- Dynamic island / notch at top: 120x36px rounded pill, centered
- Frame color: matches laptop frame color
- Shadow: same soft diffused shadow as laptop
- Canvas placement: centered for full-screen showcase, offset right for split with text

### Browser Frame
- Screenshot fills content area below chrome
- Chrome: address bar (rounded, 32px height) showing `app.example.com`, 3 dots menu, minimize/maximize/close circles
- Frame: 1280x800 content area, 8px border-radius
- No browser bookmarks bar, no tab bar — minimal chrome only

### Styled Container (alternative to device frame)
- Screenshot with rounded corners (12-16px radius) + subtle shadow + dark backdrop
- Use when device frame adds visual noise or when showing a component (not full page)

## Cursor Choreography

### Cursor Element
- SVG or image cursor, absolutely positioned on the Remotion canvas
- Default: macOS pointer cursor at 24x24px
- Use `pointer` cursor near clickable elements, `default` elsewhere

### Path Model
```tsx
const CURSOR_PATH = [
  { x: 960, y: 540, delay: 0, action: "appear" },
  { x: 420, y: 310, delay: 30, action: "move" },     // move to target
  { x: 420, y: 310, delay: 45, action: "hover" },     // pause (intention)
  { x: 420, y: 310, delay: 50, action: "click" },     // click effect
  { x: 680, y: 450, delay: 80, action: "move" },      // move to next
  { x: 680, y: 450, delay: 95, action: "hover" },
  { x: 680, y: 450, delay: 100, action: "click" },
  { x: 680, y: 450, delay: 130, action: "disappear" },
];
```

### Movement
- Between keypoints: `spring({ stiffness: 120, damping: 20 })` — human-like, not linear
- Speed: 300-500ms between targets (natural human pace)
- Never move in a straight line across the full canvas — add slight arc via intermediate points

### Click Effect
- Expanding circle at click position: `scale(0) → scale(1)`, `opacity(0.6) → opacity(0)`, 200ms duration
- Circle: 40px diameter, accent color, 2px stroke, no fill
- SFX: soft click sound synchronized to the visual (see `../../marketing-video/references/audio-library.md`)

### Timing
- Cursor appears: 10 frames before first action
- Hover pause: 5-10 frames of stillness before each click (shows intention)
- Cursor disappears: 10 frames after last action (fade out, don't snap away)

## Zoom Recipe

### Zoom In (focus on detail)
```
Source: full screenshot at 1.0x scale in device frame
Target: specific UI element (e.g., button at x:400, y:300)

Animation:
  - Scale: 1.0 → 2.0 centered on target point
  - Spring: { stiffness: 200, damping: 28 } (smooth, no bounce)
  - Simultaneous: gaussian blur 0px → 3px on areas outside target region (focus effect)
  - Duration: ~300ms (spring resolves in ~10 frames at 30fps)
```

### Hold Zoomed
- 30-60 frames (1-2 seconds) — enough to read the detail
- Cursor interacts with the zoomed element if applicable

### Zoom Out (return to context)
```
Animation:
  - Scale: 2.0 → 1.0
  - Spring: { stiffness: 300, damping: 30 } (faster than zoom-in — exit is snappy)
  - Blur clears simultaneously
  - Duration: ~200ms
```

### When to Zoom
- Small UI elements that aren't readable at full-frame scale (toggles, input fields, small buttons)
- Text input moments (showing what the user types)
- State changes (toggle on/off, dropdown selection, modal opening)
- Don't zoom for large, already-visible elements — it wastes time

## Screenshot Preparation

- [ ] Captured at 2x resolution minimum (2880x1800 for laptop)
- [ ] Realistic fake data — not "John Doe" or "test@test.com". Use plausible crypto data (wallet names, token amounts, realistic balances)
- [ ] Personal data removed (no real wallet addresses, private keys, or emails)
- [ ] Light/dark mode matches the video's aesthetic direction
- [ ] Cropped to relevant area — no browser bookmarks, OS dock, or desktop icons
- [ ] Saved as PNG (not JPEG — avoids compression artifacts on UI text and icons)
- [ ] UI state is the exact state you want to show (correct tab selected, correct data loaded, no loading spinners)

## Annotation Patterns

### Arrow Callout
- Curved SVG path from label text to UI element
- Spring entrance: `stiffness: 250, damping: 25`
- Arrow appears 5 frames AFTER its label (label leads, arrow follows)
- Arrow color: accent or white with subtle shadow
- Label: 28-32px, semi-bold, positioned outside the screenshot area

### Circle Highlight
- SVG circle around the target element
- `strokeDasharray` animation: 0 → full circumference in 20 frames
- Single pulse (slight scale 1.0 → 1.05 → 1.0), then static
- Stroke: 2-3px, accent color
- No fill (or very subtle fill at 5% opacity)

### Number Badge
- Circled digit (1, 2, 3) next to sequential features
- Badge: 36x36px circle, accent background, white text (18px bold)
- Staggered entrance: 8-frame gap between each badge
- Badges appear in order, creating a visual flow from 1 → 2 → 3

### Label Strip
- Full-width or partial-width bar below the screenshot
- Slides in from left: `translateX(-100%) → translateX(0)`, spring entrance
- Contains: feature name (28px semi-bold) + optional one-line description (24px regular, muted)
- Background: accent color at 10-15% opacity, or solid dark
