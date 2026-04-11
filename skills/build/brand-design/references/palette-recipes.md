# Palette Recipes

30 curated palettes organized by `category × mood`. Each has 5 seed colors defined in OKLCH (perceptually uniform) and hex (for display/copy). All have been contrast-verified — every pair passes WCAG AA when expanded to the full shadcn token set via `shadcn-integration.md`.

When the skill is picking candidates for step 2 of the workflow, filter this list by category + mood. Pull 3 matching palettes. If fewer than 3 exact matches exist, expand to adjacent moods (calm ↔ serious, bold ↔ playful, technical ↔ minimal, premium ↔ serious).

---

## Seed format

Every palette defines exactly 5 seeds:

| Role | What it becomes |
|---|---|
| `bg-base` | Page background |
| `bg-elevated` | Card / popover / elevated surface background |
| `primary` | The main brand color (used on primary button, focus ring, accent text) |
| `primary-soft` | A lighter/softer variant of primary (used on hover, badges, muted fills) |
| `fg-base` | Main text color on `bg-base` |

The full 12+ shadcn tokens are derived from these 5 per `shadcn-integration.md`. Dark mode is also derived from the same seeds.

---

## defi

### Midnight Signal
**category:** defi · infra · data
**mood:** technical · serious · trustworthy
**vibe:** A terminal for money. Cold, sharp, never frivolous.

| Role | OKLCH | Hex |
|---|---|---|
| bg-base | `oklch(0.14 0.02 265)` | `#0A0E1A` |
| bg-elevated | `oklch(0.19 0.02 265)` | `#141A29` |
| primary | `oklch(0.72 0.17 250)` | `#5B8DEF` |
| primary-soft | `oklch(0.82 0.11 250)` | `#9AB8F5` |
| fg-base | `oklch(0.96 0.01 265)` | `#F1F3F8` |

### Forest Stake
**category:** defi · staking
**mood:** calm · trustworthy · serious
**vibe:** Money that grows. Earthy, grounded, patient.

| Role | OKLCH | Hex |
|---|---|---|
| bg-base | `oklch(0.13 0.015 150)` | `#08120C` |
| bg-elevated | `oklch(0.18 0.02 150)` | `#0F1E16` |
| primary | `oklch(0.72 0.17 155)` | `#2DB67E` |
| primary-soft | `oklch(0.84 0.12 155)` | `#6FDAA9` |
| fg-base | `oklch(0.96 0.01 150)` | `#F0F5F2` |

### Sunset Trade
**category:** defi · dex · trading
**mood:** warm · bold · energetic
**vibe:** A trading desk at golden hour. Active, warm, decisive.

| Role | OKLCH | Hex |
|---|---|---|
| bg-base | `oklch(0.13 0.01 30)` | `#15100D` |
| bg-elevated | `oklch(0.18 0.02 30)` | `#1F1712` |
| primary | `oklch(0.70 0.19 40)` | `#EC7A3A` |
| primary-soft | `oklch(0.82 0.14 40)` | `#F5A877` |
| fg-base | `oklch(0.97 0.01 60)` | `#F6F3EE` |

### Vault Blue
**category:** defi · lending · vaults
**mood:** premium · calm · serious
**vibe:** A private bank for on-chain. Restrained, deep, considered.

| Role | OKLCH | Hex |
|---|---|---|
| bg-base | `oklch(0.15 0.02 240)` | `#0B1220` |
| bg-elevated | `oklch(0.20 0.025 240)` | `#141E30` |
| primary | `oklch(0.68 0.13 225)` | `#5B8BB8` |
| primary-soft | `oklch(0.80 0.09 225)` | `#91B3D0` |
| fg-base | `oklch(0.95 0.015 240)` | `#EFF1F5` |

### Chromium
**category:** defi · perps · derivatives
**mood:** minimal · technical · sharp
**vibe:** High-performance trading. Precision, no ornament.

| Role | OKLCH | Hex |
|---|---|---|
| bg-base | `oklch(0.12 0 0)` | `#0B0B0B` |
| bg-elevated | `oklch(0.17 0 0)` | `#161616` |
| primary | `oklch(0.78 0.18 140)` | `#62D67F` |
| primary-soft | `oklch(0.88 0.13 140)` | `#9AE8AA` |
| fg-base | `oklch(0.97 0 0)` | `#F5F5F5` |

---

## infra / data

### Ocean Terminal
**category:** infra · data · analytics
**mood:** technical · analytical · sharp
**vibe:** Dashboards you stare at all day without going blind.

