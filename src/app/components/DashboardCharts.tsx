'use client';

import dynamic from 'next/dynamic';
import React from 'react';
import { Skeleton } from '@/components/ui/LoadingSkeleton';

const LeetCodeDifficultyChart = dynamic(() => import('./charts/LeetCodeDifficultyChart'), {
  ssr: false,
  loading: () => <Skeleton className="h-72 w-full" />,
});

const CodeforcesRatingChart = dynamic(() => import('./charts/CodeforcesRatingChart'), {
  ssr: false,
  loading: () => <Skeleton className="h-72 w-full" />,
});

const GitHubCommitsChart = dynamic(() => import('./charts/GitHubCommitsChart'), {
  ssr: false,
  loading: () => <Skeleton className="h-72 w-full" />,
});

export default function DashboardCharts() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-4">
      <div className="lg:col-span-1">
        <LeetCodeDifficultyChart />
      </div>
      <div className="lg:col-span-2">
        <CodeforcesRatingChart />
      </div>
      <div className="lg:col-span-3">
        <GitHubCommitsChart />
      </div>
    </div>
  );
}
