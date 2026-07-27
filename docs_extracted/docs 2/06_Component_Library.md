# 06 — Component Library

This library defines every reusable UI primitive Version 2 needs. It is mapped directly to what
already exists in the codebase so nothing is invented that doesn't have a real use, and nothing
in active use gets missed.

Current state: the app has **no shared component folder** — every page (`app/[slug]/*/page.jsx`)
writes its own inline `<div className="...">` markup with raw Tailwind utility classes, and
`TenantNav` (`app/[slug]/tenant-nav.jsx`) is the only extracted component. Version 2 introduces a
real component layer at `components/ui/`.

Add as dependencies (visual only, safe): `lucide-react` (icons), `clsx` + `tailwind-merge`
(class composition), `recharts` (dashboard/reports charts), `framer-motion` (motion — see
`13_Animation_System.md`). None of these touch `lib/supabase/*`, `lib/pdf/*`, or `lib/tenant/*`.

---

## 1. Button (`components/ui/button.jsx`)
Replaces every ad-hoc `<button className="rounded-md bg-neutral-900 ...">` and `<Link
className="rounded-md ...">` currently duplicated across `invoices/page.jsx`, `customers/page.jsx`,
`products/page.jsx`, `categories/page.jsx`.

Variants: `primary` (filled, accent `#4F46E5`), `secondary` (outlined), `ghost`, `danger`
(delete actions in customers/products/invoices), `icon` (table row actions).
States: default, hover (lift + darken), active (press, scale 0.98), loading (spinner replaces
label, disabled pointer-events), disabled (40% opacity).
Sizes: `sm` (32px, table actions), `md` (40px, default), `lg` (48px, form submit / "Save Invoice").

## 2. Input / Textarea / Select (`components/ui/input.jsx`, `select.jsx`, `textarea.jsx`)
Replaces raw `<input className="border rounded px-3 py-2">` used across customer forms, product
forms, invoice builder line items, and settings.
Props: `label`, `hint`, `error`, `icon`, `required`. 44px height, 14px radius, 1px border
`#E6EAF2`, focus ring `#4F46E5` at 30% opacity + border color change. Error state: red border +
inline message below, no layout shift (reserve space).

## 3. CurrencyInput / QuantityInput
Specific to invoice line items (`invoices/new/page.jsx` item rows). Right-aligned numerals,
tabular-nums font-feature, stepper controls for quantity, currency symbol prefix pulled from
`business.currency` / settings — display only, no change to how totals are calculated.

## 4. Select / Combobox
Used for: customer picker in invoice builder, product picker in invoice line items, category
picker in product form, template picker (`gst-classic` vs `modern`) in invoice builder/settings.
Searchable when the option list can grow past ~8 items (customers, products).

## 5. Badge / StatusPill (`components/ui/badge.jsx`)
New — the app has no status visualization today. Used for: invoice status (draft / sent / paid /
overdue), business status on dashboard (currently a plain amber banner in `dashboard/page.jsx`),
business status column in `admin/business-table.jsx`.
Colors map to the palette: paid → success, draft → neutral, sent → info, overdue → danger.

## 6. Card (`components/ui/card.jsx`)
Replaces the inline `StatCard` function in `dashboard/page.jsx` and the bare
`bg-white border border-neutral-200 rounded-lg` wrapper repeated in every list page.
Structure: `<Card><CardHeader title subtitle action /><CardBody /></Card>`. 20px radius, soft
shadow, optional hover lift for clickable cards (dashboard quick links).

## 7. DataTable (`components/ui/data-table.jsx`)
Replaces the raw `<table>` in `invoices/page.jsx`, `customers/page.jsx`, `products/page.jsx`,
`categories/page.jsx`, and `admin/business-table.jsx`. Sticky header, row hover, sortable columns,
empty state slot, loading skeleton rows (these pages already fetch client-side with
`useState`/`useEffect`, so a real loading state — not just "Loading...ˮ text — is a direct win).
See `11_Table_System.md` for full spec.

## 8. Sidebar (`components/ui/sidebar.jsx`)
Redesign of `TenantNav`. Keep it a client component, keep the same `LINKS` array and
`usePathname()` active-link logic — only replace the horizontal tab-bar markup with a collapsible
left sidebar (desktop) / top bar with drawer (mobile). Logout form (`POST /api/auth/logout`) stays
functionally identical.

## 9. Topbar
New — currently `TenantNav` bundles the business name + nav + logout into one bar. Split into
Sidebar (nav) + Topbar (business/workspace name, breadcrumb, and eventually search/notifications
once those features exist). Do not fabricate search/notification functionality that has no
backend — style the slot but leave it inert or hidden until there's a real feature behind it.

## 10. Modal / Dialog / Drawer
New — delete actions in customers/products/invoices currently have no confirmation UI (verify
against each `route.js` DELETE handler before assuming; if there's no confirm step today, add one
purely on the frontend). See `12_Modal_Drawer_System.md`.

## 11. Toast
New — for API responses (`app/api/[slug]/**/route.js` return JSON success/error today with no UI
feedback beyond page state). Add a toast layer for save/delete/error confirmation without changing
any API contract.

## 12. Tabs
Used in Settings (`settings/page.jsx`) if it has multiple sections (business info, tax, template
choice) — group into tabs instead of one long scroll, once page content is inspected.

## 13. Pagination
For invoices/customers/products lists once they can exceed one page. Check whether
`app/api/[slug]/invoices/route.js` etc. already support `limit`/`offset` params before designing
server-driven pagination; otherwise spec client-side pagination only.

## 14. EmptyState
Replaces plain `<p>No invoices yet.</p>` / `<p>No invoices yet.</p>`-style text in list pages.
Icon + message + primary action (e.g. "Create your first invoice").

## 15. Skeleton
Replaces literal `"Loading..."` text currently used in `invoices/page.jsx` and likely
`customers/page.jsx` / `products/page.jsx` (client-fetched pages). Table-row skeletons and
card skeletons.

## 16. Avatar / Initials
For business/user identity in Topbar and Admin business table (no photo upload exists — use
initials-based avatar, not a fabricated upload feature).

## 17. Breadcrumb
For nested routes: `Customers → Edit Customer`, `Invoices → INV-0001`.

## 18. PDF Preview Toolbar
Wraps the **existing** `lib/pdf/generate-invoice.js` output (rendered via `jspdf`) in a styled
frame with zoom/download/print controls. This is a UI shell around the PDF blob the existing code
already generates — it must call the same generation function, unmodified.

---

## Explicitly out of scope for this file
Do not create components for features that don't exist in the codebase (e.g. multi-currency
switcher, notifications feed, file attachments on invoices) unless `07_Page_Design_Specifications.md`
confirms the underlying page/route already supports them. Styling a feature that doesn't exist
yet creates dead UI.
