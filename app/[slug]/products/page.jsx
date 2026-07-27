"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function ProductsPage() {
  const { slug } = useParams();
  const [business, setBusiness] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  async function load() {
    setLoading(true);
    const [bizRes, prodRes] = await Promise.all([
      fetch(`/api/${slug}`),
      fetch(`/api/${slug}/products`),
    ]);
    const biz = await bizRes.json();
    const prod = await prodRes.json();
    setBusiness(biz.business);
    setProducts(prod.products || []);
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
    <div className="min-h-screen bg-neutral-50">
      
      <main className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-semibold text-neutral-900">Products</h1>
          <Link
            href={`/${slug}/products/new`}
            className="rounded-md bg-neutral-900 text-white text-sm font-medium px-4 py-2"
          >
            + New Product
          </Link>
        </div>

        {loading ? (
          <p className="text-sm text-neutral-500">Loading...</p>
        ) : products.length === 0 ? (
          <p className="text-sm text-neutral-500">No products yet.</p>
        ) : (
          <div className="bg-white border border-neutral-200 rounded-lg overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-neutral-100 text-neutral-500 text-left">
                <tr>
                  <th className="px-4 py-2 font-medium">Name</th>
                  <th className="px-4 py-2 font-medium">Category</th>
                  <th className="px-4 py-2 font-medium">Price</th>
                  <th className="px-4 py-2 font-medium">Tax %</th>
                  <th className="px-4 py-2 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-t border-neutral-200">
                    <td className="px-4 py-2 text-neutral-900">{p.name}</td>
                    <td className="px-4 py-2 text-neutral-500">{p.categories?.name || "—"}</td>
                    <td className="px-4 py-2 text-neutral-500">{Number(p.price).toFixed(2)}</td>
                    <td className="px-4 py-2 text-neutral-500">{Number(p.tax_percent || 0).toFixed(2)}%</td>
                    <td className="px-4 py-2 text-right space-x-3">
                      <Link href={`/${slug}/products/${p.id}/edit`} className="text-neutral-700 hover:text-neutral-900">
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(p.id)}
                        disabled={deletingId === p.id}
                        className="text-red-600 hover:text-red-700 disabled:opacity-50"
                      >
                        {deletingId === p.id ? "Deleting..." : "Delete"}
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
