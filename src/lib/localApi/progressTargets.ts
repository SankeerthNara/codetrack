/**
 * Weekly/monthly "problems solved" targets the user sets for themselves on
 * the Progress tab. Stored locally, combined across LeetCode + Codeforces.
 */

const STORAGE_KEY = 'codetrack_progress_targets';

export interface ProgressTargets {
  weekly: number | null;
  monthly: number | null;
}

const DEFAULT_TARGETS: ProgressTargets = { weekly: null, monthly: null };

export function getProgressTargets(): ProgressTargets {
  if (typeof window === 'undefined') return DEFAULT_TARGETS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_TARGETS;
    const parsed = JSON.parse(raw);
    return {
      weekly: typeof parsed.weekly === 'number' ? parsed.weekly : null,
      monthly: typeof parsed.monthly === 'number' ? parsed.monthly : null,
    };
  } catch {
    return DEFAULT_TARGETS;
  }
}

export function setProgressTargets(targets: ProgressTargets) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(targets));
  } catch {
    // no-op
  }
}
