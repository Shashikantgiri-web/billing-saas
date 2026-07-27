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
  LogOut 
} from 'lucide-react';
import { cn } from '../lib/utils';

const NavGroup = ({ label, children }) => (
  <div className="mb-4">
    <p className="px-3 mb-1 mt-4 text-[11px] font-semibold uppercase tracking-widest text-[var(--sidebar-text)] opacity-50">
      {label}
    </p>
    {children}
  </div>
);

const NavItem = ({ href, icon: Icon, label, active }) => (
  <Link
    href={href}
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

export const Sidebar = ({ slug, businessName }) => {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[260px] z-30 bg-[var(--sidebar-bg)] border-r border-[var(--sidebar-border)] hidden lg:flex flex-col">
      {/* Logo */}
      <div className="h-[60px] flex items-center px-6 border-b border-[var(--sidebar-border)]">
        <div className="w-8 h-8 rounded-lg bg-[var(--accent)] flex items-center justify-center mr-3">
          <FileText className="w-5 h-5 text-white" />
        </div>
        <span className="text-[var(--text-inverse)] font-bold text-lg tracking-tight">BillingSaaS</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        <NavGroup label="Main">
          <NavItem href={`/${slug}/dashboard`} icon={LayoutDashboard} label="Dashboard" active={pathname.includes('/dashboard')} />
          <NavItem href={`/${slug}/invoices`} icon={FileText} label="Invoices" active={pathname.includes('/invoices')} />
          <NavItem href={`/${slug}/customers`} icon={Users} label="Customers" active={pathname.includes('/customers')} />
          <NavItem href={`/${slug}/products`} icon={Package} label="Products" active={pathname.includes('/products')} />
          <NavItem href={`/${slug}/categories`} icon={Tag} label="Categories" active={pathname.includes('/categories')} />
        </NavGroup>

        <NavGroup label="Analytics">
          <NavItem href={`/${slug}/reports`} icon={BarChart2} label="Reports" active={pathname.includes('/reports')} />
        </NavGroup>

        <NavGroup label="Account">
          <NavItem href={`/${slug}/settings`} icon={Settings} label="Settings" active={pathname.includes('/settings')} />
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
          <form action="/api/auth/logout" method="POST">
            <button type="submit" className="text-[var(--sidebar-text)] hover:text-white p-1 rounded transition-colors" title="Log out">
              <LogOut size={18} />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
};
