/**
 * Ported from the old src/app/api/github/route.ts server route.
 * GitHub's REST API already allows cross-origin browser requests for these
 * public read endpoints, so this works even without the CapacitorHttp
 * bridge (unlike leetcode.ts).
 */

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
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
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
