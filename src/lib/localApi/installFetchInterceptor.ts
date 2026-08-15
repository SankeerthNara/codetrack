'use client';

import { handleLocalApiRequest } from './router';

declare global {
  interface Window {
    __codetrackFetchPatched__?: boolean;
  }
}

/**
 * The Android build has no server behind it (static export), so the old
 * `/api/leetcode`, `/api/github`, `/api/codeforces` routes don't exist
 * anymore. Every component in the app still calls `fetch('/api/leetcode?...')`
 * etc. exactly as before — rather than touching every call site, this patches
 * the global `fetch` once so those specific paths are served locally by
 * src/lib/localApi/router.ts, and everything else passes through to the
 * real network unchanged.
 */
function installFetchInterceptor() {
  if (typeof window === 'undefined' || window.__codetrackFetchPatched__) return;
  window.__codetrackFetchPatched__ = true;

  const originalFetch = window.fetch.bind(window);

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const rawUrl =
      typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;

    let pathname: string | null = null;
    let search = '';
    try {
      const parsed = new URL(rawUrl, window.location.origin);
      pathname = parsed.pathname;
      search = parsed.search;
    } catch {
      // Not a parseable URL — let the real fetch handle (and likely reject) it.
    }

    if (pathname) {
      const result = await handleLocalApiRequest(pathname, search);
      if (result) {
        return new Response(JSON.stringify(result.body), {
          status: result.status,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    return originalFetch(input, init);
  };
}

installFetchInterceptor();
