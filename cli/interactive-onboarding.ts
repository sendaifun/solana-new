import { createInterface } from "node:readline";
import { getToken, saveToken, shouldPromptForToken, markTokenPrompted } from "./copilot-auth.js";
import { verifyToken, searchProjects, type SearchProjectsResponse } from "./copilot-client.js";
import {
  RESET, DIM, BOLD, CYAN, GREEN, YELLOW, MAGENTA, BLUE, RED,
  GRADIENT_SOLANA_DOT_NEW, COMPETITION_HIGH, COMPETITION_MEDIUM,
  ALT_SCREEN_ON, ALT_SCREEN_OFF, CURSOR_HIDE, CURSOR_SHOW, CLEAR_SCREEN,
  padFooter,
} from "./colors.js";

export interface Recommendation {
  skills: Array<{ name: string; install: string; official?: boolean }>;
  mcps: Array<{ name: string; setup: string }>;
  repos: Array<{ name: string; command: string }>;
  tip: string;
}

interface Category {
  label: string;
  icon: string;
  description: string;
  subcategories: Subcategory[];
}

interface Subcategory {
  label: string;
  description: string;
  recommendation: Recommendation;
}

export type OnboardingResult =
  | { action: "quit" }
  | { action: "setup"; subcategoryLabel: string; subcategoryDescription: string; recommendation: Recommendation; landscapeData: SearchProjectsResponse | null };

