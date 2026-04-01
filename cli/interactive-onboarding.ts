import { createInterface } from "node:readline";
import { getToken, saveToken, shouldPromptForToken, markTokenPrompted } from "./copilot-auth.js";
import {
  verifyToken, fetchLandscape, fetchExploreData,
  type LandscapeData, type ExploreData, type ClusterInfo,
} from "./copilot-client.js";
import { normalizeAgentCommand } from "./agent-cli.js";
import {
  RESET, DIM, BOLD, CYAN, GREEN, YELLOW, MAGENTA, BLUE, RED,
  COMPETITION_HIGH, COMPETITION_MEDIUM,
  ALT_SCREEN_ON, ALT_SCREEN_OFF, CURSOR_HIDE, CURSOR_SHOW, CLEAR_SCREEN,
  padFooter, insightBox,
} from "./colors.js";
import { GRADIENT_PRODUCT, BINARY_NAME } from "./branding.js";

// --- Types ---

export interface Recommendation {
  skills: Array<{ name: string; install: string; official?: boolean }>;
  mcps: Array<{ name: string; setup: string }>;
  repos: Array<{ name: string; command: string }>;
  tip: string;
}

interface Subcategory {
  label: string;
  description: string;
  query: string;
  recommendation: Recommendation;
}

interface Category {
  label: string;
  subcategories: Subcategory[];
}

export type OnboardingResult =
  | { action: "quit" }
  | { action: "setup"; subcategoryLabel: string; subcategoryDescription: string; recommendation: Recommendation; landscapeData: LandscapeData | null; ideaText?: string; winnerSkills?: Array<{ name: string; install: string; reason: string }> };

// --- Curated recommendations (hidden from UI, used for matching) ---

