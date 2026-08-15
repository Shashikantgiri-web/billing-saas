import { Inter } from 'next/font/google';
import "./globals.css";

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

const siteUrl = "https://billing-saas-pearl.vercel.app";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "BillingSaaS — Invoicing & Billing Platform",
    template: "%s — BillingSaaS",
  },
  description:
    "Professional invoicing and billing for small businesses. Create GST-compliant invoices, manage customers and products, and track revenue — all in one place.",
  keywords: [
    "invoicing software",
    "billing software",
    "GST invoice generator",
    "small business billing",
    "invoice management",
  ],
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32", type: "image/x-icon" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180" }],
  },
  openGraph: {
    title: "BillingSaaS — Invoicing & Billing Platform",
    description:
      "Professional invoicing and billing for small businesses. Create GST-compliant invoices, manage customers and products, and track revenue.",
    url: siteUrl,
    siteName: "BillingSaaS",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "BillingSaaS" }],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BillingSaaS — Invoicing & Billing Platform",
    description: "Professional invoicing and billing for small businesses.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport = {
  themeColor: "#4F46E5",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`h-full antialiased ${inter.variable}`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){
              try {
                var t=localStorage.getItem('billing-theme')||'system';
                if(t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches)){
                  document.documentElement.classList.add('dark');
                }
              } catch (e) {}
            })();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-[var(--bg-base)] text-[var(--text-primary)]">
        {children}
      </body>
    </html>
  );
}
