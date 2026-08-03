'use client';

import React, { useEffect, useState } from 'react';
import Badge from '@/components/ui/Badge';
import { CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface PlatformStatus {
  id: string;
  name: string;
  username: string;
  status: 'connected' | 'error' | 'not_connected';
  lastSync: string;
  dot: string;
}

const PLATFORM_CONFIG = [
  { key: 'leetcode', name: 'LeetCode', dot: '#ffa116' },
  { key: 'github', name: 'GitHub', dot: '#e6edf3' },
  { key: 'codeforces', name: 'Codeforces', dot: '#1890ff' },
];

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return 'Never';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs > 1 ? 's' : ''} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

export default function PlatformStatusRow() {
  const { user } = useAuth();
  const [platforms, setPlatforms] = useState<PlatformStatus[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchConnections = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('platform_connections')
        .select('platform, username, last_synced_at')
        .eq('user_id', user.id);

      const connMap: Record<string, { username: string; last_synced_at: string | null }> = {};
      (data ?? []).forEach((row) => {
        connMap[row.platform] = { username: row.username, last_synced_at: row.last_synced_at };
      });

      const statuses: PlatformStatus[] = PLATFORM_CONFIG.map((p) => {
        const conn = connMap[p.key];
        return {
          id: `platform-${p.key}`,
          name: p.name,
          username: conn?.username ?? '',
          status: conn ? 'connected' : 'not_connected',
          lastSync: conn ? timeAgo(conn.last_synced_at) : 'Not connected',
          dot: p.dot,
        };
      });

      setPlatforms(statuses);
    };

    fetchConnections();
  }, [user]);

  if (platforms.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-3">
      {platforms.map((p) => (
        <div
          key={p.id}
          className="flex items-center gap-2.5 px-3 py-2 bg-card border border-border rounded-lg text-sm"
        >
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: p.dot }}
          />
          <span className="font-medium text-foreground">{p.name}</span>
          {p.username && (
            <span className="text-muted-foreground font-mono text-xs">@{p.username}</span>
          )}
          {p.status === 'connected' ? (
            <Badge variant="success" className="text-2xs">
              <CheckCircle2 size={10} />
              Live
            </Badge>
          ) : (
            <Badge variant="danger" className="text-2xs">
              <AlertCircle size={10} />
              {p.status === 'not_connected' ? 'Not Connected' : 'Error'}
            </Badge>
          )}
          <span className="text-muted-foreground text-xs flex items-center gap-1">
            <Clock size={10} />
            {p.lastSync}
          </span>
        </div>
      ))}
    </div>
  );
}