# Remotion Advanced Patterns

Advanced techniques from the [official Remotion skills repo](https://github.com/remotion-dev/skills) (remotion-dev/skills). These patterns go beyond basic Sequences and interpolation.

**Source:** [github.com/remotion-dev/skills](https://github.com/remotion-dev/skills) — 38 rule modules covering every aspect of Remotion video creation.
**Quality:** Read [professional-quality-guide.md](professional-quality-guide.md) for anti-AI patterns and Disney principles.
**Cinematic:** Read [cinematic-techniques.md](cinematic-techniques.md) for light leaks, noise, audio-reactive visuals, and 4K rendering.

---

## Core Rule: Frame-Driven Animation Only

**CRITICAL:** All animation in Remotion MUST be driven by `useCurrentFrame()`. CSS transitions, CSS animations, Tailwind `animate-*` classes, and third-party animation libraries (framer-motion, react-spring, etc.) are FORBIDDEN. They don't sync with Remotion's frame-based rendering.

```tsx
// CORRECT — frame-driven
const frame = useCurrentFrame();
const opacity = interpolate(frame, [0, 30], [0, 1]);

// WRONG — CSS transition (won't render correctly)
<div style={{ transition: "opacity 1s" }}>
```

---

## Scene Transitions with TransitionSeries

Replace hard cuts with professional transitions:

```tsx
import { TransitionSeries, linearTiming, springTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { clockWipe } from "@remotion/transitions/clock-wipe";

export const MyVideo: React.FC = () => {
  return (
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={120}>
        <HookScene />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={slide({ direction: "from-right" })}
        timing={springTiming({ config: { damping: 200 }, durationInFrames: 15 })}
      />

      <TransitionSeries.Sequence durationInFrames={300}>
        <DemoScene />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: 20 })}
      />

      <TransitionSeries.Sequence durationInFrames={90}>
        <CTAScene />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  );
};
```

**Available transitions:** `fade()`, `slide()`, `wipe()`, `flip()`, `clockWipe()`

**Duration math:** Total composition frames = sum of all sequence durations MINUS all transition durations.

---

## Spring Animation Configs

Spring animations feel more natural than linear interpolation. Use these presets:

```tsx
import { spring, useCurrentFrame, useVideoConfig } from "remotion";

const { fps } = useVideoConfig();
const frame = useCurrentFrame();

// Smooth (UI elements, subtle motion)
const smooth = spring({ frame, fps, config: { damping: 200 } });

// Snappy (buttons, cards, quick reveals)
const snappy = spring({ frame, fps, config: { damping: 20, stiffness: 200 } });

// Bouncy (playful elements, attention-grabbing)
const bouncy = spring({ frame, fps, config: { damping: 8 } });

// Heavy (large elements, dramatic reveals)
const heavy = spring({ frame, fps, config: { damping: 15, stiffness: 80, mass: 2 } });

// With delay (offset in frames)
const delayed = spring({ frame: frame - 15, fps, config: { damping: 200 } });
```

---

## Text Animations

### Typewriter Effect (for code, terminal output)

```tsx
const TypewriterText: React.FC<{ text: string; startFrame?: number; speed?: number }> = ({
  text, startFrame = 0, speed = 2
}) => {
  const frame = useCurrentFrame();
  const adjustedFrame = frame - startFrame;
  const charsToShow = Math.min(Math.floor(adjustedFrame / speed), text.length);
  const showCursor = adjustedFrame % 30 < 20; // Blink every second

  return (
    <div style={{ fontFamily: "JetBrains Mono, monospace", color: "#14F195" }}>
      {text.slice(0, charsToShow)}
      {showCursor && <span style={{ opacity: charsToShow < text.length ? 1 : 0.5 }}>|</span>}
    </div>
  );
};
```

### Word Highlight Effect (for key phrases)

```tsx
const HighlightWord: React.FC<{ word: string; color?: string }> = ({
  word, color = "#9945FF"
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scaleX = spring({ frame, fps, config: { damping: 20, stiffness: 200 } });

  return (
    <span style={{ position: "relative", display: "inline-block" }}>
      <span style={{
        position: "absolute", bottom: 0, left: -4, right: -4,
        height: "40%", backgroundColor: color, opacity: 0.3,
        transform: `scaleX(${scaleX})`, transformOrigin: "left",
      }} />
      <span style={{ position: "relative" }}>{word}</span>
    </span>
  );
};
```

---

## Animated Charts (for Data Story videos)

### Bar Chart with Staggered Entrance

```tsx
const AnimatedBarChart: React.FC<{ data: { label: string; value: number }[] }> = ({ data }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 20, height: 400 }}>
      {data.map((item, i) => {
        const barHeight = spring({
          frame: frame - i * 8, // Stagger: 8 frames between each bar
          fps,
          config: { damping: 15, stiffness: 80 },
        });
        const height = barHeight * (item.value / maxValue) * 350;

        return (
          <div key={item.label} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{
              width: 60, height, backgroundColor: "#9945FF",
              borderRadius: "8px 8px 0 0",
              background: `linear-gradient(180deg, #9945FF, #14F195)`,
            }} />
            <div style={{ color: "white", fontSize: 14, marginTop: 8 }}>{item.label}</div>
          </div>
        );
      })}
    </div>
  );
};
```

### Animated Counter

```tsx
const AnimatedCounter: React.FC<{ from: number; to: number; prefix?: string; suffix?: string }> = ({
  from, to, prefix = "", suffix = ""
}) => {
  const frame = useCurrentFrame();
  const value = interpolate(frame, [0, 60], [from, to], { extrapolateRight: "clamp" });

  return (
    <div style={{ fontSize: 96, fontWeight: 800, color: "#14F195", fontFamily: "Inter" }}>
      {prefix}{Math.round(value).toLocaleString()}{suffix}
    </div>
  );
};
```

---

## Sound Effects

Built-in SFX from `@remotion/sfx` — no external files needed:

```tsx
import { Audio } from "remotion";
import { getWhoosh, getWhip, getDing, getSwitch, getShutter, getMouseClick } from "@remotion/sfx";

