"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Download } from "lucide-react";
import { generateInvoicePDF, AVAILABLE_TEMPLATES } from "@/lib/pdf/generate-invoice";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function InvoiceDetailPage() {
  const { slug, id } = useParams();
  const [data, setData] = useState(null);
  const [template, setTemplate] = useState("gst_classic");
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
      const { invoice, items, business } = data;
      const settings = business?.business_settings?.[0] || business?.business_settings || {};

      const doc = await generateInvoicePDF({ invoice, items, business, settings }, template);
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
      <div className="max-w-2xl space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full rounded-[var(--radius-card)]" />
        <Skeleton className="h-48 w-full rounded-[var(--radius-card)]" />
      </div>
    );
  }

  const { invoice, items } = data;
  const showKg = invoice.measurement_unit === "kg" || invoice.measurement_unit === "both";
  const showLiter = invoice.measurement_unit === "liter" || invoice.measurement_unit === "both";

  return (
    <div className="max-w-2xl">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
            {invoice.invoice_number}
          </h1>
          {invoice.customer_invoice_number && (
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
              Ref: {invoice.customer_invoice_number}
            </p>
          )}
          <span
            className="inline-block text-xs font-medium px-2 py-0.5 rounded-full mt-1"
            style={
              invoice.status === "void"
                ? { background: "var(--danger-light)", color: "var(--danger)" }
                : { background: "var(--success-light)", color: "var(--success)" }
            }
          >
            {invoice.status}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
            className="rounded-[var(--radius-input)] border px-2 py-2 text-sm"
            style={{ borderColor: "var(--border-default)", background: "var(--bg-surface)", color: "var(--text-primary)" }}
          >
            {AVAILABLE_TEMPLATES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
          <Button onClick={handleDownload} isLoading={downloading}>
            <Download size={15} className="mr-1.5" />
            {downloading ? "Preparing..." : "Download PDF"}
          </Button>
          {invoice.status !== "void" && (
            <Button variant="danger" onClick={handleVoid} isLoading={voiding}>
              {voiding ? "Voiding..." : "Void"}
            </Button>
          )}
        </div>
      </div>

      <Card className="mb-4">
        <CardBody>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>Bill To</p>
          <p className="font-medium" style={{ color: "var(--text-primary)" }}>{invoice.customers?.name}</p>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{invoice.customers?.email}</p>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{invoice.customers?.phone}</p>
        </CardBody>
      </Card>

      <Card className="overflow-x-auto mb-4">
        <table className="w-full text-sm">
          <thead style={{ background: "var(--bg-sunken)", color: "var(--text-muted)" }}>
            <tr className="text-left">
              <th className="px-4 py-3 font-medium">Item</th>
              <th className="px-4 py-3 font-medium">Qty</th>
              {showKg && <th className="px-4 py-3 font-medium">Kg</th>}
              {showLiter && <th className="px-4 py-3 font-medium">Liter</th>}
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Tax %</th>
              <th className="px-4 py-3 font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t" style={{ borderColor: "var(--border-subtle)" }}>
                <td className="px-4 py-3" style={{ color: "var(--text-primary)" }}>{item.product_name}</td>
                <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>{item.quantity}</td>
                {showKg && (
                  <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>
                    {item.kg_value != null ? Number(item.kg_value).toFixed(3) : "—"}
                  </td>
                )}
                {showLiter && (
                  <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>
                    {item.liter_value != null ? Number(item.liter_value).toFixed(3) : "—"}
                  </td>
                )}
                <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>{Number(item.unit_price).toFixed(2)}</td>
                <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>{Number(item.tax_percent).toFixed(2)}%</td>
                <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>{Number(item.line_total).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <div className="flex justify-end">
        <div className="w-64 space-y-2 text-sm">
          <div className="flex justify-between" style={{ color: "var(--text-secondary)" }}>
            <span>Subtotal</span>
            <span>{Number(invoice.subtotal).toFixed(2)}</span>
          </div>
          <div className="flex justify-between" style={{ color: "var(--text-secondary)" }}>
            <span>Tax</span>
            <span>{Number(invoice.tax_total).toFixed(2)}</span>
          </div>
          <div className="flex justify-between" style={{ color: "var(--text-secondary)" }}>
            <span>Discount</span>
            <span>{Number(invoice.discount_total).toFixed(2)}</span>
          </div>
          <div
            className="flex justify-between font-semibold border-t pt-2"
            style={{ color: "var(--text-primary)", borderColor: "var(--border-subtle)" }}
          >
            <span>Grand Total</span>
            <span>{Number(invoice.grand_total).toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
