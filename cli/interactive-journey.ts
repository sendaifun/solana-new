import process from "node:process";
import { spawn, execSync } from "node:child_process";
import {
  RESET, DIM, BOLD, CYAN, GREEN, YELLOW, MAGENTA,
  ALT_SCREEN_ON, ALT_SCREEN_OFF, CURSOR_HIDE, CURSOR_SHOW, CLEAR_SCREEN,
  GRADIENT_SOLANA_DOT_NEW,
} from "./colors.js";
import {
  detectPreferredAgentCli,
  getAgentCliDisplay,
  getAgentCliInstallHelp,
} from "./agent-cli.js";

interface JourneyPhase {
  label: string;
  icon: string;
  color: string;
  skills: { name: string; prompt: string; description: string }[];
}

const PHASES: JourneyPhase[] = [
  {
    label: "Idea — Discovery & Planning",
    icon: "◆",
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
    icon: "◇",
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
        name: "review-and-iterate",
        prompt: "Review my Solana program for security and production readiness",
        description: "Audit Anchor program for exploits, overflows, and best practices",
      },
    ],
  },
  {
    label: "Launch — Hackathon Submission",
    icon: "◈",
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
    ],
  },
];

function buildScreen(selectedPhase: number, selectedSkill: number, rows: number, agentLabel: string): string[] {
  const lines: string[] = [];

  lines.push("");
  lines.push(`  ${GRADIENT_SOLANA_DOT_NEW}  ${BOLD}Developer Journey${RESET}  ${DIM}Idea \u2192 Build \u2192 Launch${RESET}`);
  lines.push("");
  lines.push(`  ${DIM}Select a prompt and press Enter to launch ${agentLabel} with solana-new cli.${RESET}`);
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

export async function interactiveJourney(opts: { yolo?: boolean } = {}): Promise<void> {
  const stdin = process.stdin;
  const stdout = process.stdout;

  if (!stdin.isTTY) return;

  let selectedPhase = 0;
  let selectedSkill = 0;
  const preferredCli = detectPreferredAgentCli();
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

    function launchAgent(prompt: string) {
      cleanup();

      if (!preferredCli) {
        console.log(`\n  No supported agent CLI found.`);
        console.log(`  Install one: ${getAgentCliInstallHelp()}`);
        console.log(`  Then run: codex "${prompt}"  (or claude "${prompt}")\n`);
        resolve();
        return;
      }

      if (opts.yolo) {
        // Yolo mode: send the prompt directly
        console.log(`\n  Launching ${agentLabel} (yolo mode)...\n`);
        const child = spawn(preferredCli, [prompt], { stdio: "inherit" });
        child.on("close", () => resolve());
        child.on("error", (err) => {
          if ((err as NodeJS.ErrnoException).code === "ENOENT") {
            console.log(`  ${agentLabel} not found. Install it: ${getAgentCliInstallHelp()}`);
            console.log(`  Then run: ${preferredCli} "${prompt}"\n`);
          } else {
            console.error(`  Failed to launch ${agentLabel}: ${err.message}\n`);
          }
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
      child.on("close", () => resolve());
      child.on("error", (err) => {
        if ((err as NodeJS.ErrnoException).code === "ENOENT") {
          console.log(`  ${agentLabel} not found. Install it: ${getAgentCliInstallHelp()}`);
          console.log(`  Then run: ${preferredCli} "${prompt}"\n`);
        } else {
          console.error(`  Failed to launch ${agentLabel}: ${err.message}\n`);
        }
        resolve();
      });
    }

    function onData(key: string) {
      if (key === "\x03") { cleanup(); process.exit(0); }
      if (key === "\x1b" || key === "q" || key === "Q") { cleanup(); resolve(); return; }

      if (key === "\r" || key === "\n") {
        const skill = PHASES[selectedPhase].skills[selectedSkill];
        launchAgent(skill.prompt);
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
