'use client';

import React from 'react';
import Link from 'next/link';
import AppLogo from '@/components/ui/AppLogo';
import ThemeSwitcher from './ThemeSwitcher';
import {
  LayoutDashboard,
  Link2,
  ChevronLeft,
  ChevronRight,
  Bell,
  Users,
} from 'lucide-react';
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
  { label: 'Compare', href: '/compare', icon: Users, group: 'main' },
  { label: 'Notifications', href: '/notifications', icon: Bell, group: 'account' },
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
  const mainItems = navItems.filter((i) => i.group === 'main');
  const accountItems = navItems.filter((i) => i.group === 'account');

  const isActive = (href: string) => {
    if (href === '/') return activePath === '/';
    return activePath.startsWith(href);
  };


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
        <div
          className={`flex items-center gap-3 px-4 py-5 border-b border-border ${collapsed ? 'justify-center px-0' : 'justify-between'}`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <AppLogo size={28} />
            {!collapsed && (
              <span className="font-bold text-foreground text-base tracking-tight truncate">
                ProgressTracker
              </span>
            )}
          </div>
          {!collapsed && <ThemeSwitcher />}
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
        </nav>

        {/* Collapse control */}
        <div className="border-t border-border">
          {collapsed && (
            <div className="flex justify-center pt-3">
              <ThemeSwitcher />
            </div>
          )}
          <div className="px-2 py-3">
            <button
              onClick={onToggleCollapse}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-all text-xs"
            >
              {collapsed ? (
                <ChevronRight size={14} />
              ) : (
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
            <span className="font-bold text-foreground text-base">ProgressTracker</span>
          </div>
          <button
            onClick={onMobileClose}
            className="p-1.5 rounded-md hover:bg-secondary transition-colors"
          >
            <svg
              className="w-4 h-4 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
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
        </nav>
      </aside>
    </>
  );
}
