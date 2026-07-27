"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function CategoriesPage() {
  const { slug } = useParams();
  const [business, setBusiness] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    const [bizRes, catRes] = await Promise.all([
      fetch(`/api/${slug}`),
      fetch(`/api/${slug}/categories`),
    ]);
    const biz = await bizRes.json();
    const cat = await catRes.json();
    setBusiness(biz.business);
    setCategories(cat.categories || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  async function handleAdd(e) {
    e.preventDefault();
    setError("");
    if (!newName.trim()) return;
    setAdding(true);
    const res = await fetch(`/api/${slug}/categories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName }),
    });
    const data = await res.json();
    setAdding(false);
    if (!res.ok) {
      setError(data.error || "Could not add category.");
      return;
    }
    setCategories((cs) => [...cs, data.category].sort((a, b) => a.name.localeCompare(b.name)));
    setNewName("");
  }

  async function handleDelete(id) {
    if (!confirm("Delete this category? Products using it will keep their data but lose the category link.")) return;
    setDeletingId(id);
    const res = await fetch(`/api/${slug}/categories/${id}`, { method: "DELETE" });
    setDeletingId(null);
    if (res.ok) {
      setCategories((cs) => cs.filter((c) => c.id !== id));
    } else {
      const data = await res.json();
      alert(data.error || "Could not delete category.");
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      
      <main className="p-6 max-w-md">
        <h1 className="text-lg font-semibold text-neutral-900 mb-4">Categories</h1>

        <form onSubmit={handleAdd} className="flex gap-2 mb-6">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="New category name"
            className="flex-1 rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
          />
          <button
            type="submit"
            disabled={adding}
            className="rounded-md bg-neutral-900 text-white text-sm font-medium px-4 py-2 disabled:opacity-50"
          >
            {adding ? "Adding..." : "Add"}
          </button>
        </form>
        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

        {loading ? (
          <p className="text-sm text-neutral-500">Loading...</p>
        ) : categories.length === 0 ? (
          <p className="text-sm text-neutral-500">No categories yet.</p>
        ) : (
          <ul className="bg-white border border-neutral-200 rounded-lg divide-y divide-neutral-200">
            {categories.map((c) => (
              <li key={c.id} className="px-4 py-2 flex items-center justify-between text-sm">
                <span className="text-neutral-900">{c.name}</span>
                <button
                  onClick={() => handleDelete(c.id)}
                  disabled={deletingId === c.id}
                  className="text-red-600 hover:text-red-700 disabled:opacity-50"
                >
                  {deletingId === c.id ? "Deleting..." : "Delete"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
