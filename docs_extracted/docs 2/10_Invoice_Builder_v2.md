# 10 — Invoice Builder v2

Target files: `app/[slug]/invoices/new/page.jsx`, `app/[slug]/invoices/[id]/page.jsx`.
**Do not touch:** `lib/pdf/generate-invoice.js`, `lib/pdf/number-to-words.js`,
`lib/pdf/templates/gst-classic.js`, `lib/pdf/templates/modern.js`. These generate the actual PDF
and must keep producing byte-identical output for the same input data — the redesign only changes
the on-screen editor, never the PDF renderer.

## Confirmed current structure
- Line items: `product_name`, `quantity`(`qty`), `price`, `tax_percent`, computed `lineTotal =
  price * qty * (1 + tax_percent/100)`. A product picker (`<option value="">Custom item</option>`
  plus real products) can prefill `price`/`tax_percent` from the selected product.
- Totals computed client-side via `useMemo`: `subtotal`, `tax`, `discount`, `grandTotal`.
- Two PDF templates exist: `gst-classic` and `modern` — the invoice must have a template selector
  somewhere (settings or per-invoice) that this redesign should surface clearly, without changing
  which template function gets called.
- Validation: at least one line item with a non-empty `product_name` is required before submit.

## Redesign layout
Two-column split on desktop (stacks on mobile):

**Left column — the editable form**
1. **Customer panel** — customer picker (searchable select pulling from `/api/[slug]/customers`),
   with an inline "+ New customer" affordance if the current form allows creating one without
   leaving the page (confirm this before adding — don't invent a modal-create flow if the field
   only supports selecting an existing customer id).
2. **Invoice details** — invoice number/prefix (from settings), date, due date if present.
3. **Line items table** — redesign as the `06_Component_Library.md` `DataTable`-style editable
   grid: product/custom-item select, qty stepper, price (currency input), tax % input, computed
   line total (read-only, right-aligned). "Add line" action styled as a dashed-border row or
   ghost button. Row delete as an icon button. Keep the exact `updateLine(key, {...})` update
   pattern — only the visual row changes.
4. **Discount** — existing field, styled as a compact row above totals.
5. **Totals block** — Subtotal / Tax / Discount / Grand Total, right-aligned, grand total visually
   emphasized (larger, bold, accent-adjacent).
6. **Actions** — "Save Draft" (secondary) / "Generate Invoice" or equivalent primary action,
   matching whatever the current submit handler actually does (confirm draft-vs-final semantics
   exist in the API before labeling two separate actions).

**Right column — live preview**
A lightweight visual preview of the invoice as it will look on the PDF (not the PDF itself,
which is generated on submit) — reflects customer, line items, and totals live as the form
changes. This is new UI, purely additive, and must not replace or duplicate the actual PDF
generation call.

## Validation states
Inline error under the line-items table for "Add at least one line item" (existing message) —
restyle, don't reword the underlying check. Field-level errors for required customer/date if the
API enforces them.

## PDF Preview (post-generation)
Once an invoice is generated, `app/[slug]/invoices/[id]/page.jsx` presumably offers a way to view
the PDF. Wrap that in the `PDF Preview Toolbar` component (zoom, download, print) from
`06_Component_Library.md` — it's a frame around the existing blob, not a new renderer.
