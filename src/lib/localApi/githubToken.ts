/**
 * GitHub's notifications inbox (https://github.com/notifications) is private
 * per-account — unlike the public profile stats elsewhere in this app, there's
 * no way to read it from just a username. It needs a Personal Access Token
 * with the `notifications` scope (classic token) or `notifications: read`
 * (fine-grained token), sent as an Authorization header on every request.
 *
 * The token is stored client-side only (localStorage) and only ever sent
 * directly from this device to api.github.com — it never passes through any
 * server this app controls.
 */

const STORAGE_KEY = 'codetrack_github_notifications_token';

export function getGitHubToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setGitHubToken(token: string) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, token.trim());
  } catch {
    // Storage unavailable — nothing more we can do client-side.
  }
}

export function clearGitHubToken() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // no-op
  }
}
