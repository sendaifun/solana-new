// Telemetry — lightweight skill usage tracking
// Privacy-first: no code, no file paths, no PII
// Three tiers: "off" | "anonymous" | "community"
//
// Inspired by gstack's telemetry:
// - Local JSONL buffer at ~/.superstack/telemetry.jsonl
// - Background sync to Convex (fire-and-forget)
// - All collection fails silently

import { readFileSync, writeFileSync, appendFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
import { randomUUID } from "node:crypto";
import { CONFIG_DIR_NAME, PRODUCT_NAME } from "./branding.js";

const CONFIG_DIR = join(homedir(), CONFIG_DIR_NAME);
const TELEMETRY_FILE = join(CONFIG_DIR, "telemetry.jsonl");
const CONFIG_FILE = join(CONFIG_DIR, "config.json");

export type TelemetryTier = "off" | "anonymous" | "community";

export interface TelemetryEvent {
  skill: string;
  phase?: string;
  command?: string;
  status: "success" | "failure" | "unknown";
  durationMs?: number;
  errorClass?: string;
  version: string;
  platform: string;
  agentCli?: string;
  timestamp: number;
  installationId?: string;
}

// --- Config ---

interface TelemetryConfig {
  telemetryTier?: TelemetryTier;
  installationId?: string;
  [key: string]: unknown;
}

function readTelemetryConfig(): TelemetryConfig {
  try {
    return JSON.parse(readFileSync(CONFIG_FILE, "utf8"));
  } catch {
    return {};
  }
}

function writeTelemetryConfig(config: TelemetryConfig): void {
  mkdirSync(CONFIG_DIR, { recursive: true });
  writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2) + "\n", "utf8");
}

export function getTelemetryTier(): TelemetryTier {
  return readTelemetryConfig().telemetryTier ?? "off";
}

export function setTelemetryTier(tier: TelemetryTier): void {
  const config = readTelemetryConfig();
  config.telemetryTier = tier;
  if (tier === "community" && !config.installationId) {
    config.installationId = randomUUID();
  }
  writeTelemetryConfig(config);
}

function getInstallationId(): string | undefined {
  const config = readTelemetryConfig();
  if (config.telemetryTier !== "community") return undefined;
  if (!config.installationId) {
    config.installationId = randomUUID();
    writeTelemetryConfig(config);
  }
  return config.installationId;
}

import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
const __dirname = dirname(fileURLToPath(import.meta.url));

// --- Version helper ---

function getVersion(): string {
  for (const rel of ["../package.json", "../../package.json"]) {
    try {
      const pkg = JSON.parse(readFileSync(join(__dirname, rel), "utf8"));
      return pkg.version ?? "0.0.0";
    } catch { /* try next */ }
  }
  return "0.0.0";
}

// --- Track ---

export function trackEvent(event: Omit<TelemetryEvent, "version" | "platform" | "timestamp" | "installationId">): void {
  try {
    const tier = getTelemetryTier();
    if (tier === "off") return;

    const fullEvent: TelemetryEvent = {
      ...event,
      version: getVersion(),
      platform: `${process.platform}-${process.arch}`,
      timestamp: Date.now(),
      installationId: tier === "community" ? getInstallationId() : undefined,
    };

    // Append to local JSONL
    mkdirSync(CONFIG_DIR, { recursive: true });
    appendFileSync(TELEMETRY_FILE, JSON.stringify(fullEvent) + "\n", "utf8");

    // Fire-and-forget sync to Convex
    syncToConvex(fullEvent).catch(() => { /* silent */ });
  } catch {
    // Never crash on telemetry failure
  }
}

// --- Sync to Convex ---

async function syncToConvex(event: TelemetryEvent): Promise<void> {
  // Load env for CONVEX_URL
  const envUrl = process.env.CONVEX_URL || process.env.PROD_CONVEX_URL;
  if (!envUrl) return;

  await fetch(`${envUrl}/api/mutation`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      path: "telemetry:track",
      args: event,
    }),
    signal: AbortSignal.timeout(3000),
  });
}

// --- Convenience: track a skill execution ---

export function trackSkill(
  skill: string,
  phase: string,
  opts: { agentCli?: string; command?: string } = {},
): { finish: (status: "success" | "failure", errorClass?: string) => void } {
  const start = Date.now();
  return {
    finish(status: "success" | "failure", errorClass?: string) {
      trackEvent({
        skill,
        phase,
        command: opts.command,
        status,
        durationMs: Date.now() - start,
        errorClass,
        agentCli: opts.agentCli,
      });
    },
  };
}
