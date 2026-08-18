/**
 * Optional Cloudflare Worker URL that proxies LeetCode requests server-side
 * (see /cloudflare-worker). When set, leetcode.ts routes through it instead
 * of calling leetcode.com directly, avoiding LeetCode's bot-protection
 * blocking on-device requests.
 */

const STORAGE_KEY = 'codetrack_leetcode_proxy_url';

export function getLeetCodeProxyUrl(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setLeetCodeProxyUrl(url: string) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, url.trim());
  } catch {
    // no-op
  }
}

export function clearLeetCodeProxyUrl() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // no-op
  }
}
