"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsPage() {
  const { slug } = useParams();
  const supabase = createClient();
  const [business, setBusiness] = useState(null);
  const [form, setForm] = useState(null);
  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [uploading, setUploading] = useState("");

  async function load() {
    setLoading(true);
    const res = await fetch(`/api/${slug}/settings`);
    const data = await res.json();
    setBusiness(data.business);
    setForm({
      name: data.business?.name || "",
      description: data.business?.description || "",
      location: data.business?.location || "",
      phone: data.business?.phone || "",
      email: data.business?.email || "",
      gst_number: data.settings?.gst_number || "",
      invoice_prefix: data.settings?.invoice_prefix || "INV",
      currency: data.settings?.currency || "INR",
      default_tax_percent: data.settings?.default_tax_percent || 0,
      logo_url: data.settings?.logo_url || "",
      signature_url: data.settings?.signature_url || "",
    });
    setTerms(
      Array.isArray(data.settings?.terms_conditions) && data.settings.terms_conditions.length > 0
        ? data.settings.terms_conditions
        : [
            { order: 1, text: "Goods once sold will not be taken back." },
            { order: 2, text: "Interest will be charged on overdue bills." },
            { order: 3, text: "Subject to local jurisdiction only." },
          ]
    );
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleUpload(field, file) {
    if (!file || !business) return;
    setUploading(field);
    setError("");
    const ext = file.name.split(".").pop();
    const path = `${business.id}/${field}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("business-assets")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      setError(uploadError.message);
      setUploading("");
      return;
    }

    const { data: publicUrl } = supabase.storage.from("business-assets").getPublicUrl(path);
    setForm((f) => ({ ...f, [field]: publicUrl.publicUrl }));
    setUploading("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setSaving(true);

    const normalizedTerms = terms
      .filter((t) => t.text.trim().length > 0)
      .map((t, i) => ({ order: i + 1, text: t.text.trim() }));

    const res = await fetch(`/api/${slug}/settings`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, terms_conditions: normalizedTerms }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error || "Could not save settings.");
      return;
    }
    setSuccess(true);
  }

  if (loading || !form) {
    return (
      <div className="max-w-2xl space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full rounded-[var(--radius-card)]" />
        <Skeleton className="h-64 w-full rounded-[var(--radius-card)]" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold mb-6" style={{ color: "var(--text-primary)" }}>
        Business Settings
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader title="Business Profile" />
          <CardBody className="space-y-4">
            <Input label="Business Name" value={form.name} onChange={update("name")} />
            <Textarea label="Description" value={form.description} onChange={update("description")} rows={2} />
            <Input label="Location" value={form.location} onChange={update("location")} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Phone" value={form.phone} onChange={update("phone")} />
              <Input label="Email" type="email" value={form.email} onChange={update("email")} />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Branding" />
          <CardBody className="space-y-4">
            <UploadField
              label="Logo"
              url={form.logo_url}
              uploading={uploading === "logo_url"}
              onChange={(file) => handleUpload("logo_url", file)}
            />
            <UploadField
              label="Signature"
              url={form.signature_url}
              uploading={uploading === "signature_url"}
              onChange={(file) => handleUpload("signature_url", file)}
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Invoicing" />
          <CardBody className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Invoice Prefix" value={form.invoice_prefix} onChange={update("invoice_prefix")} />
              <Input label="Currency" value={form.currency} onChange={update("currency")} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="GST Number" value={form.gst_number} onChange={update("gst_number")} />
              <Input
                label="Default Tax % (total GST)"
                type="number"
                step="0.01"
                value={form.default_tax_percent}
                onChange={update("default_tax_percent")}
                hint="Split evenly into CGST + SGST on invoices"
              />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Terms & Conditions"
            subtitle="Printed at the bottom of every invoice"
          />
          <CardBody className="space-y-3">
            {terms.map((term, i) => (
              <div key={i} className="flex items-center gap-3">
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
                  style={{ background: "var(--accent-light)", color: "var(--accent)" }}
                >
                  {i + 1}
                </span>
                <input
                  type="text"
                  value={term.text}
                  onChange={(e) => {
                    const updated = [...terms];
                    updated[i] = { ...updated[i], text: e.target.value };
                    setTerms(updated);
                  }}
                  placeholder={`Condition ${i + 1}`}
                  className="flex-1 rounded-[var(--radius-input)] border px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  style={{
                    borderColor: "var(--border-default)",
                    background: "var(--bg-surface)",
                    color: "var(--text-primary)",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setTerms(terms.filter((_, idx) => idx !== i))}
                  className="p-1.5 rounded-lg transition-colors hover:bg-[var(--danger-light)]"
                  style={{ color: "var(--danger)" }}
                  aria-label={`Remove condition ${i + 1}`}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={() => setTerms([...terms, { order: terms.length + 1, text: "" }])}
              className="flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-[var(--radius-button)] border border-dashed transition-colors hover:bg-[var(--accent-light)]"
              style={{ borderColor: "var(--accent-border)", color: "var(--accent)" }}
            >
              <Plus size={15} />
              Add New Condition
            </button>
          </CardBody>
        </Card>

        {error && <p className="text-sm" style={{ color: "var(--danger)" }}>{error}</p>}
        {success && <p className="text-sm" style={{ color: "var(--success)" }}>Settings saved.</p>}

        <Button type="submit" isLoading={saving}>
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </form>
    </div>
  );
}

function UploadField({ label, url, uploading, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-primary)" }}>
        {label}
      </label>
      <div className="flex items-center gap-3">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt={label}
            className="h-12 w-12 object-contain rounded-[var(--radius-md)] border"
            style={{ borderColor: "var(--border-default)", background: "var(--bg-surface)" }}
          />
        ) : (
          <div
            className="h-12 w-12 rounded-[var(--radius-md)] border border-dashed"
            style={{ borderColor: "var(--border-default)" }}
          />
        )}
        <input
          type="file"
          accept="image/*"
          disabled={uploading}
          onChange={(e) => onChange(e.target.files?.[0])}
          className="text-sm"
          style={{ color: "var(--text-secondary)" }}
        />
        {uploading && (
          <span className="text-sm" style={{ color: "var(--text-muted)" }}>
            Uploading...
          </span>
        )}
      </div>
    </div>
  );
}
