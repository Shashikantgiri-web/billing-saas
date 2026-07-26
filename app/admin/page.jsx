import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminBusinessTable from "./business-table";

export default async function AdminPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/redirecting");

  const { data: businesses } = await supabase
    .from("business")
    .select("id, slug, name, status, joined_at")
    .order("joined_at", { ascending: false });

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="border-b border-neutral-200 bg-white px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-neutral-900">Platform Admin</h1>
        <form action="/api/auth/logout" method="POST">
          <button className="text-sm text-neutral-600 hover:text-neutral-900">Log out</button>
        </form>
      </header>

      <main className="p-6">
        <AdminBusinessTable initialBusinesses={businesses ?? []} />
      </main>
    </div>
  );
}
