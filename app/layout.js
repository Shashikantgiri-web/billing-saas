// FONT_SWAP
import "./globals.css";

const inter = { variable: '' };

export const metadata = {
  title: "Billing SaaS",
  description: "Invoicing platform for small businesses",
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
