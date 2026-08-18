# LeetCode proxy — Cloudflare Worker

Fixes LeetCode "Sync failed" errors by routing those specific requests
through a tiny server you control instead of calling leetcode.com directly
from the phone (which gets flagged by their bot protection).

## Setup (~5 minutes, no CLI needed)

1. Go to https://dash.cloudflare.com/ and sign up for a free account if you
   don't have one.
2. In the left sidebar: **Workers & Pages → Create → Create Worker**.
3. Give it any name (e.g. `codetrack-leetcode-proxy`) → **Deploy** (it
   deploys a placeholder first — that's fine).
4. Click **Edit code**. Delete everything in the editor, then paste in the
   entire contents of `leetcode-proxy.js` (the file next to this one).
5. Click **Deploy** again.
6. Copy the worker's URL from the top of the page — it looks like:
   `https://codetrack-leetcode-proxy.YOUR-SUBDOMAIN.workers.dev`

## Point the app at it

In CodeTrack: **Platform Connections → Advanced → LeetCode proxy URL** →
paste the URL from step 6 → **Save**.

From then on, every LeetCode sync goes through your worker instead of
hitting LeetCode directly. If you ever clear the field, the app falls back
to calling LeetCode directly (works most of the time, just less reliably).

## Notes

- Free tier is 100,000 requests/day — nowhere close to what personal use
  needs.
- This worker only forwards your requests to LeetCode's public GraphQL
  endpoint and returns the response — it doesn't see, log, or store
  anything, it's a passthrough.
- It handles both user stats syncing and the contest schedule (and anything
  else added later) automatically — no per-feature setup needed.
- If you deployed an earlier version of this worker before contest support
  was added, redeploy: paste the updated `leetcode-proxy.js` into the same
  "Edit code" screen and click Deploy again — same two clicks as the first
  time.
