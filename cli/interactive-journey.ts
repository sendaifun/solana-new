import process from "node:process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { spawn, execSync } from "node:child_process";
import {
  RESET, DIM, BOLD, CYAN, GREEN, YELLOW, MAGENTA,
  ALT_SCREEN_ON, ALT_SCREEN_OFF, CURSOR_HIDE, CURSOR_SHOW, CLEAR_SCREEN,
} from "./colors.js";
import { GRADIENT_PRODUCT, BINARY_NAME, CONTEXT_DIR_NAME } from "./branding.js";
import { trackSkill } from "./telemetry.js";
import {
  type AgentCli,
  detectPreferredAgentCli,
  getAgentCliDisplay,
  getAgentMeta,
  getAgentCliInstallHelp,
} from "./agent-cli.js";

// --- Phase auto-detection ---
// Detects where the user is in the Learn → Idea → Build → Launch journey
// based on files in the current working directory.

function detectPhase(): number {
  const cwd = process.cwd();
  const contextDir = `${cwd}/${CONTEXT_DIR_NAME}`;

  // Launch signals: has deployment artifacts or mainnet config
  if (existsSync(`${contextDir}/build-context.md`)) {
    try {
      const ctx = readFileSync(`${contextDir}/build-context.md`, "utf8");
      if (ctx.includes("Devnet deployed | Yes") || ctx.includes("devnet_deployed: true")) return 3; // Launch
    } catch { /* ignore */ }
  }
  // Fallback: check JSON for backwards compat
  if (existsSync(`${contextDir}/build-context.json`)) {
    try {
      const ctx = JSON.parse(readFileSync(`${contextDir}/build-context.json`, "utf8"));
      if (ctx?.build_status?.devnet_deployed) return 3; // Launch
    } catch { /* ignore */ }
  }
  if (existsSync(`${cwd}/Anchor.toml`)) {
    try {
      const anchor = readFileSync(`${cwd}/Anchor.toml`, "utf8");
      if (anchor.includes("[programs.mainnet]")) return 3; // Launch
    } catch { /* ignore */ }
  }

  // Build signals: has project files
  const buildSignals = [
    "package.json", "Anchor.toml", "Cargo.toml",
    "programs", "src", "app", "tests",
  ];
  const hasBuildFiles = buildSignals.some((f) => existsSync(`${cwd}/${f}`));

  // Check if dir has any meaningful files (not just .git)
  if (hasBuildFiles) return 2; // Build

  // Check if directory is not empty (has files beyond dotfiles)
  try {
    const entries = readdirSync(cwd).filter((e) => !e.startsWith("."));
    if (entries.length > 0) return 2; // Build — has some files
  } catch { /* ignore */ }

  // Check if idea context exists → Idea phase
  if (existsSync(`${contextDir}/idea-context.md`) || existsSync(`${contextDir}/idea-context.json`)) {
    return 1; // Idea
  }

  return 0; // Learn — empty directory, new user
}

interface JourneyPhase {
  label: string;
  icon: string;
  color: string;
  skills: { name: string; prompt: string; description: string }[];
}

