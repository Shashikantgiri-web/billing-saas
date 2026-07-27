"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EditProductPage() {
  const { slug, id } = useParams();
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/${slug}/categories`)
      .then((r) => r.json())
      .then((data) => setCategories(data.categories || []));

    fetch(`/api/${slug}/products/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.product) {
          const { name, price, tax_percent, category_id } = data.product;
          setForm({ name, price, tax_percent: tax_percent || 0, category_id: category_id || "" });
        }
      });
  }, [slug, id]);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    const res = await fetch(`/api/${slug}/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, category_id: form.category_id || null }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error || "Could not update product.");
      return;
    }
    router.push(`/${slug}/products`);
  }

  if (!form) {
    return (
      <div className="min-h-screen bg-neutral-50">
                <main className="p-6">
          <p className="text-sm text-neutral-500">Loading...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
            <main className="p-6 max-w-md">
        <h1 className="text-lg font-semibold text-neutral-900 mb-4">Edit Product</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Name</label>
            <input
              required
              value={form.name}
              onChange={update("name")}
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Category</label>
            <select
              value={form.category_id}
              onChange={update("category_id")}
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
            >
              <option value="">No category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Price</label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={form.price}
                onChange={update("price")}
                className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Tax %</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.tax_percent}
                onChange={update("tax_percent")}
                className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-neutral-900 text-white text-sm font-medium px-4 py-2 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <button type="button" onClick={() => router.back()} className="text-sm text-neutral-600">
              Cancel
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
