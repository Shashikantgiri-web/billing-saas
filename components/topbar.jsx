'use client';

import React from 'react';
import { Menu } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TITLES = {
  dashboard: 'Dashboard',
  invoices: 'Invoices',
  customers: 'Customers',
  products: 'Products',
  categories: 'Categories',
  reports: 'Reports',
  settings: 'Settings',
};

function deriveTitle(pathname, slug) {
  const rest = pathname.replace(`/${slug}`, '').split('/').filter(Boolean);
  const section = rest[0];
  if (!section) return 'Dashboard';
  const base = TITLES[section] || section.charAt(0).toUpperCase() + section.slice(1);
  if (rest[1] === 'new') return `New ${base.replace(/s$/, '')}`;
  if (rest[2] === 'edit') return `Edit ${base.replace(/s$/, '')}`;
  return base;
}

export const TopBar = ({ slug }) => {
  const pathname = usePathname();
  const pageTitle = deriveTitle(pathname, slug);

  return (
    <header className="sticky top-0 z-20 h-[60px] bg-[var(--bg-surface)]/80 backdrop-blur-md border-b border-[var(--border-subtle)] flex items-center px-6 gap-4">
      {/* Mobile menu button (visual only for now without full mobile drawer) */}
      <button className="lg:hidden text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
        <Menu size={24} />
      </button>

      {/* Breadcrumb */}
      <div className="flex items-center text-sm">
        <span className="font-medium text-[var(--text-primary)]">{pageTitle}</span>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right actions */}
      <div className="flex items-center gap-4">
        <Link 
          href={`/${slug}/invoices/new`}
          className="h-8 px-3 inline-flex items-center justify-center rounded-[var(--radius-button)] text-xs font-medium bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] transition-colors"
        >
          New Invoice
        </Link>
      </div>
    </header>
  );
};
