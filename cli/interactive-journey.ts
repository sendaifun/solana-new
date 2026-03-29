import process from "node:process";
import { spawn, execSync } from "node:child_process";
import {
  RESET, DIM, BOLD, CYAN, GREEN, YELLOW, MAGENTA,
  ALT_SCREEN_ON, ALT_SCREEN_OFF, CURSOR_HIDE, CURSOR_SHOW, CLEAR_SCREEN,
  GRADIENT_SOLANA_DOT_NEW,
} from "./colors.js";

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
        prompt: "What should I build in crypto?",
        description: "Interview you to discover and rank 3 crypto startup ideas",
      },
      {
        name: "validate-idea",
        prompt: "Validate this idea — is it worth building?",
        description: "Stress-test with demand signals, produce go/no-go",
      },
      {
        name: "competitive-landscape",
        prompt: "Who are my competitors in this space?",
        description: "Map competitors, moats, and differentiation angles",
      },
      {
        name: "defillama-research",
        prompt: "Show me DeFi opportunities on Solana using TVL data",
        description: "Research protocols, TVL trends, and gaps using DefiLlama",
      },
    ],
  },
  {
    label: "Build — Implementation",
    icon: "◇",
    color: CYAN,
    skills: [
      {
        name: "scaffold-project",
        prompt: "Scaffold my project",
        description: "Set up workspace with the right repos, skills, and MCPs",
      },
      {
        name: "build-with-claude",
        prompt: "Help me build the MVP",
        description: "Guide you through implementation milestone-by-milestone",
      },
      {
        name: "review-and-iterate",
        prompt: "Review my code",
        description: "Security audit + quality scores + specific fixes",
      },
    ],
  },
  {
    label: "Launch — Go to Market",
    icon: "◈",
    color: GREEN,
    skills: [
      {
        name: "deploy-to-mainnet",
        prompt: "Deploy to mainnet",
        description: "Pre-flight checklist, RPC setup, verified deployment",
      },
      {
        name: "create-pitch-deck",
        prompt: "Create a pitch deck",
        description: "12-slide framework tailored to your audience",
      },
      {
        name: "submit-to-hackathon",
        prompt: "Prepare my hackathon submission",
        description: "Optimized description + 3-min demo script",
      },
    ],
  },
];

function buildScreen(selectedPhase: number, selectedSkill: number, rows: number): string[] {
  const lines: string[] = [];

  lines.push("");
  lines.push(`  ${GRADIENT_SOLANA_DOT_NEW}  ${BOLD}Developer Journey${RESET}  ${DIM}Idea \u2192 Build \u2192 Launch${RESET}`);
  lines.push("");
  lines.push(`  ${DIM}All 9 skills are pre-installed.${RESET}`);
  lines.push(`  ${DIM}Select a skill and press Enter to launch Claude Code.${RESET}`);
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

  const footer = [`  ${BOLD}enter${RESET} ${DIM}launch claude${RESET}  ${BOLD}\u2191\u2193${RESET} ${DIM}navigate${RESET}  ${DIM}q/esc quit${RESET}`];
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

  stdin.setRawMode(true);
  stdin.resume();
  stdin.setEncoding("utf8");

  stdout.write(ALT_SCREEN_ON);
  stdout.write(CURSOR_HIDE);

  function getRows(): number { return stdout.rows || 24; }

  function draw() {
    const screen = buildScreen(selectedPhase, selectedSkill, getRows());
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

    function launchClaude(prompt: string) {
      cleanup();

      if (opts.yolo) {
        // Yolo mode: send the prompt directly
        console.log(`\n  Launching Claude Code (yolo mode)...\n`);
        const child = spawn("claude", [prompt], { stdio: "inherit" });
        child.on("close", () => resolve());
        child.on("error", (err) => {
          if ((err as NodeJS.ErrnoException).code === "ENOENT") {
            console.log(`  Claude Code not found. Install it: npm i -g @anthropic-ai/claude-code`);
            console.log(`  Then run: claude "${prompt}"\n`);
          } else {
            console.error(`  Failed to launch Claude Code: ${err.message}\n`);
          }
          resolve();
        });
        return;
      }

      // Default: copy prompt to clipboard so user can paste, review, and edit before sending
      try {
        execSync("pbcopy", { input: prompt });
        console.log(`\n  Prompt copied to clipboard — paste (⌘V) into Claude Code, edit if needed, then send.\n`);
      } catch {
        console.log(`\n  Prompt:\n\n${prompt}\n`);
      }
      const child = spawn("claude", [], { stdio: "inherit" });
      child.on("close", () => resolve());
      child.on("error", (err) => {
        if ((err as NodeJS.ErrnoException).code === "ENOENT") {
          console.log(`  Claude Code not found. Install it: npm i -g @anthropic-ai/claude-code`);
          console.log(`  Then run: claude "${prompt}"\n`);
        } else {
          console.error(`  Failed to launch Claude Code: ${err.message}\n`);
        }
        resolve();
      });
    }

    function onData(key: string) {
      if (key === "\x03") { cleanup(); process.exit(0); }
      if (key === "\x1b" || key === "q" || key === "Q") { cleanup(); resolve(); return; }

      if (key === "\r" || key === "\n") {
        const skill = PHASES[selectedPhase].skills[selectedSkill];
        launchClaude(skill.prompt);
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
