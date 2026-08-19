'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import AppLayout from '@/components/AppLayout';
import { TrendingUp, Table2, BarChart3, Pencil, Check, X } from 'lucide-react';
import {
  fetchProgressData,
  bucketByDay,
  bucketByWeek,
  bucketByMonth,
  currentWeekTotal,
  currentMonthTotal,
  type DailyEntry,
  type Bucket,
} from '@/lib/localApi/progressData';
import { getProgressTargets, setProgressTargets, type ProgressTargets } from '@/lib/localApi/progressTargets';

type Range = 'day' | 'week' | 'month';
type View = 'chart' | 'table';

const RANGE_WINDOW: Record<Range, number> = { day: 30, week: 12, month: 6 };

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ dataKey: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const total = payload.reduce((sum, p) => sum + p.value, 0);
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-xl">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="text-xs font-mono" style={{ color: p.color }}>
          {p.dataKey === 'leetcode' ? 'LeetCode' : 'Codeforces'}: {p.value}
        </p>
      ))}
      <p className="text-xs font-bold text-foreground font-mono mt-0.5">Total: {total}</p>
    </div>
  );
}

function TargetCard({
  label,
  current,
  target,
  onSave,
}: {
  label: string;
  current: number;
  target: number | null;
  onSave: (value: number | null) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState(target != null ? String(target) : '');

  const pct = target && target > 0 ? Math.min(100, Math.round((current / target) * 100)) : null;

  const handleSave = () => {
    const parsed = inputValue.trim() === '' ? null : Math.max(0, parseInt(inputValue, 10) || 0);
    onSave(parsed);
    setEditing(false);
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-2xs font-semibold uppercase tracking-widest text-muted-foreground">
          {label}
        </p>
        {!editing ? (
          <button
            onClick={() => {
              setInputValue(target != null ? String(target) : '');
              setEditing(true);
            }}
            className="p-1 rounded-md hover:bg-secondary transition-colors text-muted-foreground"
            aria-label={`Edit ${label.toLowerCase()} target`}
          >
            <Pencil size={12} />
          </button>
        ) : (
          <div className="flex items-center gap-1">
            <button
              onClick={handleSave}
              className="p-1 rounded-md hover:bg-secondary transition-colors text-success"
              aria-label="Save target"
            >
              <Check size={13} />
            </button>
            <button
              onClick={() => setEditing(false)}
              className="p-1 rounded-md hover:bg-secondary transition-colors text-muted-foreground"
              aria-label="Cancel"
            >
              <X size={13} />
            </button>
          </div>
        )}
      </div>

      {editing ? (
        <input
          type="number"
          min={0}
          autoFocus
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          placeholder="No target set"
          className="w-full px-2.5 py-1.5 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        />
      ) : (
        <>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-foreground tabular-nums">{current}</span>
            {target != null && (
              <span className="text-sm text-muted-foreground tabular-nums">/ {target}</span>
            )}
          </div>
          {target != null ? (
            <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${pct === 100 ? 'bg-success' : 'bg-primary'}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          ) : (
            <p className="text-2xs text-muted-foreground">Tap the pencil to set a target</p>
          )}
        </>
      )}
    </div>
  );
}

export default function ProgressPage() {
  const [daily, setDaily] = useState<DailyEntry[]>([]);
  const [connected, setConnected] = useState({ leetcode: false, codeforces: false });
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<Range>('day');
  const [view, setView] = useState<View>('chart');
  const [targets, setTargets] = useState<ProgressTargets>({ weekly: null, monthly: null });

  const load = useCallback(async () => {
    setLoading(true);
    const data = await fetchProgressData();
    setDaily(data.daily);
    setConnected(data.connected);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    setTargets(getProgressTargets());
  }, [load]);

  const buckets: Bucket[] = useMemo(() => {
    const all =
      range === 'day' ? bucketByDay(daily) : range === 'week' ? bucketByWeek(daily) : bucketByMonth(daily);
    return all.slice(-RANGE_WINDOW[range]);
  }, [daily, range]);

  const weekCurrent = useMemo(() => currentWeekTotal(daily), [daily]);
  const monthCurrent = useMemo(() => currentMonthTotal(daily), [daily]);

  const handleSaveTarget = (key: 'weekly' | 'monthly', value: number | null) => {
    const next = { ...targets, [key]: value };
    setTargets(next);
    setProgressTargets(next);
  };

  const isConnected = connected.leetcode || connected.codeforces;

  return (
    <AppLayout activePath="/progress">
      <div className="px-6 py-6 xl:px-8 xl:py-7 2xl:px-10 2xl:py-8 max-w-screen-lg mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <TrendingUp size={18} className="text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">Progress</h1>
            <p className="text-xs text-muted-foreground">
              Problems solved over time, combined across LeetCode & Codeforces
            </p>
          </div>
        </div>

        {!isConnected && !loading ? (
          <div className="bg-card border border-border rounded-xl px-5 py-10 text-center">
            <p className="text-sm text-muted-foreground">
              Connect LeetCode or Codeforces to start tracking progress.
            </p>
          </div>
        ) : (
          <>
            {/* Targets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <TargetCard
                label="This Week"
                current={weekCurrent}
                target={targets.weekly}
                onSave={(v) => handleSaveTarget('weekly', v)}
              />
              <TargetCard
                label="This Month"
                current={monthCurrent}
                target={targets.monthly}
                onSave={(v) => handleSaveTarget('monthly', v)}
              />
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-1 bg-secondary rounded-lg p-1">
                {(['day', 'week', 'month'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setRange(r)}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold capitalize transition-colors ${
                      range === r
                        ? 'bg-card text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1 bg-secondary rounded-lg p-1">
                <button
                  onClick={() => setView('chart')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                    view === 'chart'
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <BarChart3 size={13} />
                  Chart
                </button>
                <button
                  onClick={() => setView('table')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                    view === 'table'
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Table2 size={13} />
                  Table
                </button>
              </div>
            </div>

            {/* Data */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="flex items-center gap-4 px-5 py-3 border-b border-border">
                <span className="flex items-center gap-1.5 text-2xs text-muted-foreground">
                  <span className="w-2.5 h-2.5 rounded-sm bg-leetcode/70 inline-block" />
                  LeetCode
                </span>
                <span className="flex items-center gap-1.5 text-2xs text-muted-foreground">
                  <span className="w-2.5 h-2.5 rounded-sm bg-codeforces/70 inline-block" />
                  Codeforces
                </span>
              </div>

              {loading ? (
                <div className="h-72 flex items-center justify-center">
                  <div className="animate-pulse text-sm text-muted-foreground">Loading…</div>
                </div>
              ) : buckets.length === 0 ? (
                <div className="h-72 flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">No activity in this range yet</p>
                </div>
              ) : view === 'chart' ? (
                <div className="h-72 px-2 py-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={buckets} margin={{ top: 0, right: 8, bottom: 0, left: -20 }} barGap={2}>
                      <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                      <XAxis
                        dataKey="label"
                        tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                        axisLine={false}
                        tickLine={false}
                        interval={range === 'day' ? 4 : 0}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                        axisLine={false}
                        tickLine={false}
                        allowDecimals={false}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar
                        dataKey="leetcode"
                        stackId="a"
                        fill="var(--leetcode)"
                        fillOpacity={0.8}
                        radius={[0, 0, 0, 0]}
                      />
                      <Bar
                        dataKey="codeforces"
                        stackId="a"
                        fill="var(--codeforces)"
                        fillOpacity={0.8}
                        radius={[3, 3, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left font-semibold text-2xs uppercase tracking-widest text-muted-foreground px-5 py-3">
                          Period
                        </th>
                        <th className="text-right font-semibold text-2xs uppercase tracking-widest text-muted-foreground px-3 py-3">
                          LeetCode
                        </th>
                        <th className="text-right font-semibold text-2xs uppercase tracking-widest text-muted-foreground px-3 py-3">
                          Codeforces
                        </th>
                        <th className="text-right font-semibold text-2xs uppercase tracking-widest text-muted-foreground px-5 py-3">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {[...buckets].reverse().map((b) => (
                        <tr key={b.key} className="hover:bg-secondary/40 transition-colors">
                          <td className="px-5 py-2.5 text-foreground">{b.label}</td>
                          <td className="px-3 py-2.5 text-right font-mono text-leetcode">
                            {b.leetcode}
                          </td>
                          <td className="px-3 py-2.5 text-right font-mono text-codeforces">
                            {b.codeforces}
                          </td>
                          <td className="px-5 py-2.5 text-right font-mono font-semibold text-foreground">
                            {b.total}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <p className="text-2xs text-muted-foreground">
              Codeforces counts are exact (first accepted submission per problem). LeetCode counts
              reflect daily submission activity — LeetCode's public data doesn't expose distinct
              solved-problem counts per day beyond recent history.
            </p>
          </>
        )}
      </div>
    </AppLayout>
  );
}
