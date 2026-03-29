#!/usr/bin/env node
import process from "node:process";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { listReposByCategory, searchRepos, type ClonableRepo } from "./repos.js";
import { interactiveSearch } from "./interactive-search.js";
import { interactiveSkills, buildSkillsIndex, searchSkills, type SkillsData } from "./interactive-skills.js";
import skillsData from "./data/solana-skills.json" with { type: "json" };
import mcpsData from "./data/solana-mcps.json" with { type: "json" };
import { buildMcpsIndex, searchMcps, type McpsData } from "./interactive-mcps.js";
import { interactiveUniversalSearch, buildUniversalIndex } from "./interactive-universal.js";
import { interactiveOnboarding, agentOnboarding, agentIdea } from "./interactive-onboarding.js";
import { cmdInit } from "./init.js";
import { interactiveWorkspaceSetup } from "./workspace-setup.js";
import { getToken, saveToken, readConfig } from "./copilot-auth.js";
import { verifyToken } from "./copilot-client.js";
import { renderBanner } from "./banner.js";
import { RESET, DIM, BOLD, CYAN, GREEN, YELLOW, RED, GRADIENT_SOLANA_DASH_NEW } from "./colors.js";

// Read version from package.json
const __dirname = dirname(fileURLToPath(import.meta.url));
function getVersion(): string {
  // Try dev path first, then dist path
  for (const rel of ["../package.json", "../../package.json"]) {
    try {
      const pkg = JSON.parse(readFileSync(join(__dirname, rel), "utf8"));
      return pkg.version ?? "0.0.0";
    } catch { /* try next */ }
  }
  return "0.0.0";
}
const VERSION = getVersion();

// --- Flag parsing ---

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

// Global flags that are valid on every command
const GLOBAL_FLAGS = ["agent", "help", "no-color"];

function warnUnknownFlags(flags: Record<string, string | boolean>, known: string[]): void {
  const allKnown = new Set([...GLOBAL_FLAGS, ...known]);
  for (const key of Object.keys(flags)) {
    if (!allKnown.has(key)) {
      console.log(`  ${YELLOW}Warning: unknown flag --${key}${RESET}`);
    }
  }
}

// --- Subcommand help ---

