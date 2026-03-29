import type { ClonableRepo } from "../core/router/recommend-repo.js";

const RESET = "\x1b[0m";
const DIM = "\x1b[2m";
const BOLD = "\x1b[1m";
const CYAN = "\x1b[36m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const MAGENTA = "\x1b[35m";

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

export interface SearchItem {
  kind: "repo";
  id: string;
  label: string;
  repoSlug: string;
  description: string;
  meta: string;
  keywords: string[];
  clone_command?: string;
}

function buildIndex(repos: ClonableRepo[]): SearchItem[] {
  return repos.map((r) => ({
    kind: "repo" as const,
    id: r.id,
    label: r.id,
    repoSlug: r.repo,
    description: r.description,
    meta: r.category,
    keywords: [
      ...r.keywords,
      r.id,
      r.repo,
      ...r.repo.split("/"),
      r.category,
      ...r.description.toLowerCase().split(/\s+/),
    ],
    clone_command: r.clone_command,
  }));
}

function filterItems(items: SearchItem[], query: string): SearchItem[] {
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
  const needed = Math.max(width - vis, 0);
  return str + " ".repeat(needed);
}

interface BuildResult {
  lines: string[];
  inputLineIndex: number;
}

function buildLines(
  query: string,
  items: SearchItem[],
  selected: number,
  rows: number,
  showDescriptions: boolean,
): BuildResult {
  const lines: string[] = [];
  const W = 62;

  lines.push(`  ${BOLD}${CYAN}solana.new${RESET}  ${DIM}repos${RESET}`);
  lines.push("");

  const topBorder = `  ╭${"─".repeat(W + 2)}╮`;
  const botBorder = `  ╰${"─".repeat(W + 2)}╯`;

  let innerContent: string;
  if (query) {
    innerContent = `${BOLD}>${RESET} ${query}`;
  } else {
    innerContent = `${BOLD}>${RESET} ${DIM}search anything across defi, tooling, infra, development${RESET}`;
  }
  const innerLine = `  │ ${padVisible(innerContent, W)} │`;

  lines.push(topBorder);
  const inputLineIndex = lines.length;
  lines.push(innerLine);
  lines.push(botBorder);

  const descToggle = showDescriptions ? "D:hide desc" : "D:show desc";
  lines.push(`  ${gradientSearch()} ${DIM}${items.length} result${items.length === 1 ? "" : "s"}${RESET}    ${DIM}${descToggle}${RESET}`);
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

      const tag = `${YELLOW}(${item.repoSlug})${RESET}`;

      lines.push(`  ${pointer} ${nameColor}${item.label}${RESET}  ${tag}  ${DIM}${item.meta}${RESET}`);

      if (showDescriptions || isSelected) {
        lines.push(`    ${DIM}${item.description}${RESET}`);
      }
      if (isSelected && item.clone_command) {
        lines.push(`    ${MAGENTA}$ ${item.clone_command}${RESET}`);
      }
      lines.push(""); // spacing between items
    }

    if (end < total) {
      lines.push(`  ${DIM}  ▼ ${total - end} more${RESET}`);
    }
  }

  const footerLines: string[] = [""];
  if (items.length > 0) {
    const sel = items[selected];
    footerLines.push(`  ${DIM}↑↓ scroll${RESET}  ${BOLD}enter${RESET} ${DIM}clone${RESET}  ${DIM}esc quit${RESET}    ${MAGENTA}▸ ${sel.id}${RESET}`);
  } else {
    footerLines.push(`  ${DIM}esc quit${RESET}`);
  }

  while (lines.length < rows - footerLines.length) {
    lines.push("");
  }
  lines.push(...footerLines);

  return { lines: lines.slice(0, rows), inputLineIndex };
}

export interface InteractiveSearchResult {
  item: SearchItem | null;
  action: "select" | "quit";
}

export async function interactiveSearch(
  repos: ClonableRepo[],
): Promise<InteractiveSearchResult> {
  const allItems = buildIndex(repos);
  let query = "";
  let selected = 0;
  let filtered = filterItems(allItems, query);
  let showDescriptions = false;

  const stdin = process.stdin;
  const stdout = process.stdout;

  if (!stdin.isTTY) {
    for (const item of allItems) {
      const tag = `(${item.repoSlug})`;
      console.log(`  ${item.id} ${tag}  ${item.description}`);
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

  function draw() {
    const rows = getRows();
    const { lines, inputLineIndex } = buildLines(query, filtered, selected, rows, showDescriptions);
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
        filtered = filterItems(allItems, query);
        selected = 0;
        draw();
        return;
      }

      // Backspace — delete one char
      if (key === "\x7f" || key === "\b") {
        query = query.slice(0, -1);
        filtered = filterItems(allItems, query);
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
        filtered = filterItems(allItems, query);
        selected = 0;
        draw();
      }
    }

    stdin.on("data", onData);
  });
}