const CURATED: Category[] = [
  { label: "DeFi & Trading", subcategories: [
    { label: "Token swaps & aggregation", description: "Integrate Jupiter for token swaps, limit orders, DCA", query: "token swap DEX aggregator routing",
      recommendation: { skills: [{ name: "Jupiter Skill", install: "npx skills add https://github.com/jup-ag/agent-skills/tree/main/skills/integrating-jupiter" }], mcps: [{ name: "Jupiter MCP", setup: "npx @mcp-dockmaster/mcp-server-jupiter" }], repos: [{ name: "jupiter-nextjs-example", command: "git clone https://github.com/jup-ag/jupiter-nextjs-example.git" }], tip: "Jupiter Ultra API gives best prices. Add Helius MCP for wallet data." } },
    { label: "Lending & yield optimization", description: "Deposit, borrow, leverage via Kamino, Lulo, or Marginfi", query: "lending borrowing collateral yield DeFi",
      recommendation: { skills: [{ name: "Kamino Skill", install: "npx skills add https://github.com/sendaifun/skills/tree/main/skills/kamino" }, { name: "Lulo Skill", install: "npx skills add https://github.com/sendaifun/skills/tree/main/skills/lulo" }, { name: "Marginfi Skill", install: "npx skills add https://github.com/sendaifun/skills/tree/main/skills/marginfi" }], mcps: [], repos: [], tip: "Lulo auto-routes to highest-yield. Kamino for leverage. Marginfi for flash loans." } },
    { label: "Perpetuals & derivatives", description: "Perpetual futures on Flash Trade, Drift", query: "perpetual futures leverage trading derivatives",
      recommendation: { skills: [{ name: "Drift Skill", install: "npx skills add https://github.com/sendaifun/skills/tree/main/skills/drift" }], mcps: [{ name: "Flash Trade MCP", setup: "npx flash-trade-mcp" }, { name: "Perp CLI MCP", setup: "npx -y -p perp-cli perp-mcp" }], repos: [], tip: "Flash Trade for SOL/BTC/ETH perps. Perp CLI covers Pacifica + Hyperliquid." } },
    { label: "Stablecoins & payments", description: "Solana Pay, stablecoin yields, checkout flows", query: "stablecoin payments USDC yield commerce",
      recommendation: { skills: [{ name: "Payments & Commerce", install: "npx skills add https://github.com/solana-foundation/solana-dev-skill", official: true }], mcps: [], repos: [], tip: "Official skill covers Commerce Kit, payment buttons, and QR-based requests." } },
    { label: "Liquid staking & restaking", description: "Stake SOL and get LSTs", query: "liquid staking LST stake delegation restaking",
      recommendation: { skills: [{ name: "Sanctum Skill", install: "npx skills add https://github.com/sendaifun/skills/tree/main/skills/sanctum" }], mcps: [{ name: "Marinade MCP", setup: "git clone https://github.com/leandrogavidia/marinade-finance-mcp-server && cd marinade-finance-mcp-server && npm install" }], repos: [], tip: "Sanctum for LST swaps. Marinade for mSOL." } },
  ]},
  { label: "AI Agents", subcategories: [
    { label: "AI agent (TypeScript)", description: "Build an AI agent with Solana Agent Kit", query: "AI agent autonomous on-chain Solana",
      recommendation: { skills: [{ name: "Solana Agent Kit Skill", install: "npx skills add https://github.com/sendaifun/skills/tree/main/skills/solana-agent-kit" }], mcps: [{ name: "Solana Agent Kit MCP", setup: "npm install @solana-agent-kit/adapter-mcp" }, { name: "Helius MCP", setup: "codex mcp add helius npx helius-mcp@latest" }], repos: [{ name: "create-solana-agent", command: "npx create-solana-agent" }], tip: "create-solana-agent is the fastest way to start." } },
    { label: "Telegram / Discord bot", description: "Solana-powered social bot with wallet", query: "telegram discord bot Solana wallet trading",
      recommendation: { skills: [{ name: "Solana Agent Kit Skill", install: "npx skills add https://github.com/sendaifun/skills/tree/main/skills/solana-agent-kit" }], mcps: [], repos: [{ name: "sak-telegram-bot", command: "git clone https://github.com/sendaifun/solana-agent-kit.git && cd solana-agent-kit/examples/social/tg-bot-starter" }], tip: "Includes single-user, multi-user, and group chat variants." } },
    { label: "Agent with embedded wallet", description: "AI agent with Phantom wallet auth", query: "AI agent embedded wallet signing Phantom",
      recommendation: { skills: [{ name: "Phantom Connect Skill", install: "npx skills add https://github.com/sendaifun/skills/tree/main/skills/phantom-connect" }], mcps: [{ name: "Phantom MCP", setup: "npm install @phantom/mcp-server" }], repos: [{ name: "sak-phantom-agent", command: "git clone https://github.com/sendaifun/solana-agent-kit.git && cd solana-agent-kit/examples/embedded-wallets/phantom-agent-starter" }], tip: "Phantom MCP gives wallet access across Solana + EVM." } },
    { label: "Multi-agent workflows", description: "Orchestrate multiple agents with LangGraph", query: "multi agent orchestration autonomous workflow",
      recommendation: { skills: [], mcps: [], repos: [{ name: "sak-langgraph", command: "git clone https://github.com/sendaifun/solana-agent-kit.git && cd solana-agent-kit/examples/misc/agent-kit-langgraph" }], tip: "LangGraph for directed workflows. Persistent agent adds PostgreSQL memory." } },
  ]},
  { label: "On-chain Programs", subcategories: [
    { label: "Anchor programs", description: "Write programs with Anchor framework", query: "Anchor smart contract program on-chain",
      recommendation: { skills: [{ name: "Programs with Anchor", install: "npx skills add https://github.com/solana-foundation/solana-dev-skill", official: true }, { name: "Security Checklist", install: "npx skills add https://github.com/solana-foundation/solana-dev-skill", official: true }, { name: "Testing Strategy", install: "npx skills add https://github.com/solana-foundation/solana-dev-skill", official: true }], mcps: [], repos: [{ name: "anchor-by-example", command: "git clone https://github.com/coral-xyz/anchor-by-example.git" }], tip: "Install all 3 official skills. Test with LiteSVM or Surfpool." } },
    { label: "Pinocchio (high-performance)", description: "Zero-copy, zero-dep programs", query: "high performance program zero copy Pinocchio",
      recommendation: { skills: [{ name: "Programs with Pinocchio", install: "npx skills add https://github.com/solana-foundation/solana-dev-skill", official: true }, { name: "Pinocchio Skill", install: "npx skills add https://github.com/sendaifun/skills/tree/main/skills/pinocchio-development" }], mcps: [], repos: [{ name: "pinocchio", command: "git clone https://github.com/anza-xyz/pinocchio.git" }], tip: "Official + community skill together give the best coverage." } },
    { label: "Security & auditing", description: "Audit programs for vulnerabilities", query: "security audit vulnerability smart contract",
      recommendation: { skills: [{ name: "Security Checklist", install: "npx skills add https://github.com/solana-foundation/solana-dev-skill", official: true }, { name: "VulnHunter Skill", install: "npx skills add https://github.com/sendaifun/skills/tree/main/skills/vulnhunter" }], mcps: [{ name: "Solana Fender MCP", setup: "cargo install anchor-mcp && anchor-mcp --mcp" }], repos: [{ name: "trident", command: "git clone https://github.com/Ackee-Blockchain/trident.git" }], tip: "Security + VulnHunter = full audit pipeline. Trident for fuzz testing." } },
  ]},
  { label: "Consumer Apps", subcategories: [
    { label: "dApp (Next.js / React)", description: "Scaffold a new Solana web app", query: "dApp frontend wallet connect Solana web",
      recommendation: { skills: [{ name: "Frontend Framework Kit", install: "npx skills add https://github.com/solana-foundation/solana-dev-skill", official: true }], mcps: [], repos: [{ name: "create-solana-dapp", command: "npx create-solana-dapp@latest" }], tip: "create-solana-dapp scaffolds Next.js, React+Vite, or Express." } },
    { label: "Mobile app", description: "Build a Solana mobile app", query: "mobile app Solana wallet React Native",
      recommendation: { skills: [{ name: "Phantom Connect Skill", install: "npx skills add https://github.com/sendaifun/skills/tree/main/skills/phantom-connect" }], mcps: [], repos: [{ name: "solana-mobile-dapp-scaffold", command: "git clone https://github.com/solana-mobile/solana-mobile-dapp-scaffold.git" }], tip: "Kotlin devs can use solana-kotlin-compose scaffold." } },
    { label: "Blinks / Actions", description: "Shareable Solana Actions for social", query: "Solana Actions blinks shareable transaction",
      recommendation: { skills: [], mcps: [], repos: [{ name: "solana-actions", command: "git clone https://github.com/solana-developers/solana-actions.git" }], tip: "Actions SDK for the standard. Express template for quick backends." } },
    { label: "Gaming & loyalty", description: "On-chain gaming, rewards, token-gated", query: "gaming loyalty rewards token-gated NFT",
      recommendation: { skills: [{ name: "Metaplex Skill", install: "npx skills add https://github.com/metaplex-foundation/skill" }], mcps: [], repos: [], tip: "Metaplex Core for in-game assets. Token-gated via Phantom Connect." } },
  ]},
  { label: "DePIN & Real World", subcategories: [
    { label: "Oracle / price feeds", description: "Pyth, Switchboard for on-chain data", query: "price feed oracle Pyth Switchboard",
      recommendation: { skills: [{ name: "Pyth Skill", install: "npx skills add https://github.com/sendaifun/skills/tree/main/skills/pyth" }, { name: "Switchboard Skill", install: "npx skills add https://github.com/sendaifun/skills/tree/main/skills/switchboard" }], mcps: [], repos: [{ name: "pyth-sdk", command: "git clone https://github.com/pyth-network/pyth-sdk-rs.git" }], tip: "Pyth for price feeds. Switchboard for VRF + custom feeds." } },
    { label: "DePIN infrastructure", description: "Decentralized physical infrastructure", query: "DePIN physical infrastructure sensor IoT",
      recommendation: { skills: [{ name: "Helius Build Skill", install: "npx skills add https://github.com/helius-labs/core-ai/tree/main/helius-skills/helius" }], mcps: [{ name: "Helius MCP", setup: "codex mcp add helius npx helius-mcp@latest" }], repos: [], tip: "DePIN needs reliable indexing. Helius DAS API + webhooks for device state." } },
    { label: "Real-world assets (RWA)", description: "Tokenize real-world assets", query: "RWA real world asset tokenization",
      recommendation: { skills: [{ name: "Light Protocol Skill", install: "npx skills add https://github.com/sendaifun/skills/tree/main/skills/light-protocol" }], mcps: [], repos: [], tip: "Light Protocol for ZK compressed accounts — ideal for compliant tokenization." } },
  ]},
  { label: "Infrastructure", subcategories: [
    { label: "RPC, indexing & webhooks", description: "Full Helius toolchain", query: "RPC infrastructure API webhooks indexing DAS",
      recommendation: { skills: [{ name: "Helius Build Skill", install: "npx skills add https://github.com/helius-labs/core-ai/tree/main/helius-skills/helius" }], mcps: [{ name: "Helius MCP", setup: "codex mcp add helius npx helius-mcp@latest" }], repos: [{ name: "helius-core-ai", command: "git clone https://github.com/helius-labs/core-ai.git" }], tip: "Helius MCP has 60+ tools. Install helius-cli: npm i -g helius-cli" } },
    { label: "Token analytics & forensics", description: "Explore wallets, transactions, on-chain data", query: "transaction analytics explorer wallet",
      recommendation: { skills: [{ name: "CoinGecko Skill", install: "npx skills add https://github.com/sendaifun/skills/tree/main/skills/coingecko" }], mcps: [{ name: "DexScreener MCP", setup: "npx -y @opensvm/dexscreener-mcp-server" }], repos: [], tip: "DexScreener for real-time pair data." } },
    { label: "NFTs & compressed assets", description: "Mint, compress, manage digital assets", query: "NFT Metaplex Core compressed cNFT",
      recommendation: { skills: [{ name: "Metaplex Skill", install: "npx skills add https://github.com/metaplex-foundation/skill" }, { name: "Light Protocol Skill", install: "npx skills add https://github.com/sendaifun/skills/tree/main/skills/light-protocol" }], mcps: [], repos: [{ name: "mpl-candy-machine", command: "git clone https://github.com/metaplex-foundation/mpl-candy-machine.git" }], tip: "Core NFTs are the latest standard. Light Protocol for ZK compressed tokens." } },
  ]},
];