function printSubcommandHelp(name: string, desc: string, usage: string, options: string[] = []): void {
  console.log("");
  console.log(`  ${BOLD}solana-new ${name}${RESET}  ${DIM}— ${desc}${RESET}`);
  console.log("");
  console.log(`  ${BOLD}Usage:${RESET}  ${usage}`);
  if (options.length > 0) {
    console.log("");
    console.log(`  ${BOLD}Options:${RESET}`);
    for (const opt of options) console.log(`    ${opt}`);
  }
  console.log("");
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

async function runShell(command: string, label: string, verb = "Running"): Promise<void> {
  const { spawn } = await import("node:child_process");
  console.log(`\n  ${verb} ${label}...\n  $ ${command}\n`);
  const child = spawn("sh", ["-c", command], { stdio: "inherit" });
  await new Promise<void>((resolve, reject) => {
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Failed with exit code ${code}`));
    });
  });
  console.log(`\n  Done: ${label}\n`);
}

// --- Commands ---

async function cmdSearch(args: string[]): Promise<void> {
  const { flags, positional } = parseFlags(args);
  if (flags.help === true) {
    printSubcommandHelp("search", "Find repos, skills, MCPs", "solana-new search [query]", [
      `${BOLD}--agent${RESET}           Machine-readable output`,
      `${BOLD}--search${RESET} <query>   Search query`,
    ]);
    return;
  }
  warnUnknownFlags(flags, ["search"]);

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

    await runShell(result.item.action_command, result.item.id);
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
  if (flags.help === true) {
    printSubcommandHelp("repos", "Browse / filter repos", "solana-new repos [--search <q>] [--category <c>]", [
      `${BOLD}--search${RESET} <query>     Filter by keyword`,
      `${BOLD}--category${RESET} <name>    Filter by category`,
      `${BOLD}--agent${RESET}              Machine-readable output`,
    ]);
    return;
  }
  warnUnknownFlags(flags, ["search", "category"]);

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
    const result = await interactiveSearch(allRepos);
    if (result.action === "quit" || !result.item) return;

    if (result.item.clone_command) {
      await runShell(result.item.clone_command, result.item.id);
    }
    return;
  }

  // Non-TTY fallback: list all
  const repos = listReposByCategory();
  for (const repo of repos) console.log(`  ${repo.id}  (${repo.repo})  ${repo.description}`);
}

async function cmdSkills(args: string[]): Promise<void> {
  const { flags } = parseFlags(args);
  if (flags.help === true) {
    printSubcommandHelp("skills", "Browse / filter skills", "solana-new skills [--search <q>]", [
      `${BOLD}--search${RESET} <query>   Filter by keyword`,
      `${BOLD}--agent${RESET}            Machine-readable output`,
    ]);
    return;
  }
  warnUnknownFlags(flags, ["search"]);

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
    await runShell(result.item.install_command, result.item.title);
    return;
  }

  const allItems = buildSkillsIndex(data);
  for (const s of allItems) console.log(`  ${s.slug}  [${s.kind}]  ${s.description}`);
}

async function cmdStart(args: string[]): Promise<void> {
  const { flags } = parseFlags(args);
  if (flags.help === true) {
    printSubcommandHelp("start", "Guided onboarding + landscape + workspace setup", "solana-new start", [
      `${BOLD}--agent${RESET}   Machine-readable output`,
    ]);
    return;
  }
  warnUnknownFlags(flags, []);

  if (flags.agent === true) {
    agentOnboarding();
    return;
  }
  const result = await interactiveOnboarding();
  if (result.action === "setup") {
    await interactiveWorkspaceSetup({
      subcategoryLabel: result.subcategoryLabel,
      subcategoryDescription: result.subcategoryDescription,
      recommendation: result.recommendation,
      landscapeData: result.landscapeData,
      ideaText: result.ideaText,
      winnerSkills: result.winnerSkills,
    });
  }
}

async function cmdIdea(args: string[]): Promise<void> {
  const { flags, positional } = parseFlags(args);
  if (flags.help === true) {
    printSubcommandHelp("idea", "Free-form idea — landscape + gap analysis", "solana-new idea [text]", [
      `${BOLD}--agent${RESET}   Machine-readable output`,
    ]);
    return;
  }
  warnUnknownFlags(flags, []);

  const isAgent = flags.agent !== undefined;
  const agentValue = typeof flags.agent === "string" ? flags.agent : "";
  const query = [agentValue, ...positional].join(" ").trim();

  if (isAgent) {
    if (!query) { console.log('Usage: solana-new idea --agent "your idea"'); return; }
    await agentIdea(query);
    return;
  }

  const result = await interactiveOnboarding(query || undefined);
  if (result.action === "setup") {
    await interactiveWorkspaceSetup({
      subcategoryLabel: result.subcategoryLabel,
      subcategoryDescription: result.subcategoryDescription,
      recommendation: result.recommendation,
      landscapeData: result.landscapeData,
      ideaText: result.ideaText,
      winnerSkills: result.winnerSkills,
    });
  }
}

async function verifyAndSave(token: string): Promise<boolean> {
  process.stdout.write(`  ${DIM}Verifying...${RESET}`);
  const valid = await verifyToken(token);
  if (valid) {
    saveToken(token);
    console.log(`\r  ${GREEN}Token verified and saved.${RESET}          `);
  } else {
    console.log(`\r  ${YELLOW}Invalid token. Not saved.${RESET}          `);
  }
  return valid;
}

async function cmdConfig(args: string[]): Promise<void> {
  const { flags, positional } = parseFlags(args);
  if (flags.help === true) {
    printSubcommandHelp("copilot", "Manage Copilot token + settings", "solana-new copilot [token]", [
      `${BOLD}token${RESET}          Update token (interactive)`,
      `${BOLD}token${RESET} <pat>    Set token directly`,
    ]);
    return;
  }

  const sub = positional[0];

  if (!sub || sub === "show") {
    const config = readConfig();
    const token = getToken();
    console.log("");
    console.log(`  ${BOLD}Colosseum Copilot${RESET} ${DIM}(~/.solana-new/config.json)${RESET}`);
    console.log("");
    if (token) {
      const masked = token.slice(0, 20) + "..." + token.slice(-8);
      const src = process.env.COLOSSEUM_COPILOT_PAT ? "env" : "config";
      console.log(`  ${BOLD}copilot-token${RESET}   ${GREEN}set${RESET} ${DIM}(${masked}) [${src}]${RESET}`);
    } else {
      console.log(`  ${BOLD}copilot-token${RESET}   ${YELLOW}not set${RESET}  ${DIM}https://arena.colosseum.org/copilot${RESET}`);
    }
    if (config.copilotTokenSetAt) {
      console.log(`  ${BOLD}token-set-at${RESET}    ${DIM}${config.copilotTokenSetAt}${RESET}`);
    }
    console.log("");
    console.log(`  ${DIM}Update / Regenerate at: ${CYAN}https://arena.colosseum.org/copilot${RESET}`);
    console.log("");
    return;
  }

  if (sub === "token") {
    const tokenValue = positional[1];
    if (!tokenValue) {
      const { createInterface } = await import("node:readline");
      const rl = createInterface({ input: process.stdin, output: process.stdout });
      console.log("");
      console.log(`  ${BOLD}Update Colosseum Copilot token${RESET}`);
      console.log(`  ${DIM}Get a new token: ${CYAN}https://arena.colosseum.org/copilot${RESET}`);
      console.log("");
      const answer = await new Promise<string>((resolve) => {
        rl.question(`  Paste token: `, (a) => { rl.close(); resolve(a.trim()); });
      });
      if (!answer) { console.log(`  ${DIM}Cancelled.${RESET}\n`); return; }
      await verifyAndSave(answer);
      console.log("");
      return;
    }
    await verifyAndSave(tokenValue);
    return;
  }

  console.log(`\n  ${BOLD}Usage:${RESET}`);
  console.log(`    solana-new copilot              Show current config`);
  console.log(`    solana-new copilot token         Update Copilot token (interactive)`);
  console.log(`    solana-new copilot token <pat>   Set Copilot token directly\n`);
}

// --- Ship ---

function shipAgent(): void {
  console.log(`Solana Developer Journey — Idea → Build → Launch (Colosseum Hackathon)`);
  console.log(``);
  console.log(`Phase 1: Idea — Discovery & Planning`);
  console.log(`  find-next-crypto-idea    Discover Solana project ideas for hackathon`);
  console.log(`    claude "What should I build on Solana for the Colosseum hackathon?"`);
  console.log(`  validate-idea            Stress-test with on-chain demand signals`);
  console.log(`    claude "Validate this Solana project idea — is it worth building?"`);
  console.log(`  competitive-landscape    Map existing Solana protocols and gaps`);
  console.log(`    claude "Who are my competitors in the Solana ecosystem?"`);
  console.log(`  defillama-research       Research Solana DeFi opportunities via TVL data`);
  console.log(`    claude "Show me DeFi opportunities on Solana using TVL data"`);
  console.log(``);
  console.log(`Phase 2: Build — Solana Implementation`);
  console.log(`  scaffold-project         Anchor + SDK project setup`);
  console.log(`    claude "Scaffold my Solana project with Anchor and the right stack"`);
  console.log(`  build-with-claude        Guided MVP with Anchor programs + client`);
  console.log(`    claude "Help me build the Solana MVP step by step"`);
  console.log(`  build-defi-protocol      DeFi protocol — AMM, lending, vault`);
  console.log(`    claude "Build a DeFi protocol on Solana — AMM, lending, or vault"`);
  console.log(`  build-blinks             Solana Actions / Blinks`);
  console.log(`    claude "Build a Solana Action / Blink for shareable transactions"`);
  console.log(`  launch-token             SPL token mint + distribution`);
  console.log(`    claude "Launch an SPL token on Solana with metadata and distribution"`);
  console.log(`  build-data-pipeline      Indexer, webhook, analytics`);
  console.log(`    claude "Build a Solana data pipeline — indexer, webhook, or analytics"`);
  console.log(`  build-mobile             Mobile dApp with React Native`);
  console.log(`    claude "Build a Solana mobile app with React Native"`);
  console.log(`  debug-program            Debug failing programs / transactions`);
  console.log(`    claude "Debug my failing Solana program or transaction"`);
  console.log(`  review-and-iterate       Security audit for Anchor programs`);
  console.log(`    claude "Review my Solana program for security and production readiness"`);
  console.log(``);
  console.log(`Phase 3: Launch — Hackathon Submission`);
  console.log(`  deploy-to-mainnet        Mainnet deployment + program verification`);
  console.log(`    claude "Deploy my Solana program to mainnet"`);
  console.log(`  create-pitch-deck        Pitch deck for Colosseum judges`);
  console.log(`    claude "Create a pitch deck for Colosseum hackathon judges"`);
  console.log(`  submit-to-hackathon      Optimized hackathon submission`);
  console.log(`    claude "Prepare my Colosseum hackathon submission"`);
  console.log(``);
  console.log(`Skills auto-installed to ~/.claude/skills/ via: solana-new init`);
  console.log(`Select and launch directly: solana-new ship`);
}

async function cmdShip(args: string[]): Promise<void> {
  const { flags } = parseFlags(args);
  if (flags.help === true) {
    printSubcommandHelp("ship", "Idea → Build → Launch guide", "solana-new ship [--yolo]", [
      `${BOLD}--yolo${RESET}    Send prompt directly to Claude Code (skip review)`,
      `${BOLD}--agent${RESET}   Machine-readable output`,
    ]);
    return;
  }
  warnUnknownFlags(flags, ["yolo"]);

  if (flags.agent === true) {
    shipAgent();
    return;
  }

  // Interactive TUI
  if (process.stdin.isTTY) {
    const { interactiveJourney } = await import("./interactive-journey.js");
    await interactiveJourney({ yolo: flags.yolo === true });
    return;
  }

  // Non-TTY fallback
  shipAgent();
}

// --- Help ---

function printUsage(): void {
  const sn = GRADIENT_SOLANA_DASH_NEW;
  const CMD_COL = 9;
  const ARG_COL = 15;

  function row(cmd: string, args: string, desc: string) {
    const cmdVis = cmd.replace(/\x1b\[[0-9;]*m/g, "").length;
    const argVis = args.replace(/\x1b\[[0-9;]*m/g, "").length;
    const cmdPad = " ".repeat(Math.max(CMD_COL - cmdVis, 1));
    const argPad = " ".repeat(Math.max(ARG_COL - argVis, 1));
    console.log(`  ${sn} ${cmd}${cmdPad}${args}${argPad}${DIM}${desc}${RESET}`);
  }

  console.log(`  ${BOLD}Get Started${RESET}`);
  console.log("");
  row(`${BOLD}init${RESET}`,       "",                             "Install skills \u2192 open Claude Code \u2192 go");
  row(`${BOLD}ship${RESET}`,       `${DIM}[--yolo]${RESET}`,      "Idea \u2192 Build \u2192 Launch guide");
  console.log("");
  console.log(`  ${BOLD}Discover${RESET}  ${DIM}\u2014 explore the Solana ecosystem${RESET}`);
  console.log("");
  row(`${BOLD}start${RESET}`,      "",                             "Guided onboarding + landscape + workspace setup");
  row(`${BOLD}idea${RESET}`,       `${DIM}[text]${RESET}`,         "Free-form idea \u2014 landscape + gap analysis");
  row(`${BOLD}search${RESET}`,     `${DIM}[query]${RESET}`,        "Find repos, skills, MCPs");
  row(`${BOLD}repos${RESET}`,      `${DIM}[--search <q>]${RESET}`, "Browse / filter repos");
  row(`${BOLD}skills${RESET}`,     `${DIM}[--search <q>]${RESET}`, "Browse / filter skills");
  console.log("");
  console.log(`  ${BOLD}Colosseum Copilot${RESET}`);
  console.log("");
  row(`${BOLD}copilot${RESET}`,    `${DIM}[token]${RESET}`,        "Manage Copilot token + settings");
  console.log("");
  console.log(`  ${BOLD}Utilities${RESET}`);
  console.log("");
  row(`${BOLD}feedback${RESET}`,    `${DIM}[message]${RESET}`,        "Send feedback to the team");
  row(`${BOLD}doctor${RESET}`,     "",                             "Check environment setup");
  row(`${BOLD}uninstall${RESET}`,  "",                             "Remove installed skills");
  row(`${BOLD}completion${RESET}`, `${DIM}[bash|zsh]${RESET}`,     "Generate shell completions");
  console.log("");
  console.log(`  ${DIM}All commands support ${BOLD}--agent${RESET}${DIM} for machine-readable output${RESET}`);
  console.log(`  ${DIM}Use ${BOLD}--no-color${RESET}${DIM} or ${BOLD}NO_COLOR=1${RESET}${DIM} to disable colors${RESET}`);
  console.log("");
}

// --- Main ---

async function main(): Promise<void> {
  const [command, ...args] = process.argv.slice(2);

  // Global flags
  if (command === "--version" || command === "-v") {
    console.log(VERSION);
    return;
  }

  if (!command || command === "--help" || command === "-h") {
    await renderBanner();
    printUsage();
    return;
  }

  if (command === "init") { const { flags } = parseFlags(args); return cmdInit(args, flags); }
  if (command === "start") return cmdStart(args);
  if (command === "idea" || command === "landscape") return cmdIdea(args);
  if (command === "ship") return cmdShip(args);
  if (command === "search") return cmdSearch(args);
  if (command === "repos") return cmdRepos(args);
  if (command === "skills") return cmdSkills(args);
  if (command === "copilot" || command === "config") return cmdConfig(args);
  if (command === "doctor") {
    const { flags } = parseFlags(args);
    const { cmdDoctor } = await import("./doctor.js");
    return cmdDoctor(flags.agent === true);
  }
  if (command === "uninstall") {
    const { flags } = parseFlags(args);
    const { cmdUninstall } = await import("./uninstall.js");
    return cmdUninstall(flags.agent === true);
  }
  if (command === "feedback") {
    const { flags } = parseFlags(args);
    const { cmdFeedback } = await import("./feedback.js");
    return cmdFeedback(args.filter((a) => !a.startsWith("--")), flags.agent === true);
  }
  if (command === "completion") {
    const { cmdCompletion } = await import("./completion.js");
    return cmdCompletion(args);
  }

  // Unknown command → search
  return cmdSearch([command, ...args]);
}

main().then(async () => {
  // Non-blocking update check after command completes
  try {
    const { checkForUpdate } = await import("./update-check.js");
    await checkForUpdate(VERSION);
  } catch { /* silent */ }
}).catch((error) => {
  console.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
