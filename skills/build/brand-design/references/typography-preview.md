# Typography Preview

The HTML preview for step 6 (typography pick). Mirrors `html-preview.md`'s pattern — writes a self-contained HTML file, opens it in the user's browser, waits for a 1-6 pick in the conversation.

The key UX point: **each of the 6 font pairs is rendered on the user's already-chosen brand palette.** The user isn't looking at fonts on a white page — they're looking at fonts on the exact colors they picked 30 seconds ago. That's the only way to know if a font actually works for their brand.

## When the skill uses this file

Step 6 of the brand-design workflow. After the user has picked a palette, read `typography-pairings.md` to look up the 6 candidate pairs for the palette's mood, then write this file filled with:

- The chosen palette's token values (for the backdrop)
- The 6 font pair definitions (with Google Fonts URLs for on-the-fly loading in the preview)
- The user's project name and category (for copy samples)

Write to:

```
<project-root>/.brand-preview/typography.html
```

Then open it the same way as `index.html`:

```bash
case "$(uname -s)" in
  Darwin) open .brand-preview/typography.html ;;
  Linux)  xdg-open .brand-preview/typography.html 2>/dev/null || true ;;
  MINGW*|MSYS*|CYGWIN*) start .brand-preview/typography.html ;;
esac
```

Tell the user in conversation:

> I've opened a typography preview with 6 font pairs, each rendered on your chosen palette. Pick 1-6, or say "skip" to default to Inter + JetBrains Mono.

## Why Google Fonts

**Every font in this preview is loaded directly from Google Fonts CDN** via a single `<link>` tag in the HTML head. That means:

- The preview works offline if the user has cached the fonts before
- The preview works even before `pnpm install` has run
- The font in the preview matches exactly what `next/font/google` will serve in production
- No paid licenses, no self-hosting, no CORS issues

The list of fonts in the preview is pulled from `typography-pairings.md` — if a new pair is added there, add its fonts to the Google Fonts URL in the template below.

## The HTML template

Self-contained. No JS dependencies. Light/dark toggle. Drop-in fill with 6 font pair objects.

