// ============================================================
// BRANDING — Single source of truth for all product strings.
// Change values here to rebrand the entire CLI.
// ============================================================

import { gradientLine } from "./colors.js";

// --- Core identity ---
export const PRODUCT_NAME = "superstack";          // Human-readable product name
export const BINARY_NAME = "superstack";            // CLI bin name (what user types)
export const NPM_PACKAGE = "superstack";            // npm package name
export const PRODUCT_TAGLINE = "Ship on Solana — Idea to Launch";
export const PRODUCT_DESCRIPTION = "Ship on Solana — skills, repos, MCPs";

// --- File system ---
export const CONFIG_DIR_NAME = `.${PRODUCT_NAME}`;  // ~/.superstack/
export const CONTEXT_DIR_NAME = `.${PRODUCT_NAME}`; // project-local context dir (.superstack/)

// --- Environment variables ---
export const ENV_PREFIX = PRODUCT_NAME.toUpperCase(); // SUPERSTACK
export const ENV_NO_BANNER = `${ENV_PREFIX}_NO_BANNER`;
export const ENV_AGENT = `${ENV_PREFIX}_AGENT`;

// --- Skill installation paths ---
export const SKILLS_NAMESPACE = PRODUCT_NAME;        // ~/.claude/skills/superstack/ (if namespaced)

// --- GitHub ---
export const GITHUB_REPO = "sendaifun/solana-new-cli";
export const GITHUB_URL = `https://github.com/${GITHUB_REPO}`;

// --- Gradient strings (pre-computed) ---
export const GRADIENT_PRODUCT = gradientLine(PRODUCT_NAME);
export const GRADIENT_PRODUCT_DASH = gradientLine(PRODUCT_NAME);

// --- ASCII banner ---
export const ASCII_ART = [
  "  ___ _   _ ___ ___ ___ ___ _____ _   ___ _  __",
  " / __| | | | _ \\ __| _ \\ __|_   _/_\\ / __| |/ /",
  " \\__ \\ |_| |  _/ _||   /__ \\ | |/ _ \\ (__| ' < ",
  " |___/\\___/|_| |___|_|_\\___/ |_/_/ \\_\\___|_|\\_\\",
];
