import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Users, Package, FileText, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";

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
      supabase.from("invoices").select("*", { count: "exact", head: true }).eq("business_id", business.id).eq("is_deleted", false),
    ]);

  return (
    <div>
      <h1 className="text-xl font-semibold mb-6" style={{ color: "var(--text-primary)" }}>
        Dashboard
      </h1>

      {business.status !== "active" && (
        <div
          className="mb-4 rounded-[var(--radius-md)] px-4 py-3 text-sm flex items-center gap-2"
          style={{ background: "var(--warning-light)", color: "#92400E", border: "1px solid var(--warning-border)" }}
        >
          <AlertTriangle size={16} className="shrink-0" />
          <span>
            Your account status is <strong>{business.status}</strong>. Contact support if this looks wrong.
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Customers" value={customerCount ?? 0} icon={Users} />
        <StatCard label="Products" value={productCount ?? 0} icon={Package} />
        <StatCard label="Invoices" value={invoiceCount ?? 0} icon={FileText} />
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon }) {
  return (
    <Card className="p-5 flex items-center gap-4">
      <div
        className="w-11 h-11 rounded-[var(--radius-md)] flex items-center justify-center shrink-0"
        style={{ background: "var(--accent-light)", color: "var(--accent)" }}
      >
        <Icon size={20} />
      </div>
      <div>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>{label}</p>
        <p className="text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>{value}</p>
      </div>
    </Card>
  );
}
