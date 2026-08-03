import React from 'react';
import Badge from '@/components/ui/Badge';
import { Code2, GitPullRequest, GitCommit, Zap, CheckCircle2, XCircle } from 'lucide-react';

type Platform = 'leetcode' | 'github' | 'codeforces';
type EventType = 'solved' | 'pr_merged' | 'commit' | 'contest' | 'submission';

interface ActivityItem {
  id: string;
  platform: Platform;
  type: EventType;
  title: string;
  meta: string;
  timestamp: string;
  outcome: 'success' | 'fail' | 'neutral';
}

const activities: ActivityItem[] = [
  {
    id: 'act-001',
    platform: 'leetcode',
    type: 'solved',
    title: '2742. Painting the Walls',
    meta: 'Hard · Dynamic Programming',
    timestamp: '38 min ago',
    outcome: 'success',
  },
  {
    id: 'act-002',
    platform: 'github',
    type: 'pr_merged',
    title: 'feat: add Redis caching layer to session service',
    meta: 'arjun-kumar/api-gateway · PR #147',
    timestamp: '1 hr ago',
    outcome: 'success',
  },
  {
    id: 'act-003',
    platform: 'codeforces',
    type: 'contest',
    title: 'Codeforces Round 890 (Div. 2)',
    meta: 'Rank #2,341 · Δ −44 rating',
    timestamp: '3 hrs ago',
    outcome: 'fail',
  },
  {
    id: 'act-004',
    platform: 'leetcode',
    type: 'solved',
    title: '1143. Longest Common Subsequence',
    meta: 'Medium · Dynamic Programming',
    timestamp: '5 hrs ago',
    outcome: 'success',
  },
  {
    id: 'act-005',
    platform: 'github',
    type: 'commit',
    title: 'refactor: migrate auth middleware to JWT RS256',
    meta: 'arjun-kumar/auth-service · 3 files changed',
    timestamp: '6 hrs ago',
    outcome: 'neutral',
  },
  {
    id: 'act-006',
    platform: 'leetcode',
    type: 'submission',
    title: '76. Minimum Window Substring',
    meta: 'Hard · Sliding Window · TLE on test 78',
    timestamp: 'Yesterday',
    outcome: 'fail',
  },
  {
    id: 'act-007',
    platform: 'codeforces',
    type: 'solved',
    title: 'CF 1850D — Balanced String',
    meta: 'Div. 2 Div D · Constructive',
    timestamp: 'Yesterday',
    outcome: 'success',
  },
  {
    id: 'act-008',
    platform: 'github',
    type: 'pr_merged',
    title: 'fix: resolve race condition in task queue processor',
    meta: 'arjun-kumar/worker-pool · PR #52',
    timestamp: '2 days ago',
    outcome: 'success',
  },
];

const platformIcon = {
  leetcode: Code2,
  github: GitCommit,
  codeforces: Zap,
};

const platformBadgeVariant: Record<Platform, 'leetcode' | 'github' | 'codeforces'> = {
  leetcode: 'leetcode',
  github: 'github',
  codeforces: 'codeforces',
};

const eventTypeIcon = {
  solved: CheckCircle2,
  pr_merged: GitPullRequest,
  commit: GitCommit,
  contest: Zap,
  submission: XCircle,
};

export default function ActivityFeed() {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Recent Activity</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Latest coding events across all platforms</p>
        </div>
        <span className="text-xs text-muted-foreground font-mono bg-secondary px-2 py-1 rounded-md">
          {activities.length} events
        </span>
      </div>
      <ul className="divide-y divide-border">
        {activities.map((item) => {
          const PlatformIcon = platformIcon[item.platform];
          const EventIcon = eventTypeIcon[item.type];
          return (
            <li
              key={item.id}
              className="flex items-start gap-3 px-5 py-3.5 hover:bg-secondary/30 transition-colors group"
            >
              {/* Platform icon */}
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                item.platform === 'leetcode' ? 'bg-leetcode/10' :
                item.platform === 'github'? 'bg-github/8' : 'bg-codeforces/10'
              }`}>
                <PlatformIcon size={15} className={
                  item.platform === 'leetcode' ? 'text-leetcode' :
                  item.platform === 'github'? 'text-github' : 'text-codeforces'
                } />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
                    <Badge variant={platformBadgeVariant[item.platform]} className="flex-shrink-0 capitalize text-2xs">
                      {item.platform}
                    </Badge>
                    {item.outcome === 'success' ? (
                      <span className="text-success flex-shrink-0">
                        <CheckCircle2 size={13} />
                      </span>
                    ) : item.outcome === 'fail' ? (
                      <span className="text-danger flex-shrink-0">
                        <XCircle size={13} />
                      </span>
                    ) : null}
                  </div>
                  <span className="text-xs text-muted-foreground flex-shrink-0 whitespace-nowrap">{item.timestamp}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">{item.meta}</p>
              </div>
            </li>
          );
        })}
      </ul>
      <div className="px-5 py-3 border-t border-border">
        <button className="text-xs text-primary hover:text-primary/80 font-medium transition-colors">
          View full activity history →
        </button>
      </div>
    </div>
  );
}