```html
<!doctype html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Typography picker — {{PROJECT_NAME}}</title>

  <!-- Load all candidate fonts from Google Fonts.
       The skill swaps this URL based on which 6 pairs were picked.
       Default (all 9 pairs covered):  -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500&family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&family=Space+Grotesk:wght@400;500;600;700&family=Space+Mono:wght@400;700&family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&family=Manrope:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

  <style>
    :root {
      /* Palette tokens are filled in by the skill.
         These are the CHOSEN palette's tokens — dark mode by default. */
      --bg: {{BG}};
      --fg: {{FG}};
      --card: {{CARD}};
      --card-fg: {{CARD_FG}};
      --primary: {{PRIMARY}};
      --primary-fg: {{PRIMARY_FG}};
      --muted: {{MUTED}};
      --muted-fg: {{MUTED_FG}};
      --border: {{BORDER}};
      --radius: 10px;
    }

    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; background: var(--bg); color: var(--fg); }

    .topbar {
      position: sticky; top: 0; z-index: 10;
      backdrop-filter: blur(12px);
      background: color-mix(in oklch, var(--bg) 85%, transparent);
      border-bottom: 1px solid var(--border);
      padding: 16px 24px;
      display: flex; align-items: center; justify-content: space-between;
      font-family: 'Inter', system-ui, sans-serif;
    }
    .topbar h1 { margin: 0; font-size: 15px; font-weight: 600; letter-spacing: -0.01em; }
    .topbar .hint { font-size: 13px; opacity: 0.66; margin: 0; }
    .topbar .toggle {
      border: 1px solid var(--border);
      background: transparent;
      color: var(--fg);
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 13px;
      cursor: pointer;
      font-family: inherit;
    }
    .topbar .toggle:hover { background: color-mix(in oklch, var(--fg) 6%, transparent); }

    .container {
      max-width: 960px;
      margin: 0 auto;
      padding: 32px 24px 80px;
      display: grid;
      gap: 32px;
    }

    .pair {
      border-radius: 16px;
      background: var(--card);
      border: 1px solid var(--border);
      padding: 28px 32px;
      color: var(--card-fg);
    }

    .pair-header {
      display: flex; align-items: baseline; gap: 12px;
      margin-bottom: 20px;
      padding-bottom: 14px;
      border-bottom: 1px solid var(--border);
      font-family: 'Inter', system-ui, sans-serif;
    }
    .pair-number {
      display: inline-flex; align-items: center; justify-content: center;
      width: 28px; height: 28px; border-radius: 999px;
      background: var(--primary); color: var(--primary-fg);
      font-weight: 600; font-size: 13px;
      flex-shrink: 0;
    }
    .pair-name { margin: 0; font-size: 17px; font-weight: 600; letter-spacing: -0.01em; }
    .pair-fonts { margin-left: auto; font-size: 12px; opacity: 0.66; font-variant: all-small-caps; letter-spacing: 0.06em; }

    /* Per-pair font assignment.
       The skill sets --pair-sans, --pair-mono, --pair-serif for each .pair
       via inline style attributes — see the "filling the template" section below. */

    .sample-display {
      font-family: var(--pair-serif, var(--pair-sans));
      font-size: 36px;
      font-weight: 600;
      letter-spacing: -0.02em;
      line-height: 1.1;
      margin: 0 0 16px;
    }
    .sample-h1 {
      font-family: var(--pair-sans);
      font-size: 22px;
      font-weight: 600;
      letter-spacing: -0.01em;
      margin: 0 0 8px;
    }
    .sample-body {
      font-family: var(--pair-sans);
      font-size: 14px;
      line-height: 1.55;
      margin: 0 0 16px;
      opacity: 0.88;
    }
    .sample-caption {
      font-family: var(--pair-sans);
      font-size: 11px;
      opacity: 0.62;
      letter-spacing: 0.02em;
      margin: 0 0 12px;
    }
    .sample-number {
      font-family: var(--pair-mono);
      font-size: 24px;
      font-weight: 600;
      font-variant-numeric: tabular-nums;
      margin: 0;
    }
    .sample-mono {
      font-family: var(--pair-mono);
      font-size: 12px;
      opacity: 0.78;
      margin: 6px 0 0;
      letter-spacing: 0;
    }

    .sample-button {
      font-family: var(--pair-sans);
      font-size: 13px;
      font-weight: 500;
      padding: 8px 16px;
      background: var(--primary);
      color: var(--primary-fg);
      border: none;
      border-radius: var(--radius);
      cursor: pointer;
      margin-top: 8px;
    }

    .sample-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      align-items: start;
    }
    @media (max-width: 720px) { .sample-grid { grid-template-columns: 1fr; } }

    .sample-card {
      padding: 14px 16px;
      background: color-mix(in oklch, var(--fg) 6%, transparent);
      border: 1px solid var(--border);
      border-radius: var(--radius);
    }

    .footer-cta {
      text-align: center;
      padding: 24px;
      opacity: 0.72;
      font-size: 14px;
      font-family: 'Inter', system-ui, sans-serif;
      color: var(--fg);
    }
    .footer-cta code {
      font-family: 'JetBrains Mono', ui-monospace, monospace;
      background: color-mix(in oklch, var(--fg) 10%, transparent);
      padding: 2px 6px;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <div class="topbar">
    <div>
      <h1>Typography picker — {{PROJECT_NAME}}</h1>
      <p class="hint">Rendered on your chosen palette: {{PALETTE_NAME}}</p>
    </div>
    <button class="toggle" id="theme-toggle">Switch to Light</button>
  </div>

  <div class="container">

    <!-- REPEAT 6 TIMES — one per candidate font pair.
         The skill injects the right --pair-sans, --pair-mono, --pair-serif
         via the inline style on .pair. -->

    <article class="pair" style="
      --pair-sans: 'Inter', system-ui, sans-serif;
      --pair-mono: 'JetBrains Mono', ui-monospace, monospace;
      --pair-serif: none;
    ">
      <header class="pair-header">
        <span class="pair-number">1</span>
        <h2 class="pair-name">Inter + JetBrains Mono</h2>
        <span class="pair-fonts">technical · neutral · trusted</span>
      </header>

      <h1 class="sample-display">{{DISPLAY_SAMPLE}}</h1>
      <h2 class="sample-h1">{{PROJECT_NAME}}</h2>
      <p class="sample-body">{{PROJECT_DESCRIPTION}}</p>

      <div class="sample-grid">
        <div>
          <p class="sample-caption">BALANCE</p>
          <p class="sample-number">124.8231 SOL</p>
          <p class="sample-mono">7xKX...p2aB</p>
          <button class="sample-button">Primary action</button>
        </div>
        <div class="sample-card">
          <p class="sample-caption">RECENT</p>
          <p class="sample-number" style="font-size: 18px;">+12.45 USDC</p>
          <p class="sample-mono">2m ago · confirmed</p>
        </div>
      </div>
    </article>

    <!-- END REPEAT -->

    <div class="footer-cta">
      Pick one: type <code>1</code> through <code>6</code> in Claude Code.<br />
      Not sure? Type <code>skip</code> — I'll default to <strong>Inter + JetBrains Mono</strong>.
    </div>
  </div>

  <script>
    // Light/dark toggle swaps the palette tokens.
    // The skill injects both dark and light token sets via data-dark / data-light
    // attributes on the <html> or a root div, the toggle script swaps them.
    const root = document.documentElement;
    const btn = document.getElementById('theme-toggle');
    const darkTokens = `{{DARK_TOKENS_CSS}}`;
    const lightTokens = `{{LIGHT_TOKENS_CSS}}`;
    function applyTokens(theme) {
      const styleEl = document.getElementById('palette-tokens') || (() => {
        const s = document.createElement('style');
        s.id = 'palette-tokens';
        document.head.appendChild(s);
        return s;
      })();
      styleEl.textContent = `:root { ${theme === 'dark' ? darkTokens : lightTokens} }`;
    }
    applyTokens('dark');
    btn.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      btn.textContent = next === 'dark' ? 'Switch to Light' : 'Switch to Dark';
      applyTokens(next);
    });
  </script>
</body>
</html>
```

