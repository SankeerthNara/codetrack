'use client';

import React, { useEffect, useState, useCallback } from 'react';
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
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Icon from '@/components/ui/AppIcon';

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
  skeleton?: boolean;
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
  skeleton,
}: MetricCardProps) {
  if (skeleton) {
    return (
      <div
        className={`relative bg-card border border-border rounded-xl p-5 flex flex-col gap-3 overflow-hidden animate-pulse ${colSpan}`}
      >
        <div className="flex items-start justify-between">
          <div className="w-9 h-9 rounded-lg bg-secondary" />
          <div className="h-4 w-20 bg-secondary rounded" />
        </div>
        <div>
          <div className="h-3 w-28 bg-secondary rounded mb-2" />
          <div className="h-8 w-20 bg-secondary rounded" />
          <div className="h-3 w-32 bg-secondary rounded mt-2" />
        </div>
        {children}
      </div>
    );
  }

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
          <div
            className={`flex items-center gap-1 text-xs font-medium ${
              trend.direction === 'up'
                ? 'text-success'
                : trend.direction === 'down'
                  ? 'text-danger'
                  : 'text-muted-foreground'
            }`}
          >
            {trend.direction === 'up' ? (
              <TrendingUp size={13} />
            ) : trend.direction === 'down' ? (
              <TrendingDown size={13} />
            ) : (
              <Minus size={13} />
            )}
            {trend.label}
          </div>
        )}
      </div>

      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
          {title}
        </p>
        <p className="text-3xl font-bold text-foreground tabular-nums font-mono">{value}</p>
        {subvalue && <p className="text-xs text-muted-foreground mt-1">{subvalue}</p>}
      </div>

      {children}
    </div>
  );
}

interface LeetCodeStats {
  solved: { total: number; easy: number; medium: number; hard: number };
  calendar: { streak: number; totalActiveDays: number };
  contest: { rating: number } | null;
}

interface GitHubStats {
  publicRepos: number;
  totalStars: number;
  recentPRsMerged: number;
  followers: number;
}

interface CodeforcesStats {
  rating: number | null;
  maxRating: number | null;
  rank: string | null;
  problemsSolved?: number;
}

