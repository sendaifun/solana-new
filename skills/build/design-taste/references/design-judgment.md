# Design Judgment

Decision trees for common design choices, page archetypes for layout direction, and mobile collapse rules. This is the core of the design-taste skill — the judgment layer that tells you WHAT to build before you figure out HOW.

Spacing rules and responsive breakpoints stay in `layout-and-design.md`. This file provides direction, not constraints.

## Decision Flows

Actual branching logic. Follow the flow to arrive at one answer.

### Cards vs Lists vs Tables

```
Is cross-item comparison the primary action?
  YES → Does the user need sorting/filtering across many fields?
    YES → Table
    NO  → Table (simpler, fewer columns)
  NO  → Does visual content drive the decision?
    YES → Are items self-contained with thumbnails?
      YES → Cards
      NO  → List with inline previews
    NO  → List (default)
```

**Crypto shortcuts:** Token lists → Table. NFT collections → Cards. Transaction history → List. Portfolio positions → Table with expandable rows.

## Heuristic Tables

Pick based on context. These are defaults, not branching logic.

### Density

| Level | Feel | When |
|---|---|---|
| **Spacious** | Generous padding, large touch targets, breathing room | Consumer onboarding, marketing, first-time flows |
| **Comfortable** | Balanced, default shadcn sizing | General app UI, settings, forms (DEFAULT) |
| **Compact** | Tight, information-dense, power-user | Enterprise analytics, trading surfaces, pro tools |

**Default to comfortable.** Let users opt into compact via a preference. Never force compact on first-time users. For exact padding/height values per density tier, see `layout-and-design.md` in `frontend-design-guidelines`.

### Asymmetry vs Symmetry

| Choose... | When... |
|---|---|
| **Asymmetry** | Personality, editorial feel, marketing pages, hero sections, feature highlights |
| **Symmetry** | Trust, formality, data-dense surfaces, tables, financial confirmations |

**Crypto pattern:** Asymmetric hero (marketing, above the fold) + symmetric data grid (below, where trust matters). Never asymmetric in transaction confirmation screens.

### When to Break the Grid

- Hero sections — offset headings, overlapping images, diagonal flow
- Feature highlights — one large + two small, unequal columns
- Emotional moments — success celebrations, milestones, first-time achievements
- **Never** in data-dense surfaces, tables, forms, or financial inputs

### Modal vs Popover vs Tooltip vs Drawer vs Full Page

```
Does the user MUST make a decision before continuing?
  YES → Is it a simple confirm/cancel?
    YES → Modal (small)
    NO  → Is it multi-step or complex?
      YES → Full page or stepper
      NO  → Modal (medium)
  NO  → Does the content relate to a specific trigger element?
    YES → Is it brief, non-interactive info?
      YES → Tooltip
      NO  → Is it a small selection or config?
        YES → Popover
        NO  → Drawer/Sheet
    NO  → Is the user on mobile?
      YES → Drawer/Sheet (bottom)
      NO  → Drawer/Sheet (side) or inline panel
```

**Crypto shortcuts:** Transaction confirmation → Modal. Token selector → Popover or Drawer. Slippage settings → Popover. Wallet connect → Modal. Transaction history detail → Drawer on mobile, side panel on desktop.

### Form Control Selection

Adapted from a product design decision flow:

```
How many options can the user select?
  MULTIPLE → Are there fewer than 6 options?
    YES → Checkboxes or toggles
    NO  → Checkboxes with search
  ONE → Are there exactly 2 options?
    YES → Radio buttons (NEVER dropdown for 2 options)
    NO  → Does selection apply immediately (no submit)?
      YES → Switch/toggle
      NO  → Are there fewer than 6 options?
        YES → Radio buttons
        NO  → Is this a filtering/navigation context?
          YES → Tabs
          NO  → Are options predictable (known set)?
            YES → Dropdown (last resort)
            NO  → Combobox with autocomplete
```

## Heuristic Defaults

Quick rules of thumb. Apply by context, not by branching logic.

### Color Restraint

Single accent color + grayscale palette. This is the #1 signal of intentional design.

- Warm monochrome: sparse accent on warm gray
- Stark minimal: one accent on black/white — could function without it
- Gradient trust: gradient as brand signature, UI itself restrained to neutral

**Rule:** If your page has more than 2 non-gray hues, you're likely overusing color. Remove until each remaining hue has a clear semantic role.

### Typography Hierarchy