const PHASES: JourneyPhase[] = [
  {
    label: "Learn — Solana Fundamentals",
    icon: "◆",
    color: YELLOW,
    skills: [
      {
        name: "solana-beginner",
        prompt: "I'm new to Solana — teach me the fundamentals",
        description: "Solana architecture, ecosystem overview, why build here",
      },
      {
        name: "learn",
        prompt: "What have we learned across sessions?",
        description: "Review, search, and manage project learnings",
      },
    ],
  },
  {
    label: "Idea — Discovery & Planning",
    icon: "◇",
    color: YELLOW,
    skills: [
      {
        name: "find-next-crypto-idea",
        prompt: "What should I build on Solana for the Colosseum hackathon?",
        description: "Interview you to discover and rank 3 Solana project ideas",
      },
      {
        name: "validate-idea",
        prompt: "Validate this Solana project idea — is it worth building?",
        description: "Stress-test with on-chain demand signals, produce go/no-go",
      },
      {
        name: "competitive-landscape",
        prompt: "Who are my competitors in the Solana ecosystem?",
        description: "Map existing Solana protocols, moats, and gaps",
      },
      {
        name: "defillama-research",
        prompt: "Show me DeFi opportunities on Solana using TVL data",
        description: "Research Solana protocols, TVL trends, and underserved niches",
      },
    ],
  },
  {
    label: "Build — Solana Implementation",
    icon: "◈",
    color: CYAN,
    skills: [
      {
        name: "scaffold-project",
        prompt: "Scaffold my Solana project with Anchor and the right stack",
        description: "Set up workspace with Anchor, SDK, and Solana-specific tooling",
      },
      {
        name: "build-with-claude",
        prompt: "Help me build the Solana MVP step by step",
        description: "Guided implementation with Anchor programs + client SDK",
      },
      {
        name: "virtual-solana-incubator",
        prompt: "Deep dive into Solana architecture and Rust patterns",
        description: "Structured bootcamp: SVM, PDAs, CPIs, Rust for Solana",
      },
      {
        name: "build-defi-protocol",
        prompt: "Build a DeFi protocol on Solana — AMM, lending, or vault",
        description: "Guided DeFi build with CPIs, PDAs, and token math",
      },
      {
        name: "build-data-pipeline",
        prompt: "Build a Solana data pipeline — indexer, webhook, or analytics",
        description: "Index accounts, track transactions, real-time Solana data",
      },
      {
        name: "build-mobile",
        prompt: "Build a Solana mobile app with React Native",
        description: "Mobile wallet adapter, transaction signing, mobile dApp",
      },
      {
        name: "roast-my-product",
        prompt: "Roast my product — be harsh, find every weakness",
        description: "Brutal product critique: value prop, UX, crypto necessity",
      },
      {
        name: "product-review",
        prompt: "Review my product's quality and user experience",
        description: "UX flows, onboarding, feature completeness evaluation",
      },
      {
        name: "review-and-iterate",
        prompt: "Review my Solana program for security and production readiness",
        description: "Audit Anchor program for exploits, overflows, and best practices",
      },
      {
        name: "cso",
        prompt: "Run a Chief Security Officer audit on my project",
        description: "Infrastructure-first security: secrets, deps, CI/CD, OWASP",
      },
      {
        name: "debug-program",
        prompt: "Debug my failing Solana program or transaction",
        description: "Diagnose program errors, failed TXs, and instruction issues",
      },
    ],
  },
  {
    label: "Launch — Go to Market",
    icon: "◆",
    color: GREEN,
    skills: [
      {
        name: "deploy-to-mainnet",
        prompt: "Deploy my Solana program to mainnet",
        description: "Pre-flight checklist, RPC setup, program verification",
      },
      {
        name: "create-pitch-deck",
        prompt: "Create a pitch deck for Colosseum hackathon judges",
        description: "12-slide framework tailored for Solana hackathon judging",
      },
      {
        name: "submit-to-hackathon",
        prompt: "Prepare my Colosseum hackathon submission",
        description: "Optimized project description + 3-min demo script",
      },
      {
        name: "marketing-video",
        prompt: "Create a marketing video for my Solana project",
        description: "Remotion for code-driven videos + Renoise for AI-generated content",
      },
    ],
  },
];

function buildScreen(selectedPhase: number, selectedSkill: number, rows: number, agentLabel: string): string[] {
  const lines: string[] = [];

  lines.push("");
  lines.push(`  ${GRADIENT_PRODUCT}  ${BOLD}Developer Journey${RESET}  ${DIM}Learn \u2192 Idea \u2192 Build \u2192 Launch${RESET}`);
  lines.push("");
  lines.push(`  ${DIM}Select a prompt and press Enter to launch ${agentLabel} with ${BINARY_NAME}.${RESET}`);
  lines.push("");

  for (let p = 0; p < PHASES.length; p++) {
    const phase = PHASES[p];
    const isActivePhase = p === selectedPhase;
    const phaseColor = isActivePhase ? phase.color : DIM;

    lines.push(`  ${phaseColor}${phase.icon} ${BOLD}${phase.label}${RESET}`);

    for (let s = 0; s < phase.skills.length; s++) {
      const skill = phase.skills[s];
      const isSelected = p === selectedPhase && s === selectedSkill;
      const pointer = isSelected ? `${CYAN}\u276f${RESET}` : " ";
      const nameColor = isSelected ? BOLD : isActivePhase ? "" : DIM;
      const promptColor = isSelected ? MAGENTA : DIM;

      lines.push(`  ${pointer} ${nameColor}${skill.name}${RESET}`);
      lines.push(`      ${promptColor}"${skill.prompt}"${RESET}`);
      if (isSelected) {
        lines.push(`      ${DIM}${skill.description}${RESET}`);
      }
    }
    lines.push("");
  }

  const footer = [`  ${BOLD}enter${RESET} ${DIM}launch ${agentLabel.toLowerCase()}${RESET}  ${BOLD}\u2191\u2193${RESET} ${DIM}navigate${RESET}  ${DIM}q/esc quit${RESET}`];
  while (lines.length < rows - footer.length) lines.push("");
  lines.push(...footer);

  return lines.slice(0, rows);
}

