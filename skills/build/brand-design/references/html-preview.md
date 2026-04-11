# HTML Preview

How to write the visual preview file that the user opens in their browser. This is the UX moment of the whole skill — if this file looks good, the skill feels magical. If it looks like a spec sheet, the skill feels tedious.

## What the preview should show

For each of the 6 candidate palettes, render a realistic mini-UI that uses the palette's **actual tokens** — not just flat color swatches. The preview must include:

1. **Palette name and vibe tag** — e.g., "Midnight Signal · tech · serious · trustworthy"
2. **A color strip** — 5 seed colors as blocks, hex codes below each
3. **A mini-UI block** — headline, body text, primary and secondary buttons, a small card with a sample number, an input field, a muted helper text line
4. **A contrast summary** — 3–4 key contrast ratios with a green checkmark if passing
5. **The pick instruction** — "Pick 1-6 and tell Claude, or say 'more like 3', 'more minimal', 'none'"

At the top of the page, a **light/dark toggle button** flips all 6 palettes at once using `data-theme` on `<html>`.

## File location

Write to: `<project-root>/.brand-preview/index.html`

Always the same filename. Each run overwrites the previous preview. Never put this outside `.brand-preview/` — it's a generated artifact that the user will want to `.gitignore` and delete later.

## Write-and-open procedure

1. Ensure `.brand-preview/` directory exists (`mkdir -p .brand-preview`).
2. Write `index.html` with the filled template (see below).
3. Detect OS and run the appropriate open command:

```bash
case "$(uname -s)" in
  Darwin) open .brand-preview/index.html ;;
  Linux)  xdg-open .brand-preview/index.html 2>/dev/null || true ;;
  MINGW*|MSYS*|CYGWIN*) start .brand-preview/index.html ;;
esac
```

4. In the conversation, always print the absolute `file://` path as a fallback:

```
Preview opened in your browser. If it didn't open automatically, open:
file:///Users/<you>/<project>/.brand-preview/index.html
```

## The HTML template

This is a single self-contained file — no external CSS, no JS framework, no network requests. Works offline. Drop-in fill with 6 palette objects.

