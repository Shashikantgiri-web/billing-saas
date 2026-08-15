'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Users,
  Package,
  Tag,
  BarChart2,
  Settings,
  LogOut,
  X,
} from 'lucide-react';
import { cn } from '../lib/utils';
import ThemeToggle from './ThemeToggle';

const NavGroup = ({ label, children }) => (
  <div className="mb-4">
    <p className="px-3 mb-1 mt-4 text-[11px] font-semibold uppercase tracking-widest text-[var(--sidebar-text)] opacity-50">
      {label}
    </p>
    {children}
  </div>
);

const NavItem = ({ href, icon: Icon, label, active, onNavigate }) => (
  <Link
    href={href}
    onClick={onNavigate}
    className={cn(
      'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors',
      active
        ? 'text-(--sidebar-text-active) bg-(--sidebar-item-active) font-medium'
        : 'text-[var(--sidebar-text)] hover:bg-[var(--sidebar-item-hover)] hover:text-white'
    )}
  >
    <Icon size={20} />
    {label}
  </Link>
);

function SidebarContent({ slug, businessName, pathname, onNavigate, onClose }) {
  return (
    <>
      {/* Logo */}
      <div className="h-[60px] flex items-center px-6 border-b border-[var(--sidebar-border)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icon-192.png" alt="" className="w-8 h-8 rounded-lg mr-3" />
        <span className="text-[var(--text-inverse)] font-bold text-lg tracking-tight flex-1">BillingSaaS</span>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden text-[var(--sidebar-text)] hover:text-white p-1 rounded"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        <NavGroup label="Main">
          <NavItem href={`/${slug}/dashboard`} icon={LayoutDashboard} label="Dashboard" active={pathname.includes('/dashboard')} onNavigate={onNavigate} />
          <NavItem href={`/${slug}/invoices`} icon={FileText} label="Invoices" active={pathname.includes('/invoices')} onNavigate={onNavigate} />
          <NavItem href={`/${slug}/customers`} icon={Users} label="Customers" active={pathname.includes('/customers')} onNavigate={onNavigate} />
          <NavItem href={`/${slug}/products`} icon={Package} label="Products" active={pathname.includes('/products')} onNavigate={onNavigate} />
          <NavItem href={`/${slug}/categories`} icon={Tag} label="Categories" active={pathname.includes('/categories')} onNavigate={onNavigate} />
        </NavGroup>

        <NavGroup label="Analytics">
          <NavItem href={`/${slug}/reports`} icon={BarChart2} label="Reports" active={pathname.includes('/reports')} onNavigate={onNavigate} />
        </NavGroup>

        <NavGroup label="Account">
          <NavItem href={`/${slug}/settings`} icon={Settings} label="Settings" active={pathname.includes('/settings')} onNavigate={onNavigate} />
        </NavGroup>
      </nav>

      {/* Bottom Profile Card */}
      <div className="p-4 border-t border-[var(--sidebar-border)]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[var(--accent)] flex items-center justify-center text-white text-sm font-semibold shrink-0">
            {businessName?.[0]?.toUpperCase() || 'B'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{businessName}</p>
            <p className="text-[var(--sidebar-text)] text-xs truncate">Business Account</p>
          </div>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent('show-shortcuts'))}
            title="Keyboard shortcuts (?)"
            aria-label="Show keyboard shortcuts"
            className="p-2 rounded-lg transition-colors text-xs font-mono shrink-0"
            style={{ color: 'var(--sidebar-text)' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--sidebar-item-hover)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            ?
          </button>
          <ThemeToggle />
          <form action="/api/auth/logout" method="POST">
            <button type="submit" className="text-[var(--sidebar-text)] hover:text-white p-1 rounded transition-colors" title="Log out">
              <LogOut size={18} />
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export const Sidebar = ({ slug, businessName, mobileOpen, onCloseMobile }) => {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop sidebar — always visible at lg+ */}
      <aside className="fixed left-0 top-0 bottom-0 w-[260px] z-30 bg-[var(--sidebar-bg)] border-r border-[var(--sidebar-border)] hidden lg:flex flex-col">
        <SidebarContent slug={slug} businessName={businessName} pathname={pathname} />
      </aside>

      {/* Mobile drawer — slides in over content, closes on backdrop tap or nav */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <aside className="absolute left-0 top-0 bottom-0 w-[260px] bg-[var(--sidebar-bg)] border-r border-[var(--sidebar-border)] flex flex-col shadow-2xl">
            <SidebarContent
              slug={slug}
              businessName={businessName}
              pathname={pathname}
              onNavigate={onCloseMobile}
              onClose={onCloseMobile}
            />
          </aside>
        </div>
      )}
    </>
  );
};
