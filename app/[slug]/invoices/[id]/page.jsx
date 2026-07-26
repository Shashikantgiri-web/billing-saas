"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import TenantNav from "../../tenant-nav";

export default function InvoiceDetailPage() {
  const { slug, id } = useParams();
  const [data, setData] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [voiding, setVoiding] = useState(false);

  async function load() {
    const res = await fetch(`/api/${slug}/invoices/${id}`);
    const json = await res.json();
    setData(json);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, id]);

  async function handleDownload() {
    if (!data) return;
    setDownloading(true);
    try {
      const { default: jsPDF } = await import("jspdf");
      const doc = new jsPDF();
      const { invoice, items, business } = data;
      const settings = business?.business_settings?.[0] || business?.business_settings || {};
      const currency = settings.currency || "";

      let y = 20;
      doc.setFontSize(16);
      doc.text(business?.name || "Invoice", 14, y);
      y += 8;
      doc.setFontSize(10);
      if (business?.email) { doc.text(business.email, 14, y); y += 5; }
      if (business?.phone) { doc.text(business.phone, 14, y); y += 5; }
      if (settings.gst_number) { doc.text(`GST: ${settings.gst_number}`, 14, y); y += 5; }

      y += 5;
      doc.setFontSize(12);
      doc.text(`Invoice ${invoice.invoice_number}`, 14, y);
      doc.text(new Date(invoice.created_at).toLocaleDateString(), 150, y);
      y += 8;

      doc.setFontSize(10);
      doc.text("Bill To:", 14, y);
      y += 5;
      doc.text(invoice.customers?.name || "", 14, y);
      y += 5;
      if (invoice.customers?.email) { doc.text(invoice.customers.email, 14, y); y += 5; }
      if (invoice.customers?.phone) { doc.text(invoice.customers.phone, 14, y); y += 5; }

      y += 8;
      doc.setFontSize(10);
      doc.text("Item", 14, y);
      doc.text("Qty", 100, y);
      doc.text("Price", 125, y);
      doc.text("Tax%", 150, y);
      doc.text("Total", 175, y);
      y += 2;
      doc.line(14, y, 196, y);
      y += 6;

      items.forEach((item) => {
        doc.text(item.product_name, 14, y);
        doc.text(String(item.quantity), 100, y);
        doc.text(Number(item.unit_price).toFixed(2), 125, y);
        doc.text(Number(item.tax_percent).toFixed(2), 150, y);
        doc.text(Number(item.line_total).toFixed(2), 175, y);
        y += 6;
      });

      y += 4;
      doc.line(14, y, 196, y);
      y += 8;

      doc.text(`Subtotal: ${currency} ${Number(invoice.subtotal).toFixed(2)}`, 140, y); y += 6;
      doc.text(`Tax: ${currency} ${Number(invoice.tax_total).toFixed(2)}`, 140, y); y += 6;
      doc.text(`Discount: ${currency} ${Number(invoice.discount_total).toFixed(2)}`, 140, y); y += 6;
      doc.setFontSize(12);
      doc.text(`Grand Total: ${currency} ${Number(invoice.grand_total).toFixed(2)}`, 140, y);

      doc.save(`${invoice.invoice_number}.pdf`);
    } finally {
      setDownloading(false);
    }
  }

  async function handleVoid() {
    if (!confirm("Void this invoice? This cannot be undone.")) return;
    setVoiding(true);
    const res = await fetch(`/api/${slug}/invoices/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "void" }),
    });
    setVoiding(false);
    if (res.ok) {
      load();
    } else {
      const d = await res.json();
      alert(d.error || "Could not void invoice.");
    }
  }

  if (!data || !data.invoice) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <TenantNav slug={slug} />
        <main className="p-6">
          <p className="text-sm text-neutral-500">Loading...</p>
        </main>
      </div>
    );
  }

  const { invoice, items, business } = data;

  return (
    <div className="min-h-screen bg-neutral-50">
      <TenantNav slug={slug} businessName={business?.name} />
      <main className="p-6 max-w-2xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-lg font-semibold text-neutral-900">{invoice.invoice_number}</h1>
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                invoice.status === "void" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
              }`}
            >
              {invoice.status}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="rounded-md bg-neutral-900 text-white text-sm font-medium px-4 py-2 disabled:opacity-50"
            >
              {downloading ? "Preparing..." : "Download PDF"}
            </button>
            {invoice.status !== "void" && (
              <button
                onClick={handleVoid}
                disabled={voiding}
                className="rounded-md border border-red-300 text-red-600 text-sm font-medium px-4 py-2 disabled:opacity-50"
              >
                {voiding ? "Voiding..." : "Void"}
              </button>
            )}
          </div>
        </div>

        <div className="bg-white border border-neutral-200 rounded-lg p-5 mb-4">
          <p className="text-sm text-neutral-500">Bill To</p>
          <p className="text-neutral-900 font-medium">{invoice.customers?.name}</p>
          <p className="text-sm text-neutral-500">{invoice.customers?.email}</p>
          <p className="text-sm text-neutral-500">{invoice.customers?.phone}</p>
        </div>

        <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden mb-4">
          <table className="w-full text-sm">
            <thead className="bg-neutral-100 text-neutral-500 text-left">
              <tr>
                <th className="px-4 py-2 font-medium">Item</th>
                <th className="px-4 py-2 font-medium">Qty</th>
                <th className="px-4 py-2 font-medium">Price</th>
                <th className="px-4 py-2 font-medium">Tax %</th>
                <th className="px-4 py-2 font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t border-neutral-200">
                  <td className="px-4 py-2 text-neutral-900">{item.product_name}</td>
                  <td className="px-4 py-2 text-neutral-500">{item.quantity}</td>
                  <td className="px-4 py-2 text-neutral-500">{Number(item.unit_price).toFixed(2)}</td>
                  <td className="px-4 py-2 text-neutral-500">{Number(item.tax_percent).toFixed(2)}%</td>
                  <td className="px-4 py-2 text-neutral-500">{Number(item.line_total).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end">
          <div className="w-64 space-y-2 text-sm">
            <div className="flex justify-between text-neutral-500">
              <span>Subtotal</span>
              <span>{Number(invoice.subtotal).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-neutral-500">
              <span>Tax</span>
              <span>{Number(invoice.tax_total).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-neutral-500">
              <span>Discount</span>
              <span>{Number(invoice.discount_total).toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold text-neutral-900 border-t border-neutral-200 pt-2">
              <span>Grand Total</span>
              <span>{Number(invoice.grand_total).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
