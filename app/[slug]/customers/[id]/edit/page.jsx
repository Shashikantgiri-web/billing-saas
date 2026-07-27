"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EditCustomerPage() {
  const { slug, id } = useParams();
  const router = useRouter();
  const [form, setForm] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/${slug}/customers/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.customer) {
          const { name, email, phone, address } = data.customer;
          setForm({ name, email: email || "", phone: phone || "", address: address || "" });
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
    const res = await fetch(`/api/${slug}/customers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error || "Could not update customer.");
      return;
    }
    router.push(`/${slug}/customers`);
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
        <h1 className="text-lg font-semibold text-neutral-900 mb-4">Edit Customer</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Name" required value={form.name} onChange={update("name")} />
          <Field label="Email" type="email" value={form.email} onChange={update("email")} />
          <Field label="Phone" value={form.phone} onChange={update("phone")} />
          <Field label="Address" value={form.address} onChange={update("address")} textarea />

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

function Field({ label, value, onChange, type = "text", required, textarea }) {
  return (
    <div>
      <label className="block text-sm font-medium text-neutral-700 mb-1">{label}</label>
      {textarea ? (
        <textarea
          value={value}
          onChange={onChange}
          rows={3}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
        />
      ) : (
        <input
          type={type}
          required={required}
          value={value}
          onChange={onChange}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
        />
      )}
    </div>
  );
}
