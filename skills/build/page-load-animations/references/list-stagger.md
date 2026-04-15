# List Stagger

Animate lists, card grids, and row collections with staggered spring entrances. Each item enters with a slight delay after the previous one, creating a cascade effect.

## When to Use

- Card grids or lists that cascade in on mount
- Token/asset rows appearing in a dropdown or panel
- Protocol cards, product cards, or any repeated UI element
- Sections within a dropdown that enter sequentially

## The Pattern

### Config Object

```tsx
const CARDS = {
  stagger: 0.18,         // seconds between each item
  offsetY: 24,           // px each item slides up from
  spring: { type: "spring" as const, stiffness: 280, damping: 26 },
};
```

### Direct Index-Based Stagger

The core pattern: use `i * stagger` for the delay. Never use framer-motion's `staggerChildren`.

```tsx
{items.map((item, i) => (
  <motion.div
    key={item.id}
    initial={{ opacity: 0, y: CARDS.offsetY }}
    animate={{
      opacity: isVisible ? 1 : 0,
      y:       isVisible ? 0 : CARDS.offsetY,
    }}
    transition={{ ...CARDS.spring, delay: i * CARDS.stagger }}
  >
    <ItemComponent item={item} />
  </motion.div>
))}
```

### Reusable StaggerItem Wrapper

For cases where you want a reusable wrapper component:

```tsx
function StaggerItem({
  index,
  config,
  children,
}: {
  index: number;
  config: { stagger: number; offsetY: number; spring: object };
  children: React.ReactNode;
}) {
  return (
    <motion.div
      className="w-full"
      initial={{ opacity: 0, y: config.offsetY }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...config.spring, delay: index * config.stagger }}
    >
      {children}
    </motion.div>
  );
}
```

## Stagger Timing Guidelines

| Stagger | Items | Feel | Use for |
| --- | --- | --- | --- |
| 0.03-0.04s | Dense lists (10+) | Rapid waterfall | Token rows, table rows |
| 0.06s | Medium lists (4-8) | Rhythmic cascade | Dropdown sections, option cards |
| 0.12-0.18s | Hero cards (2-5) | Dramatic entrance | Protocol cards, feature cards |

## Offset Guidelines

| Offset | Feel | Use for |
| --- | --- | --- |
| 6-8px | Subtle shift | Tight lists, small items |
| 12-16px | Moderate movement | Option cards, medium items |
| 20-24px | Bold entrance | Hero cards, large sections |

## Connecting to Page Choreography

When a list is a child of a choreographed page, receive the stage as a prop:

```tsx
function CardGrid({ loadStage }: { loadStage: number }) {
  return (
    <>
      {items.map((item, i) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: CARDS.offsetY }}
          animate={{
            opacity: loadStage >= 1 ? 1 : 0,
            y:       loadStage >= 1 ? 0 : CARDS.offsetY,
          }}
          transition={{ ...CARDS.spring, delay: i * CARDS.stagger }}
        >
          <Card item={item} />
        </motion.div>
      ))}
    </>
  );
}
```

## Anti-Patterns

- **Don't use framer-motion's `staggerChildren`** with `AnimatePresence` — it doesn't work reliably. Use manual `delay: i * stagger`.
- **Don't stagger more than ~10 items** — use shorter stagger (0.03s) for large lists or batch the rest with no delay.
- **Don't combine `layout` prop with stagger delays** — causes jitter and unpredictable behavior.
- **Don't re-stagger on refetches** — stagger on first mount only. Subsequent data updates should animate in place without the cascade (it gets annoying by the third time).
