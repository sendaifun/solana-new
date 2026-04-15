---
name: video-craft
description: Frame-level visual composition and product demo presentation for Remotion videos. Use when the user says "video looks generic", "make video frames look better", "video frame design", "device frame", "product demo video craft", "video CTA", "end card", "video composition", "video craft", "screenshot in video", "frame quality", or when reviewing Remotion compositions for visual quality. Sits on top of marketing-video — adds the visual design layer for each frame. Does NOT claim "create a video" or "marketing video" — those route to marketing-video.
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
_TEL_EVENT='{"skill":"video-craft","phase":"launch","event":"started","ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}'
echo "$_TEL_EVENT" >> ~/.superstack/telemetry.jsonl 2>/dev/null || true
_CONVEX_URL=$(cat ~/.superstack/config.json 2>/dev/null | grep -o '"convexUrl":"[^"]*"' | head -1 | cut -d'"' -f4 || echo "")
[ -n "$_CONVEX_URL" ] && curl -s -X POST "$_CONVEX_URL/api/mutation" -H "Content-Type: application/json" -d '{"path":"telemetry:track","args":{"skill":"video-craft","phase":"launch","status":"success","version":"0.2.0","platform":"'$(uname -s)-$(uname -m)'","timestamp":'$(date +%s)000'}}' >/dev/null 2>&1 &
true
fi
```

If `TEL_PROMPTED` is `no`: Before starting the skill workflow, ask the user about telemetry. Options: A) Sure (anonymous) B) No thanks. This only happens once.

> **Wrong skill?** See [SKILL_ROUTER.md](../../SKILL_ROUTER.md) for all available skills.

# Video Craft

Frame-level visual composition and product demo presentation for Remotion videos. This skill makes each frame of a video look intentionally designed, not just correctly animated.

`marketing-video` handles the production pipeline (interview, storytelling, animation mechanics, rendering). **This skill handles how each static frame looks** — composition, device framing, backgrounds, effect choices, and end-card design.

## Authority Model

- `marketing-video` → production pipeline, animation mechanics, baseline quality (type minimums, safe zones, spring physics)
- `design-taste` → aesthetic direction. This skill CONSUMES it, does not redefine it.
- **This skill** → frame composition for time-bounded viewing, product demo presentation, end-card design, effect families

**Inherits (does NOT restate):** type minimums, mobile safe zones, text readability, spring defaults from `marketing-video`. Color restraint, asymmetry, whitespace from `design-taste`.

## When to Fire

- Reviewing Remotion compositions for visual quality
- Building product demo videos with screenshots
- Designing end cards / CTA frames
- User says "the video frames look generic" or "make this look more polished"
- `marketing-video` invokes this skill during creative direction or build phases

Do NOT fire on "create a video" or "marketing video" — those route to `marketing-video`.

## Workflow

1. Check `design-taste` for aesthetic direction (or ask user to pick one)
2. Identify which reference is relevant:
   - Composing video frames or end cards → [references/frame-composition.md](references/frame-composition.md)
   - Building product demo scenes → [references/product-demo-patterns.md](references/product-demo-patterns.md)
3. Produce a **frame brief** per scene
4. Run preflight checklist before rendering

## Frame Brief (per scene)

```
Scene: [name]
Duration: [seconds / frames]
Aspect: [16:9 / 9:16 / 1:1]
Focal point: [what the eye hits first]
Archetype: [hero / product / split / data / comparison / end-card]
Device: [laptop / phone / browser / none]
Assets needed: [screenshot path, logo, icon names]
Background: [radial gradient + noise / screenshot blur / mesh / solid]
Effect family: [glow / kinetic / liquid / audio-lock / depth / none]
Animation: [entrance spring config, hold frames, exit]
```

## Preflight Checklist

- [ ] Every frame has one clear focal point
- [ ] Screenshots are in device frames, not floating raw
- [ ] Backgrounds have depth (gradient + noise or vignette), not flat solid
- [ ] Max 8 words per text block on screen
- [ ] Hold time >= `(word_count x 0.3) + 1` seconds per text frame
- [ ] End card has minimum 3 seconds and one action only
- [ ] Effect families limited to 1-2 per video
- [ ] Aesthetic direction chosen before any frame work

## Resources

### references/
- [references/frame-composition.md](references/frame-composition.md) — Frame archetypes (16:9 and 9:16), time-bounded readability, background depth, effect families, end-card archetypes (clean/metric/action/loop)
- [references/product-demo-patterns.md](references/product-demo-patterns.md) — Remotion-ready: device frames (laptop/phone/browser), cursor choreography, zoom recipes, screenshot prep, annotation patterns

### Cross-skill references
- `marketing-video` — production pipeline, animation mechanics, baseline quality rules
- `design-taste` — aesthetic direction consumed before frame work
- `number-formatting` — for any metrics displayed in frames

## Telemetry (run last)

```bash
_TEL_END=$(date +%s)
_TEL_DUR=$(( _TEL_END - ${_TEL_START:-$_TEL_END} ))
_TEL_TIER=$(cat ~/.superstack/config.json 2>/dev/null | grep -o '"telemetryTier": *"[^"]*"' | head -1 | sed 's/.*"telemetryTier": *"//;s/"$//' || echo "anonymous")
if [ "$_TEL_TIER" != "off" ]; then
echo '{"skill":"video-craft","phase":"launch","event":"completed","outcome":"OUTCOME","duration_s":"'"$_TEL_DUR"'","session":"'"$_SESSION_ID"'","ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","platform":"'$(uname -s)-$(uname -m)'"}' >> ~/.superstack/telemetry.jsonl 2>/dev/null || true
true
fi
```

Replace `OUTCOME` with success/error/abort based on the workflow result.
