/**
 * Combines LeetCode + Codeforces daily activity into the day/week/month
 * views on the Progress tab.
 *
 * Accuracy note, worth being upfront about: Codeforces' numbers are exact
 * (their API gives full submission history, so "first accepted submission
 * per problem" is precisely countable). LeetCode's public calendar only
 * gives submission counts per day, not distinct accepted-problem counts —
 * there's no public endpoint for that. So the LeetCode side of this is a
 * reasonable proxy ("activity"), not a guaranteed exact "problems solved"
 * count. This mirrors what leetcode.com's own profile heatmap shows.
 */

import { createClient } from '@/lib/localStorage/client';
import { fetchLeetCodeStats } from './leetcode';
import { fetchCodeforcesStats } from './codeforces';
import { getCachedStats, setCachedStats } from './statsCache';

export interface DailyEntry {
  date: string; // YYYY-MM-DD
  leetcode: number;
  codeforces: number;
  total: number;
}

export interface ProgressData {
  daily: DailyEntry[];
  connected: { leetcode: boolean; codeforces: boolean };
}

const HISTORY_DAYS = 180;

function todayKey(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() - offsetDays);
  return d.toISOString().slice(0, 10);
}

export async function fetchProgressData(): Promise<ProgressData> {
  const supabase = createClient();
  const { data } = await supabase.from('platform_connections').select('platform, username');
  const conns = (data ?? []) as Array<{ platform: string; username: string }>;
  const lcUsername = conns.find((c) => c.platform === 'leetcode')?.username ?? null;
  const cfUsername = conns.find((c) => c.platform === 'codeforces')?.username ?? null;

  let lcDaily: Record<string, number> = {};
  let cfDaily: Record<string, number> = {};

  if (lcUsername) {
    try {
      const stats = await fetchLeetCodeStats(lcUsername);
      lcDaily = stats.dailySubmissions;
      setCachedStats('progress-leetcode', lcUsername, lcDaily);
    } catch {
      const cached = getCachedStats<Record<string, number>>('progress-leetcode', lcUsername);
      if (cached) lcDaily = cached.data;
    }
  }

  if (cfUsername) {
    try {
      const stats = await fetchCodeforcesStats(cfUsername);
      cfDaily = stats.dailySolved;
      setCachedStats('progress-codeforces', cfUsername, cfDaily);
    } catch {
      const cached = getCachedStats<Record<string, number>>('progress-codeforces', cfUsername);
      if (cached) cfDaily = cached.data;
    }
  }

  const daily: DailyEntry[] = [];
  for (let i = HISTORY_DAYS - 1; i >= 0; i--) {
    const date = todayKey(i);
    const leetcode = lcDaily[date] ?? 0;
    const codeforces = cfDaily[date] ?? 0;
    daily.push({ date, leetcode, codeforces, total: leetcode + codeforces });
  }

  return {
    daily,
    connected: { leetcode: !!lcUsername, codeforces: !!cfUsername },
  };
}

function isoWeekStart(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const day = d.getDay() || 7; // Sunday -> 7
  if (day !== 1) d.setDate(d.getDate() - (day - 1)); // back up to Monday
  return d.toISOString().slice(0, 10);
}

export interface Bucket {
  key: string; // date, week-start date, or YYYY-MM
  label: string;
  leetcode: number;
  codeforces: number;
  total: number;
}

export function bucketByDay(daily: DailyEntry[]): Bucket[] {
  return daily.map((d) => ({
    key: d.date,
    label: new Date(d.date + 'T00:00:00').toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    }),
    leetcode: d.leetcode,
    codeforces: d.codeforces,
    total: d.total,
  }));
}

export function bucketByWeek(daily: DailyEntry[]): Bucket[] {
  const map = new Map<string, Bucket>();
  for (const d of daily) {
    const weekStart = isoWeekStart(d.date);
    const existing = map.get(weekStart);
    if (existing) {
      existing.leetcode += d.leetcode;
      existing.codeforces += d.codeforces;
      existing.total += d.total;
    } else {
      map.set(weekStart, {
        key: weekStart,
        label: new Date(weekStart + 'T00:00:00').toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
        }),
        leetcode: d.leetcode,
        codeforces: d.codeforces,
        total: d.total,
      });
    }
  }
  return Array.from(map.values()).sort((a, b) => a.key.localeCompare(b.key));
}

export function bucketByMonth(daily: DailyEntry[]): Bucket[] {
  const map = new Map<string, Bucket>();
  for (const d of daily) {
    const monthKey = d.date.slice(0, 7); // YYYY-MM
    const existing = map.get(monthKey);
    if (existing) {
      existing.leetcode += d.leetcode;
      existing.codeforces += d.codeforces;
      existing.total += d.total;
    } else {
      map.set(monthKey, {
        key: monthKey,
        label: new Date(monthKey + '-01T00:00:00').toLocaleDateString(undefined, {
          month: 'short',
          year: 'numeric',
        }),
        leetcode: d.leetcode,
        codeforces: d.codeforces,
        total: d.total,
      });
    }
  }
  return Array.from(map.values()).sort((a, b) => a.key.localeCompare(b.key));
}

/** Sum of `total` for the current (in-progress) week, for target progress. */
export function currentWeekTotal(daily: DailyEntry[]): number {
  const thisWeekStart = isoWeekStart(todayKey());
  return daily
    .filter((d) => isoWeekStart(d.date) === thisWeekStart)
    .reduce((sum, d) => sum + d.total, 0);
}

/** Sum of `total` for the current (in-progress) month, for target progress. */
export function currentMonthTotal(daily: DailyEntry[]): number {
  const thisMonth = todayKey().slice(0, 7);
  return daily.filter((d) => d.date.slice(0, 7) === thisMonth).reduce((sum, d) => sum + d.total, 0);
}
