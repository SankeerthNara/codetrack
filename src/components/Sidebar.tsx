'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';
import {
  LayoutDashboard,
  Link2,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
  Bell,
  Trophy,
  Sun,
  Moon,
  BarChart3,
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import Icon from '@/components/ui/AppIcon';


interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
  group?: string;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard, group: 'main' },
  { label: 'Platform Connections', href: '/platform-connections', icon: Link2, group: 'main' },
  { label: 'Connected Platforms', href: '/connected-platforms', icon: BarChart3, group: 'main' },
  { label: 'Leaderboard', href: '/leaderboard', icon: Trophy, group: 'main' },
  { label: 'Notifications', href: '/notifications', icon: Bell, group: 'account' },
  { label: 'Profile', href: '/profile', icon: User, group: 'account' },
  { label: 'Settings', href: '/settings', icon: Settings, group: 'account' },
];

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  activePath: string;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export default function Sidebar({
  collapsed,
  onToggleCollapse,
  activePath,
  mobileOpen,
  onMobileClose,
}: SidebarProps) {
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const router = useRouter();
  const mainItems = navItems.filter((i) => i.group === 'main');
  const accountItems = navItems.filter((i) => i.group === 'account');

  const isActive = (href: string) => {
    if (href === '/') return activePath === '/';
    return activePath.startsWith(href);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/sign-up-login-screen');
      router.refresh();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  // Derive display name and initials from user
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const displayEmail = user?.email || '';
  const initials = displayName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const ThemeToggleButton = ({ showLabel }: { showLabel: boolean }) => (
    <button
      onClick={toggleTheme}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-all w-full ${collapsed && !showLabel ? 'justify-center px-0 w-10 mx-auto' : ''}`}
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {theme === 'dark' ? <Sun size={18} className="flex-shrink-0" /> : <Moon size={18} className="flex-shrink-0" />}
      {showLabel && <span className="truncate">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
      {collapsed && !showLabel && (
        <span className="absolute left-full ml-3 px-2 py-1 bg-secondary text-foreground text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 border border-border">
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </span>
      )}
    </button>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`
          hidden lg:flex flex-col border-r border-border bg-card
          transition-all duration-300 ease-in-out relative flex-shrink-0
          ${collapsed ? 'w-16' : 'w-60'}
        `}
      >
        {/* Logo */}
        <div className={`flex items-center gap-3 px-4 py-5 border-b border-border ${collapsed ? 'justify-center px-0' : ''}`}>
          <div className="flex items-center gap-2 min-w-0">
            <AppLogo size={28} />
            {!collapsed && (
              <span className="font-bold text-foreground text-base tracking-tight truncate">
                CodeTrack
              </span>
            )}
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 overflow-y-auto scrollbar-thin">
          {/* Main group */}
          {!collapsed && (
            <p className="px-4 mb-2 text-2xs font-semibold uppercase tracking-widest text-muted-foreground">
              Overview
            </p>
          )}
          <ul className="space-y-0.5 px-2">
            {mainItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <li key={`nav-${item.label.toLowerCase().replace(/\s/g, '-')}`}>
                  <Link
                    href={item.href}
                    className={`
                      sidebar-item flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium relative group
                      ${active ? 'sidebar-active' : 'text-muted-foreground'}
                      ${collapsed ? 'justify-center px-0 w-10 mx-auto' : ''}
                    `}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon size={18} className="flex-shrink-0" />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                    {collapsed && (
                      <span className="absolute left-full ml-3 px-2 py-1 bg-secondary text-foreground text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 border border-border">
                        {item.label}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          {!collapsed && (
            <p className="px-4 mt-5 mb-2 text-2xs font-semibold uppercase tracking-widest text-muted-foreground">
              Account
            </p>
          )}
          {collapsed && <div className="my-3 border-t border-border mx-2" />}
          <ul className="space-y-0.5 px-2">
            {accountItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <li key={`nav-${item.label.toLowerCase().replace(/\s/g, '-')}`}>
                  <Link
                    href={item.href}
                    className={`
                      sidebar-item flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium relative group
                      ${active ? 'sidebar-active' : 'text-muted-foreground'}
                      ${collapsed ? 'justify-center px-0 w-10 mx-auto' : ''}
                    `}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon size={18} className="flex-shrink-0" />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                    {collapsed && (
                      <span className="absolute left-full ml-3 px-2 py-1 bg-secondary text-foreground text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 border border-border">
                        {item.label}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Theme toggle in nav */}
          <div className="mt-3 border-t border-border mx-2 pt-3">
            <div className={`relative group ${collapsed ? 'flex justify-center' : 'px-0'}`}>
              <ThemeToggleButton showLabel={!collapsed} />
            </div>
          </div>
        </nav>

        {/* User + collapse */}
        <div className="border-t border-border">
          {!collapsed && (
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <span className="text-primary text-xs font-bold">{initials}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{displayName}</p>
                <p className="text-2xs text-muted-foreground truncate">{displayEmail}</p>
              </div>
              <button
                onClick={handleSignOut}
                className="p-1.5 rounded-md hover:bg-secondary transition-colors"
                title="Sign out"
              >
                <LogOut size={14} className="text-muted-foreground" />
              </button>
            </div>
          )}
          {collapsed && (
            <div className="flex flex-col items-center gap-2 py-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-primary text-xs font-bold">{initials}</span>
              </div>
            </div>
          )}
          <div className="px-2 pb-3">
            <button
              onClick={onToggleCollapse}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-all text-xs"
            >
              {collapsed ? <ChevronRight size={14} /> : (
                <>
                  <ChevronLeft size={14} />
                  <span>Collapse</span>
                </>
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile sidebar drawer */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border flex flex-col
          transform transition-transform duration-300 ease-in-out lg:hidden
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex items-center justify-between px-4 py-5 border-b border-border">
          <div className="flex items-center gap-2">
            <AppLogo size={28} />
            <span className="font-bold text-foreground text-base">CodeTrack</span>
          </div>
          <button
            onClick={onMobileClose}
            className="p-1.5 rounded-md hover:bg-secondary transition-colors"
          >
            <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 py-4 overflow-y-auto scrollbar-thin">
          <p className="px-4 mb-2 text-2xs font-semibold uppercase tracking-widest text-muted-foreground">
            Overview
          </p>
          <ul className="space-y-0.5 px-2">
            {mainItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <li key={`mobile-nav-${item.label.toLowerCase().replace(/\s/g, '-')}`}>
                  <Link
                    href={item.href}
                    onClick={onMobileClose}
                    className={`sidebar-item flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${active ? 'sidebar-active' : 'text-muted-foreground'}`}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>

          <p className="px-4 mt-5 mb-2 text-2xs font-semibold uppercase tracking-widest text-muted-foreground">
            Account
          </p>
          <ul className="space-y-0.5 px-2">
            {accountItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <li key={`mobile-nav-account-${item.label.toLowerCase().replace(/\s/g, '-')}`}>
                  <Link
                    href={item.href}
                    onClick={onMobileClose}
                    className={`sidebar-item flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${active ? 'sidebar-active' : 'text-muted-foreground'}`}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Mobile theme toggle */}
          <div className="mt-3 border-t border-border mx-2 pt-3 px-0">
            <ThemeToggleButton showLabel={true} />
          </div>
        </nav>

        <div className="border-t border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <span className="text-primary text-xs font-bold">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{displayName}</p>
              <p className="text-2xs text-muted-foreground truncate">{displayEmail}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="p-1.5 rounded-md hover:bg-secondary transition-colors"
              title="Sign out"
            >
              <LogOut size={14} className="text-muted-foreground" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}