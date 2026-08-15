import { fetchLeetCodeStats } from './leetcode';
import { fetchGitHubStats } from './github';
import { fetchCodeforcesStats } from './codeforces';

export interface LocalApiResponse {
  status: number;
  body: unknown;
}

/**
 * Mirrors the old Next.js API routes (`/api/leetcode`, `/api/github`,
 * `/api/codeforces`) entirely client-side. Returns null if the path isn't
 * one of ours, so the fetch interceptor can fall through to a real network
 * request for everything else.
 */
export async function handleLocalApiRequest(pathname: string, search: string): Promise<LocalApiResponse | null> {
  const params = new URLSearchParams(search);

  if (pathname === '/api/leetcode') {
    const username = params.get('username');
    if (!username) return { status: 400, body: { error: 'Username is required' } };
    try {
      const data = await fetchLeetCodeStats(username);
      return { status: 200, body: data };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch LeetCode data';
      return { status: 500, body: { error: message } };
    }
  }

  if (pathname === '/api/github') {
    const username = params.get('username');
    if (!username) return { status: 400, body: { error: 'Username is required' } };
    try {
      const data = await fetchGitHubStats(username);
      return { status: 200, body: data };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch GitHub data';
      return { status: 500, body: { error: message } };
    }
  }

  if (pathname === '/api/codeforces') {
    const handle = params.get('handle');
    if (!handle) return { status: 400, body: { error: 'Handle is required' } };
    try {
      const data = await fetchCodeforcesStats(handle);
      return { status: 200, body: data };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch Codeforces data';
      return { status: 500, body: { error: message } };
    }
  }

  return null;
}
