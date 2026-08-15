'use client';

import React, { useState, useEffect, useCallback } from 'react';
import AppLayout from '@/components/AppLayout';
import {
  Code2,
  GitPullRequest,
  Zap,
  Link2,
  Unlink,
  RefreshCw,
  ExternalLink,
  TrendingUp,
  Users,
  Flame,
  Trophy,
  Target,
  Activity,
} from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { createClient } from '@/lib/supabase/client';
import ConnectModal from '@/app/platform-connections/components/ConnectModal';
import type {
  ConnectModalConfig,
  PlatformConnection,
} from '@/app/platform-connections/components/PlatformCardList';
import { toast } from 'sonner';
import Icon from '@/components/ui/AppIcon';

// ─── Types ────────────────────────────────────────────────────────────────────

interface LeetCodeStats {
  solved: { total: number; easy: number; medium: number; hard: number };
  calendar: { streak: number; totalActiveDays: number };
  contest: { rating: number; globalRanking: number; topPercentage: number } | null;
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
}

interface PlatformData {
  connection: PlatformConnection | null;
  loading: boolean;
  error: string | null;
}

// ─── Aggregated Stat Card ─────────────────────────────────────────────────────

interface AggStatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  iconClass: string;
  accentClass: string;
  skeleton?: boolean;
}

