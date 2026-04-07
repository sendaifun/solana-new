# Slide Templates — Mix and Match

Production-ready HTML for every slide type. Uses the design system from `deck-design-system.md`. Copy, customize props, arrange in order.

---

## 1. Title Slide

The first thing anyone sees. Must communicate: who you are, what you do, and create intrigue — in under 5 seconds.

```html
<div class="slide bg-alt" style="justify-content: center; align-items: center; text-align: center;">
  <!-- Optional: Logo above name -->
  <!-- <img src="logo.svg" style="height: 64px; margin-bottom: 32px;" class="animate-in"> -->

  <h1 class="hero text-emphasis animate-in">{{PROJECT_NAME}}</h1>

  <p class="h3 animate-in" style="color: var(--c-text-secondary); margin-top: 24px; max-width: 700px;">
    {{ONE_LINE_DESCRIPTION}}
  </p>

  <div class="animate-in" style="margin-top: 48px; display: flex; gap: 16px;">
    <span class="badge badge-primary">{{CATEGORY}}</span>
    <span class="badge badge-accent">{{STAGE}}</span>
  </div>

  <div class="notes">
    Open with the bar test: "{{PROJECT_NAME}} does {{WHAT}} for {{WHO}} so they can {{OUTCOME}}."
    Don't explain everything — create enough intrigue to hold attention for the next slide.
  </div>
</div>
```

---

## 2. Problem Slide

Make the audience feel the pain. No jargon. Real human frustration.

```html
<div class="slide bg-default">
  <span class="caption animate-in">THE PROBLEM</span>

  <h1 class="h1 animate-in" style="margin-top: 16px; max-width: 900px;">
    {{PROBLEM_HEADLINE}}
  </h1>

  <div class="divider animate-in"></div>

  <ul class="bullet-list animate-in" style="max-width: 800px;">
    <li>{{PAIN_POINT_1}}</li>
    <li>{{PAIN_POINT_2}}</li>
    <li>{{PAIN_POINT_3}}</li>
  </ul>

  <div class="notes">
    This is the most important slide after the title. Audience must nod along.
    Use specific numbers: "costs $X", "takes Y hours", "fails Z% of the time".
    Don't rush to the solution — let the problem breathe.
  </div>
</div>
```

### Problem Variant: Quote-Led

```html
<div class="slide bg-default">
  <span class="caption animate-in">THE PROBLEM</span>

  <div class="quote-block animate-in" style="margin-top: 24px;">
    <p class="h3" style="font-style: italic; color: var(--c-text);">
      "{{REAL_USER_QUOTE_ABOUT_THE_PAIN}}"
    </p>
    <p class="small" style="margin-top: 16px; color: var(--c-text-muted);">
      — {{ATTRIBUTION}}, {{ROLE}}
    </p>
  </div>

  <p class="body animate-in" style="margin-top: 32px; max-width: 800px;">
    {{BROADER_PROBLEM_CONTEXT}}
  </p>

  <div class="notes">
    Leading with a real user quote makes the problem undeniable.
    The quote should be something the audience has felt themselves.
  </div>
</div>
```

---

## 3. Why Now Slide

Sequoia's most overlooked and most important slide. What changed that makes this the right moment?

