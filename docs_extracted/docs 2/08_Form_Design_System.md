# 08 — Form Design System

Applies to every form in the app: login, register, forgot-password, customer new/edit, product
new/edit, invoice builder line items, settings, category add.

## Field anatomy
`Label` (14px, medium weight, `#1A1A1A`) → `Input` (44px height, 14px radius, 1px `#E6EAF2`
border) → optional `Hint` (13px, `#666`, below input) → `Error` (13px, danger color, replaces hint
when present, reserve the line height so the form doesn't jump).

## Layout
- Single-column on mobile, two-column grid (8px system: 24–32px gutters) on desktop for forms with
  many short fields (Settings: name/email/phone side by side; Customer: name/phone/email).
- Long-text fields (business description, invoice notes/terms) always full width.
- Group related fields under a section heading with a thin divider — e.g. Settings splits into
  "Business Profile" / "Invoice Defaults" / "Branding" as identified in
  `07_Page_Design_Specifications.md`.

## Validation
- Inline, on blur — not only on submit. Every form currently in the codebase (`settings/page.jsx`,
  customer/product forms) uses a single top-level `error` string state; preserve that as the
  source of truth for server-side/API errors, and layer client-side inline hints on top without
  replacing it.
- Success state: existing `success` boolean in Settings shows a message — restyle as a subtle
  inline banner or toast (see `12_Modal_Drawer_System.md`), not an alert().

## Specific forms

**Login / Register / Forgot Password** — email, password (+ confirm on register). Add
show/hide password toggle (visual only — no change to Supabase auth calls). Submit button shows
loading state during the async call already present in these components.

**Customer form** — name, phone, email, billing address fields. Two-column on desktop.

**Product form** — name, description, price, category (searchable select), tax/unit if present.
Currency-formatted price input.

**Invoice builder** — see `10_Invoice_Builder_v2.md` for the line-item table, which is a
form-within-a-form pattern distinct from standard field layouts above.

**Settings — Branding** — logo/signature upload: replace plain file input with a dropzone showing
current image preview (from `logo_url`/`signature_url`) and an "uploading…" progress state that
maps to the existing `uploading` state variable.

## Buttons in forms
Primary submit button right-aligned (or full-width on mobile) at the bottom of the form; secondary
"Cancel" ghost button beside it linking back to the list page. Never disable submit permanently —
only during the in-flight `saving`/`uploading` state that already exists in each form's logic.
