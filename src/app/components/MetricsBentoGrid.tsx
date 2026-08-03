import React from 'react';
import {
  Code2,
  GitPullRequest,
  Zap,
  Flame,
  Target,
  CalendarDays,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import Icon from '@/components/ui/AppIcon';


// Bento grid plan:
// 6 metric cards → grid-cols-4
// Row 1: hero (LeetCode solved) spans col-span-2, Codeforces rating, GitHub PRs
// Row 2: Streak, Acceptance Rate, Active Days

interface MetricCardProps {
  id: string;
  title: string;
  value: string;
  subvalue?: string;
  trend?: { direction: 'up' | 'down' | 'neutral'; label: string };
  icon: React.ElementType;
  iconColor: string;
  bgAccent?: string;
  colSpan?: string;
  children?: React.ReactNode;
  alertState?: boolean;
}

function MetricCard({
  title,
  value,
  subvalue,
  trend,
  icon: Icon,
  iconColor,
  bgAccent,
  colSpan = '',
  children,
  alertState,
}: MetricCardProps) {
  return (
    <div
      className={`
        relative bg-card border rounded-xl p-5 flex flex-col gap-3 overflow-hidden
        ${colSpan}
        ${alertState ? 'card-glow-warning border-warning/30' : 'border-border card-glow-emerald'}
        hover:border-primary/30 transition-all duration-200
      `}
    >
      {bgAccent && (
        <div
          className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-5 blur-2xl pointer-events-none"
          style={{ background: bgAccent }}
        />
      )}
      <div className="flex items-start justify-between">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${iconColor}`}>
          <Icon size={18} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-medium ${
            trend.direction === 'up' ? 'text-success' :
            trend.direction === 'down' ? 'text-danger' : 'text-muted-foreground'
          }`}>
            {trend.direction === 'up' ? <TrendingUp size={13} /> :
             trend.direction === 'down' ? <TrendingDown size={13} /> :
             <Minus size={13} />}
            {trend.label}
          </div>
        )}
      </div>

      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">{title}</p>
        <p className="text-3xl font-bold text-foreground tabular-nums font-mono">{value}</p>
        {subvalue && <p className="text-xs text-muted-foreground mt-1">{subvalue}</p>}
      </div>

      {children}
    </div>
  );
}

export default function MetricsBentoGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-4">
      {/* Hero: LeetCode Problems Solved — spans 2 cols */}
      <MetricCard
        id="metric-lc-solved"
        title="LeetCode Problems Solved"
        value="347"
        subvalue="Easy 142 · Medium 168 · Hard 37"
        trend={{ direction: 'up', label: '+12 this week' }}
        icon={Code2}
        iconColor="bg-leetcode/15 text-leetcode"
        bgAccent="#ffa116"
        colSpan="md:col-span-2 lg:col-span-2"
      >
        {/* Difficulty bar */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-2xs text-muted-foreground w-12">Easy</span>
            <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-success rounded-full" style={{ width: '40.9%' }} />
            </div>
            <span className="text-2xs text-muted-foreground font-mono w-8 text-right">142</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xs text-muted-foreground w-12">Medium</span>
            <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-warning rounded-full" style={{ width: '48.4%' }} />
            </div>
            <span className="text-2xs text-muted-foreground font-mono w-8 text-right">168</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xs text-muted-foreground w-12">Hard</span>
            <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-danger rounded-full" style={{ width: '10.7%' }} />
            </div>
            <span className="text-2xs text-muted-foreground font-mono w-8 text-right">37</span>
          </div>
        </div>
      </MetricCard>

      {/* Codeforces Rating */}
      <MetricCard
        id="metric-cf-rating"
        title="Codeforces Rating"
        value="1,847"
        subvalue="Expert · Max: 1,923"
        trend={{ direction: 'down', label: '-76 this month' }}
        icon={Zap}
        iconColor="bg-codeforces/15 text-codeforces"
        bgAccent="#1890ff"
        alertState
      >
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Rank</span>
          <span className="font-semibold cf-rank-expert">Expert</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Solved</span>
          <span className="font-mono text-foreground">612</span>
        </div>
      </MetricCard>

      {/* GitHub PRs Merged */}
      <MetricCard
        id="metric-gh-prs"
        title="GitHub PRs Merged"
        value="89"
        subvalue="23 this month · 8 open"
        trend={{ direction: 'up', label: '+6 vs last month' }}
        icon={GitPullRequest}
        iconColor="bg-github/10 text-github"
        bgAccent="#e6edf3"
      >
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Commits (30d)</span>
          <span className="font-mono text-foreground">247</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Stars earned</span>
          <span className="font-mono text-foreground">1,204</span>
        </div>
      </MetricCard>

      {/* LeetCode Streak */}
      <MetricCard
        id="metric-lc-streak"
        title="LeetCode Streak"
        value="23"
        subvalue="days consecutive"
        trend={{ direction: 'up', label: 'Personal best!' }}
        icon={Flame}
        iconColor="bg-warning/15 text-warning"
        bgAccent="#f59e0b"
      >
        <div className="streak-active rounded-lg px-3 py-2 text-center">
          <p className="text-xs text-muted-foreground">Next milestone</p>
          <p className="text-sm font-bold text-primary tabular-nums">30 days</p>
        </div>
      </MetricCard>

      {/* Acceptance Rate */}
      <MetricCard
        id="metric-lc-acceptance"
        title="LeetCode Acceptance"
        value="68.4%"
        subvalue="of 507 total submissions"
        trend={{ direction: 'up', label: '+2.1% vs last month' }}
        icon={Target}
        iconColor="bg-primary/15 text-primary"
        bgAccent="#6ee7b7"
      >
        <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all" style={{ width: '68.4%' }} />
        </div>
      </MetricCard>

      {/* Total Active Days */}
      <MetricCard
        id="metric-active-days"
        title="Total Active Days"
        value="186"
        subvalue="across all platforms in 2025"
        trend={{ direction: 'up', label: '+14 this month' }}
        icon={CalendarDays}
        iconColor="bg-info/15 text-info"
        bgAccent="#818cf8"
      >
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">This week</span>
          <span className="font-mono text-foreground">6 / 7 days</span>
        </div>
      </MetricCard>
    </div>
  );
}