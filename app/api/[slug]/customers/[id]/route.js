import { NextResponse } from "next/server";
import { requireTenant } from "@/lib/tenant/require-tenant";

export async function GET(request, { params }) {
  const { slug, id } = await params;
  try {
    const { supabase, business } = await requireTenant(slug);
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .eq("business_id", business.id)
      .eq("id", id)
      .single();

    if (error || !data) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ customer: data });
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

    if (body.name !== undefined && !body.name.trim()) {
      return NextResponse.json({ error: "Customer name is required" }, { status: 422 });
    }

    const update = {};
    if (body.name !== undefined) update.name = body.name.trim();
    if (body.email !== undefined) update.email = body.email?.trim() || null;
    if (body.phone !== undefined) update.phone = body.phone?.trim() || null;
    if (body.address !== undefined) update.address = body.address?.trim() || null;

    const { data, error } = await supabase
      .from("customers")
      .update(update)
      .eq("business_id", business.id)
      .eq("id", id)
      .select()
      .single();

    if (error || !data) return NextResponse.json({ error: error?.message || "Not found" }, { status: 400 });

    await supabase.from("activity_logs").insert({
      business_id: business.id,
      user_id: user.id,
      action: "customer.updated",
      metadata: { customer_id: id },
    });

    return NextResponse.json({ customer: data });
  } catch (res) {
    if (res instanceof Response) return res;
    throw res;
  }
}

export async function DELETE(request, { params }) {
  const { slug, id } = await params;
  try {
    const { supabase, business, user } = await requireTenant(slug);

    const { error } = await supabase
      .from("customers")
      .delete()
      .eq("business_id", business.id)
      .eq("id", id);

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    await supabase.from("activity_logs").insert({
      business_id: business.id,
      user_id: user.id,
      action: "customer.deleted",
      metadata: { customer_id: id },
    });

    return NextResponse.json({ success: true });
  } catch (res) {
    if (res instanceof Response) return res;
    throw res;
  }
}
