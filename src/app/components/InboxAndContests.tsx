'use client';

import React, { useState, useEffect } from 'react';
import {
  Bell,
  GitPullRequest,
  MessageSquare,
  GitCommit,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Trophy,
  Clock,
  Calendar,
  Code2,
  Zap,
  ChevronRight,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface GitHubNotification {
  id: string;
  type: 'PullRequest' | 'Issue' | 'Commit' | 'Release' | 'Discussion';
  title: string;
  repo: string;
  reason: string;
  updatedAt: string;
  unread: boolean;
  url: string;
}

interface Contest {
  id: string;
  platform: 'leetcode' | 'codeforces';
  name: string;
  startTime: string;
  duration: string;
  status: 'upcoming' | 'ongoing' | 'ended';
  url: string;
  participants?: number;
}

// ─── Mock Data (replace with real API calls once tokens are connected) ────────

const mockGitHubNotifications: GitHubNotification[] = [
  {
    id: 'gh-1',
    type: 'PullRequest',
    title: 'feat: add dark mode support to dashboard components',
    repo: 'arjun/codetrack',
    reason: 'review_requested',
    updatedAt: '2 min ago',
    unread: true,
    url: '#',
  },
  {
    id: 'gh-2',
    type: 'Issue',
    title: 'Bug: LeetCode sync fails when rate limit is hit',
    repo: 'arjun/codetrack',
    reason: 'mention',
    updatedAt: '1 hr ago',
    unread: true,
    url: '#',
  },
  {
    id: 'gh-3',
    type: 'PullRequest',
    title: 'chore: upgrade dependencies to latest stable versions',
    repo: 'arjun/algo-solutions',
    reason: 'subscribed',
    updatedAt: '3 hr ago',
    unread: false,
    url: '#',
  },
  {
    id: 'gh-4',
    type: 'Commit',
    title: 'fix: resolve hydration mismatch in ActivityFeed component',
    repo: 'arjun/codetrack',
    reason: 'push',
    updatedAt: '5 hr ago',
    unread: false,
    url: '#',
  },
  {
    id: 'gh-5',
    type: 'Release',
    title: 'v2.4.0 — New contest tracker & GitHub inbox integration',
    repo: 'arjun/codetrack',
    reason: 'subscribed',
    updatedAt: '1 day ago',
    unread: false,
    url: '#',
  },
];

const mockContests: Contest[] = [
  {
    id: 'lc-weekly-400',
    platform: 'leetcode',
    name: 'Weekly Contest 400',
    startTime: 'Sun, Aug 4 · 8:00 AM IST',
    duration: '1h 30m',
    status: 'upcoming',
    url: 'https://leetcode.com/contest/',
    participants: 24000,
  },
  {
    id: 'lc-biweekly-135',
    platform: 'leetcode',
    name: 'Biweekly Contest 135',
    startTime: 'Sat, Aug 10 · 8:00 PM IST',
    duration: '1h 30m',
    status: 'upcoming',
    url: 'https://leetcode.com/contest/',
    participants: 18500,
  },
  {
    id: 'cf-round-960',
    platform: 'codeforces',
    name: 'Codeforces Round 960 (Div. 2)',
    startTime: 'Mon, Aug 5 · 8:35 PM IST',
    duration: '2h 15m',
    status: 'upcoming',
    url: 'https://codeforces.com/contests',
    participants: 15000,
  },
  {
    id: 'cf-edu-168',
    platform: 'codeforces',
    name: 'Educational Codeforces Round 168',
    startTime: 'Wed, Aug 7 · 8:35 PM IST',
    duration: '2h',
    status: 'upcoming',
    url: 'https://codeforces.com/contests',
    participants: 12000,
  },
  {
    id: 'cf-round-959',
    platform: 'codeforces',
    name: 'Codeforces Round 959 (Div. 1)',
    startTime: 'Sat, Aug 3 · 8:35 PM IST',
    duration: '2h 30m',
    status: 'ended',
    url: 'https://codeforces.com/contests',
    participants: 8200,
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function NotifIcon({ type }: { type: GitHubNotification['type'] }) {
  const base = 'w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0';
  switch (type) {
    case 'PullRequest':
      return <div className={`${base} bg-primary/10`}><GitPullRequest size={14} className="text-primary" /></div>;
    case 'Issue':
      return <div className={`${base} bg-danger/10`}><AlertCircle size={14} className="text-danger" /></div>;
    case 'Commit':
      return <div className={`${base} bg-info/10`}><GitCommit size={14} className="text-info" /></div>;
    case 'Discussion':
      return <div className={`${base} bg-accent/10`}><MessageSquare size={14} className="text-accent" /></div>;
    case 'Release':
      return <div className={`${base} bg-warning/10`}><Trophy size={14} className="text-warning" /></div>;
    default:
      return <div className={`${base} bg-secondary`}><Bell size={14} className="text-muted-foreground" /></div>;
  }
}

function reasonLabel(reason: string) {
  const map: Record<string, string> = {
    review_requested: 'Review requested',
    mention: 'Mentioned',
    subscribed: 'Subscribed',
    push: 'Pushed',
    assign: 'Assigned',
    author: 'Author',
  };
  return map[reason] ?? reason;
}

function ContestStatusBadge({ status }: { status: Contest['status'] }) {
  if (status === 'upcoming') return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-semibold bg-primary/10 text-primary border border-primary/20">
      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
      Upcoming
    </span>
  );
  if (status === 'ongoing') return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-semibold bg-success/10 text-success border border-success/20">
      <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
      Live
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-semibold bg-secondary text-muted-foreground border border-border">
      Ended
    </span>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function InboxAndContests() {
  const [activeTab, setActiveTab] = useState<'github' | 'contests'>('github');
  const [contestFilter, setContestFilter] = useState<'all' | 'leetcode' | 'codeforces'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [unreadCount] = useState(mockGitHubNotifications.filter((n) => n.unread).length);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1200);
  };

  const filteredContests = contestFilter === 'all'
    ? mockContests
    : mockContests.filter((c) => c.platform === contestFilter);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      {/* ── GitHub Inbox ── */}
      <div className="bg-card border border-border rounded-xl overflow-hidden card-glow-emerald">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            {/* GitHub icon */}
            <div className="w-7 h-7 rounded-lg bg-github/10 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-4 h-4 text-github fill-current">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">GitHub Inbox</h2>
              <p className="text-2xs text-muted-foreground">{unreadCount} unread notifications</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              className="p-1.5 rounded-md hover:bg-secondary transition-colors"
              aria-label="Refresh notifications"
            >
              <RefreshCw size={13} className={`text-muted-foreground ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            <a
              href="https://github.com/notifications"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-md hover:bg-secondary transition-colors"
              aria-label="Open GitHub notifications"
            >
              <ExternalLink size={13} className="text-muted-foreground" />
            </a>
          </div>
        </div>

        {/* Notification list */}
        <ul className="divide-y divide-border">
          {mockGitHubNotifications.map((notif) => (
            <li key={notif.id}>
              <a
                href={notif.url}
                className="flex items-start gap-3 px-5 py-3.5 hover:bg-secondary/40 transition-colors group"
              >
                <NotifIcon type={notif.type} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm leading-snug truncate ${notif.unread ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                      {notif.title}
                    </p>
                    {notif.unread && (
                      <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-2xs text-muted-foreground font-mono truncate">{notif.repo}</span>
                    <span className="text-2xs text-muted-foreground">·</span>
                    <span className="text-2xs text-muted-foreground">{reasonLabel(notif.reason)}</span>
                    <span className="text-2xs text-muted-foreground">·</span>
                    <span className="text-2xs text-muted-foreground flex items-center gap-1">
                      <Clock size={10} />
                      {notif.updatedAt}
                    </span>
                  </div>
                </div>
                <ChevronRight size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1" />
              </a>
            </li>
          ))}
        </ul>

        <div className="px-5 py-3 border-t border-border">
          <a
            href="https://github.com/notifications"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline flex items-center gap-1"
          >
            View all notifications on GitHub
            <ExternalLink size={11} />
          </a>
        </div>
      </div>

      {/* ── Contest Updates ── */}
      <div className="bg-card border border-border rounded-xl overflow-hidden card-glow-indigo">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center">
              <Trophy size={14} className="text-accent" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">Contest Updates</h2>
              <p className="text-2xs text-muted-foreground">LeetCode & Codeforces</p>
            </div>
          </div>
          <a
            href="https://codeforces.com/contests"
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-md hover:bg-secondary transition-colors"
            aria-label="View all contests"
          >
            <ExternalLink size={13} className="text-muted-foreground" />
          </a>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-1 px-5 py-2.5 border-b border-border">
          {(['all', 'leetcode', 'codeforces'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setContestFilter(f)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                contestFilter === f
                  ? 'bg-secondary text-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
              }`}
            >
              {f === 'all' ? 'All' : f === 'leetcode' ? 'LeetCode' : 'Codeforces'}
            </button>
          ))}
        </div>

        {/* Contest list */}
        <ul className="divide-y divide-border">
          {filteredContests.map((contest) => (
            <li key={contest.id}>
              <a
                href={contest.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 px-5 py-3.5 hover:bg-secondary/40 transition-colors group"
              >
                {/* Platform icon */}
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  contest.platform === 'leetcode' ? 'bg-leetcode/10' : 'bg-codeforces/10'
                }`}>
                  {contest.platform === 'leetcode'
                    ? <Code2 size={14} className="text-leetcode" />
                    : <Zap size={14} className="text-codeforces" />
                  }
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-foreground leading-snug truncate">{contest.name}</p>
                    <ContestStatusBadge status={contest.status} />
                  </div>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1">
                    <span className="text-2xs text-muted-foreground flex items-center gap-1">
                      <Calendar size={10} />
                      {contest.startTime}
                    </span>
                    <span className="text-2xs text-muted-foreground">·</span>
                    <span className="text-2xs text-muted-foreground flex items-center gap-1">
                      <Clock size={10} />
                      {contest.duration}
                    </span>
                    {contest.participants && (
                      <>
                        <span className="text-2xs text-muted-foreground">·</span>
                        <span className="text-2xs text-muted-foreground">
                          ~{(contest.participants / 1000).toFixed(0)}k participants
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <ChevronRight size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1" />
              </a>
            </li>
          ))}
        </ul>

        <div className="px-5 py-3 border-t border-border flex items-center justify-between">
          <a
            href="https://leetcode.com/contest/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-leetcode hover:underline flex items-center gap-1"
          >
            LeetCode Contests
            <ExternalLink size={11} />
          </a>
          <a
            href="https://codeforces.com/contests"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-codeforces hover:underline flex items-center gap-1"
          >
            Codeforces Contests
            <ExternalLink size={11} />
          </a>
        </div>
      </div>
    </div>
  );
}
