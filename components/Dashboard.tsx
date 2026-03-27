"use client";

import { useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { RepoPRs, RepoConfig, FilterState, PullRequest } from "@/lib/types";
import { PRCard } from "./PRCard";

interface DashboardProps {
  repos: RepoConfig[];
}

const DEFAULT_FILTERS: FilterState = {
  search: "",
  repo: "",
  showDrafts: true,
  sortField: "updatedAt",
  sortOrder: "desc",
};

function sortPRs(prs: PullRequest[], field: FilterState["sortField"], order: FilterState["sortOrder"]) {
  return [...prs].sort((a, b) => {
    let cmp = 0;
    if (field === "updatedAt") {
      cmp = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
    } else if (field === "createdAt") {
      cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    } else if (field === "number") {
      cmp = a.number - b.number;
    }
    return order === "asc" ? cmp : -cmp;
  });
}

export function Dashboard({ repos }: DashboardProps) {
  const { data: session } = useSession();
  const [repoPRs, setRepoPRs] = useState<RepoPRs[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  const fetchPRs = useCallback(async () => {
    if (!session) return;
    if (repos.length === 0) {
      setRepoPRs([]);
      return;
    }
    setLoading(true);
    setFetchError("");
    try {
      const res = await fetch("/api/prs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repos }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setFetchError(data.error ?? `Request failed: ${res.status}`);
        return;
      }
      const data = await res.json();
      setRepoPRs(data.results ?? []);
      setLastFetched(new Date());
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : "Failed to fetch PRs");
    } finally {
      setLoading(false);
    }
  }, [session, repos]);

  const totalPRs = repoPRs.reduce((sum, r) => sum + r.prs.length, 0);

  const allRepoKeys = repoPRs.map((r) => `${r.repo.owner}/${r.repo.name}`);

  // Apply filters and collect all PRs across repos for display
  const filteredRepoPRs = repoPRs
    .filter(
      (r) =>
        !filters.repo ||
        `${r.repo.owner}/${r.repo.name}` === filters.repo
    )
    .map((r) => ({
      ...r,
      prs: sortPRs(
        r.prs.filter((pr) => {
          if (!filters.showDrafts && pr.isDraft) return false;
          if (
            filters.search &&
            !pr.title.toLowerCase().includes(filters.search.toLowerCase()) &&
            !pr.author?.login
              .toLowerCase()
              .includes(filters.search.toLowerCase())
          )
            return false;
          return true;
        }),
        filters.sortField,
        filters.sortOrder
      ),
    }))
    .filter((r) => r.prs.length > 0);

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <button
          onClick={fetchPRs}
          disabled={loading || repos.length === 0}
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Loading…
            </>
          ) : (
            "↻ Refresh"
          )}
        </button>
        {lastFetched && (
          <span className="text-xs text-gray-400">
            Last updated {lastFetched.toLocaleTimeString()}
          </span>
        )}
        {repoPRs.length > 0 && (
          <span className="text-xs text-gray-500 ml-auto">
            {totalPRs} open PR{totalPRs !== 1 ? "s" : ""} across {repoPRs.length} repo{repoPRs.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Filters */}
      {repoPRs.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <input
            type="text"
            placeholder="Search title or author…"
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[200px]"
          />
          <select
            value={filters.repo}
            onChange={(e) => setFilters((f) => ({ ...f, repo: e.target.value }))}
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All repos</option>
            {allRepoKeys.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
          <select
            value={`${filters.sortField}:${filters.sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split(":");
              setFilters((f) => ({
                ...f,
                sortField: field as FilterState["sortField"],
                sortOrder: order as FilterState["sortOrder"],
              }));
            }}
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="updatedAt:desc">Updated (newest)</option>
            <option value="updatedAt:asc">Updated (oldest)</option>
            <option value="createdAt:desc">Created (newest)</option>
            <option value="createdAt:asc">Created (oldest)</option>
            <option value="number:desc">PR # (desc)</option>
            <option value="number:asc">PR # (asc)</option>
          </select>
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.showDrafts}
              onChange={(e) =>
                setFilters((f) => ({ ...f, showDrafts: e.target.checked }))
              }
              className="rounded"
            />
            Show drafts
          </label>
        </div>
      )}

      {/* Error */}
      {fetchError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-700 text-sm">
          <strong>Error:</strong> {fetchError}
        </div>
      )}

      {/* Empty states */}
      {!loading && repos.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg mb-2">No repositories configured</p>
          <p className="text-sm">Add repositories in the Config tab to get started.</p>
        </div>
      )}

      {!loading && repos.length > 0 && repoPRs.length === 0 && !fetchError && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg mb-2">No data loaded</p>
          <p className="text-sm">Click Refresh to load open pull requests.</p>
        </div>
      )}

      {!loading && filteredRepoPRs.length === 0 && repoPRs.length > 0 && (
        <div className="text-center py-10 text-gray-400">
          <p>No pull requests match your filters.</p>
        </div>
      )}

      {/* PR list grouped by repo */}
      <div className="space-y-8">
        {filteredRepoPRs.map((repoData) => (
          <div key={`${repoData.repo.owner}/${repoData.repo.name}`}>
            <div className="flex items-center gap-2 mb-3">
              <a
                href={`https://github.com/${repoData.repo.owner}/${repoData.repo.name}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-gray-900 hover:underline"
              >
                {repoData.repo.owner}/{repoData.repo.name}
              </a>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-medium">
                {repoData.prs.length} open
              </span>
              {repoData.error && (
                <span className="text-xs text-red-600 ml-2">
                  ⚠ {repoData.error}
                </span>
              )}
            </div>
            {repoData.error && repoData.prs.length === 0 ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm">
                {repoData.error}
              </div>
            ) : (
              <div className="space-y-2">
                {repoData.prs.map((pr) => (
                  <PRCard key={pr.id} pr={pr} />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