// Flatten for matching
const ALL_SUBS: Array<{ catLabel: string; sub: Subcategory }> = [];
for (const cat of CURATED) for (const sub of cat.subcategories) ALL_SUBS.push({ catLabel: cat.label, sub });

// --- Tag → skill mapping for dynamic "Winners also use" ---

const TAG_TO_SKILL: Record<string, { name: string; install: string }> = {
  oracle: { name: "Pyth Skill", install: "npx skills add https://github.com/sendaifun/skills/tree/main/skills/pyth" },
  staking: { name: "Sanctum Skill", install: "npx skills add https://github.com/sendaifun/skills/tree/main/skills/sanctum" },
  nft: { name: "Metaplex Skill", install: "npx skills add https://github.com/metaplex-foundation/skill" },
  depin: { name: "Helius Build Skill", install: "npx skills add https://github.com/helius-labs/core-ai/tree/main/helius-skills/helius" },
  payments: { name: "Payments & Commerce", install: "npx skills add https://github.com/solana-foundation/solana-dev-skill" },
  lending: { name: "Kamino Skill", install: "npx skills add https://github.com/sendaifun/skills/tree/main/skills/kamino" },
  swap: { name: "Jupiter Skill", install: "npx skills add https://github.com/jup-ag/agent-skills/tree/main/skills/integrating-jupiter" },
  perpetual: { name: "Drift Skill", install: "npx skills add https://github.com/sendaifun/skills/tree/main/skills/drift" },
  "smart contracts": { name: "Security Checklist", install: "npx skills add https://github.com/solana-foundation/solana-dev-skill" },
  anchor: { name: "Programs with Anchor", install: "npx skills add https://github.com/solana-foundation/solana-dev-skill" },
  compression: { name: "Light Protocol Skill", install: "npx skills add https://github.com/sendaifun/skills/tree/main/skills/light-protocol" },
};

