import Link from "next/link";

export const metadata = {
  title: "GST Invoicing & Billing Software for Small Businesses",
  description:
    "Create GST-compliant tax invoices in seconds, manage customers and products, and track revenue with clear reports. Free to start — no credit card required.",
};

const FEATURES = [
  {
    title: "GST-Compliant Tax Invoices",
    body:
      "Generate professional, GST-compliant invoices with CGST/SGST breakdowns, HSN-ready item tables, and amount-in-words — ready to send in seconds.",
  },
  {
    title: "Customer & Product Management",
    body:
      "Keep a clean, searchable record of every customer and product so building your next invoice takes clicks, not typing.",
  },
  {
    title: "Revenue Reports",
    body:
      "See monthly sales trends, your top customers, and best-selling products at a glance — no spreadsheets required.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="max-w-5xl mx-auto px-4 pt-16 pb-10 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icon-192.png" alt="BillingSaaS" className="w-16 h-16 rounded-2xl mb-4 mx-auto" />
        <h1 className="text-3xl sm:text-4xl font-semibold text-neutral-900 mb-3">
          Simple, GST-Compliant Invoicing for Small Businesses
        </h1>
        <p className="text-neutral-600 max-w-2xl mx-auto mb-8">
          <strong>BillingSaaS</strong> helps small businesses create professional tax invoices,
          manage customers and products, and track revenue — all from one clean dashboard.
        </p>
        <nav className="flex gap-3 justify-center" aria-label="Primary">
          <Link
            href="/login"
            className="rounded-md border border-neutral-300 px-5 py-2.5 text-sm font-medium text-neutral-900 hover:bg-neutral-100 transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="rounded-md bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
          >
            Get started free
          </Link>
        </nav>
      </header>

      <main className="max-w-5xl mx-auto px-4 pb-20">
        <h2 className="text-xl font-semibold text-neutral-900 text-center mb-8">
          Everything you need to bill customers professionally
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {FEATURES.map((f) => (
            <div key={f.title} className="bg-white rounded-lg border border-neutral-200 p-6">
              <h3 className="font-semibold text-neutral-900 mb-2">{f.title}</h3>
              <p className="text-sm text-neutral-600">{f.body}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-14">
          <h2 className="text-lg font-semibold text-neutral-900 mb-3">
            Ready to send your first invoice?
          </h2>
          <p className="text-sm text-neutral-600 mb-5">
            Create a free account and generate your first GST invoice in under two minutes.
          </p>
          <Link
            href="/register"
            className="inline-block rounded-md bg-indigo-600 px-6 py-3 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
          >
            Create your free account
          </Link>
        </div>
      </main>

      <footer className="border-t border-neutral-200 py-8">
        <div className="max-w-5xl mx-auto px-4 flex flex-wrap items-center justify-between gap-4 text-sm text-neutral-500">
          <span>© {new Date().getFullYear()} BillingSaaS. All rights reserved.</span>
          <nav className="flex gap-4" aria-label="Footer">
            <Link href="/login" className="hover:text-neutral-900">Log in</Link>
            <Link href="/register" className="hover:text-neutral-900">Sign up</Link>
          </nav>
        </div>
      </footer>

      {/* Structured data for search engines */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "BillingSaaS",
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
            description:
              "GST-compliant invoicing and billing software for small businesses. Create tax invoices, manage customers and products, and track revenue.",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "INR",
            },
          }),
        }}
      />
    </div>
  );
}
