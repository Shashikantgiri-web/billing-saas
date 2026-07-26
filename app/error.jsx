"use client";

export default function Error({ error, reset }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <div className="text-center max-w-sm">
        <h1 className="text-lg font-semibold text-neutral-900 mb-2">Something went wrong</h1>
        <p className="text-sm text-neutral-500 mb-4">
          An unexpected error occurred loading this page.
        </p>
        <button
          onClick={reset}
          className="rounded-md bg-neutral-900 text-white text-sm font-medium px-4 py-2"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
