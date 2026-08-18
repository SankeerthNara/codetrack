/**
 * CodeTrack — LeetCode proxy (Cloudflare Worker)
 *
 * Why this exists: LeetCode's GraphQL API blocks requests that don't look
 * like they came from a real browser (Cloudflare bot protection). A phone
 * app calling it directly gets flagged intermittently. A real server making
 * the same request doesn't have this problem — Cloudflare Workers run on
 * Cloudflare's own edge network, so this is about as reliable as it gets.
 *
 * This is a generic passthrough: whatever GraphQL query/variables the app
 * sends, this forwards to leetcode.com/graphql/ verbatim and returns the
 * response. That means it works for user stats AND the contest schedule
 * (and anything else added later) without needing to redeploy for each new
 * query — the query logic lives in the app, not here.
 *
 * Setup (~5 minutes, no CLI/build step):
 *   1. Go to https://dash.cloudflare.com/ → sign up free if you don't have
 *      an account.
 *   2. Workers & Pages → Create → Create Worker.
 *   3. Give it any name (e.g. "codetrack-leetcode-proxy") → Deploy.
 *   4. Click "Edit code", delete the placeholder content, paste this whole
 *      file in, then click "Deploy" again.
 *   5. Copy the worker's URL (shown at the top, looks like
 *      https://codetrack-leetcode-proxy.YOUR-SUBDOMAIN.workers.dev).
 *   6. In the CodeTrack app: Platform Connections → Advanced → paste that
 *      URL into "LeetCode proxy URL" → Save.
 *
 * That's it — every LeetCode request (stats sync, contest schedule) from
 * then on goes through your own worker instead of hitting LeetCode directly
 * from the phone.
 *
 * If you deployed an earlier version of this file (before contest support),
 * just paste this updated version in and redeploy — same 2 clicks, nothing
 * else changes.
 */

const LEETCODE_GRAPHQL = 'https://leetcode.com/graphql/';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
  async fetch(request) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    if (request.method !== 'POST') {
      return json({ error: 'Only POST is supported' }, 405);
    }

    let body;
    try {
      body = await request.text();
    } catch {
      return json({ error: 'Could not read request body' }, 400);
    }

    try {
      const upstream = await fetch(LEETCODE_GRAPHQL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Referer: 'https://leetcode.com',
          Origin: 'https://leetcode.com',
        },
        body,
      });

      if (!upstream.ok) {
        return json({ error: `LeetCode responded with ${upstream.status}` }, 502);
      }

      const data = await upstream.json();
      return json(data, 200);
    } catch (err) {
      return json({ error: err instanceof Error ? err.message : 'Proxy request failed' }, 500);
    }
  },
};

function json(body, status) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}
