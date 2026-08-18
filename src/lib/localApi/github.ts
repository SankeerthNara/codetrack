/**
 * Ported from the old src/app/api/github/route.ts server route.
 * GitHub's REST API already allows cross-origin browser requests for these
 * public read endpoints, so this works even without the CapacitorHttp
 * bridge (unlike leetcode.ts).
 *
 * Unauthenticated requests are capped at 60/hour per IP, shared across
 * everything on that network — a single sync burns 3 of those (profile,
 * repos, events; the search endpoint has its own separate quota), so that
 * ceiling is easy to hit. If the user has already set up a GitHub token for
 * the Notifications tab (see githubToken.ts), reuse it here too — it bumps
 * the limit to 5,000/hour and costs them nothing extra to set up.
 */

import { getGitHubToken } from './githubToken';

export interface GitHubApiResult {
  username: string;
  name: string | null;
  avatar: string | null;
  publicRepos: number;
  followers: number;
  following: number;
  totalStars: number;
  totalForks: number;
  recentPRsMerged: number;
  recentCommits: Array<{ id: string; repo: string; message: string; createdAt: string }>;
  profileUrl: string | null;
}

export async function fetchGitHubStats(username: string): Promise<GitHubApiResult> {
  const token = getGitHubToken();
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
    ...(token ? { Authorization: `token ${token}` } : {}),
  };

  const [userRes, reposRes, mergedPRsRes] = await Promise.all([
    fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, { headers }),
    fetch(
      `https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100&sort=updated`,
      { headers }
    ),
    fetch(
      `https://api.github.com/search/issues?q=author:${encodeURIComponent(username)}+type:pr+is:merged&per_page=1`,
      { headers }
    ),
  ]);

  if (!userRes.ok) {
    if (userRes.status === 404) {
      throw new Error('GitHub user not found');
    }
    if (userRes.status === 401) {
      throw new Error('GitHub token is invalid — update it in Notifications, or remove it to sync without auth');
    }
    if (userRes.status === 403) {
      throw new Error(
        token
          ? 'GitHub rate limit hit — try syncing again shortly'
          : 'GitHub rate limit hit — set up a token in Notifications to raise the limit'
      );
    }
    throw new Error(`GitHub API error: ${userRes.status}`);
  }

  const userData = await userRes.json();
  const reposData = reposRes.ok ? await reposRes.json() : [];
  const mergedPRsData = mergedPRsRes.ok ? await mergedPRsRes.json() : { total_count: 0 };

  const totalStars = Array.isArray(reposData)
    ? reposData.reduce(
        (sum: number, r: { stargazers_count: number }) => sum + (r.stargazers_count ?? 0),
        0
      )
    : 0;

  const totalForks = Array.isArray(reposData)
    ? reposData.reduce((sum: number, r: { forks_count: number }) => sum + (r.forks_count ?? 0), 0)
    : 0;

  const totalMergedPRs = mergedPRsData?.total_count ?? 0;

  const eventsRes = await fetch(
    `https://api.github.com/users/${encodeURIComponent(username)}/events/public?per_page=30`,
    { headers }
  );
  const eventsData = eventsRes.ok ? await eventsRes.json() : [];
  const pushEvents = Array.isArray(eventsData)
    ? eventsData.filter((e: { type: string }) => e.type === 'PushEvent')
    : [];

  const recentCommits = pushEvents
    .slice(0, 5)
    .map(
      (e: {
        id: string;
        repo: { name: string };
        payload: { commits: Array<{ message: string }> };
        created_at: string;
      }) => ({
        id: e.id,
        repo: e.repo?.name ?? '',
        message: e.payload?.commits?.[0]?.message ?? 'Pushed commits',
        createdAt: e.created_at,
      })
    );

  return {
    username: userData.login,
    name: userData.name ?? null,
    avatar: userData.avatar_url ?? null,
    publicRepos: userData.public_repos ?? 0,
    followers: userData.followers ?? 0,
    following: userData.following ?? 0,
    totalStars,
    totalForks,
    recentPRsMerged: totalMergedPRs,
    recentCommits,
    profileUrl: userData.html_url ?? null,
  };
}
