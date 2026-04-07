import { existsSync, readdirSync } from "node:fs";
import { execSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";
import { getToken } from "./copilot-auth.js";
import { verifyToken } from "./copilot-client.js";
import { detectAgentCliPaths, getAgentCliInstallHelp } from "./agent-cli.js";
import { RESET, DIM, BOLD, GREEN, RED, YELLOW } from "./colors.js";
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

/** Run a command and return trimmed stdout, or empty string on failure. */
function tryExec(cmd: string, timeoutMs = 10000): string {
  try {
    return execSync(cmd, { encoding: "utf8", timeout: timeoutMs, stdio: ["pipe", "pipe", "pipe"] }).trim();
  } catch {
    return "";
  }
}

/** Detect which Solana project type is in cwd (if any). */
function detectProjectContext(): { hasAnchor: boolean; hasCargo: boolean; hasNode: boolean } {
  const cwd = process.cwd();
  return {
    hasAnchor: existsSync(join(cwd, "Anchor.toml")),
    hasCargo: existsSync(join(cwd, "Cargo.toml")),
    hasNode: existsSync(join(cwd, "package.json")),
  };
}

export async function cmdDoctor(agent: boolean): Promise<void> {
  const checks: { label: string; status: "pass" | "fail" | "warn"; detail: string }[] = [];
  const ctx = detectProjectContext();

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
    checks.push({ label: "Copilot token", status: "warn", detail: `not set — ${BINARY_NAME} copilot --token` });
  } else {
    try {
      const valid = await verifyToken(token);
      checks.push({
        label: "Copilot token",
        status: valid ? "pass" : "fail",
        detail: valid ? "valid" : `invalid — ${BINARY_NAME} copilot --token`,
      });
    } catch {
      checks.push({ label: "Copilot token", status: "warn", detail: "could not verify (network error)" });
    }
  }

  // 4. Solana CLI (always check — every Solana dev needs it)
  const solanaVersion = tryExec("solana --version");
  if (!solanaVersion) {
    checks.push({
      label: "Solana CLI",
      status: "fail",
      detail: "not installed — sh -c \"$(curl -sSfL https://release.anza.xyz/stable/install)\"",
    });
  } else {
    // solana-cli 2.1.5 (src:abcdef; feat:1234) → extract version number
    const vMatch = solanaVersion.match(/(\d+\.\d+\.\d+)/);
    const ver = vMatch ? vMatch[1] : solanaVersion;
    const solMajor = parseInt(ver.split(".")[0], 10);
    checks.push({
      label: "Solana CLI",
      status: solMajor >= 2 ? "pass" : "warn",
      detail: solMajor >= 2 ? `v${ver}` : `v${ver} — consider upgrading to >= 2.0 (Agave)`,
    });
  }

  // 5. Solana config — show active cluster (always check if CLI exists)
  if (solanaVersion) {
    const configOutput = tryExec("solana config get");
    const clusterMatch = configOutput.match(/RPC URL:\s*(https?:\/\/\S+)/);
    const cluster = clusterMatch ? clusterMatch[1] : "";
    const clusterLabel = cluster.includes("devnet") ? "devnet"
      : cluster.includes("mainnet") ? "mainnet-beta"
      : cluster.includes("localhost") || cluster.includes("127.0.0.1") ? "localhost"
      : cluster.includes("testnet") ? "testnet"
      : cluster || "unknown";
    checks.push({
      label: "Solana cluster",
      status: "pass",
      detail: clusterLabel,
    });

    // 6. Devnet balance — warn if low and configured for devnet
    if (clusterLabel === "devnet") {
      const balanceOutput = tryExec("solana balance");
      const balMatch = balanceOutput.match(/([\d.]+)\s*SOL/);
      if (balMatch) {
        const bal = parseFloat(balMatch[1]);
        checks.push({
          label: "Devnet balance",
          status: bal >= 1 ? "pass" : "warn",
          detail: bal >= 1
            ? `${bal} SOL`
            : `${bal} SOL — low for deploys. Fund at https://faucet.solana.com (requires GitHub auth)`,
        });
      } else {
        checks.push({ label: "Devnet balance", status: "warn", detail: "could not read balance" });
      }
    }
  }

  // 7. Rust toolchain (only if Cargo.toml or Anchor.toml in cwd)
  if (ctx.hasCargo || ctx.hasAnchor) {
    const rustcVersion = tryExec("rustc --version");
    if (!rustcVersion) {
      checks.push({
        label: "Rust",
        status: "fail",
        detail: "not installed — curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh",
      });
    } else {
      const rMatch = rustcVersion.match(/(\d+\.\d+\.\d+)/);
      checks.push({
        label: "Rust",
        status: "pass",
        detail: rMatch ? `v${rMatch[1]}` : rustcVersion,
      });
    }
  }

  // 8. Anchor (only if Anchor.toml in cwd)
  if (ctx.hasAnchor) {
    const anchorVersion = tryExec("anchor --version");
    if (!anchorVersion) {
      checks.push({
        label: "Anchor",
        status: "fail",
        detail: "not installed — cargo install avm --git https://github.com/solana-foundation/anchor --locked && avm update",
      });
    } else {
      const aMatch = anchorVersion.match(/(\d+\.\d+\.\d+)/);
      checks.push({
        label: "Anchor",
        status: "pass",
        detail: aMatch ? `v${aMatch[1]}` : anchorVersion,
      });
    }
  }

  // 9. Skills installed
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
    console.log(`${BINARY_NAME} doctor\n`);
    for (const c of checks) {
      const icon = c.status === "pass" ? "OK" : c.status === "warn" ? "WARN" : "FAIL";
      console.log(`[${icon}] ${c.label}: ${c.detail}`);
    }
    const hasIssues = checks.some((c) => c.status !== "pass");
    if (hasIssues) {
      console.log(`\nRun ${BINARY_NAME} init to install missing skills.`);
    }
    return;
  }

  console.log("");
  console.log(`  ${BOLD}${BINARY_NAME} doctor${RESET}`);
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
    if (missing.length > 0) console.log(`  ${DIM}Run ${BOLD}${BINARY_NAME} init${RESET}${DIM} to install missing skills.${RESET}`);
  }
  console.log("");
}
