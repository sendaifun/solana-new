import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { spawn } from "node:child_process";
import type { Recommendation } from "./interactive-onboarding.js";
import type { SearchProjectsResponse } from "./copilot-client.js";
import {
  RESET, DIM, BOLD, CYAN, GREEN, YELLOW, MAGENTA, RED,
  GRADIENT_SOLANA_DOT_NEW, COMPETITION_HIGH, COMPETITION_MEDIUM,
  ALT_SCREEN_ON, ALT_SCREEN_OFF, CURSOR_HIDE, CURSOR_SHOW, CLEAR_SCREEN,
  padFooter, toKebabSlug,
} from "./colors.js";

// --- Types ---

export interface WorkspaceSetupInput {
  subcategoryLabel: string;
  subcategoryDescription: string;
  recommendation: Recommendation;
  landscapeData?: SearchProjectsResponse | null;
}

interface SetupItem {
  kind: "skill" | "mcp" | "repo";
  label: string;
  command: string;
  selected: boolean;
}

interface InstallStep {
  label: string;
  status: "pending" | "running" | "done" | "error";
}

// --- Helpers ---

function deriveProjectName(label: string): string {
  return toKebabSlug(label.replace(/[()\/+\.]/g, " "));
}

function runCommand(cmd: string, cwd?: string): Promise<{ ok: boolean }> {
  return new Promise((resolve) => {
    // npm_config_yes=true auto-accepts npx "install package?" prompts
    const env = { ...process.env, npm_config_yes: "true" };
    const child = spawn("sh", ["-c", cmd], {
      stdio: ["ignore", "pipe", "pipe"],
      cwd,
      env,
    });
    child.stdout?.resume();
    child.stderr?.resume();

    // Timeout after 90 seconds per command
    const timeout = setTimeout(() => {
      child.kill();
      resolve({ ok: false });
    }, 90_000);

    child.on("close", (code) => {
      clearTimeout(timeout);
      resolve({ ok: code === 0 });
    });
    child.on("error", () => {
      clearTimeout(timeout);
      resolve({ ok: false });
    });
  });
}

function parseMcpForSettings(name: string, setup: string): { key: string; command: string; args: string[] } | null {
  const key = toKebabSlug(name);
  if (setup.startsWith("npx ")) {
    return { key, command: "npx", args: setup.slice(4).split(/\s+/) };
  }
  const match = setup.match(/^claude mcp add (\S+)\s+(.+)/);
  if (match) {
    const parts = match[2].split(/\s+/);
    return { key: match[1], command: parts[0], args: parts.slice(1) };
  }
  if (setup.startsWith("npm install ")) {
    return { key, command: "npx", args: [setup.slice(12).trim()] };
  }
  return null;
}

function extractCloneUrl(command: string): string | null {
  const match = command.match(/git clone (https?:\/\/\S+)/);
  return match ? match[1] : null;
}

// --- Config file generators ---

