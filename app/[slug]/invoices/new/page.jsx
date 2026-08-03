"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
    kg_value: "",
    liter_value: "",
    ...defaults,
  };
}

const inputClass =
  "w-full rounded-[var(--radius-input)] border px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--accent)]";
const inputStyle = {
  borderColor: "var(--border-default)",
  background: "var(--bg-surface)",
  color: "var(--text-primary)",
};

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

export default function NewInvoicePage() {
  const { slug } = useParams();
  const router = useRouter();

  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [customerId, setCustomerId] = useState("");
  const [discount, setDiscount] = useState("0");
  const [lines, setLines] = useState([newLine()]);
  const [useCustomInvNum, setUseCustomInvNum] = useState(false);
  const [customerInvNum, setCustomerInvNum] = useState("");
  const [measurementUnit, setMeasurementUnit] = useState("none");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const showKg = measurementUnit === "kg" || measurementUnit === "both";
  const showLiter = measurementUnit === "liter" || measurementUnit === "both";

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
      updateLine(key, { product_id: "" });
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
    if (useCustomInvNum) {
      const val = customerInvNum.trim();
      if (val.length < 3) {
        setError("Customer invoice number must be at least 3 characters.");
        return;
      }
      if (/^\d+$/.test(val)) {
        setError("Customer invoice number must contain at least one letter or special character.");
        return;
      }
    }

    setSaving(true);
    const res = await fetch(`/api/${slug}/invoices`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer_id: customerId,
        discount_total: discount,
        customer_invoice_number: useCustomInvNum ? customerInvNum : null,
        measurement_unit: measurementUnit,
        items: items.map((l) => ({
          product_id: l.product_id || null,
          product_name: l.product_name,
          unit_price: l.unit_price,
          tax_percent: l.tax_percent,
          quantity: l.quantity,
          kg_value: showKg ? l.kg_value || null : null,
          liter_value: showLiter ? l.liter_value || null : null,
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
    <div className="max-w-4xl">
      <h1 className="text-xl font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
        New Invoice
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardBody className="space-y-2">
            <label className="block text-sm font-medium" style={{ color: "var(--text-primary)" }}>
              Customer
            </label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className={`${inputClass} max-w-sm`}
              style={inputStyle}
            >
              <option value="">Select a customer</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {customers.length === 0 && (
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                No customers yet — add one from the Customers tab first.
              </p>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Invoice Number" />
          <CardBody className="space-y-3">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="radio"
                name="inv_num_mode"
                checked={!useCustomInvNum}
                onChange={() => {
                  setUseCustomInvNum(false);
                  setCustomerInvNum("");
                }}
                className="accent-[var(--accent)] w-4 h-4"
              />
              <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Auto-generate (system invoice number)
              </span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="radio"
                name="inv_num_mode"
                checked={useCustomInvNum}
                onChange={() => setUseCustomInvNum(true)}
                className="accent-[var(--accent)] w-4 h-4"
              />
              <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Enter customer reference number
              </span>
            </label>
            {useCustomInvNum && (
              <div className="space-y-1.5 pt-1">
                <input
                  type="text"
                  value={customerInvNum}
                  onChange={(e) => setCustomerInvNum(e.target.value)}
                  placeholder="e.g. ABC/2456 · SHREE-2026-112 · PO-90011"
                  className={inputClass}
                  style={inputStyle}
                />
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  Must include at least one letter or special character. Plain numbers are not allowed.
                </p>
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Measurement Columns" />
          <CardBody>
            <div className="flex flex-wrap gap-4">
              {[
                { value: "none", label: "None" },
                { value: "kg", label: "Kg only" },
                { value: "liter", label: "Liter only" },
                { value: "both", label: "Both (Kg & Liter)" },
              ].map((opt) => (
                <label key={opt.value} className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="radio"
                    name="measurement_unit"
                    value={opt.value}
                    checked={measurementUnit === opt.value}
                    onChange={() => setMeasurementUnit(opt.value)}
                    className="accent-[var(--accent)] w-4 h-4"
                  />
                  <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                    {opt.label}
                  </span>
                </label>
              ))}
            </div>
          </CardBody>
        </Card>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
              Line Items
            </label>
            <button
              type="button"
              onClick={addLine}
              className="inline-flex items-center gap-1.5 text-sm font-medium rounded-[var(--radius-button)] border px-3 py-1.5 transition-colors hover:bg-[var(--bg-sunken)]"
              style={{ borderColor: "var(--border-default)", color: "var(--text-primary)" }}
            >
              <Plus size={15} />
              Add line
            </button>
          </div>

          {/* Mobile: stacked card per line item */}
          <div className="sm:hidden space-y-3">
            {lines.map((l, idx) => {
              const lineTotal =
                (Number(l.unit_price) || 0) *
                  (Number(l.quantity) || 0) *
                  (1 + (Number(l.tax_percent) || 0) / 100) || 0;
              return (
                <Card key={l.key} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
                      Line {idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeLine(l.key)}
                      className="p-1 rounded-md transition-colors hover:bg-[var(--danger-light)]"
                      style={{ color: "var(--danger)" }}
                      aria-label="Remove line"
                    >
                      <X size={15} />
                    </button>
                  </div>

                  <select
                    value={l.product_id}
                    onChange={(e) => handleProductPick(l.key, e.target.value)}
                    className={inputClass}
                    style={inputStyle}
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
                    className={inputClass}
                    style={inputStyle}
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <Field label="Qty">
                      <input
                        type="number"
                        min="1"
                        value={l.quantity}
                        onChange={(e) => updateLine(l.key, { quantity: e.target.value })}
                        className={inputClass}
                        style={inputStyle}
                      />
                    </Field>
                    <Field label="Price">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={l.unit_price}
                        onChange={(e) => updateLine(l.key, { unit_price: e.target.value })}
                        className={inputClass}
                        style={inputStyle}
                      />
                    </Field>
                    {showKg && (
                      <Field label="Kg">
                        <input
                          type="number"
                          step="0.001"
                          min="0"
                          value={l.kg_value}
                          onChange={(e) => updateLine(l.key, { kg_value: e.target.value })}
                          placeholder="0.000"
                          className={inputClass}
                          style={inputStyle}
                        />
                      </Field>
                    )}
                    {showLiter && (
                      <Field label="Liter">
                        <input
                          type="number"
                          step="0.001"
                          min="0"
                          value={l.liter_value}
                          onChange={(e) => updateLine(l.key, { liter_value: e.target.value })}
                          placeholder="0.000"
                          className={inputClass}
                          style={inputStyle}
                        />
                      </Field>
                    )}
                    <Field label="Tax %">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={l.tax_percent}
                        onChange={(e) => updateLine(l.key, { tax_percent: e.target.value })}
                        className={inputClass}
                        style={inputStyle}
                      />
                    </Field>
                  </div>

                  <div
                    className="flex items-center justify-between pt-2 border-t text-sm"
                    style={{ borderColor: "var(--border-subtle)" }}
                  >
                    <span style={{ color: "var(--text-muted)" }}>Line Total</span>
                    <span className="font-medium" style={{ color: "var(--text-primary)" }}>
                      {lineTotal.toFixed(2)}
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Desktop: table */}
          <Card className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead style={{ background: "var(--bg-sunken)", color: "var(--text-muted)" }}>
                <tr className="text-left">
                  <th className="px-3 py-3 font-medium">Product</th>
                  <th className="px-3 py-3 font-medium w-20">Qty</th>
                  {showKg && <th className="px-3 py-3 font-medium w-24">Kg</th>}
                  {showLiter && <th className="px-3 py-3 font-medium w-24">Liter</th>}
                  <th className="px-3 py-3 font-medium w-28">Price</th>
                  <th className="px-3 py-3 font-medium w-24">Tax %</th>
                  <th className="px-3 py-3 font-medium w-28">Line Total</th>
                  <th className="px-3 py-3 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {lines.map((l) => {
                  const lineTotal =
                    (Number(l.unit_price) || 0) *
                      (Number(l.quantity) || 0) *
                      (1 + (Number(l.tax_percent) || 0) / 100) || 0;
                  return (
                    <tr key={l.key} className="border-t align-top" style={{ borderColor: "var(--border-subtle)" }}>
                      <td className="px-3 py-2">
                        <select
                          value={l.product_id}
                          onChange={(e) => handleProductPick(l.key, e.target.value)}
                          className="w-full rounded-[var(--radius-input)] border px-2 py-1.5 text-sm mb-1"
                          style={inputStyle}
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
                          className="w-full rounded-[var(--radius-input)] border px-2 py-1.5 text-sm"
                          style={inputStyle}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          min="1"
                          value={l.quantity}
                          onChange={(e) => updateLine(l.key, { quantity: e.target.value })}
                          className="w-full rounded-[var(--radius-input)] border px-2 py-1.5 text-sm"
                          style={inputStyle}
                        />
                      </td>
                      {showKg && (
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            step="0.001"
                            min="0"
                            value={l.kg_value}
                            onChange={(e) => updateLine(l.key, { kg_value: e.target.value })}
                            placeholder="0.000"
                            className="w-full rounded-[var(--radius-input)] border px-2 py-1.5 text-sm"
                            style={inputStyle}
                          />
                        </td>
                      )}
                      {showLiter && (
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            step="0.001"
                            min="0"
                            value={l.liter_value}
                            onChange={(e) => updateLine(l.key, { liter_value: e.target.value })}
                            placeholder="0.000"
                            className="w-full rounded-[var(--radius-input)] border px-2 py-1.5 text-sm"
                            style={inputStyle}
                          />
                        </td>
                      )}
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={l.unit_price}
                          onChange={(e) => updateLine(l.key, { unit_price: e.target.value })}
                          className="w-full rounded-[var(--radius-input)] border px-2 py-1.5 text-sm"
                          style={inputStyle}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={l.tax_percent}
                          onChange={(e) => updateLine(l.key, { tax_percent: e.target.value })}
                          className="w-full rounded-[var(--radius-input)] border px-2 py-1.5 text-sm"
                          style={inputStyle}
                        />
                      </td>
                      <td className="px-3 py-2" style={{ color: "var(--text-secondary)" }}>
                        {lineTotal.toFixed(2)}
                      </td>
                      <td className="px-3 py-2">
                        <button
                          type="button"
                          onClick={() => removeLine(l.key)}
                          className="p-1 rounded-md transition-colors hover:bg-[var(--danger-light)]"
                          style={{ color: "var(--danger)" }}
                          aria-label="Remove line"
                        >
                          <X size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        </div>

        <div className="flex justify-end">
          <div className="w-64 space-y-2 text-sm">
            <div className="flex justify-between" style={{ color: "var(--text-secondary)" }}>
              <span>Subtotal</span>
              <span>{totals.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between" style={{ color: "var(--text-secondary)" }}>
              <span>Tax</span>
              <span>{totals.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center" style={{ color: "var(--text-secondary)" }}>
              <span>Discount</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                className="w-24 rounded-[var(--radius-input)] border px-2 py-1 text-sm text-right"
                style={inputStyle}
              />
            </div>
            <div
              className="flex justify-between font-semibold border-t pt-2"
              style={{ color: "var(--text-primary)", borderColor: "var(--border-subtle)" }}
            >
              <span>Grand Total</span>
              <span>{totals.grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {error && <p className="text-sm" style={{ color: "var(--danger)" }}>{error}</p>}

        <div className="flex gap-3">
          <Button type="submit" isLoading={saving}>
            {saving ? "Generating..." : "Generate Invoice"}
          </Button>
          <Button type="button" variant="ghost" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
