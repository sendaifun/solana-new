import repoData from "../../cli/data/clonable-repos.json" with { type: "json" };

export interface ClonableRepo {
  id: string;
  repo: string;
  description: string;
  category: string;
  keywords: string[];
  clone_command: string;
  is_template: boolean;
}

export function listReposByCategory(category?: string): ClonableRepo[] {
  const repos = repoData.repos as ClonableRepo[];
  if (!category) return repos;
  return repos.filter((r) => r.category === category);
}

export function searchRepos(query: string): ClonableRepo[] {
  const repos = repoData.repos as ClonableRepo[];
  const words = query.toLowerCase().split(/\s+/);
  return repos.filter((repo) =>
    words.some(
      (w) =>
        repo.keywords.some((kw) => kw.includes(w)) ||
        repo.repo.toLowerCase().includes(w) ||
        repo.repo.split("/").some((part) => part.includes(w)) ||
        repo.description.toLowerCase().includes(w) ||
        repo.category.includes(w),
    ),
  );
}
