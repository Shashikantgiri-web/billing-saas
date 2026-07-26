import { NextResponse } from "next/server";
import { requireTenant } from "@/lib/tenant/require-tenant";

export async function PATCH(request, { params }) {
  const { slug, id } = await params;
  try {
    const { supabase, business } = await requireTenant(slug);
    const body = await request.json();

    if (!body.name || !body.name.trim()) {
      return NextResponse.json({ error: "Category name is required" }, { status: 422 });
    }

    const { data, error } = await supabase
      .from("categories")
      .update({ name: body.name.trim() })
      .eq("business_id", business.id)
      .eq("id", id)
      .select()
      .single();

    if (error || !data) return NextResponse.json({ error: error?.message || "Not found" }, { status: 400 });
    return NextResponse.json({ category: data });
  } catch (res) {
    if (res instanceof Response) return res;
    throw res;
  }
}

export async function DELETE(request, { params }) {
  const { slug, id } = await params;
  try {
    const { supabase, business } = await requireTenant(slug);

    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("business_id", business.id)
      .eq("id", id);

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ success: true });
  } catch (res) {
    if (res instanceof Response) return res;
    throw res;
  }
}
