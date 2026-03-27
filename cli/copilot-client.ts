const DEFAULT_API_BASE = "https://copilot.colosseum.com/api/v1";

function getApiBase(): string {
  return process.env.COLOSSEUM_COPILOT_API_BASE || DEFAULT_API_BASE;
}

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
}

export interface SearchProjectsResponse {
  results: ProjectResult[];
  totalFound: number;
  hasMore: boolean;
}

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
