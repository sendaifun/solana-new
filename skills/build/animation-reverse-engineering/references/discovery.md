# Discovering a reference

Use this when the user wants "a great animation" but has no reference yet.
Discovery is a human step — the AI can't browse taste for them — so hand the
user this list, let them hunt for 10 minutes, and have them bring back a link
or screen recording. Then continue the pipeline at Phase 1 (Acquire).

## Curated animation libraries

| Source | What it's good for | How to search |
| --- | --- | --- |
| [60fps.design](https://60fps.design) | The single best curated library of app animations, tagged by pattern | Browse tags: onboarding, transitions, empty states, charts… |
| [Mobbin](https://mobbin.com) | Screen recordings of real shipped apps — full flows, not concept art | Search by app or pattern ("checkout", "paywall") |
| [Dribbble](https://dribbble.com) | Concept-quality motion shots, most are video/mp4 | Search "`<pattern>` animation" — e.g. "card stack animation" |
| [Pinterest](https://pinterest.com) | Surprisingly rich goldmine of UI motion pins (GIF/video) | Search "ui animation", "micro interaction" — follow pins to source |
| [Awwwards](https://awwwards.com) | Motion-heavy award-winning websites | Browse Site of the Day; screen-record the bits you like |
| [Godly.website](https://godly.website) | Curated web design with strong motion | Browse; screen-record |
| [Codrops](https://tympanus.net/codrops) | Web motion demos **with source code** — sometimes no reverse-engineering needed | Search the playground/demos |

## X accounts worth mining

| Account | Why |
| --- | --- |
| [@60fpsdesign](https://x.com/60fpsdesign) | Daily curated best-in-class app animations |
| [@emilkowalski_](https://x.com/emilkowalski_) | Interaction design engineering — component motion done right |
| [@raunofreiberg](https://x.com/raunofreiberg) | Interface craft experiments (ui.land) |
| [@jh3yy](https://x.com/jh3yy) | CSS/web motion wizardry, often with code |
| [@jsngr](https://x.com/jsngr) | Playful product & interaction demos |
| [@mobbin](https://x.com/mobbin) | Pattern threads from real apps |
| [@dribbble](https://x.com/dribbble) | Aggregated top shots |

Tip: search X itself — `"animation" filter:videos min_faves:500` plus a keyword
("onboarding", "ticker", "slider") surfaces reference-quality clips fast.

## Search phrases that work

`onboarding animation`, `number ticker`, `pull to refresh`, `card stack`,
`tab bar animation`, `chart reveal`, `text sweep`, `stagger list`,
`drag interaction`, `scrubber`, `empty state animation`, `success state`.

## Capturing what they find

- **X/Twitter links** — `yt-dlp` downloads them directly (Phase 1 handles this).
- **Dribbble shots** — the underlying mp4 is usually `curl`-able from the page.
- **Mobbin / Awwwards / live sites** — ask the user for a screen recording
  (macOS: ⌘⇧5, 60fps; trim to the moment that matters).
- **Pinterest** — follow the pin to its source first; the pin itself is often
  a recompressed GIF (bad for frame-level dissection).

Prefer sources at native frame rate — a 60fps capture dissects cleanly; a
15fps GIF hides easing and stagger detail.
