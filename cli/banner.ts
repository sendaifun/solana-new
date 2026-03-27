import process from "node:process";
import { RESET, DIM, gradientLine } from "./colors.js";

export async function renderBanner(): Promise<void> {
  if (process.env.SOLANA_NEW_NO_BANNER === "1") return;

  const art = [
    "  ___  ___  _     _   _  _   _     _  _ _____      __",
    " / __|/ _ \\| |   /_\\ | \\| |/_\\   | \\| | __\\ \\    / /",
    " \\__ \\ (_) | |__/ _ \\| .` / _ \\ _| .` | _| \\ \\/\\/ / ",
    " |___/\\___/|____/_/ \\_\\_|\\_/_/ \\_(_)_|\\_|___| \\_/\\_/  ",
  ];

  const out = art.map(l => "  " + gradientLine(l)).join("\n");
  const tag = `\n  ${DIM}Discover the Solana ecosystem \u2014 skills, repos, MCPs${RESET}`;

  process.stdout.write(`\n${out}${tag}\n\n`);
}
