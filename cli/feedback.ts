import process from "node:process";
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { RESET, DIM, BOLD, GREEN, RED, CYAN } from "./colors.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnv(): void {
  // Find .env relative to package root
  for (const rel of ["..", "../.."]) {
    const envPath = join(__dirname, rel, ".env");
    if (!existsSync(envPath)) continue;
    const lines = readFileSync(envPath, "utf8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq < 0) continue;
      const key = trimmed.slice(0, eq).trim();
      const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
      if (!process.env[key]) process.env[key] = val;
    }
  }
}

loadEnv();
const CONVEX_URL = process.env.CONVEX_URL ?? "";
const PROD_CONVEX_URL = process.env.PROD_CONVEX_URL ?? "";

function getVersion(): string {
  for (const rel of ["../package.json", "../../package.json"]) {
    try {
      const pkg = JSON.parse(readFileSync(join(__dirname, rel), "utf8"));
      return pkg.version ?? "0.0.0";
    } catch { /* try next */ }
  }
  return "0.0.0";
}

async function submitFeedback(message: string, contact?: string): Promise<boolean> {
  const url = CONVEX_URL || PROD_CONVEX_URL;
  if (!url) return false;
  try {
    const res = await fetch(`${url}/api/mutation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: "feedback:submit",
        args: {
          message,
          contact: contact || undefined,
          version: getVersion(),
          platform: `${process.platform}-${process.arch}`,
          timestamp: Date.now(),
        },
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function interactiveFeedback(): Promise<void> {
  const stdin = process.stdin;
  const stdout = process.stdout;

  stdout.write(`\n  ${BOLD}${CYAN}solana-new feedback${RESET}\n\n`);
  stdout.write(`  ${DIM}Tell us what you think — bugs, ideas, anything.${RESET}\n\n`);

  const rl = await import("node:readline");
  const reader = rl.createInterface({ input: stdin, output: stdout });

  const ask = (q: string): Promise<string> =>
    new Promise((resolve) => reader.question(q, resolve));

  const message = await ask(`  ${BOLD}Message:${RESET} `);
  if (!message.trim()) {
    console.log(`\n  ${DIM}No message entered, skipping.${RESET}\n`);
    reader.close();
    return;
  }

  const contact = await ask(`  ${DIM}Contact (email/X handle, optional):${RESET} `);
  reader.close();

  stdout.write(`\n  ${DIM}Sending...${RESET}`);
  const ok = await submitFeedback(message.trim(), contact.trim() || undefined);

  if (ok) {
    console.log(`\r  ${GREEN}${BOLD}Sent!${RESET} ${DIM}Thanks for the feedback.${RESET}\n`);
  } else {
    console.log(`\r  ${RED}Failed to send.${RESET} ${DIM}Try again or open an issue at github.com/sendaifun/solana-new-cli${RESET}\n`);
  }
}

export async function cmdFeedback(args: string[], agent: boolean): Promise<void> {
  // Agent mode: solana-new feedback "message" [--contact "x"]
  if (agent || !process.stdin.isTTY) {
    const message = args.filter((a) => !a.startsWith("--")).join(" ");
    if (!message.trim()) {
      console.log("Usage: solana-new feedback \"your message\" [--contact email]");
      return;
    }
    const contactIdx = args.indexOf("--contact");
    const contact = contactIdx >= 0 ? args[contactIdx + 1] : undefined;

    const ok = await submitFeedback(message.trim(), contact);
    console.log(ok ? "Feedback sent. Thanks!" : "Failed to send feedback.");
    return;
  }

  // Interactive mode
  await interactiveFeedback();
}
