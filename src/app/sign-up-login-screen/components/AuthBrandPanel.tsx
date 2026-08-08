import React from 'react';
import { Code2, GitPullRequest, Zap, CheckCircle2 } from 'lucide-react';

export default function AuthBrandPanel() {
  return (
    <div className="hidden lg:flex w-1/2 xl:w-5/12 bg-card border-r border-border flex-col justify-between p-10 xl:p-14 2xl:p-16 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-primary/5 blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-info/5 blur-3xl translate-x-1/2 translate-y-1/2" />
      </div>
      {/* Logo */}
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <span className="text-primary font-bold text-sm font-mono">CT</span>
          </div>
          <span className="font-bold text-foreground text-xl tracking-tight">ProgressTracker</span>
        </div>

        <h2 className="text-3xl xl:text-4xl font-bold text-foreground leading-tight tracking-tight mb-4">
          Your coding progress,
          <br />
          <span className="text-primary">unified.</span>
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
          Connect LeetCode, GitHub, and Codeforces. See all your stats, streaks, and ratings in one
          live dashboard.
        </p>
      </div>

      {/* Feature highlights */}
      <div className="relative z-10 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-leetcode/10 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Code2 size={17} className="text-leetcode" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">LeetCode</p>
            <p className="text-xs text-muted-foreground">
              Track problems solved by difficulty, streaks, and contest ratings
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-github/8 flex items-center justify-center flex-shrink-0 mt-0.5">
            <GitPullRequest size={17} className="text-github" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">GitHub</p>
            <p className="text-xs text-muted-foreground">
              Monitor commits, pull requests, and contribution activity
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-codeforces/10 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Zap size={17} className="text-codeforces" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Codeforces</p>
            <p className="text-xs text-muted-foreground">
              Follow your rating progression and competitive ranking
            </p>
          </div>
        </div>
      </div>

      {/* Social proof */}
      <div className="relative z-10">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <CheckCircle2 size={13} className="text-success" />
          <span>Free for everyone — connect your accounts and start tracking</span>
        </div>
      </div>
    </div>
  );
}
