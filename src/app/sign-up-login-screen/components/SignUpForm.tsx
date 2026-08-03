'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2, AlertCircle, Code2, GitPullRequest, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface SignUpFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  terms: boolean;
}

interface SignUpFormProps {
  onSwitchToLogin: () => void;
}

export default function SignUpForm({ onSwitchToLogin }: SignUpFormProps) {
  const router = useRouter();
  const { signUp } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignUpFormData>();

  const passwordValue = watch('password', '');

  const passwordStrength = (pw: string): { level: number; label: string; color: string } => {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    if (score <= 1) return { level: score, label: 'Weak', color: 'bg-danger' };
    if (score === 2) return { level: score, label: 'Fair', color: 'bg-warning' };
    if (score === 3) return { level: score, label: 'Good', color: 'bg-info' };
    return { level: score, label: 'Strong', color: 'bg-success' };
  };

  const strength = passwordStrength(passwordValue);

  const onSubmit = async (data: SignUpFormData) => {
    setIsLoading(true);
    setAuthError('');
    try {
      await signUp(data.email, data.password, { fullName: data.fullName });
      toast.success(`Welcome to CodeTrack, ${data.fullName.split(' ')[0]}! Connect your first platform to get started.`);
      router.push('/platform-connections');
      router.refresh();
    } catch (error: any) {
      setAuthError(error?.message || 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Create your account</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track LeetCode, GitHub, and Codeforces in one place
        </p>
      </div>

      {/* Platform icons */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-leetcode/10 border border-leetcode/20">
          <Code2 size={13} className="text-leetcode" />
          <span className="text-2xs font-medium text-leetcode">LeetCode</span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-github/8 border border-github/15">
          <GitPullRequest size={13} className="text-github" />
          <span className="text-2xs font-medium text-github">GitHub</span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-codeforces/10 border border-codeforces/20">
          <Zap size={13} className="text-codeforces" />
          <span className="text-2xs font-medium text-codeforces">Codeforces</span>
        </div>
      </div>

      {/* OAuth */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          className="btn-ghost flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Google
        </button>
        <button
          type="button"
          className="btn-ghost flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium"
        >
          <svg className="w-4 h-4 text-foreground" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
          GitHub
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted-foreground">or sign up with email</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Auth error */}
      {authError && (
        <div className="flex items-start gap-2.5 bg-danger/10 border border-danger/20 rounded-lg px-3 py-2.5">
          <AlertCircle size={15} className="text-danger flex-shrink-0 mt-0.5" />
          <p className="text-sm text-danger">{authError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Full name */}
        <div>
          <label htmlFor="signup-name" className="block text-sm font-medium text-foreground mb-1.5">
            Full name
          </label>
          <input
            id="signup-name"
            type="text"
            autoComplete="name"
            placeholder="Your Name"
            className={`input-field w-full px-3 py-2.5 text-sm ${errors.fullName ? 'input-error' : ''}`}
            {...register('fullName', {
              required: 'Full name is required',
              minLength: { value: 2, message: 'Name must be at least 2 characters' },
            })}
          />
          {errors.fullName && (
            <p className="text-xs text-danger mt-1">{errors.fullName.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="signup-email" className="block text-sm font-medium text-foreground mb-1.5">
            Email address
          </label>
          <input
            id="signup-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            className={`input-field w-full px-3 py-2.5 text-sm ${errors.email ? 'input-error' : ''}`}
            {...register('email', {
              required: 'Email is required',
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email address' },
            })}
          />
          {errors.email && (
            <p className="text-xs text-danger mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label htmlFor="signup-password" className="block text-sm font-medium text-foreground mb-1.5">
            Password
          </label>
          <p className="text-xs text-muted-foreground mb-1.5">
            Use at least 8 characters with a mix of letters, numbers, and symbols
          </p>
          <div className="relative">
            <input
              id="signup-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Create a strong password"
              className={`input-field w-full px-3 py-2.5 pr-10 text-sm ${errors.password ? 'input-error' : ''}`}
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 8, message: 'Password must be at least 8 characters' },
              })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-danger mt-1">{errors.password.message}</p>
          )}
          {/* Strength indicator */}
          {passwordValue.length > 0 && (
            <div className="mt-2 space-y-1">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((lvl) => (
                  <div
                    key={`strength-${lvl}`}
                    className={`flex-1 h-1 rounded-full transition-all duration-300 ${
                      lvl <= strength.level ? strength.color : 'bg-secondary'
                    }`}
                  />
                ))}
              </div>
              <p className={`text-xs font-medium ${
                strength.level <= 1 ? 'text-danger' :
                strength.level === 2 ? 'text-warning' :
                strength.level === 3 ? 'text-info' : 'text-success'
              }`}>
                {strength.label} password
              </p>
            </div>
          )}
        </div>

        {/* Confirm password */}
        <div>
          <label htmlFor="signup-confirm" className="block text-sm font-medium text-foreground mb-1.5">
            Confirm password
          </label>
          <div className="relative">
            <input
              id="signup-confirm"
              type={showConfirm ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Re-enter your password"
              className={`input-field w-full px-3 py-2.5 pr-10 text-sm ${errors.confirmPassword ? 'input-error' : ''}`}
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (val) => val === passwordValue || 'Passwords do not match',
              })}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
            >
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-danger mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Terms */}
        <div>
          <div className="flex items-start gap-2">
            <input
              id="terms"
              type="checkbox"
              className="w-4 h-4 rounded accent-primary mt-0.5"
              {...register('terms', { required: 'You must accept the terms to continue' })}
            />
            <label htmlFor="terms" className="text-sm text-muted-foreground">
              I agree to the{' '}
              <button type="button" className="text-primary hover:text-primary/80 transition-colors">
                Terms of Service
              </button>{' '}
              and{' '}
              <button type="button" className="text-primary hover:text-primary/80 transition-colors">
                Privacy Policy
              </button>
            </label>
          </div>
          {errors.terms && (
            <p className="text-xs text-danger mt-1">{errors.terms.message}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isLoading ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              <span>Creating account...</span>
            </>
          ) : (
            'Create Account'
          )}
        </button>
      </form>

      {/* Switch to login */}
      <p className="text-sm text-center text-muted-foreground">
        Already have an account?{' '}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-primary hover:text-primary/80 font-medium transition-colors"
        >
          Sign in
        </button>
      </p>
    </div>
  );
}