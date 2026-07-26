import { NextResponse } from "next/server";
import { requireTenant } from "@/lib/tenant/require-tenant";

export async function GET(request, { params }) {
  const { slug } = await params;
  try {
    const { supabase, business } = await requireTenant(slug);

    const { data: invoices, error: invError } = await supabase
      .from("invoices")
      .select("id, invoice_number, grand_total, status, created_at, customer_id, customers(name)")
      .eq("business_id", business.id)
      .order("created_at", { ascending: false });

    if (invError) return NextResponse.json({ error: invError.message }, { status: 400 });

    const activeInvoices = invoices.filter((i) => i.status !== "void");
    const invoiceIds = activeInvoices.map((i) => i.id);

    let items = [];
    if (invoiceIds.length > 0) {
      const { data: itemRows, error: itemsError } = await supabase
        .from("invoice_items")
        .select("invoice_id, product_id, product_name, quantity, line_total")
        .in("invoice_id", invoiceIds);
      if (itemsError) return NextResponse.json({ error: itemsError.message }, { status: 400 });
      items = itemRows;
    }

    // Sales by month (YYYY-MM)
    const salesByMonth = {};
    for (const inv of activeInvoices) {
      const month = inv.created_at.slice(0, 7);
      salesByMonth[month] = (salesByMonth[month] || 0) + Number(inv.grand_total);
    }
    const salesTimeline = Object.entries(salesByMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, total]) => ({ month, total: Number(total.toFixed(2)) }));

    // Top customers by revenue
    const revenueByCustomer = {};
    for (const inv of activeInvoices) {
      const name = inv.customers?.name || "Unknown";
      revenueByCustomer[name] = (revenueByCustomer[name] || 0) + Number(inv.grand_total);
    }
    const topCustomers = Object.entries(revenueByCustomer)
      .map(([name, total]) => ({ name, total: Number(total.toFixed(2)) }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    // Top products by quantity and revenue
    const productStats = {};
    for (const item of items) {
      const key = item.product_name;
      if (!productStats[key]) productStats[key] = { name: key, quantity: 0, revenue: 0 };
      productStats[key].quantity += Number(item.quantity);
      productStats[key].revenue += Number(item.line_total);
    }
    const topProducts = Object.values(productStats)
      .map((p) => ({ ...p, revenue: Number(p.revenue.toFixed(2)) }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    const summary = {
      totalRevenue: Number(activeInvoices.reduce((s, i) => s + Number(i.grand_total), 0).toFixed(2)),
      invoiceCount: activeInvoices.length,
      voidCount: invoices.length - activeInvoices.length,
    };

    return NextResponse.json({
      summary,
      salesTimeline,
      topCustomers,
      topProducts,
      recentInvoices: invoices.slice(0, 10),
    });
  } catch (res) {
    if (res instanceof Response) return res;
    throw res;
  }
}
