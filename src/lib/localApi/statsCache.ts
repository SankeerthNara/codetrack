/**
 * When a live sync fails, showing an error isn't the only option — if we
 * already have a last-known-good result for that platform, showing that
 * (with an "as of X ago" note) instead is almost always more useful than a
 * bare failure message. This is a thin localStorage cache keyed by
 * `platform:username` for exactly that purpose.
 */

const PREFIX = 'codetrack_stats_cache_';

export interface CachedStats<T> {
  data: T;
  cachedAt: string;
}

function keyFor(platform: string, username: string) {
  return `${PREFIX}${platform}:${username.toLowerCase()}`;
}

export function getCachedStats<T>(platform: string, username: string): CachedStats<T> | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(keyFor(platform, username));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || !('data' in parsed) || !('cachedAt' in parsed)) {
      return null;
    }
    return parsed as CachedStats<T>;
  } catch {
    return null;
  }
}

export function setCachedStats<T>(platform: string, username: string, data: T) {
  if (typeof window === 'undefined') return;
  try {
    const entry: CachedStats<T> = { data, cachedAt: new Date().toISOString() };
    window.localStorage.setItem(keyFor(platform, username), JSON.stringify(entry));
  } catch {
    // Storage unavailable — the fallback just won't have anything to serve.
  }
}
