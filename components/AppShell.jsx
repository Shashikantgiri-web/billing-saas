'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from './sidebar';
import { TopBar } from './topbar';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import ShortcutsDialog from './ShortcutsDialog';

export default function AppShell({ slug, businessName, children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  useKeyboardShortcuts({ slug, onShowHelp: () => setHelpOpen(true) });

  useEffect(() => {
    const handler = () => setHelpOpen(true);
    window.addEventListener('show-shortcuts', handler);
    return () => window.removeEventListener('show-shortcuts', handler);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <Sidebar
        slug={slug}
        businessName={businessName}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <div className="lg:ml-[260px] flex flex-col min-h-screen">
        <TopBar slug={slug} onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 px-4 sm:px-8 py-6 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
      <ShortcutsDialog open={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  );
}
