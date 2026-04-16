# Filter Transitions

Animate content swaps when users switch tabs, filters, or categories. The container smoothly resizes via a spring-driven height animation while content cross-fades.

## When to Use

- Tab switching where content changes and the container resizes
- Filter tags that change a list
- Any content swap where the new content has a different height

## Critical Anti-Pattern

**NEVER use framer-motion's `layout` prop on both parent AND children.** This is the #1 cause of jittery filter animations. It creates conflicting layout recalculations that fight each other.

```tsx
// BAD — causes conflicting layout recalculations
<motion.div layout>
  <AnimatePresence>
    {items.map(item => (
      <motion.div layout key={item.id}>...</motion.div>
    ))}
  </AnimatePresence>
</motion.div>

// GOOD — measured height + cross-fade
<AnimatedHeight spring={FILTER.height}>
  <AnimatePresence mode="wait">
    <motion.div key={activeFilter}>
      {filteredItems.map(...)}
    </motion.div>
  </AnimatePresence>
</AnimatedHeight>
```

## Config Objects

```tsx
const FILTER = {
  crossFade: 0.12,    // seconds for list fade out/in
  stagger:   0.04,    // seconds between each row entering
  offsetY:   6,       // px each row slides up from
  spring: { type: "spring" as const, visualDuration: 0.3, bounce: 0.15 },
  height: { type: "spring" as const, visualDuration: 0.35, bounce: 0.12 },
};
```

## AnimatedHeight Component

A reusable utility that uses `ResizeObserver` to detect content height changes and spring-animates the container. No `layout` prop needed.

```tsx
function AnimatedHeight({
  children,
  spring,
}: {
  children: React.ReactNode;
  spring: Record<string, unknown>;
}) {
  const innerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | "auto">("auto");

  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const h = entry.borderBoxSize?.[0]?.blockSize
        ?? entry.contentRect.height;
      setHeight(h);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <motion.div
      animate={{ height }}
      transition={spring}
      style={{ overflow: "hidden" }}
    >
      <div ref={innerRef}>{children}</div>
    </motion.div>
  );
}
```

Why this works: `ResizeObserver` detects actual content height changes, `motion.div` spring-animates the container, no `layout` prop conflicts.

## Cross-Fade with Keyed Wrapper

The full pattern: height animates smoothly while content cross-fades and rows stagger in.

```tsx
<AnimatedHeight spring={FILTER.height}>
  <AnimatePresence mode="wait" initial={false}>
    <motion.div
      key={activeFilter}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: FILTER.crossFade }}
    >
      {filteredItems.map((item, i) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: FILTER.offsetY }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...FILTER.spring, delay: i * FILTER.stagger }}
        >
          <ItemRow item={item} />
        </motion.div>
      ))}
    </motion.div>
  </AnimatePresence>
</AnimatedHeight>
```

## Spring Guidelines

| What | Spring | Why |
| --- | --- | --- |
| Container height | `visualDuration: 0.35, bounce: 0.12` | Gentle, no jarring jumps |
| Content cross-fade | `duration: 0.12` (not spring) | Fast, clean swap |
| Row stagger | `visualDuration: 0.3, bounce: 0.15` | Subtle spring entrance |
| Expand/collapse | `stiffness: 350, damping: 32` | Firm, minimal bounce |
