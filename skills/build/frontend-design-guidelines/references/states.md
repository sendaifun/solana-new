# States

Every component that fetches, submits, or lists data has at least five states. Most AI-generated components ship with only one (the happy path). Fix that.

## The five states

1. **Idle / initial** — nothing has happened yet
2. **Loading** — fetching or submitting
3. **Empty** — fetch succeeded, but there's nothing to show
4. **Error** — something went wrong
5. **Success** — data is present

If you skip any of these, your component has a bug waiting to ship.

## Loading

1. **Prefer skeletons over spinners** for layout-affecting loads. Skeletons reserve the space the content will occupy, so nothing jumps when the data arrives.
2. **Skeleton shapes match the content shape.** A list of cards gets card-shaped skeletons, not a full-width grey rectangle.
3. **Show loading within 100 ms.** Faster, and it's invisible; slower, and the user second-guesses.
4. **For loads under 200 ms, skip the loading state entirely.** Flicker is worse than delay.
5. **For loads over 2 seconds, show progress or a reassuring message.** "Loading your transactions..." is better than a silent spinner.
6. **Disable actions that would conflict with the in-flight load.** Don't let the user trigger the same fetch twice.

### Skeleton example

```tsx
if (isLoading) {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
      ))}
    </div>
  );
}
```

## Empty

Empty states are where you either earn the user or lose them. Do not ship a component without thinking about this state.

A good empty state has three things:

1. **An honest explanation** of why there's nothing — and whether that's expected or a problem
2. **A clear next action** the user can take (if any)
3. **A little personality** — a line of human copy, a small illustration or icon

**Bad:** "No results"

**Better:**
> **No transactions yet**
> Once you make a transfer or trade, you'll see it here.
> [Make your first transfer]

**When there's genuinely no action to take**, say so plainly:

> **All caught up**
> No new alerts.

```tsx
if (items.length === 0) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
      <InboxIcon className="h-10 w-10 text-muted-foreground" aria-hidden />
      <div className="space-y-1">
        <p className="text-sm font-medium">No transactions yet</p>
        <p className="text-xs text-muted-foreground">
          Once you make a transfer or trade, you'll see it here.
        </p>
      </div>
      <Button variant="secondary" onClick={onGetStarted}>
        Make your first transfer
      </Button>
    </div>
  );
}
```

## Error

Errors are recovery moments. Give the user a way out.

1. **Say what went wrong** in human language — not "Error 500" or raw stack traces.
2. **Say what the user can do about it** — retry, go back, contact, wait.
3. **Offer a recovery action inline.** Don't force a page refresh.
4. **Preserve their work.** If a form submission failed, keep the form state.
5. **Error boundaries catch the nuclear case.** Wrap routes and large features in an error boundary so a single component crash doesn't take out the page.

**Bad:** "Something went wrong"

**Better:**
> **Couldn't load your balances**
> This is usually a network hiccup. Try again in a moment.
> [Retry] [Refresh]

```tsx
if (error) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/5 p-4">
      <div className="flex items-center gap-2 text-destructive">
        <AlertCircleIcon className="h-4 w-4" aria-hidden />
        <p className="text-sm font-medium">Couldn't load your balances</p>
      </div>
      <p className="text-xs text-muted-foreground">
        {error.message || "This is usually a network hiccup."}
      </p>
      <Button variant="secondary" onClick={retry}>
        Try again
      </Button>
    </div>
  );
}
```

### Specific error types deserve specific handling

- **Unauthorized (401)** — prompt to sign in, preserve the intended destination
- **Forbidden (403)** — explain what permission is missing, who to ask
- **Not found (404)** — suggest where to go instead
- **Rate limited (429)** — tell the user to slow down and when to retry
- **Network / offline** — detect and show an offline banner; queue the action if possible
- **Server error (5xx)** — generic retry is fine, but also log it

## Partial / optimistic

For actions where you already showed the result optimistically:

- **Keep the optimistic state until the server confirms or fails.**
- **On confirm**, do nothing — the UI is already correct.
- **On failure**, roll back the UI and show an inline error where the action was taken. A toast alone is not enough — the user needs to see the state revert.

## Success

Success states are the most overlooked.

1. **After a successful action, go somewhere.** Redirect, close the modal, clear the form, show a confirmation state. Do not leave the user staring at a submitted form with no feedback.
2. **For long-lived success** (a completed onboarding step, a completed transaction), show a confirmation screen or banner with next steps.
3. **For short-lived success** (save, update, toggle), a toast is enough — but the toast must be dismissible and must not cover content.
4. **Never use alert() or confirm().** Use shadcn's Dialog/AlertDialog/Sonner instead.

## State coverage checklist

For every data-driven component, confirm:

- [ ] Loading state exists and renders without layout shift
- [ ] Empty state exists, is human, and has a next action (or explicit "nothing to do")
- [ ] Error state exists with a recovery action
- [ ] Optimistic update (if any) rolls back correctly on failure
- [ ] Success state provides feedback and a next step
- [ ] Fetching the same data twice in quick succession is handled (debounce, cancel, or dedupe)
- [ ] Offline case is handled or explicitly not supported