function normalizeRecommendation(rec: Recommendation): Recommendation {
  return {
    ...rec,
    mcps: rec.mcps.map((m) => ({ ...m, setup: normalizeAgentCommand(m.setup) })),
  };
}

// --- Matching logic ---

function matchToSubcategory(searchData: LandscapeData["search"]): Array<{ catLabel: string; sub: Subcategory; score: number }> {
  const tagBag = new Set<string>();
  if (searchData?.results) {
    for (const r of searchData.results) {
      r.tags?.problemTags?.forEach(t => tagBag.add(t.toLowerCase()));
      r.tags?.solutionTags?.forEach(t => tagBag.add(t.toLowerCase()));
      r.tags?.primitives?.forEach(t => tagBag.add(t.toLowerCase()));
      r.tags?.techStack?.forEach(t => tagBag.add(t.toLowerCase()));
      if (r.cluster?.label) tagBag.add(r.cluster.label.toLowerCase());
    }
  }
  const scored = ALL_SUBS.map(entry => {
    const kws = entry.sub.query.toLowerCase().split(/\s+/);
    let score = 0;
    for (const kw of kws) for (const tag of tagBag) { if (tag.includes(kw) || kw.includes(tag)) score++; }
    return { ...entry, score };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 5);
}

function findWinnerSkills(searchData: LandscapeData["search"], baseRec: Recommendation): Array<{ name: string; install: string; reason: string }> {
  const baseNames = new Set(baseRec.skills.map(s => s.name));
  const tagCounts = new Map<string, number>();
  if (!searchData?.results) return [];
  for (const r of searchData.results) {
    if (!r.prize) continue; // only winners
    const allTags = [...(r.tags?.primitives || []), ...(r.tags?.techStack || [])];
    for (const t of allTags) {
      const key = t.toLowerCase();
      tagCounts.set(key, (tagCounts.get(key) || 0) + 1);
    }
  }
  const extras: Array<{ name: string; install: string; reason: string }> = [];
  for (const [tag, count] of tagCounts) {
    const skill = TAG_TO_SKILL[tag];
    if (skill && !baseNames.has(skill.name) && count >= 2) {
      extras.push({ ...skill, reason: `${tag} \u2014 used by ${count} winners` });
      baseNames.add(skill.name); // dedupe
    }
  }
  return extras.slice(0, 3);
}

// --- Screen builders ---

function buildExploreScreen(
  query: string,
  explore: ExploreData | null,
  loading: boolean,
  selectedIdx: number, // -1 = text input focused, 0+ = cluster index
  rows: number,
): string[] {
  const lines: string[] = [];
  lines.push("");
  lines.push(`  ${GRADIENT_PRODUCT}  ${BOLD}What do you want to build on Solana?${RESET}`);
  lines.push("");

  // Text input
  const inputFocused = selectedIdx < 0;
  const pointer = inputFocused ? `${CYAN}\u25b8${RESET}` : `${DIM}\u25b8${RESET}`;
  const cursor = inputFocused ? `${BOLD}\u2588${RESET}` : "";
  lines.push(`  ${pointer} ${query}${cursor}`);
  lines.push("");

  if (loading) {
    lines.push(`  ${DIM}Loading Solana ecosystem data...${RESET}`);
    return padFooter(lines, [`  ${DIM}type your idea${RESET}  ${BOLD}enter${RESET} ${DIM}go${RESET}  ${DIM}esc quit${RESET}`], rows);
  }

  if (!explore || explore.all.length === 0) {
    // Fallback: show curated categories
    lines.push(`  ${DIM}\u2500\u2500 or pick a category \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500${RESET}`);
    lines.push("");
    let idx = 0;
    for (const cat of CURATED) {
      for (const sub of cat.subcategories) {
        const isSel = idx === selectedIdx;
        const p = isSel ? `${CYAN}\u276f${RESET}` : " ";
        const c = isSel ? BOLD + CYAN : "";
        lines.push(`  ${p} ${c}${sub.label}${RESET} ${DIM}(${cat.label})${RESET}`);
        idx++;
      }
    }
  } else {
    // Live clusters from Copilot
    lines.push(`  ${DIM}\u2500\u2500 trending on Solana \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500${RESET}`);
    lines.push("");

    const filterLower = query.toLowerCase();
    let idx = 0;

    function renderSection(title: string, color: string, items: ClusterInfo[]) {
      const visible = filterLower
        ? items.filter(c => c.label.toLowerCase().includes(filterLower))
        : items;
      if (visible.length === 0) return;
      lines.push(`  ${color}${title}${RESET}`);
      for (const c of visible) {
        const isSel = idx === selectedIdx;
        const p = isSel ? `${CYAN}\u276f${RESET}` : " ";
        const nm = isSel ? BOLD + CYAN : "";
        const countStr = c.winRate > 0 && c.winnerCount >= 3
          ? `${(c.winRate * 100).toFixed(0)}% win`
          : `${c.projectCount} projects`;
        lines.push(`  ${p} ${nm}${c.label}${RESET}  ${DIM}${countStr}${RESET}`);
        idx++;
      }
      lines.push("");
    }

    renderSection(`${RED}HOT${RESET}`, "", explore.hot);
    renderSection(`${GREEN}WINNING${RESET}`, "", explore.winning);
    renderSection(`${CYAN}OPEN OPPORTUNITY${RESET}`, "", explore.open);
  }

  return padFooter(lines, [`  ${DIM}\u2191\u2193 browse${RESET}  ${DIM}type your idea${RESET}  ${BOLD}enter${RESET} ${DIM}go${RESET}  ${DIM}esc quit${RESET}`], rows);
}

function buildLandscapeScreen(title: string, data: LandscapeData | null, loading: boolean, rows: number): string[] {
  const lines: string[] = [];
  lines.push("");
  lines.push(`  ${GRADIENT_PRODUCT}  ${BOLD}Landscape: ${title.length > 40 ? title.slice(0, 37) + "..." : title}${RESET}`);
  lines.push("");

  if (loading) {
    lines.push(`  ${DIM}Searching projects \u00b7 analyzing winners \u00b7 finding research...${RESET}`);
    return padFooter(lines, [`  ${DIM}please wait...${RESET}`], rows);
  }
  if (!data) {
    lines.push(`  ${DIM}Could not fetch landscape data.${RESET}`);
    return padFooter(lines, [`  ${BOLD}enter${RESET} ${DIM}continue${RESET}  ${DIM}esc back${RESET}`], rows);
  }

  const search = data.search;
  if (search && search.totalFound > 0) {
    const total = search.totalFound;
    const level = total > COMPETITION_HIGH ? "High" : total > COMPETITION_MEDIUM ? "Medium" : "Low";
    const filled = Math.min(Math.round(total / 5), 10);
    const bar = "\u2588".repeat(filled) + "\u2591".repeat(10 - filled);
    const color = total > COMPETITION_HIGH ? RED : total > COMPETITION_MEDIUM ? YELLOW : GREEN;
    lines.push(`  ${BOLD}${total}${RESET} ${DIM}similar projects${RESET}  ${color}${bar} ${level}${RESET}`);
    lines.push("");
    for (const p of search.results.slice(0, 4)) {
      const tag = p.prize ? ` ${GREEN}[winner]${RESET}` : "";
      const liner = p.oneLiner ? ` ${DIM}\u2014 ${p.oneLiner.length > 50 ? p.oneLiner.slice(0, 47) + "..." : p.oneLiner}${RESET}` : "";
      lines.push(`    ${BOLD}${p.name}${RESET}${tag}${liner}`);
    }
    lines.push("");
  } else {
    lines.push(`  ${GREEN}No similar projects found \u2014 open space!${RESET}`);
    lines.push("");
  }

  const gaps = data.gaps;
  if (gaps && (gaps.overindexed.length > 0 || gaps.underindexed.length > 0)) {
    lines.push(`  ${BOLD}WHAT\u2019S MISSING${RESET}`);
    if (gaps.overindexed.length > 0) {
      const tags = gaps.overindexed.slice(0, 3).map(t => `${GREEN}${t.label}${RESET} ${DIM}+${(t.delta * 100).toFixed(0)}%${RESET}`).join("  ");
      lines.push(`  ${DIM}Winners build more:${RESET}  ${tags}`);
    }
    if (gaps.underindexed.length > 0) {
      const tags = gaps.underindexed.slice(0, 3).map(t => `${RED}${t.label}${RESET} ${DIM}${(t.delta * 100).toFixed(0)}%${RESET}`).join("  ");
      lines.push(`  ${DIM}Winners skip:${RESET}       ${tags}`);
    }
    lines.push("");
    if (gaps.summary) { for (const l of insightBox(gaps.summary)) lines.push(l); lines.push(""); }
  }

  if (data.archives?.results?.length) {
    lines.push(`  ${DIM}RESEARCH${RESET}`);
    for (const a of data.archives.results.slice(0, 2)) lines.push(`    ${DIM}${a.title} \u2014 ${a.source}${RESET}`);
    lines.push("");
  }

  return padFooter(lines, [`  ${BOLD}enter${RESET} ${DIM}see toolkit${RESET}  ${DIM}esc back${RESET}  ${DIM}q quit${RESET}`], rows);
}

function buildRecommendationScreen(
  sub: Subcategory,
  winnerSkills: Array<{ name: string; install: string; reason: string }>,
  rows: number,
): string[] {
  const lines: string[] = [];
  const rec = normalizeRecommendation(sub.recommendation);
  lines.push("");
  lines.push(`  ${GRADIENT_PRODUCT}  ${BOLD}${sub.label}${RESET}`);
  lines.push("");

  if (rec.skills.length > 0) {
    lines.push(`  ${GREEN}${BOLD}Skills:${RESET}`);
    for (const s of rec.skills) {
      const tag = s.official ? `${GREEN}[official]${RESET}` : `${YELLOW}[community]${RESET}`;
      lines.push(`    ${tag} ${BOLD}${s.name}${RESET}`);
      lines.push(`    ${MAGENTA}$ ${s.install}${RESET}`);
      lines.push("");
    }
  }
  if (rec.mcps.length > 0) {
    lines.push(`  ${BLUE}${BOLD}MCPs:${RESET}`);
    for (const m of rec.mcps) { lines.push(`    ${BOLD}${m.name}${RESET}`); lines.push(`    ${MAGENTA}$ ${m.setup}${RESET}`); lines.push(""); }
  }
  if (rec.repos.length > 0) {
    lines.push(`  ${CYAN}${BOLD}Repos:${RESET}`);
    for (const r of rec.repos) { lines.push(`    ${BOLD}${r.name}${RESET}`); lines.push(`    ${MAGENTA}$ ${r.command}${RESET}`); lines.push(""); }
  }
  if (winnerSkills.length > 0) {
    lines.push(`  ${YELLOW}${BOLD}Winners also use:${RESET}`);
    for (const w of winnerSkills) {
      lines.push(`    ${GREEN}+${RESET} ${BOLD}${w.name}${RESET} ${DIM}(${w.reason})${RESET}`);
    }
    lines.push("");
  }
  if (rec.tip) { lines.push(`  ${YELLOW}${BOLD}Tip:${RESET} ${DIM}${rec.tip}${RESET}`); lines.push(""); }

  return padFooter(lines, [`  ${BOLD}enter${RESET} ${DIM}setup workspace${RESET}  ${DIM}esc back${RESET}  ${DIM}q quit${RESET}`], rows);
}

// --- Token prompt ---

const COPILOT_SIGNUP_URL = "https://arena.colosseum.org/copilot";

async function promptForCopilotToken(): Promise<string | undefined> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  console.log("");
  console.log(`  ${BOLD}Colosseum Copilot${RESET} ${DIM}\u2014 live ecosystem data + gap analysis${RESET}`);
  console.log(`  ${DIM}5,400+ hackathon projects \u00b7 30 ML clusters \u00b7 winner patterns${RESET}`);
  console.log("");
  console.log(`  ${BOLD}Get your free token:${RESET} ${CYAN}${COPILOT_SIGNUP_URL}${RESET}`);
  console.log(`  ${DIM}Sign in \u2192 copy your Personal Access Token \u2192 paste below${RESET}`);
  console.log("");
  return new Promise((resolve) => {
    rl.question(`  Paste token (Enter to skip): `, (answer) => { rl.close(); resolve(answer.trim() || undefined); });
  });
}

