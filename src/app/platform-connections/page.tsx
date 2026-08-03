import React from 'react';
import AppLayout from '@/components/AppLayout';
import PlatformConnectionsHeader from './components/PlatformConnectionsHeader';
import PlatformCardList from './components/PlatformCardList';
import SyncEventTimeline from './components/SyncEventTimeline';

export default function PlatformConnectionsPage() {
  return (
    <AppLayout activePath="/platform-connections">
      <div className="px-6 py-6 xl:px-8 xl:py-7 2xl:px-10 2xl:py-8 max-w-screen-2xl mx-auto space-y-6">
        <PlatformConnectionsHeader />
        <PlatformCardList />
        <SyncEventTimeline />
      </div>
    </AppLayout>
  );
}