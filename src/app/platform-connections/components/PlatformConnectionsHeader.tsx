import React from 'react';
import { Link2, RefreshCw } from 'lucide-react';

export default function PlatformConnectionsHeader() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
            <Link2 size={16} className="text-primary" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">
            Platform Connections
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Connect your coding platforms to pull live stats into your dashboard. 2 of 3 platforms
          connected.
        </p>
      </div>
      <button className="btn-ghost inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium self-start sm:self-auto">
        <RefreshCw size={14} />
        Sync All Platforms
      </button>
    </div>
  );
}
