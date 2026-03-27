"use client";

import { useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { RepoConfig } from "@/lib/types";
import { Dashboard } from "@/components/Dashboard";
import { ConfigPanel } from "@/components/ConfigPanel";

type Tab = "dashboard" | "config";

export default function HomePage() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [repos, setRepos] = useState<RepoConfig[]>([]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500 animate-pulse">Loading…</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white border border-gray-200 rounded-xl p-10 shadow-sm text-center max-w-sm w-full mx-4">
          <div className="text-4xl mb-4">🔀</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">PR Dashboard</h1>
          <p className="text-gray-500 text-sm mb-6">
            Sign in with GitHub to view open pull requests across your repositories.
          </p>
          <button
            onClick={() => signIn("github")}
            className="w-full bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
            </svg>
            Sign in with GitHub
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🔀</span>
            <h1 className="font-bold text-gray-900">PR Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            {session.user?.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={session.user.image}
                alt={session.user.name ?? "User"}
                className="w-7 h-7 rounded-full"
              />
            )}
            <span className="text-sm text-gray-600 hidden sm:block">
              {session.user?.name ?? session.user?.email}
            </span>
            <button
              onClick={() => signOut()}
              className="text-sm text-gray-500 hover:text-gray-800 border border-gray-200 rounded-md px-3 py-1 hover:bg-gray-50 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-6xl mx-auto px-4 mt-6">
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit mb-6">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "dashboard"
                ? "bg-white shadow-sm text-gray-900"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab("config")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "config"
                ? "bg-white shadow-sm text-gray-900"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Config {repos.length > 0 && `(${repos.length})`}
          </button>
        </div>

        {/* Content */}
        <div className="pb-12">
          {activeTab === "config" ? (
            <div className="max-w-xl">
              <ConfigPanel onReposChange={setRepos} />
            </div>
          ) : (
            <Dashboard repos={repos} />
          )}
        </div>
      </div>
    </div>
  );
}
