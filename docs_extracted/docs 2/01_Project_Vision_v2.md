# 01 — Project Vision: Billing SaaS v2

## Overview

Billing SaaS is a **multi-tenant invoice and billing management platform** built on:

- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS v4
- **Backend/Auth/DB:** Supabase (PostgreSQL + Auth + Storage)
- **PDF Engine:** jsPDF (custom templates: `gst-classic`, `modern`)
- **Architecture:** Multi-tenant via URL slug (`/[slug]/...`)

The application is **100% feature-complete**. Every API route, database query, PDF generation pipeline, authentication flow, and business logic works correctly.

---

## What Version 2 Is

Version 2 is a **complete visual and UX transformation** of the existing application.

It is NOT a rewrite. It is NOT a new application. It is a **premium redesign** that makes the same features feel like a world-class enterprise product.

```
Billing SaaS v1 (Current)          →      Billing SaaS v2 (Enterprise Edition)
─────────────────────────────────────────────────────────────────────────────
Plain white backgrounds             →      Layered surface system (#F8F9FB / #FFF)
Flat text nav (tab bar)             →      Premium sidebar with icons + profile card
Simple stat cards (3 numbers)       →      Rich dashboard with charts, timelines
Basic HTML tables                   →      Enterprise tables with hover, badges, actions
Unstyled <form> elements            →      Grouped, sectioned, icon-enhanced forms
"Loading..." plain text             →      Skeleton loaders per component
No animations                       →      Full motion system (hover, press, transitions)
No dark mode                        →      Complete dark theme
No empty states                     →      Illustrated empty states with CTAs
No error styling                    →      Friendly, designed error components
Mobile: scrollable nav              →      Collapsible sidebar, responsive layouts
```

---

## Pages in the Application

Every one of these must be redesigned:

| Route | Description |
|-------|-------------|
| `/login` | Email + password login |
| `/register` | New business registration |
| `/forgot-password` | Password reset |
| `/redirecting` | Post-login redirect spinner |
| `/[slug]/dashboard` | Main dashboard with stat cards |
| `/[slug]/invoices` | Invoice list table |
| `/[slug]/invoices/new` | Invoice builder form |
| `/[slug]/invoices/[id]` | Invoice detail + PDF preview |
| `/[slug]/customers` | Customer list table |
| `/[slug]/customers/new` | New customer form |
| `/[slug]/customers/[id]/edit` | Edit customer form |
| `/[slug]/products` | Products list table |
| `/[slug]/products/new` | New product form |
| `/[slug]/products/[id]/edit` | Edit product form |
| `/[slug]/categories` | Category management |
| `/[slug]/reports` | Revenue, timeline, top customers |
| `/[slug]/settings` | Business profile + logo + signature |
| `/admin` | Admin panel (business table) |
| `/error` | Error boundary page |
| `/not-found` | 404 page |

---

## The v2 Benchmark

The redesigned product should feel comparable to:

| Product | What to draw from |
|---------|------------------|
| **Stripe Dashboard** | Clean data tables, status badges, card layouts |
| **Linear** | Typography, sidebar, keyboard-first UX |
| **Vercel** | Minimal, professional, dark mode |
| **Notion** | Spacing, hierarchy, soft surfaces |
| **Resend Dashboard** | Modern SaaS forms and nav |
| **Clerk Dashboard** | Settings pages, profile management |

---

## The Golden Rule

> Never remove, simplify, rename, or break any feature, API route, validation, PDF generation, or business logic. Only improve how it looks, feels, and responds.

---

## Tech Constraints for v2

- Stay on **Next.js App Router** (no pages/ directory)
- Stay on **Tailwind CSS v4** (use `@theme` / CSS variables, not `tailwind.config.js`)
- Stay on **Supabase** client and server helpers
- Use **Lucide React** for icons (add to dependencies)
- Use **Inter** font via `next/font/google`
- Keep all existing API routes (`/api/[slug]/...`) untouched
- Keep all existing `lib/` utilities untouched
- Keep all PDF templates untouched (`lib/pdf/`)
- The `TenantNav` component will be replaced by the new Sidebar — update all page imports accordingly
