# Remotion Quickstart Reference

Based on the [official Remotion skills repo](https://github.com/remotion-dev/skills) — 38 rule modules covering every aspect of programmatic video creation.

## Installation & Setup

### Step 1: Create Project
```bash
npx create-video@latest my-video
# Select: Blank template
# TailwindCSS: Yes (optional but recommended)
# Install Skills: Yes
cd my-video && npm install
```

### Step 2: Install Official Remotion Skills (REQUIRED)
The official skills give Claude the full Remotion knowledge base — 38 rule modules covering animations, transitions, captions, audio, 3D, charts, and more:

```bash
npx skills add remotion-dev/skills
```

This installs to `~/.claude/skills/` and is automatically available in all future Claude Code sessions.

### Step 3: Install Key Packages
```bash
npx remotion add @remotion/transitions     # Scene transitions (fade, slide, wipe)
npx remotion add @remotion/light-leaks     # Cinematic light leak overlays
npx remotion add @remotion/google-fonts    # Type-safe font loading
npx remotion add @remotion/noise           # Perlin noise for organic motion
npx remotion add @remotion/captions        # TikTok-style captions
npx remotion add @remotion/media-utils     # Audio visualization, duration detection
```

### Step 4: Start Development
```bash
npx remotion studio          # Preview in browser (hot reload)
```

## Official Remotion Skills — 38 Rule Modules

The installed skills cover these topics (each is a separate rule file):

| Category | Rules | What They Cover |
|----------|-------|-----------------|
| **Animation** | `animations.md`, `timing.md` | useCurrentFrame, interpolate, spring, Easing |
| **Text** | `text-animations.md`, `fonts.md` | Typewriter, word highlight, Google Fonts, local fonts |
| **Transitions** | `transitions.md`, `light-leaks.md` | TransitionSeries, fade/slide/wipe/flip, light leaks |
| **Audio** | `audio.md`, `sfx.md`, `audio-visualization.md` | Import, trim, volume, SFX, spectrum bars, waveforms |
| **Captions** | `display-captions.md`, `transcribe-captions.md`, `import-srt-captions.md`, `subtitles.md` | Whisper.cpp, TikTok-style, SRT import |
| **Media** | `assets.md`, `images.md`, `videos.md`, `gifs.md` | staticFile(), Img, Video, trimming, GIFs |
| **Data Viz** | `charts.md` | Bar, pie, line, stock charts |
| **Layout** | `compositions.md`, `sequencing.md`, `measuring-dom-nodes.md`, `measuring-text.md` | Compositions, Sequence, text measuring |
| **Voiceover** | `voiceover.md` | ElevenLabs TTS, dynamic duration |
| **3D** | `3d.md` | Three.js, ThreeCanvas, useCurrentFrame (NOT useFrame) |
| **Advanced** | `parameters.md`, `calculate-metadata.md`, `tailwind.md`, `transparent-videos.md`, `trimming.md` | Zod schemas, dynamic props, Tailwind, transparency |
| **Tools** | `ffmpeg.md`, `extract-frames.md`, `get-audio-duration.md`, `get-video-dimensions.md`, `get-video-duration.md`, `can-decode.md` | FFmpeg, media inspection |
| **Other** | `lottie.md`, `maps.md` | Lottie animations, Mapbox maps |

## Project Structure
```
my-video/
  src/
    Root.tsx          # Register all compositions here
    ProductDemo.tsx   # Main product demo composition
    SocialClip.tsx    # Vertical social media clip
    TwitterClip.tsx   # Twitter/X optimized clip
    components/       # Reusable animation components
  public/             # Static assets (screenshots, logos — use staticFile())
  remotion.config.ts  # Remotion config
  package.json
```

## Key Concepts

### Composition — A Video Component
```tsx
import { Composition } from "remotion";
export const RemotionRoot = () => (
  <>
    <Composition id="ProductDemo" component={ProductDemo}
      durationInFrames={900} fps={30} width={1920} height={1080} />
    <Composition id="SocialClip" component={SocialClip}
      durationInFrames={450} fps={30} width={1080} height={1920} />
    <Composition id="TwitterClip" component={TwitterClip}
      durationInFrames={450} fps={30} width={1920} height={1080} />
    <Composition id="SquareClip" component={SquareClip}
      durationInFrames={450} fps={30} width={1080} height={1080} />
  </>
);
```

### Sequence — Time-Based Sections
```tsx
import { Sequence } from "remotion";
<Sequence from={0} durationInFrames={90}>
  <HookSlide />
</Sequence>
<Sequence from={90} durationInFrames={300} premountFor={30}>
  <DemoSlide />
</Sequence>
```

### useCurrentFrame + interpolate — Animation Primitives
```tsx
import { useCurrentFrame, interpolate } from "remotion";
const frame = useCurrentFrame();
const opacity = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: "clamp" });
const y = interpolate(frame, [0, 30], [40, 0], { extrapolateRight: "clamp" });
```

### spring — Natural Motion
```tsx
import { spring, useVideoConfig } from "remotion";
const { fps } = useVideoConfig();
const scale = spring({ frame, fps, config: { damping: 200 } });
```

### Media Components (ALWAYS use Remotion components, never native HTML)
```tsx
import { Img, Video, Audio, staticFile } from "remotion";
<Img src={staticFile("screenshot.png")} />
<Video src={staticFile("demo.mp4")} startFrom={30} endAt={300} />
<Audio src={staticFile("voiceover.mp3")} volume={0.8} />
```

## Rendering
```bash
npx remotion studio          # Preview in browser
npx remotion render ProductDemo out/product-demo.mp4
npx remotion render SocialClip out/social-clip.mp4
npx remotion render ProductDemo out/hq.mp4 --codec h264 --crf 18
```

## Social Media Formats
```tsx
// Landscape — YouTube, Twitter, landing page, hackathon
<Composition width={1920} height={1080} fps={30} />

// Portrait — TikTok, Instagram Reels, YouTube Shorts
<Composition width={1080} height={1920} fps={30} />

// Square — Instagram Feed
<Composition width={1080} height={1080} fps={30} />
```

## Solana Product Demo Template

Complete template with 5 scenes, Solana branding, and spring animations:

```tsx
import {
  AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig,
  interpolate, spring, Img, staticFile
} from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";

// Solana brand colors
const COLORS = {
  purple: "#9945FF",
  green: "#14F195",
  black: "#000000",
  darkPurple: "#7B3FE4",
  darkGray: "#19161C",
};

export const ProductDemo: React.FC = () => {
  return (
    <TransitionSeries>
      {/* Scene 1: Hook — Bold metric (3s) */}
      <TransitionSeries.Sequence durationInFrames={90}>
        <HookScene metric="$2.1M" subtitle="settled in 30 days. Zero bank accounts." />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={slide({ direction: "from-right" })}
        timing={linearTiming({ durationInFrames: 15 })}
      />

      {/* Scene 2: Problem (5s) */}
      <TransitionSeries.Sequence durationInFrames={150}>
        <ProblemScene text="AI agents can't pay each other without a human co-signer." />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: 15 })}
      />

      {/* Scene 3: Demo / Screenshots (14s) */}
      <TransitionSeries.Sequence durationInFrames={420}>
        <DemoScene />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: 15 })}
      />

      {/* Scene 4: Metrics / Social Proof (5s) */}
      <TransitionSeries.Sequence durationInFrames={150}>
        <MetricsScene
          metrics={[
            { label: "Transactions", value: "50K+" },
            { label: "Agents Connected", value: "120" },
            { label: "Avg Settlement", value: "<400ms" },
          ]}
        />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: 10 })}
      />

      {/* Scene 5: CTA (3s) */}
      <TransitionSeries.Sequence durationInFrames={90}>
        <CTAScene url="yourproject.com" />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  );
};

// --- Scene Components ---

const HookScene: React.FC<{ metric: string; subtitle: string }> = ({ metric, subtitle }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const metricScale = spring({ frame, fps, config: { damping: 12, stiffness: 100 } });
  const subtitleOpacity = interpolate(frame, [20, 40], [0, 1], { extrapolateRight: "clamp" });
  const subtitleY = interpolate(frame, [20, 40], [20, 0], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{
      backgroundColor: COLORS.black,
      justifyContent: "center",
      alignItems: "center",
    }}>
      <div style={{
        fontSize: 144,
        fontWeight: 900,
        color: COLORS.green,
        fontFamily: "Inter, sans-serif",
        transform: `scale(${metricScale})`,
      }}>
        {metric}
      </div>
      <div style={{
        fontSize: 36,
        color: "white",
        opacity: subtitleOpacity,
        transform: `translateY(${subtitleY}px)`,
        fontFamily: "Inter, sans-serif",
        marginTop: 20,
      }}>
        {subtitle}
      </div>
    </AbsoluteFill>
  );
};

const ProblemScene: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{
      backgroundColor: COLORS.black,
      justifyContent: "center",
      alignItems: "center",
      padding: 100,
    }}>
      <div style={{
        fontSize: 56,
        fontWeight: 700,
        color: "white",
        textAlign: "center",
        opacity,
        fontFamily: "Inter, sans-serif",
        lineHeight: 1.3,
      }}>
        {text}
      </div>
    </AbsoluteFill>
  );
};

const MetricsScene: React.FC<{ metrics: { label: string; value: string }[] }> = ({ metrics }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{
      backgroundColor: COLORS.black,
      justifyContent: "center",
      alignItems: "center",
    }}>
      <div style={{ display: "flex", gap: 80 }}>
        {metrics.map((m, i) => {
          const s = spring({ frame: frame - i * 10, fps, config: { damping: 15, stiffness: 100 } });
          return (
            <div key={m.label} style={{
              textAlign: "center",
              transform: `scale(${s})`,
              opacity: s,
            }}>
              <div style={{
                fontSize: 72, fontWeight: 900, color: COLORS.green,
                fontFamily: "Inter, sans-serif",
              }}>
                {m.value}
              </div>
              <div style={{
                fontSize: 24, color: "rgba(255,255,255,0.7)", marginTop: 8,
                fontFamily: "Inter, sans-serif",
              }}>
                {m.label}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const CTAScene: React.FC<{ url: string }> = ({ url }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = spring({ frame, fps, config: { damping: 200 } });

  return (
    <AbsoluteFill style={{
      backgroundColor: COLORS.black,
      justifyContent: "center",
      alignItems: "center",
    }}>
      <div style={{ transform: `scale(${scale})`, textAlign: "center" }}>
        <div style={{
          fontSize: 48, fontWeight: 800, color: COLORS.green,
          fontFamily: "Inter, sans-serif",
        }}>
          Try it now
        </div>
        <div style={{
          fontSize: 32, color: "white", marginTop: 16,
          fontFamily: "Inter, sans-serif",
        }}>
          {url}
        </div>
      </div>
    </AbsoluteFill>
  );
};
```

## Social Clip Template (Vertical — TikTok/Reels)

```tsx
export const SocialClip: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.black }}>
      {/* Hook in first 1 second — pattern interrupt */}
      <Sequence from={0} durationInFrames={90}>
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: 40 }}>
          <AnimatedText text="POV: Your Solana app" delay={0} size={56} />
          <AnimatedText text="just got 10x faster" delay={15} size={56} color={COLORS.green} />
        </AbsoluteFill>
      </Sequence>

      {/* Quick demo (3-12s) */}
      <Sequence from={90} durationInFrames={270} premountFor={30}>
        <AbsoluteFill>
          <Img src={staticFile("demo-screenshot.png")}
            style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          {/* Animated annotation pointing to key feature */}
          <Sequence from={30}>
            <AnnotationArrow x={540} y={800} label="One-click swap" />
          </Sequence>
          <Sequence from={90}>
            <AnnotationArrow x={540} y={1200} label="< 400ms" />
          </Sequence>
        </AbsoluteFill>
      </Sequence>

      {/* CTA (12-15s) */}
      <Sequence from={360} durationInFrames={90}>
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
          <div style={{
            color: COLORS.green, fontSize: 64, fontWeight: 800,
            fontFamily: "Inter, sans-serif",
          }}>
            Try it now
          </div>
          <div style={{
            color: "white", fontSize: 32, marginTop: 20,
            fontFamily: "Inter, sans-serif",
          }}>
            link in bio
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};
```

## Utility Components

### AnimatedText (reusable fade+slide)
```tsx
const AnimatedText: React.FC<{
  text: string; delay?: number; size?: number; color?: string;
}> = ({ text, delay = 0, size = 48, color = "white" }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame - delay, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const y = interpolate(frame - delay, [0, 20], [30, 0], { extrapolateRight: "clamp" });

  return (
    <div style={{
      opacity: Math.max(0, opacity),
      transform: `translateY(${Math.max(0, y)}px)`,
      color,
      fontSize: size,
      fontWeight: 700,
      fontFamily: "Inter, sans-serif",
    }}>
      {text}
    </div>
  );
};
```

## Critical Rules (From Official Skills)

These are the non-negotiable rules from the official Remotion skills:

1. **Frame-driven animation ONLY** — All animation via `useCurrentFrame()` + `interpolate()` or `spring()`. CSS transitions, CSS animations, Tailwind `animate-*` classes are ALL FORBIDDEN.
2. **Always use `staticFile()`** — Never use raw paths for public/ folder assets.
3. **Always premount Sequences** — `<Sequence premountFor={1 * fps}>` on heavy content.
4. **Always clamp interpolation** — `extrapolateRight: "clamp"` on every `interpolate()` call.
5. **Use `type` not `interface`** — For component props, ensures `defaultProps` type safety.
6. **String slicing for typewriter** — Never use per-character opacity.
7. **Captions in JSON** — Use `Caption` type from `@remotion/captions`, not raw SRT strings.
8. **useCurrentFrame in 3D** — Never use `useFrame()` from React Three Fiber.

## Tips for Solana Videos

1. **Show real data** — Fetch live TVL, transaction counts, or token prices using `@solana/web3.js` in your compositions
2. **Record your terminal** — Screen recordings of `anchor test` passing or `solana deploy` succeeding are powerful
3. **Use Solana Explorer** — Link to your program on explorer.solana.com for credibility
4. **QR codes** — Use a QR code library (`qrcode` npm package) to embed your program ID or website URL in the CTA frame
5. **Consistent branding** — Solana purple `#9945FF` + green `#14F195` on black `#000` is the standard palette
6. **Keep it short** — 15-30s for social, 30-60s for Twitter, 60-90s for landing page, 1-3min for demos
7. **Captions always** — 85% of social video is watched muted. Add text overlays or use TikTok-style captions.
8. **Sound effects** — Use `@remotion/sfx` for whoosh on transitions, ding on metric reveals
9. **Premount** — Always premount heavy sequences to avoid blank frames during rendering
10. **Parametrize** — Use Zod schemas so the same template works for different projects

## Quality References

For professional-grade output, also read:
- [professional-quality-guide.md](professional-quality-guide.md) — Anti-AI patterns, Disney principles, consistent animation vocabulary, typography rules, organic motion
- [cinematic-techniques.md](cinematic-techniques.md) — Light leaks, noise visualization, audio-reactive visuals, color grading, Whisper captions, 4K rendering
- [video-storytelling.md](video-storytelling.md) — 6 narrative frameworks with script templates
