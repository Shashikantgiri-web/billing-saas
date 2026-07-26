import { NextResponse } from "next/server";
import { requireTenant } from "@/lib/tenant/require-tenant";

export async function GET(request, { params }) {
  const { slug } = await params;
  try {
    const { supabase, business } = await requireTenant(slug);
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("business_id", business.id)
      .order("name", { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ categories: data });
  } catch (res) {
    if (res instanceof Response) return res;
    throw res;
  }
}

export async function POST(request, { params }) {
  const { slug } = await params;
  try {
    const { supabase, business } = await requireTenant(slug);
    const body = await request.json();

    if (!body.name || !body.name.trim()) {
      return NextResponse.json({ error: "Category name is required" }, { status: 422 });
    }

    const { data, error } = await supabase
      .from("categories")
      .insert({ business_id: business.id, name: body.name.trim() })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ category: data }, { status: 201 });
  } catch (res) {
    if (res instanceof Response) return res;
    throw res;
  }
}