```html
<div class="slide bg-alt">
  <span class="caption animate-in">WHY NOW</span>

  <h1 class="h1 animate-in" style="margin-top: 16px;">
    {{WHY_NOW_HEADLINE}}
  </h1>

  <div class="divider animate-in"></div>

  <div class="grid-3 animate-in" style="margin-top: 32px;">
    <div class="card">
      <p class="caption" style="color: var(--c-primary);">MARKET SHIFT</p>
      <p class="h3" style="margin-top: 12px;">{{MARKET_CATALYST}}</p>
      <p class="small" style="margin-top: 8px;">{{MARKET_DETAIL}}</p>
    </div>
    <div class="card">
      <p class="caption" style="color: var(--c-primary);">TECH UNLOCK</p>
      <p class="h3" style="margin-top: 12px;">{{TECH_CATALYST}}</p>
      <p class="small" style="margin-top: 8px;">{{TECH_DETAIL}}</p>
    </div>
    <div class="card">
      <p class="caption" style="color: var(--c-primary);">TIMING</p>
      <p class="h3" style="margin-top: 12px;">{{TIMING_CATALYST}}</p>
      <p class="small" style="margin-top: 8px;">{{TIMING_DETAIL}}</p>
    </div>
  </div>

  <div class="notes">
    This answers "why hasn't someone done this already?" and "why will this work now?"
    Common catalysts: new regulation (MiCA), tech breakthrough (compressed NFTs),
    market maturity (institutional on-ramps), behavior shift (mobile-first wallets).
  </div>
</div>
```

---

## 4. Solution Slide

What you built. Keep it simple — one clear value proposition.

```html
<div class="slide bg-default">
  <span class="caption animate-in">THE SOLUTION</span>

  <h1 class="h1 animate-in" style="margin-top: 16px; max-width: 900px;">
    {{SOLUTION_HEADLINE}}
  </h1>

  <div class="divider animate-in"></div>

  <div class="grid-3 animate-in" style="margin-top: 32px;">
    <div class="card" style="text-align: center;">
      <div style="font-size: 48px; margin-bottom: 16px;">{{ICON_1}}</div>
      <p class="h3">{{FEATURE_1_TITLE}}</p>
      <p class="small" style="margin-top: 8px;">{{FEATURE_1_DESC}}</p>
    </div>
    <div class="card" style="text-align: center;">
      <div style="font-size: 48px; margin-bottom: 16px;">{{ICON_2}}</div>
      <p class="h3">{{FEATURE_2_TITLE}}</p>
      <p class="small" style="margin-top: 8px;">{{FEATURE_2_DESC}}</p>
    </div>
    <div class="card" style="text-align: center;">
      <div style="font-size: 48px; margin-bottom: 16px;">{{ICON_3}}</div>
      <p class="h3">{{FEATURE_3_TITLE}}</p>
      <p class="small" style="margin-top: 8px;">{{FEATURE_3_DESC}}</p>
    </div>
  </div>

  <div class="notes">
    Max 3 features. If you need more, you're not focused enough.
    Each feature should solve a specific pain from the Problem slide.
    Icons: use emoji or simple SVG. Don't use generic tech icons.
  </div>
</div>
```

---

## 5. Demo / Product Slide

Show the product. Screenshot > wireframe > description.

```html
<div class="slide" style="padding: 60px;">
  <div class="flex gap-xl items-center" style="height: 100%;">
    <!-- Left: Product image -->
    <div class="flex-1 animate-in">
      <div style="
        background: var(--c-bg-card);
        border: 1px solid var(--c-border);
        border-radius: 16px;
        padding: 16px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      ">
        <img src="{{SCREENSHOT_URL}}" style="width: 100%; border-radius: 8px;" alt="Product screenshot">
      </div>
    </div>

    <!-- Right: Callouts -->
    <div class="flex-1 flex flex-col gap-md animate-in">
      <span class="caption">PRODUCT</span>
      <h2 class="h2">{{PRODUCT_HEADLINE}}</h2>

      <div class="flex flex-col gap-sm" style="margin-top: 16px;">
        <div class="flex items-center gap-sm">
          <span class="check" style="font-size: 24px;">✓</span>
          <span class="body">{{CALLOUT_1}}</span>
        </div>
        <div class="flex items-center gap-sm">
          <span class="check" style="font-size: 24px;">✓</span>
          <span class="body">{{CALLOUT_2}}</span>
        </div>
        <div class="flex items-center gap-sm">
          <span class="check" style="font-size: 24px;">✓</span>
          <span class="body">{{CALLOUT_3}}</span>
        </div>
      </div>
    </div>
  </div>

  <div class="notes">
    If you have a working demo, this is where you show it.
    Screenshot should be real product UI, not a mockup.
    Callouts should map 1:1 to pain points from the Problem slide.
  </div>
</div>
```

