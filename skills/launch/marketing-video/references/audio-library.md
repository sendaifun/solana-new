# Audio & Music Library Reference

Audio makes or breaks a video. A silent Remotion render feels sterile. A badly-chosen track makes it feel like a stock template. This guide covers: free music sources, SFX layering, mood-to-track matching, and Remotion audio integration.

---

## Royalty-Free Music Sources

### Tier 1 — Best for Crypto/Tech Content (Free)

| Source | URL | Vibe | License | Notes |
|--------|-----|------|---------|-------|
| **Pixabay Music** | pixabay.com/music | Electronic, lo-fi, cinematic | Free commercial use, no attribution | Huge library. Search: "electronic minimal", "tech corporate", "dark cinematic" |
| **Uppbeat** | uppbeat.io | Modern, upbeat, tech | Free with attribution (3/mo) | Curated playlists for "startup", "technology", "innovation". Paid removes attribution. |
| **Mixkit** | mixkit.co/free-stock-music | Clean, professional | Free commercial use | Smaller library but high quality. Good "corporate tech" tracks. |
| **Bensound** | bensound.com | Lo-fi, ambient, cinematic | Free with attribution | "Evolution" and "Creative Minds" are crypto-community favorites |
| **Free Music Archive** | freemusicarchive.org | Everything | CC licenses (check each) | Large library. Filter by license. Good for unique/unusual sounds. |

### Tier 2 — Premium (Paid, Better Quality)

| Source | URL | Cost | Why It's Better |
|--------|-----|------|-----------------|
| **Epidemic Sound** | epidemicsound.com | $15/mo | Best overall library. Search "tech dark" or "electronic minimal". No claims on YouTube. |
| **Artlist** | artlist.io | $17/mo | Universal license. Strong cinematic and electronic catalog. |
| **Soundstripe** | soundstripe.com | $15/mo | Good for social content. Stems available for mixing. |

### Mood → Search Terms

| Video Vibe | Search Terms | Example Use |
|------------|-------------|-------------|
| **Confident/Bold** | "electronic corporate", "tech innovation", "bold startup" | Product demo, landing page hero |
| **Fast/Urgent** | "electronic fast", "drum and bass light", "energetic tech" | TikTok clips, speedrun demos |
| **Minimal/Clean** | "ambient minimal", "lo-fi electronic", "soft technology" | Explainer, pitch deck video |
| **Cinematic/Epic** | "cinematic dark", "orchestral tech", "epic trailer" | Brand film, dramatic reveal |
| **Playful/Fun** | "upbeat electronic", "happy tech", "casual game" | Social clips, meme-adjacent content |
| **Dark/Mysterious** | "dark ambient", "cyber noir", "glitch electronic" | DeFi protocol reveal, security product |

---

## Built-In Sound Effects (@remotion/sfx)

Zero-dependency SFX that ship with Remotion. No external files needed:

```tsx
import { Audio, Sequence } from "remotion";
import {
  getWhoosh, getWhip, getDing, getSwitch,
  getShutter, getMouseClick, getPageTurn,
  getBruh, getVineBoom, getWindowsXpError,
} from "@remotion/sfx";
```

### SFX Placement Guide

| SFX | Function | When to Use |
|-----|----------|-------------|
| **Whoosh** | `getWhoosh()` | Scene transitions, slide/wipe animations |
| **Whip** | `getWhip()` | Fast cuts, snap transitions |
| **Ding** | `getDing()` | Metric reveals, achievement moments, checkmarks |
| **Switch** | `getSwitch()` | Toggle, button press, state change |
| **Shutter** | `getShutter()` | Screenshot capture moment |
| **Mouse Click** | `getMouseClick()` | UI interaction demo |
| **Page Turn** | `getPageTurn()` | Slide transitions, step progression |

### SFX Layering Pattern

```tsx
// Layer SFX at the exact frame of each event
<Sequence from={0} durationInFrames={30}>
  <Audio src={getWhoosh()} volume={0.4} />  {/* Scene entrance */}
</Sequence>

<Sequence from={90} durationInFrames={30}>
  <Audio src={getDing()} volume={0.6} />    {/* Metric reveal */}
</Sequence>

<Sequence from={180} durationInFrames={30}>
  <Audio src={getSwitch()} volume={0.3} />  {/* Step progression */}
</Sequence>

<Sequence from={270} durationInFrames={30}>
  <Audio src={getWhoosh()} volume={0.5} />  {/* Transition to CTA */}
</Sequence>
```

### Volume Guidelines

