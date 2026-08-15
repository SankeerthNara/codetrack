'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Code2,
  RefreshCw,
  Unlink,
  ExternalLink,
  Link2,
  Trophy,
  Flame,
  CheckCircle2,
  AlertCircle,
  Clock,
} from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { toast } from 'sonner';
import { createClient } from '@/lib/localStorage/client';
import type { PlatformConnection } from '../PlatformCardList';

interface LeetCodeCardProps {
  onConnect: () => void;
  connection: PlatformConnection | null;
  loading?: boolean;
}

interface LeetCodeStats {
  username: string;
  profile: {
    ranking: number | null;
    avatar: string | null;
    realName: string | null;
    country: string | null;
  };
  solved: {
    total: number;
    easy: number;
    medium: number;
    hard: number;
  };
  calendar: {
    streak: number;
    totalActiveDays: number;
  };
  contest: {
    attendedContestsCount: number;
    rating: number;
    globalRanking: number;
    totalParticipants: number;
    topPercentage: number;
  } | null;
  recentSubmissions: Array<{
    id: string;
    title: string;
    titleSlug: string;
    timestamp: number;
  }>;
}

function timeAgo(timestamp: number): string {
  const seconds = Math.floor(Date.now() / 1000 - timestamp);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default function LeetCodeCard({ onConnect, connection, loading }: LeetCodeCardProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);
  const [stats, setStats] = useState<LeetCodeStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);

  const fetchStats = useCallback(async (username: string) => {
    setStatsLoading(true);
    setStatsError(null);
    try {
      const res = await fetch(`/api/leetcode?username=${encodeURIComponent(username)}`);
      const data = await res.json();
      if (!res.ok) {
        setStatsError(data.error || 'Failed to load stats');
      } else {
        setStats(data);
      }
    } catch {
      setStatsError('Network error — could not reach LeetCode');
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (connection?.username) {
      fetchStats(connection.username);
    }
  }, [connection?.username, fetchStats]);

  const handleResync = async () => {
    if (!connection?.username) return;
    setIsSyncing(true);
    await fetchStats(connection.username);
    const supabase = createClient();
    await supabase
      .from('platform_connections')
      .update({ last_synced_at: new Date().toISOString() })
      .eq('platform', 'leetcode');
    toast.success('LeetCode stats refreshed');
    setIsSyncing(false);
  };

  const handleDisconnect = async () => {
    const supabase = createClient();
    await supabase.from('platform_connections').delete().eq('platform', 'leetcode');
    toast.success('LeetCode account disconnected');
    setShowDisconnectConfirm(false);
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-xl overflow-hidden flex flex-col animate-pulse">
        <div className="px-5 pt-5 pb-4 border-b border-border">
          <div className="h-11 w-11 rounded-xl bg-secondary mb-3" />
          <div className="h-4 w-32 bg-secondary rounded" />
        </div>
        <div className="px-5 py-4 flex-1 space-y-3">
          <div className="h-3 w-20 bg-secondary rounded" />
          <div className="grid grid-cols-3 gap-2">
            <div className="h-16 bg-secondary rounded-lg" />
            <div className="h-16 bg-secondary rounded-lg" />
            <div className="h-16 bg-secondary rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (!connection) {
    return (
      <div className="bg-card border border-border rounded-xl overflow-hidden hover:border-leetcode/40 transition-all duration-200 flex flex-col">
        <div className="px-5 pt-5 pb-4 border-b border-border">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-xl bg-leetcode/15 flex items-center justify-center flex-shrink-0">
                <Code2 size={22} className="text-leetcode" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-semibold text-foreground truncate">LeetCode</h3>
                <p className="text-xs text-muted-foreground truncate">Algorithm practice platform</p>
              </div>
            </div>
            <Badge variant="muted" dot className="flex-shrink-0">
              Not Connected
            </Badge>
          </div>
        </div>
        <div className="px-5 py-8 flex-1 flex flex-col items-center justify-center text-center gap-3">
          <p className="text-sm text-muted-foreground">
            Connect your LeetCode account to track your progress
          </p>
          <button
            onClick={onConnect}
            className="btn-primary flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold"
          >
            <Link2 size={14} />
            Connect LeetCode
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden hover:border-leetcode/40 transition-all duration-200 card-glow-emerald flex flex-col">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-border">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-leetcode/15 flex items-center justify-center flex-shrink-0">
              <Code2 size={22} className="text-leetcode" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-foreground truncate">LeetCode</h3>
              <p className="text-xs text-muted-foreground truncate">Algorithm practice platform</p>
            </div>
          </div>
          <Badge variant="success" dot className="flex-shrink-0">
            Connected
          </Badge>
        </div>

        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground">Logged in as</span>
          <span className="text-xs font-semibold font-mono text-foreground bg-secondary px-2 py-0.5 rounded-md">
            @{connection.username}
          </span>
          <a
            href={`https://leetcode.com/${connection.username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            <ExternalLink size={12} />
          </a>
        </div>
      </div>

      {/* Stats */}
      <div className="px-5 py-4 flex-1 space-y-4">
        {statsLoading && (
          <div className="space-y-3 animate-pulse">
            <div className="grid grid-cols-3 gap-2">
              <div className="h-16 bg-secondary rounded-lg" />
              <div className="h-16 bg-secondary rounded-lg" />
              <div className="h-16 bg-secondary rounded-lg" />
            </div>
            <div className="h-12 bg-secondary rounded-lg" />
            <div className="space-y-1.5">
              <div className="h-3 w-24 bg-secondary rounded" />
              <div className="h-8 bg-secondary rounded" />
              <div className="h-8 bg-secondary rounded" />
            </div>
          </div>
        )}

        {statsError && (
          <div className="flex items-start gap-2 bg-danger/8 border border-danger/20 rounded-lg px-3 py-2.5">
            <AlertCircle size={14} className="text-danger flex-shrink-0 mt-0.5" />
            <p className="text-xs text-danger">{statsError}</p>
          </div>
        )}

        {stats && !statsLoading && (
          <>
            {/* Problems solved by difficulty */}
            <div>
              <p className="text-2xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                Problems Solved — {stats.solved.total} total
              </p>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-success/10 border border-success/20 rounded-lg px-2 py-2.5 text-center">
                  <p className="text-lg font-bold text-success font-mono leading-none">
                    {stats.solved.easy}
                  </p>
                  <p className="text-2xs text-muted-foreground mt-1">Easy</p>
                </div>
                <div className="bg-warning/10 border border-warning/20 rounded-lg px-2 py-2.5 text-center">
                  <p className="text-lg font-bold text-warning font-mono leading-none">
                    {stats.solved.medium}
                  </p>
                  <p className="text-2xs text-muted-foreground mt-1">Medium</p>
                </div>
                <div className="bg-danger/10 border border-danger/20 rounded-lg px-2 py-2.5 text-center">
                  <p className="text-lg font-bold text-danger font-mono leading-none">
                    {stats.solved.hard}
                  </p>
                  <p className="text-2xs text-muted-foreground mt-1">Hard</p>
                </div>
              </div>
            </div>

            {/* Contest rating + streak */}
            <div className="grid grid-cols-2 gap-2">
              {stats.contest ? (
                <div className="bg-secondary/60 rounded-lg px-3 py-2.5 flex items-center gap-2">
                  <Trophy size={14} className="text-warning flex-shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-foreground font-mono leading-none">
                      {stats.contest.rating}
                    </p>
                    <p className="text-2xs text-muted-foreground mt-0.5">Contest Rating</p>
                  </div>
                </div>
              ) : (
                <div className="bg-secondary/60 rounded-lg px-3 py-2.5 flex items-center gap-2">
                  <Trophy size={14} className="text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-muted-foreground font-mono leading-none">
                      —
                    </p>
                    <p className="text-2xs text-muted-foreground mt-0.5">No contests</p>
                  </div>
                </div>
              )}
              <div className="bg-secondary/60 rounded-lg px-3 py-2.5 flex items-center gap-2">
                <Flame size={14} className="text-orange-400 flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold text-foreground font-mono leading-none">
                    {stats.calendar.streak}
                  </p>
                  <p className="text-2xs text-muted-foreground mt-0.5">Day Streak</p>
                </div>
              </div>
            </div>

            {/* Global ranking */}
            {stats.profile.ranking && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Global Ranking</span>
                <span className="font-mono font-semibold text-foreground">
                  #{stats.profile.ranking.toLocaleString()}
                </span>
              </div>
            )}

            {/* Recent accepted submissions */}
            {stats.recentSubmissions.length > 0 && (
              <div>
                <p className="text-2xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                  Recent Accepted
                </p>
                <div className="space-y-1.5">
                  {stats.recentSubmissions.slice(0, 4).map((sub) => (
                    <a
                      key={sub.id}
                      href={`https://leetcode.com/problems/${sub.titleSlug}/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-md bg-secondary/50 hover:bg-secondary transition-colors group"
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <CheckCircle2 size={11} className="text-success flex-shrink-0" />
                        <span className="text-xs text-foreground truncate group-hover:text-primary transition-colors">
                          {sub.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Clock size={10} className="text-muted-foreground" />
                        <span className="text-2xs text-muted-foreground">
                          {timeAgo(sub.timestamp)}
                        </span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Last synced */}
            {connection.last_synced_at && (
              <p className="text-2xs text-muted-foreground flex items-center gap-1">
                <Clock size={10} />
                Synced {new Date(connection.last_synced_at).toLocaleString()}
              </p>
            )}
          </>
        )}
      </div>

      {/* Actions */}
      <div className="px-5 pb-5 space-y-2">
        <button
          onClick={handleResync}
          disabled={isSyncing || statsLoading}
          className="btn-ghost w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium disabled:opacity-60"
        >
          <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
          {isSyncing ? 'Syncing...' : 'Re-sync Now'}
        </button>

        {!showDisconnectConfirm ? (
          <button
            onClick={() => setShowDisconnectConfirm(true)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-danger hover:bg-danger/10 transition-all"
          >
            <Unlink size={14} />
            Disconnect Account
          </button>
        ) : (
          <div className="border border-danger/30 rounded-lg p-3 bg-danger/5 space-y-2">
            <p className="text-xs text-danger text-center">
              Disconnect @{connection.username}? Your stats history will be preserved.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDisconnectConfirm(false)}
                className="flex-1 px-3 py-1.5 rounded-md text-xs font-medium bg-secondary text-foreground hover:bg-border transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDisconnect}
                className="flex-1 px-3 py-1.5 rounded-md text-xs font-semibold bg-danger/20 text-danger hover:bg-danger/30 transition-colors"
              >
                Disconnect
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