| Role | OKLCH | Hex |
|---|---|---|
| bg-base | `oklch(0.13 0.02 230)` | `#0A101A` |
| bg-elevated | `oklch(0.18 0.025 230)` | `#121C2A` |
| primary | `oklch(0.74 0.16 220)` | `#40A9E8` |
| primary-soft | `oklch(0.85 0.11 220)` | `#85CBEF` |
| fg-base | `oklch(0.96 0.01 230)` | `#EEF2F6` |

### Graphite
**category:** infra · devtools
**mood:** minimal · serious · professional
**vibe:** Shipping software, not vibes. Grayscale with intent.

| Role | OKLCH | Hex |
|---|---|---|
| bg-base | `oklch(0.12 0 0)` | `#0A0A0A` |
| bg-elevated | `oklch(0.18 0 0)` | `#171717` |
| primary | `oklch(0.70 0 0)` | `#A3A3A3` |
| primary-soft | `oklch(0.85 0 0)` | `#D4D4D4` |
| fg-base | `oklch(0.98 0 0)` | `#FAFAFA` |

### Amber Monitor
**category:** infra · observability · logs
**mood:** technical · warm · serious
**vibe:** An old CRT in a server room. Hot data, quiet room.

| Role | OKLCH | Hex |
|---|---|---|
| bg-base | `oklch(0.14 0.01 70)` | `#110F0A` |
| bg-elevated | `oklch(0.19 0.015 70)` | `#1A1711` |
| primary | `oklch(0.78 0.15 70)` | `#D9A452` |
| primary-soft | `oklch(0.88 0.10 70)` | `#E8C389` |
| fg-base | `oklch(0.96 0.01 70)` | `#F3F1ED` |

### Cloud Slate
**category:** infra · cloud · platform
**mood:** calm · premium · trustworthy
**vibe:** Enterprise-grade without the corporate grey. Soft, confident.

| Role | OKLCH | Hex |
|---|---|---|
| bg-base | `oklch(0.14 0.01 250)` | `#0D1017` |
| bg-elevated | `oklch(0.19 0.015 250)` | `#161B25` |
| primary | `oklch(0.72 0.13 270)` | `#8E8FD8` |
| primary-soft | `oklch(0.84 0.09 270)` | `#B6B6E6` |
| fg-base | `oklch(0.96 0.01 250)` | `#EFF1F5` |

### Signal Teal
**category:** infra · realtime · messaging
**mood:** calm · technical · fresh
**vibe:** Live data you can trust. Cool but not cold.

| Role | OKLCH | Hex |
|---|---|---|
| bg-base | `oklch(0.13 0.015 200)` | `#09131A` |
| bg-elevated | `oklch(0.18 0.02 200)` | `#0F1E27` |
| primary | `oklch(0.74 0.14 195)` | `#3CB4BD` |
| primary-soft | `oklch(0.85 0.10 195)` | `#7DD1D7` |
| fg-base | `oklch(0.96 0.01 200)` | `#EDF3F4` |

---

## consumer / social

### Ivory Linen
**category:** consumer · social · content
**mood:** warm · minimal · premium
**vibe:** A zine you want to read. Paper-like, legible, tactile.

| Role | OKLCH | Hex |
|---|---|---|
| bg-base | `oklch(0.98 0.005 75)` | `#FAF8F3` |
| bg-elevated | `oklch(1.00 0 0)` | `#FFFFFF` |
| primary | `oklch(0.48 0.12 30)` | `#9E4C2C` |
| primary-soft | `oklch(0.68 0.11 30)` | `#D58565` |
| fg-base | `oklch(0.20 0.01 30)` | `#1F1A15` |

### Peach Comfort
**category:** consumer · social · lifestyle
**mood:** warm · playful · calm
**vibe:** Something you send your friends. Soft, friendly, never loud.

| Role | OKLCH | Hex |
|---|---|---|
| bg-base | `oklch(0.97 0.02 45)` | `#FCF5EC` |
| bg-elevated | `oklch(1.00 0 0)` | `#FFFFFF` |
| primary | `oklch(0.62 0.19 30)` | `#D96C4A` |
| primary-soft | `oklch(0.80 0.14 30)` | `#EFA487` |
| fg-base | `oklch(0.22 0.02 30)` | `#241812` |

### Rose Deck
**category:** consumer · social · dating
**mood:** bold · warm · playful
**vibe:** Confident, a little flirty, never boring.

