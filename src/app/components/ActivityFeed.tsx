'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Badge from '@/components/ui/Badge';
import { Code2, CheckCircle2, Clock } from 'lucide-react';
import { createClient } from '@/lib/localStorage/client';

interface ActivityItem {
  id: string;
  platform: 'leetcode';
  title: string;
  meta: string;
  timestamp: string;
}

function timeAgo(unixTimestamp: number): string {
  const diff = Date.now() - unixTimestamp * 1000;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs > 1 ? 's' : ''} ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'Yesterday';
  return `${days} days ago`;
}

export default function ActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lcUsername, setLcUsername] = useState<string | null>(null);

  const fetchActivity = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data: conn } = await supabase
        .from('platform_connections')
        .select('username')
        .eq('platform', 'leetcode')
        .single();

      if (!conn?.username) {
        setLoading(false);
        return;
      }
      setLcUsername(conn.username);

      const res = await fetch(`/api/leetcode?username=${encodeURIComponent(conn.username)}`);
      if (!res.ok) {
        setLoading(false);
        return;
      }

      const data = await res.json();
      const submissions: ActivityItem[] = (data.recentSubmissions ?? []).map(
        (s: { id: string; title: string; titleSlug: string; timestamp: number }) => ({
          id: `lc-${s.id}`,
          platform: 'leetcode' as const,
          title: s.title,
          meta: `leetcode.com/problems/${s.titleSlug}`,
          timestamp: timeAgo(s.timestamp),
        })
      );
      setActivities(submissions);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActivity();
  }, [fetchActivity]);

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-xl overflow-hidden animate-pulse">
        <div className="px-5 py-4 border-b border-border">
          <div className="h-4 w-32 bg-secondary rounded mb-1" />
          <div className="h-3 w-48 bg-secondary rounded" />
        </div>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-start gap-3 px-5 py-3.5 border-b border-border">
            <div className="w-8 h-8 rounded-lg bg-secondary flex-shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3.5 bg-secondary rounded w-3/4" />
              <div className="h-3 bg-secondary rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!lcUsername) {
    return (
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Recent Activity</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Latest coding events across all platforms
            </p>
          </div>
        </div>
        <div className="px-5 py-10 text-center">
          <Code2 size={32} className="text-muted-foreground mx-auto mb-3 opacity-40" />
          <p className="text-sm text-muted-foreground">
            Connect LeetCode to see your recent activity
          </p>
        </div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Recent Activity</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Latest accepted submissions on LeetCode
            </p>
          </div>
        </div>
        <div className="px-5 py-10 text-center">
          <p className="text-sm text-muted-foreground">No recent accepted submissions found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Recent Activity</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Latest accepted submissions on LeetCode
          </p>
        </div>
        <span className="text-xs text-muted-foreground font-mono bg-secondary px-2 py-1 rounded-md">
          {activities.length} solved
        </span>
      </div>
      <ul className="divide-y divide-border">
        {activities.map((item) => (
          <li
            key={item.id}
            className="flex items-start gap-3 px-5 py-3.5 hover:bg-secondary/30 transition-colors"
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 bg-leetcode/10">
              <Code2 size={15} className="text-leetcode" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
                  <Badge variant="leetcode" className="flex-shrink-0 text-2xs">
                    LeetCode
                  </Badge>
                  <span className="text-success flex-shrink-0">
                    <CheckCircle2 size={13} />
                  </span>
                </div>
                <span className="text-xs text-muted-foreground flex-shrink-0 whitespace-nowrap flex items-center gap-1">
                  <Clock size={10} />
                  {item.timestamp}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">{item.meta}</p>
            </div>
          </li>
        ))}
      </ul>
      <div className="px-5 py-3 border-t border-border">
        <a
          href={`https://leetcode.com/${lcUsername}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
        >
          View full profile on LeetCode →
        </a>
      </div>
    </div>
  );
}