const CATEGORIES: Category[] = [
  {
    label: "DeFi / Trading",
    icon: "◆",
    description: "Swaps, lending, perps, staking, prediction markets",
    subcategories: [
      {
        label: "Swap tokens (Jupiter)",
        description: "Integrate Jupiter for token swaps, limit orders, DCA",
        recommendation: {
          skills: [
            { name: "Jupiter Skill", install: "npx skills add https://github.com/jup-ag/agent-skills/tree/main/skills/integrating-jupiter" },
          ],
          mcps: [
            { name: "Jupiter MCP", setup: "npx @mcp-dockmaster/mcp-server-jupiter" },
          ],
          repos: [
            { name: "jupiter-nextjs-example", command: "git clone https://github.com/jup-ag/jupiter-nextjs-example.git" },
          ],
          tip: "Jupiter Ultra API gives best prices. Add Helius MCP for wallet data.",
        },
      },
      {
        label: "Perps / Leverage trading",
        description: "Perpetual futures on Flash Trade, Drift, or multi-DEX",
        recommendation: {
          skills: [
            { name: "Drift Skill", install: "npx skills add https://github.com/sendaifun/skills/tree/main/skills/drift" },
          ],
          mcps: [
            { name: "Flash Trade MCP", setup: "npx flash-trade-mcp" },
            { name: "Perp CLI MCP", setup: "npx -y -p perp-cli perp-mcp" },
          ],
          repos: [],
          tip: "Flash Trade for SOL/BTC/ETH perps. Perp CLI covers Pacifica + Hyperliquid.",
        },
      },
      {
        label: "Provide liquidity (AMM / CLMM)",
        description: "Concentrated or constant product liquidity pools",
        recommendation: {
          skills: [
            { name: "Orca Skill", install: "npx skills add https://github.com/sendaifun/skills/tree/main/skills/orca" },
            { name: "Raydium Skill", install: "npx skills add https://github.com/sendaifun/skills/tree/main/skills/raydium" },
            { name: "Meteora Skill", install: "npx skills add https://github.com/sendaifun/skills/tree/main/skills/meteora" },
          ],
          mcps: [
            { name: "Orca DEX MCP", setup: "git clone https://github.com/demcp/demcp-orca-mcp && cd demcp-orca-mcp && npm install" },
          ],
          repos: [
            { name: "whirlpools", command: "git clone https://github.com/orca-so/whirlpools.git" },
            { name: "raydium-cp-swap", command: "git clone https://github.com/raydium-io/raydium-cp-swap.git" },
          ],
          tip: "Orca for concentrated liquidity. Raydium for constant product + CLMM. Meteora for bonding curves.",
        },
      },
      {
        label: "Lending / Borrowing",
        description: "Deposit, borrow, leverage via Kamino, Lulo, or Marginfi",
        recommendation: {
          skills: [
            { name: "Kamino Skill", install: "npx skills add https://github.com/sendaifun/skills/tree/main/skills/kamino" },
            { name: "Lulo Skill", install: "npx skills add https://github.com/sendaifun/skills/tree/main/skills/lulo" },
            { name: "Marginfi Skill", install: "npx skills add https://github.com/sendaifun/skills/tree/main/skills/marginfi" },
          ],
          mcps: [],
          repos: [],
          tip: "Lulo auto-routes to highest-yield protocol. Kamino for leverage. Marginfi for flash loans.",
        },
      },
      {
        label: "Liquid staking",
        description: "Stake SOL and get liquid staking tokens",
        recommendation: {
          skills: [
            { name: "Sanctum Skill", install: "npx skills add https://github.com/sendaifun/skills/tree/main/skills/sanctum" },
          ],
          mcps: [
            { name: "Marinade MCP", setup: "git clone https://github.com/leandrogavidia/marinade-finance-mcp-server && cd marinade-finance-mcp-server && npm install" },
          ],
          repos: [],
          tip: "Sanctum for LST swaps and Infinity pool. Marinade for mSOL.",
        },
      },
      {
        label: "Token launch (pump.fun)",
        description: "Launch tokens with bonding curves",
        recommendation: {
          skills: [
            { name: "PumpFun Skill", install: "npx skills add https://github.com/sendaifun/skills/tree/main/skills/pumpfun" },
          ],
          mcps: [
            { name: "Meme Deployer MCP", setup: "git clone https://github.com/kirabuilds/mcp-meme-deployer && cd mcp-meme-deployer && npm install" },
          ],
          repos: [],
          tip: "PumpFun skill covers bonding curves, PumpSwap, and token graduation to Raydium.",
        },
      },
      {
        label: "Prediction markets",
        description: "Build or trade on prediction markets",
        recommendation: {
          skills: [
            { name: "DFlow Skill", install: "npx skills add https://github.com/sendaifun/skills/tree/main/skills/dflow" },
            { name: "PNP Markets Skill", install: "npx skills add https://github.com/pnp-protocol/solana-skill" },
          ],
          mcps: [
            { name: "DFlow MCP", setup: "git clone https://github.com/openSVM/dflow-mcp && cd dflow-mcp && npm install" },
          ],
          repos: [],
          tip: "DFlow for Kalshi-style markets. PNP for permissionless P2P prediction markets.",
        },
      },
    ],
  },
  {
    label: "AI Agents",
    icon: "◈",
    description: "Build AI agents that interact with Solana",
    subcategories: [
      {
        label: "AI agent (TypeScript)",
        description: "Build an AI agent with Solana Agent Kit",
        recommendation: {
          skills: [
            { name: "Solana Agent Kit Skill", install: "npx skills add https://github.com/sendaifun/skills/tree/main/skills/solana-agent-kit" },
          ],
          mcps: [
            { name: "Solana Agent Kit MCP", setup: "npm install @solana-agent-kit/adapter-mcp" },
            { name: "Helius MCP", setup: "claude mcp add helius npx helius-mcp@latest" },
          ],
          repos: [
            { name: "create-solana-agent", command: "npx create-solana-agent" },
          ],
          tip: "create-solana-agent is the fastest way to start. Add Helius MCP for wallet data.",
        },
      },
      {
        label: "Telegram bot",
        description: "Solana-powered Telegram bot with wallet",
        recommendation: {
          skills: [
            { name: "Solana Agent Kit Skill", install: "npx skills add https://github.com/sendaifun/skills/tree/main/skills/solana-agent-kit" },
          ],
          mcps: [],
          repos: [
            { name: "sak-telegram-bot", command: "git clone https://github.com/sendaifun/solana-agent-kit.git && cd solana-agent-kit/examples/social/tg-bot-starter" },
          ],
          tip: "Includes single-user, multi-user (Firebase), and group chat variants.",
        },
      },
      {
        label: "Discord bot",
        description: "Solana-powered Discord bot",
        recommendation: {
          skills: [
            { name: "Solana Agent Kit Skill", install: "npx skills add https://github.com/sendaifun/skills/tree/main/skills/solana-agent-kit" },
          ],
          mcps: [],
          repos: [
            { name: "sak-discord-bot", command: "git clone https://github.com/sendaifun/solana-agent-kit.git && cd solana-agent-kit/examples/social/discord-bot-starter" },
          ],
          tip: "Clone the starter and add your Discord bot token.",
        },
      },
      {
        label: "Agent with Phantom wallet",
        description: "AI agent with wallet auth via Phantom",
        recommendation: {
          skills: [
            { name: "Phantom Connect Skill", install: "npx skills add https://github.com/sendaifun/skills/tree/main/skills/phantom-connect" },
          ],
          mcps: [
            { name: "Phantom MCP", setup: "npm install @phantom/mcp-server" },
          ],
          repos: [
            { name: "sak-phantom-agent", command: "git clone https://github.com/sendaifun/solana-agent-kit.git && cd solana-agent-kit/examples/embedded-wallets/phantom-agent-starter" },
          ],
          tip: "Phantom MCP gives wallet access across Solana + EVM chains.",
        },
      },
      {
        label: "Multi-agent workflows",
        description: "Orchestrate multiple agents with LangGraph",
        recommendation: {
          skills: [],
          mcps: [],
          repos: [
            { name: "sak-langgraph", command: "git clone https://github.com/sendaifun/solana-agent-kit.git && cd solana-agent-kit/examples/misc/agent-kit-langgraph" },
            { name: "sak-persistent-agent", command: "git clone https://github.com/sendaifun/solana-agent-kit.git && cd solana-agent-kit/examples/misc/persistent-agent" },
          ],
          tip: "LangGraph for directed workflows. Persistent agent adds PostgreSQL memory.",
        },
      },
    ],
  },
  {
    label: "Frontend / dApps",
    icon: "◇",
    description: "Web apps, mobile apps, wallet integration",
    subcategories: [
      {
        label: "New dApp (Next.js / React)",
        description: "Scaffold a new Solana web app",
        recommendation: {
          skills: [
            { name: "Frontend Framework Kit", install: "npx skills add https://github.com/solana-foundation/solana-dev-skill", official: true },
            { name: "@solana/kit Reference", install: "npx skills add https://github.com/solana-foundation/solana-dev-skill", official: true },
          ],
          mcps: [],
          repos: [
            { name: "create-solana-dapp", command: "npx create-solana-dapp@latest" },
          ],
          tip: "create-solana-dapp scaffolds Next.js, React+Vite, or Express templates.",
        },
      },
      {
        label: "Mobile app (React Native)",
        description: "Build a Solana mobile app",
        recommendation: {
          skills: [
            { name: "Phantom Connect Skill", install: "npx skills add https://github.com/sendaifun/skills/tree/main/skills/phantom-connect" },
          ],
          mcps: [],
          repos: [
            { name: "solana-mobile-dapp-scaffold", command: "git clone https://github.com/solana-mobile/solana-mobile-dapp-scaffold.git" },
          ],
          tip: "Kotlin devs can use solana-kotlin-compose scaffold instead.",
        },
      },
      {
        label: "Payments / checkout",
        description: "Solana Pay, checkout flows, QR payments",
        recommendation: {
          skills: [
            { name: "Payments & Commerce", install: "npx skills add https://github.com/solana-foundation/solana-dev-skill", official: true },
          ],
          mcps: [],
          repos: [],
          tip: "Official skill covers Commerce Kit, payment buttons, and QR-based requests.",
        },
      },
      {
        label: "Blinks / Actions",
        description: "Build shareable Solana Actions for social",
        recommendation: {
          skills: [],
          mcps: [],
          repos: [
            { name: "solana-actions", command: "git clone https://github.com/solana-developers/solana-actions.git" },
            { name: "solana-action-express", command: "git clone https://github.com/SolDapper/solana-action-express.git" },
          ],
          tip: "Actions SDK for the standard. Express template for quick backends.",
        },
      },
    ],
  },
  {
    label: "On-chain Programs",
    icon: "◉",
    description: "Write Solana smart contracts with Anchor or Pinocchio",
    subcategories: [
      {
        label: "Anchor programs",
        description: "Write programs with Anchor framework",
        recommendation: {
          skills: [
            { name: "Programs with Anchor", install: "npx skills add https://github.com/solana-foundation/solana-dev-skill", official: true },
            { name: "Security Checklist", install: "npx skills add https://github.com/solana-foundation/solana-dev-skill", official: true },
            { name: "Testing Strategy", install: "npx skills add https://github.com/solana-foundation/solana-dev-skill", official: true },
          ],
          mcps: [],
          repos: [
            { name: "anchor-by-example", command: "git clone https://github.com/coral-xyz/anchor-by-example.git" },
            { name: "program-examples", command: "git clone https://github.com/solana-developers/program-examples.git" },
          ],
          tip: "Install all 3 official skills. Test with LiteSVM (fast) or Surfpool (mainnet state).",
        },
      },
      {
        label: "Pinocchio (high-performance)",
        description: "Zero-copy, zero-dep programs — 88-95% CU savings",
        recommendation: {
          skills: [
            { name: "Programs with Pinocchio", install: "npx skills add https://github.com/solana-foundation/solana-dev-skill", official: true },
            { name: "Pinocchio Skill", install: "npx skills add https://github.com/sendaifun/skills/tree/main/skills/pinocchio-development" },
          ],
          mcps: [],
          repos: [
            { name: "pinocchio", command: "git clone https://github.com/anza-xyz/pinocchio.git" },
          ],
          tip: "Official + community skill together give the best coverage.",
        },
      },
      {
        label: "Security audit",
        description: "Audit programs for vulnerabilities",
        recommendation: {
          skills: [
            { name: "Security Checklist", install: "npx skills add https://github.com/solana-foundation/solana-dev-skill", official: true },
            { name: "VulnHunter Skill", install: "npx skills add https://github.com/sendaifun/skills/tree/main/skills/vulnhunter" },
            { name: "Code Recon Skill", install: "npx skills add https://github.com/sendaifun/skills/tree/main/skills/zz-code-recon" },
          ],
          mcps: [
            { name: "Solana Fender MCP", setup: "cargo install anchor-mcp && anchor-mcp --mcp" },
          ],
          repos: [
            { name: "trident", command: "git clone https://github.com/Ackee-Blockchain/trident.git" },
          ],
          tip: "Security + VulnHunter + Code Recon = full audit pipeline. Trident for fuzz testing.",
        },
      },
    ],
  },
  {
    label: "NFTs & Tokens",
    icon: "◎",
    description: "Mint NFTs, create tokens, compressed NFTs",
    subcategories: [
      {
        label: "Mint NFTs (Metaplex Core)",
        description: "Create and manage NFT collections",
        recommendation: {
          skills: [
            { name: "Metaplex Skill (Official)", install: "npx skills add https://github.com/metaplex-foundation/skill" },
          ],
          mcps: [],
          repos: [
            { name: "mpl-candy-machine", command: "git clone https://github.com/metaplex-foundation/mpl-candy-machine.git" },
          ],
          tip: "Core NFTs are the latest standard. Candy Machine for drops.",
        },
      },
      {
        label: "Compressed NFTs",
        description: "Cheap large-scale NFT minting with state compression",
        recommendation: {
          skills: [
            { name: "Metaplex Community Skill", install: "npx skills add https://github.com/sendaifun/skills/tree/main/skills/metaplex" },
            { name: "Light Protocol Skill", install: "npx skills add https://github.com/sendaifun/skills/tree/main/skills/light-protocol" },
          ],
          mcps: [],
          repos: [
            { name: "mpl-bubblegum", command: "git clone https://github.com/metaplex-foundation/mpl-bubblegum.git" },
            { name: "compressed-nfts", command: "git clone https://github.com/solana-developers/compressed-nfts.git" },
          ],
          tip: "Bubblegum for cNFTs. Light Protocol for ZK compressed tokens + PDAs.",
        },
      },
    ],
  },
  {
    label: "Infrastructure / Data",
    icon: "◐",
    description: "RPC, oracles, analytics, webhooks, indexing",
    subcategories: [
      {
        label: "Helius (RPC + DAS + Webhooks)",
        description: "Full Helius toolchain — CLI, MCP, skills",
        recommendation: {
          skills: [
            { name: "Helius Build Skill (Official)", install: "npx skills add https://github.com/helius-labs/core-ai/tree/main/helius-skills/helius" },
          ],
          mcps: [
            { name: "Helius MCP", setup: "claude mcp add helius npx helius-mcp@latest" },
          ],
          repos: [
            { name: "helius-core-ai", command: "git clone https://github.com/helius-labs/core-ai.git" },
          ],
          tip: "Helius MCP has 60+ tools. Install helius-cli globally: npm i -g helius-cli",
        },
      },
      {
        label: "Price feeds / Oracles",
        description: "Pyth, Switchboard for on-chain data",
        recommendation: {
          skills: [
            { name: "Pyth Skill", install: "npx skills add https://github.com/sendaifun/skills/tree/main/skills/pyth" },
            { name: "Switchboard Skill", install: "npx skills add https://github.com/sendaifun/skills/tree/main/skills/switchboard" },
          ],
          mcps: [],
          repos: [
            { name: "pyth-sdk", command: "git clone https://github.com/pyth-network/pyth-sdk-rs.git" },
          ],
          tip: "Pyth for price feeds with confidence intervals. Switchboard for VRF + custom feeds.",
        },
      },
      {
        label: "Transaction forensics / Analytics",
        description: "Explore wallets, transactions, and on-chain data",
        recommendation: {
          skills: [
            { name: "CoinGecko Skill", install: "npx skills add https://github.com/sendaifun/skills/tree/main/skills/coingecko" },
            { name: "Octav API Skill", install: "npx skills add https://github.com/Octav-Labs/octav-api-skill" },
          ],
          mcps: [
            { name: "Solscan MCP", setup: "cargo install solscan-mcp" },
            { name: "DexScreener MCP", setup: "npx -y @opensvm/dexscreener-mcp-server" },
          ],
          repos: [],
          tip: "Solscan for transaction forensics. DexScreener for real-time pair data.",
        },
      },
    ],
  },
];

