import process from "node:process";
import { RESET, DIM, gradientLine } from "./colors.js";
import { ASCII_ART, ENV_NO_BANNER, PRODUCT_DESCRIPTION } from "./branding.js";

export async function renderBanner(): Promise<void> {
  if (process.env[ENV_NO_BANNER] === "1") return;

  const out = ASCII_ART.map(l => "  " + gradientLine(l)).join("\n");
  const tag = `\n  ${DIM}${PRODUCT_DESCRIPTION}${RESET}`;

  process.stdout.write(`\n${out}${tag}\n\n`);
}