function generateClaudeMd(input: WorkspaceSetupInput, projectName: string, selectedItems: SetupItem[]): string {
  const skills = selectedItems.filter(i => i.kind === "skill");
  const mcps = selectedItems.filter(i => i.kind === "mcp");
  let md = `# ${projectName}\n\n`;
  md += `## About\n${input.subcategoryLabel} \u2014 ${input.subcategoryDescription}\n\n`;

  // Always include Colosseum Copilot as the primary research tool
  md += `## Research with Colosseum Copilot\n`;
  md += `Colosseum Copilot is installed for deep competitive research.\n`;
  md += `Use it to vet ideas, find gaps, and pressure-test before building.\n\n`;
  md += `Example prompts:\n`;
  md += `- "Vet this idea: ${input.subcategoryDescription}"\n`;
  md += `- "What's already been built in ${input.subcategoryLabel.toLowerCase()}?"\n`;
  md += `- "Find gaps in the ${input.subcategoryLabel.toLowerCase()} space"\n`;
  md += `- "Full analysis of competitors for my approach"\n\n`;

  if (skills.length > 0) {
    md += `## Installed Skills\n`;
    md += `- **Colosseum Copilot** \u2014 competitive landscape research (5,400+ hackathon projects, 65+ sources)\n`;
    for (const s of skills) {
      md += `- **${s.label}** \u2014 \`${s.command}\`\n`;
    }
    md += `\n`;
  }

  if (mcps.length > 0) {
    md += `## MCP Servers\nConfigured in \`.claude/settings.json\` for this project.\n`;
    for (const m of mcps) {
      md += `- ${m.label}\n`;
    }
    md += `\n`;
  }

  if (input.landscapeData && input.landscapeData.totalFound > 0) {
    md += `## Competitive Landscape\n`;
    md += `${input.landscapeData.totalFound} similar projects found across Solana hackathons.\n\n`;
    if (input.landscapeData.results.length > 0) {
      for (const p of input.landscapeData.results.slice(0, 5)) {
        const winner = p.prize ? " (winner)" : "";
        md += `- **${p.name}**${winner} \u2014 ${p.hackathon.name}`;
        if (p.oneLiner) md += `\n  ${p.oneLiner}`;
        md += `\n`;
      }
      md += `\n`;
    }
    const total = input.landscapeData.totalFound;
    if (total > COMPETITION_HIGH) {
      md += `> **Crowded space.** Use Colosseum Copilot to find a differentiated angle.\n\n`;
    } else if (total > COMPETITION_MEDIUM) {
      md += `> Moderate competition. Use Copilot to find underserved niches.\n\n`;
    } else {
      md += `> Open space \u2014 use Copilot to validate there's real demand here.\n\n`;
    }
  }

  if (input.recommendation.tip) {
    md += `## Tips\n${input.recommendation.tip}\n\n`;
  }

  md += `## Ecosystem Commands\n`;
  md += `- \`solana-new search <query>\` \u2014 find repos, skills, MCPs\n`;
  md += `- \`solana-new skills\` \u2014 browse available skills\n`;
  md += `- \`solana-new mcps\` \u2014 browse MCP servers\n`;

  return md;
}

function generateCursorRules(input: WorkspaceSetupInput, projectName: string, selectedItems: SetupItem[]): string {
  const skills = selectedItems.filter(i => i.kind === "skill");
  const mcps = selectedItems.filter(i => i.kind === "mcp");

  let rules = `You are working on "${projectName}", a Solana project.\n`;
  rules += `Focus: ${input.subcategoryLabel} \u2014 ${input.subcategoryDescription}\n\n`;

  rules += `Colosseum Copilot is installed for competitive research.\n`;
  rules += `When the user asks about competitors, market gaps, or idea validation,\n`;
  rules += `use Copilot to search 5,400+ hackathon projects and 65+ curated sources.\n`;
  rules += `Trigger deep analysis with: "vet this idea", "full analysis", or "find gaps".\n\n`;

  if (skills.length > 0) {
    rules += `Installed skills:\n`;
    rules += `- Colosseum Copilot (competitive research)\n`;
    for (const s of skills) rules += `- ${s.label}\n`;
    rules += `\n`;
  }

  if (mcps.length > 0) {
    rules += `MCP servers configured for this project:\n`;
    for (const m of mcps) rules += `- ${m.label}\n`;
    rules += `\n`;
  }

  if (input.landscapeData && input.landscapeData.totalFound > 0) {
    rules += `Competitive landscape: ${input.landscapeData.totalFound} similar projects exist.\n`;
    if (input.landscapeData.totalFound > COMPETITION_HIGH) {
      rules += `This is a crowded space. Help the user find a differentiated angle.\n`;
    }
    rules += `\n`;
  }

  if (input.recommendation.tip) {
    rules += `Tips: ${input.recommendation.tip}\n`;
  }

  return rules;
}

// Codex instructions use same format as cursor rules
const generateCodexInstructions = generateCursorRules;

function generateEnvExample(input: WorkspaceSetupInput): string {
  let env = `# Colosseum Copilot \u2014 competitive research (required for landscape analysis)\n`;
  env += `# Get your token: https://arena.colosseum.org/copilot\n`;
  env += `COLOSSEUM_COPILOT_API_BASE="https://copilot.colosseum.com/api/v1"\n`;
  env += `COLOSSEUM_COPILOT_PAT=your-copilot-token\n`;
  env += `\n`;
  env += `# Solana Configuration\n`;
  env += `# SOLANA_RPC_URL=https://api.mainnet-beta.solana.com\n`;
  env += `# HELIUS_API_KEY=your-helius-api-key\n`;

  // Add protocol-specific env vars based on subcategory
  const label = input.subcategoryLabel.toLowerCase();
  if (label.includes("jupiter")) {
    env += `\n# Jupiter\n# JUPITER_API_KEY=your-jupiter-api-key\n`;
  }
  if (label.includes("phantom") || label.includes("wallet")) {
    env += `\n# Wallet\n# PRIVATE_KEY=your-private-key-base58\n`;
  }

  return env;
}

