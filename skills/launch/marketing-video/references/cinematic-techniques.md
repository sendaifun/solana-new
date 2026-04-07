# Cinematic Production Techniques for Remotion

Advanced production techniques that elevate Remotion videos from "motion graphics" to "cinematic." Based on the official Remotion skills repo (38 rule modules) and professional motion design principles.

---

## Light Leaks — The Cinematic Secret Weapon

Light leaks are WebGL-based film effects that simulate light bleeding through a camera lens. They instantly add production value.

### Installation
```bash
npx remotion add @remotion/light-leaks
```

### As Scene Transition Overlays
Light leaks work as `<TransitionSeries.Overlay>` elements — they render over the cut point WITHOUT shortening the timeline (unlike transitions which overlap scenes):

```tsx
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { LightLeak } from "@remotion/light-leaks";

<TransitionSeries>
  <TransitionSeries.Sequence durationInFrames={120}>
    <HookScene />
  </TransitionSeries.Sequence>

  {/* Cinematic transition: fade + light leak overlay */}
  <TransitionSeries.Transition
    presentation={fade()}
    timing={linearTiming({ durationInFrames: 30 })}
  />
  <TransitionSeries.Overlay durationInFrames={40}>
    <LightLeak seed={5} hueShift={280} />  {/* Purple-tinted for Solana */}
  </TransitionSeries.Overlay>

  <TransitionSeries.Sequence durationInFrames={300}>
    <DemoScene />
  </TransitionSeries.Sequence>
</TransitionSeries>
```

### Hue Shift Guide
- `hueShift={0}` — Warm yellow-orange (classic film)
- `hueShift={120}` — Green tones
- `hueShift={240}` — Cool blue
- `hueShift={280}` — Purple (Solana brand)
- `hueShift={300}` — Magenta/pink

### Tips
- Use different `seed` values for variety — each seed produces a unique pattern
- Light leaks reveal during the first half and retract during the second half
- Best at 30-45 frame duration (1-1.5 seconds at 30fps)
- Combine with a fade transition underneath for a layered effect

---

## Noise-Driven Organic Motion

The `@remotion/noise` package uses Perlin noise to create organic, non-repetitive motion.

### Installation
```bash
npx remotion add @remotion/noise
```

### Floating Element Grid
Create a living background of dots that drift naturally:

```tsx
import { noise3D } from "@remotion/noise";

const FloatingGrid: React.FC<{ rows?: number; cols?: number }> = ({
  rows = 10, cols = 15
}) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ opacity: 0.15 }}>
      {Array.from({ length: rows * cols }).map((_, i) => {
        const baseX = (i % cols) / cols;
        const baseY = Math.floor(i / cols) / rows;

        // Noise-driven offset — smooth, organic drift
        const offsetX = noise3D("x", baseX * 3, baseY * 3, frame * 0.004) * 20;
        const offsetY = noise3D("y", baseX * 3, baseY * 3, frame * 0.004) * 20;
        const opacity = noise3D("o", baseX * 2, baseY * 2, frame * 0.006) * 0.5 + 0.5;

        return (
          <div key={i} style={{
            position: "absolute",
            left: `${baseX * 100}%`,
            top: `${baseY * 100}%`,
            transform: `translate(${offsetX}px, ${offsetY}px)`,
            width: 4, height: 4, borderRadius: "50%",
            backgroundColor: "#9945FF",
            opacity,
          }} />
        );
      })}
    </AbsoluteFill>
  );
};
```

### Organic Text Motion
Subtle noise-driven movement makes text feel alive:

```tsx
const OrganicText: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  const drift = noise3D("text", 0, 0, frame * 0.003) * 2;

  return (
    <div style={{ transform: `translateY(${drift}px)` }}>
      {children}
    </div>
  );
};
```

---

## Audio-Reactive Visuals

Sync visuals to audio for music videos, intros, or high-energy content.

### Installation
```bash
npx remotion add @remotion/media-utils
```

### Spectrum Bars
```tsx
import { visualizeAudio } from "@remotion/media-utils";
import { Audio, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

const SpectrumBars: React.FC<{ audioSrc: string }> = ({ audioSrc }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const visualization = visualizeAudio({
    fps,
    frame,
    audioData,  // Pre-fetched with getAudioData()
    numberOfSamples: 64,
    optimizeFor: "speed",
  });

  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 200 }}>
      {visualization.map((v, i) => (
        <div key={i} style={{
          width: 8,
          height: v * 200,
          backgroundColor: `hsl(${270 + i * 2}, 80%, 60%)`,  // Purple gradient
          borderRadius: "4px 4px 0 0",
        }} />
      ))}
    </div>
  );
};
```