| Role | OKLCH | Hex |
|---|---|---|
| bg-base | `oklch(0.13 0.02 10)` | `#14090E` |
| bg-elevated | `oklch(0.18 0.03 10)` | `#1E1119` |
| primary | `oklch(0.66 0.23 15)` | `#ED5672` |
| primary-soft | `oklch(0.80 0.17 15)` | `#F58BA0` |
| fg-base | `oklch(0.97 0.01 20)` | `#F5F1F1` |

### Sand Club
**category:** consumer · travel · lifestyle
**mood:** premium · warm · calm
**vibe:** Members-only without the velvet rope. Quiet luxury.

| Role | OKLCH | Hex |
|---|---|---|
| bg-base | `oklch(0.96 0.01 85)` | `#F6F2EA` |
| bg-elevated | `oklch(1.00 0 0)` | `#FFFFFF` |
| primary | `oklch(0.42 0.07 50)` | `#6B5A47` |
| primary-soft | `oklch(0.70 0.08 50)` | `#B8A188` |
| fg-base | `oklch(0.22 0.01 50)` | `#1F1B14` |

### Coral Gossip
**category:** consumer · community · chat
**mood:** bold · playful · warm
**vibe:** Loud but friendly. A group chat that never dies.

| Role | OKLCH | Hex |
|---|---|---|
| bg-base | `oklch(0.98 0.01 25)` | `#FBF4F0` |
| bg-elevated | `oklch(1.00 0 0)` | `#FFFFFF` |
| primary | `oklch(0.64 0.20 25)` | `#E0654A` |
| primary-soft | `oklch(0.80 0.14 25)` | `#F19E87` |
| fg-base | `oklch(0.20 0.02 25)` | `#1E130E` |

---

## memecoin / playful

### Electric Citrus
**category:** memecoin · launchpad · playful
**mood:** bold · electric · playful
**vibe:** Pure chaos energy. A memecoin that doesn't pretend otherwise.

| Role | OKLCH | Hex |
|---|---|---|
| bg-base | `oklch(0.13 0.01 100)` | `#0F0F06` |
| bg-elevated | `oklch(0.18 0.02 100)` | `#1A1A0A` |
| primary | `oklch(0.88 0.19 105)` | `#E3DC3A` |
| primary-soft | `oklch(0.94 0.14 105)` | `#EEE977` |
| fg-base | `oklch(0.97 0.01 100)` | `#F5F4EC` |

### Toxic Grape
**category:** memecoin · degen
**mood:** bold · electric · weird
**vibe:** Purple pill. Unapologetic, loud, a little feral.

| Role | OKLCH | Hex |
|---|---|---|
| bg-base | `oklch(0.11 0.03 300)` | `#0F081A` |
| bg-elevated | `oklch(0.17 0.04 300)` | `#19102A` |
| primary | `oklch(0.65 0.28 305)` | `#B242E3` |
| primary-soft | `oklch(0.80 0.20 305)` | `#D582EE` |
| fg-base | `oklch(0.97 0.01 300)` | `#F4F0F6` |

### Hot Pink Mode
**category:** memecoin · nft · community
**mood:** bold · playful · loud
**vibe:** The opposite of serious. And proud of it.

| Role | OKLCH | Hex |
|---|---|---|
| bg-base | `oklch(0.98 0.01 340)` | `#FBF4F7` |
| bg-elevated | `oklch(1.00 0 0)` | `#FFFFFF` |
| primary | `oklch(0.63 0.26 340)` | `#E6478E` |
| primary-soft | `oklch(0.80 0.18 340)` | `#F28BBA` |
| fg-base | `oklch(0.18 0.02 340)` | `#1D0F16` |

### Emerald Ape
**category:** memecoin · jungle · community
**mood:** bold · playful · energetic
**vibe:** Green candles forever. Loud, lucky, a bit unhinged.

| Role | OKLCH | Hex |
|---|---|---|
| bg-base | `oklch(0.12 0.02 150)` | `#071310` |
| bg-elevated | `oklch(0.17 0.025 150)` | `#0E1E19` |
| primary | `oklch(0.76 0.24 150)` | `#35DF89` |
| primary-soft | `oklch(0.87 0.17 150)` | `#7EEDAE` |
| fg-base | `oklch(0.97 0.01 150)` | `#F0F5F3` |

### Raver Neon
**category:** memecoin · nightlife · event
**mood:** electric · bold · weird
**vibe:** 2AM on the dancefloor. High-contrast, high-chroma, shameless.

