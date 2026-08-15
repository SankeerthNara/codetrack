'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { Bell } from 'lucide-react';
import GitHubNotificationsTab from './components/GitHubNotificationsTab';

const tabs = [{ id: 'github', label: 'GitHub' }] as const;

type TabId = (typeof tabs)[number]['id'];

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('github');

  return (
    <AppLayout activePath="/notifications">
      <div className="px-6 py-6 xl:px-8 xl:py-7 2xl:px-10 2xl:py-8 max-w-screen-md mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Bell size={18} className="text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">Notifications</h1>
            <p className="text-xs text-muted-foreground">Stay on top of activity across your platforms</p>
          </div>
        </div>

        <div className="flex items-center gap-1 border-b border-border">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ${
                activeTab === tab.id
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'github' && <GitHubNotificationsTab />}
      </div>
    </AppLayout>
  );
}
