'use client';

import AppLayout from '@/components/AppLayout';
import { Trophy } from 'lucide-react';

export default function LeaderboardPage() {
  return (
    <AppLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Trophy size={32} className="text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Leaderboard</h1>
        <p className="text-muted-foreground text-sm text-center max-w-sm">
          Coming soon — compete with other developers and see how your coding stats rank globally.
        </p>
      </div>
    </AppLayout>
  );
}
