'use client';

import React from 'react';
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

// Backend integration point: replace with real Codeforces API data
const ratingHistory = [
  { contest: 'Rd 860', date: 'Jan 8', rating: 1642 },
  { contest: 'Rd 862', date: 'Jan 22', rating: 1701 },
  { contest: 'Rd 865', date: 'Feb 5', rating: 1688 },
  { contest: 'Rd 869', date: 'Feb 19', rating: 1754 },
  { contest: 'Rd 873', date: 'Mar 4', rating: 1812 },
  { contest: 'Rd 877', date: 'Mar 18', rating: 1799 },
  { contest: 'Rd 880', date: 'Apr 1', rating: 1856 },
  { contest: 'Rd 883', date: 'Apr 15', rating: 1923 },
  { contest: 'Rd 887', date: 'May 6', rating: 1891 },
  { contest: 'Rd 890', date: 'May 20', rating: 1847 },
];

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
    const rank = val >= 1900 ? 'Candidate Master' : val >= 1600 ? 'Expert' : val >= 1400 ? 'Specialist' : 'Pupil';
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
  return (
    <div className="bg-card border border-border rounded-xl p-5 h-72 flex flex-col">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-sm font-semibold text-foreground">Codeforces Rating History</p>
          <p className="text-xs text-muted-foreground">Last 10 contests · Current: 1,847</p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="w-6 h-0.5 bg-codeforces inline-block rounded" />
            Rating
          </span>
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="w-6 h-px border-dashed border-t border-warning inline-block" />
            Peak
          </span>
        </div>
      </div>
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={ratingHistory} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
            <defs>
              <linearGradient id="cfRatingGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--codeforces)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--codeforces)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[1550, 1980]}
              tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={1923} stroke="var(--warning)" strokeDasharray="4 4" strokeWidth={1} />
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
      </div>
    </div>
  );
}