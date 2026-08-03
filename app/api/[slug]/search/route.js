import { NextResponse } from "next/server";
import { requireTenant } from "@/lib/tenant/require-tenant";

export async function GET(request, { params }) {
  const { slug } = await params;
  const url = new URL(request.url);
  const q = url.searchParams.get("q")?.trim();

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    const { supabase, business } = await requireTenant(slug);
    const bId = business.id;
    const pattern = `%${q}%`;

    const [{ data: invoices }, { data: customers }, { data: products }] = await Promise.all([
      supabase
        .from("invoices")
        .select("id, invoice_number, grand_total, customers(name)")
        .eq("business_id", bId)
        .eq("is_deleted", false)
        .ilike("invoice_number", pattern)
        .limit(4),

      supabase
        .from("customers")
        .select("id, name, email, phone")
        .eq("business_id", bId)
        .or(`name.ilike.${pattern},email.ilike.${pattern}`)
        .limit(4),

      supabase
        .from("products")
        .select("id, name, price")
        .eq("business_id", bId)
        .ilike("name", pattern)
        .limit(4),
    ]);

    const results = [
      ...(invoices || []).map((i) => ({
        type: "invoice",
        id: i.id,
        label: i.invoice_number,
        sub: i.customers?.name || "",
        meta: `₹${Number(i.grand_total).toLocaleString("en-IN")}`,
      })),
      ...(customers || []).map((c) => ({
        type: "customer",
        id: c.id,
        label: c.name,
        sub: c.email || c.phone || "",
        meta: "",
      })),
      ...(products || []).map((p) => ({
        type: "product",
        id: p.id,
        label: p.name,
        sub: "",
        meta: `₹${Number(p.price).toLocaleString("en-IN")}`,
      })),
    ];

    return NextResponse.json({ results });
  } catch (res) {
    if (res instanceof Response) return res;
    throw res;
  }
}
