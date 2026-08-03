import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');

  if (!username) {
    return NextResponse.json({ error: 'Username is required' }, { status: 400 });
  }

  try {
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'CodeTrack/1.0',
    };

    // Fetch user profile and repos in parallel
    const [userRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, { headers, next: { revalidate: 300 } }),
      fetch(`https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100&sort=updated`, { headers, next: { revalidate: 300 } }),
    ]);

    if (!userRes.ok) {
      if (userRes.status === 404) {
        return NextResponse.json({ error: 'GitHub user not found' }, { status: 404 });
      }
      return NextResponse.json({ error: `GitHub API error: ${userRes.status}` }, { status: userRes.status });
    }

    const userData = await userRes.json();
    const reposData = reposRes.ok ? await reposRes.json() : [];

    // Calculate stats from public data
    const totalStars = Array.isArray(reposData)
      ? reposData.reduce((sum: number, r: { stargazers_count: number }) => sum + (r.stargazers_count ?? 0), 0)
      : 0;

    const totalForks = Array.isArray(reposData)
      ? reposData.reduce((sum: number, r: { forks_count: number }) => sum + (r.forks_count ?? 0), 0)
      : 0;

    // Get recent events (pushes, PRs) from public events API
    const eventsRes = await fetch(
      `https://api.github.com/users/${encodeURIComponent(username)}/events/public?per_page=30`,
      { headers, next: { revalidate: 300 } }
    );

    const eventsData = eventsRes.ok ? await eventsRes.json() : [];

    const pushEvents = Array.isArray(eventsData)
      ? eventsData.filter((e: { type: string }) => e.type === 'PushEvent')
      : [];

    const prEvents = Array.isArray(eventsData)
      ? eventsData.filter((e: { type: string; payload: { action: string; pull_request?: { merged: boolean } } }) =>
          e.type === 'PullRequestEvent' && e.payload?.action === 'closed' && e.payload?.pull_request?.merged === true
        )
      : [];

    const recentCommits = pushEvents.slice(0, 5).map((e: {
      id: string;
      repo: { name: string };
      payload: { commits: Array<{ message: string }> };
      created_at: string;
    }) => ({
      id: e.id,
      repo: e.repo?.name ?? '',
      message: e.payload?.commits?.[0]?.message ?? 'Pushed commits',
      createdAt: e.created_at,
    }));

    return NextResponse.json({
      username: userData.login,
      name: userData.name,
      avatar: userData.avatar_url,
      publicRepos: userData.public_repos ?? 0,
      followers: userData.followers ?? 0,
      following: userData.following ?? 0,
      totalStars,
      totalForks,
      recentPRsMerged: prEvents.length,
      recentCommits,
      profileUrl: userData.html_url,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: `Failed to fetch GitHub data: ${message}` }, { status: 500 });
  }
}
