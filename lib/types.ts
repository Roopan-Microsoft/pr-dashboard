export interface RepoConfig {
  owner: string;
  name: string;
}

export interface PullRequest {
  id: string;
  number: number;
  title: string;
  url: string;
  state: string;
  isDraft: boolean;
  createdAt: string;
  updatedAt: string;
  author: {
    login: string;
    avatarUrl: string;
  } | null;
  repository: {
    nameWithOwner: string;
    url: string;
  };
  reviewRequests: {
    nodes: Array<{
      requestedReviewer:
        | { login: string; avatarUrl: string; __typename: "User" }
        | { name: string; __typename: "Team" };
    }>;
  };
  reviews: {
    nodes: Array<{
      state: string;
      author: { login: string } | null;
    }>;
  };
  commits: {
    nodes: Array<{
      commit: {
        statusCheckRollup: {
          state: string;
        } | null;
      };
    }>;
  };
  labels: {
    nodes: Array<{
      name: string;
      color: string;
    }>;
  };
}

export interface RepoPRs {
  repo: RepoConfig;
  prs: PullRequest[];
  error?: string;
}

export type SortField = "updatedAt" | "createdAt" | "number";
export type SortOrder = "asc" | "desc";

export interface FilterState {
  search: string;
  repo: string;
  showDrafts: boolean;
  sortField: SortField;
  sortOrder: SortOrder;
}