// --- Copilot query map ---

const COPILOT_QUERIES: Record<string, string> = {
  "Swap tokens (Jupiter)": "token swap DEX aggregator",
  "Perps / Leverage trading": "perpetual futures leverage trading",
  "Provide liquidity (AMM / CLMM)": "liquidity pool AMM concentrated",
  "Lending / Borrowing": "lending borrowing DeFi protocol",
  "Liquid staking": "liquid staking LST token",
  "Token launch (pump.fun)": "token launch bonding curve memecoin",
  "Prediction markets": "prediction market betting oracle",
  "AI agent (TypeScript)": "AI agent autonomous trading",
  "Telegram bot": "telegram bot crypto wallet",
  "Discord bot": "discord bot Solana crypto",
  "Agent with Phantom wallet": "AI agent wallet embedded",
  "Multi-agent workflows": "multi agent orchestration workflow",
  "New dApp (Next.js / React)": "dApp frontend web application",
  "Mobile app (React Native)": "mobile app Solana wallet",
  "Payments / checkout": "payments checkout Solana Pay commerce",
  "Blinks / Actions": "blinks actions shareable transaction",
  "Anchor programs": "anchor program smart contract",
  "Pinocchio (high-performance)": "high performance program zero copy",
  "Security audit": "security audit vulnerability scanner",
  "Mint NFTs (Metaplex Core)": "NFT mint collection marketplace",
  "Compressed NFTs": "compressed NFT cNFT state compression",
  "Helius (RPC + DAS + Webhooks)": "RPC API indexing webhooks infrastructure",
  "Price feeds / Oracles": "price feed oracle data",
  "Transaction forensics / Analytics": "analytics explorer transaction forensics",
};