---

## 6. Why Crypto / Why Solana Slide

The "blockchain necessity test." If you remove the blockchain, does the product still work? If yes, you're in trouble.

```html
<div class="slide bg-default">
  <span class="caption animate-in">WHY SOLANA</span>

  <h1 class="h1 animate-in" style="margin-top: 16px;">
    {{WHY_CRYPTO_HEADLINE}}
  </h1>

  <div class="divider animate-in"></div>

  <div class="grid-2 animate-in" style="margin-top: 32px;">
    <!-- Without crypto -->
    <div class="card" style="border-color: rgba(233,69,96,0.2);">
      <p class="caption" style="color: var(--c-danger);">WITHOUT BLOCKCHAIN</p>
      <ul class="bullet-list" style="margin-top: 16px;">
        <li>{{WITHOUT_1}}</li>
        <li>{{WITHOUT_2}}</li>
        <li>{{WITHOUT_3}}</li>
      </ul>
    </div>

    <!-- With Solana -->
    <div class="card-glow">
      <p class="caption" style="color: var(--c-accent);">WITH SOLANA</p>
      <ul class="bullet-list" style="margin-top: 16px;">
        <li style="color: var(--c-text);">{{WITH_1}}</li>
        <li style="color: var(--c-text);">{{WITH_2}}</li>
        <li style="color: var(--c-text);">{{WITH_3}}</li>
      </ul>
    </div>
  </div>

  <div class="notes">
    This must be SPECIFIC. Not "decentralization" — that's generic.
    Good: "Composable payments — any agent can settle with any other without integration."
    Good: "Permissionless access — no bank account, no KYC, no 3-day settlement."
    If you can't fill this convincingly, reconsider the crypto angle.
  </div>
</div>
```

---

## 7. Traction Slide

Numbers are the most persuasive content in a pitch. Show momentum.

```html
<div class="slide bg-alt">
  <span class="caption animate-in">TRACTION</span>

  <h1 class="h1 animate-in" style="margin-top: 16px;">
    {{TRACTION_HEADLINE}}
  </h1>

  <div class="divider animate-in"></div>

  <!-- Metric cards row -->
  <div class="grid-4 animate-in" style="margin-top: 32px;">
    <div class="metric-card">
      <div class="metric-value">{{METRIC_1_VALUE}}</div>
      <div class="metric-label">{{METRIC_1_LABEL}}</div>
    </div>
    <div class="metric-card">
      <div class="metric-value">{{METRIC_2_VALUE}}</div>
      <div class="metric-label">{{METRIC_2_LABEL}}</div>
    </div>
    <div class="metric-card">
      <div class="metric-value">{{METRIC_3_VALUE}}</div>
      <div class="metric-label">{{METRIC_3_LABEL}}</div>
    </div>
    <div class="metric-card">
      <div class="metric-value">{{METRIC_4_VALUE}}</div>
      <div class="metric-label">{{METRIC_4_LABEL}}</div>
    </div>
  </div>

  <!-- Growth chart (CSS-only bars) -->
  <div class="animate-in" style="margin-top: 48px;">
    <div class="flex items-center gap-md" style="height: 120px; align-items: flex-end;">
      {{GROWTH_BARS}}
      <!-- Generate bars like: -->
      <!-- <div style="flex:1; background: linear-gradient(0deg, var(--c-primary), var(--c-accent)); height: 20%; border-radius: 6px 6px 0 0;"></div> -->
      <!-- <div style="flex:1; background: linear-gradient(0deg, var(--c-primary), var(--c-accent)); height: 45%; border-radius: 6px 6px 0 0;"></div> -->
      <!-- etc. with increasing heights -->
    </div>
    <div class="flex justify-between" style="margin-top: 8px;">
      <span class="caption">{{PERIOD_START}}</span>
      <span class="caption">{{PERIOD_END}}</span>
    </div>
  </div>

  <div class="notes">
    Lead with the strongest metric. On-chain metrics > vanity metrics.
    DAU > total signups. Retention > growth rate. Revenue > TVL.
    If pre-launch: show waitlist, LOIs, pilot users, testnet activity.
  </div>
</div>
```

