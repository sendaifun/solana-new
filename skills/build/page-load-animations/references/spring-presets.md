# Spring Presets

Quick-reference tables for spring configs, easing curves, stagger values, and duration presets. Use these as starting points — tune for your specific UI.

## Spring Presets (stiffness/damping)

| Name | Stiffness | Damping | Use for |
| --- | --- | --- | --- |
| snappy | 400 | 30 | Dropdown sections, panel items |
| smooth | 300 | 30 | Side panels, chart entrances |
| bouncy | 280 | 26 | Hero cards, protocol cards |
| stiff | 350 | 28 | Headers, top/bottom content |
| expand | 350 | 32 | Expand/collapse, accordion |
| chevron | 400 | 25 | Chevron rotation, icon transforms |

## Modern Spring Presets (visualDuration/bounce)

Framer-motion's newer API for springs defined by perceived duration and bounce amount:

| Name | visualDuration | bounce | Use for |
| --- | --- | --- | --- |
| popup | 0.35 | 0.18 | Modal panels |
| filter | 0.3 | 0.15 | Filter content stagger |
| height | 0.35 | 0.12 | Container height changes |

## Easing Curves

For the cases where duration-based easing is preferred over springs (fades, tooltips, container entrances):

| Name | Value | Use for |
| --- | --- | --- |
| easeOutExpo | `[0.16, 1, 0.3, 1]` | FAB entrance, dropdown container |
| easeOutCubic | `[0.33, 1, 0.68, 1]` | Chart morphs, digit updates |
| bouncyReveal | `[0.34, 1.3, 0.64, 1]` | SVG mask reveals, donut sweep |

## Stagger Presets

| Name | Value | Use for |
| --- | --- | --- |
| tight | 0.04s | Dense lists (10+ items) |
| normal | 0.06s | Medium lists (4-8 items) |
| relaxed | 0.18s | Hero cards (2-5 items) |

## Duration Presets

| Name | Value | Use for |
| --- | --- | --- |
| crossFade | 120ms | Filter content swap |
| backdropFade | 250ms | Modal backdrop |
| dropdownOpen | 200ms | Dropdown container |
| digitMount | 600ms | Rolling digit first appearance |
| digitUpdate | 150ms | Rolling digit value change |
| donutReveal | 1300ms | SVG donut mask sweep |
| chartMorph | 600ms | SVG polyline animation |

## JSON Block (for copy-paste)

```json
{
  "springs": {
    "snappy":  { "type": "spring", "stiffness": 400, "damping": 30 },
    "smooth":  { "type": "spring", "stiffness": 300, "damping": 30 },
    "bouncy":  { "type": "spring", "stiffness": 280, "damping": 26 },
    "stiff":   { "type": "spring", "stiffness": 350, "damping": 28 },
    "expand":  { "type": "spring", "stiffness": 350, "damping": 32 },
    "chevron": { "type": "spring", "stiffness": 400, "damping": 25 },
    "popup":   { "type": "spring", "visualDuration": 0.35, "bounce": 0.18 },
    "filter":  { "type": "spring", "visualDuration": 0.3, "bounce": 0.15 },
    "height":  { "type": "spring", "visualDuration": 0.35, "bounce": 0.12 }
  },
  "easings": {
    "easeOutExpo":  [0.16, 1, 0.3, 1],
    "easeOutCubic": [0.33, 1, 0.68, 1],
    "bouncyReveal": [0.34, 1.3, 0.64, 1]
  },
  "staggers": {
    "tight":   0.04,
    "normal":  0.06,
    "relaxed": 0.18
  },
  "durations": {
    "crossFade":    0.12,
    "backdropFade": 0.25,
    "dropdownOpen": 0.2,
    "digitMount":   0.6,
    "digitUpdate":  0.15,
    "donutReveal":  1.3,
    "chartMorph":   0.6
  }
}
```
