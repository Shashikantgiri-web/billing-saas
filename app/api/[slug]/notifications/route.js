import { NextResponse } from "next/server";
import { requireTenant } from "@/lib/tenant/require-tenant";

export async function GET(request, { params }) {
  const { slug } = await params;
  try {
    const { supabase, business } = await requireTenant(slug);

    const { data, error } = await supabase
      .from("activity_logs")
      .select("id, action, metadata, created_at")
      .eq("business_id", business.id)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ notifications: data || [] });
  } catch (res) {
    if (res instanceof Response) return res;
    throw res;
  }
}
