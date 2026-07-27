# 13 — Animation System

The app has zero motion today (no `framer-motion`, no CSS transitions beyond Tailwind's default
`hover:` color changes). This defines the full motion language for v2.

## Dependency
Add `framer-motion` as a visual-only dependency, or rely on plain CSS transitions via Tailwind
utility classes (`transition`, `duration-200`, `ease-out`) where the interaction is simple enough
(hover, focus) — reserve `framer-motion` for orchestrated things (modal enter/exit, drawer slide,
page transitions). Either choice is safe; do not use it for anything that touches data fetching or
state logic.

## Timing
- Micro-interactions (hover, button press): 100–150ms, ease-out.
- Component transitions (dropdown open, tooltip): 150–200ms.
- Modal/drawer enter-exit: 200–250ms, fade + scale (modal) or fade + slide (drawer).
- Page-level transitions: keep minimal (fade only, ~150ms) — Next.js App Router navigations
  shouldn't feel sluggish; motion should never add perceptible delay to route changes.

## Specific interactions
| Element | Animation |
|---|---|
| Button | press: scale 0.98; hover: background darken |
| Card (dashboard, clickable) | hover: translateY(-2px) + shadow increase |
| Table row | hover: background tint, 100ms |
| Sidebar collapse/expand | width transition, 200ms ease-in-out |
| Modal | backdrop fade + panel fade+scale(0.96→1) |
| Drawer | slide from right, 220ms |
| Toast | slide+fade in from bottom, auto-dismiss fade out |
| Dropdown/Select menu | fade+scale from anchor point, 150ms |
| Form field error | error message fades in, no layout shift |
| Skeleton loaders | subtle shimmer/pulse, looping |

## Accessibility
Respect `prefers-reduced-motion`: disable non-essential transforms (card lift, shimmer) and fall
back to instant or opacity-only transitions when the user's OS setting requests reduced motion.
See `16_Accessibility.md`.

## What not to animate
Data tables shouldn't animate on every re-fetch (avoid re-mounting/flashing rows on polling or
refetch after save). Numbers in stat cards may count up on first load only, not on every render.
