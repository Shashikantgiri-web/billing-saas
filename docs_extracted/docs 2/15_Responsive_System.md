# 15 — Responsive System

## Breakpoints (Tailwind v4 defaults, used consistently)
| Name | Width | Notes |
|---|---|---|
| `sm` | 640px | already used in `dashboard/page.jsx` (`sm:grid-cols-3`) |
| `md` | 768px | table → card collapse threshold |
| `lg` | 1024px | sidebar becomes persistent (vs. drawer) |
| `xl` | 1280px | max content width for dense pages (invoice builder two-column) |
| `2xl` | 1536px | large-desktop breathing room, not a new layout |

## Navigation
- **< 1024px**: `Sidebar` collapses to a hidden drawer, toggled by a hamburger in the Topbar
  (mirrors the current `TenantNav`'s `overflow-x-auto` horizontal-scroll tab bar, which this
  replaces).
- **≥ 1024px**: Sidebar persistent, collapsible to icon-only width on user toggle.

## Tables (Invoices, Customers, Products, Categories, Admin)
- **≥ 768px**: full `DataTable` as specified in `11_Table_System.md`.
- **< 768px**: each row becomes a stacked card — primary field as the card title, remaining
  columns as label/value pairs, actions as a menu/kebab button. This applies to all four
  client-fetched tenant tables plus the admin table.

## Invoice Builder
- **≥ 1024px**: two-column (form + live preview) per `10_Invoice_Builder_v2.md`.
- **< 1024px**: single column, preview moves below the form (or behind a "Preview" tab/toggle) so
  the editable form is always reachable without horizontal scrolling.
- Line-item table becomes a stacked per-item card on narrow screens (same pattern as list tables).

## Forms (Customer, Product, Settings)
- **≥ 768px**: two-column field grid per `08_Form_Design_System.md`.
- **< 768px**: single column, full-width fields and buttons.

## Dashboard
Stat cards: 3-across (≥640px, matches current `sm:grid-cols-3`), 1-across below that. Recent
Invoices + Quick Actions stack vertically below 1024px.

## Touch targets
All interactive elements (buttons, row actions, nav items) maintain a minimum 40×40px hit area on
touch viewports, even where the visual element is smaller (icon buttons get invisible padding).