```html
<!doctype html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Brand palette picker — {{PROJECT_NAME}}</title>
  <style>
    :root { font-family: system-ui, -apple-system, "Segoe UI", Inter, sans-serif; }
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; }
    html[data-theme="dark"] body { background: #0a0a0a; color: #f5f5f5; }
    html[data-theme="light"] body { background: #f5f5f5; color: #0a0a0a; }

    .topbar {
      position: sticky; top: 0; z-index: 10;
      backdrop-filter: blur(12px);
      background: color-mix(in oklch, currentColor 6%, transparent);
      border-bottom: 1px solid color-mix(in oklch, currentColor 12%, transparent);
      padding: 16px 24px;
      display: flex; align-items: center; justify-content: space-between;
    }
    .topbar h1 { margin: 0; font-size: 15px; font-weight: 600; letter-spacing: -0.01em; }
    .topbar .hint { font-size: 13px; opacity: 0.6; margin: 0; }
    .topbar .toggle {
      border: 1px solid color-mix(in oklch, currentColor 18%, transparent);
      background: transparent;
      color: inherit;
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 13px;
      cursor: pointer;
      font-family: inherit;
    }
    .topbar .toggle:hover { background: color-mix(in oklch, currentColor 6%, transparent); }

    .container {
      max-width: 960px;
      margin: 0 auto;
      padding: 32px 24px 80px;
      display: grid;
      gap: 40px;
    }

    .palette {
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 1px 2px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.08);
      /* All tokens scoped to this palette via CSS variables set inline */
      background: var(--bg);
      color: var(--fg);
      transition: background 200ms ease, color 200ms ease;
    }

    .palette-header {
      padding: 20px 24px 12px;
      display: flex; align-items: baseline; justify-content: space-between; gap: 16px;
      border-bottom: 1px solid var(--border);
    }
    .palette-number {
      display: inline-flex; align-items: center; justify-content: center;
      width: 28px; height: 28px; border-radius: 999px;
      background: var(--primary); color: var(--primary-fg);
      font-weight: 600; font-size: 13px;
      margin-right: 12px;
      flex-shrink: 0;
    }
    .palette-name { margin: 0; font-size: 20px; font-weight: 600; letter-spacing: -0.01em; }
    .palette-vibe { font-size: 13px; opacity: 0.66; margin: 4px 0 0; font-variant: all-small-caps; letter-spacing: 0.04em; }

    .swatches { display: grid; grid-template-columns: repeat(5, 1fr); gap: 1px; background: var(--border); }
    .swatch { aspect-ratio: 2 / 1; position: relative; }
    .swatch-label {
      position: absolute; bottom: 0; left: 0; right: 0;
      padding: 6px 8px;
      font-family: ui-monospace, "SF Mono", Menlo, monospace;
      font-size: 10px;
      background: rgba(0,0,0,0.35);
      color: #fff;
      text-align: center;
      letter-spacing: 0.02em;
    }

    .ui {
      padding: 24px;
      display: grid; grid-template-columns: 1fr 1fr; gap: 24px;
    }
    @media (max-width: 720px) { .ui { grid-template-columns: 1fr; } }

    .headline { font-size: 26px; font-weight: 600; letter-spacing: -0.02em; margin: 0 0 6px; }
    .body { font-size: 14px; line-height: 1.55; margin: 0 0 16px; opacity: 0.88; }
    .muted { font-size: 12px; opacity: 0.62; margin: 0; }

    .buttons { display: flex; gap: 8px; margin-bottom: 20px; }
    .btn {
      font-family: inherit;
      font-size: 13px;
      font-weight: 500;
      padding: 8px 14px;
      border-radius: var(--radius, 8px);
      border: 1px solid transparent;
      cursor: pointer;
      transition: opacity 150ms ease, transform 100ms ease;
    }
    .btn-primary { background: var(--primary); color: var(--primary-fg); border-color: var(--primary); }
    .btn-primary:hover { opacity: 0.92; }
    .btn-secondary { background: transparent; color: var(--fg); border-color: var(--border); }
    .btn-secondary:hover { background: var(--muted); }

    .input {
      width: 100%;
      font-family: inherit;
      font-size: 13px;
      padding: 8px 12px;
      border-radius: var(--radius, 8px);
      border: 1px solid var(--border);
      background: var(--input-bg);
      color: var(--fg);
    }
    .input:focus {
      outline: 2px solid var(--ring);
      outline-offset: 2px;
      border-color: var(--ring);
    }

    .card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: var(--radius, 12px);
      padding: 16px;
      color: var(--card-fg);
    }
    .card-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; opacity: 0.66; margin: 0 0 6px; }
    .card-value { font-family: ui-monospace, "SF Mono", Menlo, monospace; font-variant-numeric: tabular-nums; font-size: 24px; font-weight: 600; margin: 0; }
    .card-sub { font-size: 12px; opacity: 0.66; margin: 4px 0 0; }

    .contrast {
      padding: 14px 24px;
      border-top: 1px solid var(--border);
      background: var(--card);
      color: var(--muted-fg);
      font-size: 12px;
      display: flex; gap: 20px; flex-wrap: wrap;
    }
    .contrast span::before { content: "✓ "; color: #10b981; font-weight: 700; }

    .footer-cta {
      text-align: center;
      padding: 24px;
      opacity: 0.72;
      font-size: 14px;
    }
    .footer-cta code {
      font-family: ui-monospace, "SF Mono", Menlo, monospace;
      background: color-mix(in oklch, currentColor 10%, transparent);
      padding: 2px 6px;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <div class="topbar">
    <div>
      <h1>Brand palette — {{PROJECT_NAME}}</h1>
      <p class="hint">{{PROJECT_TAGLINE}}</p>
    </div>
    <button class="toggle" id="theme-toggle">Switch to Light</button>
  </div>

  <div class="container">

    <!-- REPEAT THE FOLLOWING BLOCK 6 TIMES, ONCE PER PALETTE -->
    <!-- Replace {{N}}, {{NAME}}, {{VIBE}}, and all CSS variable values per palette -->
    <!-- Use light-mode seeds when data-theme="light", dark-mode when "dark" -->

    <article class="palette" style="
      --bg: {{BG}};
      --fg: {{FG}};
      --card: {{CARD}};
      --card-fg: {{CARD_FG}};
      --primary: {{PRIMARY}};
      --primary-fg: {{PRIMARY_FG}};
      --muted: {{MUTED}};
      --muted-fg: {{MUTED_FG}};
      --border: {{BORDER}};
      --ring: {{RING}};
      --input-bg: {{INPUT}};
      --radius: 10px;
    ">
      <header class="palette-header">
        <div>
          <h2 class="palette-name"><span class="palette-number">{{N}}</span>{{NAME}}</h2>
          <p class="palette-vibe">{{VIBE}}</p>
        </div>
      </header>

      <div class="swatches">
        <div class="swatch" style="background: {{SEED_1}};"><span class="swatch-label">{{HEX_1}}</span></div>
        <div class="swatch" style="background: {{SEED_2}};"><span class="swatch-label">{{HEX_2}}</span></div>
        <div class="swatch" style="background: {{SEED_3}};"><span class="swatch-label">{{HEX_3}}</span></div>
        <div class="swatch" style="background: {{SEED_4}};"><span class="swatch-label">{{HEX_4}}</span></div>
        <div class="swatch" style="background: {{SEED_5}};"><span class="swatch-label">{{HEX_5}}</span></div>
      </div>

      <div class="ui">
        <!-- CONTEXTUAL MINI-UI GOES HERE -->
        <!-- The skill picks ONE of the templates from the "Contextual mini-UI templates"
             section below based on the user's project category, and injects it here.
             The SAME template is used for all 6 palette sections so the user can
             directly compare how their specific product looks across 6 themes. -->
      </div>

      <div class="contrast">
        <span>Body {{RATIO_BODY}}:1</span>
        <span>Primary {{RATIO_PRIMARY}}:1</span>
        <span>Muted {{RATIO_MUTED}}:1</span>
        <span>AA</span>
      </div>
    </article>

    <!-- END REPEAT -->

    <div class="footer-cta">
      Pick one: type <code>1</code> through <code>6</code> in Claude Code.<br />
      Want variations? Try <code>more like 3</code>, <code>more minimal</code>, or <code>none</code>.
    </div>
  </div>

  <script>
    const root = document.documentElement;
    const btn = document.getElementById('theme-toggle');
    btn.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      btn.textContent = next === 'dark' ? 'Switch to Light' : 'Switch to Dark';

      // Update each palette's CSS variables to match the theme
      document.querySelectorAll('.palette').forEach((el) => {
        const tokens = next === 'dark' ? el.dataset.dark : el.dataset.light;
        if (tokens) el.style.cssText = tokens;
      });
    });
  </script>
</body>
</html>
```

