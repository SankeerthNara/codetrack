import React from 'react';

type BadgeVariant =
  'success' | 'warning' | 'danger' | 'info' | 'muted' | 'leetcode' | 'github' | 'codeforces';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}

const variantClasses: Record<BadgeVariant, string> = {
  success: 'bg-success/10 text-success border border-success/20',
  warning: 'bg-warning/10 text-warning border border-warning/20',
  danger: 'bg-danger/10 text-danger border border-danger/20',
  info: 'bg-info/10 text-info border border-info/20',
  muted: 'bg-secondary text-muted-foreground border border-border',
  leetcode: 'platform-badge-leetcode',
  github: 'platform-badge-github',
  codeforces: 'platform-badge-codeforces',
};

export default function Badge({ variant = 'muted', children, className = '', dot }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium
        ${variantClasses[variant]}
        ${className}
      `}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
            variant === 'success'
              ? 'bg-success'
              : variant === 'warning'
                ? 'bg-warning'
                : variant === 'danger'
                  ? 'bg-danger'
                  : variant === 'info'
                    ? 'bg-info'
                    : 'bg-muted-foreground'
          }`}
        />
      )}
      {children}
    </span>
  );
}