---

## 8. Market Slide

Bottom-up, not top-down. Never say "crypto is a $2T market."

```html
<div class="slide bg-default">
  <span class="caption animate-in">MARKET</span>

  <h1 class="h1 animate-in" style="margin-top: 16px;">
    {{MARKET_HEADLINE}}
  </h1>

  <div class="divider animate-in"></div>

  <div class="flex gap-xl animate-in" style="margin-top: 32px; align-items: flex-start;">
    <!-- TAM/SAM/SOM circles -->
    <div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 24px;">
      <div style="position: relative; width: 320px; height: 320px;">
        <!-- TAM (outermost) -->
        <div style="
          position: absolute; inset: 0; border-radius: 50%;
          border: 2px solid var(--c-border);
          display: flex; justify-content: center; align-items: center;
        ">
          <span class="caption" style="position: absolute; top: 12px;">TAM {{TAM_VALUE}}</span>
        </div>
        <!-- SAM -->
        <div style="
          position: absolute; inset: 50px; border-radius: 50%;
          border: 2px solid rgba(153,69,255,0.3);
          background: var(--c-primary-dim);
        ">
          <span class="caption" style="position: absolute; top: 12px; left: 50%; transform: translateX(-50%);">SAM {{SAM_VALUE}}</span>
        </div>
        <!-- SOM -->
        <div style="
          position: absolute; inset: 100px; border-radius: 50%;
          background: var(--c-primary-dim);
          display: flex; justify-content: center; align-items: center;
        ">
          <span class="h3 text-accent">{{SOM_VALUE}}</span>
        </div>
      </div>
    </div>

    <!-- Right: Bottom-up math -->
    <div style="flex: 1;">
      <p class="h3" style="margin-bottom: 24px;">Bottom-Up Calculation</p>
      <div class="flex flex-col gap-sm">
        <div class="flex justify-between" style="padding: 12px 0; border-bottom: 1px solid var(--c-border);">
          <span class="body">{{CALC_LINE_1_LABEL}}</span>
          <span class="h3 text-accent">{{CALC_LINE_1_VALUE}}</span>
        </div>
        <div class="flex justify-between" style="padding: 12px 0; border-bottom: 1px solid var(--c-border);">
          <span class="body">{{CALC_LINE_2_LABEL}}</span>
          <span class="h3 text-accent">{{CALC_LINE_2_VALUE}}</span>
        </div>
        <div class="flex justify-between" style="padding: 12px 0; border-bottom: 1px solid var(--c-border);">
          <span class="body">{{CALC_LINE_3_LABEL}}</span>
          <span class="h3 text-accent">{{CALC_LINE_3_VALUE}}</span>
        </div>
        <div class="flex justify-between" style="padding: 16px 0;">
          <span class="h3">Year 1 Revenue</span>
          <span class="h2 text-accent">{{YEAR_1_REVENUE}}</span>
        </div>
      </div>
    </div>
  </div>

  <div class="notes">
    NEVER use top-down sizing ("crypto is $2T, we capture 1%").
    Bottom-up: "X potential users × Y revenue/user × Z conversion rate = addressable revenue."
    SAM should be defensible. SOM should be achievable in 12-18 months.
  </div>
</div>
```

---

## 9. Competition Slide

Show you know the landscape. Position clearly.

