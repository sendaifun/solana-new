# Interactions

Rules for anything the user can click, tap, type into, hover, or focus. This is the single most-broken area of AI-generated UIs.

## Keyboard navigation

1. **Every interactive element must be reachable with Tab.** If you use a `<div>` to build something interactive, you're creating a bug. Use `<button>`, `<a href>`, `<input>`, `<select>`, `<textarea>`, or add `tabindex="0"` + full role + ARIA (last resort).
2. **Tab order follows visual reading order.** Never use `tabindex` values other than `0` and `-1`. Positive tabindex is an anti-pattern.
3. **Enter and Space activate buttons. Enter follows links.** If you used a real `<button>` / `<a>`, this is already true. If you didn't, it isn't.
4. **Escape dismisses overlays.** Modals, popovers, sheets, command palettes — Escape must close them. shadcn Dialog handles this for free.
5. **Arrow keys navigate within composite widgets.** Tabs, menus, radio groups, listboxes — use arrow keys, not Tab, to move between siblings. Again, shadcn primitives handle this.
6. **Focus must return to the trigger when a dialog closes.** Focus trapping inside, focus return outside. Radix/shadcn handles this too — do not break it with manual `autoFocus`.

## Focus states

1. **Every focusable element has a visible focus ring.** Use `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2` or the shadcn default.
2. **Do not use `outline-none` without adding a replacement ring.** A focusable element with no focus indicator is a blocker for keyboard and screen-reader users.
3. **Use `focus-visible`, not `focus`.** This keeps focus rings off mouse clicks but on for keyboard users.
4. **Focus ring contrast must pass 3:1 against its background.** Against a dark background, a `ring-ring/30` looks nice but is invisible. Bump it up.

## Hit targets

1. **Minimum 40 × 40 px on touch devices.** 44 × 44 px is the conventional target on mobile. If your icon is 16 × 16, add `p-3` so the overall hit area is big enough.
2. **Don't shrink the hit area to match the icon.** The icon is decoration; the hit area is the interaction.
3. **Avoid two adjacent hit targets with no gap between them.** Fat-finger mistaps are a usability failure. Space them with at least 8 px.
4. **Respect the user's zoom.** Never set `user-scalable=no` or `maximum-scale=1` in the viewport meta tag.

## Loading states

1. **Show loading within 100 ms of triggering an action.** Faster, and it feels instant; slower, and the user clicks again.
2. **Prefer skeletons over spinners for layout-affecting loads.** Skeletons prevent layout shift. Spinners are fine for tiny isolated areas (button submit, row refresh).
3. **For requests under 200 ms, skip the loading state entirely.** Show the result optimistically instead.
4. **Always show progress if the operation takes > 2 seconds.** Indeterminate spinners past 2 seconds feel broken.
5. **Disable the triggering control while the action is in flight** and set `aria-busy="true"` so assistive tech announces it.

## Optimistic updates

1. **Optimistic updates only for actions with low rollback cost.** A like button, a rename, a toggle — yes. A payment, a transaction, a delete — no.
2. **On failure, roll back the UI and show an inline error** next to where the action was taken. Do not just toast and leave the wrong state.
3. **Keep the optimistic state until the server confirms OR fails.** Do not revert-then-confirm — it's a double flicker.

## URL state

1. **Anything the user might want to share, bookmark, or reload into should live in the URL.** Search query, filter, tab, open dialog, selected row, pagination.
2. **Use search params, not client state, for the above.** Next.js: `useSearchParams` + `router.replace`. Use `replace`, not `push`, for fine-grained updates so the back button isn't noisy.
3. **Never store sensitive info in the URL.** Tokens, emails, keys — server state only.

## Mobile input

1. **Use the correct `inputmode` and `type`.** `type="email"`, `type="tel"`, `inputmode="numeric"`, `inputmode="decimal"`. Mobile keyboards are a user experience setting — use them.
2. **Autofocus sparingly.** Only on a single-field page where the input is the entire point (login form on `/login`, search page). Autofocus steals screen real estate on mobile.
3. **Respect the safe area.** Use `env(safe-area-inset-*)` for fixed bottom bars on iOS, or Tailwind's `pb-safe` via a utility plugin.

## Disabled vs. read-only vs. hidden

Three different things. Pick the right one.

- **Disabled** — exists, shown, not interactive, not in the tab order, greyed out. Use when the user cannot take the action *right now* (form invalid, unauthorized). The user should know it exists.
- **Read-only** — exists, shown, focusable, can't be edited. Use for confirmed values the user can still see and copy.
- **Hidden** — does not exist in the DOM / tab order. Use when the action simply doesn't apply.

Do not hide things that should be disabled. It confuses users who saw the action a moment ago.
