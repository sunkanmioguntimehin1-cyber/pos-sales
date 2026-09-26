import type { Metadata } from "next";
import { Toaster } from 'react-hot-toast';
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "RetailCore POS",
  description: "Professional Point of Sale & Inventory Management System",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark h-full">
      <body className="h-full antialiased">
        <Providers>{children}</Providers>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'var(--surface-2)',
              color: 'var(--text)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              boxShadow: 'var(--shadow-lg)',
              fontSize: '13px',
            },
            success: {
              iconTheme: {
                primary: 'var(--success)',
                secondary: 'var(--surface-2)',
              },
            },
            error: {
              iconTheme: {
                primary: 'var(--danger)',
                secondary: 'var(--surface-2)',
              },
            },
          }}
        />
      </body>
    </html>
  );
}
