"use client";

import { useState, useEffect } from "react";
import { RepoConfig } from "@/lib/types";
import {
  loadRepos,
  saveRepos,
  exportRepos,
  parseRepoInput,
} from "@/lib/storage";

interface ConfigPanelProps {
  onReposChange: (repos: RepoConfig[]) => void;
}

export function ConfigPanel({ onReposChange }: ConfigPanelProps) {
  const [repos, setRepos] = useState<RepoConfig[]>([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [importError, setImportError] = useState("");

  useEffect(() => {
    const saved = loadRepos();
    setRepos(saved);
    onReposChange(saved);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function updateRepos(updated: RepoConfig[]) {
    setRepos(updated);
    saveRepos(updated);
    onReposChange(updated);
  }

  function handleAdd() {
    setError("");
    const parsed = parseRepoInput(input);
    if (!parsed) {
      setError(
        'Invalid format. Use "owner/repo" or paste a GitHub repo URL.'
      );
      return;
    }
    const key = `${parsed.owner}/${parsed.name}`.toLowerCase();
    if (repos.some((r) => `${r.owner}/${r.name}`.toLowerCase() === key)) {
      setError("Repository already added.");
      return;
    }
    updateRepos([...repos, parsed]);
    setInput("");
  }

  function handleRemove(index: number) {
    updateRepos(repos.filter((_, i) => i !== index));
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    setImportError("");
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        if (
          !Array.isArray(parsed) ||
          !parsed.every((r) => r.owner && r.name)
        ) {
          setImportError(
            "Invalid JSON format. Expected array of {owner, name} objects."
          );
          return;
        }
        updateRepos(parsed as RepoConfig[]);
      } catch {
        setImportError("Failed to parse JSON file.");
      }
    };
    reader.readAsText(file);
    // Reset so same file can be imported again
    e.target.value = "";
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Repository Configuration
      </h2>

      <div className="flex gap-2 mb-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder='owner/repo or https://github.com/owner/repo'
          className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Add
        </button>
      </div>
      {error && <p className="text-red-600 text-xs mb-3">{error}</p>}

      {repos.length === 0 ? (
        <p className="text-gray-400 text-sm py-4 text-center">
          No repositories configured. Add one above.
        </p>
      ) : (
        <ul className="divide-y divide-gray-100 mb-4">
          {repos.map((repo, i) => (
            <li
              key={`${repo.owner}/${repo.name}`}
              className="flex items-center justify-between py-2"
            >
              <a
                href={`https://github.com/${repo.owner}/${repo.name}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-700 hover:underline"
              >
                {repo.owner}/{repo.name}
              </a>
              <button
                onClick={() => handleRemove(i)}
                className="text-red-500 hover:text-red-700 text-sm ml-4"
                aria-label={`Remove ${repo.owner}/${repo.name}`}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => exportRepos(repos)}
          disabled={repos.length === 0}
          className="text-sm border border-gray-300 rounded-md px-3 py-1.5 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Export JSON
        </button>
        <label className="text-sm border border-gray-300 rounded-md px-3 py-1.5 hover:bg-gray-50 cursor-pointer">
          Import JSON
          <input
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={handleImport}
          />
        </label>
      </div>
      {importError && (
        <p className="text-red-600 text-xs mt-2">{importError}</p>
      )}
    </div>
  );
}