- 3 font weights maximum (regular, medium, bold)
- 4-5 font sizes maximum per page
- More variety = less hierarchy = harder to scan
- Tighten letter-spacing on display text: -0.02em to -0.04em
- Loosen letter-spacing on uppercase labels: +0.05em

### Shadow Discipline

- 4% opacity: card resting state
- 8% opacity: card hover state, elevated panels
- 8% opacity maximum for any UI shadow
- 12% opacity: modals and overlays ONLY
- **If you can clearly see the shadow, it's too strong.**

### Motion Restraint

Never ship the default CSS `ease` as your system motion curve. Pick one custom easing curve per brand and use it consistently across the product. A strong default for ease-out is `cubic-bezier(0.23, 1, 0.32, 1)`.

Enter transitions should usually take longer than exit transitions. Start with 300ms in / 200ms out for overlays and panels: arrival feels deliberate, dismissal feels clean.

### Whitespace as Confidence Signal

**Cramped layout = cheap product feel. Whitespace = confidence.** Section spacing should be generous — marketing sections need more breathing room than dashboard sections. For exact px values, see `layout-and-design.md`. The judgment call here: when in doubt, add more space rather than less.

### Structural Containment

Good design usually comes from what you exclude, not what you add.

Default to defined edges: cards, panels, or sections with clear boundaries. Avoid bare content floating directly on the page background unless the page is explicitly editorial or image-first. Structure should come from containment before decoration.

### Component-Level Calls

| Component | Default visual call |
|---|---|
| **Button** | One primary action per surface. Secondary gets a quiet fill. Ghost still needs a visible hover/focus state. Keep radius consistent across variants. |
| **Input / Textarea** | Resting state should feel restrained: subtle border or filled field. Focus uses an accent ring, not a background-color swap. Textareas should open with at least 3-4 visible lines. |
| **Select / Combobox** | Triggers should read as inputs, not buttons. Match adjacent field styling. |
| **Dialog / Modal** | Desktop dialogs should feel like focused islands, not mini-pages. Avoid full-width modals on desktop. |
| **Dropdown / Menu** | Menus should originate from their trigger. Group long lists with separators. |
| **Table** | Left-align text, right-align numbers, never center-align data. Use tabular numerals for numeric columns. |
| **Tabs** | Underline for content tabs. Reserve pill tabs for filters or segmented toggles. |
| **Empty State** | Include an icon or illustration, a short explanation, and a clear next-step CTA. |
| **Search** | Keep search integrated into the shell or header, not oversized above content. Highlight matches and give recovery guidance for no-results states. |

## Page Archetypes

Direction per page type. These are compositional patterns, not spacing rules (those stay in `layout-and-design.md`).

### Marketing Hero + Feature Stack
- Asymmetric hero with offset heading and product screenshot
- Alternating left/right feature sections below
- Aggressive whitespace between sections (96-128px)
- One clear CTA per viewport height
- Gradient or texture on hero background, neutral below

### App Shell
- Sidebar + main content area (widths defined in `layout-and-design.md`)
- Compact navigation, icon + label, active state with accent
- Content-first: sidebar recedes, content commands attention
- Persistent header with breadcrumb or page title

### Dashboard
- 12-column grid, card-based metric tiles
- Key metrics above the fold, charts below
- Dense but readable — comfortable density by default
- Consistent card sizes per row (3x4-col or 4x3-col)

### Trading / Workstation
- Multi-panel layout with resizable panes
- Keyboard-first navigation (shortcuts displayed)
- Compact density, minimal chrome
- Chart as dominant element, controls around it
- Monospace for all numeric values

### Settings / Forms
- Narrow centered column
- Grouped sections with clear headings
- Save button fixed or at section bottom
- Minimal visual noise — focus on input clarity

### Editorial / Docs
- Reading-width column (per `layout-and-design.md` reading width guidance)
- Serif typeface optional for headings
- Generous line-height (1.6-1.8)
- Table of contents sidebar on desktop, collapsible on mobile

## Mobile Collapse Rules

What changes at mobile breakpoint:

| Element | Desktop | Mobile |
|---|---|---|
| Sidebar | Full width (240-320px) | Icon-only → hamburger menu |
| Secondary actions | Visible buttons | Overflow menu (three dots) |
| Card grid | 3-4 columns | 1 column, stacked vertically |
| Data table | Full columns | Priority columns only, horizontal scroll |
| Decorative elements | Visible | Hidden |
| Section padding | Generous | Reduced (per layout-and-design.md) |
| Multi-panel layout | Side-by-side | Stacked or tabbed |
