---
name: marketing-video
description: Create marketing videos for Solana projects using Remotion (code-driven) and Renoise (AI-generated). Use when a user says "marketing video", "product video", "promo video", "deck review", "video pitch", "create a video", or "Remotion project".
---

## Preamble (run first)

```bash
_TEL_TIER=$(cat ~/.superstack/config.json 2>/dev/null | grep -o '"telemetryTier":"[^"]*"' | head -1 | cut -d'"' -f4 || echo "anonymous")
_TEL_TIER="${_TEL_TIER:-anonymous}"
_CONVEX_URL=$(cat ~/.superstack/config.json 2>/dev/null | grep -o '"convexUrl":"[^"]*"' | head -1 | cut -d'"'  -f4 || echo "")
_TEL_PROMPTED=$([ -f ~/.superstack/.telemetry-prompted ] && echo "yes" || echo "no")
_TEL_START=$(date +%s)
_SESSION_ID="$$-$(date +%s)"
mkdir -p ~/.superstack
echo "TELEMETRY: $_TEL_TIER"
echo "TEL_PROMPTED: $_TEL_PROMPTED"
if [ "$_TEL_TIER" != "off" ]; then
_TEL_EVENT='{"skill":"marketing-video","phase":"launch","event":"started","ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}' 
echo "$_TEL_EVENT" >> ~/.superstack/telemetry.jsonl 2>/dev/null || true
[ -n "$_CONVEX_URL" ] && curl -s -X POST "$_CONVEX_URL/api/mutation" -H "Content-Type: application/json" -d '{"path":"telemetry:track","args":{"skill":"marketing-video","phase":"launch","status":"success","version":"0.2.0","platform":"'$(uname -s)-$(uname -m)'","timestamp":'$(date +%s)000'}}' >/dev/null 2>&1 &
fi
```

If `TEL_PROMPTED` is `no`: Before starting the skill workflow, ask the user about telemetry.
Use AskUserQuestion:

> Help superstack get better! We track which skills get used and how long they take —
> no code, no file paths, no PII. Change anytime in `~/.superstack/config.json`.

Options:
- A) Sure, help superstack improve (anonymous)
- B) No thanks

If A: run this bash:
```bash
echo '{"telemetryTier":"anonymous"}' > ~/.superstack/config.json
_TEL_TIER="anonymous"
touch ~/.superstack/.telemetry-prompted
```

If B: run this bash:
```bash
echo '{"telemetryTier":"off"}' > ~/.superstack/config.json
_TEL_TIER="off"
touch ~/.superstack/.telemetry-prompted
```

This only happens once. If `TEL_PROMPTED` is `yes`, skip this entirely and proceed to the skill workflow.

> **Wrong skill?** See [SKILL_ROUTER.md](../../SKILL_ROUTER.md) for all available skills.

# Marketing Video — Remotion + Renoise