// --- Rendering ---

function buildCategoryScreen(categories: Category[], selected: number, rows: number): string[] {
  const lines: string[] = [];

  lines.push("");
  lines.push(`  ${GRADIENT_SOLANA_DOT_NEW}  ${BOLD}What are you building?${RESET}`);
  lines.push("");
  lines.push(`  ${DIM}Pick a category to get personalized skill + MCP + repo recommendations${RESET}`);
  lines.push("");

  for (let i = 0; i < categories.length; i++) {
    const cat = categories[i];
    const isSelected = i === selected;
    const pointer = isSelected ? `${CYAN}❯${RESET}` : " ";
    const nameColor = isSelected ? BOLD + CYAN : BOLD;
    const icon = isSelected ? `${CYAN}${cat.icon}${RESET}` : `${DIM}${cat.icon}${RESET}`;

    lines.push(`  ${pointer} ${icon} ${nameColor}${cat.label}${RESET}`);
    lines.push(`      ${DIM}${cat.description}${RESET}`);
    lines.push("");
  }

  const footer = [`  ${DIM}↑↓ navigate${RESET}  ${BOLD}enter${RESET} ${DIM}select${RESET}  ${DIM}esc quit${RESET}`];
  while (lines.length < rows - footer.length) lines.push("");
  lines.push(...footer);

  return lines.slice(0, rows);
}

