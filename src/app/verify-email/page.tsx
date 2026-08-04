'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Mail, RefreshCw, ArrowLeft, CheckCircle2, AlertTriangle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get('email') || '';
  const fromLogin = searchParams.get('from') === 'login';
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleResend = async () => {
    if (!email || resending || cooldown > 0) return;
    setResending(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
      setResent(true);
      setCooldown(60);
      toast.success('Verification email resent! Check your inbox.');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to resend. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-card border border-border rounded-2xl p-8 shadow-lg text-center">
          {/* Icon */}
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center ${fromLogin ? 'bg-warning/10' : 'bg-primary/10'}`}>
                {fromLogin ? (
                  <AlertTriangle size={36} className="text-warning" />
                ) : (
                  <Mail size={36} className="text-primary" />
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-success flex items-center justify-center border-2 border-card">
                <CheckCircle2 size={14} className="text-white" />
              </div>
            </div>
          </div>

          {/* Heading */}
          {fromLogin ? (
            <>
              <h1 className="text-2xl font-bold text-foreground mb-2">Email not verified</h1>
              <p className="text-muted-foreground text-sm leading-relaxed mb-2">
                You need to verify your email before you can sign in.
              </p>
              {email && (
                <p className="text-foreground font-semibold text-sm mb-4 break-all">{email}</p>
              )}
              <p className="text-muted-foreground text-sm leading-relaxed mb-8">
                Please check your inbox for the verification link we sent when you signed up, or request a new one below.
              </p>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-foreground mb-2">Check your inbox</h1>
              <p className="text-muted-foreground text-sm leading-relaxed mb-2">
                We sent a verification link to
              </p>
              {email && (
                <p className="text-foreground font-semibold text-sm mb-4 break-all">{email}</p>
              )}
              <p className="text-muted-foreground text-sm leading-relaxed mb-8">
                Click the link in the email to verify your account and start using CodeTrack.
              </p>
            </>
          )}

          {/* Steps */}
          <div className="bg-secondary/50 rounded-xl p-4 mb-8 text-left space-y-3">
            {[
              { step: '1', text: 'Open the email from CodeTrack' },
              { step: '2', text: 'Click the "Confirm your email" button' },
              { step: '3', text: "You'll be redirected to your dashboard" },
            ].map(({ step, text }) => (
              <div key={step} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-primary">{step}</span>
                </div>
                <span className="text-sm text-muted-foreground">{text}</span>
              </div>
            ))}
          </div>

          {/* Resend */}
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">Didn&apos;t receive the email? Check your spam folder or</p>
            <button
              onClick={handleResend}
              disabled={resending || cooldown > 0}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resending ? (
                <RefreshCw size={15} className="animate-spin" />
              ) : (
                <RefreshCw size={15} />
              )}
              {cooldown > 0 ? `Resend in ${cooldown}s` : resent ? 'Resend again' : 'Resend verification email'}
            </button>

            <button
              onClick={() => router.push('/sign-up-login-screen')}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft size={15} />
              Back to Sign In
            </button>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-muted-foreground mt-4">
          The verification link expires in 1 hour. Request a new one if needed.
        </p>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
