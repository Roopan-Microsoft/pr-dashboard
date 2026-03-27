import { RepoConfig } from "./types";

const STORAGE_KEY = "pr-dashboard-repos";

export function loadRepos(): RepoConfig[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as RepoConfig[];
  } catch {
    return [];
  }
}

export function saveRepos(repos: RepoConfig[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(repos));
}

export function exportRepos(repos: RepoConfig[]): void {
  const json = JSON.stringify(repos, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "pr-dashboard-repos.json";
  a.click();
  URL.revokeObjectURL(url);
}

export function parseRepoInput(input: string): RepoConfig | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Try URL patterns:
  // https://github.com/owner/repo  or  https://github.com/owner/repo/...
  const urlMatch = trimmed.match(
    /github\.com\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)/
  );
  if (urlMatch) {
    return { owner: urlMatch[1], name: urlMatch[2] };
  }

  // Try owner/name pattern
  const ownerName = trimmed.match(/^([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)$/);
  if (ownerName) {
    return { owner: ownerName[1], name: ownerName[2] };
  }

  return null;
}
