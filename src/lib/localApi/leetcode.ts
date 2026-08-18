/**
 * Ported from the old src/app/api/leetcode/route.ts server route.
 *
 * The Android build has no server, so this runs entirely in the WebView.
 * LeetCode's GraphQL endpoint blocks requests it doesn't think came from a
 * real browser (Cloudflare bot protection) — a native HTTP client can still
 * get flagged even with browser-like headers, since it lacks a real
 * Chromium TLS/JS fingerprint. Two mitigations:
 *
 * 1. If the user configures a proxy URL (see proxyConfig.ts / the
 *    /cloudflare-worker folder), requests route through that instead of
 *    hitting leetcode.com directly — a real server's traffic doesn't get
 *    flagged the way on-device requests do, so this is the reliable fix.
 * 2. Without a proxy configured, this falls back to a direct call via
 *    CapacitorHttp (capacitor.config.ts enables it, bypassing CORS on
 *    native Android) — works most of the time, just not guaranteed.
 */

import { leetcodeGraphQL } from './leetcodeClient';

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
  const json = await leetcodeGraphQL('combinedStats', COMBINED_QUERY, { username, limit: 10 });

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
