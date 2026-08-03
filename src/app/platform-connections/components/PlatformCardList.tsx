'use client';

import React, { useState } from 'react';
import LeetCodeCard from './platform-cards/LeetCodeCard';
import GitHubCard from './platform-cards/GitHubCard';
import CodeforcesCard from './platform-cards/CodeforcesCard';
import ConnectModal from './ConnectModal';

export type PlatformId = 'leetcode' | 'github' | 'codeforces';

export interface ConnectModalConfig {
  platformId: PlatformId;
  platformName: string;
  authType: 'username' | 'oauth' | 'token';
}

export default function PlatformCardList() {
  const [modalConfig, setModalConfig] = useState<ConnectModalConfig | null>(null);

  const openModal = (config: ConnectModalConfig) => setModalConfig(config);
  const closeModal = () => setModalConfig(null);

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-5">
        <LeetCodeCard onConnect={() => openModal({ platformId: 'leetcode', platformName: 'LeetCode', authType: 'username' })} />
        <GitHubCard onConnect={() => openModal({ platformId: 'github', platformName: 'GitHub', authType: 'oauth' })} />
        <CodeforcesCard onConnect={() => openModal({ platformId: 'codeforces', platformName: 'Codeforces', authType: 'username' })} />
      </div>

      {modalConfig && (
        <ConnectModal
          config={modalConfig}
          onClose={closeModal}
        />
      )}
    </>
  );
}