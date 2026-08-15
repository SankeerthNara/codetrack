'use client';

import React, { useState } from 'react';
import { Zap, RefreshCw, Unlink, Clock, ExternalLink, Link2 } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import type { PlatformConnection } from '../PlatformCardList';

interface CodeforcesCardProps {
  onConnect: () => void;
  connection: PlatformConnection | null;
  loading?: boolean;
}

export default function CodeforcesCard({ onConnect, connection, loading }: CodeforcesCardProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);

  const handleResync = async () => {
    setIsSyncing(true);
    await new Promise((r) => setTimeout(r, 2000));
    if (connection) {
      const supabase = createClient();
      await supabase
        .from('platform_connections')
        .update({ last_synced_at: new Date().toISOString() })
        .eq('platform', 'codeforces');
    }
    toast.success('Codeforces stats refreshed successfully');
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
            <Badge variant="muted" dot>
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
      <div className="px-5 py-4 flex-1 space-y-3">
        <p className="text-2xs font-semibold uppercase tracking-widest text-muted-foreground">
          Account Connected
        </p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Zap size={12} className="text-success" />
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
