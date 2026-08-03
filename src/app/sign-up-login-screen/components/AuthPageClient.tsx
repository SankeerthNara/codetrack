'use client';

import React, { useState } from 'react';
import LoginForm from './LoginForm';
import SignUpForm from './SignUpForm';
import AuthBrandPanel from './AuthBrandPanel';

export default function AuthPageClient() {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');

  return (
    <div className="min-h-screen bg-background flex">
      {/* Brand panel — left */}
      <AuthBrandPanel />

      {/* Form panel — right */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 lg:px-12 xl:px-16 2xl:px-20 min-h-screen">
        <div className="w-full max-w-md">
          {/* Logo (mobile only) */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <span className="text-primary text-sm font-bold font-mono">CT</span>
            </div>
            <span className="font-bold text-foreground text-lg">ProgressTracker</span>
          </div>

          {/* Tabs */}
          <div className="flex bg-secondary rounded-xl p-1 mb-8">
            <button
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
                activeTab === 'login' ?'bg-card text-foreground shadow-sm' :'text-muted-foreground hover:text-foreground'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setActiveTab('signup')}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
                activeTab === 'signup' ?'bg-card text-foreground shadow-sm' :'text-muted-foreground hover:text-foreground'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Form */}
          <div className="animate-fade-in">
            {activeTab === 'login' ? (
              <LoginForm onSwitchToSignup={() => setActiveTab('signup')} />
            ) : (
              <SignUpForm onSwitchToLogin={() => setActiveTab('login')} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}