export async function interactiveJourney(opts: { yolo?: boolean; agentCli?: AgentCli } = {}): Promise<void> {
  const stdin = process.stdin;
  const stdout = process.stdout;

  if (!stdin.isTTY) return;

  let selectedPhase = detectPhase();
  let selectedSkill = 0;
  const preferredCli = opts.agentCli ?? detectPreferredAgentCli();
  const agentLabel = getAgentCliDisplay(preferredCli);

  stdin.setRawMode(true);
  stdin.resume();
  stdin.setEncoding("utf8");

  stdout.write(ALT_SCREEN_ON);
  stdout.write(CURSOR_HIDE);

  function getRows(): number { return stdout.rows || 24; }

  function draw() {
    const screen = buildScreen(selectedPhase, selectedSkill, getRows(), agentLabel);
    stdout.write(`${CLEAR_SCREEN}${screen.join("\n")}`);
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

    function launchAgent(prompt: string, skillName: string, phaseLabel: string) {
      cleanup();
      const tracker = trackSkill(skillName, phaseLabel, { agentCli: preferredCli ?? undefined, command: "ship" });

      if (!preferredCli) {
        console.log(`\n  No supported agent CLI found.`);
        console.log(`  Install one: ${getAgentCliInstallHelp()}`);
        console.log(`  Then run: codex "${prompt}"  (or claude "${prompt}")\n`);
        tracker.finish("failure", "no_agent_cli");
        resolve();
        return;
      }

      if (opts.yolo) {
        // Yolo mode: send the prompt directly
        console.log(`\n  Launching ${agentLabel} (yolo mode)...\n`);
        const child = spawn(preferredCli, [prompt], { stdio: "inherit" });
        child.on("close", (code) => { tracker.finish(code === 0 ? "success" : "failure"); resolve(); });
        child.on("error", (err) => {
          if ((err as NodeJS.ErrnoException).code === "ENOENT") {
            const installHint = getAgentMeta(preferredCli).installHint;
            console.log(`  ${agentLabel} not found. Install it: ${installHint}`);
            console.log(`  Then run: ${preferredCli} "${prompt}"\n`);
          } else {
            console.error(`  Failed to launch ${agentLabel}: ${err.message}\n`);
          }
          tracker.finish("failure", (err as NodeJS.ErrnoException).code ?? "spawn_error");
          resolve();
        });
        return;
      }

      // Default: copy prompt to clipboard so user can paste, review, and edit before sending
      try {
        execSync("pbcopy", { input: prompt });
        console.log(`\n  Prompt copied to clipboard — paste (⌘V) into ${agentLabel}, edit if needed, then send.\n`);
      } catch {
        console.log(`\n  Prompt:\n\n${prompt}\n`);
      }
      const child = spawn(preferredCli, [], { stdio: "inherit" });
      child.on("close", () => { tracker.finish("success"); resolve(); });
      child.on("error", (err) => {
        if ((err as NodeJS.ErrnoException).code === "ENOENT") {
          const installHint = getAgentMeta(preferredCli).installHint;
          console.log(`  ${agentLabel} not found. Install it: ${installHint}`);
          console.log(`  Then run: ${preferredCli} "${prompt}"\n`);
        } else {
          console.error(`  Failed to launch ${agentLabel}: ${err.message}\n`);
        }
        tracker.finish("failure", (err as NodeJS.ErrnoException).code ?? "spawn_error");
        resolve();
      });
    }

    function onData(key: string) {
      if (key === "\x03") { cleanup(); process.exit(0); }
      if (key === "\x1b" || key === "q" || key === "Q") { cleanup(); resolve(); return; }

      if (key === "\r" || key === "\n") {
        const skill = PHASES[selectedPhase].skills[selectedSkill];
        const phaseLabel = PHASES[selectedPhase].label.split(" — ")[0].toLowerCase();
        launchAgent(skill.prompt, skill.name, phaseLabel);
        return;
      }

      if (key === "\x1b[A") {
        // Up
        selectedSkill--;
        if (selectedSkill < 0) {
          selectedPhase--;
          if (selectedPhase < 0) {
            selectedPhase = PHASES.length - 1;
            selectedSkill = PHASES[selectedPhase].skills.length - 1;
          } else {
            selectedSkill = PHASES[selectedPhase].skills.length - 1;
          }
        }
        draw();
        return;
      }

      if (key === "\x1b[B") {
        // Down
        selectedSkill++;
        if (selectedSkill >= PHASES[selectedPhase].skills.length) {
          selectedPhase++;
          selectedSkill = 0;
          if (selectedPhase >= PHASES.length) {
            selectedPhase = 0;
            selectedSkill = 0;
          }
        }
        draw();
        return;
      }
    }

    stdin.on("data", onData);
  });
}
