import { NextRequest, NextResponse } from 'next/server';

const LEETCODE_GRAPHQL = 'https://leetcode.com/graphql/';
const SECONDS_PER_DAY = 86400;

/**
 * LeetCode's `userCalendar.streak` field is NOT the current consecutive-day
 * streak — it's the all-time max streak (this is what the "Max streak" label
 * on leetcode.com's own calendar widget refers to). Trusting it directly and
 * labeling it "days consecutive" is misleading: someone could see "11" days
 * after their actual current streak was broken.
 *
 * `submissionCalendar` is a JSON string of `{ unixDayStart: submissionCount }`
 * for every day with at least one accepted-or-attempted submission. We derive
 * the real current streak by walking backward, day by day, from today (or
 * yesterday, if nothing has been submitted yet today — a streak isn't broken
 * until the day fully elapses) until we hit a day with no activity.
 */
function computeCurrentStreak(submissionCalendar: string | null | undefined): number {
  if (!submissionCalendar) return 0;

  let dayCounts: Record<string, number>;
  try {
    dayCounts = JSON.parse(submissionCalendar);
  } catch {
    return 0;
  }

  const activeDays = new Set(
    Object.entries(dayCounts)
      .filter(([, count]) => count > 0)
      .map(([timestamp]) => Math.floor(Number(timestamp) / SECONDS_PER_DAY))
  );
  if (activeDays.size === 0) return 0;

  const todayIndex = Math.floor(Date.now() / 1000 / SECONDS_PER_DAY);
  let cursor = activeDays.has(todayIndex) ? todayIndex : todayIndex - 1;
  if (!activeDays.has(cursor)) return 0;

  let streak = 0;
  while (activeDays.has(cursor)) {
    streak += 1;
    cursor -= 1;
  }
  return streak;
}

const COMBINED_QUERY = `
  query combinedStats($username: String!, $limit: Int!) {
    matchedUser(username: $username) {
      username
      profile {
        ranking
        userAvatar
        realName
        countryName
      }
      submitStats: submitStatsGlobal {
        acSubmissionNum {
          difficulty
          count
          submissions
        }
      }
      userCalendar {
        streak
        totalActiveDays
        submissionCalendar
      }
    }
    userContestRanking(username: $username) {
      attendedContestsCount
      rating
      globalRanking
      totalParticipants
      topPercentage
    }
    recentAcSubmissionList(username: $username, limit: $limit) {
      id
      title
      titleSlug
      timestamp
    }
  }
`;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');

  if (!username) {
    return NextResponse.json({ error: 'Username is required' }, { status: 400 });
  }

  try {
    const response = await fetch(LEETCODE_GRAPHQL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Referer: 'https://leetcode.com',
        'User-Agent': 'Mozilla/5.0 (compatible; ProgressTracker/1.0)',
      },
      body: JSON.stringify({
        operationName: 'combinedStats',
        query: COMBINED_QUERY,
        variables: { username, limit: 10 },
      }),
      next: { revalidate: 300 }, // cache 5 minutes
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `LeetCode API error: ${response.status}` },
        { status: response.status }
      );
    }

    const json = await response.json();

    if (json.errors) {
      return NextResponse.json(
        { error: json.errors[0]?.message || 'GraphQL error' },
        { status: 400 }
      );
    }

    const matchedUser = json.data?.matchedUser;
    if (!matchedUser) {
      return NextResponse.json({ error: 'User not found on LeetCode' }, { status: 404 });
    }

    const acSubmissions = matchedUser.submitStats?.acSubmissionNum ?? [];
    const findCount = (difficulty: string) =>
      acSubmissions.find((s: { difficulty: string; count: number }) => s.difficulty === difficulty)
        ?.count ?? 0;

    const result = {
      username: matchedUser.username,
      profile: {
        ranking: matchedUser.profile?.ranking ?? null,
        avatar: matchedUser.profile?.userAvatar ?? null,
        realName: matchedUser.profile?.realName ?? null,
        country: matchedUser.profile?.countryName ?? null,
      },
      solved: {
        total: findCount('All'),
        easy: findCount('Easy'),
        medium: findCount('Medium'),
        hard: findCount('Hard'),
      },
      calendar: {
        streak: computeCurrentStreak(matchedUser.userCalendar?.submissionCalendar),
        totalActiveDays: matchedUser.userCalendar?.totalActiveDays ?? 0,
      },
      contest: json.data?.userContestRanking
        ? {
            attendedContestsCount: json.data.userContestRanking.attendedContestsCount,
            rating: Math.round(json.data.userContestRanking.rating),
            globalRanking: json.data.userContestRanking.globalRanking,
            totalParticipants: json.data.userContestRanking.totalParticipants,
            topPercentage: json.data.userContestRanking.topPercentage,
          }
        : null,
      recentSubmissions: (json.data?.recentAcSubmissionList ?? []).map(
        (s: { id: string; title: string; titleSlug: string; timestamp: string }) => ({
          id: s.id,
          title: s.title,
          titleSlug: s.titleSlug,
          timestamp: Number(s.timestamp),
        })
      ),
    };

    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to fetch LeetCode data: ${message}` },
      { status: 500 }
    );
  }
}
