import React from 'react';
import AppShell from '../../components/AppShell';
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
    <AppShell slug={slug} businessName={business?.name}>
      {children}
    </AppShell>
  );
}
