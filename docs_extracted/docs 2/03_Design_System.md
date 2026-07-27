# 03 — Design System

## Philosophy

Soft tactile modern design. Not flat. Not glassmorphism. Not old skeuomorphism.

Every surface has depth. Every element feels touchable. Every interaction has feedback.

---

## Color Palette

### CSS Variables (add to globals.css)

```css
@layer base {
  :root {
    /* Backgrounds */
    --bg-base: #F8F9FB;
    --bg-surface: #FFFFFF;
    --bg-elevated: #FFFFFF;
    --bg-sunken: #F0F2F7;

    /* Borders */
    --border-subtle: #E6EAF2;
    --border-default: #D4D9E6;
    --border-strong: #B8C0D4;

    /* Text */
    --text-primary: #1A1A1A;
    --text-secondary: #5A6479;
    --text-muted: #9198AD;
    --text-placeholder: #B0B8CC;
    --text-inverse: #FFFFFF;

    /* Accent - Indigo */
    --accent: #4F46E5;
    --accent-hover: #4338CA;
    --accent-light: #EEF2FF;
    --accent-border: #C7D2FE;

    /* Semantic */
    --success: #10B981;
    --success-light: #ECFDF5;
    --success-border: #A7F3D0;
    --warning: #F59E0B;
    --warning-light: #FFFBEB;
    --warning-border: #FDE68A;
    --danger: #EF4444;
    --danger-light: #FEF2F2;
    --danger-border: #FECACA;
    --info: #3B82F6;
    --info-light: #EFF6FF;
    --info-border: #BFDBFE;

    /* Sidebar */
    --sidebar-bg: #1C1F26;
    --sidebar-border: #2A2E3A;
    --sidebar-text: #A0A8BE;
    --sidebar-text-active: #FFFFFF;
    --sidebar-item-hover: #252932;
    --sidebar-item-active: #2F3441;

    /* Shadows */
    --shadow-xs: 0 1px 2px rgba(0,0,0,0.04);
    --shadow-sm: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
    --shadow-md: 0 4px 6px rgba(0,0,0,0.05), 0 2px 4px rgba(0,0,0,0.04);
    --shadow-lg: 0 10px 15px rgba(0,0,0,0.06), 0 4px 6px rgba(0,0,0,0.04);
    --shadow-xl: 0 20px 25px rgba(0,0,0,0.07), 0 10px 10px rgba(0,0,0,0.03);
    --shadow-card: 0 2px 8px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.03);
    --shadow-dialog: 0 24px 48px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.05);

    /* Radius */
    --radius-sm: 8px;
    --radius-md: 12px;
    --radius-lg: 16px;
    --radius-xl: 20px;
    --radius-2xl: 24px;
    --radius-input: 12px;
    --radius-button: 12px;
    --radius-card: 16px;
    --radius-dialog: 20px;

    /* Transitions */
    --transition-fast: 120ms ease;
    --transition-base: 180ms ease;
    --transition-slow: 250ms ease;
  }

  .dark {
    --bg-base: #0F1117;
    --bg-surface: #161B27;
    --bg-elevated: #1E2433;
    --bg-sunken: #0B0E14;

    --border-subtle: #1E2433;
    --border-default: #252C3F;
    --border-strong: #313A55;

    --text-primary: #F0F2F7;
    --text-secondary: #9198AD;
    --text-muted: #5A6479;
    --text-placeholder: #3D4560;
    --text-inverse: #1A1A1A;

    --accent: #6366F1;
    --accent-hover: #4F46E5;
    --accent-light: #1E2042;
    --accent-border: #3730A3;

    --success-light: #052E16;
    --success-border: #14532D;
    --warning-light: #1A1100;
    --warning-border: #713F12;
    --danger-light: #1A0608;
    --danger-border: #7F1D1D;

    --shadow-card: 0 2px 8px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.04);
    --shadow-dialog: 0 24px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06);
  }
}
```

---

## Typography

### Font Setup (layout.js)

```js
import { Inter } from 'next/font/google';
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
```

### Type Scale

