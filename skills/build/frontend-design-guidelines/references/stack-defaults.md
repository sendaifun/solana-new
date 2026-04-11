# Stack Defaults

When a user asks for a frontend and does not specify a stack, use this one. If the project already has a different stack, match the project — do not rewrite.

## The stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 15 (App Router) + TypeScript | SSR, RSC, file routing, works with most Solana SDKs |
| Styling | Tailwind CSS | Constraints from the token system, no CSS file sprawl |
| Components | shadcn/ui | Owned source, accessible by default, themeable via CSS variables |
| Icons | `lucide-react` | Consistent stroke, tree-shakeable |
| Animation | CSS transitions → `framer-motion` | CSS first; reach for framer-motion only when CSS can't do it |
| Fonts | `next/font` (Geist Sans + Geist Mono, or Inter + JetBrains Mono) | Zero layout shift, cached, variable fonts |
| Forms | `react-hook-form` + `zod` | Uncontrolled, fast, schema-validated |
| Dates/numbers | `Intl.DateTimeFormat`, `Intl.NumberFormat` | Built-in, i18n-ready |
| Toasts | shadcn's `sonner` wrapper | Accessible, non-blocking |

## Installing shadcn

```bash
pnpm dlx shadcn@latest init
pnpm dlx shadcn@latest add button input label card dialog form sonner
```

Always install components on demand. Do not try to add them all upfront.

## Design tokens — use these, not magic numbers

Colors, spacing, radius, and shadows come from tokens, not hardcoded values. shadcn gives you these CSS variables:

```css
/* Use these in Tailwind classes via bg-background, text-foreground, etc. */
--background, --foreground
--card, --card-foreground
--popover, --popover-foreground
--primary, --primary-foreground
--secondary, --secondary-foreground
--muted, --muted-foreground
--accent, --accent-foreground
--destructive, --destructive-foreground
--border, --input, --ring
--radius
```

**Do:**
```tsx
<div className="bg-card text-card-foreground border border-border rounded-lg p-6">
```

**Don't:**
```tsx
<div className="bg-[#111] text-[#eee] border border-[#333] rounded-[11px] p-[25px]">
```

If the user wants a custom brand color, change the CSS variable in `app/globals.css` once — do not override it per-component.

## Spacing scale

Stay on the 4 px grid. Tailwind's default scale is already on it: `p-1` = 4 px, `p-2` = 8 px, `p-3` = 12 px, `p-4` = 16 px, `p-6` = 24 px, `p-8` = 32 px, `p-12` = 48 px, `p-16` = 64 px.

- Component internal padding: `p-4` to `p-6`
- Gap between siblings: `gap-2` (tight), `gap-4` (default), `gap-6` (loose)
- Page gutter: `px-4 md:px-6 lg:px-8`
- Section vertical rhythm: `py-12 md:py-16 lg:py-24`

## Typography scale

| Role | Class | When |
|---|---|---|
| Display | `text-4xl md:text-5xl font-semibold tracking-tight` | Hero headings only |
| H1 (page) | `text-3xl font-semibold tracking-tight` | One per page |
| H2 (section) | `text-xl font-semibold` | Section breaks |
| H3 (subsection) | `text-base font-medium` | Card titles |
| Body | `text-sm text-foreground` | Default UI text |
| Reading | `text-base leading-7` | Long-form content only |
| Small / caption | `text-xs text-muted-foreground` | Meta, timestamps, helpers |
| Mono / numeric | `font-mono tabular-nums` | Token amounts, addresses, code |

Use `tabular-nums` any time numbers will change in place (balances, counters, charts) so digits don't jitter.

## Radius system

Pick one scale per project and stick with it.

| Element | Default |
|---|---|
| Button | `rounded-md` |
| Input | `rounded-md` |
| Card | `rounded-lg` |
| Dialog / sheet | `rounded-xl` |
| Pill / tag / avatar | `rounded-full` |

## Shadow system

Use shadows sparingly. Shadows = elevation, not decoration.

| Elevation | Class | Use |
|---|---|---|
| Flat | *(none)* | Default surfaces |
| Raised | `shadow-sm` | Cards on hover |
| Floating | `shadow-md` | Dropdowns, popovers |
| Overlay | `shadow-xl` | Modals, command palette |

Don't use more than two shadow levels on the same screen.

## Example: Button component

A well-behaved button covers all of these in ~20 lines. Use this as the shape for any interactive element you add.

```tsx
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
  loading?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, Props>(
  ({ className, variant = "primary", loading, disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        "inline-flex items-center justify-center gap-2",
        "h-10 px-4 rounded-md text-sm font-medium",
        "transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        variant === "primary" && "bg-primary text-primary-foreground hover:bg-primary/90",
        variant === "secondary" && "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        variant === "ghost" && "hover:bg-accent hover:text-accent-foreground",
        className,
      )}
      {...props}
    >
      {loading && <Spinner className="h-4 w-4" />}
      {children}
    </button>
  ),
);
Button.displayName = "Button";
```

Notice what this handles without being asked:

- Real `<button>` element (keyboard + screen reader free)
- Visible focus ring via `focus-visible`
- 40 px hit target (`h-10 px-4`)
- Disabled and loading states
- `aria-busy` for screen readers during loading
- Tokens everywhere, no hardcoded colors
- Transitions are 150 ms on `colors` only — not `all`

Every interactive component you ship should cover the same checklist.
