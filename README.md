# PR Dashboard

A Next.js + TypeScript web app that shows all open GitHub pull requests across your configured repositories in one place. Sign in with GitHub OAuth and customise which repos to watch — with filtering, sorting, draft indicators, review status, CI checks, and more.

## Features

- **GitHub OAuth sign-in** — your access token is used server-side; no tokens stored in the browser.
- **Configurable repo list** — add repos by pasting a GitHub URL (`https://github.com/owner/repo`) or `owner/repo` shorthand. Config is persisted in `localStorage`.
- **Import / Export** — save and share your repo list as JSON.
- **Open PR dashboard** — PRs grouped by repository with:
  - Filter by repo, search by title/author, hide drafts.
  - Sort by updated date, created date, or PR number.
  - Draft badge, review status (approved / changes-requested / commented), CI check status, labels, requested reviewers.
- **Refresh button** with last-updated timestamp.
- **Loading and error states** per repo.

## Prerequisites

- Node.js 18+ and npm
- A GitHub OAuth App (see below)

## 1. Create a GitHub OAuth App

1. Go to **GitHub → Settings → Developer settings → OAuth Apps → New OAuth App**.
2. Fill in:
   - **Application name**: `PR Dashboard` (any name)
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
3. Click **Register application**.
4. Copy **Client ID** and generate a **Client Secret**.

> For production, replace `localhost:3000` with your deployed URL in the callback URL field.

## 2. Set environment variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

```env
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
AUTH_SECRET=your_random_secret          # openssl rand -base64 32
```

The `AUTH_SECRET` is used by NextAuth.js to sign session cookies. Generate it with:

```bash
openssl rand -base64 32
```

## 3. Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in with GitHub.

## 4. Configure repositories

1. Click the **Config** tab.
2. Paste a GitHub repo URL (e.g. `https://github.com/microsoft/vscode`) or use `owner/repo` format.
3. Click **Add** (or press Enter). Repeat for each repo.
4. Switch to the **Dashboard** tab and click **↻ Refresh**.

Your repo list is automatically saved in your browser's `localStorage`, so it persists across sessions.

### Import / Export

- **Export JSON** — downloads your current repo list as `pr-dashboard-repos.json`.
- **Import JSON** — upload a previously exported file to restore or share a repo list. Expected format:

```json
[
  { "owner": "microsoft", "name": "vscode" },
  { "owner": "vercel", "name": "next.js" }
]
```

## 5. Deploy notes

The app is a standard Next.js application and can be deployed to any platform that supports Node.js server-side rendering:

| Platform | Notes |
|---|---|
| **Vercel** | `vercel deploy`. Set env vars in the Vercel dashboard. Update the OAuth callback URL to your Vercel URL. |
| **Azure Static Web Apps** | Use the Next.js hybrid mode. Set env vars in the portal. |
| **Render / Railway** | Point to the repo, set env vars, and deploy. |

Remember to update your GitHub OAuth App's **Authorization callback URL** to match your production domain, e.g.:

```
https://your-app.vercel.app/api/auth/callback/github
```

## Environment variables reference

| Variable | Required | Description |
|---|---|---|
| `GITHUB_CLIENT_ID` | ✅ | GitHub OAuth App client ID |
| `GITHUB_CLIENT_SECRET` | ✅ | GitHub OAuth App client secret |
| `AUTH_SECRET` | ✅ | Random string used to sign NextAuth sessions |
| `NEXTAUTH_URL` | Optional | Base URL of your app (auto-detected in most deployments) |

## Tech stack

- [Next.js 16](https://nextjs.org/) (App Router)
- [TypeScript](https://www.typescriptlang.org/)
- [NextAuth.js v5](https://authjs.dev/) — GitHub OAuth
- [Tailwind CSS v4](https://tailwindcss.com/)
- GitHub GraphQL API v4 for efficient PR fetching