// Use in a Sequence for timing:
<Sequence from={0} durationInFrames={30}>
  <Audio src={getWhoosh()} volume={0.5} />
</Sequence>

<Sequence from={90} durationInFrames={30}>
  <Audio src={getDing()} volume={0.7} />
</Sequence>
```

**Available SFX:** whoosh, whip, page-turn, switch, mouse-click, shutter, ding, bruh, vine-boom, windows-xp-error

**Best practices:**
- Whoosh on slide/scene transitions
- Ding on metric reveals or achievements
- Switch on toggle/button interactions
- Shutter on screenshot captures

---

## TikTok-Style Captions

For captioned videos (85% of social video is watched muted):

```tsx
import { createTikTokStyleCaptions } from "@remotion/captions";

// After transcribing with Whisper.cpp or providing an SRT:
const { pages } = createTikTokStyleCaptions({
  transcription,
  combineTokensWithinMilliseconds: 800,
});

// Render with per-word highlighting:
const CaptionDisplay: React.FC<{ pages: CaptionPage[] }> = ({ pages }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTimeMs = (frame / fps) * 1000;

  // Find current page based on time
  const currentPage = pages.find(
    p => currentTimeMs >= p.startMs && currentTimeMs < p.endMs
  );

  if (!currentPage) return null;

  return (
    <div style={{
      position: "absolute", bottom: 100, left: 0, right: 0,
      textAlign: "center", fontSize: 48, fontWeight: 800,
      textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
    }}>
      {currentPage.tokens.map((token, i) => {
        const isActive = currentTimeMs >= token.fromMs && currentTimeMs < token.toMs;
        return (
          <span key={i} style={{ color: isActive ? "#14F195" : "white" }}>
            {token.text}
          </span>
        );
      })}
    </div>
  );
};
```

---

## Voiceover with ElevenLabs

Generate TTS voiceover and sync to video:

```tsx
// In calculateMetadata, determine duration from voiceover length:
export const calculateMetadata: CalculateMetadataFunction<Props> = async ({ props }) => {
  const audioDuration = await getAudioDurationInSeconds(props.voiceoverUrl);
  return {
    durationInFrames: Math.ceil(audioDuration * 30) + 90, // +3s for CTA
    fps: 30,
  };
};

// In composition:
<Audio src={props.voiceoverUrl} />
```

---

## 3D Scenes

For dramatic product reveals or abstract visuals:

```tsx
import { ThreeCanvas } from "@remotion/three";
import { useCurrentFrame } from "remotion";

const My3DScene: React.FC = () => {
  const frame = useCurrentFrame();
  const rotation = interpolate(frame, [0, 300], [0, Math.PI * 2]);

  return (
    <ThreeCanvas>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <mesh rotation={[0, rotation, 0]}>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial color="#9945FF" />
      </mesh>
    </ThreeCanvas>
  );
};
```

**CRITICAL:** In 3D scenes, use `useCurrentFrame()` from Remotion, NOT `useFrame()` from React Three Fiber. RTF's `useFrame` doesn't sync with Remotion's rendering.

---

## Parametrizable Videos with Zod

Make videos data-driven with type-safe props:

```tsx
import { z } from "zod";
import { zColor } from "@remotion/zod-types";

export const videoSchema = z.object({
  projectName: z.string(),
  tagline: z.string(),
  metric: z.string(),
  metricValue: z.string(),
  primaryColor: zColor(),
  screenshotUrl: z.string().url(),
  ctaUrl: z.string().url(),
});

