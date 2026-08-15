import { createClient } from '@/lib/localStorage/client';

export type PlatformKey = 'leetcode' | 'github' | 'codeforces';

/**
 * Every widget that fetches live stats for a platform calls this after each
 * attempt, success or failure. Without it, "connected" (a username is saved)
 * and "syncing successfully" get conflated — a platform can show as "Live"
 * in PlatformStatusRow while every stat card underneath is blank because the
 * actual data fetch keeps failing silently.
 */
export async function recordSyncResult(
  platform: PlatformKey,
  result: { ok: true } | { ok: false; error: string }
) {
  const supabase = createClient();
  await supabase
    .from('platform_connections')
    .update({
      last_synced_at: new Date().toISOString(),
      last_sync_status: result.ok ? 'ok' : 'error',
      last_sync_error: result.ok ? null : result.error,
    })
    .eq('platform', platform);
}