### Bass-Reactive Scale
Extract low frequencies and use as a scale multiplier for beat-synced pulses:

```tsx
const visualization = visualizeAudio({ fps, frame, audioData, numberOfSamples: 32 });
// Average the lowest 4 frequency bins for bass detection
const bass = visualization.slice(0, 4).reduce((a, b) => a + b, 0) / 4;
const scale = 1 + bass * 0.3;  // 1.0 to 1.3 scale range

<div style={{ transform: `scale(${scale})` }}>
  <Logo />
</div>
```

### Volume Ducking (Music Under Voiceover)
```tsx
// Lower music volume when voiceover is playing
const voiceoverStart = 2 * fps;  // 2 seconds in
const voiceoverEnd = 25 * fps;   // 25 seconds in

const musicVolume = interpolate(
  frame,
  [voiceoverStart - 15, voiceoverStart, voiceoverEnd, voiceoverEnd + 15],
  [0.8, 0.15, 0.15, 0.8],
  { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
);

<Audio src={staticFile("music.mp3")} volume={musicVolume} />
<Audio src={staticFile("voiceover.mp3")} />
```

---

## Dynamic Color Grading

### interpolateColors for Scene Mood
```tsx
import { interpolateColors } from "remotion";

// Background shifts mood across the video
const bgColor = interpolateColors(
  frame,
  [0, 90, 180, durationInFrames],
  ["#0a0a0f", "#1a0533", "#0a1628", "#0a0a0f"]  // dark → purple → blue → dark
);
```

### Color Temperature Shifts
Warm highlights with cool shadows — the hallmark of cinematic color grading:

```tsx
// Warm overlay for "after" scenes (success, product reveal)
const warmOverlay = (
  <AbsoluteFill style={{
    background: "radial-gradient(ellipse at center, rgba(255,200,100,0.04) 0%, transparent 70%)",
    mixBlendMode: "overlay",
  }} />
);

// Cool overlay for "before" scenes (problem, old way)
const coolOverlay = (
  <AbsoluteFill style={{
    background: "linear-gradient(180deg, rgba(30,40,80,0.15) 0%, rgba(0,0,0,0) 100%)",
    mixBlendMode: "multiply",
  }} />
);
```

### Desaturation for "Before" Scenes
```tsx
// Apply desaturation for the "problem" or "before" section
const Before: React.FC = ({ children }) => (
  <AbsoluteFill style={{ filter: "saturate(0.5) brightness(0.9)" }}>
    {children}
  </AbsoluteFill>
);
```

---

## Advanced Transition Patterns

### Layered Transitions
Combine a base transition with an overlay for maximum production value:

```tsx
<TransitionSeries>
  <TransitionSeries.Sequence durationInFrames={120}>
    <Scene1 />
  </TransitionSeries.Sequence>

  {/* Base transition: smooth slide */}
  <TransitionSeries.Transition
    presentation={slide({ direction: "from-right" })}
    timing={springTiming({ config: { damping: 200 }, durationInFrames: 20 })}
  />

  {/* Overlay: light leak on top */}
  <TransitionSeries.Overlay durationInFrames={35}>
    <LightLeak seed={12} hueShift={280} />
  </TransitionSeries.Overlay>

  <TransitionSeries.Sequence durationInFrames={200}>
    <Scene2 />
  </TransitionSeries.Sequence>
</TransitionSeries>
```

### Flash Cut (Impact Moment)
A brief white flash for high-impact reveals:

```tsx
const FlashCut: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 3, 10], [0, 0.9, 0], {
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{ backgroundColor: "white", opacity }} />
  );
};

// Use as overlay at the transition point
<TransitionSeries.Overlay durationInFrames={12}>
  <FlashCut />
</TransitionSeries.Overlay>
```

### Zoom Transition
Zoom into the old scene, cut, zoom out of the new scene:

```tsx
const ZoomIn: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = interpolate(frame, [0, 15], [1, 1.3], {
    easing: Easing.inOut(Easing.cubic),
    extrapolateRight: "clamp",
  });
  const opacity = interpolate(frame, [10, 15], [1, 0], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ transform: `scale(${scale})`, opacity }}>
      {children}
    </AbsoluteFill>
  );
};
```

---

## Professional Typography Patterns

### Google Fonts — Type-Safe Loading
```tsx
import { loadFont } from "@remotion/google-fonts/Inter";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";

const { fontFamily } = loadFont();        // Blocks render until loaded
const { fontFamily: mono } = loadMono();   // For code/terminal

// Weight variants
const { fontFamily: interBold } = loadFont("700");
```

### Gradient Text
```tsx
const GradientText: React.FC<{ children: string; size?: number }> = ({
  children, size = 72
}) => (
  <div style={{
    fontSize: size,
    fontWeight: 900,
    fontFamily: "Inter, sans-serif",
    background: "linear-gradient(135deg, #9945FF 0%, #14F195 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  }}>
    {children}
  </div>
);
```

### Animated Line Reveal
Text that reveals line by line with a sliding mask:

```tsx
const LineReveal: React.FC<{ lines: string[]; stagger?: number }> = ({
  lines, stagger = 12
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {lines.map((line, i) => {
        const progress = spring({
          frame: frame - i * stagger,
          fps,
          config: { damping: 200 },
        });
        return (
          <div key={i} style={{ overflow: "hidden" }}>
            <div style={{
              transform: `translateY(${(1 - progress) * 100}%)`,
              opacity: progress,
              fontSize: 48, fontWeight: 700, color: "white",
              fontFamily: "Inter, sans-serif",
            }}>
              {line}
            </div>
          </div>
        );
      })}
    </div>
  );
};
```

---

## Whisper Transcription → TikTok Captions

Full pipeline from audio to styled captions.

### Step 1: Install Whisper
```bash
npx remotion add @remotion/install-whisper-cpp
npx remotion add @remotion/captions
```

### Step 2: Transcribe
```tsx
import { installWhisperCpp, transcribe } from "@remotion/install-whisper-cpp";

// During build/setup:
await installWhisperCpp({ version: "1.5.5" });
const { transcription } = await transcribe({
  inputPath: "public/voiceover.mp3",
  whisperPath: ".whisper",
  model: "medium",
  tokenLevelTimestamps: true,
});
```

### Step 3: Display with Per-Word Highlighting
```tsx
import { createTikTokStyleCaptions } from "@remotion/captions";

const { pages } = createTikTokStyleCaptions({
  transcription,
  combineTokensWithinMilliseconds: 800,
});

const CaptionOverlay: React.FC<{ pages: typeof pages }> = ({ pages }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const timeMs = (frame / fps) * 1000;
  const page = pages.find(p => timeMs >= p.startMs && timeMs < p.endMs);

  if (!page) return null;

  return (
    <div style={{
      position: "absolute",
      bottom: 180,  // Above mobile nav safe zone
      left: 40, right: 40,
      textAlign: "center",
      whiteSpace: "pre",  // REQUIRED for proper spacing
    }}>
      {page.tokens.map((tok, i) => {
        const active = timeMs >= tok.fromMs && timeMs < tok.toMs;
        return (
          <span key={i} style={{
            fontSize: 48,
            fontWeight: 800,
            fontFamily: "Inter, sans-serif",
            color: active ? "#14F195" : "white",
            textShadow: "0 2px 8px rgba(0,0,0,0.8), 0 0 20px rgba(0,0,0,0.4)",
          }}>
            {tok.text}
          </span>
        );
      })}
    </div>
  );
};
```

---

## ElevenLabs Voiceover Integration

### Dynamic Duration from Audio
```tsx
import { getAudioDurationInSeconds } from "@remotion/media-utils";

export const calculateMetadata: CalculateMetadataFunction<Props> = async ({ props }) => {
  const duration = await getAudioDurationInSeconds(props.voiceoverUrl);
  return {
    durationInFrames: Math.ceil(duration * 30) + 90,  // +3s CTA
    fps: 30,
  };
};
```

### Audio with Volume Animation
```tsx
<Audio
  src={props.voiceoverUrl}
  volume={(f) => {
    // Fade in over 0.5s, fade out over 1s at the end
    const fadeIn = interpolate(f, [0, 15], [0, 1], { extrapolateRight: "clamp" });
    const fadeOut = interpolate(f, [totalFrames - 30, totalFrames], [1, 0], {
      extrapolateLeft: "clamp",
    });
    return Math.min(fadeIn, fadeOut);
  }}
/>
```

