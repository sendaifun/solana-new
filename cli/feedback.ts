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
const TELEGRAM_USERNAME = "scriptscrypt";

type FeedbackInput = {
  message: string;
  contact?: string;
  useConvex: boolean;
};

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

function parseFeedbackArgs(args: string[]): FeedbackInput {
  const msgParts: string[] = [];
  let contact: string | undefined;
  let useConvex = false;

  for (let i = 0; i < args.length; i += 1) {
    const token = args[i];
    if (token === "--contact") {
      const next = args[i + 1];
      if (next && !next.startsWith("--")) {
        contact = next;
        i += 1;
      }
      continue;
    }
    if (token === "--convex") {
      useConvex = true;
      continue;
    }
    if (token.startsWith("--")) continue;
    msgParts.push(token);
  }

  return {
    message: msgParts.join(" ").trim(),
    contact: contact?.trim() || undefined,
    useConvex,
  };
}

function buildTelegramText(message: string, contact?: string): string {
  const lines = [
    `Feedback for solana-new v${getVersion()} (${process.platform}-${process.arch})`,
    "",
    message.trim(),
  ];
  if (contact) lines.push("", `Contact: ${contact}`);
  return lines.join("\n");
}

function buildTelegramUrl(message: string, contact?: string): string {
  const text = buildTelegramText(message, contact);
  return `https://t.me/${TELEGRAM_USERNAME}?text=${encodeURIComponent(text)}`;
}

async function openExternalUrl(url: string): Promise<boolean> {
  const { spawn } = await import("node:child_process");
  let command = "";
  let cmdArgs: string[] = [];

  if (process.platform === "darwin") {
    command = "open";
    cmdArgs = [url];
  } else if (process.platform === "win32") {
    command = "cmd";
    cmdArgs = ["/c", "start", "", url];
  } else {
    command = "xdg-open";
    cmdArgs = [url];
  }

  return await new Promise<boolean>((resolve) => {
    const child = spawn(command, cmdArgs, { stdio: "ignore" });
    child.on("error", () => resolve(false));
    child.on("close", (code) => resolve(code === 0));
  });
}

async function sendToTelegram(message: string, contact?: string): Promise<{ url: string; opened: boolean }> {
  const url = buildTelegramUrl(message, contact);
  const opened = await openExternalUrl(url);
  return { url, opened };
}

async function interactiveFeedback(useConvex: boolean): Promise<void> {
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

  const cleanedContact = contact.trim() || undefined;
  if (useConvex) {
    stdout.write(`\n  ${DIM}Sending to Convex...${RESET}`);
    const ok = await submitFeedback(message.trim(), cleanedContact);
    if (ok) {
      console.log(`\r  ${GREEN}${BOLD}Sent!${RESET} ${DIM}Thanks for the feedback.${RESET}\n`);
    } else {
      console.log(`\r  ${RED}Failed to send.${RESET} ${DIM}Try again or open an issue at github.com/sendaifun/solana-new-cli${RESET}\n`);
    }
    return;
  }

  stdout.write(`\n  ${DIM}Opening Telegram...${RESET}`);
  const result = await sendToTelegram(message.trim(), cleanedContact);
  const status = result.opened ? "Opened" : "Generated";
  console.log(`\r  ${GREEN}${BOLD}${status}!${RESET} ${DIM}Send your feedback to @${TELEGRAM_USERNAME}.${RESET}`);
  console.log(`  ${CYAN}${result.url}${RESET}\n`);
}

export async function cmdFeedback(args: string[], agent: boolean): Promise<void> {
  if (args.includes("--help") || args.includes("-h")) {
    console.log("Usage: solana-new feedback \"your message\" [--contact email] [--convex]");
    console.log("Default route: Telegram @scriptscrypt");
    console.log("Use --convex to submit through the Convex backend.");
    return;
  }

  const input = parseFeedbackArgs(args);

  // Agent mode: solana-new feedback "message" [--contact "x"] [--convex]
  if (agent || !process.stdin.isTTY) {
    if (!input.message.trim()) {
      console.log("Usage: solana-new feedback \"your message\" [--contact email] [--convex]");
      return;
    }

    if (input.useConvex) {
      const ok = await submitFeedback(input.message, input.contact);
      console.log(ok ? "Feedback sent to Convex. Thanks!" : "Failed to send feedback to Convex.");
      return;
    }

    const url = buildTelegramUrl(input.message, input.contact);
    console.log(`Telegram link: ${url}`);
    return;
  }

  if (input.message) {
    if (input.useConvex) {
      process.stdout.write(`\n  ${DIM}Sending to Convex...${RESET}`);
      const ok = await submitFeedback(input.message, input.contact);
      if (ok) {
        console.log(`\r  ${GREEN}${BOLD}Sent!${RESET} ${DIM}Thanks for the feedback.${RESET}\n`);
      } else {
        console.log(`\r  ${RED}Failed to send.${RESET} ${DIM}Try again or open an issue at github.com/sendaifun/solana-new-cli${RESET}\n`);
      }
      return;
    }

    process.stdout.write(`\n  ${DIM}Opening Telegram...${RESET}`);
    const result = await sendToTelegram(input.message, input.contact);
    const status = result.opened ? "Opened" : "Generated";
    console.log(`\r  ${GREEN}${BOLD}${status}!${RESET} ${DIM}Send your feedback to @${TELEGRAM_USERNAME}.${RESET}`);
    console.log(`  ${CYAN}${result.url}${RESET}\n`);
    return;
  }

  // Interactive mode
  await interactiveFeedback(input.useConvex);
}
