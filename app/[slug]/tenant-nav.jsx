"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "dashboard", label: "Dashboard" },
  { href: "invoices", label: "Invoices" },
  { href: "reports", label: "Reports" },
  { href: "customers", label: "Customers" },
  { href: "products", label: "Products" },
  { href: "categories", label: "Categories" },
  { href: "settings", label: "Settings" },
];

export default function TenantNav({ slug, businessName }) {
  const pathname = usePathname();

  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="px-6 py-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-neutral-500">{businessName}</p>
        </div>
        <form action="/api/auth/logout" method="POST">
          <button className="text-sm text-neutral-600 hover:text-neutral-900">Log out</button>
        </form>
      </div>
      <nav className="px-6 flex gap-1">
        {LINKS.map((link) => {
          const href = `/${slug}/${link.href}`;
          const active = pathname.startsWith(href);
          return (
            <Link
              key={link.href}
              href={href}
              className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px ${
                active
                  ? "border-neutral-900 text-neutral-900"
                  : "border-transparent text-neutral-500 hover:text-neutral-900"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