Create marketing videos for your Solana project using two complementary approaches:
- **Remotion** (code-driven): Programmatic React videos — full control, reproducible, version-controlled. Uses patterns from the [official Remotion skills repo](https://github.com/remotion-dev/skills).
- **Renoise** (AI-generated): AI video generation — fast, creative, no code needed

## When to Use

- `/marketing-video` — Full video production workflow
- `/deck-review` — Convert pitch deck into video format
- "Create a marketing video for my Solana project"
- "Make a product demo video"
- "Turn my pitch deck into a video"
- "Create a social media promo"
- "Make a TikTok for my dApp"

## Workflow

### Step 1: Creative Brief (Interview)

Don't skip this. Ask the user these questions to craft the right video:

**Round 1 — The Story:**
1. What does your project do in one sentence?
2. Who is the target viewer? (developers, traders, normies, VCs, hackathon judges)
3. What's the ONE thing the viewer should remember after watching?

**Round 2 — The Format:**
4. Where will this video live? (Twitter, TikTok, YouTube, hackathon demo, landing page, pitch meeting)
5. Code-driven (Remotion) or AI-generated (Renoise)? See decision guide below.
6. Do you have screenshots, screen recordings, or product footage ready?

**Round 3 — The Hook:**
7. What's the most impressive thing your product does? (This becomes the hook)
8. Do you have a metric that would make someone stop scrolling? (e.g., "400ms settlement", "$2M TVL", "10K users")

### Step 2: Choose Approach

**Remotion (code-driven)** — Best for:
- Product demos with real UI screenshots/recordings
- Feature walkthroughs with animated text and data
- Consistent brand videos (reusable, version-controlled templates)
- Videos with live on-chain data (TVL, tx counts, token prices)
- Social media cuts that need multiple format outputs
- Teams that want to iterate on video like code (PR reviews, CI/CD)

**Renoise (AI-generated)** — Best for:
- Quick promo videos from a text description
- Creative/artistic content (brand films, dramatic product reveals)
- When you don't want to write code
- Rapid iteration on visual concepts
- Character-driven content, animated sequences
- TikTok-style e-commerce content

**Decision shortcut:**
```
Need pixel-perfect control or live data? → Remotion
Need it in 10 minutes with no code? → Renoise
Need both? → Renoise for creative cuts + Remotion for product demos
```

### Step 3: Select Video Storytelling Framework

Read [references/video-storytelling.md](references/video-storytelling.md) for full details. Choose based on platform:

| Framework | Best For | Structure |
|-----------|----------|-----------|
| **Hook-Proof-CTA** | Twitter, TikTok (15-30s) | Shocking metric → Demo proof → "Try it" |
| **Problem-Demo-Result** | Product demos (30-90s) | Pain point → Your product solving it → Outcome |
| **Before/After** | Landing pages (30-60s) | Current way (painful) → Your way (smooth) |
| **Speedrun** | Hackathon demos (1-3min) | "Watch me build X in Y seconds" narrative |
| **Testimonial Sandwich** | YouTube, longer content | User quote → Product demo → User quote |
| **Data Story** | DeFi/infra products | Animated metrics telling a growth story |

### Step 4a: Remotion Workflow

Read [references/remotion-quickstart.md](references/remotion-quickstart.md) for the full technical reference based on the [official Remotion skills repo](https://github.com/remotion-dev/skills) (30 rule files covering animations, transitions, text, charts, audio, 3D, captions, and more).

**1. Scaffold:**
```bash
# If no Remotion project exists:
npx create-video@latest marketing-video
cd marketing-video && npm install
```

**2. Create compositions** based on the video type:

| Composition | Use Case | Dimensions | Duration |
|------------|----------|------------|----------|
| `ProductDemo.tsx` | Full product walkthrough | 1920x1080 | 30-90s |
| `SocialClip.tsx` | TikTok/Reels vertical | 1080x1920 | 15-60s |
| `TwitterClip.tsx` | Twitter/X landscape | 1920x1080 | 15-30s |
| `PitchVideo.tsx` | Pitch deck as video | 1920x1080 | 1-3min |
| `SquareClip.tsx` | Instagram feed | 1080x1080 | 15-30s |

**3. Structure each composition using Sequences:**

For a 30s product demo (900 frames @ 30fps):
```
Scene 1: Hook — metric or bold claim (0-90 frames, 3s)
Scene 2: Problem — the pain point (90-240, 5s)
Scene 3: Demo — product in action (240-660, 14s)
Scene 4: Proof — metrics/social proof (660-810, 5s)
Scene 5: CTA — try it now (810-900, 3s)
```

**4. Apply advanced techniques** from the Remotion skills reference:

- **Animations:** All animation via `useCurrentFrame()` + `interpolate()` or `spring()`. NEVER use CSS transitions or Tailwind `animate-*` classes.
- **Transitions:** Use `<TransitionSeries>` with `fade()`, `slide()`, `wipe()`, `clockWipe()` for scene changes
- **Spring configs:** Smooth `{damping:200}`, Bouncy `{damping:8}`, Snappy `{damping:20, stiffness:200}`, Heavy `{damping:15, stiffness:80, mass:2}`
- **Text animations:** Typewriter effect for code/terminal output, word-highlight for key phrases
- **Charts:** Animated bar charts with staggered spring entrance, pie charts with stroke-dashoffset, line charts with `evolvePath`
- **Sound effects:** Built-in SFX from `@remotion/sfx`: whoosh, whip, ding, switch, shutter
- **Captions:** TikTok-style captions with `createTikTokStyleCaptions()` and per-word highlighting
- **Voiceover:** ElevenLabs TTS integration with `calculateMetadata` for dynamic duration
- **Premounting:** Always use `<Sequence premountFor={1 * fps}>` to preload content

**5. Render:**
```bash
npx remotion studio          # Preview in browser
npx remotion render ProductDemo out/product-demo.mp4
npx remotion render SocialClip out/social-clip.mp4 --codec h264
npx remotion render TwitterClip out/twitter-clip.mp4
```

### Step 4b: Renoise Workflow

Use the installed Renoise skills for AI-generated content:

1. **Storyboard:** Write a shot-by-shot description using the chosen storytelling framework
2. **Visual analysis (optional):** Use `/renoise:gemini-gen` to analyze product screenshots and extract visual details for prompt writing
3. **Generate:** Use `/renoise:director` — the single entry point for ALL video creation
   - Product ads, dramatic reveals, brand films, animated content
   - Multi-clip short films, TikTok e-commerce content
   - Specify style, mood, pacing, and Solana brand colors
4. **Iterate:** Use `/renoise:renoise-gen` for specific generations
   - Text-to-video, image-to-video, video-to-video
   - Product design sheets (multi-angle views)
5. **Download:** Use `/renoise:video-download` to save results

### Step 5: Platform Optimization

| Platform | Format | Duration | Hook Window | Notes |
|----------|--------|----------|-------------|-------|
| **Twitter/X** | 16:9 or 1:1 | 15-60s | First 1.5s | Autoplay muted — text must carry without audio. Metrics in first 3s. |
| **TikTok** | 9:16 | 15-60s | First 1s | Vertical, fast cuts every 2-3s. Text overlays mandatory. Trending audio helps. |
| **YouTube** | 16:9 | 1-5min | First 5s | More detail allowed. Chapter markers for longer videos. Thumbnail is 50% of clicks. |
| **YouTube Shorts** | 9:16 | 15-60s | First 1s | Same as TikTok but slightly more polished audience. |
| **Instagram Reels** | 9:16 | 15-90s | First 1s | Visual quality matters more than TikTok. Clean aesthetic. |
| **Instagram Feed** | 1:1 | 15-60s | First 2s | Square format. Must look good as a still (first frame = thumbnail). |
| **Hackathon demo** | 16:9 | 1-3min | First 10s | Focus on functionality. Show code + product. End with live demo link. |
| **Landing page** | 16:9 | 30-90s | Immediate | Autoplay, muted by default. Must work without sound. Loop-friendly. |
| **Pitch meeting** | 16:9 | 1-2min | First 5s | Clean, professional. No memes. Real data. Speaking notes separate. |

### Step 6: Platform-Specific Viral Mechanics

**Twitter/X:**
- Thread format: teaser video (15s) + link to full demo
- Quote-tweet hook: "POV: You just shipped your first Solana dApp"
- Engagement bait: "Can you spot what makes this different from [competitor]?"
- Tag @solana, @superaboringclub, relevant protocols

**TikTok:**
- Pattern interrupt in first 0.5s (unexpected visual, loud text, or surprising metric)
- "POV" or "Day in the life" framing for dev content
- Duet/stitch-friendly: leave space for reactions
- Text-to-speech narration over screen recording

**YouTube:**
- Thumbnail: high contrast, 3-4 words max, face if possible
- First 5s must state what the viewer will learn/see
- End screen with subscribe + related video links
- Description: timestamps, links, keywords

## Solana Video Best Practices

### Branding
- **Primary palette:** Purple `#9945FF`, Green `#14F195`, Black `#000000`
- **Extended palette:** Dark purple `#7B3FE4`, Light green `#19FB9B`, Dark gray `#19161C`
- **Typography:** Inter (primary), JetBrains Mono (code), SF Pro (system fallback)
- **Logo:** Download from solana.com/branding. Always use on dark background.

### Content That Performs
- **Show real data** — Fetch live TVL, transaction counts, or token prices using `@solana/web3.js` in Remotion compositions
- **Terminal recordings** — Screen recordings of `anchor test` passing or `solana deploy` succeeding are powerful for dev audiences
- **Explorer links** — Link to your program on explorer.solana.com for credibility
- **QR codes** — Embed your program ID or product URL in the CTA frame
- **Speed demos** — Show transaction confirmation time (<400ms on Solana) as a visual counter
- **Before/after comparisons** — Split screen: old way (slow, expensive) vs your way (fast, cheap)
- **Live on-chain data** — Pull real metrics into Remotion compositions for authenticity

### What NOT to Do
- Don't use stock footage of "blockchain" or "crypto" imagery (generic node networks, etc.)
- Don't make it longer than needed — 30s for social, 90s for landing page, 3min max for demos
- Don't forget captions — 85% of social video is watched without sound
- Don't use generic music — either use Solana-community tracks or no music
- Don't show just slides — even for pitch videos, animate and show product

## Output Deliverables

For every video project, deliver:
1. **Video files** in `out/` directory (MP4, platform-specific formats)
2. **Source code** (Remotion project) for future edits and updates
3. **Platform-specific cuts** — landscape (16:9), portrait (9:16), square (1:1)
4. **Thumbnail images** for each platform (1280x720 for YouTube, 1080x1080 for Instagram)
5. **Caption file** (.srt) for accessibility
6. **Post copy** — suggested tweet/caption text for each platform

## Resources

### references/
- [references/remotion-quickstart.md](references/remotion-quickstart.md) — Full technical reference based on [remotion-dev/skills](https://github.com/remotion-dev/skills) (30 rule modules)
- [references/video-storytelling.md](references/video-storytelling.md) — 6 video storytelling frameworks with script templates
- [references/remotion-advanced.md](references/remotion-advanced.md) — Advanced Remotion patterns: transitions, 3D, audio visualization, charts, captions

### Cross-skill resources
- Output from `create-pitch-deck` skill → convert pitch deck to video
- `.superstack/idea-context.md` — project concept, target audience, value proposition
- `.superstack/build-context.md` — tech stack, features built, screenshots

## Quick Start

```bash
# Remotion (code-driven video):
npx create-video@latest marketing-video
cd marketing-video && npm install
npx remotion studio  # Preview in browser
npx remotion render ProductDemo out/product-demo.mp4

# Renoise (AI-generated video):
# Use /renoise:director — single entry point for all video creation
# Use /renoise:renoise-gen for specific text-to-video or image-to-video tasks
# Use /renoise:gemini-gen to analyze product visuals for better prompts
```

## Framework Credits

This skill incorporates patterns and best practices from:
- **[remotion-dev/skills](https://github.com/remotion-dev/skills)** — Official Remotion agent skill with 30 rule modules covering animations, transitions, text, charts, audio, 3D, captions, and more
- **Remotion** ([remotion.dev](https://remotion.dev)) — Programmatic video framework for React
- **Renoise** — AI video generation platform
- **Hook-Proof-CTA** framework — Social media video structure
- Platform-specific best practices from Twitter, TikTok, YouTube creator guidelines

## Decision Points

- **Remotion vs Renoise?** Remotion for reproducible, data-driven, pixel-perfect videos. Renoise for creative/artistic content and rapid iteration. Use both for a full content suite.
- **Which format first?** Start with the platform where your audience lives. Usually Twitter (16:9, 30s) for crypto projects.
- **Storytelling framework?** Hook-Proof-CTA for social, Problem-Demo-Result for product demos, Speedrun for hackathons.
- **Captions?** Always yes. 85% of social video is watched muted.
- **Music?** Optional for social (most watch muted). Recommended for landing pages and pitch videos.

## Telemetry (run last)

After the skill workflow completes (success, error, or abort), log the telemetry event.
Determine the outcome from the workflow result: `success` if completed normally, `error`
if it failed, `abort` if the user interrupted.

Run this bash:

```bash
_TEL_END=$(date +%s)
_TEL_DUR=$(( _TEL_END - _TEL_START ))
if [ "$_TEL_TIER" != "off" ]; then
echo '{"skill":"marketing-video","phase":"launch","event":"completed","outcome":"OUTCOME","duration_s":"'"$_TEL_DUR"'","session":"'"$_SESSION_ID"'","ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","platform":"'$(uname -s)-$(uname -m)'"}' >> ~/.superstack/telemetry.jsonl 2>/dev/null || true
fi
```

Replace `OUTCOME` with success/error/abort based on the workflow result.
