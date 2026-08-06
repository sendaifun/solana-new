---
name: family-values
description: Design product experiences around simplicity, fluidity, and delight. Use when designing or reviewing flows, interactions, navigation systems, animations, onboarding, confirmations, empty states, wallet UX, or any product surface that should feel contextual, welcoming, and intentionally polished rather than feature-dense or static.
---

# Family Values

Use this skill when the user wants a product or feature to feel more considered, more human, and less like generic software. This skill packages the design philosophy described in Benji Taylor's "Family Values" essay into a reusable workflow for product design, UX review, interaction design, and implementation guidance.

This is not a motion-technique skill. It is a product-feel skill. Treat motion, layout, copy, state changes, and navigation as one system.

Source: `https://benji.org/family-values` (read 2026-04-23).

## Core Principles

Anchor all decisions in these three principles:

- **Simplicity**: Keep fundamentals close, reveal everything else when it becomes relevant.
- **Fluidity**: Preserve orientation with purposeful transitions that explain how the interface changed.
- **Delight**: Add selective emphasis so the product feels alive, cared for, and memorable without becoming noisy.

These do not replace table stakes. Utility, performance, and security still matter and should be assumed non-negotiable.

## Operating Rules

Apply these defaults unless the product context clearly demands otherwise:

- Reduce visible complexity before adding explanation.
- Prefer contextual reveal over dumping all options on screen.
- Preserve the user's sense of place between states.
- Avoid transitions that exist only as decoration.
- Use motion to explain state change, hierarchy, direction, or consequence.
- Polish uncommon features too; users notice neglected corners.
- Match delight intensity to feature frequency.
- Treat trust-sensitive actions as clarity-critical moments.

## Workflow

### 1. Identify the moment

Classify the surface before making changes:

- **Core recurring task**: sending, confirming, switching, navigating, inputting values
- **Complex branching flow**: onboarding, setup, warnings, approvals, multi-step actions
- **Occasional but meaningful action**: wallet creation, backup, destructive actions, first-run states
- **Peripheral or low-frequency feature**: reordering, QR views, browser states, stealth/privacy modes

### 2. Choose the principle emphasis

- If the interface feels crowded or intimidating, prioritize **simplicity**.
- If the interface feels abrupt, disjointed, or spatially confusing, prioritize **fluidity**.
- If the interface feels competent but emotionally flat, prioritize **delight**.

In strong products, all three are present. The question is which one should lead the revision.

### 3. Design for gradual revelation

Hide complexity until the user earns or needs it.

Read `resources/simplicity.md` when working on:

- onboarding
- confirmations and warnings
- contextual overlays or sheets
- multi-step flows
- progressive disclosure
- navigation architecture

### 4. Design for continuity

Show how one state becomes the next instead of replacing it abruptly.

Read `resources/fluidity.md` when working on:

- screen transitions
- tab switches
- component morphs
- label changes
- multi-step flows
- transaction states
- continuity across navigation

### 5. Design for selective emphasis

Add delight where it will be felt, remembered, and not overused.

Read `resources/delight.md` when working on:

- first-run experiences
- infrequent features
- rewards and completions
- empty states
- micro-interactions
- easter eggs
- tactile feedback, sound, shimmer, confetti, playful motion

### 6. Review the whole path, not isolated screens

A polished individual animation does not create a coherent product. Review entry, transition, completion, return path, and any follow-up state together.

### 7. Ship with discipline

Do not justify weak product structure with polish. If the architecture is confusing, fix the architecture first.

## Design Heuristics

### Simplicity

- Keep one primary action or one primary idea per step.
- Use compact intermediate surfaces for transient actions when they preserve context better than full screens.
- Make progression unmistakable.
- Keep labels explicit and orientation visible.
- Rewrite content if needed to make hierarchy and transition clearer.

### Fluidity

- Every transition must answer: what changed, why, and where did the user go?
- Movement should imply direction and relationship.
- Reuse persistent elements across states instead of duplicating them.
- Morph text and controls when the action changes meaningfully.
- Motion should make the product feel clearer, not slower.

### Delight

- Surprise is strongest in low-frequency moments.
- Repeated tasks need restraint; reward with small touches, not spectacle.
- Rare features can carry more expressive motion and play.
- Delight fails when the rest of the product feels neglected.
- Emotional reassurance matters most in trust-sensitive flows.

## Output Modes

When using this skill, produce one of these:

- **Product critique**: identify where simplicity, fluidity, or delight is missing
- **Flow redesign**: propose a revised step-by-step interaction model
- **Interaction spec**: describe states, transitions, continuity rules, and delight moments
- **Implementation guidance**: translate the principles into component and motion behavior
- **Audit checklist**: score a feature using the review checklist

## Required Review Questions

Before finalizing a design or recommendation, answer these:

1. What should remain hidden until it becomes relevant?
2. What on screen should persist across the next step?
3. Which transition most needs to explain itself?
4. Where is trust most fragile?
5. Which moment deserves delight, and is that delight proportionate to usage frequency?
6. Does any neglected edge of the experience break the overall feeling of care?

## Constraints

- Do not recommend "more animation" as a generic fix.
- Do not add delight uniformly across the product.
- Do not let full-screen flows destroy context when a contextual surface would do.
- Do not replace explanatory continuity with sudden static swaps.
- Do not overfit to crypto; these principles apply to any product surface, but trust-sensitive flows deserve extra rigor.

## References

- `resources/source-map.md`: full mapping from the essay to this skill package
- `resources/simplicity.md`: gradual revelation and tray-system rules
- `resources/fluidity.md`: continuity, spatial logic, and transition architecture
- `resources/delight.md`: selective emphasis, surprise, and frequency-sensitive polish
- `resources/review-checklist.md`: practical audit sheet for design reviews
