import "./globals.css";

export const metadata = {
  title: "Billing SaaS",
  description: "Invoicing platform for small businesses",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
