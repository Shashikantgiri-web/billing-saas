"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ReportsPage() {
  const { slug } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await fetch(`/api/${slug}/reports`);
      setReport(await res.json());
      setLoading(false);
    }
    load();
  }, [slug]);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
        Reports
      </h1>

      {loading || !report ? (
        <ReportsLoadingBody />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard label="Total Revenue" value={report.summary.totalRevenue.toFixed(2)} />
            <StatCard label="Invoices" value={report.summary.invoiceCount} />
            <StatCard label="Voided" value={report.summary.voidCount} />
          </div>

          <Section title="Sales by Month">
            {report.salesTimeline.length === 0 ? (
              <Empty text="No sales yet." />
            ) : (
              <Table
                headers={["Month", "Total"]}
                rows={report.salesTimeline.map((s) => [s.month, s.total.toFixed(2)])}
              />
            )}
          </Section>

          <Section title="Top Customers">
            {report.topCustomers.length === 0 ? (
              <Empty text="No customer revenue yet." />
            ) : (
              <Table
                headers={["Customer", "Revenue"]}
                rows={report.topCustomers.map((c) => [c.name, c.total.toFixed(2)])}
              />
            )}
          </Section>

          <Section title="Top Products">
            {report.topProducts.length === 0 ? (
              <Empty text="No product sales yet." />
            ) : (
              <Table
                headers={["Product", "Quantity Sold", "Revenue"]}
                rows={report.topProducts.map((p) => [p.name, p.quantity, p.revenue.toFixed(2)])}
              />
            )}
          </Section>

          <Section title="Recent Invoices">
            {report.recentInvoices.length === 0 ? (
              <Empty text="No invoices yet." />
            ) : (
              <Card className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead style={{ background: "var(--bg-sunken)", color: "var(--text-muted)" }}>
                    <tr className="text-left">
                      <th className="px-4 py-3 font-medium">Invoice #</th>
                      <th className="px-4 py-3 font-medium">Customer</th>
                      <th className="px-4 py-3 font-medium">Total</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.recentInvoices.map((inv) => (
                      <tr key={inv.id} className="border-t" style={{ borderColor: "var(--border-subtle)" }}>
                        <td className="px-4 py-3 font-medium" style={{ color: "var(--text-primary)" }}>{inv.invoice_number}</td>
                        <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>{inv.customers?.name || "—"}</td>
                        <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>{Number(inv.grand_total).toFixed(2)}</td>
                        <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>{inv.status}</td>
                        <td className="px-4 py-3 text-right">
                          <Link href={`/${slug}/invoices/${inv.id}`} className="hover:underline" style={{ color: "var(--accent)" }}>
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            )}
          </Section>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <Card className="p-5">
      <p className="text-sm" style={{ color: "var(--text-muted)" }}>{label}</p>
      <p className="text-2xl font-semibold mt-1" style={{ color: "var(--text-primary)" }}>{value}</p>
    </Card>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <h2 className="text-sm font-semibold mb-2" style={{ color: "var(--text-secondary)" }}>{title}</h2>
      {children}
    </div>
  );
}

function Empty({ text }) {
  return <p className="text-sm" style={{ color: "var(--text-muted)" }}>{text}</p>;
}

function Table({ headers, rows }) {
  return (
    <Card className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead style={{ background: "var(--bg-sunken)", color: "var(--text-muted)" }}>
          <tr className="text-left">
            {headers.map((h) => (
              <th key={h} className="px-4 py-3 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-t" style={{ borderColor: "var(--border-subtle)" }}>
              {row.map((cell, j) => (
                <td
                  key={j}
                  className="px-4 py-3"
                  style={{ color: j === 0 ? "var(--text-primary)" : "var(--text-secondary)" }}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

function ReportsLoadingBody() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Skeleton className="h-20 w-full rounded-[var(--radius-card)]" />
        <Skeleton className="h-20 w-full rounded-[var(--radius-card)]" />
        <Skeleton className="h-20 w-full rounded-[var(--radius-card)]" />
      </div>
      <Skeleton className="h-40 w-full rounded-[var(--radius-card)]" />
      <Skeleton className="h-40 w-full rounded-[var(--radius-card)]" />
    </div>
  );
}
