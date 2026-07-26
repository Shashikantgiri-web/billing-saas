import { NextResponse } from "next/server";
import { requireTenant } from "@/lib/tenant/require-tenant";

export async function GET(request, { params }) {
  const { slug } = await params;
  try {
    const { supabase, business } = await requireTenant(slug);
    const { data, error } = await supabase
      .from("invoices")
      .select("*, customers(id, name)")
      .eq("business_id", business.id)
      .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ invoices: data });
  } catch (res) {
    if (res instanceof Response) return res;
    throw res;
  }
}

export async function POST(request, { params }) {
  const { slug } = await params;
  try {
    const { supabase, business, user } = await requireTenant(slug);
    const body = await request.json();

    const { customer_id, items, discount_total } = body;

    if (!customer_id) {
      return NextResponse.json({ error: "Customer is required" }, { status: 422 });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "At least one line item is required" }, { status: 422 });
    }
    for (const item of items) {
      if (!item.product_name || !item.product_name.trim()) {
        return NextResponse.json({ error: "Every line item needs a name" }, { status: 422 });
      }
      if (Number.isNaN(Number(item.unit_price)) || Number(item.unit_price) < 0) {
        return NextResponse.json({ error: "Every line item needs a valid price" }, { status: 422 });
      }
      if (!Number.isInteger(Number(item.quantity)) || Number(item.quantity) < 1) {
        return NextResponse.json({ error: "Every line item needs a valid quantity" }, { status: 422 });
      }
    }

    // Compute totals server-side — never trust client-computed totals.
    let subtotal = 0;
    let taxTotal = 0;
    const computedItems = items.map((item) => {
      const unitPrice = Number(item.unit_price);
      const qty = Number(item.quantity);
      const taxPercent = Number(item.tax_percent) || 0;
      const lineBase = unitPrice * qty;
      const lineTax = (lineBase * taxPercent) / 100;
      subtotal += lineBase;
      taxTotal += lineTax;
      return {
        product_id: item.product_id || null,
        product_name: item.product_name.trim(),
        unit_price: unitPrice,
        tax_percent: taxPercent,
        quantity: qty,
        line_total: Number((lineBase + lineTax).toFixed(2)),
      };
    });

    const discount = Number(discount_total) || 0;
    const grandTotal = Number((subtotal + taxTotal - discount).toFixed(2));

    // Atomically claim the invoice number (locks business_settings row).
    const { data: invoiceNumber, error: numError } = await supabase.rpc("next_invoice_number", {
      p_business_id: business.id,
    });
    if (numError) return NextResponse.json({ error: numError.message }, { status: 400 });

    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .insert({
        business_id: business.id,
        customer_id,
        invoice_number: invoiceNumber,
        subtotal: Number(subtotal.toFixed(2)),
        tax_total: Number(taxTotal.toFixed(2)),
        discount_total: discount,
        grand_total: grandTotal,
        status: "generated",
      })
      .select()
      .single();

    if (invoiceError) return NextResponse.json({ error: invoiceError.message }, { status: 400 });

    const { error: itemsError } = await supabase
      .from("invoice_items")
      .insert(computedItems.map((item) => ({ ...item, invoice_id: invoice.id })));

    if (itemsError) {
      // Best-effort cleanup — invoice number is still consumed (by design;
      // sequences are never reused even if the transaction is rolled back manually).
      await supabase.from("invoices").delete().eq("id", invoice.id);
      return NextResponse.json({ error: itemsError.message }, { status: 400 });
    }

    await supabase.from("activity_logs").insert({
      business_id: business.id,
      user_id: user.id,
      action: "invoice.created",
      metadata: { invoice_id: invoice.id, invoice_number: invoiceNumber, grand_total: grandTotal },
    });

    return NextResponse.json({ invoice: { ...invoice, invoice_items: computedItems } }, { status: 201 });
  } catch (res) {
    if (res instanceof Response) return res;
    throw res;
  }
}
