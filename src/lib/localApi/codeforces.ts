/**
 * Ported from the old src/app/api/codeforces/route.ts server route.
 * Codeforces' public API already allows cross-origin browser requests, so
 * this works even without the CapacitorHttp bridge.
 */

export interface CodeforcesApiResult {
  handle: string | null;
  rating: number | null;
  maxRating: number | null;
  rank: string | null;
  maxRank: string | null;
  problemsSolved: number;
  ratingHistory: Array<{
    contestId: number;
    contestName: string;
    date: string;
    rating: number;
    oldRating: number;
  }>;
}

export async function fetchCodeforcesStats(handle: string): Promise<CodeforcesApiResult> {
  const [infoRes, ratingRes, statusRes] = await Promise.all([
    fetch(`https://codeforces.com/api/user.info?handles=${encodeURIComponent(handle)}`),
    fetch(`https://codeforces.com/api/user.rating?handle=${encodeURIComponent(handle)}`),
    fetch(
      `https://codeforces.com/api/user.status?handle=${encodeURIComponent(handle)}&from=1&count=10000`
    ),
  ]);

  if (!infoRes.ok) {
    throw new Error(`Codeforces API error: ${infoRes.status}`);
  }

  const infoData = await infoRes.json();
  if (infoData.status !== 'OK') {
    throw new Error(infoData.comment || 'User not found');
  }

  const userInfo = infoData.result?.[0];
  const ratingData = ratingRes.ok ? await ratingRes.json() : { status: 'FAILED', result: [] };
  const ratingHistory: Array<{
    contestId: number;
    contestName: string;
    ratingUpdateTimeSeconds: number;
    newRating: number;
    oldRating: number;
  }> = ratingData.status === 'OK' ? ratingData.result : [];

  let problemsSolved = 0;
  if (statusRes.ok) {
    const statusData = await statusRes.json();
    if (statusData.status === 'OK') {
      const solvedSet = new Set<string>();
      for (const sub of statusData.result) {
        if (sub.verdict === 'OK' && sub.problem) {
          solvedSet.add(`${sub.problem.contestId}-${sub.problem.index}`);
        }
      }
      problemsSolved = solvedSet.size;
    }
  }

  const last10 = ratingHistory.slice(-10).map((entry) => ({
    contestId: entry.contestId,
    contestName: entry.contestName,
    date: new Date(entry.ratingUpdateTimeSeconds * 1000).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
    rating: entry.newRating,
    oldRating: entry.oldRating,
  }));

  return {
    handle: userInfo?.handle ?? null,
    rating: userInfo?.rating ?? null,
    maxRating: userInfo?.maxRating ?? null,
    rank: userInfo?.rank ?? null,
    maxRank: userInfo?.maxRank ?? null,
    problemsSolved,
    ratingHistory: last10,
  };
}
