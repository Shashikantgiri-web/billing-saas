"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function CustomersPage() {
  const { slug } = useParams();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  async function load() {
    setLoading(true);
    const res = await fetch(`/api/${slug}/customers`);
    const data = await res.json();
    setCustomers(data.customers || []);
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
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
          Customers
        </h1>
        <Link href={`/${slug}/customers/new`}>
          <Button>
            <Plus size={16} className="mr-1.5" />
            New Customer
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-12 w-full rounded-[var(--radius-md)]" />
          <Skeleton className="h-12 w-full rounded-[var(--radius-md)]" />
          <Skeleton className="h-12 w-full rounded-[var(--radius-md)]" />
        </div>
      ) : customers.length === 0 ? (
        <Card>
          <div className="p-10 text-center text-sm" style={{ color: "var(--text-muted)" }}>
            No customers yet.
          </div>
        </Card>
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead style={{ background: "var(--bg-sunken)", color: "var(--text-muted)" }}>
              <tr className="text-left">
                <th scope="col" className="px-4 py-3 font-medium">Name</th>
                <th scope="col" className="px-4 py-3 font-medium">Email</th>
                <th scope="col" className="px-4 py-3 font-medium">Phone</th>
                <th scope="col" className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} className="border-t" style={{ borderColor: "var(--border-subtle)" }}>
                  <td className="px-4 py-3" style={{ color: "var(--text-primary)" }}>{c.name}</td>
                  <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>{c.email || "—"}</td>
                  <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>{c.phone || "—"}</td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <Link
                      href={`/${slug}/customers/${c.id}/edit`}
                      className="inline-flex p-2 rounded-lg transition-colors hover:bg-[var(--bg-sunken)]"
                      style={{ color: "var(--text-secondary)" }}
                      title="Edit customer"
                    >
                      <Pencil size={15} />
                    </Link>
                    <button
                      onClick={() => handleDelete(c.id)}
                      disabled={deletingId === c.id}
                      title="Delete customer"
                      className="p-2 rounded-lg transition-colors hover:bg-[var(--danger-light)] disabled:opacity-50"
                      style={{ color: "var(--danger)" }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
