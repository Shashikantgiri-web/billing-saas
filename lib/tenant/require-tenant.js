import { createClient } from "@/lib/supabase/server";

/**
 * Resolves `slug` to the business owned by the current authenticated user.
 * RLS already prevents reading a business you don't own, so a null result
 * here means "not found or not yours" — callers must not distinguish the two.
 * Returns { supabase, user, business } or throws a Response to return directly.
 */
export async function requireTenant(slug) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const { data: business, error } = await supabase
    .from("business")
    .select("id, slug, name")
    .eq("slug", slug)
    .single();

  if (error || !business) {
    throw new Response(JSON.stringify({ error: "Not found" }), { status: 404 });
  }

  return { supabase, user, business };
}
