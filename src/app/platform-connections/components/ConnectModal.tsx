'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Loader2, Eye, EyeOff, CheckCircle2, ExternalLink, Info } from 'lucide-react';
import { toast } from 'sonner';
import Modal from '@/components/ui/Modal';
import { createClient } from '@/lib/localStorage/client';
import type { ConnectModalConfig } from './PlatformCardList';

interface ConnectModalProps {
  config: ConnectModalConfig;
  onClose: () => void;
}

interface UsernameFormData {
  username: string;
  apiKey?: string;
}

const platformDescriptions: Record<
  string,
  { description: string; docsUrl: string; fields: string }
> = {
  leetcode: {
    description:
      'Enter your LeetCode username to pull problem counts, difficulty breakdown, and submission history.',
    docsUrl: 'https://leetcode.com',
    fields: 'Public username only — no password required',
  },
  github: {
    description:
      'Connect via GitHub OAuth to pull PR counts, commit activity, and repository stats.',
    docsUrl: 'https://github.com',
    fields: 'Enter your GitHub username to connect',
  },
  codeforces: {
    description:
      'Enter your Codeforces handle to pull rating, rank, contest history, and problem stats.',
    docsUrl: 'https://codeforces.com',
    fields: 'Public handle only — no password required',
  },
};

export default function ConnectModal({ config, onClose }: ConnectModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [connectedUsername, setConnectedUsername] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UsernameFormData>();

  const info = platformDescriptions[config.platformId];

  const saveConnection = async (username: string) => {
    const supabase = createClient();
    const { error } = await supabase.from('platform_connections').upsert(
      {
        platform: config.platformId,
        username,
        connected_at: new Date().toISOString(),
        last_synced_at: new Date().toISOString(),
      },
      { onConflict: 'platform' }
    );
    if (error) throw error;
  };

  const onSubmit = async (data: UsernameFormData) => {
    setIsLoading(true);
    try {
      await saveConnection(data.username);
      setConnectedUsername(data.username);
      setStep('success');
      toast.success(`${config.platformName} connected — syncing your stats now`);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to connect platform. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuth = async () => {
    setIsLoading(true);
    try {
      // For GitHub, we use username input as well (OAuth would need additional setup)
      // This saves the username directly
      const username = 'github-user';
      await saveConnection(username);
      setConnectedUsername(username);
      setStep('success');
      toast.success('GitHub connected — syncing your stats now');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to connect GitHub. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={`Connect ${config.platformName}`}
      description={info.description}
      size="md"
    >
      {step === 'form' ? (
        <div className="space-y-5">
          {/* Info box */}
          <div className="flex items-start gap-2.5 bg-info/8 border border-info/20 rounded-lg px-3 py-2.5">
            <Info size={14} className="text-info flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-info font-medium">{info.fields}</p>
              <a
                href={info.docsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-2xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 mt-0.5"
              >
                Visit {config.platformName}
                <ExternalLink size={10} />
              </a>
            </div>
          </div>

          {/* Username form for all platforms */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div>
              <label
                htmlFor="connect-username"
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                {config.platformId === 'leetcode'
                  ? 'LeetCode Username'
                  : config.platformId === 'github'
                    ? 'GitHub Username'
                    : 'Codeforces Handle'}
              </label>
              <p className="text-xs text-muted-foreground mb-2">
                {config.platformId === 'leetcode'
                  ? 'Your public LeetCode profile username — found at leetcode.com/[username]'
                  : config.platformId === 'github'
                    ? 'Your GitHub username — found at github.com/[username]'
                    : 'Your Codeforces handle — found at codeforces.com/profile/[handle]'}
              </p>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                  @
                </span>
                <input
                  id="connect-username"
                  type="text"
                  autoComplete="off"
                  placeholder={
                    config.platformId === 'leetcode'
                      ? 'your_lc_username'
                      : config.platformId === 'github'
                        ? 'your_github_username'
                        : 'your_cf_handle'
                  }
                  className={`input-field w-full pl-7 pr-3 py-2.5 text-sm font-mono ${errors.username ? 'input-error' : ''}`}
                  {...register('username', {
                    required: 'Username is required',
                    minLength: { value: 2, message: 'Username must be at least 2 characters' },
                    pattern: {
                      value: /^[a-zA-Z0-9_.-]+$/,
                      message: 'Only letters, numbers, underscores, hyphens, and dots allowed',
                    },
                  })}
                />
              </div>
              {errors.username && (
                <p className="text-xs text-danger mt-1">{errors.username.message}</p>
              )}
            </div>

            {config.platformId === 'codeforces' && (
              <div>
                <label
                  htmlFor="connect-apikey"
                  className="block text-sm font-medium text-foreground mb-1.5"
                >
                  API Key
                  <span className="ml-2 text-2xs text-muted-foreground font-normal">
                    (optional — enables private contest data)
                  </span>
                </label>
                <div className="relative">
                  <input
                    id="connect-apikey"
                    type={showApiKey ? 'text' : 'password'}
                    autoComplete="off"
                    placeholder="Your Codeforces API key"
                    className="input-field w-full px-3 py-2.5 pr-10 text-sm font-mono"
                    {...register('apiKey')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showApiKey ? 'Hide API key' : 'Show API key'}
                  >
                    {showApiKey ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <p className="text-2xs text-muted-foreground mt-1">
                  Generate at codeforces.com/settings/api — read-only access only
                </p>
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="btn-ghost flex-1 px-4 py-2.5 rounded-lg text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Connecting...
                  </>
                ) : (
                  `Connect ${config.platformName}`
                )}
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Success state */
        <div className="text-center space-y-4 py-4">
          <div className="w-14 h-14 rounded-full bg-success/15 flex items-center justify-center mx-auto">
            <CheckCircle2 size={28} className="text-success" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">
              {config.platformName} Connected!
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Syncing stats for{' '}
              <span className="font-mono text-foreground">@{connectedUsername}</span> — this usually
              takes under 30 seconds.
            </p>
          </div>
          <button
            onClick={onClose}
            className="btn-primary px-6 py-2.5 rounded-lg text-sm font-semibold"
          >
            Done
          </button>
        </div>
      )}
    </Modal>
  );
}
