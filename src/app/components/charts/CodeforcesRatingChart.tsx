'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { createClient } from '@/lib/supabase/client';

interface RatingPoint {
  contestName: string;
  date: string;
  rating: number;
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) => {
  if (active && payload && payload.length) {
    const val = payload[0].value;
    const rank =
      val >= 2400
        ? 'International Grandmaster'
        : val >= 2100
          ? 'Grandmaster'
          : val >= 1900
            ? 'Candidate Master'
            : val >= 1600
              ? 'Expert'
              : val >= 1400
                ? 'Specialist'
                : 'Pupil';
    return (
      <div className="bg-card border border-border rounded-lg px-3 py-2.5 shadow-xl">
        <p className="text-xs text-muted-foreground mb-1">{label}</p>
        <p className="text-base font-bold text-foreground font-mono tabular-nums">{val}</p>
        <p className="text-xs text-info mt-0.5">{rank}</p>
      </div>
    );
  }
  return null;
};

export default function CodeforcesRatingChart() {
  const [ratingHistory, setRatingHistory] = useState<RatingPoint[]>([]);
  const [currentRating, setCurrentRating] = useState<number | null>(null);
  const [maxRating, setMaxRating] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [notConnected, setNotConnected] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data: conn } = await supabase
        .from('platform_connections')
        .select('username')
        .eq('platform', 'codeforces')
        .single();

      if (!conn?.username) {
        setLoading(false);
        setNotConnected(true);
        return;
      }

      const res = await fetch(`/api/codeforces?handle=${encodeURIComponent(conn.username)}`);
      if (res.ok) {
        const json = await res.json();
        setCurrentRating(json.rating ?? null);
        setMaxRating(json.maxRating ?? null);
        setRatingHistory(json.ratingHistory ?? []);
      } else {
        setNotConnected(true);
      }
    } catch {
      setNotConnected(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const ratings = ratingHistory.map((r) => r.rating);
  const minRating = ratings.length > 0 ? Math.min(...ratings) - 100 : 1000;
  const maxRatingVal = ratings.length > 0 ? Math.max(...ratings) + 100 : 2000;

  return (
    <div className="bg-card border border-border rounded-xl p-5 h-72 flex flex-col">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-sm font-semibold text-foreground">Codeforces Rating History</p>
          <p className="text-xs text-muted-foreground">
            {loading
              ? 'Loading...'
              : notConnected
                ? 'Connect Codeforces to see data'
                : ratingHistory.length === 0
                  ? 'No contest history found'
                  : `Last ${ratingHistory.length} contests · Current: ${currentRating?.toLocaleString() ?? '—'}`}
          </p>
        </div>
        {!loading && !notConnected && ratingHistory.length > 0 && (
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span className="w-6 h-0.5 bg-codeforces inline-block rounded" />
              Rating
            </span>
            {maxRating && (
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span className="w-6 h-px border-dashed border-t border-warning inline-block" />
                Peak
              </span>
            )}
          </div>
        )}
      </div>
      <div className="flex-1">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : notConnected || ratingHistory.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-xs text-muted-foreground">
              {notConnected
                ? 'Connect Codeforces to see rating history'
                : 'No contest history found'}
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={ratingHistory} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[minRating, maxRatingVal]}
                tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              {maxRating && (
                <ReferenceLine
                  y={maxRating}
                  stroke="var(--warning)"
                  strokeDasharray="4 4"
                  strokeWidth={1}
                />
              )}
              <Line
                type="monotone"
                dataKey="rating"
                stroke="var(--codeforces)"
                strokeWidth={2}
                dot={{ fill: 'var(--codeforces)', r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5, fill: 'var(--codeforces)', strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
