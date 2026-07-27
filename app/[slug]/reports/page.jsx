"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import TenantNav from "../tenant-nav";

export default function ReportsPage() {
  const { slug } = useParams();
  const [business, setBusiness] = useState(null);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [bizRes, repRes] = await Promise.all([
        fetch(`/api/${slug}`),
        fetch(`/api/${slug}/reports`),
      ]);
      setBusiness((await bizRes.json()).business);
      setReport(await repRes.json());
      setLoading(false);
    }
    load();
  }, [slug]);

  return (
    <div className="min-h-screen bg-neutral-50">
      <TenantNav slug={slug} businessName={business?.name} />

      <main className="p-6 space-y-6">
        <h1 className="text-lg font-semibold text-neutral-900">Reports</h1>

        {loading || !report ? (
          <p className="text-sm text-neutral-500">Loading...</p>
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
                <div className="bg-white border border-neutral-200 rounded-lg overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-neutral-100 text-neutral-500 text-left">
                      <tr>
                        <th className="px-4 py-2 font-medium">Invoice #</th>
                        <th className="px-4 py-2 font-medium">Customer</th>
                        <th className="px-4 py-2 font-medium">Total</th>
                        <th className="px-4 py-2 font-medium">Status</th>
                        <th className="px-4 py-2 font-medium"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.recentInvoices.map((inv) => (
                        <tr key={inv.id} className="border-t border-neutral-200">
                          <td className="px-4 py-2 text-neutral-900 font-medium">{inv.invoice_number}</td>
                          <td className="px-4 py-2 text-neutral-500">{inv.customers?.name || "—"}</td>
                          <td className="px-4 py-2 text-neutral-500">{Number(inv.grand_total).toFixed(2)}</td>
                          <td className="px-4 py-2 text-neutral-500">{inv.status}</td>
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
            </Section>
          </>
        )}
      </main>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-5">
      <p className="text-sm text-neutral-500">{label}</p>
      <p className="text-2xl font-semibold text-neutral-900 mt-1">{value}</p>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-neutral-700 mb-2">{title}</h2>
      {children}
    </div>
  );
}

function Empty({ text }) {
  return <p className="text-sm text-neutral-500">{text}</p>;
}

function Table({ headers, rows }) {
  return (
    <div className="bg-white border border-neutral-200 rounded-lg overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-neutral-100 text-neutral-500 text-left">
          <tr>
            {headers.map((h) => (
              <th key={h} className="px-4 py-2 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-t border-neutral-200">
              {row.map((cell, j) => (
                <td key={j} className={`px-4 py-2 ${j === 0 ? "text-neutral-900" : "text-neutral-500"}`}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
