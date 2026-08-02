"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function CategoriesPage() {
  const { slug } = useParams();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    const res = await fetch(`/api/${slug}/categories`);
    const data = await res.json();
    setCategories(data.categories || []);
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
    <div className="max-w-md">
      <h1 className="text-xl font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
        Categories
      </h1>

      <form onSubmit={handleAdd} className="flex gap-2 mb-6">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New category name"
          className="flex-1 rounded-[var(--radius-input)] border px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          style={{ borderColor: "var(--border-default)", background: "var(--bg-surface)", color: "var(--text-primary)" }}
        />
        <Button type="submit" isLoading={adding}>
          {adding ? "Adding..." : "Add"}
        </Button>
      </form>
      {error && <p className="text-sm mb-4" style={{ color: "var(--danger)" }}>{error}</p>}

      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full rounded-[var(--radius-md)]" />
          <Skeleton className="h-10 w-full rounded-[var(--radius-md)]" />
          <Skeleton className="h-10 w-full rounded-[var(--radius-md)]" />
        </div>
      ) : categories.length === 0 ? (
        <Card>
          <div className="p-8 text-center text-sm" style={{ color: "var(--text-muted)" }}>
            No categories yet.
          </div>
        </Card>
      ) : (
        <Card>
          <ul>
            {categories.map((c, i) => (
              <li
                key={c.id}
                className="px-4 py-3 flex items-center justify-between text-sm"
                style={i > 0 ? { borderTop: "1px solid var(--border-subtle)" } : undefined}
              >
                <span style={{ color: "var(--text-primary)" }}>{c.name}</span>
                <button
                  onClick={() => handleDelete(c.id)}
                  disabled={deletingId === c.id}
                  title="Delete category"
                  className="p-1.5 rounded-lg transition-colors hover:bg-[var(--danger-light)] disabled:opacity-50"
                  style={{ color: "var(--danger)" }}
                >
                  <Trash2 size={15} />
                </button>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
