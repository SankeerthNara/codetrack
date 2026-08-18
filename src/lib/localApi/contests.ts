/**
 * Live contest schedule, replacing what used to be hardcoded mock data.
 *
 * - Codeforces: official public API (codeforces.com/api/contest.list),
 *   already CORS-friendly like the rest of codeforces.ts — no proxy needed.
 * - LeetCode: no officially documented REST endpoint, but the `allContests`
 *   GraphQL query is what leetcode.com's own contest page uses, and is
 *   widely relied on by community tools. Goes through the shared
 *   proxy-or-direct client since it hits the same GraphQL endpoint (and the
 *   same Cloudflare bot-protection risk) as user stats.
 */

import { leetcodeGraphQL } from './leetcodeClient';

export interface Contest {
  id: string;
  platform: 'leetcode' | 'codeforces';
  name: string;
  startTime: number; // unix ms
  durationMinutes: number;
  status: 'upcoming' | 'ongoing' | 'ended';
  url: string;
}

const ALL_CONTESTS_QUERY = `
  query allContests {
    allContests {
      title
      titleSlug
      startTime
      duration
    }
  }
`;

function computeStatus(startTime: number, durationMinutes: number): Contest['status'] {
  const now = Date.now();
  const end = startTime + durationMinutes * 60_000;
  if (now < startTime) return 'upcoming';
  if (now < end) return 'ongoing';
  return 'ended';
}

/** Only weekly/biweekly — `allContests` includes years of one-off sponsored ones too. */
function isStandardLeetCodeContest(title: string) {
  return /^(Weekly|Biweekly) Contest \d+$/i.test(title.trim());
}

export async function fetchLeetCodeContests(): Promise<Contest[]> {
  const json = await leetcodeGraphQL('allContests', ALL_CONTESTS_QUERY, {});
  const raw: Array<{ title: string; titleSlug: string; startTime: number; duration: number }> =
    json.data?.allContests ?? [];

  const now = Date.now();
  const cutoff = now - 2 * 24 * 60 * 60 * 1000; // include contests that ended in the last 2 days

  return raw
    .filter((c) => isStandardLeetCodeContest(c.title))
    .map((c) => ({
      id: `lc-${c.titleSlug}`,
      platform: 'leetcode' as const,
      name: c.title,
      startTime: c.startTime * 1000,
      durationMinutes: Math.round(c.duration / 60),
      status: computeStatus(c.startTime * 1000, Math.round(c.duration / 60)),
      url: `https://leetcode.com/contest/${c.titleSlug}/`,
    }))
    .filter((c) => c.startTime + c.durationMinutes * 60_000 > cutoff)
    .sort((a, b) => a.startTime - b.startTime);
}

export async function fetchCodeforcesContests(): Promise<Contest[]> {
  const response = await fetch('https://codeforces.com/api/contest.list?gym=false');
  if (!response.ok) {
    throw new Error(`Codeforces API error: ${response.status}`);
  }
  const json = await response.json();
  if (json.status !== 'OK') {
    throw new Error(json.comment || 'Failed to load Codeforces contests');
  }

  const raw: Array<{
    id: number;
    name: string;
    phase: string;
    startTimeSeconds?: number;
    durationSeconds: number;
  }> = json.result ?? [];

  const now = Date.now();
  const cutoff = now - 2 * 24 * 60 * 60 * 1000;

  return raw
    .filter((c) => c.startTimeSeconds != null)
    .map((c) => {
      const startTime = c.startTimeSeconds! * 1000;
      const durationMinutes = Math.round(c.durationSeconds / 60);
      return {
        id: `cf-${c.id}`,
        platform: 'codeforces' as const,
        name: c.name,
        startTime,
        durationMinutes,
        status: computeStatus(startTime, durationMinutes),
        url: `https://codeforces.com/contest/${c.id}`,
      };
    })
    .filter((c) => c.startTime + c.durationMinutes * 60_000 > cutoff)
    .sort((a, b) => a.startTime - b.startTime)
    .slice(0, 15); // Codeforces returns hundreds of historical entries; we only filtered by time above
}

export async function fetchAllContests(): Promise<{
  contests: Contest[];
  errors: { leetcode: string | null; codeforces: string | null };
}> {
  const [lcResult, cfResult] = await Promise.allSettled([
    fetchLeetCodeContests(),
    fetchCodeforcesContests(),
  ]);

  const lcContests = lcResult.status === 'fulfilled' ? lcResult.value : [];
  const cfContests = cfResult.status === 'fulfilled' ? cfResult.value : [];

  return {
    contests: [...lcContests, ...cfContests].sort((a, b) => a.startTime - b.startTime),
    errors: {
      leetcode: lcResult.status === 'rejected' ? (lcResult.reason?.message ?? 'Failed to load') : null,
      codeforces:
        cfResult.status === 'rejected' ? (cfResult.reason?.message ?? 'Failed to load') : null,
    },
  };
}
