"use client";

import { useState } from "react";

const STATUS_OPTIONS = ["active", "suspended", "maintenance_ended"];

export default function AdminBusinessTable({ initialBusinesses }) {
  const [businesses, setBusinesses] = useState(initialBusinesses);
  const [updatingId, setUpdatingId] = useState(null);

  async function handleStatusChange(id, status) {
    setUpdatingId(id);
    const res = await fetch(`/api/admin/business/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setUpdatingId(null);
    if (res.ok) {
      setBusinesses((bs) => bs.map((b) => (b.id === id ? { ...b, status } : b)));
    } else {
      const data = await res.json();
      alert(data.error || "Could not update status.");
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full bg-white border border-neutral-200 rounded-lg text-sm">
      <thead className="bg-neutral-100 text-neutral-500 text-left">
        <tr>
          <th className="px-4 py-2 font-medium">Business</th>
          <th className="px-4 py-2 font-medium">Slug</th>
          <th className="px-4 py-2 font-medium">Status</th>
          <th className="px-4 py-2 font-medium">Joined</th>
        </tr>
      </thead>
      <tbody>
        {businesses.map((b) => (
          <tr key={b.id} className="border-t border-neutral-200">
            <td className="px-4 py-2 text-neutral-900">{b.name}</td>
            <td className="px-4 py-2 text-neutral-500">{b.slug}</td>
            <td className="px-4 py-2">
              <select
                value={b.status}
                disabled={updatingId === b.id}
                onChange={(e) => handleStatusChange(b.id, e.target.value)}
                className="rounded-md border border-neutral-300 px-2 py-1 text-sm disabled:opacity-50"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </td>
            <td className="px-4 py-2 text-neutral-500">
              {new Date(b.joined_at).toLocaleDateString()}
            </td>
          </tr>
        ))}
      </tbody>
      </table>
    </div>
  );
}
