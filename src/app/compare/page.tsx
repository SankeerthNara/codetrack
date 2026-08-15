'use client';

import React, { useCallback, useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { Users, Plus, X, Code2, GitPullRequest, Zap } from 'lucide-react';
import { createClient } from '@/lib/localStorage/client';
import {
  getCompareProfiles,
  addCompareProfile,
  removeCompareProfile,
  type CompareProfile,
} from '@/lib/localApi/compareProfiles';
import { fetchLeetCodeStats, type LeetCodeApiResult } from '@/lib/localApi/leetcode';
import { fetchGitHubStats, type GitHubApiResult } from '@/lib/localApi/github';
import { fetchCodeforcesStats, type CodeforcesApiResult } from '@/lib/localApi/codeforces';

interface Participant {
  id: string;
  label: string;
  isYou?: boolean;
  leetcode?: string;
  github?: string;
  codeforces?: string;
}

type FetchState<T> = { loading: boolean; error: string | null; data: T | null };

function initState<T>(): FetchState<T> {
  return { loading: true, error: null, data: null };
}

function AddProfileForm({ onAdd }: { onAdd: (p: Omit<CompareProfile, 'id'>) => void }) {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState('');
  const [leetcode, setLeetcode] = useState('');
  const [github, setGithub] = useState('');
  const [codeforces, setCodeforces] = useState('');

  const reset = () => {
    setLabel('');
    setLeetcode('');
    setGithub('');
    setCodeforces('');
    setOpen(false);
  };

  const handleSubmit = () => {
    if (!label.trim()) return;
    if (!leetcode.trim() && !github.trim() && !codeforces.trim()) return;
    onAdd({
      label: label.trim(),
      leetcode: leetcode.trim() || undefined,
      github: github.trim() || undefined,
      codeforces: codeforces.trim() || undefined,
    });
    reset();
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="btn-primary inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold"
      >
        <Plus size={16} />
        Add someone to compare
      </button>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-3">
      <input
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder="Name (e.g. Priya, Alex...)"
        className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
      />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <input
          value={leetcode}
          onChange={(e) => setLeetcode(e.target.value)}
          placeholder="LeetCode username"
          className="px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <input
          value={github}
          onChange={(e) => setGithub(e.target.value)}
          placeholder="GitHub username"
          className="px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <input
          value={codeforces}
          onChange={(e) => setCodeforces(e.target.value)}
          placeholder="Codeforces handle"
          className="px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>
      <p className="text-2xs text-muted-foreground">
        Fill in at least one platform — leave the others blank if you don't need them.
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={handleSubmit}
          disabled={!label.trim() || (!leetcode.trim() && !github.trim() && !codeforces.trim())}
          className="btn-primary px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
        >
          Add
        </button>
        <button
          onClick={reset}
          className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-secondary transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function StatCard({
  label,
  isYou,
  loading,
  error,
  children,
}: {
  label: string;
  isYou?: boolean;
  loading: boolean;
  error: string | null;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`flex-shrink-0 w-44 rounded-xl border p-4 space-y-3 ${
        isYou ? 'border-primary/50 bg-primary/5 card-glow-emerald' : 'border-border bg-card'
      }`}
    >
      <p className={`text-sm font-semibold truncate ${isYou ? 'text-primary' : 'text-foreground'}`}>
        {isYou ? 'You' : label}
      </p>
      {loading ? (
        <div className="animate-pulse space-y-2">
          <div className="h-6 w-16 bg-secondary rounded" />
          <div className="h-3 w-20 bg-secondary rounded" />
        </div>
      ) : error ? (
        <p className="text-2xs text-danger">{error}</p>
      ) : (
        children
      )}
    </div>
  );
}

function PlatformSection({
  title,
  icon: Icon,
  iconColor,
  participants,
  usernameKey,
  states,
  renderStats,
}: {
  title: string;
  icon: React.ElementType;
  iconColor: string;
  participants: Participant[];
  usernameKey: 'leetcode' | 'github' | 'codeforces';
  states: Record<string, FetchState<unknown>>;
  renderStats: (data: unknown) => React.ReactNode;
}) {
  const relevant = participants.filter((p) => p[usernameKey]);
  if (relevant.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${iconColor}`}>
          <Icon size={14} />
        </div>
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-thin">
        {relevant.map((p) => {
          const state = states[`${usernameKey}:${p.id}`] ?? { loading: true, error: null, data: null };
          return (
            <StatCard key={p.id} label={p.label} isYou={p.isYou} loading={state.loading} error={state.error}>
              {state.data ? renderStats(state.data) : null}
            </StatCard>
          );
        })}
      </div>
    </div>
  );
}

export default function ComparePage() {
  const [profiles, setProfiles] = useState<CompareProfile[]>([]);
  const [you, setYou] = useState<{ leetcode?: string; github?: string; codeforces?: string }>({});
  const [states, setStates] = useState<Record<string, FetchState<unknown>>>({});

  useEffect(() => {
    setProfiles(getCompareProfiles());

    const loadYou = async () => {
      const supabase = createClient();
      const { data } = await supabase.from('platform_connections').select('platform, username');
      const map: Record<string, string> = {};
      (data ?? []).forEach((row: { platform: string; username: string }) => {
        map[row.platform] = row.username;
      });
      setYou({ leetcode: map.leetcode, github: map.github, codeforces: map.codeforces });
    };
    loadYou();
  }, []);

  const participants: Participant[] = [
    { id: 'you', label: 'You', isYou: true, ...you },
    ...profiles.map((p) => ({ id: p.id, label: p.label, leetcode: p.leetcode, github: p.github, codeforces: p.codeforces })),
  ];

  const fetchAll = useCallback((list: Participant[]) => {
    list.forEach((p) => {
      (['leetcode', 'github', 'codeforces'] as const).forEach((platform) => {
        const username = p[platform];
        if (!username) return;
        const key = `${platform}:${p.id}`;
        setStates((prev) => ({ ...prev, [key]: initState() }));

        const fetcher =
          platform === 'leetcode'
            ? fetchLeetCodeStats
            : platform === 'github'
              ? fetchGitHubStats
              : fetchCodeforcesStats;

        fetcher(username)
          .then((data) => {
            setStates((prev) => ({ ...prev, [key]: { loading: false, error: null, data } }));
          })
          .catch((err: Error) => {
            setStates((prev) => ({
              ...prev,
              [key]: { loading: false, error: err.message || 'Failed to load', data: null },
            }));
          });
      });
    });
  }, []);

  useEffect(() => {
    if (participants.length > 0 && (you.leetcode || you.github || you.codeforces || profiles.length > 0)) {
      fetchAll(participants);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profiles, you]);

  const handleAdd = (profile: Omit<CompareProfile, 'id'>) => {
    const added = addCompareProfile(profile);
    setProfiles((prev) => [...prev, added]);
  };

  const handleRemove = (id: string) => {
    removeCompareProfile(id);
    setProfiles((prev) => prev.filter((p) => p.id !== id));
    setStates((prev) => {
      const next = { ...prev };
      delete next[`leetcode:${id}`];
      delete next[`github:${id}`];
      delete next[`codeforces:${id}`];
      return next;
    });
  };

  const hasAnyPlatform = you.leetcode || you.github || you.codeforces || profiles.length > 0;

  return (
    <AppLayout activePath="/compare">
      <div className="px-6 py-6 xl:px-8 xl:py-7 2xl:px-10 2xl:py-8 max-w-screen-lg mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Users size={18} className="text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">Compare</h1>
            <p className="text-xs text-muted-foreground">
              See how your stats stack up against friends, platform by platform
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between flex-wrap gap-3">
          <AddProfileForm onAdd={handleAdd} />
        </div>

        {profiles.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {profiles.map((p) => (
              <span
                key={p.id}
                className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1 rounded-full bg-secondary text-xs text-foreground"
              >
                {p.label}
                <button
                  onClick={() => handleRemove(p.id)}
                  aria-label={`Remove ${p.label}`}
                  className="p-0.5 rounded-full hover:bg-border transition-colors"
                >
                  <X size={11} />
                </button>
              </span>
            ))}
          </div>
        )}

        {!hasAnyPlatform ? (
          <div className="bg-card border border-border rounded-xl px-5 py-10 text-center">
            <p className="text-sm text-muted-foreground">
              Connect your own platforms and add a friend above to see a side-by-side comparison.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            <PlatformSection
              title="LeetCode"
              icon={Code2}
              iconColor="bg-leetcode/15 text-leetcode"
              participants={participants}
              usernameKey="leetcode"
              states={states}
              renderStats={(raw) => {
                const data = raw as LeetCodeApiResult;
                return (
                  <div className="space-y-1">
                    <p className="text-xl font-bold text-foreground tabular-nums">
                      {data.solved.total}
                    </p>
                    <p className="text-2xs text-muted-foreground">problems solved</p>
                    <div className="flex items-center justify-between text-2xs pt-1">
                      <span className="text-muted-foreground">Streak</span>
                      <span className="font-medium text-foreground">{data.calendar.streak}d</span>
                    </div>
                  </div>
                );
              }}
            />

            <PlatformSection
              title="GitHub"
              icon={GitPullRequest}
              iconColor="bg-github/10 text-github"
              participants={participants}
              usernameKey="github"
              states={states}
              renderStats={(raw) => {
                const data = raw as GitHubApiResult;
                return (
                  <div className="space-y-1">
                    <p className="text-xl font-bold text-foreground tabular-nums">
                      {data.recentPRsMerged}
                    </p>
                    <p className="text-2xs text-muted-foreground">PRs merged</p>
                    <div className="flex items-center justify-between text-2xs pt-1">
                      <span className="text-muted-foreground">Repos</span>
                      <span className="font-medium text-foreground">{data.publicRepos}</span>
                    </div>
                  </div>
                );
              }}
            />

            <PlatformSection
              title="Codeforces"
              icon={Zap}
              iconColor="bg-codeforces/15 text-codeforces"
              participants={participants}
              usernameKey="codeforces"
              states={states}
              renderStats={(raw) => {
                const data = raw as CodeforcesApiResult;
                return (
                  <div className="space-y-1">
                    <p className="text-xl font-bold text-foreground tabular-nums">
                      {data.rating ?? '—'}
                    </p>
                    <p className="text-2xs text-muted-foreground">
                      {data.rank ?? 'Unrated'} · {data.problemsSolved} solved
                    </p>
                  </div>
                );
              }}
            />
          </div>
        )}
      </div>
    </AppLayout>
  );
}
