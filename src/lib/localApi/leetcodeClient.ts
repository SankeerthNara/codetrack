/**
 * Shared GraphQL transport for LeetCode requests — proxy-or-direct, same
 * logic every LeetCode query needs (stats, contest schedule, anything
 * added later). See leetcode.ts for the fuller explanation of why the
 * proxy exists.
 */

import { getLeetCodeProxyUrl } from './proxyConfig';

const LEETCODE_GRAPHQL = 'https://leetcode.com/graphql/';

async function requestViaProxy(proxyUrl: string, body: string) {
  const base = proxyUrl.trim().replace(/\/+$/, '');
  const response = await fetch(base, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  });
  const json = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(json?.error || `Proxy error: ${response.status}`);
  }
  return json;
}

async function requestDirect(body: string) {
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
    body,
  });

  if (!response.ok) {
    if (response.status === 403) {
      throw new Error(
        'LeetCode blocked the request (rate-limited or bot-protected) — set up a proxy in Platform Connections → Advanced for reliable syncing'
      );
    }
    throw new Error(`LeetCode API error: ${response.status}`);
  }

  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    // Cloudflare's challenge/error pages come back as HTML with a 200,
    // which would otherwise silently fail JSON parsing below.
    throw new Error(
      'LeetCode returned an unexpected response — set up a proxy in Platform Connections → Advanced for reliable syncing'
    );
  }

  return response.json();
}

export async function leetcodeGraphQL(
  operationName: string,
  query: string,
  variables: Record<string, unknown>
) {
  const body = JSON.stringify({ operationName, query, variables });
  const proxyUrl = getLeetCodeProxyUrl();
  const json = proxyUrl ? await requestViaProxy(proxyUrl, body) : await requestDirect(body);

  if (json.errors) {
    throw new Error(json.errors[0]?.message || 'GraphQL error');
  }
  return json;
}
