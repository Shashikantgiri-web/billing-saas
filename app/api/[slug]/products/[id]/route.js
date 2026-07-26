import { NextResponse } from "next/server";
import { requireTenant } from "@/lib/tenant/require-tenant";

export async function GET(request, { params }) {
  const { slug, id } = await params;
  try {
    const { supabase, business } = await requireTenant(slug);
    const { data, error } = await supabase
      .from("products")
      .select("*, categories(id, name)")
      .eq("business_id", business.id)
      .eq("id", id)
      .single();

    if (error || !data) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ product: data });
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

    const update = {};
    if (body.name !== undefined) {
      if (!body.name.trim()) return NextResponse.json({ error: "Product name is required" }, { status: 422 });
      update.name = body.name.trim();
    }
    if (body.price !== undefined) {
      const price = Number(body.price);
      if (Number.isNaN(price) || price < 0) return NextResponse.json({ error: "Valid price is required" }, { status: 422 });
      update.price = price;
    }
    if (body.tax_percent !== undefined) update.tax_percent = Number(body.tax_percent) || 0;
    if (body.category_id !== undefined) update.category_id = body.category_id || null;

    const { data, error } = await supabase
      .from("products")
      .update(update)
      .eq("business_id", business.id)
      .eq("id", id)
      .select("*, categories(id, name)")
      .single();

    if (error || !data) return NextResponse.json({ error: error?.message || "Not found" }, { status: 400 });

    await supabase.from("activity_logs").insert({
      business_id: business.id,
      user_id: user.id,
      action: "product.updated",
      metadata: { product_id: id },
    });

    return NextResponse.json({ product: data });
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
      .from("products")
      .delete()
      .eq("business_id", business.id)
      .eq("id", id);

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    await supabase.from("activity_logs").insert({
      business_id: business.id,
      user_id: user.id,
      action: "product.deleted",
      metadata: { product_id: id },
    });

    return NextResponse.json({ success: true });
  } catch (res) {
    if (res instanceof Response) return res;
    throw res;
  }
}
