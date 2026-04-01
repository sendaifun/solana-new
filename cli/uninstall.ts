import { existsSync, rmSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";
import { RESET, DIM, BOLD, RED } from "./colors.js";
import { BINARY_NAME } from "./branding.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

function getSkillsRoot(): string {
  const devPath = join(__dirname, "..", "skills");
  if (existsSync(devPath)) return devPath;
  const distPath = join(__dirname, "..", "..", "skills");
  if (existsSync(distPath)) return distPath;
  return "";
}

function discoverExpectedSkills(): string[] {
  const root = getSkillsRoot();
  if (!root) return [];
  const phases = readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
  const skills: string[] = [];
  for (const phase of phases) {
    const phaseDir = join(root, phase);
    if (!existsSync(phaseDir)) continue;
    for (const entry of readdirSync(phaseDir, { withFileTypes: true })) {
      if (entry.isDirectory() && existsSync(join(phaseDir, entry.name, "SKILL.md"))) {
        skills.push(entry.name);
      }
    }
  }
  return skills;
}

export function cmdUninstall(agent: boolean): void {
  const expected = discoverExpectedSkills();
  const claudeSkillsDir = join(homedir(), ".claude", "skills");
  const codexSkillsDir = join(homedir(), ".codex", "skills");
  const removedClaude: string[] = [];
  const removedCodex: string[] = [];
  const removedAny = new Set<string>();

  for (const skill of expected) {
    const claudePath = join(claudeSkillsDir, skill);
    if (existsSync(claudePath)) {
      rmSync(claudePath, { recursive: true, force: true });
      removedClaude.push(skill);
      removedAny.add(skill);
    }
    const codexPath = join(codexSkillsDir, skill);
    if (existsSync(codexPath)) {
      rmSync(codexPath, { recursive: true, force: true });
      removedCodex.push(skill);
      removedAny.add(skill);
    }
  }

  if (agent) {
    if (removedAny.size === 0) {
      console.log("No skills to remove.");
    } else {
      console.log(`Removed ${removedAny.size} skills from Claude/Codex skill dirs.`);
      if (removedClaude.length > 0) {
        console.log("  ~/.claude/skills:");
        for (const s of removedClaude) console.log(`    - ${s}`);
      }
      if (removedCodex.length > 0) {
        console.log("  ~/.codex/skills:");
        for (const s of removedCodex) console.log(`    - ${s}`);
      }
      console.log(`\nRun ${BINARY_NAME} init to reinstall.`);
    }
    return;
  }

  console.log("");
  if (removedAny.size === 0) {
    console.log(`  ${DIM}No skills installed to remove.${RESET}`);
  } else {
    console.log(`  ${BOLD}Removed ${removedAny.size} skills:${RESET}`);
    console.log("");
    if (removedClaude.length > 0) {
      console.log(`  ${BOLD}~/.claude/skills/${RESET}`);
      for (const s of removedClaude) console.log(`    ${RED}-${RESET} ${s}`);
      console.log("");
    }
    if (removedCodex.length > 0) {
      console.log(`  ${BOLD}~/.codex/skills/${RESET}`);
      for (const s of removedCodex) console.log(`    ${RED}-${RESET} ${s}`);
      console.log("");
    }
    console.log("");
    console.log(`  ${DIM}Run ${BOLD}${BINARY_NAME} init${RESET}${DIM} to reinstall.${RESET}`);
  }
  console.log("");
}
