/**
 * Ported from the old src/app/api/leetcode/route.ts server route.
 *
 * The Android build has no server, so this runs entirely in the WebView.
 * LeetCode's GraphQL endpoint blocks cross-origin browser requests, which is
 * exactly why this used to live behind a Next.js API route. On the actual
 * Android app this is a non-issue: capacitor.config.ts enables the
 * CapacitorHttp bridge, which transparently routes `fetch()` through native
 * code instead of the WebView's networking stack, sidestepping CORS
 * entirely. Running this in a plain desktop browser (e.g. `next dev`) will
 * still hit LeetCode's CORS restriction — that's expected outside the app.
 */

const LEETCODE_GRAPHQL = 'https://leetcode.com/graphql/';
const SECONDS_PER_DAY = 86400;

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

/**
 * `userCalendar.streak` is LeetCode's all-time max streak, not the current
 * one. We derive the real current streak from the daily submission calendar
 * by walking backward from today (or yesterday, if nothing's been submitted
 * yet today) until a day with no activity.
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

export interface LeetCodeApiResult {
  username: string;
  profile: {
    ranking: number | null;
    avatar: string | null;
    realName: string | null;
    country: string | null;
  };
  solved: { total: number; easy: number; medium: number; hard: number };
  calendar: { streak: number; totalActiveDays: number };
  contest: {
    attendedContestsCount: number;
    rating: number;
    globalRanking: number;
    totalParticipants: number;
    topPercentage: number;
  } | null;
  recentSubmissions: Array<{ id: string; title: string; titleSlug: string; timestamp: number }>;
}

export async function fetchLeetCodeStats(username: string): Promise<LeetCodeApiResult> {
  const response = await fetch(LEETCODE_GRAPHQL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: '*/*',
      Origin: 'https://leetcode.com',
      Referer: 'https://leetcode.com',
      'User-Agent':
        'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36',
    },
    body: JSON.stringify({
      operationName: 'combinedStats',
      query: COMBINED_QUERY,
      variables: { username, limit: 10 },
    }),
  });

  if (!response.ok) {
    if (response.status === 403) {
      throw new Error('LeetCode blocked the request (rate-limited or bot-protected) — try syncing again shortly');
    }
    throw new Error(`LeetCode API error: ${response.status}`);
  }

  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    // Cloudflare's challenge/error pages come back as HTML with a 200,
    // which would otherwise silently fail JSON parsing below.
    throw new Error('LeetCode returned an unexpected response — try syncing again shortly');
  }

  const json = await response.json();
  if (json.errors) {
    throw new Error(json.errors[0]?.message || 'GraphQL error');
  }

  const matchedUser = json.data?.matchedUser;
  if (!matchedUser) {
    throw new Error('User not found on LeetCode');
  }

  const acSubmissions = matchedUser.submitStats?.acSubmissionNum ?? [];
  const findCount = (difficulty: string) =>
    acSubmissions.find((s: { difficulty: string; count: number }) => s.difficulty === difficulty)
      ?.count ?? 0;

  return {
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
}
