"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import TenantNav from "../tenant-nav";

export default function CustomersPage() {
  const { slug } = useParams();
  const [business, setBusiness] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  async function load() {
    setLoading(true);
    const [bizRes, custRes] = await Promise.all([
      fetch(`/api/${slug}`),
      fetch(`/api/${slug}/customers`),
    ]);
    const biz = await bizRes.json();
    const cust = await custRes.json();
    setBusiness(biz.business);
    setCustomers(cust.customers || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  async function handleDelete(id) {
    if (!confirm("Delete this customer? This cannot be undone.")) return;
    setDeletingId(id);
    const res = await fetch(`/api/${slug}/customers/${id}`, { method: "DELETE" });
    setDeletingId(null);
    if (res.ok) {
      setCustomers((cs) => cs.filter((c) => c.id !== id));
    } else {
      const data = await res.json();
      alert(data.error || "Could not delete customer.");
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <TenantNav slug={slug} businessName={business?.name} />

      <main className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-semibold text-neutral-900">Customers</h1>
          <Link
            href={`/${slug}/customers/new`}
            className="rounded-md bg-neutral-900 text-white text-sm font-medium px-4 py-2"
          >
            + New Customer
          </Link>
        </div>

        {loading ? (
          <p className="text-sm text-neutral-500">Loading...</p>
        ) : customers.length === 0 ? (
          <p className="text-sm text-neutral-500">No customers yet.</p>
        ) : (
          <div className="bg-white border border-neutral-200 rounded-lg overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-neutral-100 text-neutral-500 text-left">
                <tr>
                  <th className="px-4 py-2 font-medium">Name</th>
                  <th className="px-4 py-2 font-medium">Email</th>
                  <th className="px-4 py-2 font-medium">Phone</th>
                  <th className="px-4 py-2 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id} className="border-t border-neutral-200">
                    <td className="px-4 py-2 text-neutral-900">{c.name}</td>
                    <td className="px-4 py-2 text-neutral-500">{c.email || "—"}</td>
                    <td className="px-4 py-2 text-neutral-500">{c.phone || "—"}</td>
                    <td className="px-4 py-2 text-right space-x-3">
                      <Link href={`/${slug}/customers/${c.id}/edit`} className="text-neutral-700 hover:text-neutral-900">
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(c.id)}
                        disabled={deletingId === c.id}
                        className="text-red-600 hover:text-red-700 disabled:opacity-50"
                      >
                        {deletingId === c.id ? "Deleting..." : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