function buildSubcategoryScreen(category: Category, selected: number, rows: number): string[] {
  const lines: string[] = [];

  lines.push("");
  lines.push(`  ${GRADIENT_SOLANA_DOT_NEW}  ${BOLD}${category.icon} ${category.label}${RESET}`);
  lines.push("");
  lines.push(`  ${DIM}What specifically?${RESET}`);
  lines.push("");

  for (let i = 0; i < category.subcategories.length; i++) {
    const sub = category.subcategories[i];
    const isSelected = i === selected;
    const pointer = isSelected ? `${CYAN}❯${RESET}` : " ";
    const nameColor = isSelected ? BOLD + CYAN : BOLD;

    lines.push(`  ${pointer} ${nameColor}${sub.label}${RESET}`);
    if (isSelected) {
      lines.push(`      ${DIM}${sub.description}${RESET}`);
    }
    lines.push("");
  }

  const footer = [`  ${DIM}↑↓ navigate${RESET}  ${BOLD}enter${RESET} ${DIM}select${RESET}  ${DIM}esc back${RESET}`];
  while (lines.length < rows - footer.length) lines.push("");
  lines.push(...footer);

  return lines.slice(0, rows);
}

function buildRecommendationScreen(sub: Subcategory, rows: number): string[] {
  const lines: string[] = [];
  const rec = sub.recommendation;

  lines.push("");
  lines.push(`  ${GRADIENT_SOLANA_DOT_NEW}  ${BOLD}${sub.label}${RESET}`);
  lines.push("");

  if (rec.skills.length > 0) {
    lines.push(`  ${GREEN}${BOLD}Skills to install:${RESET}`);
    for (const s of rec.skills) {
      const tag = s.official ? `${GREEN}[official]${RESET}` : `${YELLOW}[community]${RESET}`;
      lines.push(`    ${tag} ${BOLD}${s.name}${RESET}`);
      lines.push(`    ${MAGENTA}$ ${s.install}${RESET}`);
      lines.push("");
    }
  }

  if (rec.mcps.length > 0) {
    lines.push(`  ${BLUE}${BOLD}MCP servers to add:${RESET}`);
    for (const m of rec.mcps) {
      lines.push(`    ${BOLD}${m.name}${RESET}`);
      lines.push(`    ${MAGENTA}$ ${m.setup}${RESET}`);
      lines.push("");
    }
  }

  if (rec.repos.length > 0) {
    lines.push(`  ${CYAN}${BOLD}Repos to clone:${RESET}`);
    for (const r of rec.repos) {
      lines.push(`    ${BOLD}${r.name}${RESET}`);
      lines.push(`    ${MAGENTA}$ ${r.command}${RESET}`);
      lines.push("");
    }
  }

  if (rec.tip) {
    lines.push(`  ${YELLOW}${BOLD}Tip:${RESET} ${DIM}${rec.tip}${RESET}`);
    lines.push("");
  }

  const footer = [`  ${BOLD}enter${RESET} ${DIM}setup workspace${RESET}  ${DIM}esc back${RESET}  ${DIM}q quit${RESET}`];
  while (lines.length < rows - footer.length) lines.push("");
  lines.push(...footer);

  return lines.slice(0, rows);
}

