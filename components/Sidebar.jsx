// components/Sidebar.jsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Briefcase,
  ClipboardList,
  AlertTriangle,
  Building2,
  Users,
  BarChart3,
  Settings,
  Palette,
  ChevronLeft,
  ChevronRight,
  Shield,
} from 'lucide-react';

export default function Sidebar({ user, company, pathname }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Define navigation items based on role
  const getNavItems = () => {
    const baseItems = [
      { href: '/', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/works', label: 'All Works', icon: Briefcase },
      { href: '/my-tasks', label: 'My Tasks', icon: ClipboardList },
      { href: '/employees', label: 'Employees', icon: Users },
      { href: '/expiries', label: 'Expiries', icon: AlertTriangle },
    ];

    // Manager and Super Admin get additional items
    if (user.role === 'pro_manager' || user.role === 'super_admin') {
      baseItems.push(
        { href: '/companies', label: 'Companies', icon: Building2 },
        { href: '/users', label: 'Users', icon: Users },
        { href: '/reports', label: 'Reports', icon: BarChart3 }
      );
    }

    // Super Admin gets settings
    if (user.role === 'super_admin') {
      baseItems.push(
        { href: '/settings/pipeline', label: 'Pipeline Settings', icon: Settings },
        { href: '/settings/appearance', label: 'Appearance', icon: Palette }
      );
    }

    return baseItems;
  };

  const navItems = getNavItems();

  return (
    <aside
      className={`bg-[var(--bg-card)] border-r border-[var(--border-color)] flex flex-col transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Logo Section */}
      <div className="p-4 border-b border-[var(--border-color)] flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <Shield className="w-8 h-8 text-[var(--primary)]" />
            <div>
              <h1 className="text-lg font-bold text-[var(--text-main)]">
                WORK 365
              </h1>
              <p className="text-xs text-[var(--text-muted)]">UAE PRO Pipeline</p>
            </div>
          </div>
        )}
        {isCollapsed && (
          <Shield className="w-8 h-8 text-[var(--primary)] mx-auto" />
        )}
      </div>

      {/* Company Info */}
      {company && !isCollapsed && (
        <div className="p-4 border-b border-[var(--border-color)]">
          <p className="text-xs text-[var(--text-muted)]">Company</p>
          <p className="text-sm font-medium text-[var(--text-main)] truncate">
            {company.name}
          </p>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-colors ${
                isActive
                  ? 'bg-[var(--primary)] text-white'
                  : 'text-[var(--text-muted)] hover:bg-[var(--bg-main)] hover:text-[var(--text-main)]'
              }`}
              title={isCollapsed ? item.label : ''}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span className="text-sm">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-[var(--border-color)]">
        {!isCollapsed && (
          <div className="mb-3">
            <p className="text-sm font-medium text-[var(--text-main)] truncate">
              {user.full_name}
            </p>
            <p className="text-xs text-[var(--text-muted)] capitalize">
              {user.role.replace('_', ' ')}
            </p>
          </div>
        )}

        {/* Collapse Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-main)] hover:text-[var(--text-main)] transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm">Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}