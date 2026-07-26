import { NextResponse } from "next/server";
import { requireTenant } from "@/lib/tenant/require-tenant";

export async function GET(request, { params }) {
  const { slug } = await params;
  try {
    const { supabase, business } = await requireTenant(slug);
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .eq("business_id", business.id)
      .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ customers: data });
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

    if (!body.name || !body.name.trim()) {
      return NextResponse.json({ error: "Customer name is required" }, { status: 422 });
    }

    const { data, error } = await supabase
      .from("customers")
      .insert({
        business_id: business.id,
        name: body.name.trim(),
        email: body.email?.trim() || null,
        phone: body.phone?.trim() || null,
        address: body.address?.trim() || null,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    await supabase.from("activity_logs").insert({
      business_id: business.id,
      user_id: user.id,
      action: "customer.created",
      metadata: { customer_id: data.id, name: data.name },
    });

    return NextResponse.json({ customer: data }, { status: 201 });
  } catch (res) {
    if (res instanceof Response) return res;
    throw res;
  }
}
