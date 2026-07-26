import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <div className="text-center max-w-sm">
        <h1 className="text-lg font-semibold text-neutral-900 mb-2">Page not found</h1>
        <p className="text-sm text-neutral-500 mb-4">
          The page you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.
        </p>
        <Link href="/" className="text-sm font-medium text-neutral-900 underline">
          Go home
        </Link>
      </div>
    </div>
  );
}
