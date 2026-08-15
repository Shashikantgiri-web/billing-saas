"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Plus, Eye, Trash2, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function InvoicesPage() {
  const { slug } = useParams();
  const [invoices, setInvoices] = useState([]);
  const [deletedInvoices, setDeletedInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("active"); // "active" | "deleted"
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const dialogRef = useFocusTrap(!!deleteTarget);

  async function loadActive() {
    const res = await fetch(`/api/${slug}/invoices`);
    const data = await res.json();
    setInvoices(data.invoices || []);
  }

  async function loadDeleted() {
    const res = await fetch(`/api/${slug}/invoices?deleted=true`);
    const data = await res.json();
    setDeletedInvoices(data.invoices || []);
  }

  useEffect(() => {
    setLoading(true);
    Promise.all([loadActive(), loadDeleted()]).finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const res = await fetch(`/api/${slug}/invoices/${deleteTarget.id}`, { method: "DELETE" });
    setDeleting(false);
    if (res.ok) {
      setInvoices((prev) => prev.filter((i) => i.id !== deleteTarget.id));
      loadDeleted();
    }
    setDeleteTarget(null);
  }

  async function handleRestore(inv) {
    const res = await fetch(`/api/${slug}/invoices/${inv.id}/restore`, { method: "POST" });
    if (res.ok) {
      setDeletedInvoices((prev) => prev.filter((i) => i.id !== inv.id));
      loadActive();
    }
  }

  const rows = view === "active" ? invoices : deletedInvoices;

  return (
    <div>
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
          Invoices
        </h1>
        <Link href={`/${slug}/invoices/new`}>
          <Button>
            <Plus size={16} className="mr-1.5" />
            New Invoice
          </Button>
        </Link>
      </div>

      <div
        className="flex gap-1 p-1 rounded-[var(--radius-md)] w-fit mb-4"
        style={{ background: "var(--bg-sunken)" }}
      >
        {["active", "deleted"].map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={cn(
              "px-4 py-1.5 rounded-[var(--radius-sm)] text-sm font-medium transition-colors",
              view === v
                ? "bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm"
                : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            )}
          >
            {v === "active" ? "All Invoices" : "Deleted"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-12 w-full rounded-[var(--radius-md)]" />
          <Skeleton className="h-12 w-full rounded-[var(--radius-md)]" />
          <Skeleton className="h-12 w-full rounded-[var(--radius-md)]" />
        </div>
      ) : rows.length === 0 ? (
        <Card>
          <div className="p-10 text-center text-sm" style={{ color: "var(--text-muted)" }}>
            {view === "active" ? "No invoices yet." : "No deleted invoices."}
          </div>
        </Card>
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead style={{ background: "var(--bg-sunken)", color: "var(--text-muted)" }}>
              <tr className="text-left">
                <th scope="col" className="px-4 py-3 font-medium">Invoice #</th>
                <th scope="col" className="px-4 py-3 font-medium">Customer</th>
                <th scope="col" className="px-4 py-3 font-medium">Total</th>
                <th scope="col" className="px-4 py-3 font-medium">Status</th>
                <th scope="col" className="px-4 py-3 font-medium">Date</th>
                <th scope="col" className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((inv) => (
                <tr key={inv.id} className="border-t" style={{ borderColor: "var(--border-subtle)" }}>
                  <td className="px-4 py-3 font-medium" style={{ color: "var(--text-primary)" }}>
                    {inv.invoice_number}
                    {inv.customer_invoice_number && (
                      <div className="text-xs font-normal mt-0.5" style={{ color: "var(--text-muted)" }}>
                        Ref: {inv.customer_invoice_number}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>
                    {inv.customers?.name || "—"}
                  </td>
                  <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>
                    {Number(inv.grand_total).toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="text-xs font-medium px-2 py-0.5 rounded-full"
                      style={
                        inv.status === "void"
                          ? { background: "var(--danger-light)", color: "var(--danger)" }
                          : { background: "var(--success-light)", color: "var(--success)" }
                      }
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>
                    {new Date(inv.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <Link
                      href={`/${slug}/invoices/${inv.id}`}
                      className="inline-flex p-2 rounded-lg transition-colors hover:bg-[var(--bg-sunken)]"
                      style={{ color: "var(--text-secondary)" }}
                      title="View invoice"
                    >
                      <Eye size={15} />
                    </Link>
                    {view === "active" ? (
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(inv)}
                        title="Delete invoice"
                        aria-label={`Delete invoice ${inv.invoice_number}`}
                        className="p-2 rounded-lg transition-colors hover:bg-[var(--danger-light)]"
                        style={{ color: "var(--danger)" }}
                      >
                        <Trash2 size={15} />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleRestore(inv)}
                        title="Restore invoice"
                        className="p-2 rounded-lg transition-colors hover:bg-[var(--success-light)]"
                        style={{ color: "var(--success)" }}
                      >
                        <RotateCcw size={15} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div
            ref={dialogRef}
            className="w-full max-w-sm rounded-[var(--radius-dialog)] p-6 space-y-4"
            style={{ background: "var(--bg-surface)", boxShadow: "var(--shadow-dialog)" }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-dialog-title"
          >
            <div className="flex items-start gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                style={{ background: "var(--danger-light)" }}
              >
                <Trash2 size={18} style={{ color: "var(--danger)" }} />
              </div>
              <div>
                <h2 id="delete-dialog-title" className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
                  Delete Invoice?
                </h2>
                <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
                  The invoice will be moved to Deleted. You can restore it later.
                </p>
              </div>
            </div>

            <div className="rounded-[var(--radius-md)] p-3 text-sm space-y-1.5" style={{ background: "var(--bg-sunken)" }}>
              <p>
                <span className="font-medium" style={{ color: "var(--text-primary)" }}>Invoice:</span>{" "}
                <span style={{ color: "var(--text-secondary)" }}>{deleteTarget.invoice_number}</span>
              </p>
              <p>
                <span className="font-medium" style={{ color: "var(--text-primary)" }}>Customer:</span>{" "}
                <span style={{ color: "var(--text-secondary)" }}>{deleteTarget.customers?.name || "—"}</span>
              </p>
              <p>
                <span className="font-medium" style={{ color: "var(--text-primary)" }}>Amount:</span>{" "}
                <span style={{ color: "var(--text-secondary)" }}>
                  {Number(deleteTarget.grand_total).toFixed(2)}
                </span>
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <Button variant="secondary" disabled={deleting} onClick={() => setDeleteTarget(null)}>
                Cancel
              </Button>
              <Button variant="danger" isLoading={deleting} onClick={handleDelete}>
                {deleting ? "Deleting…" : "Delete Invoice"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
