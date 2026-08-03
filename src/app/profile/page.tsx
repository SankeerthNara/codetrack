'use client';

import AppLayout from '@/components/AppLayout';
import { User } from 'lucide-react';

export default function ProfilePage() {
  return (
    <AppLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
          <User size={32} className="text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Profile</h1>
        <p className="text-muted-foreground text-sm text-center max-w-sm">
          Coming soon — manage your public profile, bio, and connected platform usernames.
        </p>
      </div>
    </AppLayout>
  );
}
