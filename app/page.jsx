export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 px-4 text-center">
      <h1 className="text-2xl font-semibold text-neutral-900 mb-2">Billing SaaS</h1>
      <p className="text-neutral-500 mb-6">Invoicing for small businesses.</p>
      <div className="flex gap-3">
        <a href="/login" className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-900">
          Log in
        </a>
        <a href="/register" className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white">
          Get started
        </a>
      </div>
    </div>
  );
}
