# Remotion Quickstart Reference

## Installation
```bash
npx create-video@latest my-video
cd my-video && npm install
```

## Project structure
```
my-video/
  src/
    Root.tsx          # Register all compositions
    MyComposition.tsx # A single video composition
  remotion.config.ts  # Remotion config
  package.json
```

## Key concepts

### Composition
A video component registered with metadata (width, height, fps, duration):
```tsx
import { Composition } from "remotion";
export const RemotionRoot = () => (
  <Composition id="MyVideo" component={MyVideo}
    durationInFrames={150} fps={30} width={1920} height={1080} />
);
```

### Sequence
Time-based sections within a composition:
```tsx
import { Sequence } from "remotion";
<Sequence from={0} durationInFrames={90}>
  <IntroSlide />
</Sequence>
<Sequence from={90} durationInFrames={60}>
  <DemoSlide />
</Sequence>
```

### useCurrentFrame / interpolate
Animation primitives:
```tsx
import { useCurrentFrame, interpolate } from "remotion";
const frame = useCurrentFrame();
const opacity = interpolate(frame, [0, 30], [0, 1]);
```

### Img / Video / Audio
Media components with proper loading:
```tsx
import { Img, staticFile } from "remotion";
<Img src={staticFile("screenshot.png")} />
```

## Rendering
```bash
npx remotion studio          # Preview in browser
npx remotion render MyVideo  # Render to out/MyVideo.mp4
npx remotion render MyVideo --codec h264 --image-format jpeg
```

## Social media formats
```tsx
// Landscape (YouTube, Twitter)
<Composition width={1920} height={1080} fps={30} />

// Portrait (TikTok, Reels)
<Composition width={1080} height={1920} fps={30} />

// Square (Instagram)
<Composition width={1080} height={1080} fps={30} />
```

## Solana Product Demo Template

```tsx
import { AbsoluteFill, Sequence, useCurrentFrame, interpolate, Img, staticFile } from "remotion";

// Solana brand colors
const SOLANA_PURPLE = "#9945FF";
const SOLANA_GREEN = "#14F195";
const SOLANA_BLACK = "#000000";

export const ProductDemo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: SOLANA_BLACK }}>
      {/* Scene 1: Logo + Tagline (0-90 frames = 3s) */}
      <Sequence from={0} durationInFrames={90}>
        <LogoReveal />
      </Sequence>

      {/* Scene 2: Problem Statement (90-240 = 5s) */}
      <Sequence from={90} durationInFrames={150}>
        <ProblemSlide text="Solana agents can't pay each other on-chain" />
      </Sequence>

      {/* Scene 3: Solution Demo / Screenshots (240-690 = 15s) */}
      <Sequence from={240} durationInFrames={450}>
        <DemoSequence />
      </Sequence>

      {/* Scene 4: Metrics / Social Proof (690-840 = 5s) */}
      <Sequence from={690} durationInFrames={150}>
        <MetricsSlide
          metrics={[
            { label: "Transactions", value: "50K+" },
            { label: "Agents Connected", value: "120" },
            { label: "Avg Settlement", value: "<400ms" },
          ]}
        />
      </Sequence>

      {/* Scene 5: CTA (840-930 = 3s) */}
      <Sequence from={840} durationInFrames={90}>
        <CTASlide url="yourproject.com" programId="AbC123..." />
      </Sequence>
    </AbsoluteFill>
  );
};

// Animated text component
const AnimatedText: React.FC<{ text: string; delay?: number }> = ({ text, delay = 0 }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame - delay, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const y = interpolate(frame - delay, [0, 20], [30, 0], { extrapolateRight: "clamp" });

  return (
    <div style={{
      opacity,
      transform: `translateY(${y}px)`,
      color: "white",
      fontSize: 48,
      fontWeight: 700,
      fontFamily: "Inter, sans-serif",
    }}>
      {text}
    </div>
  );
};

// Register all compositions in Root.tsx:
export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="ProductDemo" component={ProductDemo}
      durationInFrames={930} fps={30} width={1920} height={1080} />
    <Composition id="SocialClip" component={SocialClip}
      durationInFrames={450} fps={30} width={1080} height={1920} />
    <Composition id="TwitterClip" component={TwitterClip}
      durationInFrames={300} fps={30} width={1920} height={1080} />
  </>
);
```

## Social Clip Template (Vertical — TikTok/Reels)

```tsx
export const SocialClip: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: SOLANA_BLACK }}>
      {/* Hook in first 3 seconds */}
      <Sequence from={0} durationInFrames={90}>
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
          <AnimatedText text="POV: Your Solana app" delay={0} />
          <AnimatedText text="just got 10x faster ⚡" delay={15} />
        </AbsoluteFill>
      </Sequence>

      {/* Quick demo (3-12s) */}
      <Sequence from={90} durationInFrames={270}>
        <Img src={staticFile("demo-screenshot.png")}
          style={{ width: "100%", height: "100%", objectFit: "contain" }} />
      </Sequence>

      {/* CTA (12-15s) */}
      <Sequence from={360} durationInFrames={90}>
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
          <div style={{ color: SOLANA_GREEN, fontSize: 64, fontWeight: 800 }}>
            Try it now 👇
          </div>
          <div style={{ color: "white", fontSize: 32, marginTop: 20 }}>
            link in bio
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};
```

## Tips for Solana Videos

1. **Show real data** — Fetch live TVL, transaction counts, or token prices using `@solana/web3.js` in your compositions
2. **Record your terminal** — Screen recordings of `anchor test` passing or `solana deploy` succeeding are powerful
3. **Use Solana Explorer** — Link to your program on explorer.solana.com for credibility
4. **QR codes** — Use a QR code library to embed your program ID or website URL in the CTA frame
5. **Consistent branding** — Solana purple `#9945FF` + green `#14F195` on black `#000` is the standard palette
6. **Keep it short** — 30s for Twitter, 15-60s for TikTok, 1-3min max for YouTube