## How to fill the template

For each of the 6 palettes, the skill does this:

1. Derive both dark-mode and light-mode full token sets per `shadcn-integration.md`.
2. Build a string of all CSS variables for **dark mode** (default) and assign it to the `style` attribute on the `<article class="palette">`.
3. Build the same string for **light mode** and put it on a `data-light` attribute.
4. Also put the dark-mode string on `data-dark` for the toggle script to reference.

Modification to the script block at the end of the template — replace the palette loop with this pattern on each article:

```html
<article class="palette"
  data-dark="--bg: oklch(0.14 0.02 265); --fg: oklch(0.96 0.01 265); /* ...full set */"
  data-light="--bg: oklch(0.98 0.01 265); --fg: oklch(0.18 0.02 265); /* ...full set */"
  style="/* initial (dark) tokens */">
  ...
</article>
```

Then in the toggle script:
```js
document.querySelectorAll('.palette').forEach((el) => {
  const tokens = next === 'dark' ? el.dataset.dark : el.dataset.light;
  el.setAttribute('style', tokens);
});
```

This way the toggle really does swap the palettes to their light-mode variants, not just flip a page-wide class.

## Contextual mini-UI templates

This is the important part: the preview doesn't show a generic "Send 100 USDC" for every project. It shows **a mini-UI that matches what the user is actually building**, rendered 6 times across 6 palettes so they can directly see "how does *my* specific swap screen look in Forest Stake vs Sunset Trade?"