// Register with schema:
<Composition
  id="ProductDemo"
  component={ProductDemo}
  schema={videoSchema}
  defaultProps={{
    projectName: "MyProject",
    tagline: "One-line description",
    metric: "Transactions",
    metricValue: "50K+",
    primaryColor: "#9945FF",
    screenshotUrl: "https://...",
    ctaUrl: "https://...",
  }}
  durationInFrames={900}
  fps={30}
  width={1920}
  height={1080}
/>
```

This enables: visual editing in Remotion Studio sidebar, type-safe props, easy reuse across projects.

---

## Premounting for Smooth Playback

Always premount sequences that contain heavy content (images, videos, fonts):

```tsx
<Sequence from={90} durationInFrames={300} premountFor={30}>
  <HeavyScene /> {/* Starts loading 1 second before it appears */}
</Sequence>
```

---

## Light Leak Overlays

Professional film-quality transition overlays:

```tsx
import { LightLeak } from "@remotion/light-leaks";

// Inside TransitionSeries.Overlay:
<TransitionSeries.Overlay>
  <LightLeak seed={42} hueShift={280} /> {/* Purple-tinted for Solana branding */}
</TransitionSeries.Overlay>
```

---

## Google Fonts (Type-Safe)

```tsx
import { loadFont } from "@remotion/google-fonts/Inter";
const { fontFamily } = loadFont(); // Blocks rendering until loaded

// For code:
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
const { fontFamily: monoFamily } = loadMono();
```

---

## Easing Functions (When Springs Don't Fit)

For properties like color and opacity where spring physics don't apply:

```tsx
import { Easing } from "remotion";

// Natural motion curves
const opacity = interpolate(frame, [0, 30], [0, 1], {
  easing: Easing.inOut(Easing.cubic),  // Smooth acceleration/deceleration
  extrapolateRight: "clamp",
});

// Precise control with bezier
const scale = interpolate(frame, [0, 20], [0.8, 1], {
  easing: Easing.bezier(0.25, 0.1, 0.25, 1),  // Matches CSS ease
  extrapolateRight: "clamp",
});
```

**Available curves:** `ease`, `quad`, `cubic`, `sin`, `exp`, `circle`, `back`, `elastic`, `bounce`
**Modifiers:** `Easing.in()`, `Easing.out()`, `Easing.inOut()` — wrap any curve

**Rule:** Never use bare `interpolate()` without easing or spring. Linear motion = robotic.

---

## Dynamic Colors with interpolateColors

```tsx
import { interpolateColors } from "remotion";

// Background mood shift across scenes
const bg = interpolateColors(
  frame,
  [0, 90, 180, durationInFrames],
  ["#0a0a0f", "#1a0533", "#0a1628", "#0a0a0f"]
);

// Supports: CSS named colors, hex, RGB/RGBA, HSL/HSLA, oklch, oklab
```

---

## Noise-Driven Organic Motion

For subtle, non-repetitive motion that makes elements feel alive:

```tsx
import { noise3D } from "@remotion/noise";

// Gentle floating — barely perceptible, prevents "dead" resting state
const driftX = noise3D("x", 0, 0, frame * 0.005) * 3;  // +-3px
const driftY = noise3D("y", 0, 0, frame * 0.005) * 3;

// Breathing background glow
const breathe = Math.sin(frame * 0.02) * 0.5 + 0.5;
const glowOpacity = interpolate(breathe, [0, 1], [0.05, 0.12]);
```

Install: `npx remotion add @remotion/noise`

---

## Mobile Safe Zones (Vertical Video)

For 9:16 formats (TikTok, Reels, Shorts), keep all text and key content within:
- **Top:** At least 150px from top edge (platform search bars, status bar)
- **Bottom:** At least 170px from bottom edge (navigation, swipe-up UI)
- **Sides:** At least 40px padding

```tsx
const SafeZone: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{
    paddingTop: 150,
    paddingBottom: 170,
    paddingLeft: 40,
    paddingRight: 40,
  }}>
    {children}
  </AbsoluteFill>
);
```

---

## Rendering Best Practices

```bash
# Draft (fast iteration)
npx remotion render ProductDemo out/draft.mp4 --codec h264 --crf 23

# Production quality
npx remotion render ProductDemo out/final.mp4 --codec h264 --crf 18 --color-space bt709

# 4K render (maximum text sharpness)
npx remotion render ProductDemo out/4k.mp4 --width 3840 --height 2160 --crf 18

# Multi-core (faster render)
npx remotion render ProductDemo out/fast.mp4 --concurrency 8

# Transparent background (for compositing)
npx remotion render ProductDemo out/transparent.webm --codec vp8

# Specific props via CLI
npx remotion render ProductDemo out/custom.mp4 --props '{"projectName":"MyDApp"}'

