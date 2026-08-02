import React from 'react';
import { Sidebar } from '../../components/sidebar';
import { TopBar } from '../../components/topbar';
import { createClient } from '../../lib/supabase/server';

export default async function TenantLayout({ children, params }) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: business } = await supabase
    .from("business")
    .select("name")
    .eq("slug", slug)
    .single();

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <Sidebar slug={slug} businessName={business?.name} />
      <div className="lg:ml-[260px] flex flex-col min-h-screen">
        <TopBar slug={slug} />
        <main className="flex-1 px-4 sm:px-8 py-6 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