```html
<div class="slide">
  <span class="caption animate-in">COMPETITION</span>

  <h1 class="h1 animate-in" style="margin-top: 16px;">
    {{COMPETITION_HEADLINE}}
  </h1>

  <div class="divider animate-in"></div>

  <table class="comparison-table animate-in" style="margin-top: 32px;">
    <thead>
      <tr>
        <th style="width: 180px;">Feature</th>
        <th>{{COMPETITOR_1}}</th>
        <th>{{COMPETITOR_2}}</th>
        <th>{{COMPETITOR_3}}</th>
        <th style="color: var(--c-accent);">{{YOUR_PRODUCT}}</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>{{FEATURE_1}}</td>
        <td class="cross">✗</td>
        <td class="check">✓</td>
        <td class="cross">✗</td>
        <td class="check">✓</td>
      </tr>
      <tr>
        <td>{{FEATURE_2}}</td>
        <td class="check">✓</td>
        <td class="cross">✗</td>
        <td class="cross">✗</td>
        <td class="check">✓</td>
      </tr>
      <tr>
        <td>{{FEATURE_3}}</td>
        <td class="cross">✗</td>
        <td class="cross">✗</td>
        <td class="check">✓</td>
        <td class="check">✓</td>
      </tr>
      <tr class="highlight">
        <td>{{DIFFERENTIATOR}}</td>
        <td class="cross">✗</td>
        <td class="cross">✗</td>
        <td class="cross">✗</td>
        <td class="check">✓</td>
      </tr>
    </tbody>
  </table>

  <div class="notes">
    Never say "no competition" — it means no market.
    The highlighted row must be your unique differentiator.
    Be honest about competitor strengths. Credibility > cheerleading.
  </div>
</div>
```

---

## 10. Business Model Slide

How you make money. Must be specific.

```html
<div class="slide bg-default">
  <span class="caption animate-in">BUSINESS MODEL</span>

  <h1 class="h1 animate-in" style="margin-top: 16px;">
    {{BUSINESS_MODEL_HEADLINE}}
  </h1>

  <div class="divider animate-in"></div>

  <div class="grid-2 animate-in" style="margin-top: 32px;">
    <!-- Revenue streams -->
    <div>
      <p class="h3" style="margin-bottom: 24px;">Revenue Streams</p>
      <div class="flex flex-col gap-sm">
        <div class="card" style="padding: 24px;">
          <div class="flex justify-between items-center">
            <div>
              <p class="h3">{{STREAM_1_NAME}}</p>
              <p class="small">{{STREAM_1_DESC}}</p>
            </div>
            <span class="h2 text-accent">{{STREAM_1_AMOUNT}}</span>
          </div>
        </div>
        <div class="card" style="padding: 24px;">
          <div class="flex justify-between items-center">
            <div>
              <p class="h3">{{STREAM_2_NAME}}</p>
              <p class="small">{{STREAM_2_DESC}}</p>
            </div>
            <span class="h2 text-accent">{{STREAM_2_AMOUNT}}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Unit economics -->
    <div>
      <p class="h3" style="margin-bottom: 24px;">Unit Economics</p>
      <div class="card-glow">
        <div class="flex flex-col gap-sm">
          <div class="flex justify-between" style="padding-bottom: 12px; border-bottom: 1px solid var(--c-border);">
            <span class="body">Revenue per user</span>
            <span class="h3 text-accent">{{RPU}}</span>
          </div>
          <div class="flex justify-between" style="padding-bottom: 12px; border-bottom: 1px solid var(--c-border);">
            <span class="body">Cost per user (incl. gas)</span>
            <span class="h3">{{CPU}}</span>
          </div>
          <div class="flex justify-between" style="padding-top: 8px;">
            <span class="h3">Margin</span>
            <span class="h2 text-accent">{{MARGIN}}</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="notes">
    2026 VCs require unit economics that account for gas costs.
    "Free now, monetize later" is not a business model.
    Show path to profitability, not just revenue.
  </div>
</div>
```

---

## 11. Team Slide

