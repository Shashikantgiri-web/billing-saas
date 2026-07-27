# 07 — Page Design Specifications

One spec per real route in the app. "Preserve" means the data-fetching logic, API calls, and
field set stay identical — only markup/styling changes.

## Auth — `app/(auth)/login`, `register`, `forgot-password`
Currently plain centered forms. Redesign: split layout — left panel branded (logo, product name,
short value line), right panel the form card (max-width 400px, 24px radius, floating card on
`#F8F9FB` background). Keep exact form fields and Supabase auth calls untouched.

## Dashboard — `app/[slug]/dashboard/page.jsx`
Currently: business-status amber banner + 3 `StatCard`s (Customers, Products, Invoices), fetched
server-side via Supabase count queries. Full redesign in `09_Dashboard_Redesign.md` — do not add
metrics that require new queries (e.g. revenue trend) unless `app/api/[slug]/reports/route.js`
already computes them; reuse the reports endpoint's `summary` shape if so, otherwise scope the
redesign to what the 3 existing counts + status can visually support.

## Invoices list — `app/[slug]/invoices/page.jsx`
Client-fetched (`/api/[slug]/invoices`). Table → `DataTable` with status badges, search, and the
existing "+ New Invoice" action restyled as primary `Button`. Loading text → skeleton rows. Empty
state → `EmptyState` component.

## Invoice new / detail — `app/[slug]/invoices/new/page.jsx`, `[id]/page.jsx`
See `10_Invoice_Builder_v2.md` — the most detailed spec in this set.

## Customers list — `app/[slug]/customers/page.jsx`
Same table treatment as Invoices. Row actions (edit/delete) → icon buttons with the new Modal
confirm-delete pattern.

## Customer new / edit — `app/[slug]/customers/new/page.jsx`, `[id]/edit/page.jsx`
Redesigned form using `08_Form_Design_System.md` — group fields into sections (Contact Info,
Billing Address) if the form currently renders them flat.

## Products list — `app/[slug]/products/page.jsx`
Same table pattern. If products have pricing/category columns, format currency right-aligned and
show category as a `Badge`.

## Product new / edit — `app/[slug]/products/[id]/edit/page.jsx`, `new/page.jsx`
Form redesign; category field becomes the searchable `Select` from `06_Component_Library.md`,
pulling from `app/api/[slug]/categories`.

## Categories — `app/[slug]/categories/page.jsx`
Likely a simple list + inline add. Redesign as a compact table or chip-list with an "Add category"
inline form — confirm current interaction pattern in the file before choosing table vs. chips, to
avoid changing the interaction model.

## Reports — `app/[slug]/reports/page.jsx`
Currently 3 `StatCard`s from `report.summary` (confirmed: `totalRevenue` at minimum) fetched from
`/api/[slug]/reports`. Redesign: same summary cards, upgraded visually, plus a `recharts` line/bar
chart rendering whatever time-series or breakdown data the endpoint already returns — do not
invent new report dimensions the API doesn't provide. If the API returns only aggregate totals,
keep the page as an elevated stat-card + table layout rather than fabricating a chart from nothing.

## Settings — `app/[slug]/settings/page.jsx`
Confirmed fields: business name, description, location, phone, email, GST number, invoice prefix,
currency, default tax %, logo upload, signature upload. Redesign as sectioned form: "Business
Profile", "Invoice Defaults" (prefix, tax %, currency, template choice), "Branding" (logo/signature
upload with preview). Upload flow (`uploading` state) stays wired to the same handlers — only the
dropzone/preview UI changes.

## Admin — `app/admin/page.jsx` + `business-table.jsx`
Server-rendered, gated by `profile.role === "admin"`. Table of businesses (slug, name, status,
joined_at) → `DataTable` with status `Badge`, keep the admin-only redirect logic exactly as is.

## Error / Not Found / Global Error — `app/error.jsx`, `not-found.jsx`, `global-error.jsx`
Redesign as calm, on-brand full-screen states with an icon, short message, and a "Back to
dashboard" / "Try again" action. These are Next.js error boundaries — keep their existing
`reset()`/`error` prop signatures untouched.

## Redirecting — `app/redirecting/page.jsx`
Likely a bounce page for non-admin users. Redesign as a minimal centered loading state, no logic
change.
