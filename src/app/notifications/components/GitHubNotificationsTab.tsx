'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  Bell,
  GitPullRequest,
  MessageSquare,
  GitCommit,
  CircleDot,
  Tag,
  ExternalLink,
  RefreshCw,
  CheckCheck,
  KeyRound,
} from 'lucide-react';
import { toast } from 'sonner';
import Badge from '@/components/ui/Badge';
import { getGitHubToken, setGitHubToken, clearGitHubToken } from '@/lib/localApi/githubToken';
import {
  fetchGitHubNotifications,
  markAllGitHubNotificationsRead,
  markGitHubNotificationRead,
  GitHubNotificationsAuthError,
  type GitHubNotificationItem,
} from '@/lib/localApi/githubNotifications';

function reasonLabel(reason: string) {
  const map: Record<string, string> = {
    review_requested: 'Review requested',
    mention: 'Mentioned',
    subscribed: 'Subscribed',
    push: 'Pushed',
    assign: 'Assigned',
    author: 'Author',
    comment: 'Commented',
    state_change: 'State changed',
    team_mention: 'Team mentioned',
    ci_activity: 'CI activity',
  };
  return map[reason] ?? reason;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs > 1 ? 's' : ''} ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'Yesterday';
  return `${days} days ago`;
}

function NotifIcon({ type }: { type: string }) {
  const base = 'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0';
  switch (type) {
    case 'PullRequest':
      return (
        <div className={`${base} bg-primary/10`}>
          <GitPullRequest size={15} className="text-primary" />
        </div>
      );
    case 'Issue':
      return (
        <div className={`${base} bg-success/10`}>
          <CircleDot size={15} className="text-success" />
        </div>
      );
    case 'Commit':
      return (
        <div className={`${base} bg-info/10`}>
          <GitCommit size={15} className="text-info" />
        </div>
      );
    case 'Discussion':
      return (
        <div className={`${base} bg-accent/10`}>
          <MessageSquare size={15} className="text-accent" />
        </div>
      );
    case 'Release':
      return (
        <div className={`${base} bg-warning/10`}>
          <Tag size={15} className="text-warning" />
        </div>
      );
    default:
      return (
        <div className={`${base} bg-secondary`}>
          <Bell size={15} className="text-muted-foreground" />
        </div>
      );
  }
}

function TokenPrompt({ onSave }: { onSave: (token: string) => void }) {
  const [value, setValue] = useState('');

  return (
    <div className="px-5 py-10 text-center max-w-md mx-auto">
      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
        <KeyRound size={24} className="text-primary" />
      </div>
      <h3 className="text-sm font-semibold text-foreground mb-1.5">Connect your GitHub inbox</h3>
      <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
        GitHub notifications are private, so this needs a personal access token with the{' '}
        <code className="text-2xs bg-secondary px-1 py-0.5 rounded">notifications</code> scope
        (classic token) or <code className="text-2xs bg-secondary px-1 py-0.5 rounded">read:notifications</code>{' '}
        (fine-grained). It's stored only on this device and sent straight to GitHub.
      </p>
      <a
        href="https://github.com/settings/tokens/new?scopes=notifications&description=CodeTrack"
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-primary hover:underline inline-flex items-center gap-1 mb-4"
      >
        Create a token on GitHub
        <ExternalLink size={11} />
      </a>
      <div className="flex items-center gap-2">
        <input
          type="password"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="ghp_..."
          className="flex-1 px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <button
          onClick={() => value.trim() && onSave(value.trim())}
          disabled={!value.trim()}
          className="btn-primary px-3 py-2 rounded-lg text-sm font-semibold disabled:opacity-60"
        >
          Save
        </button>
      </div>
    </div>
  );
}

