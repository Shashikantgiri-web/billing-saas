# Billing SaaS v2

## Overview

Billing SaaS v2 is a **feature-complete, multi-tenant invoice and billing management platform** designed for a premium user experience. Built with modern web technologies, it offers a robust solution for businesses to manage their invoicing, customers, products, and reports efficiently. This version represents a significant **visual and user experience transformation** of the existing application, elevating its aesthetic and usability to enterprise-grade standards without altering its core functionality.

## Key Features

- **Multi-tenant Architecture:** Securely manage multiple businesses with isolated data via URL slugs (`/[slug]/...`).

- **Comprehensive Invoice Management:** Create, view, and manage invoices with custom PDF generation using `gst-classic` and `modern` templates.

- **Customer Relationship Management:** Add, edit, and track customer details.

- **Product and Service Catalog:** Maintain a detailed list of products and services.

- **Category Management:** Organize products and services into categories for better management.

- **Dynamic Reporting:** Access revenue, timeline, and top customer reports for insightful business analytics.

- **User Settings:** Manage business profiles, logos, and signatures.

- **Admin Panel:** Oversee business operations from a centralized administration interface.

- **Enhanced User Interface:** A complete visual redesign inspired by leading SaaS platforms, featuring a layered surface system, premium sidebar with icons, rich dashboards with charts, enterprise-grade tables, and icon-enhanced forms.

- **Modern UX Elements:** Includes skeleton loaders, full motion system (hover, press, transitions), complete dark mode, illustrated empty states with CTAs, and friendly error components.

- **Responsive Design:** Optimized for various screen sizes, with a collapsible sidebar and responsive layouts for mobile users.

## Technology Stack

- **Framework:** Next.js 16 (App Router)

- **Styling:** Tailwind CSS v4

- **Backend, Authentication & Database:** Supabase (PostgreSQL, Auth, Storage)

- **PDF Generation:** jsPDF (with custom templates)

- **Icons:** Lucide React

- **Font:** Inter (via `next/font/google`)

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

Ensure you have Node.js (version 18 or higher) and npm/yarn/pnpm/bun installed.

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Shashikantgiri-web/billing-saas.git
   cd billing-saas
   ```

1. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   # or
   bun install
   ```

1. Set up your Supabase environment variables. Create a `.env.local` file in the root directory and add your Supabase project URL and `anon` key:

   ```
   NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
   ```

1. Run the development server:

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Vision: The Golden Rule

> Never remove, simplify, rename, or break any feature, API route, validation, PDF generation, or business logic. Only improve how it looks, feels, and responds.

## Technical Constraints for v2

- Utilize **Next.js App Router** exclusively.

- Maintain **Tailwind CSS v4** for styling, leveraging `@theme` / CSS variables.

- Continue using **Supabase** client and server helpers.

- Integrate **Lucide React** for all icons.

- Implement **Inter** font via `next/font/google`.

- Preserve all existing API routes (`/api/[slug]/...`) and `lib/` utilities.

- Keep PDF templates (`lib/pdf/`) untouched.

- The `TenantNav` component is replaced by the new Sidebar; update all page imports accordingly.

## Deployment

The easiest way to deploy this Next.js application is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

For more details, refer to the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying).
