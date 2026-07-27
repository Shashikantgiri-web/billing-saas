# 05 — Layout System

## App Shell (Authenticated Layout)

The authenticated shell uses a **fixed sidebar + scrollable main content** pattern.

```
┌─────────────────────────────────────────────┐
│  SIDEBAR (260px fixed, dark)                │
│  ┌───────────────────────────────────────┐  │
│  │ Logo / Business Name                  │  │
│  │ ─────────────────────────────────     │  │
│  │ Nav groups + icons                    │  │
│  │                                       │  │
│  │                                       │  │
│  │                                       │  │
│  │ [bottom] User profile + Logout        │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  MAIN AREA (remaining width)                │
│  ┌───────────────────────────────────────┐  │
│  │ TOP BAR (sticky, 60px)                │  │
│  │ Breadcrumb | Search | Actions         │  │
│  │ ─────────────────────────────────     │  │
│  │                                       │  │
│  │ PAGE CONTENT (scrollable)             │  │
│  │ px-6 sm:px-8 py-6                    │  │
│  │                                       │  │
│  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

---

## Responsive Behavior

### Desktop (≥1024px)
- Sidebar: fixed, always visible, 260px wide
- Main: `ml-[260px]`
- Content: max-w-7xl centered

### Tablet (768px – 1023px)
- Sidebar: collapsed to 64px (icons only), expands on hover or toggle
- Main: `ml-[64px]`
- Top bar has hamburger icon to expand sidebar

### Mobile (< 768px)
- Sidebar: hidden, slides in as overlay from left
- Hamburger in top bar opens the sidebar
- Content: full width, `px-4`

---

## Sidebar Anatomy

```jsx
// components/Sidebar.jsx
<aside className="
  fixed left-0 top-0 bottom-0 w-[260px] z-30
  bg-[--sidebar-bg] border-r border-[--sidebar-border]
  flex flex-col
">
  {/* Logo */}
  <SidebarLogo />

  {/* Navigation */}
  <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
    <NavGroup label="Main">
      <NavItem href="dashboard"  icon={LayoutDashboard} label="Dashboard" />
      <NavItem href="invoices"   icon={FileText}         label="Invoices" />
      <NavItem href="customers"  icon={Users}            label="Customers" />
      <NavItem href="products"   icon={Package}          label="Products" />
      <NavItem href="categories" icon={Tag}              label="Categories" />
    </NavGroup>

    <NavGroup label="Analytics">
      <NavItem href="reports" icon={BarChart2} label="Reports" />
    </NavGroup>

    <NavGroup label="Account">
      <NavItem href="settings" icon={Settings} label="Settings" />
    </NavGroup>
  </nav>

  {/* Bottom Profile Card */}
  <SidebarProfile businessName={businessName} />
</aside>
```

### NavItem Styles

```jsx
// Active state
"flex items-center gap-3 px-3 py-2.5 rounded-xl text-[--sidebar-text-active]
 bg-[--sidebar-item-active] font-medium text-sm"

// Inactive state
"flex items-center gap-3 px-3 py-2.5 rounded-xl text-[--sidebar-text]
 hover:bg-[--sidebar-item-hover] hover:text-white transition-colors text-sm"
```

### NavGroup Label

```jsx
<p className="px-3 mb-1 mt-4 text-[11px] font-semibold uppercase tracking-widest text-[--sidebar-text] opacity-50">
  {label}
</p>
```

### Sidebar Profile (bottom)

```jsx
<div className="p-4 border-t border-[--sidebar-border]">
  <div className="flex items-center gap-3">
    <div className="w-8 h-8 rounded-full bg-[--accent] flex items-center justify-center text-white text-sm font-semibold">
      {businessName?.[0]?.toUpperCase()}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-white text-sm font-medium truncate">{businessName}</p>
      <p className="text-[--sidebar-text] text-xs truncate">Business Account</p>
    </div>
    <LogoutButton />
  </div>
</div>
```

---

## Top Bar Anatomy

```jsx
// components/TopBar.jsx
<header className="
  sticky top-0 z-20 h-[60px]
  bg-[--bg-surface]/80 backdrop-blur-md
  border-b border-[--border-subtle]
  flex items-center px-6 gap-4
">
  {/* Mobile menu button */}
  <MobileMenuButton className="lg:hidden" />

  {/* Breadcrumb */}
  <Breadcrumb />

  {/* Spacer */}
  <div className="flex-1" />

  {/* Right actions */}
  <div className="flex items-center gap-2">
    <ThemeToggle />
    <QuickNewInvoiceButton />
  </div>
</header>
```

---

## Page Content Wrapper

Every page inside the authenticated area should use this wrapper:

```jsx
<div className="min-h-screen bg-[--bg-base]">
  <Sidebar slug={slug} businessName={businessName} />

  <div className="lg:ml-[260px] flex flex-col min-h-screen">
    <TopBar slug={slug} pageTitle="Invoices" />

    <main className="flex-1 px-6 sm:px-8 py-6 max-w-7xl mx-auto w-full">
      {/* page content */}
    </main>
  </div>
</div>
```

---

## Auth Layout

Login, Register, Forgot Password pages use a **centered card on gradient background**.

```jsx
<div className="min-h-screen bg-[--bg-base] flex items-center justify-center px-4 py-12">
  {/* Subtle gradient background */}
  <div className="absolute inset-0 bg-gradient-to-br from-[--accent-light] via-[--bg-base] to-[--bg-base] pointer-events-none" />

  <div className="relative w-full max-w-md">
    {/* Brand mark */}
    <div className="text-center mb-8">
      <div className="w-12 h-12 rounded-2xl bg-[--accent] mx-auto flex items-center justify-center mb-3">
        <FileText className="w-6 h-6 text-white" />
      </div>
      <h1 className="text-2xl font-bold text-[--text-primary]">BillingSaaS</h1>
    </div>

    {/* Card */}
    <div className="bg-[--bg-surface] rounded-[--radius-dialog] p-8 shadow-[--shadow-xl] border border-[--border-subtle]">
      {/* form content */}
    </div>
  </div>
</div>
```

---

## Grid Layouts

### Dashboard Stats Grid
```jsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
```

### Two-Column Form Layout (Settings)
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
```

### Full-Width Table
```jsx
<div className="w-full overflow-x-auto rounded-[--radius-card] border border-[--border-subtle] bg-[--bg-surface] shadow-[--shadow-card]">
```
