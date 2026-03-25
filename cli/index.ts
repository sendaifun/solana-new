#!/usr/bin/env node
import process from "node:process";
import { listReposByCategory, searchRepos, type ClonableRepo } from "../core/router/recommend-repo.js";
import { interactiveSearch } from "./interactive-search.js";
import { interactiveSkills, buildSkillsIndex, searchSkills, type SkillsData } from "./interactive-skills.js";
import skillsData from "../shared/constants/solana-skills.json" with { type: "json" };
import { interactiveMcps, buildMcpsIndex, searchMcps, type McpsData } from "./interactive-mcps.js";
import mcpsData from "../shared/constants/solana-mcps.json" with { type: "json" };
import { interactiveUniversalSearch, buildUniversalIndex } from "./interactive-universal.js";
import { renderBanner } from "./banner.js";

function parseFlags(args: string[]): { flags: Record<string, string | boolean>; positional: string[] } {
  const flags: Record<string, string | boolean> = {};
  const positional: string[] = [];
  for (let i = 0; i < args.length; i += 1) {
    const token = args[i];
    if (!token.startsWith("--")) {
      positional.push(token);
      continue;
    }
    const key = token.slice(2);
    const next = args[i + 1];
    if (!next || next.startsWith("--")) {
      flags[key] = true;
    } else {
      flags[key] = next;
      i += 1;
    }
  }
  return { flags, positional };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function agentOutput(label: string, items: any[], fields: string[]): void {
  console.log(`${label} — ${items.length} results`);
  if (items.length === 0) return;
  console.log("");

  const cmdField = fields.find((f) =>
    f.includes("command") || f.includes("setup") || f.includes("clone") || f.includes("install") || f.includes("action"),
  );
  const descField = fields.find((f) => f === "description");

  for (const item of items) {
    const kind = item.kind ?? item.type ?? "";
    const id = item.id ?? item.slug ?? "";
    const source = item.source ?? item.repo ?? "";
    const category = item.category ?? "";
    const name = item.name ?? item.title ?? "";

    const parts = [`[${kind || "item"}]`, id];
    if (name && name !== id) parts.push(name);
    if (source && source !== "built-in") parts.push(`(${source})`);
    if (category) parts.push(category);
    console.log(parts.join("  "));

    if (descField) console.log(`  ${String(item[descField] ?? "")}`);
    if (cmdField) console.log(`  ${String(item[cmdField] ?? "")}`);
    console.log("");
  }
}

async function runClone(command: string, label: string): Promise<void> {
  const { spawn } = await import("node:child_process");
  console.log(`\n  Cloning ${label}...\n  $ ${command}\n`);
  const child = spawn("sh", ["-c", command], { stdio: "inherit" });
  await new Promise<void>((resolve, reject) => {
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Failed with exit code ${code}`));
    });
  });
  console.log(`\n  Done: ${label}\n`);
}

async function runInstall(command: string, label: string): Promise<void> {
  const { spawn } = await import("node:child_process");
  console.log(`\n  Installing ${label}...\n  $ ${command}\n`);
  const child = spawn("sh", ["-c", command], { stdio: "inherit" });
  await new Promise<void>((resolve, reject) => {
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Failed with exit code ${code}`));
    });
  });
  console.log(`\n  Installed ${label}\n`);
}

// --- Commands ---

