const DEFAULT_API_BASE = "https://copilot.colosseum.com/api/v1";

function getApiBase(): string {
  return process.env.COLOSSEUM_COPILOT_API_BASE || DEFAULT_API_BASE;
}

// --- Types ---

export interface ProjectResult {
  slug: string;
  name: string;
  oneLiner: string | null;
  similarity: number;
  hackathon: { name: string; slug: string; startDate: string };
  tracks: Array<{ name: string; key: string }>;
  evidence: string[];
  prize: { type: string; name?: string; placement?: number; amount?: number } | null;
  crowdedness: number | null;
  tags?: {
    problemTags?: string[];
    solutionTags?: string[];
    primitives?: string[];
    techStack?: string[];
    targetUsers?: string[];
  };
  cluster?: { key: string; label: string };
}

export interface SearchProjectsResponse {
  results: ProjectResult[];
  totalFound: number;
  hasMore: boolean;
}

interface AnalyzeBucket {
  key: string;
  label: string;
  count: number;
  share: number;
  sampleProjectSlugs?: string[];
}

interface AnalyzeRawResponse {
  totals: { projects: number; winners: number };
  buckets: Record<string, AnalyzeBucket[]>;
}

interface CompareItem {
  key: string;
  label: string;
  countA: number;
  countB: number;
  shareA: number;
  shareB: number;
  lift: number;
  delta: number;
}

interface CompareRawResponse {
  totalsA: { projects: number; winners: number };
  totalsB: { projects: number; winners: number };
  results: Record<string, CompareItem[]>;
}

export interface GapInsight {
  overindexed: Array<{ label: string; delta: number; dimension: string }>;
  underindexed: Array<{ label: string; delta: number; dimension: string }>;
  summary: string;
}

export interface ArchiveResult {
  documentId: string;
  title: string;
  author: string | null;
  source: string;
  url: string | null;
  publishedAt: string | null;
  similarity: number;
  snippet: string;
}

export interface SearchArchivesResponse {
  results: ArchiveResult[];
  totalFound: number;
  hasMore: boolean;
}

export interface LandscapeData {
  search: SearchProjectsResponse | null;
  gaps: GapInsight | null;
  archives: SearchArchivesResponse | null;
}

// --- API request ---

