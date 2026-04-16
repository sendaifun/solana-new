# Hover and Micro-Interactions

Small, fast animations that provide feedback: button hovers, click responses, chevron rotations, tooltips. These should be under 200ms and use the simplest tool that works.

> **Baseline constraints:** This file inherits all rules from `animation.md` — duration tiers, `prefers-reduced-motion`, GPU-accelerated properties only, and the micro-interaction checklist. This file provides the implementation recipes for those rules.

## Core Principle

**Use CSS transitions for simple state changes, framer-motion only when needed.** Micro-interactions should be under 200ms. Don't import a physics engine to change a background color.

## CSS vs Framer-Motion Decision Matrix

| Interaction | Tool | Why |
| --- | --- | --- |
| Hover color change | CSS `transition-colors` | Simple state |
| Hover scale | CSS `hover:scale-[1.03]` | Simple transform |
| Active press | CSS `active:scale-[0.97]` | Instant feedback |
| Chevron rotation | Framer-motion spring | Needs overshoot |
| Tooltip appear | Framer-motion | Needs `AnimatePresence` for exit |
| Chart crosshair | CSS transition + throttled JS | Performance-sensitive |

## Button Feedback

### Scale + Brightness (Primary Buttons)

Always use specific transition properties, never `transition-all`. Duration 150ms per `animation.md` baseline. Wrap hover effects in `motion-safe:` for reduced-motion compliance.

```tsx
<button className="
  motion-safe:transition-transform motion-safe:duration-150
  hover:scale-[1.03] hover:brightness-110
  hover:shadow-[0_0_20px_rgba(255,77,169,0.4)]
  active:scale-[0.97]
">
```

### Ghost Button (Secondary)

```tsx
<button className="relative motion-safe:transition-colors motion-safe:duration-150 hover:bg-[rgba(255,255,255,0.06)] group">
  <span className="group-hover:text-accent-pink motion-safe:transition-colors motion-safe:duration-150">
    Claim Fees
  </span>
  <div className="absolute border border-accent-pink/30 inset-0 rounded-xl
    group-hover:border-accent-pink/50 motion-safe:transition-colors motion-safe:duration-150" />
</button>
```

### Subtle Button (Tertiary)

```tsx
<button className="bg-background-elevated hover:bg-background-subtle motion-safe:transition-colors motion-safe:duration-150">
```

## Chevron Rotation

Use framer-motion spring for physical feel with slight overshoot:

```tsx
<motion.div
  animate={{ rotate: isExpanded ? 180 : 0 }}
  transition={{ type: "spring", stiffness: 400, damping: 25 }}
>
  <ChevronDownIcon />
</motion.div>
```

## Tooltip Entrance

Small offset (4px), fast duration (150ms), no spring — tooltips should snap, not bounce.

```tsx
<AnimatePresence>
  {isHovered && (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
      transition={{ duration: 0.15 }}
    >
      <TooltipContent />
    </motion.div>
  )}
</AnimatePresence>
```

## Copy/Success Feedback

Transient state change that reverts after a delay:

```tsx
const [copied, setCopied] = useState(false);

function handleCopy() {
  navigator.clipboard.writeText(address);
  setCopied(true);
  setTimeout(() => setCopied(false), 1500);
}

<span>{copied ? "copied!" : "copy address"}</span>
```

## Anti-Patterns

- Don't use framer-motion for simple hover states — CSS transitions are faster and cheaper
- Don't animate on every mouse move — throttle to 30fps if tracking pointer position
- Don't use spring for tooltips — overshoot feels broken on small, informational elements
- Don't make micro-interactions longer than 200ms — they should feel instant
- Don't add `transition-all` when only `transition-colors` is needed — animates unintended properties
- Don't animate hover states on touch devices — wrap in `@media (hover: hover)` or use Tailwind's `hover:` which handles this
