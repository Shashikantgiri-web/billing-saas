import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import TenantNav from "../tenant-nav";

export default async function DashboardPage({ params }) {
  const { slug } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: business } = await supabase
    .from("business")
    .select("id, slug, name, status")
    .eq("slug", slug)
    .single();

  if (!business) notFound();

  const [{ count: customerCount }, { count: productCount }, { count: invoiceCount }] =
    await Promise.all([
      supabase.from("customers").select("*", { count: "exact", head: true }).eq("business_id", business.id),
      supabase.from("products").select("*", { count: "exact", head: true }).eq("business_id", business.id),
      supabase.from("invoices").select("*", { count: "exact", head: true }).eq("business_id", business.id),
    ]);

  return (
    <div className="min-h-screen bg-neutral-50">
      <TenantNav slug={slug} businessName={business.name} />

      <main className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Customers" value={customerCount ?? 0} />
        <StatCard label="Products" value={productCount ?? 0} />
        <StatCard label="Invoices" value={invoiceCount ?? 0} />
      </main>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-5">
      <p className="text-sm text-neutral-500">{label}</p>
      <p className="text-2xl font-semibold text-neutral-900 mt-1">{value}</p>
    </div>
  );
}