export default function GitHubNotificationsTab() {
  const [hasToken, setHasToken] = useState(false);
  const [view, setView] = useState<'unread' | 'all'>('unread');
  const [notifications, setNotifications] = useState<GitHubNotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (showLoading = true) => {
    if (!getGitHubToken()) {
      setHasToken(false);
      setLoading(false);
      return;
    }
    setHasToken(true);
    if (showLoading) setLoading(true);
    setError(null);
    try {
      const data = await fetchGitHubNotifications(view === 'all');
      setNotifications(data);
    } catch (err) {
      if (err instanceof GitHubNotificationsAuthError) {
        setError('That token is invalid or missing the notifications scope.');
      } else {
        setError('Failed to load GitHub notifications.');
      }
    } finally {
      setLoading(false);
    }
  }, [view]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSaveToken = (token: string) => {
    setGitHubToken(token);
    setHasToken(true);
    load();
  };

  const handleForgetToken = () => {
    clearGitHubToken();
    setHasToken(false);
    setNotifications([]);
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllGitHubNotificationsRead();
      toast.success('Marked all as read');
      load(false);
    } catch {
      toast.error('Could not mark notifications as read');
    }
  };

  const handleOpen = async (item: GitHubNotificationItem) => {
    if (item.unread) {
      try {
        await markGitHubNotificationRead(item.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === item.id ? { ...n, unread: false } : n))
        );
      } catch {
        // Non-fatal — the person still gets to the notification either way.
      }
    }
    window.open(item.url, '_blank', 'noopener,noreferrer');
  };

  if (!hasToken) {
    return (
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <TokenPrompt onSave={handleSaveToken} />
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-wrap gap-3">
        <div className="flex items-center gap-1 bg-secondary rounded-lg p-1">
          <button
            onClick={() => setView('unread')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              view === 'unread'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Unread
          </button>
          <button
            onClick={() => setView('all')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              view === 'all'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            All
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleMarkAllRead}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <CheckCheck size={13} />
            Mark all read
          </button>
          <button
            onClick={() => load()}
            aria-label="Refresh"
            className="p-1.5 rounded-md hover:bg-secondary transition-colors"
          >
            <RefreshCw size={13} className={`text-muted-foreground ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleForgetToken}
            className="text-2xs text-muted-foreground hover:text-danger transition-colors"
          >
            Disconnect
          </button>
        </div>
      </div>

      {loading ? (
        <div className="animate-pulse">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-start gap-3 px-5 py-3.5 border-b border-border">
              <div className="w-8 h-8 rounded-lg bg-secondary flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 bg-secondary rounded w-3/4" />
                <div className="h-3 bg-secondary rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="px-5 py-10 text-center">
          <p className="text-sm text-danger mb-2">{error}</p>
          <button onClick={handleForgetToken} className="text-xs text-primary hover:underline">
            Update token
          </button>
        </div>
      ) : notifications.length === 0 ? (
        <div className="px-5 py-10 text-center">
          <Bell size={24} className="text-muted-foreground mx-auto mb-3 opacity-40" />
          <p className="text-sm text-muted-foreground">
            {view === 'unread' ? "You're all caught up" : 'No notifications'}
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {notifications.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => handleOpen(item)}
                className="w-full flex items-start gap-3 px-5 py-3.5 hover:bg-secondary/40 transition-colors text-left"
              >
                <NotifIcon type={item.type} />
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm leading-snug truncate ${
                      item.unread ? 'font-semibold text-foreground' : 'text-foreground/80'
                    }`}
                  >
                    {item.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-2xs text-muted-foreground font-mono truncate">
                      {item.repoFullName}
                    </span>
                    <span className="text-2xs text-muted-foreground">·</span>
                    <span className="text-2xs text-muted-foreground">{reasonLabel(item.reason)}</span>
                    <span className="text-2xs text-muted-foreground">·</span>
                    <span className="text-2xs text-muted-foreground">{timeAgo(item.updatedAt)}</span>
                  </div>
                </div>
                {item.unread && (
                  <Badge variant="info" dot className="flex-shrink-0">
                    New
                  </Badge>
                )}
                <ExternalLink size={13} className="text-muted-foreground flex-shrink-0 mt-0.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
