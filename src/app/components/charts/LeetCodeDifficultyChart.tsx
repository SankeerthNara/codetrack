'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { RadialBarChart, RadialBar, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { createClient } from '@/lib/localStorage/client';

interface DifficultyData {
  name: string;
  value: number;
  fill: string;
}

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: { name: string; value: number } }>;
}) => {
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
  const [data, setData] = useState<DifficultyData[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [notConnected, setNotConnected] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data: conn } = await supabase
        .from('platform_connections')
        .select('username')
        .eq('platform', 'leetcode')
        .single();

      if (!conn?.username) {
        setLoading(false);
        setNotConnected(true);
        return;
      }

      const res = await fetch(`/api/leetcode?username=${encodeURIComponent(conn.username)}`);
      if (res.ok) {
        const json = await res.json();
        const easy = json.solved?.easy ?? 0;
        const medium = json.solved?.medium ?? 0;
        const hard = json.solved?.hard ?? 0;
        const totalSolved = json.solved?.total ?? easy + medium + hard;
        setTotal(totalSolved);
        setData([
          { name: 'Hard', value: hard, fill: 'var(--danger)' },
          { name: 'Medium', value: medium, fill: 'var(--warning)' },
          { name: 'Easy', value: easy, fill: 'var(--success)' },
        ]);
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

  return (
    <div className="bg-card border border-border rounded-xl p-5 h-72 flex flex-col">
      <div className="mb-3">
        <p className="text-sm font-semibold text-foreground">LeetCode Distribution</p>
        <p className="text-xs text-muted-foreground">
          {loading
            ? 'Loading...'
            : notConnected
              ? 'Connect LeetCode to see data'
              : `${total} problems solved by difficulty`}
        </p>
      </div>
      <div className="flex-1">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : notConnected || data.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-xs text-muted-foreground">No data available</p>
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
}
