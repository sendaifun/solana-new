// Shared ANSI escape codes and gradient utilities

export const RESET = "\x1b[0m";
export const DIM = "\x1b[2m";
export const BOLD = "\x1b[1m";
export const CYAN = "\x1b[36m";
export const GREEN = "\x1b[32m";
export const YELLOW = "\x1b[33m";
export const MAGENTA = "\x1b[35m";
export const BLUE = "\x1b[34m";
export const RED = "\x1b[31m";

// Terminal control sequences
export const ALT_SCREEN_ON = "\x1b[?1049h";
export const ALT_SCREEN_OFF = "\x1b[?1049l";
export const CURSOR_HIDE = "\x1b[?25l";
export const CURSOR_SHOW = "\x1b[?25h";
export const CLEAR_SCREEN = "\x1b[H\x1b[J";

// Gradient color stops (purple → pink)
const GRADIENT_STOPS: Array<[number, number, number]> = [
  [130, 80, 255], [155, 65, 245], [180, 50, 230],
  [205, 40, 205], [230, 35, 170], [255, 25, 120],
];

export function gradientLine(text: string): string {
  const chars = text.split("");
  const step = (GRADIENT_STOPS.length - 1) / Math.max(chars.length - 1, 1);
  return chars.map((c, i) => {
    const t = i * step;
    const idx = Math.min(Math.floor(t), GRADIENT_STOPS.length - 2);
    const f = t - idx;
    const [r1, g1, b1] = GRADIENT_STOPS[idx];
    const [r2, g2, b2] = GRADIENT_STOPS[idx + 1];
    const r = Math.round(r1 + (r2 - r1) * f);
    const g = Math.round(g1 + (g2 - g1) * f);
    const b = Math.round(b1 + (b2 - b1) * f);
    return `\x1b[38;2;${r};${g};${b}m${c}`;
  }).join("") + RESET;
}

// Pre-computed gradient strings (cached — never recomputed)
export const GRADIENT_SOLANA_DOT_NEW = gradientLine("solana.new");
export const GRADIENT_SOLANA_DASH_NEW = gradientLine("solana-new");

// Competition thresholds
export const COMPETITION_HIGH = 30;
export const COMPETITION_MEDIUM = 15;

// Footer padding helper
export function padFooter(lines: string[], footer: string[], rows: number): string[] {
  while (lines.length < rows - footer.length) lines.push("");
  lines.push(...footer);
  return lines.slice(0, rows);
}

// Kebab-case slug helper
export function toKebabSlug(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
