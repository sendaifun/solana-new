import { execSync } from "node:child_process";
import { ENV_AGENT } from "./branding.js";

export type AgentCli = "codex" | "claude";

interface AgentCliMeta {
  label: string;
  installHint: string;
}

const AGENT_META: Record<AgentCli, AgentCliMeta> = {
  codex: {
    label: "Codex",
    installHint: "npm i -g @openai/codex",
  },
  claude: {
    label: "Claude Code",
    installHint: "npm i -g @anthropic-ai/claude-code",
  },
};

let cachedPaths: Record<AgentCli, string> | null = null;

function resolvePreferredOrder(): AgentCli[] {
  const envPreferred = (process.env[ENV_AGENT] || "").toLowerCase();
  if (envPreferred === "claude") return ["claude", "codex"];
  if (envPreferred === "codex") return ["codex", "claude"];
  return ["codex", "claude"];
}

export function detectAgentCliPaths(): Record<AgentCli, string> {
  if (cachedPaths) return cachedPaths;
  const paths: Record<AgentCli, string> = {
    codex: "",
    claude: "",
  };
  for (const cli of Object.keys(paths) as AgentCli[]) {
    try {
      paths[cli] = execSync(`which ${cli}`, { encoding: "utf8", timeout: 5000 }).trim();
    } catch {
      paths[cli] = "";
    }
  }
  cachedPaths = paths;
  return paths;
}

export function detectPreferredAgentCli(): AgentCli | null {
  const paths = detectAgentCliPaths();
  for (const cli of resolvePreferredOrder()) {
    if (paths[cli]) return cli;
  }
  return null;
}

export function getAgentMeta(cli: AgentCli): AgentCliMeta {
  return AGENT_META[cli];
}

export function getAgentCliDisplay(cli: AgentCli | null): string {
  if (!cli) return "Codex/Claude";
  return AGENT_META[cli].label;
}

export function getAgentCliInstallHelp(): string {
  return `${AGENT_META.codex.label}: ${AGENT_META.codex.installHint} | ${AGENT_META.claude.label}: ${AGENT_META.claude.installHint}`;
}

export function normalizeAgentCommand(command: string, cli = detectPreferredAgentCli()): string {
  if (!cli) return command;
  return command.replace(/^(codex|claude)\b/, cli);
}