// --- Agent output ---

export function agentOnboarding(): void {
  const token = getToken();
  console.log("Solana Ecosystem Onboarding \u2014 What do you want to build?\n");
  if (token) {
    console.log("Colosseum Copilot: ACTIVE \u2014 landscape + gap analysis available.\n");
  } else {
    console.log(`Tip: Get a token at ${COPILOT_SIGNUP_URL} and set COLOSSEUM_COPILOT_PAT for live ecosystem data.\n`);
  }
  for (const cat of CURATED) {
    console.log(`${cat.label}`);
    for (const sub of cat.subcategories) {
      console.log(`  ${sub.label}`);
      const rec = sub.recommendation;
      if (rec.skills.length > 0) console.log(`    Skills: ${rec.skills.map(s => s.name).join(", ")}`);
      if (rec.mcps.length > 0) console.log(`    MCPs:   ${rec.mcps.map(m => m.name).join(", ")}`);
      if (rec.repos.length > 0) console.log(`    Repos:  ${rec.repos.map(r => r.name).join(", ")}`);
      console.log("");
    }
  }
}

export async function agentIdea(query: string): Promise<void> {
  const token = getToken();
  if (!token) { console.log(`Colosseum Copilot token not set. Run: ${BINARY_NAME} config token`); return; }
  console.log(`Analyzing: "${query}"\n`);
  const data = await fetchLandscape(token, query);
  if (data.search) {
    console.log(`Similar projects: ${data.search.totalFound} found`);
    for (const p of data.search.results.slice(0, 5)) {
      console.log(`  ${p.name}${p.prize ? " [winner]" : ""} \u2014 ${p.hackathon.name}`);
      if (p.oneLiner) console.log(`    ${p.oneLiner}`);
    }
    console.log("");
  }
  if (data.gaps) {
    if (data.gaps.overindexed.length) console.log(`Winners build more: ${data.gaps.overindexed.slice(0, 4).map(t => `${t.label} (+${(t.delta * 100).toFixed(0)}%)`).join(", ")}`);
    if (data.gaps.underindexed.length) console.log(`Winners skip: ${data.gaps.underindexed.slice(0, 4).map(t => `${t.label} (${(t.delta * 100).toFixed(0)}%)`).join(", ")}`);
    console.log(`Insight: ${data.gaps.summary}\n`);
  }
  if (data.archives?.results?.length) {
    console.log("Research:");
    for (const a of data.archives.results.slice(0, 3)) console.log(`  ${a.title} \u2014 ${a.source}`);
    console.log("");
  }
  const matches = matchToSubcategory(data.search);
  if (matches.length > 0) {
    const m = matches[0];
    console.log(`Closest match: ${m.sub.label} (${m.catLabel})`);
    const rec = m.sub.recommendation;
    if (rec.skills.length) console.log(`  Skills: ${rec.skills.map(s => s.name).join(", ")}`);
    if (rec.mcps.length) console.log(`  MCPs:   ${rec.mcps.map(m => m.name).join(", ")}`);
    if (rec.repos.length) console.log(`  Repos:  ${rec.repos.map(r => r.name).join(", ")}`);
  }
}