function AggStatCard({
  label,
  value,
  sub,
  icon: Icon,
  iconClass,
  accentClass,
  skeleton,
}: AggStatCardProps) {
  if (skeleton) {
    return (
      <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-2 animate-pulse">
        <div className="w-8 h-8 rounded-lg bg-secondary" />
        <div className="h-3 w-20 bg-secondary rounded mt-1" />
        <div className="h-7 w-14 bg-secondary rounded" />
        <div className="h-2.5 w-24 bg-secondary rounded" />
      </div>
    );
  }
  return (
    <div
      className={`bg-card border border-border rounded-xl p-4 flex flex-col gap-1 hover:border-primary/30 transition-all duration-200 relative overflow-hidden`}
    >
      <div
        className={`absolute top-0 right-0 w-24 h-24 rounded-full opacity-5 blur-2xl pointer-events-none ${accentClass}`}
      />
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconClass}`}>
        <Icon size={16} />
      </div>
      <p className="text-2xs font-semibold uppercase tracking-widest text-muted-foreground mt-1">
        {label}
      </p>
      <p className="text-2xl font-bold text-foreground font-mono tabular-nums">{value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

// ─── Platform Row Card ────────────────────────────────────────────────────────

interface PlatformRowProps {
  name: string;
  description: string;
  icon: React.ReactNode;
  accentBorder: string;
  connection: PlatformConnection | null;
  loading: boolean;
  stats: React.ReactNode;
  onConnect: () => void;
  onDisconnect: () => void;
  onResync: () => void;
  isSyncing: boolean;
  profileUrl?: string;
}

function PlatformRow({
  name,
  description,
  icon,
  accentBorder,
  connection,
  loading,
  stats,
  onConnect,
  onDisconnect,
  onResync,
  isSyncing,
  profileUrl,
}: PlatformRowProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-xl p-5 animate-pulse flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-secondary" />
          <div className="flex-1 space-y-1.5">
            <div className="h-4 w-24 bg-secondary rounded" />
            <div className="h-3 w-36 bg-secondary rounded" />
          </div>
          <div className="h-6 w-20 bg-secondary rounded-full" />
        </div>
        <div className="grid grid-cols-3 gap-2 mt-1">
          <div className="h-14 bg-secondary rounded-lg" />
          <div className="h-14 bg-secondary rounded-lg" />
          <div className="h-14 bg-secondary rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-card border rounded-xl overflow-hidden transition-all duration-200 ${connection ? `${accentBorder} hover:border-opacity-60` : 'border-border'}`}
    >
      {/* Header row */}
      <div className="px-5 pt-5 pb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {icon}
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-foreground">{name}</h3>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {connection ? (
            <>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-mono text-muted-foreground">
                  @{connection.username}
                </span>
                {profileUrl && (
                  <a
                    href={profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    <ExternalLink size={11} />
                  </a>
                )}
              </div>
              <Badge variant="success" dot>
                Connected
              </Badge>
            </>
          ) : (
            <Badge variant="muted" dot>
              Not Connected
            </Badge>
          )}
        </div>
      </div>

      {/* Stats or connect CTA */}
      {connection ? (
        <div className="px-5 pb-4">{stats}</div>
      ) : (
        <div className="px-5 pb-5 flex items-center justify-between gap-3 bg-secondary/30 mx-5 mb-5 rounded-lg px-4 py-3">
          <p className="text-xs text-muted-foreground">Connect to see your stats here</p>
          <button
            onClick={onConnect}
            className="btn-primary flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold flex-shrink-0"
          >
            <Link2 size={12} />
            Connect
          </button>
        </div>
      )}

      {/* Actions (only when connected) */}
      {connection && (
        <div className="px-5 pb-4 flex items-center gap-2 border-t border-border pt-3">
          <button
            onClick={onResync}
            disabled={isSyncing}
            className="btn-ghost flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium disabled:opacity-60"
          >
            <RefreshCw size={12} className={isSyncing ? 'animate-spin' : ''} />
            {isSyncing ? 'Syncing…' : 'Re-sync'}
          </button>
          <div className="flex-1" />
          {!showConfirm ? (
            <button
              onClick={() => setShowConfirm(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-danger hover:bg-danger/10 transition-all"
            >
              <Unlink size={12} />
              Disconnect
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-danger">Confirm disconnect?</span>
              <button
                onClick={() => setShowConfirm(false)}
                className="px-2.5 py-1 rounded-md text-xs bg-secondary text-foreground hover:bg-border transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDisconnect();
                  setShowConfirm(false);
                }}
                className="px-2.5 py-1 rounded-md text-xs bg-danger/20 text-danger hover:bg-danger/30 transition-colors font-semibold"
              >
                Disconnect
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ConnectedPlatformsPage() {
  const [connections, setConnections] = useState<PlatformConnection[]>([]);
  const [connectionsLoading, setConnectionsLoading] = useState(true);
  const [modalConfig, setModalConfig] = useState<ConnectModalConfig | null>(null);

  const [lcStats, setLcStats] = useState<LeetCodeStats | null>(null);
  const [lcLoading, setLcLoading] = useState(false);

  const [ghStats, setGhStats] = useState<GitHubStats | null>(null);
  const [ghLoading, setGhLoading] = useState(false);

  const [cfStats, setCfStats] = useState<CodeforcesStats | null>(null);
  const [cfLoading, setCfLoading] = useState(false);

  const [syncingPlatform, setSyncingPlatform] = useState<string | null>(null);

  // ── Load connections ──────────────────────────────────────────────────────
  const loadConnections = useCallback(async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('platform_connections')
      .select('platform, username, connected_at, last_synced_at');
    if (!error && data) {
      setConnections(data as PlatformConnection[]);
    }
    setConnectionsLoading(false);
  }, []);

  useEffect(() => {
    loadConnections();
  }, [loadConnections]);

  // ── Fetch stats when connections load ────────────────────────────────────
  const fetchLCStats = useCallback(async (username: string) => {
    setLcLoading(true);
    try {
      const res = await fetch(`/api/leetcode?username=${encodeURIComponent(username)}`);
      if (res.ok) setLcStats(await res.json());
    } catch {
      /* silent */
    } finally {
      setLcLoading(false);
    }
  }, []);

  const fetchGHStats = useCallback(async (username: string) => {
    setGhLoading(true);
    try {
      const res = await fetch(`/api/github?username=${encodeURIComponent(username)}`);
      if (res.ok) {
        const d = await res.json();
        setGhStats({
          publicRepos: d.publicRepos ?? 0,
          totalStars: d.totalStars ?? 0,
          recentPRsMerged: d.recentPRsMerged ?? 0,
          followers: d.followers ?? 0,
        });
      }
    } catch {
      /* silent */
    } finally {
      setGhLoading(false);
    }
  }, []);

  const fetchCFStats = useCallback(async (handle: string) => {
    setCfLoading(true);
    try {
      const res = await fetch(`/api/codeforces?handle=${encodeURIComponent(handle)}`);
      if (res.ok) {
        const d = await res.json();
        setCfStats({
          rating: d.rating ?? null,
          maxRating: d.maxRating ?? null,
          rank: d.rank ?? null,
        });
      }
    } catch {
      /* silent */
    } finally {
      setCfLoading(false);
    }
  }, []);

  useEffect(() => {
    const lc = connections.find((c) => c.platform === 'leetcode');
    const gh = connections.find((c) => c.platform === 'github');
    const cf = connections.find((c) => c.platform === 'codeforces');
    if (lc?.username) fetchLCStats(lc.username);
    if (gh?.username) fetchGHStats(gh.username);
    if (cf?.username) fetchCFStats(cf.username);
  }, [connections, fetchLCStats, fetchGHStats, fetchCFStats]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const getConn = (platform: string) => connections.find((c) => c.platform === platform) ?? null;

  const handleDisconnect = async (platform: string) => {
    const supabase = createClient();
    await supabase.from('platform_connections').delete().eq('platform', platform);
    toast.success(`${platform.charAt(0).toUpperCase() + platform.slice(1)} disconnected`);
    setConnections((prev) => prev.filter((c) => c.platform !== platform));
    if (platform === 'leetcode') setLcStats(null);
    if (platform === 'github') setGhStats(null);
    if (platform === 'codeforces') setCfStats(null);
  };

  const handleResync = async (platform: string) => {
    setSyncingPlatform(platform);
    const conn = getConn(platform);
    if (conn?.username) {
      if (platform === 'leetcode') await fetchLCStats(conn.username);
      if (platform === 'github') await fetchGHStats(conn.username);
      if (platform === 'codeforces') await fetchCFStats(conn.username);
      const supabase = createClient();
      await supabase
        .from('platform_connections')
        .update({ last_synced_at: new Date().toISOString() })
        .eq('platform', platform);
      toast.success(`${platform.charAt(0).toUpperCase() + platform.slice(1)} stats refreshed`);
    }
    setSyncingPlatform(null);
  };

  const connectedCount = connections.length;
  const statsLoading = connectionsLoading;

  // ── Aggregated numbers ────────────────────────────────────────────────────
  const totalSolved = lcStats?.solved.total ?? 0;
  const streak = lcStats?.calendar.streak ?? 0;
  const prsTotal = ghStats?.recentPRsMerged ?? 0;
  const cfRating = cfStats?.rating ?? null;

  return (
    <AppLayout activePath="/connected-platforms">
      <div className="px-6 py-6 xl:px-8 xl:py-7 2xl:px-10 2xl:py-8 max-w-screen-xl mx-auto space-y-7">
        {/* ── Page Header ─────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-foreground tracking-tight">
              Connected Platforms
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Aggregated stats across all your coding platforms — manage connections in one place.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="flex items-center gap-1.5 bg-secondary px-3 py-1.5 rounded-lg">
              <Activity size={13} className="text-primary" />
              <span className="text-xs font-semibold text-foreground">
                {connectedCount} / 3 Connected
              </span>
            </div>
          </div>
        </div>

        {/* ── Aggregated Stats Bento ───────────────────────────────────────── */}
        <section>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Aggregated Overview
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <AggStatCard
              label="Problems Solved"
              value={totalSolved || '—'}
              sub={
                lcStats
                  ? `${lcStats.solved.easy}E · ${lcStats.solved.medium}M · ${lcStats.solved.hard}H`
                  : 'LeetCode'
              }
              icon={Code2}
              iconClass="bg-leetcode/15 text-leetcode"
              accentClass="bg-leetcode"
              skeleton={statsLoading || lcLoading}
            />
            <AggStatCard
              label="Current Streak"
              value={streak ? `${streak}d` : '—'}
              sub={lcStats ? `${lcStats.calendar.totalActiveDays} active days` : 'LeetCode'}
              icon={Flame}
              iconClass="bg-orange-500/15 text-orange-500"
              accentClass="bg-orange-500"
              skeleton={statsLoading || lcLoading}
            />
            <AggStatCard
              label="Contest Rating"
              value={lcStats?.contest?.rating ? Math.round(lcStats.contest.rating) : '—'}
              sub={
                lcStats?.contest ? `Top ${lcStats.contest.topPercentage.toFixed(1)}%` : 'LeetCode'
              }
              icon={Trophy}
              iconClass="bg-yellow-500/15 text-yellow-500"
              accentClass="bg-yellow-500"
              skeleton={statsLoading || lcLoading}
            />
            <AggStatCard
              label="PRs Merged"
              value={prsTotal || '—'}
              sub={ghStats ? `${ghStats.publicRepos} repos · ${ghStats.totalStars}★` : 'GitHub'}
              icon={GitPullRequest}
              iconClass="bg-github/10 text-github"
              accentClass="bg-github"
              skeleton={statsLoading || ghLoading}
            />
            <AggStatCard
              label="GitHub Followers"
              value={ghStats?.followers ?? '—'}
              sub={ghStats ? `${ghStats.publicRepos} public repos` : 'GitHub'}
              icon={Users}
              iconClass="bg-github/10 text-github"
              accentClass="bg-github"
              skeleton={statsLoading || ghLoading}
            />
            <AggStatCard
              label="CF Rating"
              value={cfRating ?? '—'}
              sub={cfStats?.rank ?? 'Codeforces'}
              icon={Zap}
              iconClass="bg-codeforces/15 text-codeforces"
              accentClass="bg-codeforces"
              skeleton={statsLoading || cfLoading}
            />
          </div>
        </section>

        {/* ── Platform Cards ───────────────────────────────────────────────── */}
        <section>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Platform Connections
          </p>
          <div className="space-y-4">
            {/* LeetCode */}
            <PlatformRow
              name="LeetCode"
              description="Algorithm practice platform"
              icon={
                <div className="w-10 h-10 rounded-xl bg-leetcode/15 flex items-center justify-center flex-shrink-0">
                  <Code2 size={20} className="text-leetcode" />
                </div>
              }
              accentBorder="border-leetcode/30"
              connection={getConn('leetcode')}
              loading={connectionsLoading}
              profileUrl={
                getConn('leetcode')
                  ? `https://leetcode.com/${getConn('leetcode')!.username}`
                  : undefined
              }
              onConnect={() =>
                setModalConfig({
                  platformId: 'leetcode',
                  platformName: 'LeetCode',
                  authType: 'username',
                })
              }
              onDisconnect={() => handleDisconnect('leetcode')}
              onResync={() => handleResync('leetcode')}
              isSyncing={syncingPlatform === 'leetcode'}
              stats={
                lcLoading ? (
                  <div className="grid grid-cols-3 gap-2 animate-pulse">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="h-14 bg-secondary rounded-lg" />
                    ))}
                  </div>
                ) : lcStats ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-success/10 border border-success/20 rounded-lg px-2 py-2.5 text-center">
                        <p className="text-base font-bold text-success font-mono">
                          {lcStats.solved.easy}
                        </p>
                        <p className="text-2xs text-muted-foreground">Easy</p>
                      </div>
                      <div className="bg-warning/10 border border-warning/20 rounded-lg px-2 py-2.5 text-center">
                        <p className="text-base font-bold text-warning font-mono">
                          {lcStats.solved.medium}
                        </p>
                        <p className="text-2xs text-muted-foreground">Medium</p>
                      </div>
                      <div className="bg-danger/10 border border-danger/20 rounded-lg px-2 py-2.5 text-center">
                        <p className="text-base font-bold text-danger font-mono">
                          {lcStats.solved.hard}
                        </p>
                        <p className="text-2xs text-muted-foreground">Hard</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Flame size={12} className="text-orange-400" />
                        {lcStats.calendar.streak}d streak
                      </span>
                      <span className="flex items-center gap-1">
                        <Target size={12} className="text-primary" />
                        {lcStats.solved.total} total solved
                      </span>
                      {lcStats.contest && (
                        <span className="flex items-center gap-1">
                          <Trophy size={12} className="text-yellow-500" />
                          Rating {Math.round(lcStats.contest.rating)}
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Stats unavailable — try re-syncing
                  </p>
                )
              }
            />

            {/* GitHub */}
            <PlatformRow
              name="GitHub"
              description="Code hosting & collaboration"
              icon={
                <div className="w-10 h-10 rounded-xl bg-github/8 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-github" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                </div>
              }
              accentBorder="border-github/25"
              connection={getConn('github')}
              loading={connectionsLoading}
              profileUrl={
                getConn('github') ? `https://github.com/${getConn('github')!.username}` : undefined
              }
              onConnect={() =>
                setModalConfig({ platformId: 'github', platformName: 'GitHub', authType: 'oauth' })
              }
              onDisconnect={() => handleDisconnect('github')}
              onResync={() => handleResync('github')}
              isSyncing={syncingPlatform === 'github'}
              stats={
                ghLoading ? (
                  <div className="grid grid-cols-4 gap-2 animate-pulse">
                    {[0, 1, 2, 3].map((i) => (
                      <div key={i} className="h-14 bg-secondary rounded-lg" />
                    ))}
                  </div>
                ) : ghStats ? (
                  <div className="grid grid-cols-4 gap-2">
                    <div className="bg-secondary/60 rounded-lg px-2 py-2.5 text-center">
                      <p className="text-base font-bold text-foreground font-mono">
                        {ghStats.publicRepos}
                      </p>
                      <p className="text-2xs text-muted-foreground">Repos</p>
                    </div>
                    <div className="bg-secondary/60 rounded-lg px-2 py-2.5 text-center">
                      <p className="text-base font-bold text-foreground font-mono">
                        {ghStats.totalStars}
                      </p>
                      <p className="text-2xs text-muted-foreground">Stars</p>
                    </div>
                    <div className="bg-secondary/60 rounded-lg px-2 py-2.5 text-center">
                      <p className="text-base font-bold text-foreground font-mono">
                        {ghStats.recentPRsMerged}
                      </p>
                      <p className="text-2xs text-muted-foreground">PRs Merged</p>
                    </div>
                    <div className="bg-secondary/60 rounded-lg px-2 py-2.5 text-center">
                      <p className="text-base font-bold text-foreground font-mono">
                        {ghStats.followers}
                      </p>
                      <p className="text-2xs text-muted-foreground">Followers</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Stats unavailable — try re-syncing
                  </p>
                )
              }
            />

            {/* Codeforces */}
            <PlatformRow
              name="Codeforces"
              description="Competitive programming"
              icon={
                <div className="w-10 h-10 rounded-xl bg-codeforces/15 flex items-center justify-center flex-shrink-0">
                  <Zap size={20} className="text-codeforces" />
                </div>
              }
              accentBorder="border-codeforces/30"
              connection={getConn('codeforces')}
              loading={connectionsLoading}
              profileUrl={
                getConn('codeforces')
                  ? `https://codeforces.com/profile/${getConn('codeforces')!.username}`
                  : undefined
              }
              onConnect={() =>
                setModalConfig({
                  platformId: 'codeforces',
                  platformName: 'Codeforces',
                  authType: 'username',
                })
              }
              onDisconnect={() => handleDisconnect('codeforces')}
              onResync={() => handleResync('codeforces')}
              isSyncing={syncingPlatform === 'codeforces'}
              stats={
                cfLoading ? (
                  <div className="grid grid-cols-3 gap-2 animate-pulse">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="h-14 bg-secondary rounded-lg" />
                    ))}
                  </div>
                ) : cfStats ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-codeforces/10 border border-codeforces/20 rounded-lg px-2 py-2.5 text-center">
                        <p className="text-base font-bold text-codeforces font-mono">
                          {cfStats.rating ?? '—'}
                        </p>
                        <p className="text-2xs text-muted-foreground">Rating</p>
                      </div>
                      <div className="bg-secondary/60 rounded-lg px-2 py-2.5 text-center">
                        <p className="text-base font-bold text-foreground font-mono">
                          {cfStats.maxRating ?? '—'}
                        </p>
                        <p className="text-2xs text-muted-foreground">Max Rating</p>
                      </div>
                      <div className="bg-secondary/60 rounded-lg px-2 py-2.5 text-center">
                        <p className="text-xs font-bold text-foreground capitalize leading-tight mt-1">
                          {cfStats.rank ?? '—'}
                        </p>
                        <p className="text-2xs text-muted-foreground">Rank</p>
                      </div>
                    </div>
                    {cfStats.rating && cfStats.maxRating && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <TrendingUp size={12} className="text-success" />
                        <span>
                          Peak rating:{' '}
                          <span className="font-mono text-foreground">{cfStats.maxRating}</span>
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Stats unavailable — try re-syncing
                  </p>
                )
              }
            />
          </div>
        </section>
      </div>

      {/* Connect Modal */}
      {modalConfig && (
        <ConnectModal
          config={modalConfig}
          onClose={() => {
            setModalConfig(null);
            loadConnections();
          }}
        />
      )}
    </AppLayout>
  );
}
