---
name: marketing-video
description: Create marketing videos for Solana projects using Remotion (code-driven) and Renoise (AI-generated). Use when a user says "marketing video", "product video", "promo video", "deck review", "video pitch", "create a video", or "Remotion project".
---

## Preamble (run first)

```bash
_TEL_TIER=$(cat ~/.superstack/config.json 2>/dev/null | grep -o '"telemetryTier": *"[^"]*"' | head -1 | sed 's/.*"telemetryTier": *"//;s/"$//'  || echo "anonymous")
_TEL_TIER="${_TEL_TIER:-anonymous}"
_TEL_PROMPTED=$([ -f ~/.superstack/.telemetry-prompted ] && echo "yes" || echo "no")
_TEL_START=$(date +%s)
_SESSION_ID="$$-$(date +%s)"
mkdir -p ~/.superstack
echo "TELEMETRY: $_TEL_TIER"
echo "TEL_PROMPTED: $_TEL_PROMPTED"
if [ "$_TEL_TIER" != "off" ]; then
_TEL_EVENT='{"skill":"marketing-video","phase":"launch","event":"started","ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}' 
echo "$_TEL_EVENT" >> ~/.superstack/telemetry.jsonl 2>/dev/null || true
_CONVEX_URL=$(cat ~/.superstack/config.json 2>/dev/null | grep -o '"convexUrl":"[^"]*"' | head -1 | cut -d'"' -f4 || echo "")
[ -n "$_CONVEX_URL" ] && curl -s -X POST "$_CONVEX_URL/api/mutation" -H "Content-Type: application/json" -d '{"path":"telemetry:track","args":{"skill":"marketing-video","phase":"launch","status":"success","version":"0.2.0","platform":"'$(uname -s)-$(uname -m)'","timestamp":'$(date +%s)000'}}' >/dev/null 2>&1 &
true
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
- **Remotion** (code-driven): Programmatic React videos — full control, reproducible, version-controlled. Uses the [official Remotion skills](https://github.com/remotion-dev/skills) (38 rule modules).
- **Renoise** (AI-generated): AI video generation — fast, creative, no code needed

**Goal: Professional quality that doesn't look AI-generated.** Read [references/professional-quality-guide.md](references/professional-quality-guide.md) before starting any Remotion work.

## When to Use

- `/marketing-video` — Full video production workflow
- `/deck-review` — Convert pitch deck into video format
- "Create a marketing video for my Solana project"
- "Make a product demo video"
- "Turn my pitch deck into a video"
- "Create a social media promo"
- "Make a TikTok for my dApp"

## Non-Negotiables

- **Never skip the interview.** Don't guess the product, the audience, or the visual direction. Ask.
- **Never ask about animation technicalities.** The user doesn't care about spring configs or TransitionSeries. Ask about their product, their story, their taste.
- **Stay opinionated.** If the user's idea for a video is weak (too long, wrong audience, no hook), say so plainly and redirect.
- **Visual taste first, code second.** Establish what the video should FEEL like before writing a single line of Remotion.
- **Gather elements proactively.** Ask for screenshots, logos, brand colors. If they don't have them, source SVG icons (Lucide, Heroicons), generate color palettes, and suggest illustration styles.
- **One-stop shop.** This skill handles everything: interview → concept → storyboard → element gathering → scaffold → code → render → platform cuts. The user should not need another tool.

## Workflow

### Step 1: Context Gathering (Before You Ask Anything)

Silently check for existing context. Read these files if they exist — don't ask the user to repeat themselves:

```
.superstack/idea-context.md    → Product concept, audience, value prop
.superstack/build-context.md   → Tech stack, features, deployment status
```

Also check: Does a Remotion project already exist in the working directory? (`remotion.config.ts` or `package.json` with remotion dependency)

**Auto-detect product assets.** Before the interview, scan the project for usable visual material:

```bash
# Screenshots and images
find . -maxdepth 3 -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" -o -name "*.webp" \) ! -path "*/node_modules/*" ! -path "*/.git/*" 2>/dev/null | head -20

# SVG files (logos, icons, illustrations)
find . -maxdepth 3 -type f -name "*.svg" ! -path "*/node_modules/*" ! -path "*/.git/*" 2>/dev/null | head -20

# Video/screen recordings
find . -maxdepth 3 -type f \( -name "*.mp4" -o -name "*.webm" -o -name "*.mov" \) ! -path "*/node_modules/*" ! -path "*/.git/*" 2>/dev/null | head -10

# Brand colors from CSS/Tailwind config
grep -r "primary\|accent\|brand" tailwind.config.* globals.css theme.* 2>/dev/null | head -10

# Package.json for project name/description
cat package.json 2>/dev/null | grep -E '"name"|"description"' | head -5
```

If you find assets, mention them during the interview: "I noticed you have screenshots in `public/` and an SVG logo — I can use those directly."

### Step 2: The Interview (Deep, Product-Focused)

This is a conversation, not a questionnaire. Start with the anchor questions. Pull deeper based on their answers. Do NOT move to production until you can clearly articulate: what the product does, who cares, why it matters, and what the video should make someone feel.

**Round 1 — The Product (mandatory, ask all):**

1. **"Explain your product to me like I'm a potential user, not a developer."**
   Why: Forces them out of technical jargon. The video needs to speak the user's language.

2. **"Who specifically is going to watch this video? Not 'everyone' — give me one person."**
   Why: A video for a DeFi degen is completely different from one for a hackathon judge.
   Follow-up if vague: "Is this person technical? Do they already use crypto? What are they doing when they see your video — scrolling Twitter, browsing a landing page, sitting in a pitch meeting?"

3. **"What's the single thing you want the viewer to DO after watching?"**
   Why: Every frame exists to drive toward this one action. No action = no point.
   Push back if they say "learn about us" — that's not an action. "Sign up", "try the demo", "visit the site", "vote for us" — those are actions.

**Round 2 — The Story (mandatory, ask all):**

4. **"What problem does your product solve? Describe the pain — make me feel it."**
   Why: The best videos start with a problem the viewer already has. No problem = no hook.

5. **"What's the 'aha moment' in your product? The thing that makes people go 'oh wait, that's actually cool.'"**
   Why: This becomes the centerpiece of the video. If they can't name it, probe: "What do users compliment most? What's the demo moment that gets reactions?"

6. **"Do you have a number that would make someone stop scrolling?"**
   Why: Metrics are the most powerful hooks in crypto content. Examples: "$2M TVL", "400ms settlement", "50K transactions", "10x cheaper than Ethereum".
   If they don't have a metric: "What's the most concrete proof your product works? User count? Transaction volume? Speed comparison?"

**Round 3 — The Taste (mandatory, ask all):**

7. **"Show me a video you love — from any brand, any industry. Something that captures the energy you want."**
   Why: This reveals more about desired quality and tone than any multiple-choice question. If they can't name one, offer reference anchors:
   - "Clean and minimal, like an Apple product launch?"
   - "Fast and punchy, like a crypto Twitter banger?"
   - "Technical and nerdy, like a developer conference talk?"
   - "Bold and cinematic, like a movie trailer?"
   - "Playful and meme-y, like a TikTok trend?"

8. **"What vibe should this video have? Pick one: confident, urgent, playful, mysterious, authoritative, rebellious."**
   Why: Vibe determines everything — color palette, animation speed, typography weight, music choice.

9. **"Where will people see this? What platform?"**
   Why: Determines format (16:9 vs 9:16), duration (15s vs 3min), and hook window (1s for TikTok, 5s for YouTube).

**Round 4 — The Assets (mandatory, ask all):**

10. **"Do you have: a logo, brand colors, and a screenshot of your product? Share what you have."**
    Why: Real product footage separates professional from generic. If they have nothing, that's OK — we'll generate visuals.
    - If they have a logo: Get it as SVG if possible, PNG otherwise
    - If they have brand colors: Get hex codes
    - If they have screenshots: Get them in the highest resolution possible
    - If they have NOTHING: "No worries. I'll set up a visual system — we'll use SVG icons, a generated color palette, and animated text to build the video."

11. **"Any specific text that MUST appear? Tagline, URL, metric, hackathon name?"**
    Why: Some text is non-negotiable (sponsor logos, hackathon branding, product URL).

**Round 5 — The Constraint (ask if needed):**

12. **"Is there a deadline? Hackathon submission, launch date, pitch meeting?"**
    Why: If they need it in 2 hours, we're doing a fast Remotion template or Renoise. If they have a week, we can be more ambitious.

13. **"Budget for extras? Voiceover (ElevenLabs), music, stock footage?"**
    Why: Determines whether we use SFX only (free) or add TTS voiceover / licensed music.

### Interview Rules

- **Adapt, don't script.** If the user gives a rich answer to question 1 that covers questions 2-4, skip them. If they're terse, dig deeper.
- **Challenge weak hooks.** If their "scroll-stopping metric" is "we use Solana" — that's not a hook. Push for something specific and surprising.
- **No false praise.** If their video concept is too ambitious for a 15s Twitter clip, say so. If their product doesn't have a clear visual story yet, help them find one.
- **Never ask about animation preferences.** Users don't know what `spring damping` means and shouldn't need to. Ask about FEEL, not technique. You translate taste → technique.
- **3 questions max per message.** Don't dump all 13 questions at once. Conversational rounds.

### Step 3: Creative Direction (You Decide, User Approves)

After the interview, YOU produce the creative direction. Don't ask the user to pick from a menu — present a single confident recommendation they can approve or push back on.

**Output a Creative Brief that includes:**

1. **Video Concept** — One sentence: "A 30-second Twitter clip that opens with your $2M settlement metric, shows a 3-step product demo, and ends with a QR code to your site."

2. **Storytelling Framework** — Pick the best one (read [references/video-storytelling.md](references/video-storytelling.md)):
   | Framework | Best For | Structure |
   |-----------|----------|-----------|
   | **Hook-Proof-CTA** | Twitter, TikTok (15-30s) | Shocking metric → Demo proof → "Try it" |
   | **Problem-Demo-Result** | Product demos (30-90s) | Pain point → Solution demo → Outcome |
   | **Before/After** | Landing pages (30-60s) | Old way (painful) → New way (smooth) |
   | **Speedrun** | Hackathon demos (1-3min) | Full product walkthrough at speed |
   | **Testimonial Sandwich** | YouTube, longer content | User quote → Demo → User quote |
   | **Data Story** | DeFi/infra products | Animated metrics telling growth story |

3. **Visual Direction** — Mood board in words:
   - Color palette (hex codes — derived from their brand or generated)
   - Typography choices (headline font + body font)
   - Animation feel: "smooth and elegant" or "fast and punchy" or "heavy and cinematic"
   - Key visual elements: What appears on screen in each scene

4. **Scene-by-Scene Storyboard** — Written out, frame by frame:
   ```
   Scene 1 (0-3s): HOOK — Large animated metric "$2.1M" springs in on black background.
                    Subtitle fades up: "settled in 30 days. Zero bank accounts."
   Scene 2 (3-8s): PROBLEM — Text reveals line by line: "AI agents can't pay each other
                    without a human co-signer." Red-tinted, desaturated.
   Scene 3 (8-22s): DEMO — Product screenshot slides in from right. Animated arrows point
                     to key features. Step labels appear in sequence.
   Scene 4 (22-27s): PROOF — Three metric cards spring in with stagger: "50K+ txns",
                      "120 agents", "<400ms settlement"
   Scene 5 (27-30s): CTA — "Try it now" with URL and QR code. Light leak transition.
   ```

5. **Visual Elements Needed** — Concrete list:
   - Screenshots to capture / provide
   - SVG icons to use (from Lucide, Heroicons, or custom)
   - Illustrations or diagrams to create
   - Brand assets (logo placement, colors)

6. **Approach Decision** — Remotion or Renoise, with reasoning:
   ```
   Need pixel-perfect control or live data? → Remotion
   Need it in 10 minutes with no code? → Renoise
   Need both? → Renoise for creative cuts + Remotion for product demos
   ```

**Present this to the user for approval.** Wait for their OK or adjustments before building anything.

### Step 4: Element Gathering

Before writing any code, gather all visual elements:

**Brand Assets:**
- Logo (SVG preferred, PNG fallback) → save to `public/`
- Brand colors → define as constants
- Brand fonts → load via `@remotion/google-fonts`

**Product Assets:**
- Screenshots → save to `public/` at 2x resolution minimum
- Screen recordings → save to `public/` as MP4
- If no screenshots exist, help the user capture them or describe scenes with animated text + SVG icons

**SVG Icons (from Lucide React or similar):**
Remotion renders React components — any React icon library works natively:
```tsx
// Install: npm install lucide-react
import { Zap, Shield, Wallet, ArrowRight, ChevronDown } from "lucide-react";

// Use in compositions — animatable via useCurrentFrame()
<Zap size={64} color="#14F195" style={{ opacity, transform: `scale(${scale})` }} />
```

Common icons for Solana videos:
- Speed: `Zap`, `Timer`, `Gauge`
- Security: `Shield`, `Lock`, `ShieldCheck`
- Money: `Wallet`, `DollarSign`, `TrendingUp`, `BarChart3`
- Users: `Users`, `UserPlus`, `Globe`
- Actions: `ArrowRight`, `ExternalLink`, `QrCode`, `Play`
- Tech: `Code`, `Terminal`, `Cpu`, `Network`

**SVG Path Animations (for draw-on effects):**
```bash
npx remotion add @remotion/paths
npx remotion add @remotion/shapes
```
Use `evolvePath()` for line-drawing reveals of logos, charts, diagrams.
Use `@remotion/shapes` for animated geometric primitives (circles, stars, polygons).

**Lottie Animations (for complex vector animations):**
```bash
npx remotion add @remotion/lottie
```
Source from LottieFiles.com — search for: "loading", "success", "rocket", "chart", "crypto"

**Color Palette Generation:**
If the user has no brand colors, generate a professional palette:
- Primary: Pick from their product's existing UI, or default to Solana purple `#9945FF`
- Accent: Complementary color (e.g., `#14F195` for Solana green)
- Background: Dark (`#0a0a0f` to `#12101a` — never pure black)
- Text: White (`#ffffff`) with `rgba(255,255,255,0.7)` for secondary
- Danger/warning: For "before" scenes — desaturated reds `#e94560`

### Step 5: Build (Remotion Workflow)

Read [references/remotion-quickstart.md](references/remotion-quickstart.md) for the full technical reference based on the [official Remotion skills](https://github.com/remotion-dev/skills) (38 rule modules covering animations, transitions, text, charts, audio, 3D, captions, and more).

**0. Install Official Remotion Skills (one-time):**
```bash
npx skills add remotion-dev/skills
```
This installs 38 rule modules to `~/.claude/skills/` — giving Claude the complete Remotion knowledge base for all future sessions. The official skills cover: animations, timing, transitions, light leaks, audio, SFX, captions, voiceover, charts, 3D, fonts, Tailwind, Lottie, maps, and more.

**1. Scaffold:**
```bash
# If no Remotion project exists:
npx create-video@latest marketing-video
cd marketing-video && npm install

# Install key packages for cinematic quality:
npx remotion add @remotion/transitions
npx remotion add @remotion/light-leaks
npx remotion add @remotion/google-fonts
npx remotion add @remotion/noise
npx remotion add @remotion/captions
npx remotion add @remotion/media-utils
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
- **Default spring: `{damping: 200}`** — No bounce. Bounce (`damping: 8`) is a deliberate choice, not a default.
- **Transitions:** Use `<TransitionSeries>` with `fade()`, `slide()`, `wipe()`, `clockWipe()` for scene changes
- **Light leaks:** Use `@remotion/light-leaks` as `<TransitionSeries.Overlay>` for cinematic scene transitions
- **Text animations:** Typewriter (string slicing, never per-character opacity), word-highlight for key phrases
- **Charts:** Animated bar charts with staggered spring entrance, pie charts with stroke-dashoffset, line charts with `evolvePath`
- **Sound effects:** Built-in SFX from `@remotion/sfx`: whoosh, whip, ding, switch, shutter
- **Captions:** TikTok-style captions with `createTikTokStyleCaptions()` and per-word highlighting
- **Voiceover:** ElevenLabs TTS integration with `calculateMetadata` for dynamic duration
- **Noise:** Use `@remotion/noise` for organic floating motion on resting elements (prevents "dead" static look)
- **Color grading:** Use `interpolateColors()` for dynamic background mood shifts across scenes
- **Premounting:** Always use `<Sequence premountFor={1 * fps}>` to preload content
- **Always clamp:** `extrapolateRight: "clamp"` on every `interpolate()` call

**5. Quality gate — before rendering, verify against [references/professional-quality-guide.md](references/professional-quality-guide.md):**
- [ ] Consistent animation vocabulary (max 2-3 techniques, not a different one per scene)
- [ ] Staggered element entrances (10-20 frame gaps, not everything at once)
- [ ] Dwell time on key content (enter, hold, exit — not instant in/out)
- [ ] No linear interpolation without easing (use spring or Easing.inOut)
- [ ] Light leak overlays at key scene transitions
- [ ] Audio integrated (at minimum: SFX on transitions and metric reveals)
- [ ] Mobile safe zones respected for vertical formats (150px top, 170px bottom)
- [ ] Headlines 56px+, body 36px+, nothing under 28px

**6. Render:**
```bash
npx remotion studio          # Preview in browser

# Draft (fast iteration)
npx remotion render ProductDemo out/draft.mp4 --codec h264 --crf 23

# Production quality (final delivery)
npx remotion render ProductDemo out/product-demo.mp4 --codec h264 --crf 18 --color-space bt709
npx remotion render SocialClip out/social-clip.mp4 --codec h264 --crf 18 --color-space bt709
npx remotion render TwitterClip out/twitter-clip.mp4 --codec h264 --crf 18 --color-space bt709

# Multi-core (faster render)
npx remotion render ProductDemo out/fast.mp4 --concurrency 8 --crf 18
```

### Step 5b: Renoise Workflow (Alternative to Remotion)

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

### Step 6: Platform Optimization

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

### Step 7: Platform-Specific Viral Mechanics

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
- [references/scene-templates.md](references/scene-templates.md) — **16 pre-built LEGO-block scenes** + 3 full composition recipes. Mix and match: hooks, problems, demos, metrics, CTAs, testimonials, terminals, logo reveals
- [references/remotion-quickstart.md](references/remotion-quickstart.md) — Full technical reference + official skills setup (38 rule modules)
- [references/remotion-advanced.md](references/remotion-advanced.md) — Advanced patterns: transitions, 3D, charts, noise, color grading, thumbnails, multi-format export
- [references/professional-quality-guide.md](references/professional-quality-guide.md) — **Anti-AI patterns**, Disney principles, consistent animation vocabulary, typography rules, spring physics guide
- [references/cinematic-techniques.md](references/cinematic-techniques.md) — Light leaks, noise, audio-reactive visuals, color grading, Whisper captions, ElevenLabs voiceover, SVG animation, 4K rendering
- [references/audio-library.md](references/audio-library.md) — Royalty-free music sources, SFX layering guide, volume guidelines, mood-to-track matching, Remotion audio integration
- [references/video-storytelling.md](references/video-storytelling.md) — 6 video storytelling frameworks with script templates

### Cross-skill resources
- Output from `create-pitch-deck` skill → convert pitch deck to video
- `.superstack/idea-context.md` — project concept, target audience, value proposition
- `.superstack/build-context.md` — tech stack, features built, screenshots

## Quick Start

```bash
# 1. Install official Remotion skills (one-time):
npx skills add remotion-dev/skills

# 2. Remotion (code-driven video):
npx create-video@latest marketing-video
cd marketing-video && npm install
npx remotion add @remotion/transitions @remotion/light-leaks @remotion/google-fonts @remotion/noise @remotion/captions @remotion/media-utils
npx remotion studio  # Preview in browser
npx remotion render ProductDemo out/product-demo.mp4 --crf 18 --color-space bt709

# 3. Renoise (AI-generated video):
# Use /renoise:director — single entry point for all video creation
# Use /renoise:renoise-gen for specific text-to-video or image-to-video tasks
# Use /renoise:gemini-gen to analyze product visuals for better prompts
```

## Framework Credits

This skill incorporates patterns and best practices from:
- **[remotion-dev/skills](https://github.com/remotion-dev/skills)** — Official Remotion agent skill with 38 rule modules covering animations, transitions, text, charts, audio, 3D, captions, light leaks, noise, and more. Install: `npx skills add remotion-dev/skills`
- **[@remotion/mcp](https://www.remotion.dev/docs/ai/mcp)** — Official Remotion MCP server for documentation lookup (optional, for advanced queries)
- **Remotion** ([remotion.dev](https://remotion.dev)) — Programmatic video framework for React
- **Renoise** — AI video generation platform
- **Disney's 12 Principles of Animation** — Applied to motion graphics for professional quality
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
_TEL_DUR=$(( _TEL_END - ${_TEL_START:-$_TEL_END} ))
_TEL_TIER=$(cat ~/.superstack/config.json 2>/dev/null | grep -o '"telemetryTier": *"[^"]*"' | head -1 | sed 's/.*"telemetryTier": *"//;s/"$//' || echo "anonymous")
if [ "$_TEL_TIER" != "off" ]; then
echo '{"skill":"marketing-video","phase":"launch","event":"completed","outcome":"OUTCOME","duration_s":"'"$_TEL_DUR"'","session":"'"$_SESSION_ID"'","ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","platform":"'$(uname -s)-$(uname -m)'"}' >> ~/.superstack/telemetry.jsonl 2>/dev/null || true
true
fi
```

Replace `OUTCOME` with success/error/abort based on the workflow result.
