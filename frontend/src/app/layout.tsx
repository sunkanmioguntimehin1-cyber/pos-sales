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
              background: '#1E2535',
              color: '#E2E8F0',
              border: '1px solid rgba(255,255,255,0.1)',
            },
            success: {
              iconTheme: {
                primary: '#10B981',
                secondary: '#1E2535',
              },
            },
            error: {
              iconTheme: {
                primary: '#EF4444',
                secondary: '#1E2535',
              },
            },
          }}
        />
      </body>
    </html>
  );
}
