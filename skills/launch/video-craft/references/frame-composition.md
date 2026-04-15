# Frame Composition

Video-specific composition rules for Remotion. These are about composing frames for time-bounded viewing — viewers can't scroll back, re-read, or hover. Every frame gets one glance.

General design rules (type minimums, safe zones, spring defaults) are inherited from `marketing-video/professional-quality-guide.md`. Color restraint and asymmetry from `design-taste/design-judgment.md`. This file adds the delta.

## Frame Archetypes (16:9)

### Hero Frame
Single focal element, asymmetric placement (rule of thirds), breathing background.
- One giant number OR one bold statement — never both competing
- Focal element placed at left-third or right-third intersection, not dead center
- Background has subtle motion (noise drift, gradient pulse) so the frame feels alive
- Hold: 2-3 seconds minimum

### Product Frame
Screenshot in device frame occupies 60-70% of canvas, with 2-3 annotation callouts.
- Device frame (laptop/phone/browser) — see `product-demo-patterns.md`
- Annotations stagger in after device frame settles (5-frame gap between each)
- Remaining 30-40% of canvas: headline label or feature name
- Hold: 3-5 seconds (viewer needs time to scan the product)

### Split Frame
Two halves: text + visual. Never 50/50 — use 40/60 or 35/65.
- Text side gets more internal padding (breathing room)
- Visual side gets less padding (fills the space)
- Vertical divider: implied by spacing, not a literal line
- Hold: 2-3 seconds

### Data Frame
Metric cards in grid (2x2 or 3-across), staggered entrance.
- Cards stagger at 100ms apart (3 frames at 30fps)
- Numbers in monospace, large (80-120px). Labels small (28-32px), muted
- Grid has consistent gutters (24-32px)
- Hold: 2-4 seconds

### Comparison Frame
Before (desaturated, muted tones) / After (full color, accent highlights).
- Clear visual divider: diagonal wipe, vertical split, or sequential (before fades out, after fades in)
- "Before" uses slightly red-shifted, low-saturation color grade
- "After" uses the product's brand palette at full vibrancy
- Hold: 3-4 seconds

## Frame Archetypes (9:16 — Vertical)

- Content centered vertically within safe zone (see `marketing-video/professional-quality-guide.md` for exact values)
- Text 20% larger than 16:9 equivalent
- One focal element per frame — no split frames (not enough width)
- Stack vertically: headline top, visual middle, label/CTA bottom
- Swipe-friendly: assume viewer is scrolling, so hold times are shorter (1.5-2.5 seconds)

## Time-Bounded Readability

Viewers can't re-read. Every text element must be comprehensible in a single glance.

| Rule | Value |
|---|---|
| Max words per text block | 8 |
| Min hold time per text frame | `(word_count x 0.3) + 1` seconds |
| If text needs more time | Split into two frames — don't extend hold |
| Numbers as text | Always monospace, always larger than labels |
| One focal point per frame | If you can't point to "the thing" in 0.5s, too busy |

## Background Depth

A flat solid-color background makes any frame look cheap. Add at least one depth layer.

| Treatment | How | When |
|---|---|---|
| Radial gradient | Center slightly lighter than edges | Default for most frames |
| Noise overlay | 2-5% opacity noise texture layer | Prevents "digital flat" look |
| Vignette | Darkened corners at 10-15% | Focuses attention to center |
| Screenshot blur | Darkened, 20px-blurred version of the screenshot behind device frame | Product frames |
| Mesh gradient | 2-3 subtle color stops | Hero frames, opening scenes |

**Combining:** radial gradient + noise is the safe default. Add vignette for hero/CTA frames. Use screenshot blur for product frames.

**Overlay text rules:** text over anything non-solid needs either a scrim (semi-transparent dark layer behind text) or text shadow (2px blur, 50% opacity black). White text: use `rgba(255,255,255,0.95)` not pure `#FFFFFF`.

## Effect Families

Durable techniques, not dated trends. Each solves a specific visual problem.

| Family | What it does | When to use | When it looks cheesy | Max per video |
|---|---|---|---|---|
| **Glow emphasis** | Light bloom / neon accent behind key element | Metric reveals, hero numbers | On every element, on body text | 2-3 uses |
| **Kinetic type** | Individual letter animation (bounce, elastic, scatter) | Hook headlines, one-word reveals | On paragraphs, on data labels | 1 use (hook only) |
| **Liquid morph** | Fluid shape transitions between scenes | Scene transitions, logo reveals | Between every scene | 1-2 uses |
| **Audio lock** | Animation keyframed to audio beat | Metric reveals, CTA moments | Every transition | 2-4 key moments |
| **Depth shift** | 3D parallax, layered planes, perspective tilt | Product showcase, feature callouts | On text-heavy frames | 1-2 uses |

**Rule:** Pick 1-2 families per video. Using all of them = variety show = looks AI-generated. Each family should serve the story, not demonstrate capability.

## Frame Continuity

- Consistent background tone across scenes (no jarring light/dark switches unless intentional before/after)
- Consistent text positions (headlines stay top-left if they started top-left)
- Same accent color throughout — don't switch between metrics and CTAs
- Same transition type throughout unless narrative demands a change

## End-Card Archetypes

CTA placement strategy (when in the video) belongs to `marketing-video/video-storytelling.md`. This section covers the visual composition of the final frame.

**Rules:** minimum 3 seconds (90 frames), one action maximum, logo small and consistent, "Thank you" is not a CTA — end with an action verb. Test QR codes at output resolution before shipping.

### Clean Close
Logo centered (120-160px) + tagline (32px, muted) + URL (36px, accent). Fade to dark background over 15 frames, hold 90 frames. Use for: VC pitches, professional demos.

### Metric Close
Key number (120px, glow emphasis, rolling digit entrance) + context line (32px) + URL below. Hold 90-120 frames. Use for: DeFi products, traction-heavy projects.

### Action Close
Left (60%): action verb + URL (44px bold). Right (40%): QR code 200x200px minimum with white padding. Use for: social media, hackathon demos where viewers can scan.

### Loop Close
Last frame mirrors first frame's visual language (same background, text position, accent). No URL — put in caption. Cross-fade into first frame (15 frames). Use for: Twitter/X, TikTok, Instagram Reels.
