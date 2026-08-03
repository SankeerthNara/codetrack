'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Loader2, Eye, EyeOff, CheckCircle2, ExternalLink, Info } from 'lucide-react';
import { toast } from 'sonner';
import Modal from '@/components/ui/Modal';
import type { ConnectModalConfig } from './PlatformCardList';

interface ConnectModalProps {
  config: ConnectModalConfig;
  onClose: () => void;
}

interface UsernameFormData {
  username: string;
  apiKey?: string;
}

const platformDescriptions: Record<string, { description: string; docsUrl: string; fields: string }> = {
  leetcode: {
    description: 'Enter your LeetCode username to pull problem counts, difficulty breakdown, and submission history.',
    docsUrl: 'https://leetcode.com',
    fields: 'Public username only — no password required',
  },
  github: {
    description: 'Connect via GitHub OAuth to pull PR counts, commit activity, and repository stats.',
    docsUrl: 'https://github.com',
    fields: 'OAuth flow — you will be redirected to GitHub to authorize',
  },
  codeforces: {
    description: 'Enter your Codeforces handle to pull rating, rank, contest history, and problem stats.',
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

  // Backend integration point: POST /api/connections/connect with platformId + credentials
  const onSubmit = async (data: UsernameFormData) => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1800));
    setConnectedUsername(data.username);
    setStep('success');
    setIsLoading(false);
    toast.success(`${config.platformName} connected — syncing your stats now`);
  };

  const handleOAuth = async () => {
    setIsLoading(true);
    // Backend integration point: redirect to GitHub OAuth flow
    await new Promise((r) => setTimeout(r, 1000));
    setConnectedUsername('arjun-kumar');
    setStep('success');
    setIsLoading(false);
    toast.success('GitHub connected via OAuth — syncing your stats now');
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

          {config.authType === 'oauth' ? (
            /* GitHub OAuth flow */
            <div className="space-y-4">
              <div className="bg-muted rounded-xl p-4 space-y-2">
                <p className="text-sm font-medium text-foreground">Authorization scope</p>
                <ul className="space-y-1.5">
                  {[
                    'Read public repositories',
                    'Read pull request data',
                    'Read commit history',
                    'Read contribution graph',
                  ].map((scope) => (
                    <li key={`scope-${scope.replace(/\s/g, '-').toLowerCase()}`} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CheckCircle2 size={12} className="text-success flex-shrink-0" />
                      {scope}
                    </li>
                  ))}
                </ul>
                <p className="text-2xs text-muted-foreground pt-1 border-t border-border">
                  CodeTrack will never write to your repositories or access private data.
                </p>
              </div>
              <button
                onClick={handleOAuth}
                disabled={isLoading}
                className="btn-primary w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                    Authorize with GitHub
                  </>
                )}
              </button>
            </div>
          ) : (
            /* Username form for LeetCode / Codeforces */
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <div>
                <label
                  htmlFor="connect-username"
                  className="block text-sm font-medium text-foreground mb-1.5"
                >
                  {config.platformId === 'leetcode' ? 'LeetCode Username' : 'Codeforces Handle'}
                </label>
                <p className="text-xs text-muted-foreground mb-2">
                  {config.platformId === 'leetcode' ?'Your public LeetCode profile username — found at leetcode.com/[username]' :'Your Codeforces handle — found at codeforces.com/profile/[handle]'}
                </p>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">@</span>
                  <input
                    id="connect-username"
                    type="text"
                    autoComplete="off"
                    placeholder={config.platformId === 'leetcode' ? 'your_lc_username' : 'your_cf_handle'}
                    className={`input-field w-full pl-7 pr-3 py-2.5 text-sm font-mono ${errors.username ? 'input-error' : ''}`}
                    {...register('username', {
                      required: 'Username is required',
                      minLength: { value: 2, message: 'Username must be at least 2 characters' },
                      pattern: {
                        value: /^[a-zA-Z0-9_\-\.]+$/,
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
                    <span className="ml-2 text-2xs text-muted-foreground font-normal">(optional — enables private contest data)</span>
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
          )}
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
              <span className="font-mono text-foreground">@{connectedUsername}</span>
              {' '}— this usually takes under 30 seconds.
            </p>
          </div>
          <div className="bg-muted rounded-lg px-4 py-3 text-sm text-muted-foreground">
            Your stats will appear on the dashboard once the first sync completes.
          </div>
          <button
            onClick={onClose}
            className="btn-primary w-full px-4 py-2.5 rounded-lg text-sm font-semibold"
          >
            Go to Dashboard
          </button>
        </div>
      )}
    </Modal>
  );
}