function buildLandscapeScreen(
  sub: Subcategory,
  data: SearchProjectsResponse | null,
  loading: boolean,
  error: boolean,
  rows: number,
): string[] {
  const lines: string[] = [];

  lines.push("");
  lines.push(`  ${GRADIENT_SOLANA_DOT_NEW}  ${BOLD}Landscape: ${sub.label}${RESET}`);
  lines.push("");

  if (loading) {
    lines.push(`  ${DIM}Analyzing competitive landscape...${RESET}`);
    lines.push("");
    lines.push(`  ${DIM}Searching 5,400+ Solana hackathon projects via Colosseum Copilot${RESET}`);
    const footer = [`  ${DIM}please wait...${RESET}`];
    while (lines.length < rows - footer.length) lines.push("");
    lines.push(...footer);
    return lines.slice(0, rows);
  }

  if (error || !data) {
    lines.push(`  ${DIM}Could not fetch landscape data. Showing recommendations instead.${RESET}`);
    lines.push("");
    const footer = [`  ${BOLD}enter${RESET} ${DIM}see recommendations${RESET}  ${DIM}esc back${RESET}`];
    while (lines.length < rows - footer.length) lines.push("");
    lines.push(...footer);
    return lines.slice(0, rows);
  }

  lines.push(`  ${BOLD}${data.totalFound}${RESET} ${DIM}similar projects found across Solana hackathons${RESET}`);
  lines.push("");

  if (data.results.length > 0) {
    lines.push(`  ${YELLOW}${BOLD}Notable projects:${RESET}`);
    lines.push("");

    for (const project of data.results.slice(0, 5)) {
      const tag = project.prize ? ` ${GREEN}[winner]${RESET}` : "";
      lines.push(`    ${BOLD}${project.name}${RESET}${tag}`);
      if (project.oneLiner) {
        const liner = project.oneLiner.length > 70 ? project.oneLiner.slice(0, 67) + "..." : project.oneLiner;
        lines.push(`    ${DIM}${liner}${RESET}`);
      }
      lines.push(`    ${CYAN}${project.hackathon.name}${RESET}`);
      lines.push("");
    }
  }

  if (data.totalFound > 0) {
    const level = data.totalFound > COMPETITION_HIGH ? "High" : data.totalFound > COMPETITION_MEDIUM ? "Medium" : "Low";
    const filled = Math.min(Math.round(data.totalFound / 5), 10);
    const bar = "\u2588".repeat(filled) + "\u2591".repeat(10 - filled);
    const color = data.totalFound > COMPETITION_HIGH ? RED : data.totalFound > COMPETITION_MEDIUM ? YELLOW : GREEN;

    lines.push(`  ${BOLD}Competition:${RESET} ${color}${bar} ${level}${RESET} ${DIM}(${data.totalFound} projects)${RESET}`);
    lines.push("");

    if (data.totalFound > COMPETITION_HIGH) {
      lines.push(`  ${YELLOW}Crowded space. Differentiate with a specific niche or novel mechanism.${RESET}`);
    } else if (data.totalFound > COMPETITION_MEDIUM) {
      lines.push(`  ${DIM}Moderate competition. Room for well-executed entrants.${RESET}`);
    } else {
      lines.push(`  ${GREEN}Open space \u2014 relatively few existing projects here.${RESET}`);
    }
    lines.push("");
  }

  const footer = [`  ${BOLD}enter${RESET} ${DIM}see recommendations${RESET}  ${DIM}esc back${RESET}  ${DIM}q quit${RESET}`];
  while (lines.length < rows - footer.length) lines.push("");
  lines.push(...footer);

  return lines.slice(0, rows);
}

