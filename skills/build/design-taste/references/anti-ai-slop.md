# Anti-AI Slop

A diagnostic checklist for detecting generic AI-generated UI and specific fix rules. This file is for **detection**, not general craft guidance — for constructive polish, see `craft-and-polish.md` in `frontend-design-guidelines`.

> "Bold maximalism and refined minimalism both work — the key is intentionality, not intensity."

## Detection Checklist

Two tiers. Strong signals are diagnostic on their own. Weak signals only corroborate.

- **3+ strong signals:** high confidence generic output — redesign the direction
- **1-2 strong signals:** review direction before polishing
- **Weak signals only:** not diagnostic — don't redesign based on these alone

### Strong Signals (diagnostic)

**Layout:**
- [ ] Everything centered with symmetrical padding
- [ ] Uniform border-radius on all elements (same radius everywhere)
- [ ] Identical padding on every component
- [ ] Card nesting — containers within containers within containers
- [ ] Three-column feature grid with icon + heading + paragraph, repeated

**Components:**
- [ ] No visual weight hierarchy between primary and secondary actions
- [ ] Every section is a card with the same shadow
- [ ] Hero metric layout repeated: large number + small label + gradient accent line
- [ ] Glassmorphism cards used decoratively (not structurally justified)

**Color:**
- [ ] Default shadcn gray palette unchanged
- [ ] Multiple competing accent colors with no hierarchy
- [ ] Default gradient in hero section (especially violet/blue — the most overused AI combination)

### Weak Signals (corroborating only)

These are common in AI output but also appear in legitimate work. Flag only when strong signals are already present.

**Typography:**
- [ ] Default typeface with no evidence of deliberate selection (not "Inter is bad" — "no one chose Inter" is the smell)
- [ ] No weight hierarchy — everything is regular or medium
- [ ] Generic font pairing with no personality

**Motion:**
- [ ] Default CSS `ease` used everywhere
- [ ] Enter and exit timing are perfectly symmetric on overlays, drawers, and popups

**Content:**
- [ ] Vague aspirational headlines: "Build the future", "Scale without limits"
- [ ] Hedging language: "may help", "best-in-class", "cutting-edge"
- [ ] Gradient text on headings for "impact"
- [ ] Stock imagery or AI-generated placeholder art

## Diagnostic Redirects

When a signal is detected, these are the questions to ask (not polish suggestions — for constructive fixes, defer to `craft-and-polish.md` in `frontend-design-guidelines`):

### Before generating any UI
1. **"Are design tokens defined?"** If no → run `brand-design` first. Never generate into a blank sandbox.
2. **"Is there a chosen direction?"** If no → pick one of the 11 aesthetic directions below.
3. **"Does `brand.md` exist?"** If yes → read it. The palette and typography are already decided.

### When slop is detected
4. **"Was the typeface a deliberate choice or a default?"** If default → consider a personality typeface.
5. **"Does each color have a semantic role?"** If any color is decorative → question whether it's needed.
6. **"Is there intentional variation in radius by component role?"** If uniform → differentiate.
7. **"Is there any asymmetry?"** If everything is centered → introduce offset or unequal splits.
8. **"Is the copy specific to this product?"** If it reads like any product → rewrite with real data.

### The convergence test
Ask: "If someone said AI made this, would they believe it immediately?" If yes, the direction needs rethinking — go back to the aesthetic directions and commit to one.

## 11 Aesthetic Directions

Pick one before generating. Each is valid. The mistake is not picking — defaulting to the safe middle.

| Direction | Feel | When to use |
|---|---|---|
| **Brutally minimal** | Maximum restraint, near-empty space | Developer tools, infrastructure |
| **Maximalist** | Rich, layered, decorative | Consumer social, NFT platforms |
| **Retro-futuristic** | 70s-meets-space, warm + technical | Experimental, thesis-driven products |
| **Organic/natural** | Soft edges, earth tones, textured | Wellness, sustainability, community |
| **Luxury/refined** | Serif, negative space, muted palette | Private-banking-style finance, high-end DeFi |
| **Playful/toy-like** | Rounded, colorful, bouncy | Onboarding, consumer wallets, memecoins |
| **Editorial/magazine** | Serif headings, reading-width columns | Content, research, documentation |
| **Brutalist/raw** | Exposed structure, thick borders, mono | Anti-establishment, punk crypto |
| **Art deco/geometric** | Gold accents, symmetry, pattern | Luxury NFTs, high-end token brands |
| **Soft/pastel** | Low saturation, gentle gradients | Accessible finance, inclusive DeFi |
| **Industrial/utilitarian** | Functional, dense, no decoration | Trading terminals, professional tools |

**Rule:** Every design must pick a direction. Varying across projects is good — varying within one project is bad.