| Token | Size | Weight | Line Height | Use |
|-------|------|--------|-------------|-----|
| `text-hero` | 48px | 700 | 1.1 | Landing headings |
| `text-page-title` | 32px | 700 | 1.2 | Page headers |
| `text-section-title` | 22px | 600 | 1.3 | Section headers |
| `text-card-title` | 17px | 600 | 1.4 | Card headers |
| `text-body-lg` | 16px | 400 | 1.6 | Main body |
| `text-body` | 15px | 400 | 1.6 | Secondary body |
| `text-sm` | 13px | 400 | 1.5 | Captions, meta |
| `text-xs` | 11px | 500 | 1.4 | Badges, labels |
| `text-btn` | 14px | 600 | 1 | Button labels |

### Tailwind v4 Custom Text Tokens (in globals.css)

```css
@theme {
  --font-family-sans: var(--font-inter), system-ui, sans-serif;
  --font-size-hero: 3rem;
  --font-size-page: 2rem;
  --font-size-section: 1.375rem;
  --font-size-card: 1.0625rem;
  --font-size-body-lg: 1rem;
  --font-size-body: 0.9375rem;
  --font-size-btn: 0.875rem;
}
```

---

## Spacing System

Base unit: **8px**

| Token | Value | Use |
|-------|-------|-----|
| `space-1` | 4px | Icon gaps, micro spacing |
| `space-2` | 8px | Tight component spacing |
| `space-3` | 12px | Input padding vertical |
| `space-4` | 16px | Card padding, gap |
| `space-5` | 20px | Section gaps |
| `space-6` | 24px | Card padding large |
| `space-8` | 32px | Section padding |
| `space-10` | 40px | Page section gaps |
| `space-12` | 48px | Large page sections |

---

## Elevation System

Four elevation levels for surfaces:

| Level | CSS Variable | Use |
|-------|-------------|-----|
| `0` | `--bg-base` | Page background |
| `1` | `--bg-surface` + `--shadow-card` | Cards, panels |
| `2` | `--bg-elevated` + `--shadow-lg` | Dropdowns, popovers |
| `3` | `--bg-elevated` + `--shadow-dialog` | Modals, dialogs |

---

## Border Radius Reference

| Component | Radius | Token |
|-----------|--------|-------|
| Input | 12px | `--radius-input` |
| Button | 12px | `--radius-button` |
| Card | 16px | `--radius-card` |
| Dialog | 20px | `--radius-dialog` |
| Badge | 999px | `rounded-full` |
| Avatar | 999px | `rounded-full` |
| Dropdown | 14px | `--radius-lg` - 2px |

---

## Shadow Reference

```css
.card        { box-shadow: var(--shadow-card); }
.dropdown    { box-shadow: var(--shadow-lg); }
.dialog      { box-shadow: var(--shadow-dialog); }
.btn-primary { box-shadow: 0 1px 2px rgba(79,70,229,0.3); }
```

---

## Icon System

Use **Lucide React** exclusively.

```
Default size:   16px (text-level icons, table actions)
Medium size:    18px (button icons)
Large size:     20px (nav icons)
Hero size:      24px (empty states)
```

Import pattern:
```jsx
import { FileText, Users, Package, BarChart2, Settings, LogOut, Plus } from 'lucide-react';
```

---

## Motion System

All transitions use CSS. No external animation libraries.

```css
/* Base transition for interactive elements */
.interactive {
  transition: all var(--transition-base);
}

/* Card hover */
.card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

/* Button press */
.btn:active {
  transform: scale(0.98);
}

/* Fade in for loaded content */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: translateY(0); }
}
.animate-in { animation: fadeIn 200ms ease forwards; }

/* Skeleton pulse */
@keyframes skeleton-pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.4; }
}
.skeleton { animation: skeleton-pulse 1.5s ease-in-out infinite; }
```

---

## Status Color Map

| Status | Background | Text | Border |
|--------|-----------|------|--------|
| `active` / `paid` | `--success-light` | `--success` | `--success-border` |
| `pending` | `--warning-light` | `--warning` | `--warning-border` |
| `void` / `error` | `--danger-light` | `--danger` | `--danger-border` |
| `draft` | `--bg-sunken` | `--text-secondary` | `--border-default` |
| `info` | `--info-light` | `--info` | `--info-border` |
