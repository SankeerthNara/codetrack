'use client';

import AppLayout from '@/components/AppLayout';
import { Settings } from 'lucide-react';

export default function SettingsPage() {
  return (
    <AppLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Settings size={32} className="text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground text-sm text-center max-w-sm">
          Coming soon — customize your theme, notification preferences, and account settings.
        </p>
      </div>
    </AppLayout>
  );
}
