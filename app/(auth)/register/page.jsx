"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/slug";

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();
  const [form, setForm] = useState({
    fullName: "",
    businessName: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: { data: { full_name: form.fullName } },
      });
      if (signUpError) throw signUpError;

      const user = signUpData.user;
      if (!user) {
        // Email confirmation required — no session yet.
        setError(
          "Check your email to confirm your account, then log in to finish setting up your business."
        );
        setLoading(false);
        return;
      }

      let slug = slugify(form.businessName);
      const { data: business, error: bizError } = await supabase
        .from("business")
        .insert({
          owner_user_id: user.id,
          slug,
          name: form.businessName,
          email: form.email,
        })
        .select()
        .single();

      if (bizError) throw bizError;

      await supabase.from("business_settings").insert({
        business_id: business.id,
      });

      router.push(`/${business.slug}/dashboard`);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-sm">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icon-192.png" alt="BillingSaaS" className="w-10 h-10 rounded-xl mb-4" />
        <h1 className="text-xl font-semibold text-neutral-900 mb-1">Create your account</h1>
        <p className="text-sm text-neutral-500 mb-6">Set up your business billing workspace.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Full name</label>
            <input
              type="text"
              required
              value={form.fullName}
              onChange={update("fullName")}
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Business name</label>
            <input
              type="text"
              required
              value={form.businessName}
              onChange={update("businessName")}
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={update("email")}
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={form.password}
              onChange={update("password")}
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-neutral-900 text-white text-sm font-medium py-2 disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="text-sm text-neutral-500 mt-4">
          Already have an account?{" "}
          <a href="/login" className="text-neutral-900 font-medium">
            Log in
          </a>
        </p>
      </div>
    </div>
  );
}
