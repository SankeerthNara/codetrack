import { NextRequest, NextResponse } from 'next/server';

const LEETCODE_GRAPHQL = 'https://leetcode.com/graphql/';

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
        'Referer': 'https://leetcode.com',
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
      return NextResponse.json(
        { error: 'User not found on LeetCode' },
        { status: 404 }
      );
    }

    const acSubmissions = matchedUser.submitStats?.acSubmissionNum ?? [];
    const findCount = (difficulty: string) =>
      acSubmissions.find((s: { difficulty: string; count: number }) => s.difficulty === difficulty)?.count ?? 0;

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
        streak: matchedUser.userCalendar?.streak ?? 0,
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
    return NextResponse.json({ error: `Failed to fetch LeetCode data: ${message}` }, { status: 500 });
  }
}
