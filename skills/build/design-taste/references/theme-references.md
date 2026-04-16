# Theme References

6 reference styles classified by design approach, not by company. Each represents a distinct visual strategy. **These are observational approximations** — use them to understand the feel, then apply through your own brand tokens.

For actual palette generation and token application, use `brand-design`.

## Three-Tier Token Architecture

Professional design systems organize tokens in three tiers:

```
Tier 1 (Brand):     --color-brand-primary: oklch(0.55 0.15 270)
Tier 2 (Semantic):   --color-action-bg: var(--color-brand-primary)
Tier 3 (Component):  --button-bg: var(--color-action-bg)
```

Theme switching swaps ONLY Tier 1 values. Tiers 2-3 cascade automatically. One set of brand seeds generates the entire token system.

---

## 1. Warm Monochrome

**Style:** Near-monochrome dark UI with warm gray tones and a single sparse accent color. Extreme color restraint.

**When to use:** Polished SaaS tools, project management, developer platforms, internal tools with dark-mode-first identity.

**The feel:** Warm, restrained, quietly confident. The interface is almost monochrome — accent color appears only for active states and selection. Secondary elements recede so content commands attention.

**Direction:**
- **Palette:** Warm grays (not cool/blue grays), single sparse accent, near-black backgrounds (#1C1C1E range)
- **Typography:** System sans-serif, tight letter-spacing on headings (-0.02em), medium weight for labels
- **Spacing:** Comfortable default (12-16px padding), compact in navigation
- **Borders:** Rounded edges, reduced contrast from background — barely visible
- **Shadows:** Minimal. Backdrop-blur for depth on overlays instead of drop shadows
- **Motion:** Crisp, fast. Transitions under 200ms. No bounce.
- **Key principle:** "Don't compete for attention you haven't earned." Navigation deliberately dimmed to foreground content.

**What makes it feel polished:** If most people don't notice what changed, that's a good sign. The design shifts from "monochrome + few bold colors" to "monochrome + even fewer bold colors."

**Examples in the wild:** Linear, Notion dark mode, Raycast

---

## 2. Stark Minimal

**Style:** Maximum restraint. Pure black-and-white with one optional accent. The narrowest palette that still functions.

**When to use:** Developer tools, infrastructure products, CLIs with web UI. Polished through absolute reduction.

**The feel:** Stark, precise, monumental. One accent color that's almost optional. Everything earns its pixel or gets removed.

**Direction:**
- **Palette:** Near-black or pure black + white + neutral gray ramp + one accent for links/primary actions ONLY. Most products should use near-black (#0A0A0A) — only use #000000 if `brand.md` explicitly calls for it.
- **Typography:** Custom or system mono + sans. Scale: 12/14/16/18/24/32/48/64px. Tight letter-spacing on display (-0.04em).
- **Spacing:** 8px base grid. Aggressive whitespace between sections (96-128px).
- **Borders:** `rgba(255,255,255,0.08)` — barely there
- **Shadows:** None on marketing. Minimal on UI. Elevation through background shade, not shadow.
- **Motion:** Minimal. Functional transitions only. No decorative animation.
- **Key principle:** "Precision through consistency applied to an absurdly narrow palette." What's excluded defines the brand: no gradients, no illustrations, no decorative color.

**What makes it feel precise:** The palette is so narrow that every element's role is immediately clear. There's nowhere to hide — every pixel is intentional.

**Examples in the wild:** Vercel, Resend, Cal.com

---

## 3. Gradient Trust

**Style:** Warm neutrals for UI with signature gradients reserved for brand moments. Trust and approachability alongside professionalism.

**When to use:** Fintech, payments, trust-critical products where warmth matters. Products that handle money and need to feel safe.

**The feel:** Warm, approachable, meticulously refined. Gradients are the brand signature, but the UI itself is restrained. "Restrained with no irritating frills, yet fresh and playful."

**Direction:**
- **Palette:** Warm neutrals for UI surfaces. Signature gradients reserved for hero/marketing/brand moments only. Accessible colors built in perceptual color space (CIELAB/OKLCH) for uniformity.
- **Typography:** Clean sans-serif, well-spaced. Not as tight as monochrome or stark styles.
- **Spacing:** Generous. Nothing cramped. Every element has breathing room.
- **Borders:** Subtle, warm-toned. Not harsh.
- **Shadows:** Soft, warm-toned. Slightly higher opacity than stark styles but still restrained.
- **Motion:** Purposeful. Randomized delays on micro-interactions for natural feel. Animations demonstrate functionality, not decoration.
- **Key principle:** Gradient mastery. The gradient is THE brand element — used strategically, never scattered. 20x refinement effort on every interaction.

**What makes it feel refined:** Every interaction has been tested, refined, and tested again. Warmth comes from deliberate softness in neutrals and spacing, not from adding color.

**Accessibility note:** Perceptual color spaces (CIELAB) guarantee accessible contrast by distance: 5+ levels apart = 4.5:1 (small text), 4+ levels apart = 3:1 (large text/icons). "Accessible doesn't mean not vibrant."

**Examples in the wild:** Stripe, Ramp, Mercury

---

## 4. Workstation Dense

**Style:** Maximum information density. Multi-panel layouts, compact spacing, keyboard-first. Every pixel earns its space.

**When to use:** DeFi trading interfaces, pro tools, data-heavy dashboards where power users need maximum information per viewport.

**The feel:** Dense, functional, technical. Information-rich but not cluttered — the density is intentional, not accidental.

**Direction:**
- **Palette:** Dark base, multiple semantic accent colors (green positive, red negative, blue info, yellow warning). More color than other styles — justified by data density needs.
- **Typography:** Monospace for all numbers. Sans-serif for labels. Small body text (13-14px). Tight line-height.
- **Spacing:** Compact (4-8-12px padding). Dense grid. Minimal section gaps.
- **Borders:** Functional separators between panels. More visible than other styles — needed for panel delineation.
- **Shadows:** Minimal. Panel separation through borders and background shade, not shadow.
- **Motion:** Fast, functional. No decorative animation. Data updates are subtle (150ms).
- **Key principle:** Multi-panel layout with resizable panes. Chart as dominant element. Keyboard shortcuts for power users.

**What makes it feel professional:** The density is organized, not chaotic. Clear visual hierarchy even at compact spacing. Professional users feel at home because the information architecture matches their mental model.

**Crypto-specific notes:**
- Token amounts always in `tabular-nums`
- Prices right-aligned in tables
- Green/red for direction, always paired with +/- signs (color-blind accessible)
- Slippage, fees, and route displayed before confirmation
- Real-time data with stale indicators

**Examples in the wild:** Jupiter, Drift, Tensor pro view, Bloomberg Terminal

---

## 5. Soft Consumer

**Style:** Approachable, mobile-first, progressive disclosure. Friendly and confidence-building for non-technical users.

**When to use:** Consumer wallets, onboarding-heavy products, mobile-first experiences where approachability matters more than density.

**The feel:** Friendly, confidence-building. The UI holds your hand without condescending. Color is warmer and more expressive — justified by the consumer audience.

**Direction:**
- **Palette:** Dark base with warmer accent colors. More color expression than monochrome/stark styles — gradients used to create warmth, not decoration.
- **Typography:** Rounded sans-serif, comfortable sizing. Nothing tight or technical. Generous line-height.
- **Spacing:** Spacious. Large touch targets. Mobile-first sizing.
- **Borders:** Soft, rounded (12-16px radius). Friendly edges.
- **Shadows:** Subtle glow effects for emphasis. Softer than hard drop shadows.
- **Motion:** Smooth, slightly playful. Transitions feel welcoming, not mechanical.
- **Key principle:** Progressive disclosure. Complex actions hidden behind simple surfaces. Simplicity first; power available when the user is ready.

**What makes it feel trustworthy:** Simplicity is harder than complexity. The product does powerful things but the UI makes each feel safe and understandable.

**Examples in the wild:** Phantom, Backpack, Coinbase consumer app

---

## 6. Gallery Editorial

**Style:** Content-first, image-dominant. The UI recedes so visual content commands attention. Minimal chrome.

**When to use:** NFT marketplaces, visual-content-heavy products, gallery/collection interfaces where images are the primary content.

**The feel:** Gallery-like, editorial. Clean typography labels things without competing with imagery.

**Direction:**
- **Palette:** Near-black background to make images pop. Minimal UI chrome. Accent used sparingly for actions only.
- **Typography:** Clean sans-serif for labels, slightly editorial feel. Numbers in monospace. Restrained sizing — images are the content, not text.
- **Spacing:** Grid-based with consistent gutters. Images given maximum real estate.
- **Borders:** Minimal. Images define their own edges. Subtle hover states reveal actions.
- **Shadows:** None on images (they should feel flush). Subtle elevation on action panels only.
- **Motion:** Hover reveals (action buttons appear on hover). Smooth image loading with fade-in. Grid layout transitions.
- **Key principle:** The content IS the design. The UI framework is invisible — you notice the art, not the interface.

**What makes it feel disciplined:** Maximum content, minimum chrome. Every pixel of UI chrome is justified. If you can remove an element and the page still works, remove it.

**Examples in the wild:** Tensor, OpenSea, Foundation

---

---

## Pitch Deck Styles

When `create-pitch-deck` invokes this skill for visual direction, use these deck-specific styles. Pitch decks have different constraints than app UI: slides are read in 2 minutes, must work projected in bright rooms AND read async on laptops, and each slide must stand alone without narration.

### Confident Navy

**When to use:** DeFi infrastructure, protocol pitches, institutional audiences, grant applications.

**Direction:**
- **Palette:** Navy (#1B2A4A) background, white text, one accent (teal or amber). Never gradient backgrounds.
- **Typography:** Clean sans-serif, 96px hero numbers, 44px headlines, 24px body. Tight heading tracking (-0.02em).
- **Layout:** One idea per slide. Max 6 words per bullet. Generous whitespace. Metric cards for traction.
- **Motion:** Staggered fade-in on slide entrance. No decorative animation.
- **Key rule:** Projected in a conference room at 10am, every word must be readable from the back row.

### Clean White

**When to use:** Consumer products, wallet pitches, YC/accelerator demos, demo day presentations.

**Direction:**
- **Palette:** White (#FFFFFF) background, charcoal (#2A2A2A) text, one brand accent. Light, airy, trustworthy.
- **Typography:** Same scale as Navy. Higher contrast on text. Bold for headlines, regular for body.
- **Layout:** Minimal. Maximum whitespace. Screenshots and product images do the talking.
- **Motion:** Subtle. Fade only. Slides should feel like a calm, confident conversation.
- **Key rule:** Reads perfectly on a laptop screen at 2am when a VC is scanning 50 decks in a row.

### Dark Premium

**When to use:** Trading/DeFi products, technically sophisticated audiences, hackathon demos with projector screens.

**Direction:**
- **Palette:** Near-black (#0A0A12) background, white text, accent for key metrics only. No pure black.
- **Typography:** Monospace for numbers and metrics. Sans-serif for narrative. Large stat callouts (120px+).
- **Layout:** Data-forward. Metric cards, comparison tables, traction charts. Dense but organized.
- **Motion:** Crisp transitions. Number reveals. Chart animations for traction slides.
- **Key rule:** Every number on screen must be current, sourced, and formatted per the `number-formatting` spec.

### Warm Editorial

**When to use:** Storytelling-heavy pitches, narrative-driven founders, content/social products, pitches where the founder's story IS the product.

**Direction:**
- **Palette:** Warm off-white (#FAF8F5) or warm dark (#1C1917), one warm accent. Feels like a well-designed magazine article.
- **Typography:** Serif for headlines (optional), sans-serif for body. Reading-width text blocks. Generous line-height.
- **Layout:** Asymmetric. Quote-led problem slides. Full-bleed images. Story arc visible in slide progression.
- **Motion:** Smooth, deliberate. Longer entrance transitions (300ms). Content reveals that match the narrative pace.
- **Key rule:** The deck should feel like reading a compelling essay, not viewing a spreadsheet.

### Choosing a Deck Style

| Audience | Recommended | Why |
|---|---|---|
| VCs (institutional) | Confident Navy | Trust, professionalism, readability in bright rooms |
| VCs (crypto-native) | Dark Premium | Matches their aesthetic expectations, data-forward |
| Hackathon judges | Dark Premium or Clean White | High contrast for projection, quick scanning |
| Grant committees | Confident Navy | Formal, ecosystem-focused |
| Accelerators / YC | Clean White | Minimal, lets the product speak |
| Demo day | Clean White or Warm Editorial | Storytelling-first, audience-friendly |
| Async investor read | Clean White | Best laptop readability, stands alone without presenter |

## Trait Index

Use traits to describe direction without referencing specific products:

| Trait | Means | Styles that have it |
|---|---|---|
| **Dense** | Tight spacing, compact controls, max information | Workstation Dense |
| **Restrained** | Narrow color palette, minimal decoration | Stark Minimal, Warm Monochrome |
| **Warm** | Warm neutrals, approachable feel, soft edges | Gradient Trust, Soft Consumer |
| **Editorial** | Content-first, reading-optimized, image-dominant | Gallery Editorial |
| **Dark-native** | Dark mode is the primary experience | Warm Monochrome, Workstation Dense, Gallery Editorial |
| **Consumer-friendly** | Approachable, progressive disclosure, generous sizing | Soft Consumer, Gradient Trust |
| **Mobile-first** | Touch targets, bottom sheets, one-thumb flows | Soft Consumer |
| **Luxury** | Negative space, restrained color, tight heading tracking | Stark Minimal, Warm Monochrome |

## Mix and Match

Styles are composable. Combine traits from different references:

- "Workstation Dense layout + Gradient Trust color warmth" → dense but approachable trading UI
- "Stark Minimal restraint + Soft Consumer approachability" → clean developer tool with friendly onboarding
- "Warm Monochrome polish + Gallery Editorial content focus" → SaaS with rich media/visual content
- "Gradient Trust signals + Workstation Dense information density" → fintech dashboard

## Choosing a Style

| If your product is... | Start with... | Adapt by... |
|---|---|---|
| A developer tool | Stark Minimal | Adding your brand accent |
| A SaaS platform | Warm Monochrome | Warming/cooling the gray tones |
| A payment/fintech product | Gradient Trust | Picking your gradient signature |
| A trading/DeFi interface | Workstation Dense | Adjusting density to user expertise level |
| A consumer wallet/app | Soft Consumer | Adjusting color expressiveness to brand |
| An NFT marketplace | Gallery Editorial | Adding visual richness for collection display |

**Remember:** These are direction references, not templates. Read the "feel" description more than the specific values. Apply through your own `brand.md` tokens.
