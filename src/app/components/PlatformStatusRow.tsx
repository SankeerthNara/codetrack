import React from 'react';
import Badge from '@/components/ui/Badge';
import { CheckCircle2, AlertCircle, Clock } from 'lucide-react';

const platforms = [
  {
    id: 'platform-lc',
    name: 'LeetCode',
    username: 'arjun_codes',
    status: 'connected' as const,
    lastSync: '4 min ago',
    color: 'leetcode' as const,
    dot: '#ffa116',
  },
  {
    id: 'platform-gh',
    name: 'GitHub',
    username: 'arjun-kumar',
    status: 'connected' as const,
    lastSync: '4 min ago',
    color: 'github' as const,
    dot: '#e6edf3',
  },
  {
    id: 'platform-cf',
    name: 'Codeforces',
    username: 'arjun_cf',
    status: 'error' as const,
    lastSync: '2 hrs ago',
    color: 'codeforces' as const,
    dot: '#1890ff',
  },
];

export default function PlatformStatusRow() {
  return (
    <div className="flex flex-wrap gap-3">
      {platforms.map((p) => (
        <div
          key={p.id}
          className="flex items-center gap-2.5 px-3 py-2 bg-card border border-border rounded-lg text-sm"
        >
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: p.dot }}
          />
          <span className="font-medium text-foreground">{p.name}</span>
          <span className="text-muted-foreground font-mono text-xs">@{p.username}</span>
          {p.status === 'connected' ? (
            <Badge variant="success" className="text-2xs">
              <CheckCircle2 size={10} />
              Live
            </Badge>
          ) : (
            <Badge variant="danger" className="text-2xs">
              <AlertCircle size={10} />
              Error
            </Badge>
          )}
          <span className="text-muted-foreground text-xs flex items-center gap-1">
            <Clock size={10} />
            {p.lastSync}
          </span>
        </div>
      ))}
    </div>
  );
}