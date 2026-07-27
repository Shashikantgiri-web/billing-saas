"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import TenantNav from "../../tenant-nav";

let lineIdCounter = 0;
function newLine(defaults = {}) {
  lineIdCounter += 1;
  return {
    key: lineIdCounter,
    product_id: "",
    product_name: "",
    unit_price: "",
    tax_percent: "",
    quantity: 1,
    ...defaults,
  };
}

export default function NewInvoicePage() {
  const { slug } = useParams();
  const router = useRouter();

  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [customerId, setCustomerId] = useState("");
  const [discount, setDiscount] = useState("0");
  const [lines, setLines] = useState([newLine()]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/${slug}/customers`).then((r) => r.json()),
      fetch(`/api/${slug}/products`).then((r) => r.json()),
    ]).then(([custData, prodData]) => {
      setCustomers(custData.customers || []);
      setProducts(prodData.products || []);
    });
  }, [slug]);

  function updateLine(key, patch) {
    setLines((ls) => ls.map((l) => (l.key === key ? { ...l, ...patch } : l)));
  }

  function handleProductPick(key, productId) {
    const product = products.find((p) => p.id === productId);
    if (!product) {
      updateLine(key, { product_id: "", });
      return;
    }
    updateLine(key, {
      product_id: product.id,
      product_name: product.name,
      unit_price: product.price,
      tax_percent: product.tax_percent || 0,
    });
  }

  function addLine() {
    setLines((ls) => [...ls, newLine()]);
  }

  function removeLine(key) {
    setLines((ls) => (ls.length > 1 ? ls.filter((l) => l.key !== key) : ls));
  }

  const totals = useMemo(() => {
    let subtotal = 0;
    let tax = 0;
    for (const l of lines) {
      const price = Number(l.unit_price) || 0;
      const qty = Number(l.quantity) || 0;
      const taxPct = Number(l.tax_percent) || 0;
      subtotal += price * qty;
      tax += (price * qty * taxPct) / 100;
    }
    const disc = Number(discount) || 0;
    const grandTotal = subtotal + tax - disc;
    return { subtotal, tax, grandTotal };
  }, [lines, discount]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!customerId) {
      setError("Select a customer.");
      return;
    }
    const items = lines.filter((l) => l.product_name.trim());
    if (items.length === 0) {
      setError("Add at least one line item.");
      return;
    }

    setSaving(true);
    const res = await fetch(`/api/${slug}/invoices`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer_id: customerId,
        discount_total: discount,
        items: items.map((l) => ({
          product_id: l.product_id || null,
          product_name: l.product_name,
          unit_price: l.unit_price,
          tax_percent: l.tax_percent,
          quantity: l.quantity,
        })),
      }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error || "Could not create invoice.");
      return;
    }
    router.push(`/${slug}/invoices/${data.invoice.id}`);
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <TenantNav slug={slug} />
      <main className="p-6 max-w-3xl">
        <h1 className="text-lg font-semibold text-neutral-900 mb-4">New Invoice</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Customer</label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full max-w-sm rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
            >
              <option value="">Select a customer</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {customers.length === 0 && (
              <p className="text-xs text-neutral-500 mt-1">
                No customers yet — add one from the Customers tab first.
              </p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-neutral-700">Line Items</label>
              <button
                type="button"
                onClick={addLine}
                className="text-sm font-medium text-neutral-900 border border-neutral-300 rounded-md px-3 py-1"
              >
                + Add line
              </button>
            </div>

            <div className="bg-white border border-neutral-200 rounded-lg overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-neutral-100 text-neutral-500 text-left">
                  <tr>
                    <th className="px-3 py-2 font-medium">Product</th>
                    <th className="px-3 py-2 font-medium w-24">Qty</th>
                    <th className="px-3 py-2 font-medium w-28">Price</th>
                    <th className="px-3 py-2 font-medium w-24">Tax %</th>
                    <th className="px-3 py-2 font-medium w-28">Line Total</th>
                    <th className="px-3 py-2 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map((l) => {
                    const lineTotal =
                      (Number(l.unit_price) || 0) *
                        (Number(l.quantity) || 0) *
                        (1 + (Number(l.tax_percent) || 0) / 100) || 0;
                    return (
                      <tr key={l.key} className="border-t border-neutral-200 align-top">
                        <td className="px-3 py-2">
                          <select
                            value={l.product_id}
                            onChange={(e) => handleProductPick(l.key, e.target.value)}
                            className="w-full rounded-md border border-neutral-300 px-2 py-1 text-sm mb-1"
                          >
                            <option value="">Custom item</option>
                            {products.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name}
                              </option>
                            ))}
                          </select>
                          <input
                            value={l.product_name}
                            onChange={(e) => updateLine(l.key, { product_name: e.target.value })}
                            placeholder="Item name"
                            className="w-full rounded-md border border-neutral-300 px-2 py-1 text-sm"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            min="1"
                            value={l.quantity}
                            onChange={(e) => updateLine(l.key, { quantity: e.target.value })}
                            className="w-full rounded-md border border-neutral-300 px-2 py-1 text-sm"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={l.unit_price}
                            onChange={(e) => updateLine(l.key, { unit_price: e.target.value })}
                            className="w-full rounded-md border border-neutral-300 px-2 py-1 text-sm"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={l.tax_percent}
                            onChange={(e) => updateLine(l.key, { tax_percent: e.target.value })}
                            className="w-full rounded-md border border-neutral-300 px-2 py-1 text-sm"
                          />
                        </td>
                        <td className="px-3 py-2 text-neutral-700">{lineTotal.toFixed(2)}</td>
                        <td className="px-3 py-2">
                          <button
                            type="button"
                            onClick={() => removeLine(l.key)}
                            className="text-red-600 hover:text-red-700"
                          >
                            ×
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end">
            <div className="w-64 space-y-2 text-sm">
              <div className="flex justify-between text-neutral-500">
                <span>Subtotal</span>
                <span>{totals.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-neutral-500">
                <span>Tax</span>
                <span>{totals.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-neutral-500">
                <span>Discount</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  className="w-24 rounded-md border border-neutral-300 px-2 py-1 text-sm text-right"
                />
              </div>
              <div className="flex justify-between font-semibold text-neutral-900 border-t border-neutral-200 pt-2">
                <span>Grand Total</span>
                <span>{totals.grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-neutral-900 text-white text-sm font-medium px-4 py-2 disabled:opacity-50"
            >
              {saving ? "Generating..." : "Generate Invoice"}
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
