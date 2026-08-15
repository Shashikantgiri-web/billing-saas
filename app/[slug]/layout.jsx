import React from 'react';
import AppShell from '../../components/AppShell';
import { createClient } from '../../lib/supabase/server';
import { BusinessProvider } from './business-context';

export default async function TenantLayout({ children, params }) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: business } = await supabase
    .from("business")
    .select("id, name, slug, status, business_settings(*)")
    .eq("slug", slug)
    .single();

  return (
    <AppShell slug={slug} businessName={business?.name}>
      <BusinessProvider business={business}>
        {children}
      </BusinessProvider>
    </AppShell>
  );
}