The skill picks ONE template based on the interview's category answer (and reference brands if they gave any). The same template is injected into all 6 palette sections — only the CSS variables differ between them.

Pick by:

1. **Interview category answer** — primary signal
2. **Product name / description keywords** — "wallet" → wallet template, "swap" → swap template, "feed" → social template, etc.
3. **Reference brands named** — if they said "Linear-like" use dashboard; if they said "Phantom-like" use wallet
4. **Fallback** — the `generic` template (a restrained transfer UI, works for anything)

### Template 1 — `wallet`

For: wallet apps, portfolio trackers, custody, anything with "send/receive/balance" as the main verb.

```html
<div>
  <p class="muted" style="margin-bottom: 4px;">Total balance</p>
  <h3 class="headline" style="font-family: ui-monospace, monospace; font-variant-numeric: tabular-nums;">$12,483.50</h3>
  <p class="muted">124.82 SOL · +2.4% today</p>
  <div class="buttons" style="margin-top: 20px;">
    <button class="btn btn-primary">Send</button>
    <button class="btn btn-secondary">Receive</button>
    <button class="btn btn-secondary">Swap</button>
  </div>
</div>
<div class="card">
  <p class="card-label">Last transaction</p>
  <p class="card-value">−0.4821 SOL</p>
  <p class="card-sub">2 minutes ago · Sent to 7xKX...p2aB</p>
</div>
```

### Template 2 — `swap`

For: DEX aggregators, AMMs, token swap UIs, bridges, anything with "token in → token out".

```html
<div>
  <p class="muted" style="margin-bottom: 4px;">You pay</p>
  <div class="card" style="padding: 12px; margin-bottom: 8px;">
    <p class="card-value" style="font-size: 18px;">100.00 <span style="font-size: 12px; opacity: 0.6;">USDC</span></p>
  </div>
  <p class="muted" style="margin-bottom: 4px;">You receive</p>
  <div class="card" style="padding: 12px; margin-bottom: 12px;">
    <p class="card-value" style="font-size: 18px;">0.6421 <span style="font-size: 12px; opacity: 0.6;">SOL</span></p>
    <p class="card-sub">1 USDC = 0.00642 SOL · 0.05% fee</p>
  </div>
  <button class="btn btn-primary" style="width: 100%;">Review swap</button>
</div>
<div class="card">
  <p class="card-label">Route</p>
  <p class="card-value" style="font-size: 14px;">Jupiter</p>
  <p class="card-sub">3 hops · 0.3% slippage</p>
</div>
```

### Template 3 — `staking`

For: staking dashboards, lending vaults, yield products, delegation UIs.

```html
<div>
  <p class="muted" style="margin-bottom: 4px;">Supplied</p>
  <h3 class="headline" style="font-family: ui-monospace, monospace; font-variant-numeric: tabular-nums;">1,250.00 <span style="font-size: 16px; opacity: 0.6;">USDC</span></h3>
  <p class="muted">Earning 4.2% APY · Next payout in 3h</p>
  <div class="buttons" style="margin-top: 16px;">
    <button class="btn btn-primary">Claim rewards</button>
    <button class="btn btn-secondary">Withdraw</button>
  </div>
</div>
<div class="card">
  <p class="card-label">Accrued</p>
  <p class="card-value">+12.84 USDC</p>
  <p class="card-sub">Since Mar 15 · Live</p>
</div>
```

### Template 4 — `nft`

For: NFT marketplaces, collections, gallery apps, art drops.

```html
<div>
  <p class="muted" style="margin-bottom: 4px;">Mad Lads #4821</p>
  <h3 class="headline" style="font-size: 22px;">Floor: 47.2 SOL</h3>
  <p class="muted">Listed 3 min ago · Rarity #142 / 10,000</p>
  <div class="buttons" style="margin-top: 16px;">
    <button class="btn btn-primary">Buy now</button>
    <button class="btn btn-secondary">Make offer</button>
  </div>
</div>
<div class="card">
  <p class="card-label">Last sale</p>
  <p class="card-value">42.0 SOL</p>
  <p class="card-sub">2 days ago · ~$7,840</p>
</div>
```

