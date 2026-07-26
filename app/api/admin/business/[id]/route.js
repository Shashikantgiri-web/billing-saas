import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const ALLOWED_STATUSES = ["active", "suspended", "maintenance_ended"];

export async function PATCH(request, { params }) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  if (!ALLOWED_STATUSES.includes(body.status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 422 });
  }

  // Admin has no RLS update grant on `business` by design (owner-only column
  // writes) — this is the one privileged, audited exception, done via the
  // service-role client after the role check above.
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("business")
    .update({ status: body.status })
    .eq("id", id)
    .select("id, name, slug, status")
    .single();

  if (error || !data) return NextResponse.json({ error: error?.message || "Not found" }, { status: 400 });

  await admin.from("activity_logs").insert({
    business_id: id,
    user_id: user.id,
    action: "business.status_changed",
    metadata: { status: body.status },
  });

  return NextResponse.json({ business: data });
}