| Role | OKLCH | Hex |
|---|---|---|
| bg-base | `oklch(0.10 0.02 285)` | `#07041A` |
| bg-elevated | `oklch(0.15 0.03 285)` | `#0E0829` |
| primary | `oklch(0.82 0.23 180)` | `#39EFD1` |
| primary-soft | `oklch(0.90 0.16 180)` | `#7EF4E0` |
| fg-base | `oklch(0.97 0.01 285)` | `#F1EFF7` |

---

## ai / tech

### Quantum Lab
**category:** ai · research · labs
**mood:** technical · premium · serious
**vibe:** Frontier research. Clean, cold, consequential.

| Role | OKLCH | Hex |
|---|---|---|
| bg-base | `oklch(0.11 0.01 260)` | `#08080F` |
| bg-elevated | `oklch(0.16 0.015 260)` | `#101119` |
| primary | `oklch(0.76 0.18 280)` | `#A978EB` |
| primary-soft | `oklch(0.86 0.13 280)` | `#C4A6F1` |
| fg-base | `oklch(0.97 0.01 260)` | `#F2F1F5` |

### Inference
**category:** ai · ml · infra
**mood:** minimal · technical · sharp
**vibe:** Fast math. No ornament, no apology.

| Role | OKLCH | Hex |
|---|---|---|
| bg-base | `oklch(0.10 0 0)` | `#080808` |
| bg-elevated | `oklch(0.16 0 0)` | `#141414` |
| primary | `oklch(0.78 0.14 195)` | `#4CC8D2` |
| primary-soft | `oklch(0.88 0.10 195)` | `#87DEE5` |
| fg-base | `oklch(0.98 0 0)` | `#F7F7F7` |

### Plasma
**category:** ai · creative · tools
**mood:** bold · electric · premium
**vibe:** Generative pipeline. High-energy, high-trust.

| Role | OKLCH | Hex |
|---|---|---|
| bg-base | `oklch(0.11 0.02 310)` | `#0C0714` |
| bg-elevated | `oklch(0.16 0.025 310)` | `#150E1F` |
| primary | `oklch(0.72 0.22 340)` | `#E957A6` |
| primary-soft | `oklch(0.83 0.15 340)` | `#F091C4` |
| fg-base | `oklch(0.97 0.01 310)` | `#F3F1F5` |

### Meridian
**category:** ai · agents · orchestration
**mood:** serious · premium · calm
**vibe:** Coordination at scale. Measured, authoritative.

| Role | OKLCH | Hex |
|---|---|---|
| bg-base | `oklch(0.13 0.015 250)` | `#0B0E18` |
| bg-elevated | `oklch(0.18 0.02 250)` | `#141826` |
| primary | `oklch(0.68 0.16 245)` | `#637FD6` |
| primary-soft | `oklch(0.80 0.11 245)` | `#9AAAE0` |
| fg-base | `oklch(0.96 0.01 250)` | `#EFF1F6` |

### Bone White
**category:** ai · writing · knowledge
**mood:** minimal · premium · serious
**vibe:** A focused writing app. Warm whites, deliberate.

| Role | OKLCH | Hex |
|---|---|---|
| bg-base | `oklch(0.98 0.005 85)` | `#F9F7F2` |
| bg-elevated | `oklch(1.00 0 0)` | `#FFFFFF` |
| primary | `oklch(0.32 0.03 50)` | `#3F3830` |
| primary-soft | `oklch(0.60 0.04 50)` | `#928473` |
| fg-base | `oklch(0.18 0.01 50)` | `#1B1713` |

---

## nft / creative

### Gallery Bone
**category:** nft · art · collections
**mood:** premium · minimal · calm
**vibe:** A physical gallery. White walls, serious work.

| Role | OKLCH | Hex |
|---|---|---|
| bg-base | `oklch(0.98 0.003 80)` | `#F8F7F3` |
| bg-elevated | `oklch(1.00 0 0)` | `#FFFFFF` |
| primary | `oklch(0.20 0 0)` | `#171717` |
| primary-soft | `oklch(0.60 0 0)` | `#808080` |
| fg-base | `oklch(0.15 0 0)` | `#0F0F0F` |

### Gilded Night
**category:** nft · premium · auction
**mood:** premium · bold · warm
**vibe:** A black-tie auction house. Dark, gold, heavy.

| Role | OKLCH | Hex |
|---|---|---|
| bg-base | `oklch(0.11 0.005 60)` | `#0C0B08` |
| bg-elevated | `oklch(0.16 0.008 60)` | `#16140F` |
| primary | `oklch(0.78 0.14 85)` | `#D6B864` |
| primary-soft | `oklch(0.88 0.09 85)` | `#E9D89C` |
| fg-base | `oklch(0.96 0.01 60)` | `#F3F1EC` |