// --- Interactive TUI ---

type Screen = "explore" | "landscape" | "match" | "recommendation";

export async function interactiveOnboarding(prefilledIdea?: string): Promise<OnboardingResult> {
  const stdin = process.stdin;
  const stdout = process.stdout;

  if (!stdin.isTTY) { agentOnboarding(); return { action: "quit" }; }

  // Token setup
  let copilotToken = getToken();
  if (!copilotToken && shouldPromptForToken()) {
    const entered = await promptForCopilotToken();
    if (entered) {
      process.stdout.write(`  ${DIM}Verifying...${RESET}`);
      const valid = await verifyToken(entered);
      if (valid) { saveToken(entered); copilotToken = entered; console.log(`\r  ${GREEN}Token verified and saved.${RESET}          `); }
      else { console.log(`\r  ${YELLOW}Invalid token.${RESET}                    `); markTokenPrompted(); }
      console.log("");
    } else { markTokenPrompted(); console.log(`  ${DIM}Run ${BINARY_NAME} config token to add later.${RESET}\n`); }
  }

  stdin.setRawMode(true);
  stdin.resume();
  stdin.setEncoding("utf8");
  stdout.write(ALT_SCREEN_ON);
  stdout.write(CURSOR_HIDE);

  // State
  let screen: Screen = "explore";
  let query = prefilledIdea || "";
  let exploreData: ExploreData | null = null;
  let exploreLoading = !!copilotToken;
  let selectedIdx = -1; // -1 = text input
  let landscapeData: LandscapeData | null = null;
  let landscapeLoading = false;
  let landscapeGen = 0;
  let matchedSubs: Array<{ catLabel: string; sub: Subcategory; score: number }> = [];
  let matchIdx = 0;
  let winnerSkills: Array<{ name: string; install: string; reason: string }> = [];

  function getRows(): number { return stdout.rows || 24; }

  // Count visible items for cluster navigation
  function getVisibleClusterCount(): number {
    if (!exploreData || exploreData.all.length === 0) return ALL_SUBS.length;
    const filterLower = query.toLowerCase();
    if (!filterLower) return exploreData.hot.length + exploreData.winning.length + exploreData.open.length;
    return [...exploreData.hot, ...exploreData.winning, ...exploreData.open]
      .filter(c => c.label.toLowerCase().includes(filterLower)).length;
  }

  function draw() {
    const rows = getRows();
    let lines: string[];
    switch (screen) {
      case "explore":
        lines = buildExploreScreen(query, exploreData, exploreLoading, selectedIdx, rows); break;
      case "landscape":
        lines = buildLandscapeScreen(query, landscapeData, landscapeLoading, rows); break;
      case "match": {
        const matches = matchedSubs.map(m => ({ sub: m.sub, catLabel: m.catLabel }));
        const mLines: string[] = [];
        mLines.push("");
        mLines.push(`  ${GRADIENT_PRODUCT}  ${BOLD}Matched recommendations${RESET}`);
        mLines.push("");
        mLines.push(`  ${DIM}Your idea:${RESET} ${query.length > 55 ? query.slice(0, 52) + "..." : query}`);
        mLines.push("");
        for (let i = 0; i < matches.length && i < 5; i++) {
          const m = matches[i];
          const isSel = i === matchIdx;
          const p = isSel ? `${CYAN}\u276f${RESET}` : " ";
          const c = isSel ? BOLD + CYAN : BOLD;
          mLines.push(`  ${p} ${c}${m.sub.label}${RESET} ${DIM}(${m.catLabel})${RESET}`);
          if (isSel) {
            const rec = m.sub.recommendation;
            if (rec.skills.length) mLines.push(`      ${GREEN}Skills:${RESET} ${DIM}${rec.skills.map(s => s.name).join(", ")}${RESET}`);
            if (rec.mcps.length) mLines.push(`      ${BLUE}MCPs:${RESET}   ${DIM}${rec.mcps.map(m => m.name).join(", ")}${RESET}`);
          }
          mLines.push("");
        }
        lines = padFooter(mLines, [`  ${DIM}\u2191\u2193 navigate${RESET}  ${BOLD}enter${RESET} ${DIM}select & setup${RESET}  ${DIM}esc back${RESET}`], rows);
        break;
      }
      case "recommendation":
        lines = buildRecommendationScreen(matchedSubs[matchIdx].sub, winnerSkills, rows); break;
      default: lines = []; break;
    }
    stdout.write(`${CLEAR_SCREEN}${lines.join("\n")}`);
  }

  // Fetch explore data in background
  if (copilotToken) {
    fetchExploreData(copilotToken).then(d => { exploreData = d; exploreLoading = false; if (screen === "explore") draw(); }).catch(() => { exploreLoading = false; if (screen === "explore") draw(); });
  }

  // If prefilled, auto-submit
  if (prefilledIdea && copilotToken) {
    screen = "landscape";
    landscapeLoading = true;
    const gen = ++landscapeGen;
    fetchLandscape(copilotToken, prefilledIdea).then(d => {
      if (gen !== landscapeGen) return;
      landscapeData = d; landscapeLoading = false; if (screen === "landscape") draw();
    }).catch(() => { if (gen !== landscapeGen) return; landscapeLoading = false; if (screen === "landscape") draw(); });
  }

  draw();

  const onResize = () => draw();
  stdout.on("resize", onResize);

  return new Promise<OnboardingResult>((resolve) => {
    function cleanup() {
      stdout.removeListener("resize", onResize);
      stdin.setRawMode(false); stdin.pause(); stdin.removeListener("data", onData);
      stdout.write(CURSOR_SHOW); stdout.write(ALT_SCREEN_OFF);
    }

    function goToLandscape(searchQuery: string) {
      query = searchQuery;
      screen = "landscape";
      landscapeData = null;
      landscapeLoading = true;
      const gen = ++landscapeGen;
      draw();
      if (!copilotToken) { landscapeLoading = false; draw(); return; }
      fetchLandscape(copilotToken, searchQuery).then(d => {
        if (gen !== landscapeGen) return;
        landscapeData = d; landscapeLoading = false; if (screen === "landscape") draw();
      }).catch(() => { if (gen !== landscapeGen) return; landscapeLoading = false; if (screen === "landscape") draw(); });
    }

    function onData(key: string) {
      if (key === "\x03") { cleanup(); process.exit(0); }

      switch (screen) {
        case "explore": {
          if (key === "\x1b") { cleanup(); resolve({ action: "quit" }); return; }
          if (key === "\x1b[A") {
            if (selectedIdx > -1) selectedIdx--;
            draw(); return;
          }
          if (key === "\x1b[B") {
            const max = getVisibleClusterCount() - 1;
            if (selectedIdx < max) selectedIdx++;
            draw(); return;
          }
          if (key === "\r" || key === "\n") {
            if (selectedIdx < 0 && query.trim().length > 2) {
              goToLandscape(query.trim());
            } else if (selectedIdx >= 0) {
              // Get the cluster or subcategory at this index
              if (exploreData && exploreData.all.length > 0) {
                const filterLower = query.toLowerCase();
                const visible = [...exploreData.hot, ...exploreData.winning, ...exploreData.open]
                  .filter(c => !filterLower || c.label.toLowerCase().includes(filterLower));
                if (visible[selectedIdx]) goToLandscape(visible[selectedIdx].label);
              } else {
                if (ALL_SUBS[selectedIdx]) {
                  const entry = ALL_SUBS[selectedIdx];
                  query = entry.sub.label;
                  if (copilotToken) {
                    goToLandscape(entry.sub.query);
                  } else {
                    // No token: skip landscape, go to recommendation
                    matchedSubs = [{ ...entry, score: 100 }];
                    matchIdx = 0;
                    winnerSkills = [];
                    screen = "recommendation";
                    draw();
                  }
                }
              }
            }
            return;
          }
          // Text input
          if (selectedIdx < 0) {
            if ((key === "\x7f" || key === "\b") && query.length > 0) { query = query.slice(0, -1); draw(); return; }
            if (key.length === 1 && key >= " " && query.length < 200) { query += key; draw(); return; }
          }
          return;
        }
        case "landscape": {
          if (landscapeLoading) return;
          if (key === "\x1b") { screen = "explore"; draw(); return; }
          if (key === "\r" || key === "\n") {
            matchedSubs = matchToSubcategory(landscapeData?.search ?? null);
            matchIdx = 0;
            if (matchedSubs.length > 1) {
              screen = "match";
            } else if (matchedSubs.length === 1) {
              winnerSkills = findWinnerSkills(landscapeData?.search ?? null, matchedSubs[0].sub.recommendation);
              screen = "recommendation";
            }
            draw(); return;
          }
          if (key === "q" || key === "Q") { cleanup(); resolve({ action: "quit" }); return; }
          return;
        }
        case "match": {
          if (key === "\x1b") { screen = "landscape"; draw(); return; }
          if (key === "\x1b[A") { matchIdx = Math.max(matchIdx - 1, 0); draw(); return; }
          if (key === "\x1b[B") { matchIdx = Math.min(matchIdx + 1, matchedSubs.length - 1); draw(); return; }
          if (key === "\r" || key === "\n") {
            winnerSkills = findWinnerSkills(landscapeData?.search ?? null, matchedSubs[matchIdx].sub.recommendation);
            screen = "recommendation";
            draw(); return;
          }
          if (key === "q" || key === "Q") { cleanup(); resolve({ action: "quit" }); return; }
          return;
        }
        case "recommendation": {
          if (key === "\r" || key === "\n") {
            const sub = matchedSubs[matchIdx].sub;
            cleanup();
            resolve({
              action: "setup",
              subcategoryLabel: sub.label,
              subcategoryDescription: sub.description,
              recommendation: normalizeRecommendation(sub.recommendation),
              landscapeData,
              ideaText: query,
              winnerSkills,
            });
            return;
          }
          if (key === "\x1b" || key === "\x1b[A") {
            screen = matchedSubs.length > 1 ? "match" : "landscape";
            draw(); return;
          }
          if (key === "q" || key === "Q") { cleanup(); resolve({ action: "quit" }); return; }
          return;
        }
      }
    }

    stdin.on("data", onData);
  });
}
