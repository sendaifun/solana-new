import type { ClonableRepo } from "../core/router/recommend-repo.js";
import type { SkillsData } from "./interactive-skills.js";
import type { McpsData, McpItem } from "./interactive-mcps.js";

const RESET = "\x1b[0m";
const DIM = "\x1b[2m";
const BOLD = "\x1b[1m";
const CYAN = "\x1b[36m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const MAGENTA = "\x1b[35m";
const BLUE = "\x1b[34m";

const MAX_VISIBLE = 15;

function gradientSearch(): string {
  const chars = "Search";
  const codes = [
    "\x1b[38;2;130;80;255m",
    "\x1b[38;2;160;60;240m",
    "\x1b[38;2;190;50;220m",
    "\x1b[38;2;215;40;190m",
    "\x1b[38;2;240;35;155m",
    "\x1b[38;2;255;30;130m",
  ];
  return chars.split("").map((c, i) => `${codes[i]}${c}`).join("") + RESET;
}

export interface UniversalItem {
  kind: "repo" | "skill" | "mcp";
  id: string;
  name: string;
  source: string; // org/repo or "built-in"
  description: string;
  category: string;
  action_command: string;
  action_label: string; // "scaffold" | "clone" | "install"
  keywords: string[];
}

export function buildUniversalIndex(
  repos: ClonableRepo[],
  skillsData: SkillsData,
  mcpsData: McpsData,
): UniversalItem[] {
  const items: UniversalItem[] = [];

  for (const r of repos) {
    items.push({
      kind: "repo",
      id: r.id,
      name: r.id,
      source: r.repo,
      description: r.description,
      category: r.category,
      action_command: r.clone_command,
      action_label: "clone",
      keywords: [...r.keywords, r.id, r.repo, ...r.repo.split("/"), r.category, ...r.description.toLowerCase().split(/\s+/), "repo"],
    });
  }

  for (const s of skillsData.official_skills) {
    items.push({
      kind: "skill",
      id: s.slug,
      name: s.title,
      source: "solana-foundation",
      description: s.description,
      category: "official",
      action_command: "npx skills add https://github.com/solana-foundation/solana-dev-skill",
      action_label: "install",
      keywords: [s.slug, ...s.slug.split("-"), ...s.title.toLowerCase().split(/\s+/), ...s.description.toLowerCase().split(/\s+/), "skill", "official"],
    });
  }

  for (const s of skillsData.community_skills) {
    const cat = s.category?.labelKey ?? "community";
    items.push({
      kind: "skill",
      id: s.slug,
      name: s.title,
      source: "community",
      description: s.description,
      category: cat,
      action_command: `npx skills add ${s.url}`,
      action_label: "install",
      keywords: [s.slug, ...s.slug.split("-"), ...s.title.toLowerCase().split(/\s+/), ...s.description.toLowerCase().split(/\s+/), cat, "skill", "community"],
    });
  }

  for (const m of mcpsData.mcps) {
    items.push({
      kind: "mcp",
      id: m.id,
      name: m.name,
      source: m.repo,
      description: m.description,
      category: m.category,
      action_command: m.setup_command,
      action_label: "install",
      keywords: [m.id, ...m.id.split("-"), ...m.name.toLowerCase().split(/\s+/), ...m.description.toLowerCase().split(/\s+/), m.category, m.repo, ...m.repo.split("/"), ...m.keywords, "mcp"],
    });
  }

  return items;
}

function filterItems(items: UniversalItem[], query: string): UniversalItem[] {
  if (!query.trim()) return items;
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  return items.filter((item) =>
    words.every((w) => item.keywords.some((kw) => kw.includes(w))),
  );
}

function visibleLength(str: string): number {
  return str.replace(/\x1b\[[0-9;]*m/g, "").length;
}

function padVisible(str: string, width: number): string {
  const vis = visibleLength(str);
  return str + " ".repeat(Math.max(width - vis, 0));
}

function kindTag(kind: string): string {
  switch (kind) {
    case "repo": return `${YELLOW}repo${RESET}`;
    case "skill": return `${MAGENTA}skill${RESET}`;
    case "mcp": return `${BLUE}mcp${RESET}`;
    default: return kind;
  }
}

// Pick a curated initial view: a few from each category
function initialItems(allItems: UniversalItem[]): UniversalItem[] {
  const picks: UniversalItem[] = [];
  const byKind: Record<string, UniversalItem[]> = { repo: [], skill: [], mcp: [] };
  for (const item of allItems) {
    byKind[item.kind]?.push(item);
  }
  // 5 repos, 5 skills, 5 mcps = 15
  picks.push(...byKind.repo.slice(0, 5));
  picks.push(...byKind.skill.slice(0, 5));
  picks.push(...byKind.mcp.slice(0, 5));
  return picks;
}

interface BuildResult {
  lines: string[];
  inputLineIndex: number;
}

function buildLines(
  query: string,
  items: UniversalItem[],
  selected: number,
  rows: number,
  showDescriptions: boolean,
  isInitial: boolean,
): BuildResult {
  const lines: string[] = [];
  const W = 62;

  lines.push(`  ${BOLD}${CYAN}solana.new${RESET}  ${DIM}universal search${RESET}`);
  lines.push("");

  const topBorder = `  ╭${"─".repeat(W + 2)}╮`;
  const botBorder = `  ╰${"─".repeat(W + 2)}╯`;

  let innerContent: string;
  if (query) {
    innerContent = `${BOLD}>${RESET} ${query}`;
  } else {
    innerContent = `${BOLD}>${RESET} ${DIM}Search anything across repos, skills, mcps${RESET}`;
  }
  const innerLine = `  │ ${padVisible(innerContent, W)} │`;

  lines.push(topBorder);
  const inputLineIndex = lines.length;
  lines.push(innerLine);
  lines.push(botBorder);

  const descToggle = showDescriptions ? "D:hide desc" : "D:show desc";
  const countLabel = isInitial ? "featured" : `result${items.length === 1 ? "" : "s"}`;
  lines.push(`  ${gradientSearch()} ${DIM}${items.length} ${countLabel}${RESET}    ${DIM}${descToggle}${RESET}`);
  lines.push("");

  const total = items.length;

  if (total === 0) {
    lines.push(`  ${DIM}No results${query ? ` for "${query}"` : ""}${RESET}`);
  } else {
    let start = 0;
    if (total > MAX_VISIBLE) {
      start = Math.max(0, Math.min(selected - Math.floor(MAX_VISIBLE / 2), total - MAX_VISIBLE));
    }
    const end = Math.min(start + MAX_VISIBLE, total);

    if (start > 0) {
      lines.push(`  ${DIM}  ▲ ${start} more${RESET}`);
    }

    for (let i = start; i < end; i++) {
      const item = items[i];
      const isSelected = i === selected;
      const pointer = isSelected ? `${CYAN}❯${RESET}` : " ";
      const nameColor = isSelected ? BOLD + CYAN : BOLD;
      const kt = kindTag(item.kind);
      const src = item.source !== "built-in" && item.source !== "community"
        ? `  ${DIM}(${item.source})${RESET}`
        : "";

      lines.push(`  ${pointer} ${nameColor}${item.name}${RESET}  ${kt}${src}  ${DIM}${item.category}${RESET}`);

      if (showDescriptions || isSelected) {
        lines.push(`    ${DIM}${item.description}${RESET}`);
      }
      if (isSelected) {
        lines.push(`    ${MAGENTA}$ ${item.action_command}${RESET}`);
      }
      lines.push("");
    }

    if (end < total) {
      lines.push(`  ${DIM}  ▼ ${total - end} more${RESET}`);
    }
  }

  const footerLines: string[] = [""];
  if (items.length > 0) {
    const sel = items[selected];
    footerLines.push(`  ${DIM}↑↓ scroll${RESET}  ${BOLD}enter${RESET} ${DIM}${sel.action_label}${RESET}  ${DIM}esc quit${RESET}    ${MAGENTA}▸ ${sel.id}${RESET}`);
  } else {
    footerLines.push(`  ${DIM}esc quit${RESET}`);
  }

  while (lines.length < rows - footerLines.length) {
    lines.push("");
  }
  lines.push(...footerLines);

  return { lines: lines.slice(0, rows), inputLineIndex };
}

export interface UniversalSearchResult {
  item: UniversalItem | null;
  action: "select" | "quit";
}

export async function interactiveUniversalSearch(
  repos: ClonableRepo[],
  skillsData: SkillsData,
  mcpsData: McpsData,
  initialQuery?: string,
): Promise<UniversalSearchResult> {
  const allItems = buildUniversalIndex(repos, skillsData, mcpsData);
  const featured = initialItems(allItems);
  let query = initialQuery ?? "";
  let selected = 0;
  let showDescriptions = false;
  let isInitial = !query;
  let filtered = isInitial ? featured : filterItems(allItems, query);

  const stdin = process.stdin;
  const stdout = process.stdout;

  if (!stdin.isTTY) {
    for (const item of featured) {
      console.log(`  ${item.id} [${item.kind}]  ${item.description}`);
    }
    return { item: null, action: "quit" };
  }

  stdin.setRawMode(true);
  stdin.resume();
  stdin.setEncoding("utf8");

  stdout.write("\x1b[?1049h");
  stdout.write("\x1b[?25h");

  function getRows(): number {
    return stdout.rows || 24;
  }

  function refilter() {
    if (query.trim()) {
      filtered = filterItems(allItems, query);
      isInitial = false;
    } else {
      filtered = featured;
      isInitial = true;
    }
  }

  function draw() {
    const rows = getRows();
    const { lines, inputLineIndex } = buildLines(query, filtered, selected, rows, showDescriptions, isInitial);
    const cursorPos = `\x1b[${inputLineIndex + 1};${7 + query.length}H`;
    stdout.write(`\x1b[H\x1b[J${lines.join("\n")}${cursorPos}`);
  }

  draw();

  const onResize = () => draw();
  stdout.on("resize", onResize);

  return new Promise((resolve) => {
    function cleanup() {
      stdout.removeListener("resize", onResize);
      stdin.setRawMode(false);
      stdin.pause();
      stdin.removeListener("data", onData);
      stdout.write("\x1b[?1049l");
    }

    function onData(key: string) {
      if (key === "\x03") {
        cleanup();
        process.exit(0);
      }

      if (key === "\x1b") {
        cleanup();
        resolve({ item: null, action: "quit" });
        return;
      }

      if (key === "\r" || key === "\n") {
        const item = filtered[selected] ?? null;
        cleanup();
        resolve({ item, action: "select" });
        return;
      }

      // Cmd+Backspace / Ctrl+U — clear entire line
      if (key === "\x15" || key === "\x17") {
        query = "";
        refilter();
        selected = 0;
        draw();
        return;
      }

      if (key === "\x7f" || key === "\b") {
        query = query.slice(0, -1);
        refilter();
        selected = Math.min(selected, Math.max(filtered.length - 1, 0));
        draw();
        return;
      }

      if (key === "\x1b[A") {
        selected = Math.max(selected - 1, 0);
        draw();
        return;
      }

      if (key === "\x1b[B") {
        selected = Math.min(selected + 1, Math.max(filtered.length - 1, 0));
        draw();
        return;
      }

      if (key === "\t") {
        selected = (selected + 1) % Math.max(filtered.length, 1);
        draw();
        return;
      }

      if (key === "D") {
        showDescriptions = !showDescriptions;
        draw();
        return;
      }

      if (key.length === 1 && key >= " ") {
        query += key;
        refilter();
        selected = 0;
        draw();
      }
    }

    stdin.on("data", onData);
  });
}
