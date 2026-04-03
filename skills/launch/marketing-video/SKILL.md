---
name: marketing-video
description: Create marketing videos for Solana projects using Remotion (code-driven) and Renoise (AI-generated). Use when a user says "marketing video", "product video", "promo video", "deck review", "video pitch", "create a video", or "Remotion project".
---

## Preamble (run first)

```bash
_TEL_TIER=$(cat ~/.superstack/config.json 2>/dev/null | grep -o '"telemetryTier":"[^"]*"' | head -1 | cut -d'"' -f4 || echo "off")
_TEL_TIER="${_TEL_TIER:-off}"
_TEL_START=$(date +%s)
_SESSION_ID="$$-$(date +%s)"
mkdir -p ~/.superstack
if [ "$_TEL_TIER" != "off" ]; then
echo '{"skill":"marketing-video","phase":"launch","event":"started","ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}' >> ~/.superstack/telemetry.jsonl 2>/dev/null || true
fi
```

> **Wrong skill?** See [SKILL_ROUTER.md](../../SKILL_ROUTER.md) for all available skills.

# Marketing Video — Remotion + Renoise

Create marketing videos for your Solana project using two complementary approaches:
- **Remotion** (code-driven): Programmatic React videos — full control, reproducible, version-controlled
- **Renoise** (AI-generated): AI video generation — fast, creative, no code needed

## When to use

- `/marketing-video` — Full video production workflow
- `/deck-review` — Convert pitch deck into video format
- "Create a marketing video for my Solana project"
- "Make a product demo video"
- "Turn my pitch deck into a video"
- "Create a social media promo"

## Workflow

### Step 1: Read project context

Check for prior phase outputs:
- `.superstack/idea-context.json` — project concept, target audience, value proposition
- `.superstack/build-context.json` — tech stack, features built, screenshots
- `pitch-deck/` or any presentation files — existing pitch content

If no context exists, ask the user for:
1. What does your project do? (one sentence)
2. Who is your audience?
3. What's the key differentiator?

### Step 2: Choose approach

**Remotion (code-driven)** — Best for:
- Product demos with real UI screenshots
- Feature walkthroughs with animated text
- Consistent brand videos (reusable templates)
- Teams that want version-controlled video assets
- Social media cuts (TikTok, Twitter, YouTube Shorts)

**Renoise (AI-generated)** — Best for:
- Quick promo videos from a text description
- Creative/artistic content
- When you don't want to write code
- Rapid iteration on concepts

### Step 3a: Remotion workflow

1. **Scaffold**: Check if Remotion is installed
   ```bash
   # If no Remotion project exists:
   npx create-video@latest marketing-video
   cd marketing-video && npm install
   ```

2. **Create compositions** for each video type:
   - `ProductDemo.tsx` — Hero shot + feature highlights + CTA
   - `SocialClip.tsx` — 15-30s vertical format for social media
   - `PitchVideo.tsx` — Pitch deck slides as animated video

3. **Structure each composition**:
   ```
   Sequence 1: Logo reveal + tagline (2-3s)
   Sequence 2: Problem statement (3-5s)
   Sequence 3: Solution demo / screenshots (10-15s)
   Sequence 4: Key metrics / social proof (3-5s)
   Sequence 5: CTA + links (3-5s)
   ```

4. **Render**:
   ```bash
   npx remotion render ProductDemo out/product-demo.mp4
   npx remotion render SocialClip out/social-clip.mp4
   ```

5. **Preview during development**:
   ```bash
   npx remotion studio
   ```

### Step 3b: Renoise workflow

Use the installed Renoise skills for AI-generated content:

1. **Storyboard**: Write a shot-by-shot description
2. **Generate**: Use `/renoise:director` to create the video
   - Product ads, drama, brand films, animated content
   - Multi-clip short films
3. **Iterate**: Use `/renoise:renoise-gen` for specific generations
   - Text-to-video, image-to-video, video-to-video
4. **Download**: Use `/renoise:video-download` to save results

### Step 4: Optimize for platform

| Platform | Format | Duration | Notes |
|----------|--------|----------|-------|
| Twitter/X | 16:9 or 1:1 | 30-60s | Hook in first 3s |
| TikTok | 9:16 | 15-60s | Vertical, fast cuts |
| YouTube | 16:9 | 1-3min | More detail allowed |
| Hackathon demo | 16:9 | 3min max | Focus on functionality |
| Landing page | 16:9 | 30-90s | Autoplay, no sound default |

## Remotion best practices for Solana projects

- Use `@solana/web3.js` data in your compositions (live TVL, tx counts, etc.)
- Animate wallet connection flows and transaction confirmations
- Show real program output / explorer links
- Use Solana brand colors: `#9945FF` (purple), `#14F195` (green), `#000000` (black)
- Include your program's public key as a QR code in the CTA

## Output

Deliver:
1. Video files in `out/` directory (MP4, multiple formats)
2. Remotion project source (if code-driven) for future edits
3. Platform-specific cuts (landscape, portrait, square)
4. Thumbnail images for each platform

## Quick Start

```bash
# Remotion (code-driven video):
npx create-video@latest marketing-video
cd marketing-video && npm install
npx remotion studio  # Preview in browser
npx remotion render ProductDemo out/product-demo.mp4

# Renoise (AI-generated video):
# Use /renoise:director skill — it handles storyboarding and generation
# Use /renoise:renoise-gen for specific text-to-video or image-to-video tasks
```

## Decision Points

- **Remotion vs Renoise?** Remotion for reproducible, version-controlled videos (product demos, feature walkthroughs). Renoise for creative/artistic content (brand films, social media ads).
- **Which format?** See the platform table in this skill's workflow section. TikTok: 9:16, 15-60s. Twitter: 16:9, 30-60s. YouTube: 16:9, 1-3min.
- **Solana brand colors:** Purple `#9945FF`, Green `#14F195`, Black `#000000`.

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
