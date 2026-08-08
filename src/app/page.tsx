import React from 'react';
import AppLayout from '@/components/AppLayout';
import DashboardHeader from './components/DashboardHeader';
import MetricsBentoGrid from './components/MetricsBentoGrid';
import DashboardCharts from './components/DashboardCharts';
import ActivityFeed from './components/ActivityFeed';
import PlatformStatusRow from './components/PlatformStatusRow';
import InboxAndContests from './components/InboxAndContests';

export default function DashboardPage() {
  return (
    <AppLayout activePath="/">
      <div className="px-6 py-6 xl:px-8 xl:py-7 2xl:px-10 2xl:py-8 max-w-screen-2xl mx-auto space-y-6">
        <DashboardHeader />
        <PlatformStatusRow />
        <MetricsBentoGrid />
        <DashboardCharts />
        <InboxAndContests />
        <ActivityFeed />
      </div>
    </AppLayout>
  );
}
