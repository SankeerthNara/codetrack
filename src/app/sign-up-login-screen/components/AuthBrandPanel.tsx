import React from 'react';
import { Code2, GitPullRequest, Zap, TrendingUp, CheckCircle2 } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';


const platformStats = [
  {
    id: 'brand-lc',
    platform: 'LeetCode',
    stat: '347 problems solved',
    sub: 'Easy 142 · Medium 168 · Hard 37',
    icon: Code2,
    color: 'text-leetcode',
    bg: 'bg-leetcode/10',
    dotColor: '#ffa116',
  },
  {
    id: 'brand-gh',
    platform: 'GitHub',
    stat: '89 PRs merged',
    sub: '247 commits in last 30 days',
    icon: GitPullRequest,
    color: 'text-github',
    bg: 'bg-github/8',
    dotColor: '#e6edf3',
  },
  {
    id: 'brand-cf',
    platform: 'Codeforces',
    stat: 'Rating 1,847',
    sub: 'Expert rank · 612 solved',
    icon: Zap,
    color: 'text-codeforces',
    bg: 'bg-codeforces/10',
    dotColor: '#1890ff',
  },
];

export default function AuthBrandPanel() {
  return (
    <div className="hidden lg:flex w-1/2 xl:w-5/12 bg-card border-r border-border flex-col justify-between p-10 xl:p-14 2xl:p-16 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-primary/5 blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-info/5 blur-3xl translate-x-1/2 translate-y-1/2" />
      </div>
      {/* Logo */}
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <span className="text-primary font-bold text-sm font-mono">CT</span>
          </div>
          <span className="font-bold text-foreground text-xl tracking-tight">CodeTrack</span>
        </div>

        <h2 className="text-3xl xl:text-4xl font-bold text-foreground leading-tight tracking-tight mb-4">
          Your coding progress,<br />
          <span className="text-primary">unified.</span>
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
          Connect LeetCode, GitHub, and Codeforces. See all your stats, streaks, and ratings in one live dashboard.
        </p>
      </div>
      {/* Platform stats preview */}
      <div className="relative z-10 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
          Live stats preview
        </p>
        {platformStats?.map((p) => {
          const Icon = p?.icon;
          return (
            <div
              key={p?.id}
              className="flex items-center gap-3 bg-background/60 border border-border rounded-xl px-4 py-3"
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${p?.bg}`}>
                <Icon size={17} className={p?.color} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-muted-foreground">{p?.platform}</span>
                  <span
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: p?.dotColor }}
                  />
                </div>
                <p className="text-sm font-bold text-foreground">{p?.stat}</p>
                <p className="text-2xs text-muted-foreground">{p?.sub}</p>
              </div>
              <TrendingUp size={14} className="text-success flex-shrink-0" />
            </div>
          );
        })}
      </div>
      {/* Social proof */}
      <div className="relative z-10">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <CheckCircle2 size={13} className="text-success" />
          <span>Free for everyone — connect your accounts and start tracking</span>
        </div>
      </div>
    </div>
  );
}