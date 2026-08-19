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
  /** `YYYY-MM-DD` (local date) → count of problems first solved that day. */
  dailySolved: Record<string, number>;
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
  const dailySolved: Record<string, number> = {};

  if (statusRes.ok) {
    const statusData = await statusRes.json();
    if (statusData.status === 'OK') {
      // Codeforces returns submissions newest-first. To count each problem
      // on the day it was FIRST solved (not every day it was resubmitted),
      // walk oldest-to-newest and only count a problem's earliest AC.
      const submissions: Array<{
        verdict: string;
        creationTimeSeconds: number;
        problem?: { contestId: number; index: string };
      }> = statusData.result;
      const chronological = [...submissions].reverse();

      const solvedProblems = new Set<string>();
      for (const sub of chronological) {
        if (sub.verdict !== 'OK' || !sub.problem) continue;
        const key = `${sub.problem.contestId}-${sub.problem.index}`;
        if (solvedProblems.has(key)) continue;
        solvedProblems.add(key);

        const dateKey = new Date(sub.creationTimeSeconds * 1000).toISOString().slice(0, 10);
        dailySolved[dateKey] = (dailySolved[dateKey] ?? 0) + 1;
      }
      problemsSolved = solvedProblems.size;
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
    dailySolved,
  };
}
