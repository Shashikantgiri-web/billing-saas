"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProductsPage() {
  const { slug } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  async function load() {
    setLoading(true);
    const res = await fetch(`/api/${slug}/products`);
    const data = await res.json();
    setProducts(data.products || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  async function handleDelete(id) {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    setDeletingId(id);
    const res = await fetch(`/api/${slug}/products/${id}`, { method: "DELETE" });
    setDeletingId(null);
    if (res.ok) {
      setProducts((ps) => ps.filter((p) => p.id !== id));
    } else {
      const data = await res.json();
      alert(data.error || "Could not delete product.");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
          Products
        </h1>
        <Link href={`/${slug}/products/new`}>
          <Button>
            <Plus size={16} className="mr-1.5" />
            New Product
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-12 w-full rounded-[var(--radius-md)]" />
          <Skeleton className="h-12 w-full rounded-[var(--radius-md)]" />
          <Skeleton className="h-12 w-full rounded-[var(--radius-md)]" />
        </div>
      ) : products.length === 0 ? (
        <Card>
          <div className="p-10 text-center text-sm" style={{ color: "var(--text-muted)" }}>
            No products yet.
          </div>
        </Card>
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead style={{ background: "var(--bg-sunken)", color: "var(--text-muted)" }}>
              <tr className="text-left">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Tax %</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-t" style={{ borderColor: "var(--border-subtle)" }}>
                  <td className="px-4 py-3" style={{ color: "var(--text-primary)" }}>{p.name}</td>
                  <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>{p.categories?.name || "—"}</td>
                  <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>{Number(p.price).toFixed(2)}</td>
                  <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>{Number(p.tax_percent || 0).toFixed(2)}%</td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <Link
                      href={`/${slug}/products/${p.id}/edit`}
                      className="inline-flex p-2 rounded-lg transition-colors hover:bg-[var(--bg-sunken)]"
                      style={{ color: "var(--text-secondary)" }}
                      title="Edit product"
                    >
                      <Pencil size={15} />
                    </Link>
                    <button
                      onClick={() => handleDelete(p.id)}
                      disabled={deletingId === p.id}
                      title="Delete product"
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
