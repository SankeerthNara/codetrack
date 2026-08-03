'use client';

import React, { useState } from 'react';
import { Zap, RefreshCw, Link2, AlertCircle, Clock, ExternalLink, Trophy, Target } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { toast } from 'sonner';

interface CodeforcesCardProps {
  onConnect: () => void;
}

export default function CodeforcesCard({ onConnect }: CodeforcesCardProps) {
  const [isSyncing, setIsSyncing] = useState(false);

  const handleRetrySync = async () => {
    setIsSyncing(true);
    // Backend integration point: retry Codeforces API connection and stats fetch
    await new Promise((r) => setTimeout(r, 2200));
    toast.error('Codeforces sync failed — the platform API returned a rate limit error. Try again in 10 minutes.');
    setIsSyncing(false);
  };

  return (
    <div className="bg-card border rounded-xl overflow-hidden transition-all duration-200 flex flex-col card-glow-warning border-warning/30">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-border">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-codeforces/15 flex items-center justify-center">
              <Zap size={22} className="text-codeforces" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">Codeforces</h3>
              <p className="text-xs text-muted-foreground">Competitive programming</p>
            </div>
          </div>
          <Badge variant="warning" dot>Sync Error</Badge>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Logged in as</span>
          <span className="text-xs font-semibold font-mono text-foreground bg-secondary px-2 py-0.5 rounded-md">
            @arjun_cf
          </span>
          <a
            href="https://codeforces.com/profile/arjun_cf"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            <ExternalLink size={12} />
          </a>
        </div>
      </div>

      {/* Error notice */}
      <div className="mx-5 mt-4 flex items-start gap-2 bg-warning/8 border border-warning/25 rounded-lg px-3 py-2.5">
        <AlertCircle size={14} className="text-warning flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-medium text-warning">Last sync failed</p>
          <p className="text-2xs text-muted-foreground mt-0.5">
            Codeforces API rate limit hit. Stats shown are from 2 hours ago.
          </p>
        </div>
      </div>

      {/* Stats (stale) */}
      <div className="px-5 py-4 flex-1 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-2xs font-semibold uppercase tracking-widest text-muted-foreground">Cached Stats</p>
          <span className="text-2xs text-warning font-medium">Stale — 2h ago</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-muted rounded-lg px-3 py-2.5">
            <p className="text-2xs text-muted-foreground mb-0.5">Rating</p>
            <p className="text-xl font-bold cf-rank-expert font-mono tabular-nums">1,847</p>
          </div>
          <div className="bg-muted rounded-lg px-3 py-2.5">
            <p className="text-2xs text-muted-foreground mb-0.5">Max Rating</p>
            <p className="text-xl font-bold text-foreground font-mono tabular-nums">1,923</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Trophy size={12} />
              <span>Current Rank</span>
            </div>
            <span className="font-semibold cf-rank-expert">Expert</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Target size={12} />
              <span>Problems Solved</span>
            </div>
            <span className="font-mono text-foreground">612</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Zap size={12} />
              <span>Contests Entered</span>
            </div>
            <span className="font-mono text-foreground">47</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-warning">
          <Clock size={12} />
          <span>Last successful sync: 2 hours ago</span>
        </div>
      </div>

      {/* Actions */}
      <div className="px-5 pb-5 space-y-2">
        <button
          onClick={handleRetrySync}
          disabled={isSyncing}
          className="btn-primary w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold disabled:opacity-60"
        >
          <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
          {isSyncing ? 'Retrying sync...' : 'Retry Sync'}
        </button>
        <button
          onClick={onConnect}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
        >
          <Link2 size={14} />
          Re-authenticate Account
        </button>
      </div>
    </div>
  );
}