---

## SVG Path Animation

For animated line charts, logo reveals, and drawing effects.

### Progressive Line Chart
```tsx
import { evolvePath } from "@remotion/paths";

const AnimatedChart: React.FC<{ path: string }> = ({ path }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({ frame, fps, config: { damping: 200 } });
  const { strokeDasharray, strokeDashoffset } = evolvePath(progress, path);

  return (
    <svg width={800} height={400}>
      <path
        d={path}
        fill="none"
        stroke="#14F195"
        strokeWidth={3}
        strokeDasharray={strokeDasharray}
        strokeDashoffset={strokeDashoffset}
      />
    </svg>
  );
};
```

---

## Lottie Animations

Embed high-quality vector animations from LottieFiles:

### Installation
```bash
npx remotion add @remotion/lottie
```

### Usage
```tsx
import { Lottie, LottieAnimationData } from "@remotion/lottie";
import { useEffect, useState } from "react";

const LottieElement: React.FC<{ src: string }> = ({ src }) => {
  const [data, setData] = useState<LottieAnimationData | null>(null);

  useEffect(() => {
    fetch(src).then(r => r.json()).then(setData);
  }, [src]);

  if (!data) return null;

  return <Lottie animationData={data} />;
};
```

---

## 4K Rendering and Output Quality

### Resolution Best Practices
- Render at 4K (3840x2160) for maximum text sharpness, then downscale for delivery
- Or use Remotion's output scaling: `--scale 2` doubles pixel density
- Use `--image-format png` for screenshots where quality > speed

### Render Commands for Production
```bash
# Standard HD (fast, good for iteration)
npx remotion render ProductDemo out/draft.mp4 --codec h264 --crf 23

# Production quality
npx remotion render ProductDemo out/final.mp4 --codec h264 --crf 18 --color-space bt709

# 4K render
npx remotion render ProductDemo out/4k.mp4 --width 3840 --height 2160 --crf 18

# Multi-core render (faster)
npx remotion render ProductDemo out/fast.mp4 --concurrency 8

# Transparent background (for compositing)
npx remotion render ProductDemo out/transparent.webm --codec vp8

# GIF (for embeds, README demos)
npx remotion render ProductDemo out/preview.gif --every-nth-frame 2
```

### CRF Guide
- **18** — Visually lossless, large file (production/final delivery)
- **23** — Default, good balance (drafts, iteration)
- **28** — Smaller file, some quality loss (social media where platforms re-encode anyway)

### Color Space
Always use `--color-space bt709` for final renders — improves color accuracy across devices.

---

## Maps and Geographic Visuals

For global/network visualizations (e.g., showing validator nodes, user distribution):

```bash
npx remotion add @remotion/maps
```

```tsx
// Mapbox integration with animated markers
// See official Remotion maps rule for full details
```

---

## GIF Integration

For embedding animated elements (memes, reactions, UI interactions):

```bash
npx remotion add @remotion/gif
```

```tsx
import { Gif } from "@remotion/gif";

<Gif src={staticFile("reaction.gif")} width={200} height={200} />
```

GIFs are synchronized with Remotion's timeline — they won't play independently.

---

## Production Pipeline Checklist

### Pre-Production
- [ ] Creative brief completed (8 questions answered)
- [ ] Storytelling framework selected
- [ ] Assets prepared (screenshots at 2x resolution, logos as SVG)
- [ ] Font files loaded via `@remotion/google-fonts`
- [ ] Color palette defined (primary, secondary, accent, background)

### Production
- [ ] Official Remotion skills installed (`npx skills add remotion-dev/skills`)
- [ ] Compositions defined for all target formats (16:9, 9:16, 1:1)
- [ ] Professional quality checklist passed (see professional-quality-guide.md)
- [ ] Audio integrated (voiceover, SFX, or music)
- [ ] Captions generated for muted playback

### Post-Production
- [ ] Preview in Remotion Studio at target resolution
- [ ] Render at CRF 18 with bt709 color space
- [ ] Platform-specific exports (aspect ratios, durations)
- [ ] Thumbnail generated from strongest frame
- [ ] Caption .srt file exported
- [ ] Post copy written for each platform