## How to fill the template

For each of the 6 candidate pairs, create an `<article class="pair">` block with:

1. **Inline `style=""`** setting `--pair-sans`, `--pair-mono`, and (if applicable) `--pair-serif` to the Google Font names in single quotes with proper fallbacks.
2. **`<span class="pair-number">`** set to 1 through 6.
3. **`<h2 class="pair-name">`** with the human-readable pair name (e.g., "Inter + JetBrains Mono").
4. **`<span class="pair-fonts">`** with the mood-tags (e.g., "technical · neutral · trusted").
5. **The sample body** — same structure across all 6 pairs (`.sample-display`, `.sample-h1`, `.sample-body`, numbers, button, card).

The sample content (`{{DISPLAY_SAMPLE}}`, `{{PROJECT_NAME}}`, `{{PROJECT_DESCRIPTION}}`, numbers) is **identical across all 6 pairs** — only the fonts change. That's what makes comparison real.

### Sample content by category

Keep the `{{DISPLAY_SAMPLE}}` copy short and specific to the project. Examples:

| Category | Display sample |
|---|---|
| Wallet | `"$12,483.50"` (big tabular number — shows mono font well) |
| Swap | `"100 USDC → 0.64 SOL"` (shows arrow, multiple fonts) |
| Staking | `"4.2% APY"` (shows how percents render) |
| NFT | Hero name like `"Mad Lads #4821"` |
| Dashboard | Big number like `"$1.24B TVL"` |
| Social | Short tagline `"Trade together."` |
| Generic | Project name in display weight |

The rest of the sample body — `{{PROJECT_NAME}}`, `{{PROJECT_DESCRIPTION}}`, numeric samples, button — stays fixed across pairs.

## Pair-to-fonts mapping

When writing each `.pair` block, use these exact CSS values in the inline style:

| Pair | --pair-sans | --pair-mono | --pair-serif |
|---|---|---|---|
| A (Inter + JBM) | `'Inter', system-ui, sans-serif` | `'JetBrains Mono', ui-monospace, monospace` | *(none)* |
| B (Geist + Geist Mono) | `'Geist', system-ui, sans-serif` | `'Geist Mono', ui-monospace, monospace` | *(none)* |
| C (Instrument Serif + Inter + JBM) | `'Inter', system-ui, sans-serif` | `'JetBrains Mono', ui-monospace, monospace` | `'Instrument Serif', Georgia, serif` |
| D (DM Sans + DM Mono) | `'DM Sans', system-ui, sans-serif` | `'DM Mono', ui-monospace, monospace` | *(none)* |
| E (Space Grotesk + Space Mono) | `'Space Grotesk', system-ui, sans-serif` | `'Space Mono', ui-monospace, monospace` | *(none)* |
| F (Fraunces + Inter + Plex Mono) | `'Inter', system-ui, sans-serif` | `'IBM Plex Mono', ui-monospace, monospace` | `'Fraunces', Georgia, serif` |
| G (IBM Plex Sans + Plex Mono) | `'IBM Plex Sans', system-ui, sans-serif` | `'IBM Plex Mono', ui-monospace, monospace` | *(none)* |
| H (Manrope + JBM) | `'Manrope', system-ui, sans-serif` | `'JetBrains Mono', ui-monospace, monospace` | *(none)* |
| I (Plus Jakarta + JBM) | `'Plus Jakarta Sans', system-ui, sans-serif` | `'JetBrains Mono', ui-monospace, monospace` | *(none)* |

Every font appears in the Google Fonts `<link>` URL at the top of the HTML — no need to edit it unless a new pair is added that introduces a new font.

## User response parsing

After opening the preview, wait for the user's next message and parse the intent (same loop pattern as the palette picker):

| Pattern | Intent | Action |
|---|---|---|
| `<number>` (1-6), "I'll take N", "the Nth one", "N" | **Pick** | Wire that pair into `app/layout.tsx`, move to step 7 |
| "skip", "neither", "no", or any unclear answer | **Default** | Use Pair A (Inter + JBM) without re-asking, tell the user "defaulting to Inter + JBM", move to step 7 |
| "more" / "show me all" | **Expand** | Re-write the preview with all 9 pairs instead of 6 |
| Ambiguous | **Clarify** | Ask: "Pick 1-6, or say 'skip' for the Inter default." |

No regenerate loop for typography — unlike palettes, there are only 9 options total, and re-rolling doesn't make sense. Either pick one, expand to see all 9, or accept the default.

## After the pick

Once a pair is selected:

1. Tell the user which pair they picked (including "defaulting to Inter" if they skipped).
2. Continue to step 7 of the brand-design workflow (font wiring into `app/layout.tsx`, CSS variables, tailwind config).
3. The `.brand-preview/typography.html` file stays on disk — useful if the user wants to re-check before the end of the session. The final cleanup step mentions deleting `.brand-preview/` entirely.
