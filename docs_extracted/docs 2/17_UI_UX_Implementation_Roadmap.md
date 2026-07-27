# 17 — UI/UX Implementation Roadmap

Ordered so each phase is shippable and testable on its own without ever leaving the app broken.
Reference files noted per phase.

## Phase 1 — Design tokens
Set up `03_Design_System.md`'s tokens in `app/globals.css` / Tailwind theme config (colors, font,
spacing, radius, shadow scale). Add `lucide-react`, `clsx`, `tailwind-merge` as dependencies.
**No visual change yet** — this just makes tokens available.

## Phase 2 — Primitives
Build `components/ui/`: Button, Input, Select, Textarea, Card, Badge (`06_Component_Library.md`,
items 1–6). Swap them into the **lowest-risk page first** — Settings form — as a proof of pattern
before touching higher-traffic pages.

## Phase 3 — Navigation shell
Replace `TenantNav` with `Sidebar` + `Topbar` (`06_Component_Library.md` items 8–9,
`05_Layout_System.md`). Verify `usePathname()` active-state logic and the logout `POST` form still
work identically. Apply across all tenant pages at once (they all import the same nav component).

## Phase 4 — Tables
Build `DataTable`, `EmptyState`, `Skeleton` (`11_Table_System.md`) and apply to Invoices,
Customers, Products, Categories, Admin — one page at a time, verifying each list's fetch/sort/
delete flow still works before moving to the next.

## Phase 5 — Forms
Apply `08_Form_Design_System.md` to Customer new/edit, Product new/edit, Settings. Verify every
existing field, validation message, and submit handler is unchanged — only markup/spacing/visual
state changed.

## Phase 6 — Modals & Toasts
Add `Modal`/`ConfirmDialog`/`Toast` (`12_Modal_Drawer_System.md`). Wire delete confirmations into
the tables from Phase 4, and success/error toasts into the forms from Phase 5.

## Phase 7 — Dashboard
Apply `09_Dashboard_Redesign.md`. Verify the parallel Supabase count queries are untouched; only
the stat card visuals, banner, and any added "recent invoices"/"quick actions" sections are new.

## Phase 8 — Invoice Builder
The highest-risk phase — apply `10_Invoice_Builder_v2.md`. Do this last, after the primitive
components (Phase 2) and table/form patterns (Phases 4–5) are proven elsewhere, since the builder
reuses all of them and touches the PDF-generation entry point. Test PDF output (both
`gst-classic` and `modern` templates) against pre-redesign output for the same input data to
confirm zero regression.

## Phase 9 — Reports
Apply chart upgrade (`07_Page_Design_Specifications.md` Reports section) once the summary data
shape from `/api/[slug]/reports` is confirmed. Lowest priority since it's the least-used page
relative to Invoices/Customers/Products.

## Phase 10 — Dark Mode
Apply `14_Dark_Mode.md` last — every component from Phases 2–9 needs to already exist before dark
variants can be layered on top consistently.

## Phase 11 — Animation & polish
Layer `13_Animation_System.md` transitions onto the now-stable component set. Motion is the last
thing added specifically so it never has to be reworked mid-build as components change shape.

## Phase 12 — Accessibility audit
Run through `16_Accessibility.md` checklist against the finished app: keyboard-only pass, screen
reader spot-check on forms/tables/modals, contrast check on the final token values, reduced-motion
verification.

## Non-negotiables at every phase
- `lib/pdf/*`, `lib/supabase/*`, `lib/tenant/*`, `app/api/**/route.js`, `supabase/migrations/*`
  are never edited.
- Every phase ends with the app in a fully working state — no phase should be "redesign half a
  page and leave it broken until the next session."