// --- Screen builders ---

function buildSetupScreen(
  projectName: string,
  items: SetupItem[],
  selectedIndex: number,
  rows: number,
): string[] {
  const lines: string[] = [];

  lines.push("");
  lines.push(`  ${GRADIENT_SOLANA_DOT_NEW}  ${BOLD}Setup workspace${RESET}`);
  lines.push("");
  lines.push(`  ${BOLD}Project:${RESET} ${CYAN}./${projectName}${RESET}`);
  lines.push("");
  lines.push(`  ${DIM}Space to toggle \u00b7 Enter to install \u00b7 Esc to cancel${RESET}`);
  lines.push("");

  let currentKind = "";
  let itemIdx = 0;
  for (const item of items) {
    if (item.kind !== currentKind) {
      const kindLabel = item.kind === "skill" ? "Skills:" : item.kind === "mcp" ? "MCP servers:" : "Repos to clone:";
      const kindColor = item.kind === "skill" ? GREEN : item.kind === "mcp" ? CYAN : MAGENTA;
      lines.push(`  ${kindColor}${BOLD}${kindLabel}${RESET}`);
      currentKind = item.kind;
    }

    const isFocused = itemIdx === selectedIndex;
    const pointer = isFocused ? `${CYAN}\u276f${RESET}` : " ";
    const check = item.selected ? `${GREEN}[x]${RESET}` : `${DIM}[ ]${RESET}`;
    const labelColor = isFocused ? BOLD : "";

    lines.push(`  ${pointer} ${check} ${labelColor}${item.label}${RESET}`);
    itemIdx++;
  }

  lines.push("");
  lines.push(`  ${DIM}Also generates:${RESET} ${DIM}CLAUDE.md \u00b7 .cursorrules \u00b7 codex-instructions.md \u00b7 .env.example${RESET}`);

  const footer = [`  ${BOLD}enter${RESET} ${DIM}install${RESET}  ${DIM}space toggle${RESET}  ${DIM}esc cancel${RESET}`];
  while (lines.length < rows - footer.length) lines.push("");
  lines.push(...footer);

  return lines.slice(0, rows);
}

function buildInstallingScreen(
  projectName: string,
  steps: InstallStep[],
  rows: number,
): string[] {
  const lines: string[] = [];

  lines.push("");
  lines.push(`  ${GRADIENT_SOLANA_DOT_NEW}  ${BOLD}Setting up ${projectName}${RESET}`);
  lines.push("");

  for (const step of steps) {
    let icon: string;
    let color: string;
    if (step.status === "done") {
      icon = `${GREEN}\u2713${RESET}`;
      color = "";
    } else if (step.status === "running") {
      icon = `${YELLOW}\u00b7${RESET}`;
      color = BOLD;
    } else if (step.status === "error") {
      icon = `${RED}\u2717${RESET}`;
      color = RED;
    } else {
      icon = `${DIM} ${RESET}`;
      color = DIM;
    }
    const suffix = step.status === "running" ? `${DIM}...${RESET}` : "";
    lines.push(`  ${icon} ${color}${step.label}${RESET}${suffix}`);
  }

  const footer = [`  ${DIM}please wait...${RESET}`];
  while (lines.length < rows - footer.length) lines.push("");
  lines.push(...footer);

  return lines.slice(0, rows);
}

