'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { RefreshCw, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/localStorage/client';
import { recordSyncResult } from '@/lib/localApi/syncStatus';

interface StoredConnection {
  platform: 'leetcode' | 'github' | 'codeforces';
  username: string;
}

export default function DashboardHeader() {
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSyncNow = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      const supabase = createClient();
      const { data: connections, error } = await supabase
        .from('platform_connections')
        .select('platform, username');

      const connected = (connections ?? []) as StoredConnection[];
      if (error || connected.length === 0) {
        toast.error('No connected platforms to sync — connect one first');
        return;
      }

      const endpoint: Record<StoredConnection['platform'], string> = {
        leetcode: '/api/leetcode?username=',
        github: '/api/github?username=',
        codeforces: '/api/codeforces?handle=',
      };

      const results = await Promise.allSettled(
        connected.map(async (conn) => {
          const res = await fetch(`${endpoint[conn.platform]}${encodeURIComponent(conn.username)}`);
          const body = await res.json().catch(() => null);
          if (res.ok) {
            await recordSyncResult(conn.platform, { ok: true });
            return true;
          }
          await recordSyncResult(conn.platform, { ok: false, error: body?.error || 'Sync failed' });
          return false;
        })
      );
      const failures = results.filter((r) => r.status === 'rejected' || r.value === false).length;

      if (failures === connected.length) {
        toast.error('Sync failed — please try again');
      } else if (failures > 0) {
        toast.success(`Synced ${connected.length - failures}/${connected.length} platforms`);
      } else {
        toast.success('All platforms synced');
      }

      window.location.reload();
    } catch {
      toast.error('Sync failed — please try again');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">Good morning 👋</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Here&apos;s your coding progress across all connected platforms —
          <span className="text-primary font-medium"> connect your platforms to see live data</span>
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Link
          href="/platform-connections"
          className="btn-ghost inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium"
        >
          <ExternalLink size={14} />
          Manage Platforms
        </Link>
        <button
          onClick={handleSyncNow}
          disabled={isSyncing}
          className="btn-primary inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold disabled:opacity-60"
        >
          <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
          {isSyncing ? 'Syncing…' : 'Sync Now'}
        </button>
      </div>
    </div>
  );
}
