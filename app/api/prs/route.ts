import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { RepoConfig, PullRequest } from "@/lib/types";
import { OPEN_PRS_QUERY } from "@/lib/github-queries";

const GITHUB_GRAPHQL_URL = "https://api.github.com/graphql";

interface GraphQLResponse {
  data?: {
    repository?: {
      pullRequests?: {
        pageInfo: { hasNextPage: boolean; endCursor: string | null };
        nodes: PullRequest[];
      };
    };
  };
  errors?: Array<{ message: string }>;
}

async function fetchPRsForRepo(
  token: string,
  repo: RepoConfig
): Promise<{ prs: PullRequest[]; error?: string }> {
  const allPRs: PullRequest[] = [];
  let cursor: string | null = null;

  try {
    do {
      const response = await fetch(GITHUB_GRAPHQL_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: OPEN_PRS_QUERY,
          variables: { owner: repo.owner, name: repo.name, cursor },
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        return { prs: [], error: `HTTP ${response.status}: ${text}` };
      }

      const json: GraphQLResponse = await response.json();

      if (json.errors && json.errors.length > 0) {
        return { prs: [], error: json.errors.map((e) => e.message).join("; ") };
      }

      const prData = json.data?.repository?.pullRequests;
      if (!prData) {
        return { prs: [], error: "Repository not found or not accessible" };
      }

      allPRs.push(...prData.nodes);
      cursor = prData.pageInfo.hasNextPage ? prData.pageInfo.endCursor : null;
    } while (cursor);

    return { prs: allPRs };
  } catch (err) {
    return { prs: [], error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();

  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let repos: RepoConfig[];
  try {
    const body = await req.json();
    repos = body.repos as RepoConfig[];
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!Array.isArray(repos) || repos.length === 0) {
    return NextResponse.json({ results: [] });
  }

  const results = await Promise.all(
    repos.map(async (repo) => {
      const { prs, error } = await fetchPRsForRepo(
        session.accessToken as string,
        repo
      );
      return { repo, prs, error };
    })
  );

  return NextResponse.json({ results });
}
