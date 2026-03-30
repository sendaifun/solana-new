import { existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";
import { getToken } from "./copilot-auth.js";
import { verifyToken } from "./copilot-client.js";
import { detectAgentCliPaths, getAgentCliInstallHelp } from "./agent-cli.js";
import { RESET, DIM, BOLD, GREEN, RED, YELLOW } from "./colors.js";

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

export async function cmdDoctor(agent: boolean): Promise<void> {
  const checks: { label: string; status: "pass" | "fail" | "warn"; detail: string }[] = [];

  // 1. Node version
  const nodeVersion = process.version;
  const major = parseInt(nodeVersion.slice(1), 10);
  checks.push({
    label: "Node.js",
    status: major >= 20 ? "pass" : "fail",
    detail: major >= 20 ? `${nodeVersion} (>= 20.0.0)` : `${nodeVersion} — requires >= 20.0.0`,
  });

  // 2. Agent CLI installed (Codex or Claude)
  const agentPaths = detectAgentCliPaths();
  const agentParts: string[] = [];
  if (agentPaths.codex) agentParts.push(`codex (${agentPaths.codex})`);
  if (agentPaths.claude) agentParts.push(`claude (${agentPaths.claude})`);
  if (agentParts.length > 0) {
    checks.push({
      label: "Agent CLI",
      status: "pass",
      detail: `installed: ${agentParts.join(", ")}`,
    });
  } else {
    checks.push({
      label: "Agent CLI",
      status: "fail",
      detail: `not found — ${getAgentCliInstallHelp()}`,
    });
  }

  // 3. Copilot token
  const token = getToken();
  if (!token) {
    checks.push({ label: "Copilot token", status: "warn", detail: "not set — solana-new copilot token" });
  } else {
    try {
      const valid = await verifyToken(token);
      checks.push({
        label: "Copilot token",
        status: valid ? "pass" : "fail",
        detail: valid ? "valid" : "invalid — solana-new copilot token",
      });
    } catch {
      checks.push({ label: "Copilot token", status: "warn", detail: "could not verify (network error)" });
    }
  }

  // 4. Skills installed
  const expected = discoverExpectedSkills();
  const claudeSkillsDir = join(homedir(), ".claude", "skills");
  const codexSkillsDir = join(homedir(), ".codex", "skills");
  const installedInEither = expected.filter((s) => existsSync(join(claudeSkillsDir, s)) || existsSync(join(codexSkillsDir, s)));
  const missing = expected.filter((s) => !existsSync(join(claudeSkillsDir, s)) && !existsSync(join(codexSkillsDir, s)));

  if (expected.length === 0) {
    checks.push({ label: "Skills", status: "warn", detail: "could not discover expected skills" });
  } else if (missing.length === 0) {
    checks.push({
      label: "Skills",
      status: "pass",
      detail: `${installedInEither.length}/${expected.length} installed (checked ~/.claude/skills + ~/.codex/skills)`,
    });
  } else {
    checks.push({
      label: "Skills",
      status: "warn",
      detail: `${installedInEither.length}/${expected.length} installed (missing: ${missing.join(", ")})`,
    });
  }

  // Output
  if (agent) {
    console.log("solana-new doctor\n");
    for (const c of checks) {
      const icon = c.status === "pass" ? "OK" : c.status === "warn" ? "WARN" : "FAIL";
      console.log(`[${icon}] ${c.label}: ${c.detail}`);
    }
    const hasIssues = checks.some((c) => c.status !== "pass");
    if (hasIssues) {
      console.log("\nRun solana-new init to install missing skills.");
    }
    return;
  }

  console.log("");
  console.log(`  ${BOLD}solana-new doctor${RESET}`);
  console.log("");

  const COL = 16;
  for (const c of checks) {
    const icon = c.status === "pass" ? `${GREEN}✓${RESET}` : c.status === "warn" ? `${YELLOW}!${RESET}` : `${RED}✗${RESET}`;
    const color = c.status === "pass" ? GREEN : c.status === "warn" ? YELLOW : RED;
    const pad = " ".repeat(Math.max(COL - c.label.length, 1));
    console.log(`  ${icon} ${BOLD}${c.label}${RESET}${pad}${color}${c.detail}${RESET}`);
  }

  const hasIssues = checks.some((c) => c.status !== "pass");
  if (hasIssues) {
    console.log("");
    if (missing.length > 0) console.log(`  ${DIM}Run ${BOLD}solana-new init${RESET}${DIM} to install missing skills.${RESET}`);
  }
  console.log("");
}
