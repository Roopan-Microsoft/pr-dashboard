"use client";

import { PullRequest } from "@/lib/types";

function getReviewSummary(reviews: PullRequest["reviews"]["nodes"]) {
  const stateMap: Record<string, string> = {};
  // Last review per author wins
  for (const r of reviews) {
    if (r.author?.login) {
      stateMap[r.author.login] = r.state;
    }
  }
  const states = Object.values(stateMap);
  if (states.includes("APPROVED") && !states.includes("CHANGES_REQUESTED")) {
    return { label: "Approved", color: "bg-green-100 text-green-800" };
  }
  if (states.includes("CHANGES_REQUESTED")) {
    return { label: "Changes requested", color: "bg-red-100 text-red-800" };
  }
  if (states.includes("COMMENTED")) {
    return { label: "Commented", color: "bg-yellow-100 text-yellow-800" };
  }
  return null;
}

function getCIStatus(pr: PullRequest) {
  const rollup =
    pr.commits.nodes[0]?.commit?.statusCheckRollup?.state ?? null;
  if (!rollup) return null;
  const map: Record<string, { label: string; color: string }> = {
    SUCCESS: { label: "✓ CI passed", color: "text-green-600" },
    FAILURE: { label: "✗ CI failed", color: "text-red-600" },
    ERROR: { label: "✗ CI error", color: "text-red-600" },
    PENDING: { label: "⟳ CI pending", color: "text-yellow-600" },
    EXPECTED: { label: "⟳ CI expected", color: "text-yellow-600" },
  };
  return map[rollup] ?? { label: rollup, color: "text-gray-500" };
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

interface PRCardProps {
  pr: PullRequest;
}

export function PRCard({ pr }: PRCardProps) {
  const reviewSummary = getReviewSummary(pr.reviews.nodes);
  const ciStatus = getCIStatus(pr);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        {pr.author && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={pr.author.avatarUrl}
            alt={pr.author.login}
            className="w-8 h-8 rounded-full flex-shrink-0 mt-0.5"
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            {pr.isDraft && (
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                Draft
              </span>
            )}
            {reviewSummary && (
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${reviewSummary.color}`}
              >
                {reviewSummary.label}
              </span>
            )}
            {pr.labels.nodes.map((label) => (
              <span
                key={label.name}
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{
                  backgroundColor: `#${label.color}22`,
                  color: `#${label.color}`,
                  border: `1px solid #${label.color}55`,
                }}
              >
                {label.name}
              </span>
            ))}
          </div>
          <a
            href={pr.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-blue-700 hover:underline leading-snug"
          >
            {pr.title}
          </a>
          <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-gray-500">
            <span>#{pr.number}</span>
            {pr.author && <span>by {pr.author.login}</span>}
            <span title={new Date(pr.updatedAt).toLocaleString()}>
              updated {timeAgo(pr.updatedAt)}
            </span>
            {ciStatus && (
              <span className={`font-medium ${ciStatus.color}`}>
                {ciStatus.label}
              </span>
            )}
          </div>
          {pr.reviewRequests.nodes.length > 0 && (
            <div className="flex flex-wrap items-center gap-1 mt-2">
              <span className="text-xs text-gray-400">Reviewers:</span>
              {pr.reviewRequests.nodes.map((req, i) => {
                const reviewer = req.requestedReviewer;
                const name =
                  reviewer.__typename === "User"
                    ? reviewer.login
                    : reviewer.name;
                return (
                  <span
                    key={i}
                    className="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded"
                  >
                    {name}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
