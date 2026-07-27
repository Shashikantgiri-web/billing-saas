# 14 — Dark Mode

## Current state
`app/globals.css` only has a `prefers-color-scheme: dark` media query swapping two CSS variables
(`--background`, `--foreground`). No component in the app currently reads a `dark:` Tailwind
variant, and there is no manual toggle.

## Target: real class-based dark mode
Move from OS-only `prefers-color-scheme` to Tailwind v4's `dark:` variant driven by a `class` on
`<html>`, toggled by the user (stored client-side — e.g. `localStorage`, this is a display
preference, not app data, so it does not touch Supabase). Still respect the OS preference as the
default on first load.

## Palette (not inverted — purpose-built)
| Token | Light | Dark |
|---|---|---|
| Background | `#F8F9FB` | `#0F1115` |
| Surface (cards) | `#FFFFFF` | `#1A1D24` |
| Border | `#E6EAF2` | `#2A2E38` |
| Primary text | `#1A1A1A` | `#F2F3F5` |
| Secondary text | `#666` | `#9A9FAD` |
| Accent | `#4F46E5` | `#6366F1` (slightly lighter for contrast on dark) |
| Success/Warning/Danger/Info | same hues, ~10% lighter for AA contrast on dark surfaces |

## Component-level notes
- Shadows soften/disappear on dark surfaces — use a subtle lighter-border or inner-glow instead of
  a drop shadow to convey elevation (drop shadows read poorly on dark backgrounds).
- Charts (Reports, Dashboard) need a dark-specific grid-line and tooltip theme, not just inverted
  colors.
- PDF preview stays **light** even in dark mode — it's a document preview mirroring the actual
  printed invoice, not app UI.
- Badges keep the same semantic hues, adjusted for contrast against dark surfaces.

## Toggle placement
Topbar, next to the profile/workspace area — sun/moon icon button cycling light → dark → system.

## Scope
This is 100% visual. `lib/pdf/*` invoice generation output is unaffected — dark mode never changes
what customers receive as an invoice PDF.
