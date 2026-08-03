'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// Backend integration point: replace with GitHub GraphQL API contributions data
const weeklyCommits = [
  { week: 'Jun 2', commits: 12, prs: 1 },
  { week: 'Jun 9', commits: 28, prs: 3 },
  { week: 'Jun 16', commits: 9, prs: 0 },
  { week: 'Jun 23', commits: 34, prs: 2 },
  { week: 'Jun 30', commits: 41, prs: 4 },
  { week: 'Jul 7', commits: 22, prs: 2 },
  { week: 'Jul 14', commits: 37, prs: 3 },
  { week: 'Jul 21', commits: 18, prs: 1 },
  { week: 'Jul 28', commits: 46, prs: 5 },
  { week: 'Aug 4', commits: 31, prs: 2 },
];

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg px-3 py-2.5 shadow-xl space-y-1">
        <p className="text-xs text-muted-foreground font-medium">Week of {label}</p>
        {payload.map((p) => (
          <div key={`tooltip-${p.name}`} className="flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ backgroundColor: p.color }} />
            <span className="text-muted-foreground capitalize">{p.name}:</span>
            <span className="font-bold font-mono text-foreground">{p.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function GitHubCommitsChart() {
  return (
    <div className="bg-card border border-border rounded-xl p-5 h-56 flex flex-col">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-sm font-semibold text-foreground">GitHub Weekly Activity</p>
          <p className="text-xs text-muted-foreground">Commits and PRs merged over the last 10 weeks</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="w-2.5 h-2.5 rounded-sm bg-github/70 inline-block" />
            Commits
          </span>
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="w-2.5 h-2.5 rounded-sm bg-primary/70 inline-block" />
            PRs merged
          </span>
        </div>
      </div>
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={weeklyCommits} margin={{ top: 0, right: 0, bottom: 0, left: -20 }} barGap={2}>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="week"
              tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="commits" fill="var(--github)" fillOpacity={0.7} radius={[3, 3, 0, 0]} />
            <Bar dataKey="prs" fill="var(--primary)" fillOpacity={0.9} radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}