```html
<div class="slide">
  <span class="caption animate-in">TEAM</span>
  <h1 class="h1 animate-in" style="margin-top: 16px;">{{TEAM_HEADLINE}}</h1>
  <div class="divider animate-in"></div>

  <div class="grid-3 animate-in" style="margin-top: 32px;">
    <div class="card" style="text-align: center; padding: 32px;">
      <div style="
        width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 16px;
        background: var(--c-primary);
        display: flex; justify-content: center; align-items: center;
        font-size: 32px; font-weight: 800;
      ">{{MEMBER_1_INITIALS}}</div>
      <p class="h3">{{MEMBER_1_NAME}}</p>
      <p class="small text-primary" style="margin-top: 4px;">{{MEMBER_1_ROLE}}</p>
      <p class="small" style="margin-top: 12px;">{{MEMBER_1_CREDENTIAL}}</p>
    </div>
    <!-- Repeat for members 2 and 3 -->
  </div>

  <div class="notes">
    Credentials that matter: shipped X, scaled Y, domain expert in Z.
    NOT: "passionate about blockchain", "10 years in tech".
    If early-stage, emphasize builder speed over resume.
  </div>
</div>
```

---

## 12. Ask Slide

The most important slide for conversion. Be specific.

```html
<div class="slide bg-alt" style="justify-content: center; align-items: center; text-align: center;">
  <span class="caption animate-in">THE ASK</span>

  <h1 class="hero animate-in" style="margin-top: 24px;">
    <span class="text-accent">{{ASK_AMOUNT}}</span>
  </h1>

  <p class="h3 animate-in" style="color: var(--c-text-secondary); margin-top: 16px;">
    {{ASK_TYPE}} — {{ASK_INSTRUMENT}}
  </p>

  <div class="divider animate-in" style="margin: 32px auto;"></div>

  <div class="animate-in" style="max-width: 600px;">
    <p class="h3" style="margin-bottom: 24px;">Use of Funds</p>
    <div class="flex flex-col gap-sm w-full">
      <div>
        <div class="flex justify-between" style="margin-bottom: 4px;">
          <span class="body">{{USE_1_LABEL}}</span>
          <span class="small">{{USE_1_PERCENT}}</span>
        </div>
        <div class="progress-bar"><div class="progress-fill" style="width: {{USE_1_PERCENT}};"></div></div>
      </div>
      <div>
        <div class="flex justify-between" style="margin-bottom: 4px;">
          <span class="body">{{USE_2_LABEL}}</span>
          <span class="small">{{USE_2_PERCENT}}</span>
        </div>
        <div class="progress-bar"><div class="progress-fill" style="width: {{USE_2_PERCENT}};"></div></div>
      </div>
      <div>
        <div class="flex justify-between" style="margin-bottom: 4px;">
          <span class="body">{{USE_3_LABEL}}</span>
          <span class="small">{{USE_3_PERCENT}}</span>
        </div>
        <div class="progress-bar"><div class="progress-fill" style="width: {{USE_3_PERCENT}};"></div></div>
      </div>
    </div>
  </div>

  <div class="notes">
    The ask must be specific: amount + instrument (SAFE, equity, grant) + use of funds.
    "Raising $500K SAFE to hire 2 engineers and reach 1K DAU in 6 months."
    Never leave the amount vague. VCs respect clarity.
  </div>
</div>
```

---

## 13. Contact / Closing Slide

```html
<div class="slide bg-alt" style="justify-content: center; align-items: center; text-align: center;">
  <h1 class="hero text-emphasis animate-in">{{PROJECT_NAME}}</h1>

  <p class="h3 animate-in" style="color: var(--c-text-secondary); margin-top: 16px;">
    {{TAGLINE}}
  </p>

  <div class="animate-in" style="margin-top: 48px; display: flex; flex-direction: column; gap: 12px;">
    <p class="body">{{FOUNDER_NAME}} — {{EMAIL}}</p>
    <p class="body text-primary">{{WEBSITE_URL}}</p>
    <p class="body text-muted">{{TWITTER_HANDLE}} · {{GITHUB_URL}}</p>
  </div>

  <div class="notes">
    End with contact info visible. Don't add another CTA or summary.
    The deck should speak for itself. This slide is a bookmark.
  </div>
</div>
```

---

## Optional Slides