export default function MetricsBentoGrid() {
  const { user } = useAuth();
  const [lcStats, setLcStats] = useState<LeetCodeStats | null>(null);
  const [lcLoading, setLcLoading] = useState(true);
  const [ghStats, setGhStats] = useState<GitHubStats | null>(null);
  const [cfStats, setCfStats] = useState<CodeforcesStats | null>(null);

  const fetchLeetCodeStats = useCallback(async () => {
    if (!user) {
      setLcLoading(false);
      return;
    }
    try {
      const supabase = createClient();
      const { data: conn } = await supabase
        .from('platform_connections')
        .select('username')
        .eq('user_id', user.id)
        .eq('platform', 'leetcode')
        .single();

      if (!conn?.username) {
        setLcLoading(false);
        return;
      }

      const res = await fetch(`/api/leetcode?username=${encodeURIComponent(conn.username)}`);
      if (res.ok) {
        const data = await res.json();
        setLcStats(data);
      }
    } catch {
      // silently fail — show placeholders
    } finally {
      setLcLoading(false);
    }
  }, [user]);

  const fetchGitHubStats = useCallback(async () => {
    if (!user) return;
    try {
      const supabase = createClient();
      const { data: conn } = await supabase
        .from('platform_connections')
        .select('username')
        .eq('user_id', user.id)
        .eq('platform', 'github')
        .single();

      if (!conn?.username) return;

      const res = await fetch(`/api/github?username=${encodeURIComponent(conn.username)}`);
      if (res.ok) {
        const data = await res.json();
        setGhStats({
          publicRepos: data.publicRepos ?? 0,
          totalStars: data.totalStars ?? 0,
          recentPRsMerged: data.recentPRsMerged ?? 0,
          followers: data.followers ?? 0,
        });
      }
    } catch {
      // silently fail
    }
  }, [user]);

  const fetchCodeforcesStats = useCallback(async () => {
    if (!user) return;
    try {
      const supabase = createClient();
      const { data: conn } = await supabase
        .from('platform_connections')
        .select('username')
        .eq('user_id', user.id)
        .eq('platform', 'codeforces')
        .single();

      if (!conn?.username) return;

      const res = await fetch(`/api/codeforces?handle=${encodeURIComponent(conn.username)}`);
      if (res.ok) {
        const data = await res.json();
        setCfStats({
          rating: data.rating ?? null,
          maxRating: data.maxRating ?? null,
          rank: data.rank ?? null,
          problemsSolved: data.problemsSolved ?? 0,
        });
      }
    } catch {
      // silently fail
    }
  }, [user]);

  useEffect(() => {
    fetchLeetCodeStats();
    fetchGitHubStats();
    fetchCodeforcesStats();
  }, [fetchLeetCodeStats, fetchGitHubStats, fetchCodeforcesStats]);

  // Derived values
  const totalSolved = lcStats?.solved.total ?? 0;
  const easySolved = lcStats?.solved.easy ?? 0;
  const mediumSolved = lcStats?.solved.medium ?? 0;
  const hardSolved = lcStats?.solved.hard ?? 0;
  const streak = lcStats?.calendar.streak ?? 0;
  const activeDays = lcStats?.calendar.totalActiveDays ?? 0;
  const contestRating = lcStats?.contest?.rating ?? null;

  const easyPct = totalSolved > 0 ? ((easySolved / totalSolved) * 100).toFixed(1) : '0';
  const mediumPct = totalSolved > 0 ? ((mediumSolved / totalSolved) * 100).toFixed(1) : '0';
  const hardPct = totalSolved > 0 ? ((hardSolved / totalSolved) * 100).toFixed(1) : '0';

  const nextMilestone =
    streak < 7
      ? 7
      : streak < 14
        ? 14
        : streak < 30
          ? 30
          : streak < 60
            ? 60
            : streak < 100
              ? 100
              : streak + 50;

  if (lcLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-4">
        <MetricCard
          id="sk-1"
          title=""
          value=""
          icon={Code2}
          iconColor=""
          colSpan="md:col-span-2 lg:col-span-2"
          skeleton
        >
          <div className="space-y-1.5">
            <div className="h-2 bg-secondary rounded-full" />
            <div className="h-2 bg-secondary rounded-full" />
            <div className="h-2 bg-secondary rounded-full" />
          </div>
        </MetricCard>
        <MetricCard id="sk-2" title="" value="" icon={Zap} iconColor="" skeleton />
        <MetricCard id="sk-3" title="" value="" icon={GitPullRequest} iconColor="" skeleton />
        <MetricCard id="sk-4" title="" value="" icon={Flame} iconColor="" skeleton />
        <MetricCard id="sk-5" title="" value="" icon={Target} iconColor="" skeleton />
        <MetricCard id="sk-6" title="" value="" icon={CalendarDays} iconColor="" skeleton />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-4">
      {/* Hero: LeetCode Problems Solved — spans 2 cols */}
      <MetricCard
        id="metric-lc-solved"
        title="LeetCode Problems Solved"
        value={lcStats ? String(totalSolved) : '—'}
        subvalue={
          lcStats
            ? `Easy ${easySolved} · Medium ${mediumSolved} · Hard ${hardSolved}`
            : 'Connect LeetCode to see stats'
        }
        trend={lcStats ? { direction: 'up', label: `${hardSolved} hard solved` } : undefined}
        icon={Code2}
        iconColor="bg-leetcode/15 text-leetcode"
        bgAccent="#ffa116"
        colSpan="md:col-span-2 lg:col-span-2"
      >
        {lcStats && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-2xs text-muted-foreground w-12">Easy</span>
              <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-success rounded-full" style={{ width: `${easyPct}%` }} />
              </div>
              <span className="text-2xs text-muted-foreground font-mono w-8 text-right">
                {easySolved}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xs text-muted-foreground w-12">Medium</span>
              <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-warning rounded-full"
                  style={{ width: `${mediumPct}%` }}
                />
              </div>
              <span className="text-2xs text-muted-foreground font-mono w-8 text-right">
                {mediumSolved}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xs text-muted-foreground w-12">Hard</span>
              <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-danger rounded-full" style={{ width: `${hardPct}%` }} />
              </div>
              <span className="text-2xs text-muted-foreground font-mono w-8 text-right">
                {hardSolved}
              </span>
            </div>
          </div>
        )}
      </MetricCard>

      {/* Codeforces Rating — real data when connected */}
      <MetricCard
        id="metric-cf-rating"
        title="Codeforces Rating"
        value={cfStats?.rating != null ? String(cfStats.rating) : '—'}
        subvalue={
          cfStats
            ? `${cfStats.rank ? cfStats.rank : 'Unrated'}${cfStats.maxRating != null ? ` · Max ${cfStats.maxRating}` : ''}${cfStats.problemsSolved != null && cfStats.problemsSolved > 0 ? ` · ${cfStats.problemsSolved} solved` : ''}`
            : 'Connect Codeforces to see rating'
        }
        trend={
          cfStats?.rating != null ? { direction: 'neutral', label: cfStats.rank ?? '' } : undefined
        }
        icon={Zap}
        iconColor="bg-codeforces/15 text-codeforces"
        bgAccent="#1890ff"
      />

      {/* GitHub PRs Merged — real data when connected */}
      <MetricCard
        id="metric-gh-prs"
        title="GitHub PRs Merged"
        value={ghStats ? String(ghStats.recentPRsMerged) : '—'}
        subvalue={
          ghStats
            ? `${ghStats.publicRepos} repos · ${ghStats.totalStars} stars`
            : 'Connect GitHub to see stats'
        }
        trend={
          ghStats && ghStats.recentPRsMerged > 0
            ? { direction: 'up', label: 'Recent activity' }
            : undefined
        }
        icon={GitPullRequest}
        iconColor="bg-github/10 text-github"
        bgAccent="#e6edf3"
      />

      {/* LeetCode Streak */}
      <MetricCard
        id="metric-lc-streak"
        title="LeetCode Streak"
        value={lcStats ? String(streak) : '—'}
        subvalue={lcStats ? 'days consecutive' : 'Connect LeetCode to see streak'}
        trend={lcStats && streak > 0 ? { direction: 'up', label: 'Keep it up!' } : undefined}
        icon={Flame}
        iconColor="bg-warning/15 text-warning"
        bgAccent="#f59e0b"
      >
        {lcStats && streak > 0 && (
          <div className="streak-active rounded-lg px-3 py-2 text-center">
            <p className="text-xs text-muted-foreground">Next milestone</p>
            <p className="text-sm font-bold text-primary tabular-nums">{nextMilestone} days</p>
          </div>
        )}
      </MetricCard>

      {/* Total Active Days */}
      <MetricCard
        id="metric-active-days"
        title="Total Active Days"
        value={lcStats ? String(activeDays) : '—'}
        subvalue={lcStats ? 'active days on LeetCode' : 'Connect LeetCode to see activity'}
        trend={lcStats && activeDays > 0 ? { direction: 'up', label: 'This year' } : undefined}
        icon={CalendarDays}
        iconColor="bg-info/15 text-info"
        bgAccent="#818cf8"
      >
        {contestRating !== null && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Contest Rating</span>
            <span className="font-mono text-foreground">{contestRating}</span>
          </div>
        )}
      </MetricCard>
    </div>
  );
}