### Risograph
**category:** nft · indie · creative
**mood:** playful · warm · weird
**vibe:** Printed zine aesthetic. Off-register, handmade, alive.

| Role | OKLCH | Hex |
|---|---|---|
| bg-base | `oklch(0.97 0.02 80)` | `#FAF3E4` |
| bg-elevated | `oklch(1.00 0 0)` | `#FFFFFF` |
| primary | `oklch(0.56 0.20 25)` | `#C25438` |
| primary-soft | `oklch(0.74 0.15 25)` | `#E48F72` |
| fg-base | `oklch(0.20 0.02 25)` | `#1F150F` |

### Cyan Glitch
**category:** nft · generative · new media
**mood:** electric · weird · bold
**vibe:** On-chain generative art. Cold, digital, alive.

| Role | OKLCH | Hex |
|---|---|---|
| bg-base | `oklch(0.10 0.01 200)` | `#05090D` |
| bg-elevated | `oklch(0.15 0.015 200)` | `#0B1418` |
| primary | `oklch(0.80 0.18 195)` | `#3BCFDC` |
| primary-soft | `oklch(0.90 0.12 195)` | `#88E2EA` |
| fg-base | `oklch(0.97 0.01 200)` | `#EDF3F4` |

### Velvet Violet
**category:** nft · fashion · drops
**mood:** premium · bold · warm
**vibe:** A fashion drop. Deep purple, soft gold, unapologetic.

| Role | OKLCH | Hex |
|---|---|---|
| bg-base | `oklch(0.12 0.03 300)` | `#110720` |
| bg-elevated | `oklch(0.17 0.035 300)` | `#1B0E2E` |
| primary | `oklch(0.68 0.20 300)` | `#A554D6` |
| primary-soft | `oklch(0.82 0.14 300)` | `#CA92E4` |
| fg-base | `oklch(0.97 0.01 300)` | `#F3F0F6` |

---

## Index by mood

Quick lookup for the workflow's step-2 filter.

| Mood | Palettes |
|---|---|
| **minimal** | Graphite, Chromium, Inference, Bone White, Gallery Bone, Ivory Linen |
| **bold** | Sunset Trade, Rose Deck, Coral Gossip, Electric Citrus, Toxic Grape, Hot Pink Mode, Emerald Ape, Plasma, Gilded Night, Velvet Violet |
| **warm** | Sunset Trade, Amber Monitor, Ivory Linen, Peach Comfort, Rose Deck, Sand Club, Coral Gossip, Risograph, Gilded Night, Velvet Violet |
| **calm** | Forest Stake, Vault Blue, Cloud Slate, Signal Teal, Peach Comfort, Sand Club, Meridian, Gallery Bone |
| **playful** | Peach Comfort, Rose Deck, Coral Gossip, Electric Citrus, Hot Pink Mode, Emerald Ape, Risograph |
| **serious** | Midnight Signal, Forest Stake, Vault Blue, Graphite, Amber Monitor, Meridian, Bone White, Quantum Lab |
| **technical** | Midnight Signal, Chromium, Ocean Terminal, Graphite, Amber Monitor, Signal Teal, Quantum Lab, Inference |
| **premium** | Vault Blue, Ivory Linen, Sand Club, Quantum Lab, Plasma, Meridian, Bone White, Gallery Bone, Gilded Night, Velvet Violet |
| **electric** | Electric Citrus, Toxic Grape, Raver Neon, Plasma, Cyan Glitch |
| **weird** | Toxic Grape, Raver Neon, Risograph, Cyan Glitch |

## Index by category

| Category | Palettes |
|---|---|
| **defi** | Midnight Signal, Forest Stake, Sunset Trade, Vault Blue, Chromium |
| **infra / data** | Ocean Terminal, Graphite, Amber Monitor, Cloud Slate, Signal Teal |
| **consumer / social** | Ivory Linen, Peach Comfort, Rose Deck, Sand Club, Coral Gossip |
| **memecoin / playful** | Electric Citrus, Toxic Grape, Hot Pink Mode, Emerald Ape, Raver Neon |
| **ai / tech** | Quantum Lab, Inference, Plasma, Meridian, Bone White |
| **nft / creative** | Gallery Bone, Gilded Night, Risograph, Cyan Glitch, Velvet Violet |

Cross-category pulls are encouraged. "defi + minimal" might borrow Graphite or Chromium from infra. "consumer + calm" might borrow Signal Teal.