### Template 5 — `dashboard`

For: analytics, data tools, monitoring, observability, DefiLlama-style sites.

```html
<div>
  <p class="muted" style="margin-bottom: 4px;">Total TVL</p>
  <h3 class="headline" style="font-family: ui-monospace, monospace; font-variant-numeric: tabular-nums;">$1.24B</h3>
  <p class="muted">+4.2% · 24h</p>
  <div class="buttons" style="margin-top: 16px;">
    <button class="btn btn-primary">Filter</button>
    <button class="btn btn-secondary">Export</button>
  </div>
</div>
<div class="card">
  <p class="card-label">Top protocol</p>
  <p class="card-value" style="font-size: 16px;">Kamino</p>
  <p class="card-sub">$482M TVL · 38.9% share</p>
</div>
```

### Template 6 — `social`

For: feeds, chat apps, community tools, content platforms.

```html
<div>
  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
    <div style="width: 32px; height: 32px; border-radius: 50%; background: var(--primary);"></div>
    <div>
      <p style="margin: 0; font-size: 13px; font-weight: 500;">sol.aria</p>
      <p class="muted" style="margin: 0; font-size: 11px;">2m ago</p>
    </div>
  </div>
  <p class="body" style="margin: 0 0 12px;">Just staked my first 100 SOL with Marinade. 7.2% APY and I can still use the mSOL in Kamino. This is wild.</p>
  <div class="buttons">
    <button class="btn btn-primary">Follow</button>
    <button class="btn btn-secondary">Reply</button>
  </div>
</div>
<div class="card">
  <p class="card-label">Engagement</p>
  <p class="card-value">142</p>
  <p class="card-sub">likes · 18 replies · 4 reposts</p>
</div>
```

### Template 7 — `generic` (fallback)

For anything that doesn't fit the above, or when category is unclear.

```html
<div>
  <h3 class="headline">Welcome back</h3>
  <p class="body">Quick access to what you need. Pick up where you left off.</p>
  <div class="buttons">
    <button class="btn btn-primary">Get started</button>
    <button class="btn btn-secondary">Learn more</button>
  </div>
  <input class="input" placeholder="Search..." style="margin-top: 8px;" />
</div>
<div class="card">
  <p class="card-label">Activity</p>
  <p class="card-value">42</p>
  <p class="card-sub">items this week</p>
</div>
```

## Things to get right

- **Color strip in swatches should use hex**, not `oklch()`. Older browsers and some screenshots don't render `oklch()` swatches reliably, and hex is what the user will copy.
- **Mini-UI uses `oklch()`** everywhere — this is where modern rendering shines and contrast math is honest.
- **Match the template to the user's project.** Do not ship the generic fallback when the category clearly matches a specific template. A user building a swap app should see a swap UI, not "Welcome back."
- **The same template renders 6 times** — this is the whole point. The user should be able to compare their specific product across 6 brand options directly.
- **Card value is always `tabular-nums`** so numeric preview doesn't jitter.
- **Footer CTA repeats the instructions** at the bottom — users scroll to the end and forget the top bar.
- **Do not include a "copy to clipboard" button** — it tempts users to stay in the browser. The goal is: look, pick, come back to Claude Code, type a number.
- **If the user's product is non-Solana** (consumer web, SaaS, something else), adapt the copy in the template — drop the SOL/USDC/Solana references and use generic equivalents ($, "items", "transaction" → "order", etc.). The templates above are written with crypto defaults because the most common use case is Solana projects, but the skill should localize them.

## When the user returns

Once the user says "1" or "more like 3", the skill continues the workflow. The HTML file stays on disk — if the user wants to re-check before final apply, they can. After step 8 (brand.md written), tell the user:

```
You can delete the preview now:
  rm -rf .brand-preview/
```

Or leave it in `.gitignore`:

```bash
echo ".brand-preview/" >> .gitignore
```

Whichever they prefer.
