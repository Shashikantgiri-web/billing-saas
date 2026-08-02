import { NextResponse } from "next/server";
import { requireTenant } from "@/lib/tenant/require-tenant";

export async function POST(request, { params }) {
  const { slug, id } = await params;
  try {
    const { supabase, business, user } = await requireTenant(slug);

    const { error } = await supabase
      .from("invoices")
      .update({
        is_deleted: false,
        deleted_at: null,
        deleted_by: null,
        restored_at: new Date().toISOString(),
        restored_by: user.id,
      })
      .eq("business_id", business.id)
      .eq("id", id)
      .eq("is_deleted", true);

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    await supabase.from("activity_logs").insert({
      business_id: business.id,
      user_id: user.id,
      action: "invoice.restored",
      metadata: { invoice_id: id },
    });

    return NextResponse.json({ success: true });
  } catch (res) {
    if (res instanceof Response) return res;
    throw res;
  }
}
