'use client';

import React from 'react';
import Link from 'next/link';
import { RefreshCw, ExternalLink } from 'lucide-react';

export default function DashboardHeader() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">Good morning 👋</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Here&apos;s your coding progress across all connected platforms —
          <span className="text-primary font-medium"> connect your platforms to see live data</span>
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Link
          href="/platform-connections"
          className="btn-ghost inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium"
        >
          <ExternalLink size={14} />
          Manage Platforms
        </Link>
        <button className="btn-primary inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold">
          <RefreshCw size={14} />
          Sync Now
        </button>
      </div>
    </div>
  );
}