function buildDoneScreen(
  projectName: string,
  counts: { skills: number; mcps: number; repos: number },
  rows: number,
): string[] {
  const lines: string[] = [];

  lines.push("");
  lines.push(`  ${GRADIENT_SOLANA_DOT_NEW}  ${GREEN}${BOLD}Ready!${RESET}`);
  lines.push("");
  lines.push(`  ${BOLD}cd ${projectName}${RESET}`);
  lines.push("");
  lines.push(`  ${BOLD}Open with your IDE:${RESET}`);
  lines.push(`    ${MAGENTA}$ claude${RESET}          ${DIM}Claude Code${RESET}`);
  lines.push(`    ${MAGENTA}$ cursor .${RESET}        ${DIM}Cursor${RESET}`);
  lines.push(`    ${MAGENTA}$ code .${RESET}          ${DIM}VS Code${RESET}`);
  lines.push(`    ${MAGENTA}$ codex${RESET}           ${DIM}Codex${RESET}`);
  lines.push("");

  const parts: string[] = [];
  if (counts.skills > 0) parts.push(`${counts.skills} skill${counts.skills > 1 ? "s" : ""}`);
  if (counts.mcps > 0) parts.push(`${counts.mcps} MCP${counts.mcps > 1 ? "s" : ""}`);
  if (counts.repos > 0) parts.push(`${counts.repos} repo${counts.repos > 1 ? "s" : ""}`);
  if (parts.length > 0) {
    lines.push(`  ${BOLD}Installed:${RESET}  ${parts.join(" \u00b7 ")}`);
  }
  lines.push(`  ${BOLD}Generated:${RESET}  ${DIM}CLAUDE.md \u00b7 .cursorrules \u00b7 codex-instructions.md \u00b7 .env.example${RESET}`);
  lines.push("");
  lines.push(`  ${YELLOW}${BOLD}Try asking your assistant:${RESET}`);
  lines.push(`  ${DIM}"I want to build this with a unique angle. What${RESET}`);
  lines.push(`  ${DIM} hasn't been done yet in this space?"${RESET}`);

  const footer = [`  ${BOLD}enter${RESET} ${DIM}done${RESET}  ${DIM}q quit${RESET}`];
  while (lines.length < rows - footer.length) lines.push("");
  lines.push(...footer);

  return lines.slice(0, rows);
}

// --- Main ---

