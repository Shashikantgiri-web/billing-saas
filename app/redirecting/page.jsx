import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function RedirectingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role === "admin") redirect("/admin");

  const { data: business } = await supabase
    .from("business")
    .select("slug")
    .eq("owner_user_id", user.id)
    .single();

  if (business?.slug) redirect(`/${business.slug}/dashboard`);

  // Signed in but no business row yet (e.g. confirmed email after signup
  // but business creation didn't complete).
  redirect("/register");
}
