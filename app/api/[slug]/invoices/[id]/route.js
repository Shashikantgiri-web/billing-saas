import { NextResponse } from "next/server";
import { requireTenant } from "@/lib/tenant/require-tenant";

export async function GET(request, { params }) {
  const { slug, id } = await params;
  try {
    const { supabase, business } = await requireTenant(slug);

    const { data: invoice, error } = await supabase
      .from("invoices")
      .select("*, customers(id, name, email, phone, address)")
      .eq("business_id", business.id)
      .eq("id", id)
      .single();

    if (error || !invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const { data: items } = await supabase
      .from("invoice_items")
      .select("*")
      .eq("invoice_id", id);

    const { data: businessRow } = await supabase
      .from("business")
      .select("*, business_settings(*)")
      .eq("id", business.id)
      .single();

    return NextResponse.json({ invoice, items: items || [], business: businessRow });
  } catch (res) {
    if (res instanceof Response) return res;
    throw res;
  }
}

export async function PATCH(request, { params }) {
  const { slug, id } = await params;
  try {
    const { supabase, business, user } = await requireTenant(slug);
    const body = await request.json();

    if (body.status !== "void") {
      return NextResponse.json({ error: "Only voiding is supported" }, { status: 422 });
    }

    const { data, error } = await supabase
      .from("invoices")
      .update({ status: "void" })
      .eq("business_id", business.id)
      .eq("id", id)
      .select()
      .single();

    if (error || !data) return NextResponse.json({ error: error?.message || "Not found" }, { status: 400 });

    await supabase.from("activity_logs").insert({
      business_id: business.id,
      user_id: user.id,
      action: "invoice.void",
      metadata: { invoice_id: id },
    });

    return NextResponse.json({ invoice: data });
  } catch (res) {
    if (res instanceof Response) return res;
    throw res;
  }
}

export async function DELETE(request, { params }) {
  const { slug, id } = await params;
  try {
    const { supabase, business, user } = await requireTenant(slug);

    const { data: existing } = await supabase
      .from("invoices")
      .select("id")
      .eq("business_id", business.id)
      .eq("id", id)
      .eq("is_deleted", false)
      .single();

    if (!existing) return NextResponse.json({ error: "Invoice not found." }, { status: 404 });

    const { error } = await supabase
      .from("invoices")
      .update({ is_deleted: true, deleted_at: new Date().toISOString(), deleted_by: user.id })
      .eq("business_id", business.id)
      .eq("id", id);

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    await supabase.from("activity_logs").insert({
      business_id: business.id,
      user_id: user.id,
      action: "invoice.deleted",
      metadata: { invoice_id: id },
    });

    return NextResponse.json({ success: true });
  } catch (res) {
    if (res instanceof Response) return res;
    throw res;
  }
}
