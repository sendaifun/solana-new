import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
import { RESET, DIM, BOLD, CYAN, YELLOW } from "./colors.js";
import { CONFIG_DIR_NAME, NPM_PACKAGE } from "./branding.js";

const CACHE_DIR = join(homedir(), CONFIG_DIR_NAME);
const CACHE_FILE = join(CACHE_DIR, "update-check.json");
const CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours

interface CacheData {
  lastCheck: number;
  latestVersion: string;
}

function readCache(): CacheData | null {
  try {
    return JSON.parse(readFileSync(CACHE_FILE, "utf8"));
  } catch {
    return null;
  }
}

function writeCache(data: CacheData): void {
  mkdirSync(CACHE_DIR, { recursive: true });
  writeFileSync(CACHE_FILE, JSON.stringify(data), "utf8");
}

function compareVersions(current: string, latest: string): boolean {
  const c = current.replace(/^v/, "").split(".").map(Number);
  const l = latest.replace(/^v/, "").split(".").map(Number);
  for (let i = 0; i < 3; i++) {
    if ((l[i] ?? 0) > (c[i] ?? 0)) return true;
    if ((l[i] ?? 0) < (c[i] ?? 0)) return false;
  }
  return false;
}

export async function checkForUpdate(currentVersion: string): Promise<void> {
  // Check cache first
  const cache = readCache();
  const now = Date.now();

  if (cache && now - cache.lastCheck < CHECK_INTERVAL_MS) {
    if (compareVersions(currentVersion, cache.latestVersion)) {
      printNotice(currentVersion, cache.latestVersion);
    }
    return;
  }

  // Fetch latest version from npm
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(`https://registry.npmjs.org/${NPM_PACKAGE}/latest`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      writeCache({ lastCheck: now, latestVersion: currentVersion });
      return;
    }

    const data = await res.json() as { version?: string };
    const latest = data.version ?? currentVersion;
    writeCache({ lastCheck: now, latestVersion: latest });

    if (compareVersions(currentVersion, latest)) {
      printNotice(currentVersion, latest);
    }
  } catch {
    // Network error — silently skip
  }
}

function printNotice(current: string, latest: string): void {
  console.log(`  ${YELLOW}Update available:${RESET} ${DIM}${current}${RESET} → ${BOLD}${CYAN}${latest}${RESET}`);
  console.log(`  ${DIM}Run: npm i -g ${NPM_PACKAGE}${RESET}`);
  console.log("");
}