// --- Token prompt ---

const COPILOT_SIGNUP_URL = "https://arena.colosseum.org/copilot";

async function promptForCopilotToken(): Promise<string | undefined> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });

  console.log("");
  console.log(`  ${BOLD}Colosseum Copilot${RESET} ${DIM}\u2014 competitive landscape analysis${RESET}`);
  console.log(`  ${DIM}See what\u2019s already been built before you start.${RESET}`);
  console.log(`  ${DIM}5,400+ hackathon projects \u00b7 65+ curated sources \u00b7 6,300+ crypto products${RESET}`);
  console.log("");
  console.log(`  ${BOLD}Get your free token:${RESET} ${CYAN}${COPILOT_SIGNUP_URL}${RESET}`);
  console.log(`  ${DIM}Sign in \u2192 copy your Personal Access Token \u2192 paste below${RESET}`);
  console.log("");

  return new Promise((resolve) => {
    rl.question(`  Paste token (Enter to skip): `, (answer) => {
      rl.close();
      resolve(answer.trim() || undefined);
    });
  });
}

// --- Agent output ---

export function agentOnboarding(): void {
  const token = getToken();
  console.log("Solana Ecosystem Onboarding — What do you want to build?\n");
  if (token) {
    console.log("Colosseum Copilot: ACTIVE — landscape analysis available for each category.\n");
  } else {
    console.log(`Tip: Get a token at ${COPILOT_SIGNUP_URL} and set COLOSSEUM_COPILOT_PAT to enable competitive landscape analysis.\n`);
  }
  for (const cat of CATEGORIES) {
    console.log(`${cat.icon} ${cat.label} — ${cat.description}`);
    for (const sub of cat.subcategories) {
      console.log(`  ${sub.label}`);
      const rec = sub.recommendation;
      if (rec.skills.length > 0) {
        console.log(`    Skills: ${rec.skills.map((s) => s.name).join(", ")}`);
      }
      if (rec.mcps.length > 0) {
        console.log(`    MCPs:   ${rec.mcps.map((m) => m.name).join(", ")}`);
      }
      if (rec.repos.length > 0) {
        console.log(`    Repos:  ${rec.repos.map((r) => r.name).join(", ")}`);
      }
      console.log("");
    }
  }
}

// --- Interactive TUI ---

type Screen = "categories" | "subcategories" | "landscape" | "recommendation";

