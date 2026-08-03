'use client';

import React from 'react';
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';

const data = [
  { name: 'Hard', value: 37, fill: 'var(--danger)' },
  { name: 'Medium', value: 168, fill: 'var(--warning)' },
  { name: 'Easy', value: 142, fill: 'var(--success)' },
];

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: { name: string; value: number } }> }) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    return (
      <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-xl">
        <p className="text-xs text-muted-foreground">{d.name}</p>
        <p className="text-sm font-bold text-foreground font-mono">{d.value} problems</p>
      </div>
    );
  }
  return null;
};

export default function LeetCodeDifficultyChart() {
  return (
    <div className="bg-card border border-border rounded-xl p-5 h-72 flex flex-col">
      <div className="mb-3">
        <p className="text-sm font-semibold text-foreground">LeetCode Distribution</p>
        <p className="text-xs text-muted-foreground">347 problems solved by difficulty</p>
      </div>
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="30%"
            outerRadius="90%"
            data={data}
            startAngle={90}
            endAngle={-270}
          >
            <RadialBar
              dataKey="value"
              cornerRadius={4}
              background={{ fill: 'var(--secondary)' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: '11px', color: 'var(--muted-foreground)' }}
            />
          </RadialBarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}