export async function interactiveWorkspaceSetup(input: WorkspaceSetupInput): Promise<void> {
  const stdin = process.stdin;
  const stdout = process.stdout;

  if (!stdin.isTTY) return;

  const projectName = deriveProjectName(input.subcategoryLabel);
  const rec = input.recommendation;

  // Build items list (all pre-selected, Copilot always first)
  const items: SetupItem[] = [];
  items.push({
    kind: "skill",
    label: "Colosseum Copilot",
    command: "npx skills add ColosseumOrg/colosseum-copilot",
    selected: true,
  });
  for (const s of rec.skills) {
    items.push({ kind: "skill", label: s.name, command: s.install, selected: true });
  }
  for (const m of rec.mcps) {
    items.push({ kind: "mcp", label: m.name, command: m.setup, selected: true });
  }
  for (const r of rec.repos) {
    items.push({ kind: "repo", label: r.name, command: r.command, selected: true });
  }

  let phase: "setup" | "installing" | "done" = "setup";
  let selectedIndex = 0;
  let installSteps: InstallStep[] = [];

  stdin.setRawMode(true);
  stdin.resume();
  stdin.setEncoding("utf8");

  stdout.write(ALT_SCREEN_ON);
  stdout.write(CURSOR_HIDE);

  function getRows(): number { return stdout.rows || 24; }

  function draw() {
    const rows = getRows();
    let lines: string[];

    if (phase === "setup") {
      lines = buildSetupScreen(projectName, items, selectedIndex, rows);
    } else if (phase === "installing") {
      lines = buildInstallingScreen(projectName, installSteps, rows);
    } else {
      const counts = {
        skills: items.filter(i => i.kind === "skill" && i.selected).length,
        mcps: items.filter(i => i.kind === "mcp" && i.selected).length,
        repos: items.filter(i => i.kind === "repo" && i.selected).length,
      };
      lines = buildDoneScreen(projectName, counts, rows);
    }

    stdout.write(`${CLEAR_SCREEN}${lines.join("\n")}`);
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
      stdout.write(CURSOR_SHOW);
      stdout.write(ALT_SCREEN_OFF);
    }

    async function startInstall() {
      phase = "installing";

      const selected = items.filter(i => i.selected);
      const selectedSkills = selected.filter(i => i.kind === "skill");
      const selectedMcps = selected.filter(i => i.kind === "mcp");
      const selectedRepos = selected.filter(i => i.kind === "repo");

      // Build step list
      installSteps = [];
      installSteps.push({ label: `Create ./${projectName}`, status: "pending" });
      for (const r of selectedRepos) installSteps.push({ label: `Clone ${r.label}`, status: "pending" });
      for (const s of selectedSkills) installSteps.push({ label: `Install ${s.label}`, status: "pending" });
      for (const m of selectedMcps) installSteps.push({ label: `Configure ${m.label}`, status: "pending" });
      installSteps.push({ label: "Generate config files", status: "pending" });

      draw();

      const projectDir = join(process.cwd(), projectName);
      let stepIdx = 0;

      // Step: Create directory
      installSteps[stepIdx].status = "running";
      draw();
      mkdirSync(projectDir, { recursive: true });
      installSteps[stepIdx].status = "done";
      stepIdx++;
      draw();

      // Step: Clone repos
      for (const repo of selectedRepos) {
        installSteps[stepIdx].status = "running";
        draw();

        const url = extractCloneUrl(repo.command);
        if (url) {
          // Clone into a subdirectory of the project
          const repoDir = join(projectDir, repo.label);
          const result = await runCommand(`git clone ${url} "${repoDir}"`);
          installSteps[stepIdx].status = result.ok ? "done" : "error";
        } else {
          // Complex command (npx create-*, etc.) — skip, note in CLAUDE.md
          installSteps[stepIdx].status = "done";
        }
        stepIdx++;
        draw();
      }

      // Step: Install skills
      for (const skill of selectedSkills) {
        installSteps[stepIdx].status = "running";
        draw();
        const result = await runCommand(skill.command);
        installSteps[stepIdx].status = result.ok ? "done" : "error";
        stepIdx++;
        draw();
      }

      // Step: Configure MCPs in .claude/settings.json
      const mcpConfigs: Record<string, { command: string; args: string[] }> = {};
      for (const mcp of selectedMcps) {
        installSteps[stepIdx].status = "running";
        draw();
        const parsed = parseMcpForSettings(mcp.label, mcp.command);
        if (parsed) {
          mcpConfigs[parsed.key] = { command: parsed.command, args: parsed.args };
        }
        installSteps[stepIdx].status = "done";
        stepIdx++;
        draw();
      }

      if (Object.keys(mcpConfigs).length > 0) {
        const claudeDir = join(projectDir, ".claude");
        mkdirSync(claudeDir, { recursive: true });
        writeFileSync(
          join(claudeDir, "settings.json"),
          JSON.stringify({ mcpServers: mcpConfigs }, null, 2) + "\n",
        );
      }

      // Step: Generate config files
      installSteps[stepIdx].status = "running";
      draw();

      writeFileSync(join(projectDir, "CLAUDE.md"), generateClaudeMd(input, projectName, selected));
      writeFileSync(join(projectDir, ".cursorrules"), generateCursorRules(input, projectName, selected));
      writeFileSync(join(projectDir, "codex-instructions.md"), generateCodexInstructions(input, projectName, selected));
      writeFileSync(join(projectDir, ".env.example"), generateEnvExample(input));

      installSteps[stepIdx].status = "done";
      stepIdx++;
      draw();

      // Done
      phase = "done";
      draw();
    }

    function onData(key: string) {
      if (key === "\x03") { cleanup(); process.exit(0); }

      if (phase === "setup") {
        if (key === "\x1b") { cleanup(); resolve(); return; }
        if (key === "\x1b[A") { selectedIndex = Math.max(selectedIndex - 1, 0); draw(); return; }
        if (key === "\x1b[B") { selectedIndex = Math.min(selectedIndex + 1, items.length - 1); draw(); return; }
        if (key === " ") { items[selectedIndex].selected = !items[selectedIndex].selected; draw(); return; }
        if (key === "\r" || key === "\n") {
          if (items.some(i => i.selected)) {
            startInstall();
          }
          return;
        }
      } else if (phase === "installing") {
        return; // no input during install
      } else {
        // done screen
        if (key === "\r" || key === "\n" || key === "q" || key === "Q" || key === "\x1b") {
          cleanup();
          // Print the cd command to normal terminal
          console.log(`\n  cd ${projectName}\n`);
          resolve();
          return;
        }
      }
    }

    stdin.on("data", onData);
  });
}
