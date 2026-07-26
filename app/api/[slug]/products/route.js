import { NextResponse } from "next/server";
import { requireTenant } from "@/lib/tenant/require-tenant";

export async function GET(request, { params }) {
  const { slug } = await params;
  try {
    const { supabase, business } = await requireTenant(slug);
    const { data, error } = await supabase
      .from("products")
      .select("*, categories(id, name)")
      .eq("business_id", business.id)
      .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ products: data });
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
      return NextResponse.json({ error: "Product name is required" }, { status: 422 });
    }
    const price = Number(body.price);
    if (Number.isNaN(price) || price < 0) {
      return NextResponse.json({ error: "Valid price is required" }, { status: 422 });
    }

    const { data, error } = await supabase
      .from("products")
      .insert({
        business_id: business.id,
        category_id: body.category_id || null,
        name: body.name.trim(),
        price,
        tax_percent: Number(body.tax_percent) || 0,
      })
      .select("*, categories(id, name)")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    await supabase.from("activity_logs").insert({
      business_id: business.id,
      user_id: user.id,
      action: "product.created",
      metadata: { product_id: data.id, name: data.name },
    });

    return NextResponse.json({ product: data }, { status: 201 });
  } catch (res) {
    if (res instanceof Response) return res;
    throw res;
  }
}
