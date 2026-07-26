import { NextResponse } from "next/server";
import { requireTenant } from "@/lib/tenant/require-tenant";

export async function GET(request, { params }) {
  const { slug } = await params;
  try {
    const { supabase, business } = await requireTenant(slug);

    const [{ data: fullBusiness }, { data: settings }] = await Promise.all([
      supabase.from("business").select("*").eq("id", business.id).single(),
      supabase.from("business_settings").select("*").eq("business_id", business.id).single(),
    ]);

    return NextResponse.json({ business: fullBusiness, settings });
  } catch (res) {
    if (res instanceof Response) return res;
    throw res;
  }
}

export async function PATCH(request, { params }) {
  const { slug } = await params;
  try {
    const { supabase, business } = await requireTenant(slug);
    const body = await request.json();

    const businessUpdate = {};
    ["name", "description", "location", "phone", "email"].forEach((f) => {
      if (body[f] !== undefined) businessUpdate[f] = body[f];
    });

    const settingsUpdate = {};
    ["logo_url", "signature_url", "gst_number", "invoice_prefix", "currency", "default_tax_percent"].forEach((f) => {
      if (body[f] !== undefined) settingsUpdate[f] = body[f];
    });

    const results = await Promise.all([
      Object.keys(businessUpdate).length
        ? supabase.from("business").update(businessUpdate).eq("id", business.id).select().single()
        : Promise.resolve({ data: null, error: null }),
      Object.keys(settingsUpdate).length
        ? supabase.from("business_settings").update(settingsUpdate).eq("business_id", business.id).select().single()
        : Promise.resolve({ data: null, error: null }),
    ]);

    const [{ error: bizError }, { error: settingsError }] = results;
    if (bizError || settingsError) {
      return NextResponse.json(
        { error: (bizError || settingsError).message },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (res) {
    if (res instanceof Response) return res;
    throw res;
  }
}
