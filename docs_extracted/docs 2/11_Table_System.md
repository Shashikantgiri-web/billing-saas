# 11 — Table System

Applies to: `app/[slug]/invoices/page.jsx`, `customers/page.jsx`, `products/page.jsx`,
`categories/page.jsx`, `app/admin/business-table.jsx` — every one of these currently renders a
raw `<table>` fetched client-side with a plain `"Loading..."` string and plain-text empty states.

## Structure
`DataTable` component (`06_Component_Library.md`) with: sticky header row, zebra-free white rows
on `#F8F9FB` page background, 1px row dividers `#E6EAF2`, row hover background tint, 56px row
height (44px on dense/mobile).

## Per-table specifics

**Invoices** — columns: Invoice #, Customer, Date, Amount (right-aligned), Status (`Badge`),
Actions (view/edit/delete icon buttons). Sortable by Date and Amount.

**Customers** — columns: Name, Phone, Email, Actions. Sortable by Name.

**Products** — columns: Name, Category (`Badge`), Price (right-aligned), Actions. Sortable by
Name and Price.

**Categories** — likely simpler than the others; confirm in `categories/page.jsx` whether it's a
flat list or nested — if flat, a lightweight table or chip grid both work; if nested, keep table
with indentation rather than inventing a tree component.

**Admin business table** — columns: Business Name, Slug, Status (`Badge`), Joined Date. This table
is server-rendered (no client fetch), so the loading-skeleton spec below doesn't apply to it —
only to the four client-fetched tenant tables above.

## States
- **Loading** (client-fetched tables only): skeleton rows (5–8 gray animated bars) replacing the
  literal `"Loading..."` text, matching final column widths so there's no layout shift on load.
- **Empty**: `EmptyState` component — icon, one-line message specific to the table ("No invoices
  yet" / "No customers yet" / "No products yet"), primary action linking to the relevant `new`
  route.
- **Row actions**: icon buttons (edit = pencil, delete = trash) revealed on row hover on desktop,
  always visible on mobile/touch. Delete triggers the `ConfirmDialog` from
  `12_Modal_Drawer_System.md` before calling the existing DELETE handler — never delete on a bare
  click.

## Responsive behavior
Below ~768px, collapse each row into a stacked card (label/value pairs) rather than horizontal
scroll — see `15_Responsive_System.md` for the breakpoint and pattern shared across all four
tenant list pages.

## Search / filter
Add a search input above tables that already have enough rows to warrant it (Invoices, Customers,
Products). Filter client-side against the data already fetched — do not add new API query params
unless the existing `/api/[slug]/{invoices,customers,products}` routes already support a `search`
param; check before wiring it server-side.