async function cmdSearch(args: string[]): Promise<void> {
  const { flags, positional } = parseFlags(args);
  const query = typeof flags.search === "string" ? flags.search : positional.join(" ").trim();
  const allRepos = listReposByCategory();
  const skills = skillsData as SkillsData;
  const mcps = mcpsData as McpsData;

  if (flags.agent === true) {
    const allItems = buildUniversalIndex(allRepos, skills, mcps);
    const results = query
      ? allItems.filter((item) => {
          const words = query.toLowerCase().split(/\s+/).filter(Boolean);
          return words.every((w) => item.keywords.some((kw) => kw.includes(w)));
        })
      : allItems;
    agentOutput(query ? `Search: "${query}"` : "All Solana ecosystem resources", results, ["kind", "id", "name", "source", "category", "description", "action_command"]);
    return;
  }

  if (process.stdin.isTTY) {
    const result = await interactiveUniversalSearch(allRepos, skills, mcps, query || undefined);
    if (result.action === "quit" || !result.item) return;

    const item = result.item;
    if (item.kind === "harness") {
      console.log(`\n  Harness: ${item.id}\n  ${item.description}\n`);
      return;
    }
    await runClone(item.action_command, item.id);
    return;
  }

  // Non-TTY fallback
  if (!query) { console.log('Usage: solana-new search --search "<query>"'); return; }
  const matchedRepos = searchRepos(query);
  const allSkills = buildSkillsIndex(skills);
  const matchedSkills = searchSkills(allSkills, query);
  const allMcps = buildMcpsIndex(mcps);
  const matchedMcps = searchMcps(allMcps, query);

  if (matchedRepos.length === 0 && matchedSkills.length === 0 && matchedMcps.length === 0) {
    console.log(`No results for "${query}".`); return;
  }
  if (matchedRepos.length > 0) {
    console.log(`\n  Repos (${matchedRepos.length}):\n`);
    for (const r of matchedRepos) console.log(`    ${r.id}  (${r.repo})  ${r.category}\n      ${r.description}\n`);
  }
  if (matchedSkills.length > 0) {
    console.log(`  Skills (${matchedSkills.length}):\n`);
    for (const s of matchedSkills) console.log(`    ${s.slug}  [${s.kind}]  ${s.category}\n      ${s.description}\n`);
  }
  if (matchedMcps.length > 0) {
    console.log(`  MCPs (${matchedMcps.length}):\n`);
    for (const m of matchedMcps) console.log(`    ${m.id}  (${m.repo})  ${m.category}\n      ${m.description}\n`);
  }
}

async function cmdRepos(args: string[]): Promise<void> {
  const { flags } = parseFlags(args);
  const query = typeof flags.search === "string" ? flags.search : undefined;
  const category = typeof flags.category === "string" ? flags.category : undefined;

  if (flags.agent === true) {
    const repos = query ? searchRepos(query) : listReposByCategory(category);
    agentOutput(query ? `Repos: "${query}"` : "All repos", repos.map((r) => ({ ...r, kind: "repo" })), ["id", "repo", "category", "description", "clone_command"]);
    return;
  }

  if (query || category) {
    // Static filtered output
    const repos = query ? searchRepos(query) : listReposByCategory(category);
    if (repos.length === 0) { console.log("No matching repositories found."); return; }
    console.log(`\nFound ${repos.length} repositories:\n`);
    for (const repo of repos) console.log(`  ${repo.id}  (${repo.repo})\n    ${repo.description}\n    ${repo.clone_command}\n`);
    return;
  }

  // Default: interactive TUI
  if (process.stdin.isTTY) {
    const allRepos = listReposByCategory();
    const result = await interactiveSearch([], allRepos);
    if (result.action === "quit" || !result.item) return;

    if (result.item.kind === "harness") {
      console.log(`\n  Harness: ${result.item.id}\n  ${result.item.description}\n`);
    } else if (result.item.clone_command) {
      await runClone(result.item.clone_command, result.item.id);
    }
    return;
  }

  // Non-TTY fallback: list all
  const repos = listReposByCategory();
  for (const repo of repos) console.log(`  ${repo.id}  (${repo.repo})  ${repo.description}`);
}

async function cmdClone(args: string[]): Promise<void> {
  const { flags, positional } = parseFlags(args);
  const repoId = positional[0];
  if (!repoId) throw new Error('Usage: solana-new clone <repo-id> [--out <dir>]');

  const repo = listReposByCategory().find((r) => r.id === repoId);
  if (!repo) throw new Error(`Unknown repo: ${repoId}\nRun "solana-new repos" to browse.`);

  const outDir = typeof flags.out === "string" ? flags.out : undefined;
  let command = repo.clone_command;
  if (outDir && command.startsWith("git clone ")) command = `${command} ${outDir}`;

  await runClone(command, repo.id);
}

async function cmdSkills(args: string[]): Promise<void> {
  const { flags } = parseFlags(args);
  const query = typeof flags.search === "string" ? flags.search : undefined;
  const data = skillsData as SkillsData;

  if (flags.agent === true) {
    const allItems = buildSkillsIndex(data);
    const results = query ? searchSkills(allItems, query) : allItems;
    agentOutput(query ? `Skills: "${query}"` : "All Solana skills", results, ["slug", "title", "kind", "category", "description", "install_command"]);
    return;
  }

  if (query) {
    const allItems = buildSkillsIndex(data);
    const results = searchSkills(allItems, query);
    if (results.length === 0) { console.log("No matching skills found."); return; }
    console.log(`\nFound ${results.length} skills:\n`);
    for (const item of results) {
      const tag = item.kind === "official" ? "[official]" : "[community]";
      const cat = item.category !== "official" && item.category !== "community" ? `  (${item.category})` : "";
      console.log(`  ${item.slug} ${tag}${cat}\n    ${item.description}\n    ${item.install_command}\n`);
    }
    return;
  }

  // Default: interactive TUI
  if (process.stdin.isTTY) {
    const result = await interactiveSkills(data);
    if (result.action === "quit" || !result.item) return;
    await runInstall(result.item.install_command, result.item.title);
    return;
  }

  const allItems = buildSkillsIndex(data);
  for (const s of allItems) console.log(`  ${s.slug}  [${s.kind}]  ${s.description}`);
}

