'use client';

import React, { useState } from 'react';
import { Code2, RefreshCw, Unlink, TrendingUp, Clock, ExternalLink } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { toast } from 'sonner';

interface LeetCodeCardProps {
  onConnect: () => void;
}

export default function LeetCodeCard({ onConnect }: LeetCodeCardProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);

  const handleResync = async () => {
    setIsSyncing(true);
    // Backend integration point: trigger LeetCode stats refresh via API
    await new Promise((r) => setTimeout(r, 2000));
    toast.success('LeetCode stats refreshed successfully');
    setIsSyncing(false);
  };

  const handleDisconnect = () => {
    // Backend integration point: revoke LeetCode connection
    toast.success('LeetCode account disconnected');
    setShowDisconnectConfirm(false);
  };

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden hover:border-leetcode/40 transition-all duration-200 card-glow-emerald flex flex-col">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-border">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-leetcode/15 flex items-center justify-center">
              <Code2 size={22} className="text-leetcode" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">LeetCode</h3>
              <p className="text-xs text-muted-foreground">Algorithm practice platform</p>
            </div>
          </div>
          <Badge variant="success" dot>Connected</Badge>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Logged in as</span>
          <span className="text-xs font-semibold font-mono text-foreground bg-secondary px-2 py-0.5 rounded-md">
            @arjun_codes
          </span>
          <a
            href="https://leetcode.com/arjun_codes"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            <ExternalLink size={12} />
          </a>
        </div>
      </div>

      {/* Stats preview */}
      <div className="px-5 py-4 flex-1 space-y-3">
        <p className="text-2xs font-semibold uppercase tracking-widest text-muted-foreground">Live Stats</p>

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-muted rounded-lg px-3 py-2.5">
            <p className="text-2xs text-muted-foreground mb-0.5">Total Solved</p>
            <p className="text-xl font-bold text-foreground font-mono tabular-nums">347</p>
          </div>
          <div className="bg-muted rounded-lg px-3 py-2.5">
            <p className="text-2xs text-muted-foreground mb-0.5">Acceptance</p>
            <p className="text-xl font-bold text-foreground font-mono tabular-nums">68.4%</p>
          </div>
        </div>

        {/* Difficulty breakdown */}
        <div className="space-y-1.5">
          {[
            { label: 'Easy', count: 142, total: 347, color: 'bg-success' },
            { label: 'Medium', count: 168, total: 347, color: 'bg-warning' },
            { label: 'Hard', count: 37, total: 347, color: 'bg-danger' },
          ].map((d) => (
            <div key={`lc-diff-${d.label.toLowerCase()}`} className="flex items-center gap-2">
              <span className="text-2xs text-muted-foreground w-12">{d.label}</span>
              <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                <div
                  className={`h-full ${d.color} rounded-full`}
                  style={{ width: `${(d.count / d.total) * 100}%` }}
                />
              </div>
              <span className="text-2xs font-mono text-muted-foreground w-6 text-right">{d.count}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <TrendingUp size={12} className="text-success" />
          <span>+12 solved this week</span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock size={12} />
          <span>Last synced 4 minutes ago</span>
        </div>
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
              Disconnect @arjun_codes? Your stats history will be preserved.
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