- **Background music:** 0.15-0.3 (should be felt, not heard)
- **SFX during music:** 0.4-0.6 (punches through the mix)
- **SFX without music:** 0.3-0.5 (don't blow out speakers)
- **Voiceover:** 0.8-1.0 (dominant, music ducks to 0.1-0.15)
- **Never exceed 1.0** — causes clipping distortion

---

## Music Integration in Remotion

### Background Music with Fade In/Out

```tsx
const BackgroundMusic: React.FC<{ src: string; durationInFrames: number }> = ({
  src, durationInFrames,
}) => {
  const { fps } = useVideoConfig();
  const fadeFrames = Math.round(fps * 1); // 1-second fade

  return (
    <Audio
      src={staticFile(src)}
      volume={(f) => {
        const fadeIn = interpolate(f, [0, fadeFrames], [0, 0.2], {
          extrapolateRight: "clamp",
        });
        const fadeOut = interpolate(
          f,
          [durationInFrames - fadeFrames, durationInFrames],
          [0.2, 0],
          { extrapolateLeft: "clamp" },
        );
        return Math.min(fadeIn, fadeOut);
      }}
    />
  );
};
```

### Volume Ducking (Music Under Voiceover)

When voiceover plays, music automatically lowers:

```tsx
const DuckedMusic: React.FC<{
  musicSrc: string;
  voiceoverStart: number;  // frame
  voiceoverEnd: number;    // frame
  durationInFrames: number;
}> = ({ musicSrc, voiceoverStart, voiceoverEnd, durationInFrames }) => {
  const { fps } = useVideoConfig();
  const duckFrames = Math.round(fps * 0.5); // 0.5s duck transition

  return (
    <Audio
      src={staticFile(musicSrc)}
      volume={(f) => {
        // Base volume with fade in/out
        const fadeIn = interpolate(f, [0, fps], [0, 0.25], { extrapolateRight: "clamp" });
        const fadeOut = interpolate(f, [durationInFrames - fps, durationInFrames], [0.25, 0], {
          extrapolateLeft: "clamp",
        });
        const base = Math.min(fadeIn, fadeOut);

        // Duck during voiceover
        const duck = interpolate(
          f,
          [voiceoverStart - duckFrames, voiceoverStart, voiceoverEnd, voiceoverEnd + duckFrames],
          [1, 0.3, 0.3, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        );

        return base * duck;
      }}
    />
  );
};
```

### Music + SFX + Voiceover Stack

Full audio stack for a production video:

```tsx
const AudioStack: React.FC<{
  musicSrc: string;
  voiceoverSrc?: string;
  voiceoverStart?: number;
  voiceoverEnd?: number;
  durationInFrames: number;
}> = ({ musicSrc, voiceoverSrc, voiceoverStart = 0, voiceoverEnd, durationInFrames }) => {
  return (
    <>
      {/* Layer 1: Background music (lowest priority) */}
      <DuckedMusic
        musicSrc={musicSrc}
        voiceoverStart={voiceoverStart}
        voiceoverEnd={voiceoverEnd || durationInFrames}
        durationInFrames={durationInFrames}
      />

      {/* Layer 2: Voiceover (highest priority) */}
      {voiceoverSrc && (
        <Sequence from={voiceoverStart}>
          <Audio src={staticFile(voiceoverSrc)} volume={0.9} />
        </Sequence>
      )}

      {/* Layer 3: SFX (placed at specific moments) */}
      {/* Add whoosh/ding/switch at transition points */}
    </>
  );
};
```

---

## Audio Decision Tree

```
Does the video have voiceover?
  YES → Music at 0.15-0.2, duck during VO. Add subtle SFX at transitions.
  NO →
    Is it for social (Twitter/TikTok)?
      YES → SFX only (whoosh + ding). Most viewers watch muted anyway.
      NO →
        Is it a landing page / pitch?
          YES → Background music at 0.2-0.3. Must loop cleanly. Add SFX at key moments.
          NO → (hackathon demo)
            → Music at 0.15-0.2. SFX on transitions. Terminal sounds optional.
```

---

## Audio File Guidelines

- **Format:** MP3 for music (smaller), WAV for SFX (no compression artifacts)
- **Sample rate:** 44.1kHz or 48kHz
- **Duration:** Music should be at least 10% longer than the video (for clean fade out)
- **Loop points:** If using looping music, ensure the loop point is seamless
- **Save to:** `public/audio/` directory in Remotion project
- **Reference:** `staticFile("audio/background.mp3")`

---

## Crypto-Specific Audio Tips

- **Avoid generic "corporate" tracks** — they scream "stock template"
- **Electronic/synthetic fits crypto** — the digital aesthetic matches blockchain
- **Bass-heavy works for DeFi** — conveys power and authority
- **Lo-fi works for dev content** — casual, approachable, "building in public" vibe
- **Silence is OK** — for social clips, no music + SFX only can be more impactful than bad music
- **Never use copyrighted music** — especially for hackathon submissions (judges will notice)
- **Test at 0 volume first** — if the video doesn't work muted, the audio won't save it
