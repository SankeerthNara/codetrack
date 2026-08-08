'use client';

import React, { useState, useEffect, useCallback } from 'react';
import LeetCodeCard from './platform-cards/LeetCodeCard';
import GitHubCard from './platform-cards/GitHubCard';
import CodeforcesCard from './platform-cards/CodeforcesCard';
import ConnectModal from './ConnectModal';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type PlatformId = 'leetcode' | 'github' | 'codeforces';

export interface ConnectModalConfig {
  platformId: PlatformId;
  platformName: string;
  authType: 'username' | 'oauth' | 'token';
}

export interface PlatformConnection {
  platform: PlatformId;
  username: string;
  connected_at: string;
  last_synced_at: string | null;
}

export default function PlatformCardList() {
  const { user } = useAuth();
  const [modalConfig, setModalConfig] = useState<ConnectModalConfig | null>(null);
  const [connections, setConnections] = useState<PlatformConnection[]>([]);
  const [loading, setLoading] = useState(true);

  const loadConnections = useCallback(async () => {
    if (!user) return;
    const supabase = createClient();
    const { data, error } = await supabase
      .from('platform_connections')
      .select('platform, username, connected_at, last_synced_at')
      .eq('user_id', user.id);
    if (!error && data) {
      setConnections(data as PlatformConnection[]);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadConnections();
  }, [loadConnections]);

  const getConnection = (platform: PlatformId) =>
    connections.find((c) => c.platform === platform) || null;

  const openModal = (config: ConnectModalConfig) => setModalConfig(config);
  const closeModal = () => {
    setModalConfig(null);
    loadConnections();
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-5">
        <LeetCodeCard
          onConnect={() =>
            openModal({ platformId: 'leetcode', platformName: 'LeetCode', authType: 'username' })
          }
          connection={getConnection('leetcode')}
          loading={loading}
        />
        <GitHubCard
          onConnect={() =>
            openModal({ platformId: 'github', platformName: 'GitHub', authType: 'oauth' })
          }
          connection={getConnection('github')}
          loading={loading}
        />
        <CodeforcesCard
          onConnect={() =>
            openModal({
              platformId: 'codeforces',
              platformName: 'Codeforces',
              authType: 'username',
            })
          }
          connection={getConnection('codeforces')}
          loading={loading}
        />
      </div>

      {modalConfig && <ConnectModal config={modalConfig} onClose={closeModal} />}
    </>
  );
}
