# Popups and Modals

Animate modals, dropdowns, and popovers with layered entrance sequences: backdrop, then panel, then inner content. The layering creates depth and directs attention.

## When to Use

- Centered modal dialogs
- Dropdown menus attached to a trigger button
- Popovers and tooltips with rich content

## Modal Pattern (Centered Overlay)

### Storyboard

```tsx
/* ─────────────────────────────────────────────────────────
 * ANIMATION STORYBOARD — Modal
 *
 *    0ms   backdrop fades in (blur + dim)
 *    0ms   panel scales 0.95 -> 1.0, fades in
 *   80ms   title + close button appear
 *  120ms   option cards stagger in (60ms apart)
 *  360ms   all content visible, idle
 *
 * Exit:
 *    0ms   panel scales down + fades out
 *    0ms   backdrop fades out
 * ───────────────────────────────────────────────────────── */
```

### Config Objects

```tsx
const BACKDROP = {
  fadeIn:  0.25,
  fadeOut: 0.2,
};

const PANEL = {
  spring: { type: "spring" as const, visualDuration: 0.35, bounce: 0.18 },
  scale:  0.95,
};

const CARDS = {
  stagger:      0.06,
  offsetY:      12,
  spring: { type: "spring" as const, visualDuration: 0.3, bounce: 0.15 },
  initialDelay: 0.08,
};
```

### Three-Layer Structure

```tsx
<AnimatePresence>
  {isOpen && (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Layer 1: Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: BACKDROP.fadeIn }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Layer 2: Panel */}
      <motion.div
        initial={{ opacity: 0, scale: PANEL.scale }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: PANEL.scale }}
        transition={PANEL.spring}
        className="relative z-10 w-[420px] rounded-2xl"
      >
        {/* Layer 3: Content with stagger */}
        {options.map((option, i) => (
          <motion.div
            key={option.id}
            initial={{ opacity: 0, y: CARDS.offsetY }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              ...CARDS.spring,
              delay: CARDS.initialDelay + i * CARDS.stagger,
            }}
          >
            <OptionCard {...option} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  )}
</AnimatePresence>
```

### Close Behaviors (always implement all three)

```tsx
// 1. Backdrop click
<motion.div onClick={onClose} ... />

// 2. Escape key
useEffect(() => {
  if (!isOpen) return;
  const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
  document.addEventListener("keydown", handleKey);
  return () => document.removeEventListener("keydown", handleKey);
}, [isOpen, onClose]);

// 3. Close button
<button onClick={onClose} aria-label="Close">✕</button>
```

## Dropdown Pattern (Positioned)

Dropdowns differ from modals: no backdrop, positioned absolutely, smaller scale, duration-based ease instead of spring for the container.

```tsx
const OPEN = {
  stagger: 0.06,
  offsetY: 8,
  spring: { type: "spring" as const, stiffness: 400, damping: 30 },
};

<AnimatePresence mode="wait">
  {isOpen && (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.97 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="absolute top-full right-0 mt-2 z-[60]"
    >
      {sections.map((section, i) => (
        <motion.div
          key={section.id}
          initial={{ opacity: 0, y: OPEN.offsetY }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...OPEN.spring, delay: i * OPEN.stagger }}
        >
          {section.content}
        </motion.div>
      ))}
    </motion.div>
  )}
</AnimatePresence>
```

## Key Differences: Modal vs Dropdown

| Property | Modal | Dropdown |
| --- | --- | --- |
| Backdrop | Yes (blur + dim) | No |
| Position | Fixed center | Absolute, anchored to trigger |
| Container scale | 0.95 -> 1.0 | 0.97 -> 1.0 |
| Container transition | Spring | Duration-based ease |
| Z-index | High (100+) | Medium (60+) |
| Close on outside click | Backdrop click | Click outside component |