async function cmdMcps(args: string[]): Promise<void> {
  const { flags } = parseFlags(args);
  const query = typeof flags.search === "string" ? flags.search : undefined;
  const data = mcpsData as McpsData;

  if (flags.agent === true) {
    const allItems = buildMcpsIndex(data);
    const results = query ? searchMcps(allItems, query) : allItems;
    agentOutput(query ? `MCPs: "${query}"` : "All Solana MCP servers", results.map((m) => ({ ...m, kind: "mcp" })), ["id", "name", "repo", "category", "description", "setup_command"]);
    return;
  }

  if (query) {
    const allItems = buildMcpsIndex(data);
    const results = searchMcps(allItems, query);
    if (results.length === 0) { console.log("No matching MCP servers found."); return; }
    console.log(`\nFound ${results.length} MCP servers:\n`);
    for (const item of results) console.log(`  ${item.id}  (${item.repo})  ${item.category}\n    ${item.description}\n    ${item.setup_command}\n`);
    return;
  }

  // Default: interactive TUI
  if (process.stdin.isTTY) {
    const result = await interactiveMcps(data);
    if (result.action === "quit" || !result.item) return;
    await runInstall(result.item.setup_command, result.item.name);
    return;
  }

  const allItems = buildMcpsIndex(data);
  for (const m of allItems) console.log(`  ${m.id}  (${m.repo})  ${m.description}`);
}

// --- Help ---

function gradientSolanaNew(): string {
  const chars = "solana-new";
  const codes = [
    "\x1b[38;2;130;80;255m", "\x1b[38;2;145;70;250m", "\x1b[38;2;165;60;240m",
    "\x1b[38;2;185;55;225m", "\x1b[38;2;200;50;210m", "\x1b[38;2;215;45;190m",
    "\x1b[38;2;230;40;170m", "\x1b[38;2;240;35;150m", "\x1b[38;2;250;30;135m",
    "\x1b[38;2;255;25;120m",
  ];
  return chars.split("").map((c, i) => `${codes[i]}${c}`).join("") + "\x1b[0m";
}

function printUsage(): void {
  const sn = gradientSolanaNew();
  const DIM = "\x1b[2m";
  const R = "\x1b[0m";
  const B = "\x1b[1m";
  const COL = 50;

  function row(cmd: string, desc: string) {
    const vis = cmd.replace(/\x1b\[[0-9;]*m/g, "").length;
    console.log(`  ${sn} ${cmd}${" ".repeat(Math.max(COL - vis, 2))}${DIM}${desc}${R}`);
  }

  console.log("");
  console.log(`  ${B}Discover${R}  ${DIM}— explore the Solana ecosystem${R}`);
  console.log("");
  row(`${B}<query>${R}`,                                             "Search anything — repos, skills, mcps");
  row("search",                                            "Interactive universal search");
  row(`repos ${DIM}[--search <q>] [--category <cat>]${R}`,           "Browse or filter repos");
  row(`skills ${DIM}[--search <q>]${R}`,                             "Browse or filter skills");
  row(`mcps ${DIM}[--search <q>]${R}`,                               "Browse or filter MCP servers");
  console.log("");
  console.log(`  ${DIM}All commands support ${B}--agent${R}${DIM} for machine-readable output${R}`);
  console.log("");
}

// --- Main ---

async function main(): Promise<void> {
  const [command, ...args] = process.argv.slice(2);

  if (!command || command === "--help" || command === "-h") {
    await renderBanner();
    printUsage();
    return;
  }

  if (command === "search") return cmdSearch(args);
  if (command === "repos") return cmdRepos(args);
  if (command === "clone") return cmdClone(args);
  if (command === "skills") return cmdSkills(args);
  if (command === "mcps") return cmdMcps(args);

  // Unknown command → search
  return cmdSearch([command, ...args]);
}

main().catch((error) => {
  console.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