# GIF preview (for README, embeds)
npx remotion render ProductDemo out/preview.gif --every-nth-frame 2
```

### CRF Guide
- **18** — Visually lossless, large file (final delivery)
- **23** — Default, good balance (drafts, iteration)
- **28** — Smaller file, some quality loss (social media)

### Always use `--color-space bt709` for final renders — ensures accurate colors across devices.

---

## Thumbnail Generation with Still

Register a `Still` (single-frame composition) to auto-generate thumbnails:

```tsx
import { Still } from "remotion";

// In Root.tsx:
<Still
  id="Thumbnail"
  component={Thumbnail}
  width={1280}
  height={720}   // YouTube standard
  defaultProps={{ metric: "$2.1M", subtitle: "settled in 30 days" }}
/>

<Still
  id="ThumbnailSquare"
  component={Thumbnail}
  width={1080}
  height={1080}  // Instagram
  defaultProps={{ metric: "$2.1M", subtitle: "settled in 30 days" }}
/>
```

```tsx
// Thumbnail.tsx — use the strongest frame from your video
const Thumbnail: React.FC<{ metric: string; subtitle: string }> = ({ metric, subtitle }) => (
  <AbsoluteFill style={{
    backgroundColor: "#0a0a0f",
    justifyContent: "center",
    alignItems: "center",
  }}>
    {/* High-contrast, 3-4 words max */}
    <div style={{
      fontSize: 120, fontWeight: 900, color: "#14F195",
      fontFamily: "Inter, sans-serif",
    }}>
      {metric}
    </div>
    <div style={{
      fontSize: 36, color: "white", marginTop: 16,
      fontFamily: "Inter, sans-serif",
    }}>
      {subtitle}
    </div>
  </AbsoluteFill>
);
```

Render thumbnails:
```bash
npx remotion still Thumbnail out/thumbnail-yt.png
npx remotion still ThumbnailSquare out/thumbnail-ig.png
```

**Thumbnail rules:**
- High contrast (bright text on dark, or dark text on light)
- 3-4 words maximum
- No small text — it's displayed at 160x90px in YouTube search
- The metric/number should be the dominant visual
- Face + emotion performs best (if applicable)

---

## Multi-Format Auto-Export

Use Remotion's parametrization to render one composition in all platform formats:

### Step 1: Parametrize the composition

```tsx
import { z } from "zod";

const formatSchema = z.object({
  format: z.enum(["landscape", "portrait", "square"]),
  // ... your other props
});

const FORMAT_CONFIG = {
  landscape: { width: 1920, height: 1080 },
  portrait:  { width: 1080, height: 1920 },
  square:    { width: 1080, height: 1080 },
};
```

### Step 2: Use calculateMetadata for dynamic dimensions

```tsx
export const calculateMetadata: CalculateMetadataFunction<z.infer<typeof formatSchema>> = ({ props }) => {
  const config = FORMAT_CONFIG[props.format];
  return {
    width: config.width,
    height: config.height,
  };
};
```

### Step 3: Batch render script

```bash
#!/bin/bash
# render-all.sh — Render all platform formats

COMP="ProductDemo"
CRF=18
COLOR="bt709"

echo "Rendering landscape (16:9)..."
npx remotion render "$COMP" "out/${COMP}-landscape.mp4" \
  --props '{"format":"landscape"}' --crf $CRF --color-space $COLOR

echo "Rendering portrait (9:16)..."
npx remotion render "$COMP" "out/${COMP}-portrait.mp4" \
  --props '{"format":"portrait"}' --crf $CRF --color-space $COLOR

echo "Rendering square (1:1)..."
npx remotion render "$COMP" "out/${COMP}-square.mp4" \
  --props '{"format":"square"}' --crf $CRF --color-space $COLOR

echo "Rendering thumbnails..."
npx remotion still Thumbnail "out/thumb-youtube.png"
npx remotion still ThumbnailSquare "out/thumb-instagram.png"

echo "Done! All formats in out/"
ls -la out/
```

### Alternative: Separate compositions (simpler)

If your layout changes significantly per format, just register separate compositions:

```tsx
// Root.tsx
<Composition id="Demo-Landscape" component={Demo} width={1920} height={1080} ... />
<Composition id="Demo-Portrait"  component={Demo} width={1080} height={1920} ... />
<Composition id="Demo-Square"    component={Demo} width={1080} height={1080} ... />
```

Then render all:
```bash
npx remotion render Demo-Landscape out/demo-16x9.mp4 --crf 18 --color-space bt709
npx remotion render Demo-Portrait  out/demo-9x16.mp4 --crf 18 --color-space bt709
npx remotion render Demo-Square    out/demo-1x1.mp4  --crf 18 --color-space bt709
```
