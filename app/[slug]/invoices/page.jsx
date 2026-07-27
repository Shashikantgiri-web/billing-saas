"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function InvoicesPage() {
  const { slug } = useParams();
  const [business, setBusiness] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [bizRes, invRes] = await Promise.all([
        fetch(`/api/${slug}`),
        fetch(`/api/${slug}/invoices`),
      ]);
      const biz = await bizRes.json();
      const inv = await invRes.json();
      setBusiness(biz.business);
      setInvoices(inv.invoices || []);
      setLoading(false);
    }
    load();
  }, [slug]);

  return (
    <div className="min-h-screen bg-neutral-50">
      
      <main className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-semibold text-neutral-900">Invoices</h1>
          <Link
            href={`/${slug}/invoices/new`}
            className="rounded-md bg-neutral-900 text-white text-sm font-medium px-4 py-2"
          >
            + New Invoice
          </Link>
        </div>

        {loading ? (
          <p className="text-sm text-neutral-500">Loading...</p>
        ) : invoices.length === 0 ? (
          <p className="text-sm text-neutral-500">No invoices yet.</p>
        ) : (
          <div className="bg-white border border-neutral-200 rounded-lg overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-neutral-100 text-neutral-500 text-left">
                <tr>
                  <th className="px-4 py-2 font-medium">Invoice #</th>
                  <th className="px-4 py-2 font-medium">Customer</th>
                  <th className="px-4 py-2 font-medium">Total</th>
                  <th className="px-4 py-2 font-medium">Status</th>
                  <th className="px-4 py-2 font-medium">Date</th>
                  <th className="px-4 py-2 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} className="border-t border-neutral-200">
                    <td className="px-4 py-2 text-neutral-900 font-medium">{inv.invoice_number}</td>
                    <td className="px-4 py-2 text-neutral-500">{inv.customers?.name || "—"}</td>
                    <td className="px-4 py-2 text-neutral-500">{Number(inv.grand_total).toFixed(2)}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          inv.status === "void"
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-neutral-500">
                      {new Date(inv.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <Link href={`/${slug}/invoices/${inv.id}`} className="text-neutral-700 hover:text-neutral-900">
                        View
                      </Link>
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
