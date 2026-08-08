import React from 'react';
import { CheckCircle2, XCircle, RefreshCw, Clock } from 'lucide-react';

type SyncStatus = 'success' | 'error' | 'running';

interface SyncEvent {
  id: string;
  platform: string;
  platformColor: string;
  status: SyncStatus;
  message: string;
  duration?: string;
  timestamp: string;
}

const syncEvents: SyncEvent[] = [
  {
    id: 'sync-001',
    platform: 'LeetCode',
    platformColor: 'text-leetcode',
    status: 'success',
    message: 'Synced 347 problems, 507 submissions, and streak data',
    duration: '1.2s',
    timestamp: '4 min ago',
  },
  {
    id: 'sync-002',
    platform: 'GitHub',
    platformColor: 'text-github',
    status: 'success',
    message: 'Synced 247 commits, 89 PRs, and contribution graph',
    duration: '2.8s',
    timestamp: '4 min ago',
  },
  {
    id: 'sync-003',
    platform: 'Codeforces',
    platformColor: 'text-codeforces',
    status: 'error',
    message: 'API rate limit exceeded — 429 Too Many Requests',
    timestamp: '4 min ago',
  },
  {
    id: 'sync-004',
    platform: 'LeetCode',
    platformColor: 'text-leetcode',
    status: 'success',
    message: 'Synced 335 problems and daily streak reset',
    duration: '0.9s',
    timestamp: '2 hrs ago',
  },
  {
    id: 'sync-005',
    platform: 'Codeforces',
    platformColor: 'text-codeforces',
    status: 'success',
    message: 'Synced Round 890 result — Δ −44 rating to 1,847',
    duration: '1.7s',
    timestamp: '3 hrs ago',
  },
  {
    id: 'sync-006',
    platform: 'GitHub',
    platformColor: 'text-github',
    status: 'success',
    message: 'Synced PR #147 merge and 12 new commits',
    duration: '1.4s',
    timestamp: '5 hrs ago',
  },
  {
    id: 'sync-007',
    platform: 'LeetCode',
    platformColor: 'text-leetcode',
    status: 'error',
    message: 'LeetCode profile temporarily unavailable — retried 3x',
    timestamp: 'Yesterday',
  },
  {
    id: 'sync-008',
    platform: 'GitHub',
    platformColor: 'text-github',
    status: 'success',
    message: 'Scheduled daily sync — no new activity detected',
    duration: '0.6s',
    timestamp: 'Yesterday',
  },
];

const statusIcon = {
  success: <CheckCircle2 size={14} className="text-success flex-shrink-0" />,
  error: <XCircle size={14} className="text-danger flex-shrink-0" />,
  running: <RefreshCw size={14} className="text-info animate-spin flex-shrink-0" />,
};

export default function SyncEventTimeline() {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Sync History</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Recent sync events across all connected platforms
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 size={11} className="text-success" />6 succeeded
          </span>
          <span className="flex items-center gap-1.5">
            <XCircle size={11} className="text-danger" />2 failed
          </span>
        </div>
      </div>

      <ul className="divide-y divide-border">
        {syncEvents.map((event) => (
          <li
            key={event.id}
            className="flex items-start gap-3 px-5 py-3 hover:bg-secondary/20 transition-colors"
          >
            <div className="mt-0.5 flex-shrink-0">{statusIcon[event.status]}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`text-xs font-semibold flex-shrink-0 ${event.platformColor}`}>
                    {event.platform}
                  </span>
                  <p className="text-xs text-muted-foreground truncate">{event.message}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {event.duration && (
                    <span className="text-2xs font-mono text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
                      {event.duration}
                    </span>
                  )}
                  <span className="text-2xs text-muted-foreground flex items-center gap-1">
                    <Clock size={9} />
                    {event.timestamp}
                  </span>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="px-5 py-3 border-t border-border">
        <button className="text-xs text-primary hover:text-primary/80 font-medium transition-colors">
          View complete sync log →
        </button>
      </div>
    </div>
  );
}
