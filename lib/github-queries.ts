export const OPEN_PRS_QUERY = `
  query OpenPRs($owner: String!, $name: String!, $cursor: String) {
    repository(owner: $owner, name: $name) {
      pullRequests(
        states: [OPEN]
        first: 50
        after: $cursor
        orderBy: { field: UPDATED_AT, direction: DESC }
      ) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          id
          number
          title
          url
          state
          isDraft
          createdAt
          updatedAt
          author {
            login
            avatarUrl
          }
          repository {
            nameWithOwner
            url
          }
          reviewRequests(first: 10) {
            nodes {
              requestedReviewer {
                __typename
                ... on User {
                  login
                  avatarUrl
                }
                ... on Team {
                  name
                }
              }
            }
          }
          reviews(first: 20, states: [APPROVED, CHANGES_REQUESTED, COMMENTED]) {
            nodes {
              state
              author {
                login
              }
            }
          }
          commits(last: 1) {
            nodes {
              commit {
                statusCheckRollup {
                  state
                }
              }
            }
          }
          labels(first: 10) {
            nodes {
              name
              color
            }
          }
        }
      }
    }
  }
`;
