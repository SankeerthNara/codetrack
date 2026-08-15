'use client';

import React, { useState } from 'react';
import { GitPullRequest, RefreshCw, Unlink, Clock, ExternalLink, Link2 } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import type { PlatformConnection } from '../PlatformCardList';

interface GitHubCardProps {
  onConnect: () => void;
  connection: PlatformConnection | null;
  loading?: boolean;
}

export default function GitHubCard({ onConnect, connection, loading }: GitHubCardProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);

  const handleResync = async () => {
    setIsSyncing(true);
    await new Promise((r) => setTimeout(r, 1800));
    if (connection) {
      const supabase = createClient();
      await supabase
        .from('platform_connections')
        .update({ last_synced_at: new Date().toISOString() })
        .eq('platform', 'github');
    }
    toast.success('GitHub stats refreshed successfully');
    setIsSyncing(false);
  };

  const handleDisconnect = async () => {
    const supabase = createClient();
    await supabase.from('platform_connections').delete().eq('platform', 'github');
    toast.success('GitHub account disconnected');
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
      <div className="bg-card border border-border rounded-xl overflow-hidden hover:border-github/30 transition-all duration-200 flex flex-col">
        <div className="px-5 pt-5 pb-4 border-b border-border">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-github/8 flex items-center justify-center">
                <svg className="w-6 h-6 text-github" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground">GitHub</h3>
                <p className="text-xs text-muted-foreground">Code hosting & collaboration</p>
              </div>
            </div>
            <Badge variant="muted" dot>
              Not Connected
            </Badge>
          </div>
        </div>
        <div className="px-5 py-8 flex-1 flex flex-col items-center justify-center text-center gap-3">
          <p className="text-sm text-muted-foreground">
            Connect your GitHub account to track your contributions
          </p>
          <button
            onClick={onConnect}
            className="btn-primary flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold"
          >
            <Link2 size={14} />
            Connect GitHub
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden hover:border-github/30 transition-all duration-200 card-glow-emerald flex flex-col">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-border">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-github/8 flex items-center justify-center">
              <svg className="w-6 h-6 text-github" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">GitHub</h3>
              <p className="text-xs text-muted-foreground">Code hosting & collaboration</p>
            </div>
          </div>
          <Badge variant="success" dot>
            Connected
          </Badge>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Logged in as</span>
          <span className="text-xs font-semibold font-mono text-foreground bg-secondary px-2 py-0.5 rounded-md">
            @{connection.username}
          </span>
          <a
            href={`https://github.com/${connection.username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            <ExternalLink size={12} />
          </a>
        </div>
      </div>

      {/* Stats */}
      <div className="px-5 py-4 flex-1 space-y-3">
        <p className="text-2xs font-semibold uppercase tracking-widest text-muted-foreground">
          Account Connected
        </p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <GitPullRequest size={12} className="text-success" />
          <span>Stats will sync automatically</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock size={12} />
          <span>Connected {new Date(connection.connected_at).toLocaleDateString()}</span>
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
              Disconnect @{connection.username}? Your contribution history will be preserved.
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
