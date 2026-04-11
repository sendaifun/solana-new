# Forms

Forms are where most UIs fall apart: missing labels, wrong input types, validation that fires too early or too late, error messages the user can't recover from. Follow this ruleset for every form.

## Structure

1. **Every input has a `<label>` associated by `htmlFor` and `id`** — or wraps the input. Placeholder text is not a label.
2. **Group related fields with `<fieldset>` + `<legend>`.** Screen readers rely on this for radio groups, billing address blocks, etc.
3. **Submit with `<button type="submit">` inside a `<form>`.** This gives you Enter-to-submit and native form validation.
4. **Prevent default only when necessary.** If you're using `react-hook-form`, its `handleSubmit` wraps this for you.
5. **One primary action per form.** The big button. Secondary actions (Cancel, Save Draft) are visually secondary.

## Labels and hints

1. **Labels are always visible.** "Float label" patterns fail for autofill, long text, and accessibility. Put the label above the input.
2. **Helper text goes below the input**, in `text-xs text-muted-foreground`.
3. **Required fields are marked** with a visible indicator (e.g., "Email *" or "(required)"). Do not rely on color alone.
4. **Character counts and format hints live in helper text**, not placeholder.
5. **Placeholder text shows *example* input, not instructions.** "you@example.com", not "Enter your email".

## Input types

Use the most specific type available. The browser gives you keyboard layout, validation, and autocomplete for free.

| Content | Type / inputmode |
|---|---|
| Email | `type="email" autocomplete="email"` |
| Password | `type="password" autocomplete="new-password"` or `"current-password"` |
| Phone | `type="tel" autocomplete="tel" inputmode="tel"` |
| Integer | `type="text" inputmode="numeric" pattern="[0-9]*"` |
| Decimal | `type="text" inputmode="decimal"` |
| Search | `type="search"` |
| URL | `type="url" inputmode="url"` |
| Date | `type="date"` (when native picker is acceptable) |
| OTP / code | `type="text" inputmode="numeric" autocomplete="one-time-code"` |

**Never use `type="number"` for amounts, IDs, or anything you care about.** It drops leading zeros, allows scroll-to-change, and has inconsistent max/min behavior. Use `text` + `inputmode`.

## Autocomplete

Autocomplete is not optional. Password managers and mobile autofill depend on it.

- `autocomplete="name"`, `"given-name"`, `"family-name"`
- `autocomplete="email"`
- `autocomplete="current-password"` (sign in) vs `"new-password"` (sign up, change)
- `autocomplete="one-time-code"` for OTP
- `autocomplete="cc-number"`, `"cc-exp"`, `"cc-csc"`
- `autocomplete="street-address"`, `"postal-code"`, `"country"`

## Validation

1. **Do not validate on every keystroke.** It yells at the user while they're still typing. Validate on blur, on submit, or after a debounce.
2. **Password fields are the exception** — live strength/requirements are helpful because users can't see what they're typing.
3. **Error messages appear inline, next to the field**, not only in a toast or summary at the top. Toasts are complementary, not the only channel.
4. **Error messages are specific and actionable.** "Email must include an @" not "Invalid input". "Password needs at least 8 characters" not "Error".
5. **`aria-invalid="true"` and `aria-describedby="<error-id>"`** on the input when it has an error, so screen readers announce it.
6. **Focus moves to the first invalid field on failed submit**, so the user isn't hunting.
7. **Preserve user input on error.** Never clear a form because one field was invalid.
8. **Server errors are presented the same way as client errors** — inline on the offending field when possible, banner at the top when the error is form-wide.

## Submission behavior

1. **Disable the submit button while the form is in flight** and set `aria-busy`.
2. **Show a loading state on the submit button**, not just a toast. The button is where the user's attention is.
3. **After success, go somewhere.** Redirect, close the modal, show a confirmation state. Do not leave the form in its submitted state with no feedback.
4. **Never submit on blur or on change.** Always explicit.

## Password fields

1. **Offer a show/hide toggle.** Accessible label: "Show password" / "Hide password".
2. **Use `autocomplete="new-password"` on signup** and `"current-password"` on login so password managers offer the right suggestion.
3. **Do not disable paste** on password confirmation. It breaks password managers.
4. **Minimum length 8, no composition requirements.** Length beats complexity. Defer to the project's auth system if it has stricter rules.

## Spellcheck

- Names, emails, usernames, passwords, code, addresses → `spellCheck={false}`
- Long-form content, comments, descriptions → leave default (on)

## Example: a small form

```tsx
<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
  <div className="space-y-1.5">
    <Label htmlFor="email">Email</Label>
    <Input
      id="email"
      type="email"
      autoComplete="email"
      spellCheck={false}
      aria-invalid={errors.email ? "true" : undefined}
      aria-describedby={errors.email ? "email-error" : undefined}
      {...register("email")}
    />
    {errors.email && (
      <p id="email-error" className="text-xs text-destructive">
        {errors.email.message}
      </p>
    )}
  </div>

  <Button type="submit" loading={isSubmitting}>
    Sign in
  </Button>
</form>
```

Every form you write should have this shape or better.
