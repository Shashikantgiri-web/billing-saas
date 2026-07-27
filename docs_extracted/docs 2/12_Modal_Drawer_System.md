# 12 — Modal / Drawer System

New UI layer — the app currently has no modal/dialog component. All redesign uses below must call
existing API routes; the modal is purely a confirmation/presentation wrapper.

## Modal (centered dialog)
Used for: **delete confirmation** on invoices, customers, products, categories (each list already
has a delete action via its `[id]/route.js` DELETE handler — the modal sits in front of that call,
it doesn't change it).

Structure: dimmed/blurred backdrop, centered card (max-width 440px, 24px radius, elevated shadow),
title, short body copy naming the specific record ("Delete invoice INV-0004? This can't be
undone."), Cancel (ghost) + Delete (danger) buttons. Fade + scale-in animation (150–250ms), closes
on backdrop click, Escape key, or Cancel.

## Drawer (slide-in panel)
Used for: **quick view** of a customer or invoice without leaving the list page — optional
enhancement, only add if it doesn't duplicate the full edit/detail page. If the existing
`[id]/edit` and `[id]` routes are already the canonical detail views, skip building a competing
drawer and keep navigation link-based as it is today.

## Toast (non-blocking)
Used for: save/delete success or failure across Settings, Customer/Product forms, Invoice builder.
Bottom-right on desktop, bottom-center on mobile, auto-dismiss ~4s, manual dismiss available.
Success (green accent), error (red accent) — maps to each form's existing `success`/`error` state
variables (e.g. Settings' `success` boolean) rather than introducing a separate notification
system disconnected from that state.

## Interaction rules
- Never stack more than one modal.
- Focus moves into the modal/drawer on open and returns to the triggering element on close
  (keyboard accessibility — see `16_Accessibility.md`).
- Destructive actions (delete) always require the confirm modal; non-destructive actions (save,
  edit) never do.
