import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AdminPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/redirecting");

  // RLS's admin policy on `business` only exposes id/slug/name/status/joined_at-level
  // columns to admins — never customers/products/invoices tables.
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
        <table className="w-full bg-white border border-neutral-200 rounded-lg overflow-hidden text-sm">
          <thead className="bg-neutral-100 text-neutral-500 text-left">
            <tr>
              <th className="px-4 py-2 font-medium">Business</th>
              <th className="px-4 py-2 font-medium">Slug</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody>
            {(businesses ?? []).map((b) => (
              <tr key={b.id} className="border-t border-neutral-200">
                <td className="px-4 py-2 text-neutral-900">{b.name}</td>
                <td className="px-4 py-2 text-neutral-500">{b.slug}</td>
                <td className="px-4 py-2 text-neutral-500">{b.status}</td>
                <td className="px-4 py-2 text-neutral-500">
                  {new Date(b.joined_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );
}