### Tokenomics (VC/Grant audiences only)

```html
<div class="slide">
  <span class="caption animate-in">TOKENOMICS</span>
  <h1 class="h1 animate-in" style="margin-top: 16px;">{{TOKEN_HEADLINE}}</h1>
  <div class="divider animate-in"></div>

  <div class="grid-2 animate-in" style="margin-top: 32px;">
    <!-- Distribution -->
    <div>
      <p class="h3" style="margin-bottom: 24px;">Token Distribution</p>
      <div class="flex flex-col gap-xs">
        <div>
          <div class="flex justify-between" style="margin-bottom: 4px;">
            <span class="body">Community / Ecosystem</span>
            <span class="h3 text-accent">40%</span>
          </div>
          <div class="progress-bar"><div class="progress-fill" style="width: 40%;"></div></div>
        </div>
        <!-- Repeat for: Team (15-20%), Investors (15-20%), Treasury (10-15%), Advisors (5%) -->
      </div>
    </div>

    <!-- Utility -->
    <div>
      <p class="h3" style="margin-bottom: 24px;">Token Utility</p>
      <ul class="bullet-list">
        <li>{{UTILITY_1}}</li>
        <li>{{UTILITY_2}}</li>
        <li>{{UTILITY_3}}</li>
      </ul>
    </div>
  </div>

  <div class="notes">
    Token must have real utility — not just governance.
    Show vesting schedule: 1-year cliff for team, 4-year vest.
    Community allocation should be largest bucket.
  </div>
</div>
```

### Roadmap / Timeline

```html
<div class="slide">
  <span class="caption animate-in">ROADMAP</span>
  <h1 class="h1 animate-in" style="margin-top: 16px;">{{ROADMAP_HEADLINE}}</h1>
  <div class="divider animate-in"></div>

  <div class="timeline animate-in" style="margin-top: 32px; max-width: 700px;">
    <div class="timeline-item active">
      <div class="timeline-dot"></div>
      <p class="h3">{{PHASE_1_TITLE}}</p>
      <p class="caption" style="margin: 4px 0;">{{PHASE_1_DATE}}</p>
      <p class="small">{{PHASE_1_DESC}}</p>
    </div>
    <div class="timeline-item">
      <div class="timeline-dot"></div>
      <p class="h3">{{PHASE_2_TITLE}}</p>
      <p class="caption" style="margin: 4px 0;">{{PHASE_2_DATE}}</p>
      <p class="small">{{PHASE_2_DESC}}</p>
    </div>
    <div class="timeline-item">
      <div class="timeline-dot"></div>
      <p class="h3">{{PHASE_3_TITLE}}</p>
      <p class="caption" style="margin: 4px 0;">{{PHASE_3_DATE}}</p>
      <p class="small">{{PHASE_3_DESC}}</p>
    </div>
  </div>

  <div class="notes">
    Max 3-4 phases. Each should have a measurable milestone.
    "Launch mainnet" is vague. "1K DAU on mainnet" is specific.
    Mark current phase as active.
  </div>
</div>
```

---

## Slide Index

| # | Slide | Required | When to Use |
|---|-------|----------|-------------|
| 1 | Title | Always | First slide |
| 2 | Problem | Always | After title |
| 3 | Why Now | Always | After problem (Sequoia's key slide) |
| 4 | Solution | Always | After why now |
| 5 | Demo/Product | Always | After solution (screenshot or live) |
| 6 | Why Crypto/Solana | Always | After demo |
| 7 | Traction | Always | After why-crypto |
| 8 | Market | VC/Grant | Skip for hackathons |
| 9 | Competition | VC/Partner | Skip for hackathons |
| 10 | Business Model | VC | Skip for hackathons/grants |
| 11 | Team | Always | Near the end |
| 12 | Ask | Always | Second to last |
| 13 | Contact | Always | Last slide |
| — | Tokenomics | VC/Grant | Only if token exists |
| — | Roadmap | All | Optional, after traction |