export async function interactiveOnboarding(): Promise<OnboardingResult> {
  const stdin = process.stdin;
  const stdout = process.stdout;

  if (!stdin.isTTY) {
    agentOnboarding();
    return { action: "quit" };
  }

  // One-time Copilot token setup
  let copilotToken = getToken();
  if (!copilotToken && shouldPromptForToken()) {
    const entered = await promptForCopilotToken();
    if (entered) {
      process.stdout.write(`  ${DIM}Verifying token...${RESET}`);
      const valid = await verifyToken(entered);
      if (valid) {
        saveToken(entered);
        copilotToken = entered;
        console.log(`\r  ${GREEN}Token verified and saved to ~/.solana-new/config.json${RESET}          `);
      } else {
        console.log(`\r  ${YELLOW}Invalid token \u2014 skipping landscape analysis.${RESET}                `);
        markTokenPrompted();
      }
      console.log("");
    } else {
      markTokenPrompted();
      console.log(`  ${DIM}Skipped. You can add it later: export COLOSSEUM_COPILOT_PAT="your-token"${RESET}`);
      console.log("");
    }
  }

  stdin.setRawMode(true);
  stdin.resume();
  stdin.setEncoding("utf8");

  stdout.write(ALT_SCREEN_ON);
  stdout.write(CURSOR_HIDE);

  let screen: Screen = "categories";
  let catIndex = 0;
  let subIndex = 0;
  let landscapeData: SearchProjectsResponse | null = null;
  let landscapeLoading = false;
  let landscapeError = false;
  let landscapeGeneration = 0;

  function getRows(): number { return stdout.rows || 24; }

  function draw() {
    const rows = getRows();
    let lines: string[];

    if (screen === "categories") {
      lines = buildCategoryScreen(CATEGORIES, catIndex, rows);
    } else if (screen === "subcategories") {
      lines = buildSubcategoryScreen(CATEGORIES[catIndex], subIndex, rows);
    } else if (screen === "landscape") {
      lines = buildLandscapeScreen(
        CATEGORIES[catIndex].subcategories[subIndex],
        landscapeData, landscapeLoading, landscapeError, rows,
      );
    } else {
      lines = buildRecommendationScreen(CATEGORIES[catIndex].subcategories[subIndex], rows);
    }

    stdout.write(`${CLEAR_SCREEN}${lines.join("\n")}`);
  }

  draw();

  const onResize = () => draw();
  stdout.on("resize", onResize);

  return new Promise<OnboardingResult>((resolve) => {
    function cleanup() {
      stdout.removeListener("resize", onResize);
      stdin.setRawMode(false);
      stdin.pause();
      stdin.removeListener("data", onData);
      stdout.write(CURSOR_SHOW);
      stdout.write(ALT_SCREEN_OFF);
    }

    function onData(key: string) {
      if (key === "\x03") { cleanup(); process.exit(0); }

      if (screen === "categories") {
        if (key === "\x1b") { cleanup(); resolve({ action: "quit" }); return; }
        if (key === "\x1b[A") { catIndex = Math.max(catIndex - 1, 0); draw(); return; }
        if (key === "\x1b[B") { catIndex = Math.min(catIndex + 1, CATEGORIES.length - 1); draw(); return; }
        if (key === "\r" || key === "\n") { screen = "subcategories"; subIndex = 0; draw(); return; }
      } else if (screen === "subcategories") {
        if (key === "\x1b") { screen = "categories"; draw(); return; }
        const subs = CATEGORIES[catIndex].subcategories;
        if (key === "\x1b[A") { subIndex = Math.max(subIndex - 1, 0); draw(); return; }
        if (key === "\x1b[B") { subIndex = Math.min(subIndex + 1, subs.length - 1); draw(); return; }
        if (key === "\r" || key === "\n") {
          const sub = CATEGORIES[catIndex].subcategories[subIndex];
          const query = COPILOT_QUERIES[sub.label];
          if (copilotToken && query) {
            screen = "landscape";
            landscapeData = null;
            landscapeLoading = true;
            landscapeError = false;
            const gen = ++landscapeGeneration;
            draw();
            searchProjects(copilotToken, query)
              .then((data) => {
                if (gen !== landscapeGeneration) return;
                landscapeData = data;
                landscapeLoading = false;
                if (screen === "landscape") draw();
              })
              .catch(() => {
                if (gen !== landscapeGeneration) return;
                landscapeLoading = false;
                landscapeError = true;
                if (screen === "landscape") draw();
              });
          } else {
            screen = "recommendation";
            draw();
          }
          return;
        }
      } else if (screen === "landscape") {
        if (landscapeLoading) return;
        if (key === "\x1b") { screen = "subcategories"; draw(); return; }
        if (key === "\r" || key === "\n") { screen = "recommendation"; draw(); return; }
        if (key === "q" || key === "Q") { cleanup(); resolve({ action: "quit" }); return; }
      } else {
        // recommendation screen — Enter triggers workspace setup
        if (key === "\r" || key === "\n") {
          const sub = CATEGORIES[catIndex].subcategories[subIndex];
          cleanup();
          resolve({
            action: "setup",
            subcategoryLabel: sub.label,
            subcategoryDescription: sub.description,
            recommendation: sub.recommendation,
            landscapeData,
          });
          return;
        }
        if (key === "\x1b" || key === "\x1b[A") {
          const sub = CATEGORIES[catIndex].subcategories[subIndex];
          screen = (copilotToken && COPILOT_QUERIES[sub.label]) ? "landscape" : "subcategories";
          draw();
          return;
        }
        if (key === "q" || key === "Q") { cleanup(); resolve({ action: "quit" }); return; }
      }
    }

    stdin.on("data", onData);
  });
}
