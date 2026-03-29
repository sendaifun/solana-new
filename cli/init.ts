import { existsSync, mkdirSync, cpSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";
import { spawn } from "node:child_process";
import { RESET, DIM, BOLD, CYAN, GREEN, YELLOW, MAGENTA } from "./colors.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Resolve the skills directory relative to the package root
// In dev: cli/ → ../skills/
// In dist: dist/cli/ → ../skills/
function getSkillsRoot(): string {
  // Try relative to source (dev mode via tsx)
  const devPath = join(__dirname, "..", "skills");
  if (existsSync(devPath)) return devPath;
  // Try relative to dist (built mode)
  const distPath = join(__dirname, "..", "..", "skills");
  if (existsSync(distPath)) return distPath;
  throw new Error("Could not find skills directory");
}

interface SkillEntry {
  phase: string;
  name: string;
  srcDir: string;
}

function discoverSkills(): SkillEntry[] {
  const root = getSkillsRoot();
  const phases = ["idea", "build", "launch"];
  const skills: SkillEntry[] = [];

  for (const phase of phases) {
    const phaseDir = join(root, phase);
    if (!existsSync(phaseDir)) continue;
    for (const entry of readdirSync(phaseDir, { withFileTypes: true })) {
      if (entry.isDirectory() && existsSync(join(phaseDir, entry.name, "SKILL.md"))) {
        skills.push({ phase, name: entry.name, srcDir: join(phaseDir, entry.name) });
      }
    }
  }
  return skills;
}

function installSkillsGlobal(agent: boolean): { installed: string[]; skipped: string[] } {
  const claudeSkillsDir = join(homedir(), ".claude", "skills");
  const codexSkillsDir = join(homedir(), ".codex", "skills");
  const skills = discoverSkills();
  const installed: string[] = [];
  const skipped: string[] = [];

  for (const skill of skills) {
    // Install to Claude Code
    const claudeDest = join(claudeSkillsDir, skill.name);
    if (existsSync(claudeDest)) {
      skipped.push(skill.name);
    } else {
      mkdirSync(claudeDest, { recursive: true });
      cpSync(skill.srcDir, claudeDest, {
        recursive: true,
        filter: (src) => {
          // Skip generated artifacts (HTML reports, JSON packs, etc.)
          const base = src.split("/").pop() ?? "";
          if (base.match(/^(idea-shortlist|idea-deep-dive|research-pack|research-worksheet)-\d/)) return false;
          return true;
        },
      });
      installed.push(skill.name);
    }

    // Also install to Codex if .codex directory exists
    if (existsSync(join(homedir(), ".codex"))) {
      const codexDest = join(codexSkillsDir, skill.name);
      if (!existsSync(codexDest)) {
        mkdirSync(codexDest, { recursive: true });
        cpSync(skill.srcDir, codexDest, {
          recursive: true,
          filter: (src) => {
            const base = src.split("/").pop() ?? "";
            if (base.match(/^(idea-shortlist|idea-deep-dive|research-pack|research-worksheet)-\d/)) return false;
            return true;
          },
        });
      }
    }
  }

  // Install data to _data/ (skills/data/* + cli/data/ catalogs)
  const skillsDataRoot = join(getSkillsRoot(), "data");
  const cliDataRoot = join(__dirname, "..", "cli", "data");
  const cliDataRootDist = join(__dirname, "data");
  const catalogSrc = existsSync(cliDataRoot) ? cliDataRoot : cliDataRootDist;

  const targets = [join(claudeSkillsDir, "_data")];
  if (existsSync(join(homedir(), ".codex"))) {
    targets.push(join(codexSkillsDir, "_data"));
  }

  for (const dest of targets) {
    if (existsSync(dest)) continue;
    mkdirSync(dest, { recursive: true });
    // Copy skills/data (ideas, defi, specs) — skip raw-html
    if (existsSync(skillsDataRoot)) {
      cpSync(skillsDataRoot, dest, {
        recursive: true,
        filter: (src) => !src.split("/").pop()?.startsWith("raw-html"),
      });
    }
    // Copy catalog JSONs from cli/data/
    if (existsSync(catalogSrc)) {
      const catalogDest = join(dest, "catalogs");
      mkdirSync(catalogDest, { recursive: true });
      for (const f of readdirSync(catalogSrc)) {
        if (f.endsWith(".json")) {
          cpSync(join(catalogSrc, f), join(catalogDest, f));
        }
      }
    }
  }

  return { installed, skipped };
}

function generateProjectClaudeMd(): string {
  let md = `# Solana Project — Colosseum Hackathon\n\n`;
  md += `## Your Journey: Idea → Build → Launch\n\n`;
  md += `16 skills are pre-loaded. Just ask naturally.\n\n`;

  md += `### Phase 1: Idea — Discovery & Planning\n`;
  md += `- "What should I build on Solana for the Colosseum hackathon?" — discover and rank ideas\n`;
  md += `- "Validate this Solana project idea" — stress-test with on-chain demand signals\n`;
  md += `- "Who are my competitors in the Solana ecosystem?" — map protocols and gaps\n`;
  md += `- "Show me DeFi opportunities on Solana using TVL data" — research via DefiLlama\n\n`;

  md += `### Phase 2: Build — Solana Implementation\n`;
  md += `- "Scaffold my Solana project with Anchor" — Anchor + SDK project setup\n`;
  md += `- "Help me build the Solana MVP step by step" — guided implementation\n`;
  md += `- "Build a DeFi protocol on Solana" — AMM, lending, vault with CPIs and PDAs\n`;
  md += `- "Build a Solana Action / Blink" — shareable transaction links\n`;
  md += `- "Launch an SPL token on Solana" — token mint, metadata, distribution\n`;
  md += `- "Build a Solana data pipeline" — indexer, webhook, analytics\n`;
  md += `- "Build a Solana mobile app" — React Native + mobile wallet adapter\n`;
  md += `- "Debug my failing Solana program" — diagnose program errors and failed TXs\n`;
  md += `- "Review my Solana program for security" — audit for exploits and best practices\n\n`;

  md += `### Phase 3: Launch — Hackathon Submission\n`;
  md += `- "Deploy my Solana program to mainnet" — pre-flight checklist + verification\n`;
  md += `- "Create a pitch deck for Colosseum judges" — 12-slide hackathon framework\n`;
  md += `- "Prepare my Colosseum hackathon submission" — optimized for judges\n\n`;

  md += `> Each phase writes context to \`.solana-new/\` so the next phase picks up automatically.\n\n`;

  md += `## Ecosystem\n`;
  md += `- \`solana-new search <query>\` — find repos, skills, MCPs\n`;
  md += `- \`solana-new repos\` — 59 cloneable Solana repos\n`;
  md += `- \`solana-new skills\` — 66 ecosystem skills\n`;
  md += `- \`solana-new mcps\` — 49 MCP servers\n`;

  return md;
}

export async function cmdInit(args: string[], flags: Record<string, string | boolean>): Promise<void> {
  const agent = flags.agent === true;
  const skipClaudeMd = flags["no-claude-md"] === true;

  // Step 1: Install skills globally
  const { installed, skipped } = installSkillsGlobal(agent);
  const total = installed.length + skipped.length;

  if (agent) {
    // Machine-readable output for Claude Code / Codex
    console.log(`solana-new init — ${total} skills (Colosseum hackathon)`);
    console.log(``);
    if (installed.length > 0) {
      console.log(`Installed ${installed.length} skills to ~/.claude/skills/:`);
      for (const s of installed) console.log(`  + ${s}`);
    }
    if (skipped.length > 0) {
      console.log(`Already installed (${skipped.length}):`);
      for (const s of skipped) console.log(`  = ${s}`);
    }
    console.log(``);
    console.log(`Ready. Ask Claude Code:`);
    console.log(`  "What should I build in crypto?"     → Idea phase`);
    console.log(`  "Help me build the MVP"              → Build phase`);
    console.log(`  "Deploy to mainnet"                  → Launch phase`);
  } else {
    // Human-friendly output
    console.log(``);
    console.log(`  ${BOLD}solana-new init${RESET}`);
    console.log(``);

    if (installed.length > 0) {
      console.log(`  ${GREEN}${BOLD}Installed ${installed.length} skills:${RESET}`);
      for (const s of installed) console.log(`    ${GREEN}+${RESET} ${s}`);
      console.log(``);
    }
    if (skipped.length > 0) {
      console.log(`  ${DIM}Already installed (${skipped.length}):${RESET}`);
      for (const s of skipped) console.log(`    ${DIM}= ${s}${RESET}`);
      console.log(``);
    }

    console.log(`  ${BOLD}Skills installed to:${RESET}`);
    console.log(`    ${CYAN}~/.claude/skills/${RESET}  ${DIM}(Claude Code)${RESET}`);
    if (existsSync(join(homedir(), ".codex"))) {
      console.log(`    ${CYAN}~/.codex/skills/${RESET}  ${DIM}(Codex)${RESET}`);
    }
    console.log(``);
  }

  // Step 2: Generate CLAUDE.md if in a project directory and not skipped
  if (!skipClaudeMd && !existsSync("CLAUDE.md")) {
    writeFileSync("CLAUDE.md", generateProjectClaudeMd());
    if (agent) {
      console.log(`Generated: CLAUDE.md (journey guide for this project)`);
    } else {
      console.log(`  ${GREEN}+${RESET} Generated ${BOLD}CLAUDE.md${RESET} with journey guide`);
      console.log(``);
    }
  }

  if (!agent) {
    console.log(`  ${YELLOW}${BOLD}Launch Claude Code:${RESET}`);
    console.log(`  ${MAGENTA}$ solana-new ship${RESET}  ${DIM}pick a skill → opens Claude Code with prompt${RESET}`);
    console.log(`  ${MAGENTA}$ claude "What should I build in crypto?"${RESET}`);
    console.log(``);
  }
}
