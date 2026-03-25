const RESET = "\x1b[0m";
const DIM = "\x1b[2m";
const BOLD = "\x1b[1m";
const CYAN = "\x1b[36m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const MAGENTA = "\x1b[35m";
const BLUE = "\x1b[34m";

function gradientTitle(): string {
  const chars = "solana.new";
  const codes = [
    "\x1b[38;2;130;80;255m", "\x1b[38;2;145;70;250m", "\x1b[38;2;165;60;240m",
    "\x1b[38;2;185;55;225m", "\x1b[38;2;200;50;210m", "\x1b[38;2;215;45;190m",
    "\x1b[38;2;230;40;170m", "\x1b[38;2;240;35;150m", "\x1b[38;2;250;30;135m",
    "\x1b[38;2;255;25;120m",
  ];
  return chars.split("").map((c, i) => `${codes[i]}${c}`).join("") + RESET;
}

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
            { name: "Ranger Finance Skill", install: "npx skills add https://github.com/sendaifun/skills/tree/main/skills/ranger-finance" },
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
            { name: "Marinade MCP", setup: "git clone https://github.com/lorine93s/marinade-finance-mcp-server && cd marinade-finance-mcp-server && npm install" },
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

// --- Rendering ---

function buildCategoryScreen(categories: Category[], selected: number, rows: number): string[] {
  const lines: string[] = [];

  lines.push("");
  lines.push(`  ${gradientTitle()}  ${BOLD}What are you building?${RESET}`);
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
  lines.push(`  ${gradientTitle()}  ${BOLD}${category.icon} ${category.label}${RESET}`);
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
  lines.push(`  ${gradientTitle()}  ${BOLD}${sub.label}${RESET}`);
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

  const footer = [`  ${DIM}esc back${RESET}  ${DIM}q quit${RESET}`];
  while (lines.length < rows - footer.length) lines.push("");
  lines.push(...footer);

  return lines.slice(0, rows);
}

// --- Agent output ---

export function agentOnboarding(): void {
  console.log("Solana Ecosystem Onboarding — What do you want to build?\n");
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

type Screen = "categories" | "subcategories" | "recommendation";

export async function interactiveOnboarding(): Promise<void> {
  const stdin = process.stdin;
  const stdout = process.stdout;

  if (!stdin.isTTY) {
    agentOnboarding();
    return;
  }

  stdin.setRawMode(true);
  stdin.resume();
  stdin.setEncoding("utf8");

  stdout.write("\x1b[?1049h");
  stdout.write("\x1b[?25l");

  let screen: Screen = "categories";
  let catIndex = 0;
  let subIndex = 0;

  function getRows(): number { return stdout.rows || 24; }

  function draw() {
    const rows = getRows();
    let lines: string[];

    if (screen === "categories") {
      lines = buildCategoryScreen(CATEGORIES, catIndex, rows);
    } else if (screen === "subcategories") {
      lines = buildSubcategoryScreen(CATEGORIES[catIndex], subIndex, rows);
    } else {
      lines = buildRecommendationScreen(CATEGORIES[catIndex].subcategories[subIndex], rows);
    }

    stdout.write(`\x1b[H\x1b[J${lines.join("\n")}`);
  }

  draw();

  const onResize = () => draw();
  stdout.on("resize", onResize);

  return new Promise((resolve) => {
    function cleanup() {
      stdout.removeListener("resize", onResize);
      stdin.setRawMode(false);
      stdin.pause();
      stdin.removeListener("data", onData);
      stdout.write("\x1b[?25h");
      stdout.write("\x1b[?1049l");
    }

    function onData(key: string) {
      if (key === "\x03") { cleanup(); process.exit(0); }

      if (screen === "categories") {
        if (key === "\x1b") { cleanup(); resolve(); return; }
        if (key === "\x1b[A") { catIndex = Math.max(catIndex - 1, 0); draw(); return; }
        if (key === "\x1b[B") { catIndex = Math.min(catIndex + 1, CATEGORIES.length - 1); draw(); return; }
        if (key === "\r" || key === "\n") { screen = "subcategories"; subIndex = 0; draw(); return; }
      } else if (screen === "subcategories") {
        if (key === "\x1b") { screen = "categories"; draw(); return; }
        const subs = CATEGORIES[catIndex].subcategories;
        if (key === "\x1b[A") { subIndex = Math.max(subIndex - 1, 0); draw(); return; }
        if (key === "\x1b[B") { subIndex = Math.min(subIndex + 1, subs.length - 1); draw(); return; }
        if (key === "\r" || key === "\n") { screen = "recommendation"; draw(); return; }
      } else {
        if (key === "\x1b" || key === "\x1b[A") { screen = "subcategories"; draw(); return; }
        if (key === "q" || key === "Q") { cleanup(); resolve(); return; }
      }
    }

    stdin.on("data", onData);
  });
}
