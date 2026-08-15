'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Zap, RefreshCw, Unlink, ExternalLink, Link2, Target } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { toast } from 'sonner';
import { createClient } from '@/lib/localStorage/client';
import type { PlatformConnection } from '../PlatformCardList';

interface CodeforcesCardProps {
  onConnect: () => void;
  connection: PlatformConnection | null;
  loading?: boolean;
}

interface CodeforcesStats {
  handle: string | null;
  rating: number | null;
  maxRating: number | null;
  rank: string | null;
  maxRank: string | null;
  problemsSolved: number;
}

export default function CodeforcesCard({ onConnect, connection, loading }: CodeforcesCardProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);
  const [stats, setStats] = useState<CodeforcesStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);

  const fetchStats = useCallback(async (handle: string) => {
    setStatsLoading(true);
    setStatsError(null);
    try {
      const res = await fetch(`/api/codeforces?handle=${encodeURIComponent(handle)}`);
      const data = await res.json();
      if (!res.ok) {
        setStatsError(data.error || 'Failed to load stats');
      } else {
        setStats(data);
      }
    } catch {
      setStatsError('Network error — could not reach Codeforces');
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
      .eq('platform', 'codeforces');
    toast.success('Codeforces stats refreshed');
    setIsSyncing(false);
  };

  const handleDisconnect = async () => {
    const supabase = createClient();
    await supabase.from('platform_connections').delete().eq('platform', 'codeforces');
    toast.success('Codeforces account disconnected');
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
          <div className="grid grid-cols-2 gap-2">
            <div className="h-16 bg-secondary rounded-lg" />
            <div className="h-16 bg-secondary rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (!connection) {
    return (
      <div className="bg-card border border-border rounded-xl overflow-hidden hover:border-codeforces/40 transition-all duration-200 flex flex-col">
        <div className="px-5 pt-5 pb-4 border-b border-border">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-xl bg-codeforces/15 flex items-center justify-center flex-shrink-0">
                <Zap size={22} className="text-codeforces" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-semibold text-foreground truncate">Codeforces</h3>
                <p className="text-xs text-muted-foreground truncate">Competitive programming</p>
              </div>
            </div>
            <Badge variant="muted" dot className="flex-shrink-0">
              Not Connected
            </Badge>
          </div>
        </div>
        <div className="px-5 py-8 flex-1 flex flex-col items-center justify-center text-center gap-3">
          <p className="text-sm text-muted-foreground">
            Connect your Codeforces account to track your rating
          </p>
          <button
            onClick={onConnect}
            className="btn-primary flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold"
          >
            <Link2 size={14} />
            Connect Codeforces
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden hover:border-codeforces/40 transition-all duration-200 card-glow-emerald flex flex-col">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-border">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-codeforces/15 flex items-center justify-center flex-shrink-0">
              <Zap size={22} className="text-codeforces" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-foreground truncate">Codeforces</h3>
              <p className="text-xs text-muted-foreground truncate">Competitive programming</p>
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
            href={`https://codeforces.com/profile/${connection.username}`}
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
        {statsLoading ? (
          <div className="animate-pulse space-y-3">
            <div className="h-3 w-24 bg-secondary rounded" />
            <div className="grid grid-cols-2 gap-2">
              <div className="h-16 bg-secondary rounded-lg" />
              <div className="h-16 bg-secondary rounded-lg" />
            </div>
          </div>
        ) : statsError ? (
          <div className="flex flex-col items-center text-center gap-2 py-2">
            <p className="text-xs text-danger">{statsError}</p>
            <button onClick={handleResync} className="text-xs text-primary hover:underline">
              Try again
            </button>
          </div>
        ) : stats ? (
          <>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-secondary/50 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-foreground tabular-nums">
                  {stats.rating ?? '—'}
                </p>
                <p className="text-2xs text-muted-foreground mt-0.5">Rating</p>
              </div>
              <div className="bg-secondary/50 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-foreground tabular-nums">
                  {stats.problemsSolved}
                </p>
                <p className="text-2xs text-muted-foreground mt-0.5">Solved</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Zap size={12} className="text-codeforces" />
                Rank
              </span>
              <span className="font-medium text-foreground capitalize">
                {stats.rank ?? 'Unrated'}
              </span>
            </div>
            {stats.maxRating != null && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Target size={12} className="text-codeforces" />
                  Max Rating
                </span>
                <span className="font-medium text-foreground">
                  {stats.maxRating}
                  {stats.maxRank ? ` · ${stats.maxRank}` : ''}
                </span>
              </div>
            )}
          </>
        ) : null}
      </div>

      {/* Actions */}
      <div className="px-5 pb-5 space-y-2">
        <button
          onClick={handleResync}
          disabled={isSyncing}
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
