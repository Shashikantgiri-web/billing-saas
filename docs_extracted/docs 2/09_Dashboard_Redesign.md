# 09 — Dashboard Redesign

Target file: `app/[slug]/dashboard/page.jsx` (server component).

## What exists today
- Business status banner (only shown when `status !== "active"`).
- Three `StatCard`s: Customers, Products, Invoices — each a single Supabase `count` query run in
  parallel via `Promise.all`.
- No charts, no recent-activity list, no quick actions.

## Redesign, scoped to real data
1. **Status banner** → restyle as a dismissible, icon-led banner using the `Badge`/alert pattern
   from `06_Component_Library.md`. Keep the conditional render logic (`business.status !==
   "active"`) exactly as is.
2. **Stat cards** → upgrade `StatCard` visually (icon, larger number, subtle trend indicator only
   if a previous-period count is actually queryable cheaply; otherwise omit the trend rather than
   fabricate one). Same 3 metrics: Customers, Products, Invoices.
3. **Recent Invoices** — add a small table/list pulling the 5 most recent invoices. Reuse the same
   query pattern the Invoices list / `app/api/[slug]/invoices` endpoint already uses (order by
   created date, limit 5) rather than inventing a new data shape.
4. **Quick actions** — "New Invoice", "New Customer", "New Product" as three compact action
   cards/buttons linking to the existing `new` routes. No new functionality, just navigation
   shortcuts that already exist as links elsewhere in the app.
5. **Revenue snapshot** — only include if `app/api/[slug]/reports/route.js`'s `summary` object
   (confirmed to include `totalRevenue`) can be fetched here without duplicating expensive queries.
   If reusing the Reports endpoint is too heavy for a dashboard load, skip this and keep the
   dashboard to the 3 counts + recent invoices + quick actions — do not add a chart with fake
   numbers.

## Layout
12-column grid: stat cards span 4 columns each (3 across on desktop, stacked on mobile); recent
invoices + quick actions split roughly 8/4 below. Sidebar (`TenantNav` → new `Sidebar`) stays
persistent per `05_Layout_System.md`.

## Explicitly do not add
Announcements, calendar widgets, top-customers ranking, or any metric not backed by an existing
query — these were listed in the original ChatGPT outline but have no data source in this codebase
and would need new backend work, which is out of scope for a UI-only redesign.
