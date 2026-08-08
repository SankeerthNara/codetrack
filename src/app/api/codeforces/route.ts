import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const handle = searchParams.get('handle');

  if (!handle) {
    return NextResponse.json({ error: 'Handle is required' }, { status: 400 });
  }

  try {
    // Fetch user info, rating history, and submissions in parallel
    const [infoRes, ratingRes, statusRes] = await Promise.all([
      fetch(`https://codeforces.com/api/user.info?handles=${encodeURIComponent(handle)}`, {
        next: { revalidate: 300 },
      }),
      fetch(`https://codeforces.com/api/user.rating?handle=${encodeURIComponent(handle)}`, {
        next: { revalidate: 300 },
      }),
      fetch(
        `https://codeforces.com/api/user.status?handle=${encodeURIComponent(handle)}&from=1&count=10000`,
        {
          next: { revalidate: 300 },
        }
      ),
    ]);

    if (!infoRes.ok) {
      return NextResponse.json(
        { error: `Codeforces API error: ${infoRes.status}` },
        { status: infoRes.status }
      );
    }

    const infoData = await infoRes.json();
    if (infoData.status !== 'OK') {
      return NextResponse.json({ error: infoData.comment || 'User not found' }, { status: 404 });
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

    // Count unique problems solved (verdict OK)
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

    // Take last 10 contests
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

    const currentRating = userInfo?.rating ?? null;
    const maxRating = userInfo?.maxRating ?? null;
    const rank = userInfo?.rank ?? null;
    const maxRank = userInfo?.maxRank ?? null;

    return NextResponse.json({
      handle: userInfo?.handle,
      rating: currentRating,
      maxRating,
      rank,
      maxRank,
      problemsSolved,
      ratingHistory: last10,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to fetch Codeforces data: ${message}` },
      { status: 500 }
    );
  }
}
