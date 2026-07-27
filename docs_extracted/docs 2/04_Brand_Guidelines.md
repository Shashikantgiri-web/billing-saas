# 04 — Brand Guidelines

## Product Personality

Billing SaaS v2 should feel like a **calm, professional, reliable partner** for business owners — not a complex enterprise monster, and not a toy startup tool.

**Keywords:** Trustworthy. Clean. Fast. Professional. Premium.

---

## Logo Treatment

The sidebar logo area (top of sidebar) should display:

```jsx
<div className="flex items-center gap-3 px-5 py-5 border-b border-[--sidebar-border]">
  {/* Icon mark */}
  <div className="w-8 h-8 rounded-lg bg-[--accent] flex items-center justify-center flex-shrink-0">
    <FileText className="w-4 h-4 text-white" />
  </div>
  {/* Wordmark */}
  <div>
    <p className="text-white text-sm font-semibold leading-none">BillingSaaS</p>
    <p className="text-[--sidebar-text] text-xs mt-0.5">Enterprise Edition</p>
  </div>
</div>
```

If the user's business has a logo set in settings, use that in the sidebar instead of the default icon.

---

## Voice & Tone

**In empty states:**
- Friendly. Encouraging. Actionable.
- Example: "No invoices yet. Create your first invoice to get started."
- NOT: "No records found."

**In error messages:**
- Clear. Explain what happened. Tell them what to do.
- Example: "We couldn't save your changes. Check your connection and try again."
- NOT: "Error 500."

**In success messages:**
- Brief. Confirming. Warm.
- Example: "Invoice created successfully."
- NOT: "Operation completed."

**In confirmations:**
- Specific. Non-destructive by default.
- Example: "Delete this customer? All their invoices will remain, but they'll be unlinked."
- NOT: "Are you sure?"

---

## Loading Copy

Replace all "Loading..." text with skeleton loaders (see Component Library). If text is needed, use:
- "Fetching your invoices..."
- "Loading dashboard..."
- "Getting your data..."

Never use a bare spinner without context.

---

## Number Formatting

Amounts should always show the currency symbol from settings. Default: ₹ (INR).

```js
// Format currency based on business settings
function formatCurrency(amount, currency = 'INR') {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}
```

Display invoice totals in the table as: **₹1,23,456.00** (Indian numbering system for INR).

---

## Date Formatting

Use human-readable dates everywhere:

```js
// Short: "Jul 27, 2026"
new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

// Long: "Sunday, 27 July 2026"
new Date(date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
```

---

## Illustration Style for Empty States

Use simple SVG illustrations inline. They should be:
- Single color or two-tone (accent + muted)
- Abstract / geometric, not character-based
- Small (120–160px wide max)
- Consistent across all empty states

Each empty state has three elements:
1. Small SVG illustration
2. Headline (18px semibold)
3. Supporting text (15px muted)
4. CTA button (primary or ghost)

---

## Status Badge Language

| Database value | Display label | Style |
|---------------|--------------|-------|
| `active` | Active | Success |
| `inactive` | Inactive | Muted |
| `pending` | Pending | Warning |
| `void` | Voided | Danger |
| `draft` | Draft | Muted |
| `paid` | Paid | Success |

---

## Premium Feel Checklist

Before marking any page as done, verify:

- [ ] No plain "Loading..." text anywhere
- [ ] No blank white boxes for empty states
- [ ] No default browser confirm() dialogs — use inline confirmation UI
- [ ] Every interactive element has a hover state
- [ ] Every input has a focus ring using `--accent`
- [ ] Every list row has a hover background
- [ ] Every primary action button has the correct accent color
- [ ] Cards have `--shadow-card` and `border-[--border-subtle]`
- [ ] All text uses the token colors, not arbitrary Tailwind grays