async function apiRequest<T>(method: string, path: string, token: string, body?: unknown): Promise<T> {
  const url = `${getApiBase()}${path}`;
  const res = await fetch(url, {
    method,
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Copilot API ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

// --- Endpoints ---

export async function verifyToken(token: string): Promise<boolean> {
  try {
    const result = await apiRequest<{ authenticated: boolean }>("GET", "/status", token);
    return result.authenticated === true;
  } catch {
    return false;
  }
}

export async function searchProjects(token: string, query: string, limit = 8): Promise<SearchProjectsResponse> {
  return apiRequest<SearchProjectsResponse>("POST", "/search/projects", token, {
    query,
    limit,
    diversify: true,
  });
}

export async function analyzeProjects(
  token: string,
  cohort: Record<string, unknown> = {},
  dimensions = ["problemTags", "solutionTags", "primitives", "techStack"],
  topK = 8,
): Promise<AnalyzeRawResponse> {
  return apiRequest<AnalyzeRawResponse>("POST", "/analyze", token, {
    cohort,
    dimensions,
    topK,
    samplePerBucket: 0,
  });
}

export async function compareProjects(
  token: string,
  cohortA: Record<string, unknown>,
  cohortB: Record<string, unknown>,
  dimensions = ["problemTags", "solutionTags", "primitives"],
  topK = 8,
): Promise<CompareRawResponse> {
  return apiRequest<CompareRawResponse>("POST", "/compare", token, {
    cohortA,
    cohortB,
    dimensions,
    topK,
  });
}

export async function searchArchives(
  token: string,
  query: string,
  limit = 4,
): Promise<SearchArchivesResponse> {
  return apiRequest<SearchArchivesResponse>("POST", "/search/archives", token, {
    query,
    limit,
    maxChunksPerDoc: 1,
    intent: "ideation",
  });
}

// --- Gap synthesis ---

export function synthesizeGaps(compare: CompareRawResponse): GapInsight {
  const overindexed: GapInsight["overindexed"] = [];
  const underindexed: GapInsight["underindexed"] = [];

  for (const [dimension, items] of Object.entries(compare.results)) {
    for (const item of items) {
      if (item.delta > 0.02) {
        overindexed.push({ label: item.label, delta: item.delta, dimension });
      } else if (item.delta < -0.02) {
        underindexed.push({ label: item.label, delta: item.delta, dimension });
      }
    }
  }

  overindexed.sort((a, b) => b.delta - a.delta);
  underindexed.sort((a, b) => a.delta - b.delta);

  const top3Over = overindexed.slice(0, 3).map(t => t.label);
  const top2Under = underindexed.slice(0, 2).map(t => t.label);

  let summary = "";
  if (top3Over.length > 0) {
    summary += `Winners focus on ${top3Over.join(", ")}.`;
  }
  if (top2Under.length > 0) {
    summary += ` Less emphasis on ${top2Under.join(", ")}.`;
  }
  if (!summary) {
    summary = "No strong differentiation pattern found among winners.";
  }

  return {
    overindexed: overindexed.slice(0, 5),
    underindexed: underindexed.slice(0, 5),
    summary: summary.trim(),
  };
}

// --- Explore data (clusters + winner rates) ---

export interface ClusterInfo {
  key: string;
  label: string;
  projectCount: number;
  winnerCount: number;
  winRate: number;
}

export interface ExploreData {
  hot: ClusterInfo[];
  winning: ClusterInfo[];
  open: ClusterInfo[];
  all: ClusterInfo[];
}

interface FiltersCluster { key: string; label: string; projectCount: number }
interface FiltersResponse { clusters: FiltersCluster[] }

export async function fetchExploreData(token: string): Promise<ExploreData> {
  const [filtersRes, analyzeRes] = await Promise.allSettled([
    apiRequest<FiltersResponse>("GET", "/filters", token),
    apiRequest<AnalyzeRawResponse>("POST", "/analyze", token, {
      cohort: { winnersOnly: true }, dimensions: ["clusters"], topK: 30, samplePerBucket: 0,
    }),
  ]);

  const filters = filtersRes.status === "fulfilled" ? filtersRes.value : null;
  const analyze = analyzeRes.status === "fulfilled" ? analyzeRes.value : null;

  if (!filters?.clusters?.length) return { hot: [], winning: [], open: [], all: [] };

  // Build winner count lookup from analyze buckets
  const winnerMap = new Map<string, number>();
  if (analyze?.buckets?.clusters) {
    for (const b of analyze.buckets.clusters) winnerMap.set(b.key, b.count);
  }

  // Enrich clusters with winner data
  const clusters: ClusterInfo[] = filters.clusters.map(c => {
    const wc = winnerMap.get(c.key) || 0;
    return {
      key: c.key,
      label: c.label.replace(/^Solana[- ]*/i, "").replace(/^Based /i, ""),
      projectCount: c.projectCount,
      winnerCount: wc,
      winRate: c.projectCount > 0 ? wc / c.projectCount : 0,
    };
  });

  const byCount = [...clusters].sort((a, b) => b.projectCount - a.projectCount);
  const hasWinnerData = clusters.some(c => c.winnerCount > 0);
  const byWinRate = hasWinnerData
    ? [...clusters].filter(c => c.winnerCount >= 3).sort((a, b) => b.winRate - a.winRate)
    : byCount.slice(4, 8); // fallback: next tier by project count
  const byOpen = [...clusters].sort((a, b) => a.projectCount - b.projectCount);

  return {
    hot: byCount.slice(0, 4),
    winning: byWinRate.slice(0, 4),
    open: byOpen.slice(0, 4),
    all: byCount,
  };
}

// --- Landscape data fetcher (3 parallel calls) ---

export async function fetchLandscape(token: string, query: string): Promise<LandscapeData> {
  const [search, compare, archives] = await Promise.allSettled([
    searchProjects(token, query, 8),
    compareProjects(token, { winnersOnly: true }, {}),
    searchArchives(token, query, 4),
  ]);

  const searchData = search.status === "fulfilled" ? search.value : null;
  const compareData = compare.status === "fulfilled" ? compare.value : null;
  const archivesData = archives.status === "fulfilled" ? archives.value : null;

  return {
    search: searchData,
    gaps: compareData ? synthesizeGaps(compareData) : null,
    archives: archivesData,
  };
}
