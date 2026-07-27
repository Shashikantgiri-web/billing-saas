"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SettingsPage() {
  const { slug } = useParams();
  const supabase = createClient();
  const [business, setBusiness] = useState(null);
  const [form, setForm] = useState(null);
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
    const res = await fetch(`/api/${slug}/settings`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
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
      <div className="min-h-screen bg-neutral-50">
                <main className="p-6">
          <p className="text-sm text-neutral-500">Loading...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
            <main className="p-6 max-w-xl">
        <h1 className="text-lg font-semibold text-neutral-900 mb-4">Business Settings</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="space-y-4">
            <h2 className="text-sm font-semibold text-neutral-700">Business Profile</h2>
            <Field label="Business Name" value={form.name} onChange={update("name")} />
            <Field label="Description" value={form.description} onChange={update("description")} textarea />
            <Field label="Location" value={form.location} onChange={update("location")} />
            <div className="grid grid-cols-2 gap-4">
              <Field label="Phone" value={form.phone} onChange={update("phone")} />
              <Field label="Email" type="email" value={form.email} onChange={update("email")} />
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-sm font-semibold text-neutral-700">Branding</h2>
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
          </section>

          <section className="space-y-4">
            <h2 className="text-sm font-semibold text-neutral-700">Invoicing</h2>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Invoice Prefix" value={form.invoice_prefix} onChange={update("invoice_prefix")} />
              <Field label="Currency" value={form.currency} onChange={update("currency")} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="GST Number" value={form.gst_number} onChange={update("gst_number")} />
              <Field
                label="Default Tax %"
                type="number"
                step="0.01"
                value={form.default_tax_percent}
                onChange={update("default_tax_percent")}
              />
            </div>
          </section>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-green-600">Settings saved.</p>}

          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-neutral-900 text-white text-sm font-medium px-4 py-2 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </form>
      </main>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", step, textarea }) {
  return (
    <div>
      <label className="block text-sm font-medium text-neutral-700 mb-1">{label}</label>
      {textarea ? (
        <textarea
          value={value}
          onChange={onChange}
          rows={2}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
        />
      ) : (
        <input
          type={type}
          step={step}
          value={value}
          onChange={onChange}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
        />
      )}
    </div>
  );
}

function UploadField({ label, url, uploading, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium text-neutral-700 mb-1">{label}</label>
      <div className="flex items-center gap-3">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt={label} className="h-12 w-12 object-contain border border-neutral-200 rounded-md bg-white" />
        ) : (
          <div className="h-12 w-12 border border-dashed border-neutral-300 rounded-md" />
        )}
        <input
          type="file"
          accept="image/*"
          disabled={uploading}
          onChange={(e) => onChange(e.target.files?.[0])}
          className="text-sm text-neutral-600"
        />
        {uploading && <span className="text-sm text-neutral-500">Uploading...</span>}
      </div>
    </div>
  );
}
