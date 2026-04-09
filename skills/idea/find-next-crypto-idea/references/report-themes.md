# Report Themes

Present these 10 themes to the user before generating any HTML report. The user picks one and the selection is passed as the `theme` field in the JSON payload.

## Theme Selection Prompt

Ask the user:

> **Pick a style for your report** (opens as a standalone HTML file):
>
> | # | Theme | Vibe | Layout |
> |---|-------|------|--------|
> | 1 | **Manuscript** | Warm editorial, iA Writer / Bear notes | Narrow serif column, generous whitespace |
> | 2 | **Linear** | Dark refined, productivity tool | Dark panels, purple accent, wide layout |
> | 3 | **Swiss** | Bold poster typography, Helvetica grid | Asymmetric columns, thick rules, red accent |
> | 4 | **Academic** | Scientific paper, LaTeX feel | Serif body, numbered sections, formal |
> | 5 | **Stripe** | Premium fintech, clean white | Floating cards with soft shadows, purple accent |
> | 6 | **Brutalist** | Raw anti-design, bold contrasts | Thick black borders, oversized type, yellow highlights |
> | 7 | **Muji** | Japanese minimalism, quiet precision | Narrow column, hairline rules, lots of breathing room |
> | 8 | **Notion** | Clean wiki / knowledge base | Familiar doc style, colored callouts |
> | 9 | **Grayscale** | Austere consultancy report | Pure grayscale + one navy accent, table-heavy |
> | 10 | **Glass** | Frosted translucent panels, Arc browser | Gradient background, blur glass cards, cyan accent |
>
> Pick a number (1-10), or just say "surprise me".

If the user says "surprise me", pick one that matches their vibe from the conversation (technical = Linear/Grayscale, designer = Swiss/Muji, founder = Stripe/Glass, creative = Brutalist/Manuscript).

## Theme Slugs

Use these exact slugs in the JSON payload `theme` field:

1. `manuscript`
2. `linear`
3. `swiss`
4. `academic`
5. `stripe`
6. `brutalist`
7. `muji`
8. `notion`
9. `grayscale`
10. `glass`

## How Themes Work

Each theme controls:
- **Color palette** (CSS custom properties on `:root`)
- **Typography** (font family, size, weight, line-height)
- **Layout structure** (narrow vs wide, card vs flat, dense vs spacious)
- **Border/radius style** (sharp vs rounded, thick vs hairline)
- **Special effects** (blur for Glass, yellow highlights for Brutalist)

The HTML template reads `REPORT_DATA.theme` and applies the corresponding CSS class to `<body>`, which activates the full theme via CSS cascade.
