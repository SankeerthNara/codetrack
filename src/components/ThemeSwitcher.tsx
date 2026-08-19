'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Monitor, Sun, Moon, Check } from 'lucide-react';
import { useTheme, type ThemePreference } from '@/context/ThemeContext';

const OPTIONS: Array<{ value: ThemePreference; label: string; icon: React.ElementType }> = [
  { value: 'system', label: 'System', icon: Monitor },
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
];

export default function ThemeSwitcher() {
  const { themePreference, resolvedTheme, setThemePreference } = useTheme();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const TriggerIcon =
    themePreference === 'system' ? Monitor : themePreference === 'dark' ? Moon : Sun;

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Change theme"
        aria-haspopup="true"
        aria-expanded={open}
        className="p-2 rounded-md hover:bg-secondary transition-colors"
      >
        <TriggerIcon size={18} className="text-muted-foreground" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-xl shadow-lg py-1.5 z-50 animate-fade-in">
          {OPTIONS.map(({ value, label, icon: OptionIcon }) => {
            const selected = themePreference === value;
            return (
              <button
                key={value}
                onClick={() => {
                  setThemePreference(value);
                  setOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 text-sm text-foreground hover:bg-secondary transition-colors"
              >
                <OptionIcon size={16} className="flex-shrink-0 text-muted-foreground" />
                <span className="flex-1 text-left">{label}</span>
                {value === 'system' && (
                  <span className="text-2xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {resolvedTheme}
                  </span>
                )}
                {selected && <Check size={14} className="text-primary flex-shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
