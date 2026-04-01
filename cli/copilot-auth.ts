import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { CONFIG_DIR_NAME } from "./branding.js";

const CONFIG_DIR = join(homedir(), CONFIG_DIR_NAME);
const CONFIG_FILE = join(CONFIG_DIR, "config.json");

interface Config {
  [key: string]: unknown;
  copilotToken?: string;
  copilotTokenSetAt?: string;
  copilotPrompted?: boolean;
}

export function readConfig(): Config {
  try {
    return JSON.parse(readFileSync(CONFIG_FILE, "utf8"));
  } catch {
    return {};
  }
}

function writeConfig(config: Config): void {
  mkdirSync(CONFIG_DIR, { recursive: true });
  writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2) + "\n", "utf8");
}

export function getToken(): string | undefined {
  const envToken = process.env.COLOSSEUM_COPILOT_PAT;
  if (envToken) return envToken;
  return readConfig().copilotToken;
}

export function saveToken(token: string): void {
  const config = readConfig();
  config.copilotToken = token;
  config.copilotTokenSetAt = new Date().toISOString();
  config.copilotPrompted = true;
  writeConfig(config);
}

export function shouldPromptForToken(): boolean {
  if (process.env.COLOSSEUM_COPILOT_PAT) return false;
  const config = readConfig();
  return !config.copilotToken && !config.copilotPrompted;
}

export function markTokenPrompted(): void {
  const config = readConfig();
  config.copilotPrompted = true;
  writeConfig(config);
}
