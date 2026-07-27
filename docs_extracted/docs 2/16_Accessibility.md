# 16 — Accessibility

## Baseline target
WCAG 2.1 AA across every redesigned page.

## Color contrast
Every text/background pair in `03_Design_System.md`'s palette must hit 4.5:1 for body text and
3:1 for large text (18px+ or 14px+ bold). Verify the accent `#4F46E5` on white background and the
status badge colors (success/warning/danger/info) at both their text and background usages —
several of the original ChatGPT palette values run close to the AA line and should be checked with
a contrast tool before shipping, not assumed compliant.

## Keyboard navigation
- Every interactive element (buttons, table row actions, sidebar links, dropdown items, modal
  controls) reachable and operable via Tab/Shift+Tab/Enter/Space.
- Modal/Drawer: focus traps inside while open, Escape closes, focus returns to the trigger on
  close.
- Skip-to-content link at the top of every tenant page (before `Sidebar`/`TenantNav`).

## Forms
- Every `Input`/`Select`/`Textarea` has a programmatically associated `<label>` (not just
  placeholder text) — this is a real gap risk since the current inline forms mix
  `className="block text-sm font-medium"` labels with plain `<input>`s; confirm `htmlFor`/`id`
  pairing is preserved when componentizing.
- Error messages linked via `aria-describedby`, and the field marked `aria-invalid` when in error
  state.
- Required fields marked with `aria-required` in addition to the visual asterisk.

## Tables
- `<table>` semantics preserved in the new `DataTable` (real `<thead>`/`<tbody>`/`<th scope="col">`
  — don't replace with `<div>` grids that lose table semantics for screen readers).
- Sort controls on column headers are real buttons with `aria-sort` state.
- Row-action icon buttons have `aria-label`s (e.g. "Delete invoice INV-0004"), not bare icons.

## Motion
Respect `prefers-reduced-motion: reduce` — disable card-lift, shimmer, and slide/scale transitions
in favor of instant or opacity-only changes, per `13_Animation_System.md`.

## Focus states
Visible focus ring (accent color, 2px offset) on every interactive element — never
`outline: none` without an explicit replacement ring, including on custom-styled buttons and the
searchable selects/dropdowns.

## Status/Toast announcements
Toasts and inline success/error banners use `aria-live="polite"` (assertive only for destructive
action failures) so screen reader users get save/delete confirmations without hunting for them.
