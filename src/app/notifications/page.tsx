'use client';

import AppLayout from '@/components/AppLayout';
import { Bell } from 'lucide-react';

export default function NotificationsPage() {
  return (
    <AppLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Bell size={32} className="text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
        <p className="text-muted-foreground text-sm text-center max-w-sm">
          Coming soon — get notified about contest reminders, streak alerts, and platform sync
          updates.
        </p>
      </div>
    </AppLayout>
  );
}
