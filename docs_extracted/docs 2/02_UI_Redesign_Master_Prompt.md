# 02 — UI Redesign Master Prompt

## Instructions for Claude Code

This document is the **master instruction set** for the Billing SaaS v2 redesign. Read this first before touching any file.

---

## Project Context

You are redesigning a **Next.js 16 + Tailwind CSS v4 + Supabase** multi-tenant billing application.

The application is feature-complete. Every invoice, customer, product, category, report, setting, PDF generation, and authentication flow works correctly.

**Your job is to redesign only the frontend UI.**

---

## What You MUST NOT Change

```
❌ DO NOT touch any file inside /app/api/
❌ DO NOT touch any file inside /lib/
❌ DO NOT touch /lib/supabase/
❌ DO NOT touch /lib/pdf/
❌ DO NOT touch /lib/tenant/
❌ DO NOT touch /lib/slug.js
❌ DO NOT remove any form fields
❌ DO NOT remove any state variables
❌ DO NOT remove any useEffect or data-fetch logic
❌ DO NOT change any API endpoint URLs
❌ DO NOT rename any Supabase table columns
❌ DO NOT change next.config, jsconfig, or package.json (except adding lucide-react)
❌ DO NOT convert Server Components to Client Components or vice versa unless necessary for animation
❌ DO NOT break PDF generation
❌ DO NOT remove any route
```

---

## What You MUST Do

```
✅ Add lucide-react to dependencies
✅ Add Inter font via next/font/google in layout.js
✅ Redesign globals.css with the full design token system
✅ Create a new /components/ directory for shared UI
✅ Replace TenantNav with a new Sidebar component
✅ Redesign every page listed in 01_Project_Vision_v2.md
✅ Redesign every form, table, card, button, and modal
✅ Add skeleton loaders for every loading state
✅ Add illustrated empty states for every list page
✅ Add smooth animations to every interaction
✅ Build a complete dark mode
✅ Make every page fully responsive
✅ Follow the design system in 03_Design_System.md exactly
```

---

## Implementation Order

Follow this exact order. Do not skip phases.

```
Phase 1: Foundation
  └── globals.css (design tokens, CSS variables)
  └── layout.js (Inter font, base HTML)
  └── /components/ui/ (Button, Input, Card, Badge, Spinner, Skeleton)

Phase 2: Navigation
  └── /components/Sidebar.jsx (replaces TenantNav)
  └── /components/TopBar.jsx

Phase 3: Auth Pages
  └── /app/(auth)/login/page.jsx
  └── /app/(auth)/register/page.jsx
  └── /app/(auth)/forgot-password/page.jsx

Phase 4: Dashboard
  └── /app/[slug]/dashboard/page.jsx

Phase 5: Invoice Builder (most complex)
  └── /app/[slug]/invoices/new/page.jsx

Phase 6: Invoice List + Detail
  └── /app/[slug]/invoices/page.jsx
  └── /app/[slug]/invoices/[id]/page.jsx

Phase 7: Customers
  └── /app/[slug]/customers/page.jsx
  └── /app/[slug]/customers/new/page.jsx
  └── /app/[slug]/customers/[id]/edit/page.jsx

Phase 8: Products + Categories
  └── /app/[slug]/products/page.jsx
  └── /app/[slug]/products/new/page.jsx
  └── /app/[slug]/products/[id]/edit/page.jsx
  └── /app/[slug]/categories/page.jsx

Phase 9: Reports
  └── /app/[slug]/reports/page.jsx

Phase 10: Settings
  └── /app/[slug]/settings/page.jsx

Phase 11: Error + Not Found + Admin
  └── /app/error.jsx
  └── /app/not-found.jsx
  └── /app/global-error.jsx
  └── /app/admin/page.jsx

Phase 12: Dark Mode + Polish
  └── Apply dark: variants across all components
  └── Test all breakpoints
  └── Optimize animations
```

---

## Absolute Rules

1. Every JSX file you edit must continue to compile and run without errors.
2. Every form must continue to submit to the same API endpoints.
3. Every data fetch must stay intact.
4. All Tailwind classes must be valid Tailwind v4 utility classes.
5. The `slug` param from `useParams()` or `params` must remain in every page.
6. PDF generation button on `/[slug]/invoices/[id]/page.jsx` must keep working.
7. Supabase file uploads in settings must remain functional.
8. Never use `<form action>` method POST — keep existing patterns for logout.
9. Add `'use client'` directive only to components that use hooks or browser APIs.
10. When adding animations, use CSS transitions or Tailwind transition classes, not heavy animation libraries.
